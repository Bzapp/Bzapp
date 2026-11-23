<?php
declare(strict_types=1);

const DB_FILE = __DIR__ . '/data/app.sqlite';
const SESSION_NAME = 'bppower_session';

session_name(SESSION_NAME);
session_set_cookie_params([
    'httponly' => true,
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Lax',
]);
session_start();

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $dir = dirname(DB_FILE);
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Não foi possível criar a pasta data/. Verifica permissões em Tools/data.');
    }
    if (!is_writable($dir)) {
        throw new RuntimeException('A pasta Tools/data não tem permissão de escrita. No Windows, desbloqueia a pasta ou corre o PHP como utilizador normal (não só leitura).');
    }

    try {
        $pdo = new PDO('sqlite:' . DB_FILE);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('PRAGMA foreign_keys = ON');
    } catch (PDOException $e) {
        throw new RuntimeException(
            'Não foi possível abrir a base SQLite (data/app.sqlite). '
            . 'Confirma que o PHP tem a extensão pdo_sqlite ativa. Detalhe: ' . $e->getMessage(),
            (int)$e->getCode(),
            $e
        );
    }
    return $pdo;
}

const MANUALS_DIR = __DIR__ . '/data/manuais';
const BRAND_ICONS_DIR = __DIR__ . '/icones_marca';

function init_db(): void {
    $pdo = db();
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            image_name TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(brand_id, slug),
            FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
        )
    ");
    // Bases já criadas antes desta coluna
    $cols = $pdo->query('PRAGMA table_info(models)')->fetchAll(PDO::FETCH_ASSOC);
    $hasImage = false;
    foreach ($cols as $col) {
        if (($col['name'] ?? '') === 'image_name') {
            $hasImage = true;
            break;
        }
    }
    if (!$hasImage) {
        $pdo->exec('ALTER TABLE models ADD COLUMN image_name TEXT');
    }
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS manuals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            stored_name TEXT NOT NULL,
            original_name TEXT NOT NULL,
            uploaded_by INTEGER,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
    ");
    seed_brands();
    ensure_seed_brands();
    repair_brand_slugs();
}

function slugify(string $text): string {
    // Mapa ANTES do iconv: em alguns cPanel o //IGNORE apaga Š/ë e "Škoda" vira "koda".
    $map = [
        'Á'=>'A','À'=>'A','Ã'=>'A','Â'=>'A','Ä'=>'A','Å'=>'A','É'=>'E','Ê'=>'E','Ë'=>'E','Í'=>'I','Ó'=>'O','Ô'=>'O','Õ'=>'O','Ö'=>'O','Ú'=>'U','Ü'=>'U','Ç'=>'C','Ñ'=>'N','Š'=>'S','Ž'=>'Z','Č'=>'C','Ć'=>'C','Đ'=>'D','Ř'=>'R',
        'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','ä'=>'a','å'=>'a','é'=>'e','ê'=>'e','ë'=>'e','í'=>'i','ó'=>'o','ô'=>'o','õ'=>'o','ö'=>'o','ú'=>'u','ü'=>'u','ç'=>'c','ñ'=>'n','š'=>'s','ž'=>'z','č'=>'c','ć'=>'c','đ'=>'d','ř'=>'r',
    ];
    $text = strtr($text, $map);
    if (function_exists('iconv')) {
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        if ($converted !== false) $text = $converted;
    }
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-') ?: 'item';
}

/** Aliases de ficheiros PNG quando o slug antigo no servidor ficou errado (ex. koda → skoda). */
function brand_icon_slug_candidates(string $slug): array {
    $slug = strtolower(trim($slug));
    $aliases = [
        'koda' => 'skoda',
        'skoda' => 'skoda',
        'citroen' => 'citroen',
        'citron' => 'citroen',
        'citroën' => 'citroen',
    ];
    $out = [];
    if ($slug !== '') $out[] = $slug;
    if (isset($aliases[$slug])) $out[] = $aliases[$slug];
    // Heurística: slug que perdeu o S inicial de Škoda
    if ($slug === 'koda' || substr($slug, -4) === 'koda') {
        $out[] = 'skoda';
    }
    return array_values(array_unique($out));
}

/** Corrige slugs gravados mal (Škoda→koda) para bater certo com icones_marca/*.png. */
function repair_brand_slugs(): void {
    $pdo = db();
    $rows = $pdo->query('SELECT id, name, slug FROM brands')->fetchAll(PDO::FETCH_ASSOC);
    $upd = $pdo->prepare('UPDATE brands SET slug = ? WHERE id = ?');
    $exists = $pdo->prepare('SELECT id FROM brands WHERE slug = ? AND id != ? LIMIT 1');
    foreach ($rows as $row) {
        $want = slugify((string)$row['name']);
        // Forçar marcas conhecidas com acentos
        $nameLower = function_exists('mb_strtolower')
            ? mb_strtolower((string)$row['name'], 'UTF-8')
            : strtolower((string)$row['name']);
        if (strpos($nameLower, 'koda') !== false || strpos($nameLower, 'škoda') !== false) {
            $want = 'skoda';
        }
        if (strpos($nameLower, 'citro') !== false) {
            $want = 'citroen';
        }
        if ($want === '' || $want === (string)$row['slug']) continue;
        $exists->execute([$want, (int)$row['id']]);
        if ($exists->fetchColumn()) continue;
        try {
            $upd->execute([$want, (int)$row['id']]);
        } catch (PDOException $e) {
            continue;
        }
    }
}

function seed_brands(): void {
    $pdo = db();
    $count = (int)$pdo->query('SELECT COUNT(*) FROM brands')->fetchColumn();
    if ($count > 0) return;

    $names = [
        'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra',
        'Dacia', 'Daewoo', 'Dodge', 'DS', 'Fiat', 'Ford', 'Ford USA', 'GMC', 'Honda', 'Hyundai',
        'Isuzu', 'Iveco', 'Jaguar', 'Jeep', 'Kia', 'Lada', 'Lancia', 'Land Rover', 'Lexus',
        'Mazda', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot',
        'Porsche', 'Renault', 'Seat', 'Škoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki',
        'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
    ];
    $stmt = $pdo->prepare('INSERT OR IGNORE INTO brands (name, slug, sort_order) VALUES (?, ?, ?)');
    foreach ($names as $i => $name) {
        $stmt->execute([$name, slugify($name), $i + 1]);
    }
}

function brand_icon_file(string $slug): ?string {
    $candidates = brand_icon_slug_candidates(slugify($slug));
    // Também tenta o slug cru (bases antigas) e aliases diretos
    foreach (brand_icon_slug_candidates($slug) as $c) {
        $candidates[] = $c;
    }
    $candidates = array_values(array_unique($candidates));
    foreach ($candidates as $c) {
        $file = BRAND_ICONS_DIR . '/' . $c . '.png';
        if (is_file($file)) return $file;
    }
    foreach (glob(BRAND_ICONS_DIR . '/*.png') ?: [] as $path) {
        $base = strtolower(basename($path, '.png'));
        foreach ($candidates as $c) {
            if ($base === strtolower($c)) return $path;
        }
    }
    return null;
}

function brand_icon_url(string $slug): ?string {
    $file = brand_icon_file($slug);
    if ($file === null) return null;
    $ver = (string)(@filemtime($file) ?: 0);
    // Usa o nome real do ficheiro (skoda) — não o slug antigo (koda)
    $fileSlug = strtolower(basename($file, '.png'));
    // Via PHP: contorna cache estática / FTP / case no hosting
    return 'icon.php?slug=' . rawurlencode($fileSlug) . '&v=' . rawurlencode($ver);
}

/** Inicial da marca sem partir UTF-8 (Škoda → S). */
function brand_initial(string $name): string {
    $slug = slugify($name);
    $ch = $slug !== '' ? $slug[0] : '?';
    return strtoupper($ch);
}

/** Ordenação A–Z ignorando acentos (Škoda com os S, Citroën com os C, etc.). */
function sort_brands_alpha(array $brands): array {
    usort($brands, static function (array $a, array $b): int {
        return strcmp(slugify((string)$a['name']), slugify((string)$b['name']));
    });
    return $brands;
}

/** Insere marcas novas do seed que ainda não existam (ex. Tesla após update). */
function ensure_seed_brands(): void {
    $pdo = db();
    $names = [
        'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra',
        'Dacia', 'Daewoo', 'Dodge', 'DS', 'Fiat', 'Ford', 'Ford USA', 'GMC', 'Honda', 'Hyundai',
        'Isuzu', 'Iveco', 'Jaguar', 'Jeep', 'Kia', 'Lada', 'Lancia', 'Land Rover', 'Lexus',
        'Mazda', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot',
        'Porsche', 'Renault', 'Seat', 'Škoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki',
        'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
    ];
    $check = $pdo->prepare('SELECT id FROM brands WHERE slug = ? OR name = ? LIMIT 1');
    $insert = $pdo->prepare('INSERT OR IGNORE INTO brands (name, slug, sort_order) VALUES (?, ?, ?)');
    $max = (int)$pdo->query('SELECT COALESCE(MAX(sort_order), 0) FROM brands')->fetchColumn();
    foreach ($names as $name) {
        $slug = slugify($name);
        $check->execute([$slug, $name]);
        if ($check->fetchColumn()) continue;
        $max++;
        try {
            $insert->execute([$name, $slug, $max]);
        } catch (PDOException $e) {
            // Base antiga com o mesmo nome/slug — ignora e continua o setup/login.
            continue;
        }
    }
}

function brand_by_slug(string $slug): ?array {
    $stmt = db()->prepare('SELECT * FROM brands WHERE slug = ? LIMIT 1');
    $stmt->execute([$slug]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function model_by_slugs(string $brandSlug, string $modelSlug): ?array {
    $stmt = db()->prepare(
        'SELECT m.*, b.name AS brand_name, b.slug AS brand_slug
         FROM models m
         JOIN brands b ON b.id = m.brand_id
         WHERE b.slug = ? AND m.slug = ?
         LIMIT 1'
    );
    $stmt->execute([$brandSlug, $modelSlug]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function manuals_dir_for(array $model): string {
    $brand = preg_replace('/[^a-z0-9_-]+/i', '', (string)($model['brand_slug'] ?? '')) ?: 'marca';
    $slug = preg_replace('/[^a-z0-9_-]+/i', '', (string)($model['slug'] ?? '')) ?: 'modelo';
    if (!is_dir(MANUALS_DIR) && !@mkdir(MANUALS_DIR, 0755, true) && !is_dir(MANUALS_DIR)) {
        throw new RuntimeException('Não foi possível criar Tools/data/manuais. No cPanel define permissões 755/775 em data/.');
    }
    $dir = MANUALS_DIR . '/' . $brand . '/' . $slug;
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Não foi possível criar a pasta do modelo em data/manuais. Verifica permissões de escrita.');
    }
    if (!is_writable($dir)) {
        throw new RuntimeException('A pasta data/manuais não é gravável. No cPanel: data/ e data/manuais → 755 ou 775.');
    }
    return $dir;
}

/**
 * PDFs já na pasta (ex. após 500 no INSERT ou modelo recriado) passam a aparecer na app.
 * Devolve quantos registos novos foram criados.
 */
function sync_manuals_from_disk(array $model): int {
    $modelId = (int)($model['id'] ?? 0);
    if ($modelId < 1 || empty($model['brand_slug']) || empty($model['slug'])) {
        return 0;
    }
    $dir = MANUALS_DIR . '/' . $model['brand_slug'] . '/' . $model['slug'];
    if (!is_dir($dir)) {
        return 0;
    }

    $pdo = db();
    $known = $pdo->prepare('SELECT 1 FROM manuals WHERE model_id = ? AND stored_name = ? LIMIT 1');
    $insert = $pdo->prepare(
        'INSERT INTO manuals (model_id, title, stored_name, original_name, uploaded_by) VALUES (?, ?, ?, ?, NULL)'
    );
    $added = 0;
    $n = 0;
    foreach (glob($dir . '/*.pdf') ?: [] as $path) {
        if (!is_file($path)) continue;
        $stored = basename($path);
        $known->execute([$modelId, $stored]);
        if ($known->fetchColumn()) continue;
        $n++;
        $title = 'Manual ' . $n;
        // Se o nome original não for o hash hex, usa-o como título
        if (!preg_match('/^[a-f0-9]{16,}\.pdf$/i', $stored)) {
            $title = pathinfo($stored, PATHINFO_FILENAME);
        }
        try {
            $insert->execute([$modelId, $title, $stored, $stored]);
            $added++;
        } catch (PDOException $e) {
            continue;
        }
    }
    return $added;
}

function model_image_path(array $model): ?string {
    $name = (string)($model['image_name'] ?? '');
    if ($name === '' || empty($model['brand_slug']) || empty($model['slug'])) {
        return null;
    }
    $path = MANUALS_DIR . '/' . $model['brand_slug'] . '/' . $model['slug'] . '/' . $name;
    return is_file($path) ? $path : null;
}

function model_image_url(array $model): ?string {
    if (empty($model['image_name'])) return null;
    return 'model-img.php?id=' . (int)$model['id'];
}

/** Guarda imagem de capa do modelo. Devolve nome guardado ou null + mensagem em $error. */
function save_model_image(array $model, array $file, ?string &$error = null): ?string {
    $error = null;
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $error = 'Escolhe uma imagem válida.';
        return null;
    }
    if (($file['size'] ?? 0) > 8 * 1024 * 1024) {
        $error = 'A imagem não pode ultrapassar 8 MB.';
        return null;
    }
    $orig = (string)($file['name'] ?? 'modelo.jpg');
    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    $allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($ext, $allowedExt, true)) {
        $error = 'Usa JPG, PNG, WEBP ou GIF.';
        return null;
    }
    $mime = '';
    if (class_exists('finfo')) {
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']) ?: '';
    } elseif (function_exists('mime_content_type')) {
        $mime = mime_content_type($file['tmp_name']) ?: '';
    }
    $okMime = $mime === '' || in_array($mime, [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/octet-stream',
    ], true);
    if (!$okMime) {
        $error = 'Ficheiro de imagem inválido.';
        return null;
    }
    if ($ext === 'jpeg') $ext = 'jpg';
    $stored = 'cover-' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dir = manuals_dir_for($model);
    // Remove capa anterior
    if (!empty($model['image_name'])) {
        $old = $dir . '/' . $model['image_name'];
        if (is_file($old)) @unlink($old);
    }
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $stored)) {
        $error = 'Falha ao guardar a imagem.';
        return null;
    }
    return $stored;
}

function is_admin_user(?array $user = null): bool {
    $user = $user ?? current_user();
    return $user && $user['role'] === 'admin';
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function verify_csrf(): void {
    $token = $_POST['csrf'] ?? '';
    if (!hash_equals($_SESSION['csrf'] ?? '', $token)) {
        http_response_code(419);
        exit('Pedido inválido.');
    }
}

function login_user(array $user): void {
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
}

function logout_user(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool)$params['secure'], (bool)$params['httponly']);
    }
    session_destroy();
}

function current_user(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    return [
        'id' => (int)$_SESSION['user_id'],
        'username' => (string)$_SESSION['username'],
        'role' => (string)$_SESSION['role'],
    ];
}

function require_login(): array {
    $user = current_user();
    if (!$user) {
        header('Location: index.php');
        exit;
    }
    return $user;
}

function require_admin(): array {
    $user = require_login();
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        exit('Acesso reservado ao administrador.');
    }
    return $user;
}

function h(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

try {
    init_db();
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><meta charset="utf-8"><title>Erro Tools</title>';
    echo '<p><strong>Erro ao iniciar a base de dados:</strong> ';
    echo htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
    echo '</p><p>No cPanel confirma: pasta <code>data/</code> gravável (755/775) e PHP com <code>pdo_sqlite</code>.</p>';
    exit;
}
