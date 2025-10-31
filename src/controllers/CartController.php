<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\View;
use App\Services\CartService;
use App\Core\Request;

class CartController {
    
    private CartService $cartService;

    public function __construct() {
        $this->cartService = new \App\Services\CartService();
    }

    public function showPage() {
        $buyer_id = Auth::id();
        
        $cartData = $this->cartService->getCartItems($buyer_id);
        $totalItems = $this->cartService->countUniqueItems($buyer_id);

      $view = new View();
 
        $view->setData('pageTitle', 'Keranjang Belanja');
        $view->setData('pageStyles', ['/css/pages/cart.css']);
        $view->setData('pageScripts', ['/js/pages/cart.js']);
        $view->setData('navbarFile', 'components/navbar_buyer.php');
        
        $view->setData('stores', $cartData['stores']);
        $view->setData('grandTotal', $cartData['grandTotal']);
        $view->setData('totalItems', $totalItems);
        
        $view->renderPage('pages/cart.php');
    }

    public function add() {
        $buyer_id = Auth::id();
        $product_id = (int)Request::post('product_id');
        $quantity = (int)Request::post('quantity');

        if (empty($product_id) || $quantity <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
            return;
        }

        try {
            $this->cartService->addItem($buyer_id, $product_id, $quantity);
            
            $newCount = $this->cartService->countUniqueItems($buyer_id);
            
            echo json_encode([
                'success' => true, 
                'newCount' => $newCount, 
                'message' => 'Produk ditambahkan ke keranjang!'
            ]);

        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function update() {
        $buyer_id = Auth::id();
        $cart_item_id = (int)Request::post('cart_item_id');
        $new_quantity = (int)Request::post('quantity');

        if (empty($cart_item_id)) {
             http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Item ID tidak valid']);
            return;
        }

        try {
            $this->cartService->updateItemQuantity($cart_item_id, $new_quantity, $buyer_id);
            
            $cartData = $this->cartService->getCartItems($buyer_id);
            $newCount = $this->cartService->countUniqueItems($buyer_id);

            echo json_encode([
                'success' => true,
                'newCount' => $newCount,
                'grandTotal' => $cartData['grandTotal'],
                'stores' => $cartData['stores'] 
            ]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function delete() {
        $buyer_id = Auth::id();
        $cart_item_id = (int)Request::post('cart_item_id');

        if (empty($cart_item_id)) {
             http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Item ID tidak valid']);
            return;
        }

        try {
            $this->cartService->removeItem($cart_item_id, $buyer_id);
            
            $newCount = $this->cartService->countUniqueItems($buyer_id);
            $cartData = $this->cartService->getCartItems($buyer_id);
         
            echo json_encode([
                'success' => true,
                'newCount' => $newCount,
                'grandTotal' => $cartData['grandTotal'],
                'stores' => $cartData['stores']
            ]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}