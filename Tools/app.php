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
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=Oswald:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body class="app-page">
<header class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="app.php" aria-label="BPower Car-Service">
      <span class="brand-mark"><img src="logo.png" alt="BPower Car-Service"></span>
    </a>
    <div class="top-actions">
      <span class="user-chip">
        <?=h($user['username'])?>
        <em><?= $user['role'] === 'admin' ? 'Admin' : 'Utilizador' ?></em>
      </span>
      <?php if ($user['role'] === 'admin'): ?><a href="admin.php">Administração</a><?php endif; ?>
      <a class="logout" href="logout.php">Sair</a>
    </div>
  </div>
</header>
<div class="site-area">
  <iframe src="conversores.html" title="Conversores"></iframe>
</div>
</body>
</html>
