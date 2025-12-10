<?php
use App\Controllers\AuthController;
use App\Controllers\TestController;
use App\Controllers\ProductManagementController;
use App\Controllers\ProductController;
use App\Controllers\OrderHistoryController;
use App\Controllers\ProfileController;
use App\Controllers\BuyerProfileController;
use App\Controllers\SellerDashboardController;
use App\Controllers\CartController;
use App\Controllers\CheckoutController;
use App\Controllers\StoreController;
use App\Core\Middleware\AuthMiddleware;
use App\Core\Middleware\GuestMiddleware;
use App\Core\Middleware\RoleMiddleware;
use App\Core\Middleware\RedirectSellerMiddleware;
use App\Controllers\OrderManagementController;
use App\Controllers\ExportController;
use App\Controllers\AuctionController;

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

$router->add('GET', '/', 
    [ProductController::class, 'showHomePage'],
    [RedirectSellerMiddleware::class]
);

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

// Seller Dashboard
$router->add('GET', '/seller/dashboard',
    [SellerDashboardController::class, 'index'],
    [AuthMiddleware::class, RoleMiddleware::class]  
);
$router->add('GET', '/checkout', [CheckoutController::class, 'showCheckoutPage'], [AuthMiddleware::class]);

$router->add('POST', '/checkout', 
    [CheckoutController::class, 'handleCheckout'], 
    [AuthMiddleware::class]
);

// Order History Routes
$router->add('GET', '/orders',
    [OrderHistoryController::class, 'showPage'],
    [AuthMiddleware::class]
);

$router->add('POST', '/orders/update-status',
    [OrderHistoryController::class, 'updateStatus'],
    [AuthMiddleware::class]
);

$router->add('POST', '/api/profile/address', 
    [BuyerProfileController::class, 'handleAddressUpdate'],
    [AuthMiddleware::class]
);
$router->add('GET', '/seller/orders',
    [OrderManagementController::class, 'index'],
    [AuthMiddleware::class, RoleMiddleware::class]  
);

$router->add('POST', '/seller/orders/action',
    [OrderManagementController::class, 'handleAction'],
    [AuthMiddleware::class, RoleMiddleware::class]  
);
$router->add('GET', '/store/{id}', [StoreController::class, 'showStoreDetailPage']);

$router->add('GET', '/profile',
    [ProfileController::class, 'showPage'],
    [AuthMiddleware::class]
);

$router->add('POST', '/profile/update',
    [ProfileController::class, 'update'],
    [AuthMiddleware::class]
);

$router->add('POST', '/profile/password',
    [ProfileController::class, 'changePassword'],
    [AuthMiddleware::class]
);

$router->add('POST', '/profile/preferences', 
    [ProfileController::class, 'updatePreferences'], 
    [AuthMiddleware::class]
);

$router->add('POST', '/seller/store/update', 
    [StoreController::class, 'handleUpdateStore'],
    [AuthMiddleware::class, RoleMiddleware::class]
);

$router->add('GET', '/seller/export.csv',
    [ExportController::class, 'download'],
    [AuthMiddleware::class, RoleMiddleware::class]
);

$router->add('GET', '/api/auth/validate-session', [AuthController::class, 'validateSession']);

$router->add('GET', '/api/stores', [StoreController::class, 'getAllStores']);

$router->add('GET', '/api/auctions', [AuctionController::class, 'index']);