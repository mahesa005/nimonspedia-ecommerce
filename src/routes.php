<?php
use App\Controllers\AuthController;
use App\Controllers\TestController;
use App\Core\Middleware\AuthMiddleware;
use App\Core\Middleware\GuestMiddleware;

$router->add('GET', '/login',
    [AuthController::class, 'showLoginPage'],
    [GuestMiddleware::class]
);

$router->add('POST', '/login',
    [AuthController::class, 'handleLogin'],
    [GuestMiddleware::class]
);

$router->add('GET', '/logout',
    [AuthController::class, 'handleLogout'],
    [AuthMiddleware::class]
);

// --- TEST ROUTE ---
$router->add('GET', '/',
    [TestController::class, 'showTestPage'],
    [AuthMiddleware::class]
);
