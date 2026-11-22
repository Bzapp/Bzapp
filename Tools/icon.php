<?php
/**
 * Serve ícones de marca via PHP (evita cache/FTP/case issues em alguns hostings).
 */
require __DIR__ . '/config.php';

require_login();

$slug = slugify((string)($_GET['slug'] ?? ''));
if ($slug === '') {
    http_response_code(400);
    exit('Slug em falta.');
}

$file = BRAND_ICONS_DIR . '/' . $slug . '.png';
if (!is_file($file)) {
    foreach (glob(BRAND_ICONS_DIR . '/*.png') ?: [] as $path) {
        if (strtolower(basename($path, '.png')) === strtolower($slug)) {
            $file = $path;
            break;
        }
    }
}

if (!is_file($file)) {
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
