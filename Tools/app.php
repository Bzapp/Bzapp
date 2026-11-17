<?php
require __DIR__ . '/config.php';
$user = require_login();
?>
<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MAF - Conversores</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Oswald:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body class="app-page">
<header class="site-head">
  <div class="status">
    <div class="status-inner">
      <p><span class="status-label">MAF</span> <span class="status-hours">Ferramentas de oficina</span></p>
      <p class="status-links">
        <span><?=h($user['username'])?><?= $user['role'] === 'admin' ? ' · Admin' : '' ?></span>
      </p>
    </div>
  </div>
  <div class="head-row">
    <a class="brand" href="app.php">
      <img src="logos/colorido-horizontal.png" alt="BPower Car-Service" width="946" height="225">
    </a>
    <nav class="rednav" aria-label="Aplicação">
      <a href="app.php" aria-current="page">Conversores</a>
      <?php if ($user['role'] === 'admin'): ?><a href="admin.php">Administração</a><?php endif; ?>
      <a class="nav-out" href="logout.php">Sair</a>
    </nav>
  </div>
</header>
<div class="site-area">
  <iframe src="conversores.html" title="Conversores"></iframe>
</div>
</body>
</html>
