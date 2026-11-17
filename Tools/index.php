<?php
require __DIR__ . '/config.php';

if (current_user()) {
    header('Location: app.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    $stmt = db()->prepare('SELECT * FROM users WHERE username = ? AND active = 1 LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        login_user($user);
        header('Location: app.php');
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
<title>Login MAF</title>
<link rel="stylesheet" href="style.css">
</head>
<body class="login-page">
<div class="login-card">
    <div class="logo-wrap"><img src="logo.png" alt=" BPower Car-Service"></div>
    <h1>Login MAF</h1>
    <?php if ($error): ?><div class="error"><?=h($error)?></div><?php endif; ?>
    <form method="post">
        <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
        <input type="text" name="username" placeholder="Utilizador" autocomplete="username" required>
        <input type="password" name="password" placeholder="Palavra-passe" autocomplete="current-password" required>
        <button class="login-btn" type="submit">Entrar</button>
    </form>
    <div class="copyright">© <?=date('Y')?> BPower Car-Service</div>
</div>
</body>
</html>
