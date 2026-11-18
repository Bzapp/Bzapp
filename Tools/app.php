<?php
require __DIR__ . '/config.php';
require __DIR__ . '/layout.php';
$user = require_login();
render_head('Conversores');
render_header($user, 'conversores');
?>
<div class="site-area">
  <iframe src="conversores.html" title="Conversores"></iframe>
</div>
<?php render_foot(); ?>
