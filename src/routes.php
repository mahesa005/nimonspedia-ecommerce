<?php
use App\Controllers\AuthController;
use App\Controllers\TestController;
use App\Controllers\ProductManagementController;
use App\Controllers\ProductController;
use App\Controllers\BuyerProfileController;
use App\Controllers\CartController;
use App\Controllers\CheckoutController;
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

$router->add('GET', '/', [ProductController::class, 'showHomePage']);

$router->add('GET', '/api/get-products', [ProductController::class, 'apiGetProducts']);

$router->add('POST', '/api/buyer/balance/topup', 
    [BuyerProfileController::class, 'handleTopUp'],
    [AuthMiddleware::class]
);

$router->add('GET', '/products/{id}', [ProductController::class, 'showProductDetailPage']);

$router->add('POST', '/api/cart/add', [CartController::class, 'handleAdd'], [AuthMiddleware::class]);
// Product Management Routes (Seller only)
$router->add('GET', '/seller/products', [ProductManagementController::class, 'index'], 
    [AuthMiddleware::class, RoleMiddleware::class]);

$router->add('GET', '/seller/products/create', 
    [ProductManagementController::class, 'create'], 
    [AuthMiddleware::class, RoleMiddleware::class]
);

$router->add('POST', '/seller/products/store', 
    [ProductManagementController::class, 'store'], 
    [AuthMiddleware::class, RoleMiddleware::class]
);

$router->add('GET', '/seller/products/{id}/edit', 
    [ProductManagementController::class, 'edit'], 
    [AuthMiddleware::class, RoleMiddleware::class]
);

$router->add('POST', '/seller/products/{id}/update', 
    [ProductManagementController::class, 'update'], 
    [AuthMiddleware::class, RoleMiddleware::class]
);

// Delete product (AJAX)
$router->add('POST', '/seller/products/delete', 
    [ProductManagementController::class, 'delete'], 
    [AuthMiddleware::class, RoleMiddleware::class]
);

$router->add('GET', '/seller/products/add', 
    [ProductManagementController::class, 'create'], 
    [AuthMiddleware::class, RoleMiddleware::class]
);

$router->add('GET', '/checkout', [CheckoutController::class, 'showCheckoutPage'], [AuthMiddleware::class]);

$router->add('POST', '/checkout', 
    [CheckoutController::class, 'handleCheckout'], 
    [AuthMiddleware::class]
);


$router->add('POST', '/api/profile/address', 
    [BuyerProfileController::class, 'handleAddressUpdate'],
    [AuthMiddleware::class]
);