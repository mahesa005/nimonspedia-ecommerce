<?php
namespace App\Repositories;

use App\Core\Database;
use PDO;
use PDOException;

class OrderItemRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(int $order_id, int $product_id, int $quantity, int $price_at_order): int {
        
        $subtotal = $quantity * $price_at_order;

        $sql = 'INSERT INTO "order_items" (order_id, product_id, quantity, price_at_order, subtotal)
                VALUES (?, ?, ?, ?, ?)
                RETURNING order_item_id';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $order_id,
                $product_id,
                $quantity,
                $price_at_order,
                $subtotal
            ]);

            return (int) $stmt->fetchColumn();

        } catch (PDOException $e) {
            error_log("OrderItemRepository::create Gagal: " . $e->getMessage());
            throw $e;
        }
    }
}