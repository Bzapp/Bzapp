<?php
require __DIR__ . '/config.php';
logout_user();
header('Location: index.php');
exit;
