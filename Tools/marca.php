<?php
require __DIR__ . '/config.php';
require __DIR__ . '/layout.php';

$user = require_login();
$slug = trim((string)($_GET['slug'] ?? ''));
$brand = brand_by_slug($slug);
if (!$brand) {
    http_response_code(404);
    exit('Marca não encontrada.');
}

$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && is_admin_user($user)) {
    verify_csrf();
    $action = $_POST['action'] ?? '';
    if ($action === 'create_model') {
        $name = trim((string)($_POST['name'] ?? ''));
        if (strlen($name) < 1) {
            $error = 'Indica o nome do modelo.';
        } else {
            $modelSlug = slugify($name);
            try {
                $stmt = db()->prepare('INSERT INTO models (brand_id, name, slug) VALUES (?, ?, ?)');
                $stmt->execute([(int)$brand['id'], $name, $modelSlug]);
                $modelId = (int)db()->lastInsertId();
                $model = [
                    'id' => $modelId,
                    'slug' => $modelSlug,
                    'brand_slug' => $brand['slug'],
                    'image_name' => null,
                ];
                $dir = MANUALS_DIR . '/' . $brand['slug'] . '/' . $modelSlug;
                if (!is_dir($dir)) mkdir($dir, 0755, true);

                $imgErr = null;
                if (!empty($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                    $stored = save_model_image($model, $_FILES['image'], $imgErr);
                    if ($stored) {
                        db()->prepare('UPDATE models SET image_name = ? WHERE id = ?')->execute([$stored, $modelId]);
                        $success = 'Modelo criado com imagem.';
                    } else {
                        $success = 'Modelo criado.';
                        $error = $imgErr ?: 'Não foi possível guardar a imagem.';
                    }
                } else {
                    $success = 'Modelo criado. Podes adicionar a imagem depois.';
                }
            } catch (PDOException $e) {
                $error = $e->getCode() === '23000' ? 'Esse modelo já existe nesta marca.' : 'Não foi possível criar o modelo.';
            }
        }
    }
    if ($action === 'set_model_image') {
        $modelId = (int)($_POST['model_id'] ?? 0);
        $stmt = db()->prepare(
            'SELECT m.*, b.slug AS brand_slug FROM models m
             JOIN brands b ON b.id = m.brand_id
             WHERE m.id = ? AND m.brand_id = ?'
        );
        $stmt->execute([$modelId, (int)$brand['id']]);
        $model = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$model) {
            $error = 'Modelo não encontrado.';
        } else {
            $imgErr = null;
            $stored = save_model_image($model, $_FILES['image'] ?? [], $imgErr);
            if ($stored) {
                db()->prepare('UPDATE models SET image_name = ? WHERE id = ?')->execute([$stored, $modelId]);
                $success = 'Imagem do modelo atualizada.';
            } else {
                $error = $imgErr ?: 'Não foi possível guardar a imagem.';
            }
        }
    }
    if ($action === 'delete_model') {
        $modelId = (int)($_POST['model_id'] ?? 0);
        $stmt = db()->prepare('SELECT m.*, b.slug AS brand_slug FROM models m JOIN brands b ON b.id = m.brand_id WHERE m.id = ? AND m.brand_id = ?');
        $stmt->execute([$modelId, (int)$brand['id']]);
        $model = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($model) {
            $manuals = db()->prepare('SELECT stored_name FROM manuals WHERE model_id = ?');
            $manuals->execute([$modelId]);
            foreach ($manuals->fetchAll(PDO::FETCH_COLUMN) as $file) {
                $path = MANUALS_DIR . '/' . $model['brand_slug'] . '/' . $model['slug'] . '/' . $file;
                if (is_file($path)) @unlink($path);
            }
            if (!empty($model['image_name'])) {
                $img = MANUALS_DIR . '/' . $model['brand_slug'] . '/' . $model['slug'] . '/' . $model['image_name'];
                if (is_file($img)) @unlink($img);
            }
            db()->prepare('DELETE FROM manuals WHERE model_id = ?')->execute([$modelId]);
            db()->prepare('DELETE FROM models WHERE id = ?')->execute([$modelId]);
            $success = 'Modelo eliminado.';
        }
    }
}

$models = db()->prepare(
    'SELECT m.*, (SELECT COUNT(*) FROM manuals x WHERE x.model_id = m.id) AS pdf_count
     FROM models m WHERE m.brand_id = ? ORDER BY m.name COLLATE NOCASE'
);
$models->execute([(int)$brand['id']]);
$models = $models->fetchAll(PDO::FETCH_ASSOC);
foreach ($models as &$m) {
    $m['brand_slug'] = $brand['slug'];
    try {
        sync_manuals_from_disk($m);
    } catch (Throwable $e) {
        // ignora pasta inacessível
    }
}
unset($m);
// Contagens depois do sync
$models = db()->prepare(
    'SELECT m.*, (SELECT COUNT(*) FROM manuals x WHERE x.model_id = m.id) AS pdf_count
     FROM models m WHERE m.brand_id = ? ORDER BY m.name COLLATE NOCASE'
);
$models->execute([(int)$brand['id']]);
$models = $models->fetchAll(PDO::FETCH_ASSOC);
foreach ($models as &$m) {
    $m['brand_slug'] = $brand['slug'];
}
unset($m);

render_head($brand['name'] . ' · Modelos');
render_header($user, 'inicio');
?>
<main class="page-wrap">
  <section class="page-hero">
    <div>
      <p class="eyebrow"><a href="inicio.php">Marcas</a> / <?=h($brand['name'])?></p>
      <h1><?=h($brand['name'])?></h1>
      <p class="page-lead">Modelos com manuais em PDF<?= is_admin_user($user) ? ' — adiciona a foto de cada modelo.' : '.' ?></p>
    </div>
  </section>

  <?php if ($success): ?><div class="success"><?=h($success)?></div><?php endif; ?>
  <?php if ($error): ?><div class="error"><?=h($error)?></div><?php endif; ?>

  <?php if (is_admin_user($user)): ?>
  <form class="admin-inline-form upload-form" method="post" enctype="multipart/form-data">
    <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
    <input type="hidden" name="action" value="create_model">
    <input type="text" name="name" placeholder="Novo modelo (ex. Golf VIII)" required>
    <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif">
    <button type="submit">Criar modelo</button>
  </form>
  <?php endif; ?>

  <?php if (!$models): ?>
    <div class="empty-state">Ainda não há modelos nesta marca.<?php if (is_admin_user($user)): ?> Cria o primeiro acima.<?php endif; ?></div>
  <?php else: ?>
  <div class="folder-grid">
    <?php foreach ($models as $model):
      $imgUrl = model_image_url($model);
    ?>
      <article class="folder-card">
        <a class="folder-main" href="modelo.php?marca=<?=h(urlencode($brand['slug']))?>&modelo=<?=h(urlencode($model['slug']))?>">
          <?php if ($imgUrl): ?>
          <span class="folder-photo">
            <img src="<?=h($imgUrl)?>" alt="" width="320" height="180" loading="lazy">
          </span>
          <?php else: ?>
          <span class="folder-photo folder-photo--empty" aria-hidden="true">
            <span><?=h(strtoupper(substr($model['name'], 0, 1)))?></span>
          </span>
          <?php endif; ?>
          <span>
            <strong><?=h($model['name'])?></strong>
            <em><?= (int)$model['pdf_count'] ?> PDF<?= (int)$model['pdf_count'] === 1 ? '' : 's' ?></em>
          </span>
        </a>
        <?php if (is_admin_user($user)): ?>
        <div class="folder-actions">
          <form method="post" enctype="multipart/form-data" class="folder-image-form">
            <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
            <input type="hidden" name="action" value="set_model_image">
            <input type="hidden" name="model_id" value="<?=(int)$model['id']?>">
            <label class="icon-btn icon-btn--edit" title="<?= $imgUrl ? 'Trocar foto' : 'Adicionar foto' ?>">
              <span class="sr-only"><?= $imgUrl ? 'Trocar foto' : 'Adicionar foto' ?></span>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
              </svg>
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" required onchange="this.form.submit()">
            </label>
          </form>
          <form method="post" class="folder-delete" onsubmit="return confirm('Eliminar o modelo e todos os PDFs?');">
            <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
            <input type="hidden" name="action" value="delete_model">
            <input type="hidden" name="model_id" value="<?=(int)$model['id']?>">
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
        </div>
        <?php endif; ?>
      </article>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</main>
<?php render_foot(); ?>
