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

if ($bootError === '' && $_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'reset_db') {
    try {
        verify_csrf();
        // Apaga só utilizadores (mantém marcas/modelos/PDFs). Evita lock do ficheiro SQLite no Windows.
        db()->exec('DELETE FROM users');
        header('Location: setup.php?reset=1');
        exit;
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

if ($bootError === '') {
    try {
        $count = (int)db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
    } catch (Throwable $e) {
        $bootError = $e->getMessage();
    }
}

if ($bootError === '') {
    if (isset($_GET['reset'])) {
        $message = 'Base de utilizadores reiniciada. Cria agora o administrador.';
        $count = 0;
    }

    if ($count > 0 && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET' && !isset($_GET['reset'])) {
        $message = 'A instalação já foi concluída. Entra no login. Se esqueceste a palavra-passe, usa “Recriar instalação” em baixo.';
    } elseif ($count === 0 && $_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') !== 'reset_db') {
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
                $message = 'Administrador criado. Entra em index.php. Em produção, apaga setup.php.';
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
  Checklist:<br>
  1) Duplo-clique em <code>start.bat</code> (não abras o .php no Explorer)<br>
  2) Pasta <code>Tools\data</code> tem de ser gravável<br>
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
<form method="post" style="margin-top:1rem" onsubmit="return confirm('Apagar utilizadores e recriar instalação? Os PDFs mantêm-se.');">
<input type="hidden" name="csrf" value="<?=setup_h(csrf_token())?>">
<input type="hidden" name="action" value="reset_db">
<button type="submit" style="background:#444">Recriar instalação</button>
</form>
<?php endif; ?>

<?php endif; ?>
</div>
</body>
</html>
