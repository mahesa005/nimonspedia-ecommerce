<?php
namespace App\Repositories;

use App\Core\Database;
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
}
