<?php
/** Diagnóstico rápido no cPanel — apaga este ficheiro depois. */
header('Content-Type: text/plain; charset=utf-8');
echo "OK\n";
echo 'PHP ' . PHP_VERSION . "\n";
echo 'pdo_sqlite: ' . (extension_loaded('pdo_sqlite') ? 'sim' : 'NAO') . "\n";
echo 'data writable: ' . (is_dir(__DIR__ . '/data') && is_writable(__DIR__ . '/data') ? 'sim' : 'NAO') . "\n";
$man = __DIR__ . '/data/manuais';
echo 'manuais writable: ' . (is_dir($man) && is_writable($man) ? 'sim' : (is_dir($man) ? 'existe mas NAO gravavel' : 'pasta em falta')) . "\n";
echo 'config: ' . (is_file(__DIR__ . '/config.php') ? 'ok' : 'em falta') . "\n";
