<?php
use App\Controllers\AuthController;
use App\Controllers\TestController;
use App\Controllers\StoreController;
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


$router->add('GET', '/register',
    [AuthController::class, 'showRegisterPage'],
    [GuestMiddleware::class]
);

$router->add('POST', '/register',
    [AuthController::class, 'handleRegister'],
    [GuestMiddleware::class]
);

$router->add('GET', '/store/{id}',
    [StoreController::class, 'showDetail'],
    []
);

// --- TEST ROUTE ---
$router->add('GET', '/',
    [TestController::class, 'showTestPage'],
    [AuthMiddleware::class]
);
