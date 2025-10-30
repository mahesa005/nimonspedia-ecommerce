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

    public function getByUserId(int $userId): ?array { // get user id dari stores
        $stmt = $this->db->prepare("SELECT * FROM store WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function getStoreIdByUserId(int $userId): ?int { // get store id from user id
        $store = $this->getByUserId($userId);
        return $store ? (int)$store['store_id'] : null;
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
}