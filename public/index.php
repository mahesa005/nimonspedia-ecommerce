<?php

require_once __DIR__ . '/../src/core/autoload.php';

\App\Core\Session::start();

$router = new \App\Core\Router();

require_once __DIR__ . '/../src/routes.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$router->dispatch($uri, $method);