<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Auth;
use App\Services\CartService;
use Exception;

class CartController {
    private CartService $cart_service;

    public function __construct() {
        $this->cart_service = new CartService();
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
            $success = $this->cart_service->addItem($buyer_id, $product_id, $quantity);

            if ($success) {
                $new_count = $this->cart_service->countUniqueItems($buyer_id);

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
}