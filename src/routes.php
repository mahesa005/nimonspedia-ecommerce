<?php
use App\Controllers\AuthController;
use App\Controllers\ProductController;
use App\Controllers\BuyerProfileController;
use App\Controllers\CartController;
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

$router->add('GET', '/', [ProductController::class, 'showHomePage']);

$router->add('GET', '/api/get-products', [ProductController::class, 'apiGetProducts']);

$router->add('POST', '/api/buyer/balance/topup', 
    [BuyerProfileController::class, 'handleTopUp'],
    [AuthMiddleware::class]
);

$router->add('GET', '/products/{id}', [ProductController::class, 'showProductDetailPage']);

$router->add('POST', '/api/cart/add', [CartController::class, 'handleAdd'], [AuthMiddleware::class]);