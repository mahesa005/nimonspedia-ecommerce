<?php
namespace App\Repositories;

use App\Core\Database;
use PDO;
use PDOException;


class OrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(int $buyer_id, int $store_id, int $total_price, string $shipping_address): int {
        $sql = 'INSERT INTO "order" (buyer_id, store_id, total_price, shipping_address, created_at)
                VALUES (?, ?, ?, ?, NOW())
                RETURNING order_id';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $buyer_id,
                $store_id,
                $total_price,
                $shipping_address
            ]);
            
            return (int) $stmt->fetchColumn(); 

        } catch (PDOException $e) {
            error_log("OrderRepository::create Gagal: " . $e->getMessage());
            throw $e;
        }
    }
}