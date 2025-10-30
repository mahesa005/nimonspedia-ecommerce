<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\Order;
use PDO;
use PDOException;

class OrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function countPendingOrders(int $store_id): ?int {
        $sql = 'SELECT COUNT(order_id)
                FROM "Order"
                WHERE store_id = :store_id
                AND status = \'waiting_approval\'';

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['store_id' => $store_id]);

            $count = $stmt->fetchColumn();
            return $count !== false ? (int)$count : null;
        } catch (PDOException $e) {
            error_log("Database error (countPendingOrders): " . $e->getMessage());
            return null;
        }
    }
}
