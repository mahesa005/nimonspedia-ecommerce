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

    public function getQuantityByOrderItemId(int $order_item_id): ?int {
        $sql = 'SELECT quantity
                FROM "order_items"
                WHERE order_item_id = :order_item_id';

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['order_item_id' => $order_item_id]);

            $quantity = $stmt->fetchColumn();
            return $quantity !== false ? (int)$quantity : null;
        } catch (PDOException $e) {
            error_log("Database error (getQuantityByOrderItemId): " . $e->getMessage());
            return null;
        }
    }

    public function getOrderItemsByOrderId(int $order_id): array {
        $sql = 'SELECT order_item_id, product_id, quantity, price_at_order, subtotal
                FROM "order_items"
                WHERE order_id = :order_id';

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['order_id' => $order_id]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error (getOrderItemsByOrderId): " . $e->getMessage());
            return [];
        }
    }
}