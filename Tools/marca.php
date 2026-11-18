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
                $dir = MANUALS_DIR . '/' . $brand['slug'] . '/' . $modelSlug;
                if (!is_dir($dir)) mkdir($dir, 0755, true);
                $success = 'Pasta do modelo criada.';
            } catch (PDOException $e) {
                $error = $e->getCode() === '23000' ? 'Esse modelo já existe nesta marca.' : 'Não foi possível criar o modelo.';
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

render_head($brand['name'] . ' · Modelos');
render_header($user, 'inicio');
?>
<main class="page-wrap">
  <section class="page-hero">
    <div>
      <p class="eyebrow"><a href="inicio.php">Marcas</a> / <?=h($brand['name'])?></p>
      <h1><?=h($brand['name'])?></h1>
      <p class="page-lead">Pastas de modelos com manuais em PDF.</p>
    </div>
  </section>

  <?php if ($success): ?><div class="success"><?=h($success)?></div><?php endif; ?>
  <?php if ($error): ?><div class="error"><?=h($error)?></div><?php endif; ?>

  <?php if (is_admin_user($user)): ?>
  <form class="admin-inline-form" method="post">
    <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
    <input type="hidden" name="action" value="create_model">
    <input type="text" name="name" placeholder="Novo modelo (ex. Golf VIII)" required>
    <button type="submit">Criar pasta</button>
  </form>
  <?php endif; ?>

  <?php if (!$models): ?>
    <div class="empty-state">Ainda não há modelos nesta marca.<?php if (is_admin_user($user)): ?> Cria a primeira pasta acima.<?php endif; ?></div>
  <?php else: ?>
  <div class="folder-grid">
    <?php foreach ($models as $model): ?>
      <article class="folder-card">
        <a class="folder-main" href="modelo.php?marca=<?=h(urlencode($brand['slug']))?>&modelo=<?=h(urlencode($model['slug']))?>">
          <span class="folder-icon" aria-hidden="true"></span>
          <span>
            <strong><?=h($model['name'])?></strong>
            <em><?= (int)$model['pdf_count'] ?> PDF<?= (int)$model['pdf_count'] === 1 ? '' : 's' ?></em>
          </span>
        </a>
        <?php if (is_admin_user($user)): ?>
        <form method="post" class="folder-delete" onsubmit="return confirm('Eliminar o modelo e todos os PDFs?');">
          <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
          <input type="hidden" name="action" value="delete_model">
          <input type="hidden" name="model_id" value="<?=(int)$model['id']?>">
          <button type="submit" class="small danger">Eliminar</button>
        </form>
        <?php endif; ?>
      </article>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</main>
<?php render_foot(); ?>
