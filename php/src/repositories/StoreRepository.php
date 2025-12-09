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

    public function getUserIdByStoreId(int $storeId): ?int {
        $stmt = $this->db->prepare("SELECT * FROM store WHERE store_id = :store_id");
        $stmt->execute(['store_id' => $storeId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (int)$result['user_id'] : null;
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

    // Get Store Balance
    public function getStoreBalance(int $store_id): ?int {
        $sql = 'SELECT balance FROM store WHERE store_id = :store_id';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['store_id' => $store_id]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? (int) $result['balance'] : null;
        } catch (\PDOException $e) {
            error_log('Error fetching store balance: ' . $e->getMessage());
            return null;
        }
    }

    public function findById(int $store_id): ?Store {
        $sql = 'SELECT * FROM "store" WHERE store_id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$store_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new Store($data) : null;
    }

    public function findByUserId(int $user_id): ?Store {
        $sql = 'SELECT * FROM "store" WHERE user_id = ?';
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$user_id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            return $data ? new Store($data) : null;

        } catch (PDOException $e) {
            error_log("StoreRepository::findByUserId Gagal: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateBalance(int $store_id, int $new_balance): bool {
        $sql = 'UPDATE "store" SET balance = :balance WHERE store_id = :store_id';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['balance' => $new_balance, 'store_id' => $store_id]);
    }

    public function update(int $store_id, string $store_name, string $store_description, ?string $new_logo_path): bool {
        $params = [
            'store_id' => $store_id,
            'store_name' => $store_name,
            'store_description' => $store_description,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $sql_logo_part = '';
        if ($new_logo_path !== null) {
            $sql_logo_part = ', store_logo_path = :logo_path';
            $params['logo_path'] = $new_logo_path;
        }

        $sql = "UPDATE \"store\" SET 
                    store_name = :store_name, 
                    store_description = :store_description,
                    updated_at = :updated_at
                    $sql_logo_part
                WHERE store_id = :store_id";

        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute($params) && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("StoreRepository::update Gagal: " . $e->getMessage());
            throw $e;
        }
    }
}