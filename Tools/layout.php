<?php
declare(strict_types=1);

function render_head(string $title): void {
    ?>
<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?=h($title)?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Oswald:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=nofondo2">
<link rel="preload" href="logos/colorido-horizontal.png" as="image">
</head>
<body class="app-page">
    <?php
}

function render_header(array $user, string $active = 'inicio'): void {
    ?>
<header class="site-head">
  <div class="status">
    <div class="status-inner">
      <p><span class="status-label">Ferramentas de oficina</span></p>
      <p class="status-links">
        <span><?=h($user['username'])?><?= $user['role'] === 'admin' ? ' · Admin' : '' ?></span>
      </p>
    </div>
  </div>
  <div class="head-row">
    <a class="brand" href="inicio.php">
      <img src="logos/colorido-horizontal.png" alt="BPower Car-Service" width="946" height="225" decoding="async">
    </a>
    <nav class="rednav" aria-label="Aplicação">
      <a href="inicio.php"<?= $active === 'inicio' ? ' aria-current="page"' : '' ?>>Início</a>
      <a href="app.php"<?= $active === 'conversores' ? ' aria-current="page"' : '' ?>>Conversores</a>
      <?php if ($user['role'] === 'admin'): ?>
      <a href="admin.php"<?= $active === 'admin' ? ' aria-current="page"' : '' ?>>Administração</a>
      <?php endif; ?>
      <a class="nav-out" href="logout.php">Sair</a>
    </nav>
  </div>
</header>
    <?php
}

function render_foot(): void {
    ?>
</body>
</html>
    <?php
}
