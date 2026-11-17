<?php
require __DIR__ . '/config.php';
$admin = require_admin();

$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'create_user') {
        $username = trim((string)($_POST['username'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $role = ($_POST['role'] ?? 'user') === 'admin' ? 'admin' : 'user';

        if (strlen($username) < 3) {
            $error = 'O utilizador deve ter pelo menos 3 caracteres.';
        } elseif (strlen($password) < 6) {
            $error = 'A palavra-passe deve ter pelo menos 6 caracteres.';
        } else {
            try {
                $stmt = db()->prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
                $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT), $role]);
                $success = 'Utilizador criado com sucesso.';
            } catch (PDOException $e) {
                $error = $e->getCode() === '23000' ? 'Esse utilizador já existe.' : 'Não foi possível criar o utilizador.';
            }
        }
    }

    if ($action === 'toggle_user') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id === $admin['id']) {
            $error = 'Não podes desativar a tua própria conta.';
        } else {
            $stmt = db()->prepare('UPDATE users SET active = CASE active WHEN 1 THEN 0 ELSE 1 END WHERE id = ?');
            $stmt->execute([$id]);
            $success = 'Estado do utilizador atualizado.';
        }
    }

    if ($action === 'delete_user') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id === $admin['id']) {
            $error = 'Não podes eliminar a tua própria conta.';
        } else {
            $stmt = db()->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$id]);
            $success = 'Utilizador eliminado.';
        }
    }

    if ($action === 'reset_password') {
        $id = (int)($_POST['id'] ?? 0);
        $password = (string)($_POST['password'] ?? '');
        $exists = db()->prepare('SELECT id, username FROM users WHERE id = ? LIMIT 1');
        $exists->execute([$id]);
        $target = $exists->fetch(PDO::FETCH_ASSOC);

        if (!$target) {
            $error = 'Utilizador não encontrado.';
        } elseif (strlen($password) < 6) {
            $error = 'A nova palavra-passe deve ter pelo menos 6 caracteres.';
        } else {
            $stmt = db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
            $stmt->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
            $success = 'Palavra-passe de "' . $target['username'] . '" atualizada.';
        }
    }
}

$users = db()->query('SELECT id, username, role, active, created_at FROM users ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Administração</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Oswald:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body class="app-page">
<header class="site-head">
  <div class="status">
    <div class="status-inner">
      <p><span class="status-label">MAF</span> <span class="status-hours">Administração</span></p>
      <p class="status-links"><span><?=h($admin['username'])?> · Admin</span></p>
    </div>
  </div>
  <div class="head-row">
    <a class="brand" href="app.php">
      <img src="logos/colorido-horizontal.png" alt="BPower Car-Service" width="946" height="225">
    </a>
    <nav class="rednav" aria-label="Aplicação">
      <a href="app.php">Conversores</a>
      <a href="admin.php" aria-current="page">Administração</a>
      <a class="nav-out" href="logout.php">Sair</a>
    </nav>
  </div>
</header>

<main class="admin-wrap">
  <section class="admin-card">
    <div class="admin-title">Administração de utilizadores</div>
    <div class="admin-body">
      <?php if ($success): ?><div class="success"><?=h($success)?></div><?php endif; ?>
      <?php if ($error): ?><div class="error"><?=h($error)?></div><?php endif; ?>

      <h2>Criar utilizador</h2>
      <form class="create-form" method="post">
        <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
        <input type="hidden" name="action" value="create_user">
        <input type="text" name="username" placeholder="Nome de utilizador" required>
        <input type="password" name="password" placeholder="Palavra-passe (mín. 6 caracteres)" required>
        <select name="role">
          <option value="user">Utilizador</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit">Criar utilizador</button>
      </form>

      <h2>Utilizadores existentes</h2>
      <div class="table-wrap">
      <table>
        <thead><tr><th>Utilizador</th><th>Perfil</th><th>Estado</th><th>Criado em</th><th>Nova palavra-passe</th><th>Ações</th></tr></thead>
        <tbody>
        <?php foreach ($users as $u): ?>
          <tr>
            <td><?=h($u['username'])?><?php if ((int)$u['id'] === $admin['id']): ?> <span class="you-tag">tu</span><?php endif; ?></td>
            <td><?=h($u['role'])?></td>
            <td><?= $u['active'] ? 'Ativo' : 'Inativo' ?></td>
            <td><?=h($u['created_at'])?></td>
            <td>
              <form method="post" class="pass-form" onsubmit="return confirm('Alterar a palavra-passe de <?=h($u['username'])?>?');">
                <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
                <input type="hidden" name="action" value="reset_password">
                <input type="hidden" name="id" value="<?=$u['id']?>">
                <input type="password" name="password" placeholder="Nova passe (mín. 6)" minlength="6" required>
                <button type="submit" class="small">Alterar</button>
              </form>
            </td>
            <td class="actions-cell">
              <?php if ((int)$u['id'] !== $admin['id']): ?>
              <form method="post" class="inline">
                <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
                <input type="hidden" name="action" value="toggle_user">
                <input type="hidden" name="id" value="<?=$u['id']?>">
                <button type="submit" class="small"><?= $u['active'] ? 'Desativar' : 'Ativar' ?></button>
              </form>
              <form method="post" class="inline" onsubmit="return confirm('Eliminar este utilizador?');">
                <input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
                <input type="hidden" name="action" value="delete_user">
                <input type="hidden" name="id" value="<?=$u['id']?>">
                <button type="submit" class="small danger">Eliminar</button>
              </form>
              <?php else: ?>
              —
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
      </div>
    </div>
  </section>
</main>
</body>
</html>
