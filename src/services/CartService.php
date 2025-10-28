<?php
namespace App\Services;

use App\Repositories\CartRepository;
use App\Repositories\ProductRepository;
use Exception;
use PDOException;

class CartService {
    private CartRepository $cart_repo;
    private ProductRepository $product_repo;

    public function __construct() {
        $this->cart_repo = new CartRepository();
        $this->product_repo = new ProductRepository();
    }

    public function getCartItems(int $buyer_id): array {
        // TODO
    }

    public function countUniqueItems(int $buyer_id): int {
         try {
            return $this->cart_repo->countUniqueItems($buyer_id);
        } catch (PDOException $e) {
            error_log("Error counting cart items for buyer $buyer_id: " . $e->getMessage());
            return 0;
        }
    }

    public function addItem(int $buyer_id, int $product_id, int $quantity): bool {
        // TODO
    }

    public function updateItemQuantity(int $cart_item_id, int $new_quantity, int $buyer_id): bool {
        // TODO
    }

    public function removeItem(int $cart_item_id, int $buyer_id): bool {
        // TODO
    }

    public function clearCart(int $buyer_id): bool {
        // TODO
    }
}