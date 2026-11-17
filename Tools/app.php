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
<link rel="stylesheet" href="style.css">
</head>
<body class="app-page">
<header class="topbar">
  <div><strong>BPower Car-Service</strong></div>
  <div class="top-actions">
    <span><?=h($user['username'])?></span>
    <?php if ($user['role'] === 'admin'): ?><a href="admin.php">Administração</a><?php endif; ?>
    <a href="logout.php">Sair</a>
  </div>
</header>
<div class="site-area">
  <iframe src="conversores.html" title="Conversores"></iframe>
</div>
</body>
</html>
