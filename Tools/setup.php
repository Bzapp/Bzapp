<?php
require __DIR__ . '/config.php';

$count = (int)db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
$message = '';
$error = '';

if ($count > 0) {
    $message = 'A instalação já foi concluída. Por segurança, apaga o ficheiro setup.php do servidor.';
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if (strlen($username) < 3) $error = 'O utilizador deve ter pelo menos 3 caracteres.';
    elseif (strlen($password) < 8) $error = 'A palavra-passe deve ter pelo menos 8 caracteres.';
    else {
        $stmt = db()->prepare('INSERT INTO users (username,password_hash,role) VALUES (?,?,?)');
        $stmt->execute([$username, password_hash($password,PASSWORD_DEFAULT), 'admin']);
        $message = 'Administrador criado. Apaga setup.php e entra pela página principal.';
    }
}
?>
<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Configuração inicial</title><link rel="stylesheet" href="style.css">
</head>
<body class="login-page">
<div class="login-card">
<div class="logo-wrap"><img src="logo.png" alt="BP Power Car Service"></div>
<h1>Configuração inicial</h1>
<?php if ($message): ?><div class="success"><?=h($message)?></div><?php endif; ?>
<?php if ($error): ?><div class="error"><?=h($error)?></div><?php endif; ?>
<?php if ($count === 0): ?>
<form method="post">
<input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
<input type="text" name="username" placeholder="Utilizador administrador" required>
<input type="password" name="password" placeholder="Palavra-passe (mín. 8 caracteres)" required>
<button class="login-btn" type="submit">Criar administrador</button>
</form>
<?php endif; ?>
</div>
</body></html>
