<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Store;
use PDO;

class CartRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function countUniqueItems(int $buyer_id): int {
        $sql = 'SELECT COUNT(DISTINCT ci.product_id) FROM cart_item ci JOIN product p ON ci.product_id = p.product_id WHERE buyer_id = ? AND p.deleted_at IS NULL';
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

    public function findByBuyerIdWithDetails(int $buyer_id): array {
        $sql = 'SELECT 
                    ci.*, 
                    p.product_id, p.product_name, p.price, p.stock, p.main_image_path, p.store_id, p.deleted_at,
                    s.store_id AS s_store_id, s.user_id AS s_user_id, s.store_name, s.store_description, s.store_logo_path, s.balance AS s_balance, s.created_at AS s_created_at, s.updated_at AS s_updated_at
                FROM "cart_item" ci
                JOIN "product" p ON ci.product_id = p.product_id
                JOIN "store" s ON p.store_id = s.store_id
                WHERE ci.buyer_id = ? AND p.deleted_at IS NULL
                ORDER BY s.store_name ASC, ci.created_at ASC';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$buyer_id]);
            
            $cart_items = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $cart_item = new CartItem($row);

                $product = new Product($row);
                $product->store_name = 
                $store_data = $row['store_name'];
                
                $cart_item->product = $product;
                
                $cart_items[] = $cart_item;
            }
            return $cart_items;
            
        } catch (PDOException $e) {
            error_log("CartRepository::findByBuyerIdWithDetails Gagal: " . $e->getMessage());
            throw $e;
        }
    }
    public function findAllByBuyerId(int $buyer_id): array {
        $sql = "SELECT 
                    ci.cart_item_id, ci.buyer_id, ci.product_id, ci.quantity,
                    p.product_name, p.price, p.main_image_path, p.stock, p.store_id,
                    s.store_name
                FROM cart_item ci
                JOIN product p ON ci.product_id = p.product_id
                JOIN store s ON p.store_id = s.store_id
                WHERE ci.buyer_id = :buyer_id AND p.deleted_at IS NULL
                ORDER BY s.store_name, p.product_name";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['buyer_id' => $buyer_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error fetching cart items for buyer $buyer_id: " . $e->getMessage());
            return [];
        }
    }

    public function findByBuyerAndProduct(int $buyer_id, int $product_id): ?CartItem {
        $sql = 'SELECT * FROM cart_item WHERE buyer_id = :buyer_id AND product_id = :product_id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['buyer_id' => $buyer_id, 'product_id' => $product_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new CartItem($data) : null;
    }

    public function findItemById(int $cart_item_id, int $buyer_id): ?CartItem {
        $sql = 'SELECT * FROM cart_item WHERE cart_item_id = :cart_item_id AND buyer_id = :buyer_id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['cart_item_id' => $cart_item_id, 'buyer_id' => $buyer_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new CartItem($data) : null;
    }

    public function create(int $buyer_id, int $product_id, int $quantity): int {
        $sql = 'INSERT INTO cart_item (buyer_id, product_id, quantity) 
                VALUES (?, ?, ?) RETURNING cart_item_id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$buyer_id, $product_id, $quantity]);
        return (int) $stmt->fetchColumn();
    }

    public function updateQuantity(int $cart_item_id, int $new_quantity, int $buyer_id): bool {
        $sql = 'UPDATE cart_item SET quantity = ? 
                WHERE cart_item_id = ? AND buyer_id = ?';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$new_quantity, $cart_item_id, $buyer_id]);
    }

    public function remove(int $cart_item_id, int $buyer_id): bool {
        $sql = 'DELETE FROM cart_item WHERE cart_item_id = ? AND buyer_id = ?';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$cart_item_id, $buyer_id]);
    }

    public function clear(int $buyer_id): bool {
        $sql = 'DELETE FROM cart_item WHERE buyer_id = ?';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$buyer_id]);
    }
}
