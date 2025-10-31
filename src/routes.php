<?php
use App\Controllers\AuthController;
use App\Controllers\CartController;
use App\Controllers\ProductController;
use App\Controllers\BuyerProfileController;
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

$router->add('GET', '/cart',
    [CartController::class, 'showPage'],
    [AuthMiddleware::class]
);

$router->add('POST', '/cart/add',
    [CartController::class, 'add'],
    [AuthMiddleware::class]
);

$router->add('POST', '/cart/update',
    [CartController::class, 'update'],
    [AuthMiddleware::class] 
);

$router->add('POST', '/cart/delete',
    [CartController::class, 'delete'],
    [AuthMiddleware::class]
);

$router->add('GET', '/', [ProductController::class, 'showHomePage']);

$router->add('GET', '/api/get-products', [ProductController::class, 'apiGetProducts']);

$router->add('POST', '/api/buyer/balance/topup', 
    [BuyerProfileController::class, 'handleTopUp'],
    [AuthMiddleware::class]
);

$router->add('GET', '/store/{id}', 
    [App\Controllers\StoreController::class, 'showStorePage']);

$router->add('GET', '/api/stores/{id}/products', 
    [App\Controllers\StoreController::class, 'apiGetStoreProducts']);