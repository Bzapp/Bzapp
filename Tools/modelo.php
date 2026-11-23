<?php
require __DIR__ . '/config.php';
require __DIR__ . '/layout.php';

$user = require_login();
$brandSlug = trim((string)($_GET['marca'] ?? ''));
$modelSlug = trim((string)($_GET['modelo'] ?? ''));
$model = model_by_slugs($brandSlug, $modelSlug);
if (!$model) {
    http_response_code(404);
    exit('Modelo não encontrado.');
}

$success = '';
$error = '';
$viewId = (int)($_GET['ver'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && is_admin_user($user)) {
    try {
        verify_csrf();
        $action = $_POST['action'] ?? '';

        if ($action === 'upload_pdf') {
            $title = trim((string)($_POST['title'] ?? ''));
            $file = $_FILES['pdf'] ?? null;
            $uploadErr = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
            if (!$file || $uploadErr !== UPLOAD_ERR_OK) {
                $error = match ($uploadErr) {
                    UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'O PDF é demasiado grande para o limite do PHP no hosting (sobe upload_max_filesize / post_max_size no cPanel).',
                    UPLOAD_ERR_PARTIAL => 'O envio do PDF ficou incompleto. Tenta outra vez.',
                    UPLOAD_ERR_NO_FILE => 'Escolhe um ficheiro PDF.',
                    UPLOAD_ERR_NO_TMP_DIR => 'O servidor não tem pasta temporária para uploads.',
                    UPLOAD_ERR_CANT_WRITE => 'O PHP não conseguiu escrever o ficheiro temporário.',
                    default => 'Escolhe um ficheiro PDF válido (erro de upload #' . $uploadErr . ').',
                };
            } else {
                $orig = (string)($file['name'] ?? 'manual.pdf');
                $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
                $mime = '';
                if (class_exists('finfo')) {
                    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']) ?: '';
                } elseif (function_exists('mime_content_type')) {
                    $mime = mime_content_type($file['tmp_name']) ?: '';
                }
                $okMime = $mime === '' || in_array($mime, ['application/pdf', 'application/x-pdf', 'application/octet-stream'], true);
                if ($ext !== 'pdf' || !$okMime) {
                    $error = 'Só são aceites ficheiros PDF.';
                } elseif (($file['size'] ?? 0) > 40 * 1024 * 1024) {
                    $error = 'O PDF não pode ultrapassar 40 MB.';
                } else {
                    if ($title === '') $title = pathinfo($orig, PATHINFO_FILENAME);
                    $stored = bin2hex(random_bytes(16)) . '.pdf';
                    $dir = manuals_dir_for($model);
                    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $stored)) {
                        $error = 'Falha ao guardar o PDF. Confirma que Tools/data/manuais é gravável (755/775).';
                    } else {
                        $stmt = db()->prepare('INSERT INTO manuals (model_id, title, stored_name, original_name, uploaded_by) VALUES (?, ?, ?, ?, ?)');
                        $stmt->execute([(int)$model['id'], $title, $stored, $orig, (int)$user['id']]);
                        $success = 'PDF adicionado.';
                    }
                }
            }
        }

        if ($action === 'delete_pdf') {
            $id = (int)($_POST['manual_id'] ?? 0);
            $stmt = db()->prepare('SELECT * FROM manuals WHERE id = ? AND model_id = ?');
            $stmt->execute([$id, (int)$model['id']]);
            $manual = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($manual) {
                $path = manuals_dir_for($model) . '/' . $manual['stored_name'];
                if (is_file($path)) @unlink($path);
                db()->prepare('DELETE FROM manuals WHERE id = ?')->execute([$id]);
                $success = 'PDF eliminado.';
                if ($viewId === $id) $viewId = 0;
            }
        }
    } catch (Throwable $e) {
        $error = 'Erro ao processar o PDF: ' . $e->getMessage();
    }
}

$manuals = db()->prepare('SELECT * FROM manuals WHERE model_id = ? ORDER BY title COLLATE NOCASE');
$manuals->execute([(int)$model['id']]);
$manuals = $manuals->fetchAll(PDO::FETCH_ASSOC);

$viewManual = null;
if ($viewId > 0) {
    foreach ($manuals as $m) {
        if ((int)$m['id'] === $viewId) {
            $viewManual = $m;
            break;
        }
    }
}
if (!$viewManual && $manuals) {
    $viewManual = $manuals[0];
    $viewId = (int)$viewManual['id'];
}

render_head($model['name'] . ' · ' . $model['brand_name']);
render_header($user, 'inicio');
?>
<main class="page-wrap modelo-page">
  <section class="page-hero">
    <div>
      <p class="eyebrow">
        <a href="inicio.php">Marcas</a> /
        <a href="marca.php?slug=<?=h(urlencode($model['brand_slug']))?>"><?=h($model['brand_name'])?></a> /
        <?=h($model['name'])?>
      </p>
      <h1><?=h($model['name'])?></h1>
      <p class="page-lead">Manuais em PDF<?= is_admin_user($user) ? ' — podes carregar e organizar aqui.' : ' — abre na página sem descarregar.' ?></p>
    </div>
  </section>

  <?php if ($success): ?><div class="success"><?=h($success)?></div><?php endif; ?>
  <?php if ($error): ?><div class="error"><?=h($error)?></div><?php endif; ?>

  <?php if (is_admin_user($user)): ?>
  <form class="admin-inline-form upload-form" method="post" enctype="multipart/form-data">
    <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
    <input type="hidden" name="action" value="upload_pdf">
    <input type="text" name="title" placeholder="Título do manual (opcional)">
    <input type="file" name="pdf" accept="application/pdf,.pdf" required>
    <button type="submit">Carregar PDF</button>
  </form>
  <?php endif; ?>

  <div class="manuals-layout">
    <aside class="manuals-list">
      <h2>PDFs</h2>
      <?php if (!$manuals): ?>
        <p class="empty-state">Ainda não há manuais nesta pasta.</p>
      <?php else: ?>
        <ul>
          <?php foreach ($manuals as $m): ?>
          <li class="<?= (int)$m['id'] === $viewId ? 'is-active' : '' ?>">
            <a href="modelo.php?marca=<?=h(urlencode($model['brand_slug']))?>&modelo=<?=h(urlencode($model['slug']))?>&ver=<?=(int)$m['id']?>">
              <?=h($m['title'])?>
            </a>
            <?php if (is_admin_user($user)): ?>
            <form method="post" class="inline" onsubmit="return confirm('Eliminar este PDF?');">
              <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
              <input type="hidden" name="action" value="delete_pdf">
              <input type="hidden" name="manual_id" value="<?=(int)$m['id']?>">
              <button type="submit" class="icon-btn icon-btn--danger" title="Eliminar">
                <span class="sr-only">Eliminar</span>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M8 6V4h8v2"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/>
                  <path d="M14 11v6"/>
                </svg>
              </button>
            </form>
            <?php endif; ?>
          </li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    </aside>

    <section class="manuals-viewer">
      <?php if ($viewManual): ?>
        <div class="viewer-toolbar">
          <strong><?=h($viewManual['title'])?></strong>
          <?php if (is_admin_user($user)): ?>
          <a class="viewer-download" href="pdf.php?id=<?=(int)$viewManual['id']?>&download=1">Descarregar</a>
          <?php endif; ?>
        </div>
        <iframe
          class="pdf-frame"
          title="<?=h($viewManual['title'])?>"
          src="pdf.php?id=<?=(int)$viewManual['id']?>#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
        ></iframe>
      <?php else: ?>
        <div class="empty-state viewer-empty">Seleciona ou carrega um PDF para visualizar aqui.</div>
      <?php endif; ?>
    </section>
  </div>
</main>
<?php render_foot(); ?>
