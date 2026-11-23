<?php
require __DIR__ . '/config.php';

$user = require_login();
$id = (int)($_GET['id'] ?? 0);
$forceDownload = is_admin_user($user) && (($_GET['download'] ?? '') === '1');

$stmt = db()->prepare(
    'SELECT x.*, m.slug AS model_slug, b.slug AS brand_slug
     FROM manuals x
     JOIN models m ON m.id = x.model_id
     JOIN brands b ON b.id = m.brand_id
     WHERE x.id = ?
     LIMIT 1'
);
$stmt->execute([$id]);
$manual = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$manual) {
    http_response_code(404);
    exit('PDF não encontrado.');
}

$path = MANUALS_DIR . '/' . $manual['brand_slug'] . '/' . $manual['model_slug'] . '/' . $manual['stored_name'];
if (!is_file($path)) {
    http_response_code(404);
    exit('Ficheiro em falta.');
}

$filename = preg_replace('/[^A-Za-z0-9._-]+/', '_', $manual['original_name']) ?: 'manual.pdf';
header('Content-Type: application/pdf');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-store');
if ($forceDownload) {
    header('Content-Disposition: attachment; filename="' . $filename . '"');
} else {
    // Inline view for everyone; non-admins do not get a download link in the UI.
    header('Content-Disposition: inline; filename="' . $filename . '"');
}
header('Content-Length: ' . (string)filesize($path));
readfile($path);
exit;
