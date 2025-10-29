<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\Store;
use PDO;

class StoreRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(int $user_id, string $store_name, string $clean_description, ?string $logo_path): int {
        $sql = 'INSERT INTO store (user_id, store_name, store_description, store_logo_path) 
                VALUES (?, ?, ?, ?) RETURNING store_id';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $user_id, 
                $store_name, 
                $clean_description, 
                $logo_path
            ]);
            return (int) $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log($e);
            throw "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.";
        }
    }

    public function findById(int $store_id): ?Store {
        $sql = 'SELECT * FROM "store" WHERE store_id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$store_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new Store($data) : null;
    }
}