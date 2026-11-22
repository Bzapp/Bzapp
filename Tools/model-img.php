<?php
require __DIR__ . '/config.php';

require_login();
$id = (int)($_GET['id'] ?? 0);

$stmt = db()->prepare(
    'SELECT m.*, b.slug AS brand_slug
     FROM models m
     JOIN brands b ON b.id = m.brand_id
     WHERE m.id = ?
     LIMIT 1'
);
$stmt->execute([$id]);
$model = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$model) {
    http_response_code(404);
    exit('Imagem não encontrada.');
}

$path = model_image_path($model);
if (!$path) {
    http_response_code(404);
    exit('Imagem em falta.');
}

$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$types = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'gif' => 'image/gif',
];
header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, max-age=86400');
header('Content-Length: ' . (string)filesize($path));
readfile($path);
exit;
