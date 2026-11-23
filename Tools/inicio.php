<?php
require __DIR__ . '/config.php';
require __DIR__ . '/layout.php';

$user = require_login();
$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && is_admin_user($user)) {
    verify_csrf();
    $action = $_POST['action'] ?? '';
    if ($action === 'create_brand') {
        $name = trim((string)($_POST['name'] ?? ''));
        if (strlen($name) < 2) {
            $error = 'O nome da marca deve ter pelo menos 2 caracteres.';
        } else {
            $slug = slugify($name);
            try {
                $max = (int)db()->query('SELECT COALESCE(MAX(sort_order), 0) FROM brands')->fetchColumn();
                $stmt = db()->prepare('INSERT INTO brands (name, slug, sort_order) VALUES (?, ?, ?)');
                $stmt->execute([$name, $slug, $max + 1]);
                $success = 'Marca criada.';
            } catch (PDOException $e) {
                $error = $e->getCode() === '23000' ? 'Essa marca já existe.' : 'Não foi possível criar a marca.';
            }
        }
    }
}

$brands = db()->query('SELECT b.*, (SELECT COUNT(*) FROM models m WHERE m.brand_id = b.id) AS model_count FROM brands b')->fetchAll(PDO::FETCH_ASSOC);
$brands = sort_brands_alpha($brands);

render_head('Início · Manuais');
render_header($user, 'inicio');
?>
<main class="page-wrap">
  <section class="page-hero">
    <div>
      <p class="eyebrow">Manuais técnicos</p>
      <h1>Marcas</h1>
      <p class="page-lead">Escolhe a marca para ver os modelos e abrir os manuais em PDF.</p>
    </div>
  </section>

  <?php if ($success): ?><div class="success"><?=h($success)?></div><?php endif; ?>
  <?php if ($error): ?><div class="error"><?=h($error)?></div><?php endif; ?>

  <?php if (is_admin_user($user)): ?>
  <form class="admin-inline-form" method="post">
    <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
    <input type="hidden" name="action" value="create_brand">
    <input type="text" name="name" placeholder="Nova marca (ex. BYD)" required>
    <button type="submit">Adicionar marca</button>
  </form>
  <?php endif; ?>

  <div class="brand-grid">
    <?php foreach ($brands as $brand):
      $icon = brand_icon_url($brand['slug']);
    ?>
      <a class="brand-card" href="marca.php?slug=<?=h(urlencode($brand['slug']))?>">
        <?php if ($icon): ?>
        <span class="brand-logo">
          <img src="<?=h($icon)?>" alt="<?=h($brand['name'])?>" width="48" height="48" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'brand-badge',textContent:'<?=h(brand_initial($brand['name']))?>'}))">
        </span>
        <?php else: ?>
        <span class="brand-badge" aria-hidden="true"><?=h(brand_initial($brand['name']))?></span>
        <?php endif; ?>
        <span class="brand-card-body">
          <strong><?=h($brand['name'])?></strong>
          <em><?= (int)$brand['model_count'] ?> modelo<?= (int)$brand['model_count'] === 1 ? '' : 's' ?></em>
        </span>
        <span class="brand-star" aria-hidden="true">★</span>
      </a>
    <?php endforeach; ?>
  </div>
</main>
<?php render_foot(); ?>
