<?php
require __DIR__ . '/config.php';

if (current_user()) {
    header('Location: inicio.php');
    exit;
}

$error = '';
$users = db()->query('SELECT username FROM users WHERE active = 1 ORDER BY username COLLATE NOCASE')->fetchAll(PDO::FETCH_COLUMN);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    $stmt = db()->prepare('SELECT * FROM users WHERE username = ? AND active = 1 LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        login_user($user);
        header('Location: inicio.php');
        exit;
    }
    $error = 'Utilizador ou palavra-passe incorretos.';
}
?>
<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login MAF · BPower</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body class="login-page">
  <main class="login-shell">
    <div class="login-logo">
      <img src="logos/colorido-horizontal.png" alt="BPower Car-Service">
    </div>

    <?php if ($error): ?><div class="error login-error"><?=h($error)?></div><?php endif; ?>

    <form class="login-form" method="post" autocomplete="on">
      <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">

      <?php if ($users): ?>
      <label class="login-field">
        <span class="sr-only">Nome</span>
        <select name="username" required>
          <option value="" disabled <?= isset($_POST['username']) ? '' : 'selected' ?>>Nome</option>
          <?php foreach ($users as $name): ?>
          <option value="<?=h($name)?>" <?= (($_POST['username'] ?? '') === $name) ? 'selected' : '' ?>><?=h($name)?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <?php else: ?>
      <label class="login-field">
        <span class="sr-only">Nome</span>
        <input type="text" name="username" placeholder="Nome" autocomplete="username" required value="<?=h((string)($_POST['username'] ?? ''))?>">
      </label>
      <?php endif; ?>

      <label class="login-field">
        <span class="sr-only">Palavra-passe</span>
        <input type="password" name="password" placeholder="Palavra-passe" autocomplete="current-password" required>
      </label>

      <button class="login-btn" type="submit">ACESSAR</button>
    </form>
  </main>

  <footer class="login-footer"><?=date('Y')?> © BPower Car-Service</footer>
</body>
</html>
