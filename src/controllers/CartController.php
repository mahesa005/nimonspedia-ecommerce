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
        $view->setData('pageScripts', ['/js/pages/cart.js']);
        $view->setData('navbarFile', 'components/navbar_cart.php');
        $view->setData('pageStyles', ['/css/components/navbar_buyer.css', '/css/pages/cart.css']);
        $view->setData('stores', $cartData['stores']);
        $view->setData('grandTotal', $cartData['grandTotal']);
        $view->setData('totalItems', $totalItems);
        
        $view->renderPage('pages/cart/cart.php');
    }

    public function handleAdd(Request $request): void {
        header('Content-Type: application/json');
        
        $buyer_id = Auth::id(); 
        
        $product_id_raw = $request->getDataBody('product_id', 0);
        $quantity_raw = $request->getDataBody('quantity', 0);

        $product_id = filter_var($product_id_raw, FILTER_VALIDATE_INT);
        $quantity = filter_var($quantity_raw, FILTER_VALIDATE_INT);

        if ($product_id === false || $quantity === false || $quantity <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Product ID atau Kuantitas tidak valid.'
            ]);
            exit;
        }
        
        try {
            $success = $this->cartService->addItem($buyer_id, $product_id, $quantity);

            if ($success) {
                $new_count = $this->cartService->countUniqueItems($buyer_id);

                echo json_encode([
                    'success' => true,
                    'message' => 'Produk berhasil ditambahkan ke keranjang!',
                    'cartItemCount' => $new_count
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false, 
                    'message' => 'Gagal menambahkan item karena kesalahan server.'
                ]);
            }
            exit;

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }

    public function add(Request $request) {
        $buyer_id = Auth::id();
        $product_id = (int)$request->getDataBody('product_id');
        $quantity = (int)$request->getDataBody('quantity');

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

    public function update(Request $request) {
        $buyer_id = Auth::id();
        $cart_item_id = (int)$request->getDataBody('cart_item_id');
        $new_quantity = (int)$request->getDataBody('quantity');

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

    public function delete(Request $request) {
        $buyer_id = Auth::id();
        $cart_item_id = (int)$request->getDataBody('cart_item_id');

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