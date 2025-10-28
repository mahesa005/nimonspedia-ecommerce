<?php
use App\Controllers\AuthController;
use App\Controllers\TestController;
use App\Controllers\ProductManagementController;
use App\Core\Middleware\AuthMiddleware;
use App\Core\Middleware\GuestMiddleware;
use App\Core\Middleware\RoleMiddleware;

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

// --- TEST ROUTE ---
$router->add('GET', '/',
    [TestController::class, 'showTestPage'],
    [AuthMiddleware::class]
);

// Product Management Routes (Seller only)
$router->add('GET', '/seller/products', [ProductManagementController::class, 'index'], 
    [AuthMiddleware::class, RoleMiddleware::class]);

$router->add('POST', '/seller/products/delete', [ProductManagementController::class, 'delete'], 
    [AuthMiddleware::class, RoleMiddleware::class]);
