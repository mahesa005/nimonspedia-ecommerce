<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Core\Session;
use App\Services\CartService;
use App\Services\UserService;
use App\Services\CheckoutService;
use Exception;

class CheckoutController {
    private View $view;
    private CartService $cart_service;
    private UserService $user_service;
    private CheckoutService $checkout_service;

    public function __construct() {
        $this->view = new View();
        $this->cart_service = new CartService();
        $this->user_service = new UserService();
        $this->checkout_service = new CheckoutService();
    }

    public function showCheckoutPage(Request $request): void {
        $buyer_id = Auth::id();
        
        $user = $this->user_service->getUserById($buyer_id);
        if (!$user) {
            header('Location: /login'); // Harusnya ga mungkin sih, tp just in case
            exit;
        }

        $checkout_data = $this->cart_service->getCartForCheckout($buyer_id);
        $unique_item_count = $this->cart_service->countUniqueItems($buyer_id);

        if ($checkout_data['num_of_items'] === 0) {
            Session::set('toast', ['message' => 'Keranjang Anda kosong.', 'type' => 'info']);
            header('Location: /cart');
            exit;
        }
        
        $styles = [
            '/css/components/navbar_buyer.css',
            '/css/pages/checkout.css'
        ];
        $scripts = [
            '/js/modules/topup_modal.js',
            '/js/pages/checkout.js'
        ];

        $this->view->setData('pageTitle', 'Checkout');
        $this->view->setData('navbarFile', 'components/navbar_buyer.php');
        $this->view->setData('pageStyles', $styles);
        $this->view->setData('pageScripts', $scripts);
        
        $this->view->setData('user', $user);
        $this->view->setData('cart_item_count', $unique_item_count);
        
        $this->view->setData('stores', $checkout_data['stores']);
        $this->view->setData('products_by_store', $checkout_data['products_by_store']);
        $this->view->setData('num_of_items', $checkout_data['num_of_items']);
        $this->view->setData('total_price', $checkout_data['total_price']);

        $this->view->renderPage('pages/buyer/checkout.php');
    }

    public function handleCheckout(Request $request): void {
        $buyer_id = Auth::id();
        $shipping_address = $request->getDataBody('address');

        try {
            if (empty(trim($shipping_address))) {
                throw new Exception("Alamat pengiriman tidak boleh kosong.");
            }

            $this->checkout_service->processCheckout($buyer_id, $shipping_address);

            Session::set('toast', [
                'message' => 'Checkout berhasil! Pesanan Anda sedang diproses.',
                'type' => 'success'
            ]);
            header('Location: /orders');
            exit;

        } catch (Exception $e) {
            Session::set('toast', [
                'message' => $e->getMessage(),
                'type' => 'error'
            ]);
            header('Location: /checkout');
            exit;
        }
    }
}