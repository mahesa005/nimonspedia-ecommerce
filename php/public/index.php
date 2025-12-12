<?php

require_once __DIR__ . '/../src/core/autoload.php';

\App\Core\Session::start();

$request = new \App\Core\Request();

$router = new \App\Core\Router();

require_once __DIR__ . '/../src/routes.php';

$path = $request->getPath();
$method = $request->getMethod();

try {
    $router->dispatch($path, $method, $request);
} catch (Exception $e) {
    if (strpos($path, '/api/') === 0) {
        header('Content-Type: application/json');
        header("Access-Control-Allow-Origin: *");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    } else {
        http_response_code(500);
        echo "Error: " . htmlspecialchars($e->getMessage());
    }
}