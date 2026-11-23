<?php
/**
 * Serve ícones de marca via PHP (evita cache/FTP/case issues em alguns hostings).
 */
require __DIR__ . '/config.php';

require_login();

$raw = (string)($_GET['slug'] ?? '');
$slug = slugify($raw);
if ($slug === '' && $raw !== '') {
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $raw) ?? '');
    $slug = trim($slug, '-');
}
if ($slug === '') {
    http_response_code(400);
    exit('Slug em falta.');
}

$file = brand_icon_file($slug);
if ($file === null && $raw !== '') {
    $file = brand_icon_file($raw);
}

if ($file === null || !is_file($file)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Ícone não encontrado: ' . $slug);
}

header('Content-Type: image/png');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Length: ' . (string)filesize($file));
readfile($file);
exit;
