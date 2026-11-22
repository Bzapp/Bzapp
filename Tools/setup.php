<?php
declare(strict_types=1);

$error = '';
$message = '';
$count = 0;
$bootError = '';

try {
    require __DIR__ . '/config.php';
    $count = (int)db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
} catch (Throwable $e) {
    $bootError = $e->getMessage();
}

if ($bootError === '') {
    if ($count > 0) {
        $message = 'A instalação já foi concluída. Entra em index.php (login). Se esqueceste a palavra-passe, apaga o ficheiro data/app.sqlite e volta a abrir setup.php para criar um admin novo.';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            verify_csrf();
            $username = trim((string)($_POST['username'] ?? ''));
            $password = (string)($_POST['password'] ?? '');

            if (strlen($username) < 3) {
                $error = 'O utilizador deve ter pelo menos 3 caracteres.';
            } elseif (strlen($password) < 8) {
                $error = 'A palavra-passe deve ter pelo menos 8 caracteres.';
            } else {
                $stmt = db()->prepare('INSERT INTO users (username,password_hash,role) VALUES (?,?,?)');
                $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT), 'admin']);
                $count = 1;
                $message = 'Administrador criado. Apaga setup.php e entra em index.php.';
            }
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    }
}

function setup_h(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Configuração inicial</title>
<link rel="stylesheet" href="style.css">
</head>
<body class="login-page">
<div class="login-card">
<div class="logo-wrap"><img src="logo.png" alt="BP Power Car Service"></div>
<h1>Configuração inicial</h1>

<?php if ($bootError): ?>
<div class="error">
  <strong>Erro ao iniciar:</strong> <?=setup_h($bootError)?><br><br>
  Checklist rápido:<br>
  1) Corre com PHP (não abras o ficheiro só no Explorer)<br>
  &nbsp;&nbsp;<code>php -S localhost:8080 router.php</code><br>
  2) A pasta <code>Tools/data</code> tem de existir e ser gravável<br>
  3) PHP com extensão <code>pdo_sqlite</code>
</div>
<?php else: ?>

<?php if ($message): ?><div class="success"><?=setup_h($message)?></div><?php endif; ?>
<?php if ($error): ?><div class="error"><?=setup_h($error)?></div><?php endif; ?>

<?php if ($count === 0): ?>
<form method="post">
<input type="hidden" name="csrf" value="<?=setup_h(csrf_token())?>">
<input type="text" name="username" placeholder="Utilizador administrador" required>
<input type="password" name="password" placeholder="Palavra-passe (mín. 8 caracteres)" required>
<button class="login-btn" type="submit">Criar administrador</button>
</form>
<?php else: ?>
<p style="margin-top:1rem"><a class="login-btn" href="index.php" style="display:inline-block;text-align:center;text-decoration:none">Ir para o login</a></p>
<?php endif; ?>

<?php endif; ?>
</div>
</body>
</html>
