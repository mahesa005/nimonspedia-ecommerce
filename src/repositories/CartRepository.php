<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\CartItem;
use PDO;

class CartRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function countUniqueItems(int $buyer_id): int {
        $sql = 'SELECT COUNT(DISTINCT product_id) FROM cart_item WHERE buyer_id = ?';
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$buyer_id]);
            return (int) $stmt->fetchColumn();
        } catch (\PDOException $e) {
            error_log("Error counting cart items for buyer $buyer_id: " . $e->getMessage());
            return 0;
        }
    }

    public function findItem(int $buyer_id, int $product_id): ?CartItem {
        $sql = 'SELECT * FROM "cart_item" WHERE buyer_id = ? AND product_id = ?';
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$buyer_id, $product_id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            return $data ? new CartItem($data) : null;
        } catch (PDOException $e) {
            error_log("Error finding cart item for buyer $buyer_id, product $product_id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addItem(int $buyer_id, int $product_id, int $quantity): bool {
        $sql = 'INSERT INTO "cart_item" (buyer_id, product_id, quantity, created_at, updated_at) 
                VALUES (?, ?, ?, NOW(), NOW())';
        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$buyer_id, $product_id, $quantity]);
        } catch (PDOException $e) {
            error_log("Error inserting cart item for buyer $buyer_id, product $product_id: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateQuantity(int $cart_item_id, int $new_quantity): bool {
        $sql = 'UPDATE "cart_item" SET quantity = ?, updated_at = NOW() 
                WHERE cart_item_id = ?';
        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$new_quantity, $cart_item_id]) && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating quantity for cart item $cart_item_id: " . $e->getMessage());
            throw $e;
        }
    }

    public function findByIdAndBuyer(int $cart_item_id, int $buyer_id): ?CartItem {
        $sql = 'SELECT ci.*, p.stock
                FROM "cart_item" ci 
                JOIN "product" p ON ci.product_id = p.product_id
                WHERE ci.cart_item_id = ? AND ci.buyer_id = ?';
        try {
             $stmt = $this->db->prepare($sql);
             $stmt->execute([$cart_item_id, $buyer_id]);
             $data = $stmt->fetch(PDO::FETCH_ASSOC);
             return $data ? new CartItem($data) : null;
        } catch (PDOException $e) {
             error_log("Error finding cart item $cart_item_id for buyer $buyer_id: " . $e->getMessage());
             throw $e;
        }
    }

    public function removeItemById(int $cart_item_id): bool {
         $sql = 'DELETE FROM "cart_item" WHERE cart_item_id = ?';
         try {
             $stmt = $this->db->prepare($sql);
             return $stmt->execute([$cart_item_id]) && $stmt->rowCount() > 0;
         } catch (PDOException $e) {
              error_log("Error deleting cart item $cart_item_id: " . $e->getMessage());
              throw $e;
         }
    }

    public function clearByBuyerId(int $buyer_id): bool {
         $sql = 'DELETE FROM "cart_item" WHERE buyer_id = ?';
         try {
             $stmt = $this->db->prepare($sql);
             return $stmt->execute([$buyer_id]);
         } catch (PDOException $e) {
              error_log("Error clearing cart for buyer $buyer_id: " . $e->getMessage());
              throw $e;
         }
     }
}
