<?php

require_once __DIR__ . '/../src/core/autoload.php';

\App\Core\Session::start();

$request = new \App\Core\Request();

$router = new \App\Core\Router();

require_once __DIR__ . '/../src/routes.php';

$path = $request->getPath();
$method = $request->getMethod();

$router->dispatch($path, $method, $request);