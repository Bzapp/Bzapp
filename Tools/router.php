<?php
// Bloqueia acesso direto a /data/ no servidor embutido do PHP.
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
if (preg_match('#^/data(/|$)#i', $uri)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Acesso negado.';
    return true;
}
$file = __DIR__ . $uri;
if ($uri !== '/' && is_file($file)) {
    return false;
}
if ($uri === '/' || $uri === '') {
    require __DIR__ . '/index.php';
    return true;
}
http_response_code(404);
echo 'Não encontrado.';
return true;
