<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\CartItem;
use App\Models\Product;
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
