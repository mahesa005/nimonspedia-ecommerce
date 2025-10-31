<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\User;
use PDO;

class UserRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(string $name, string $email, string $hashed_password, string $address, string $role): int {
        $sql = 'INSERT INTO "user" (name, email, "password", address, "role") 
                VALUES (?, ?, ?, ?, ?::user_role) RETURNING user_id';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $name, 
                $email, 
                $hashed_password, 
                $address, 
                $role
            ]);
            return (int) $stmt->fetchColumn(); 
        } catch (PDOException $e) {
            error_log($e);
            throw "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.";
        }
    }

    public function findByEmail(string $email): ?User {
        $stmt = $this->db->prepare('SELECT * FROM "user" WHERE email = ?');
        $stmt->execute([$email]);
        
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new User($data);
        }

        return null;
    }

    public function findById(int $id): ?User {
        $stmt = $this->db->prepare('SELECT * FROM "user" WHERE user_id = ?');
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new User($data) : null;
    }

    public function updateBalance(int $user_id, int $new_balance): bool {
         $sql = 'UPDATE "user" SET balance = ?, updated_at = NOW() WHERE user_id = ?';
         try {
             $stmt = $this->db->prepare($sql);
             return $stmt->execute([$new_balance, $user_id]) && $stmt->rowCount() > 0; 
         } catch (\PDOException $e) {
             error_log("Error updating balance for user $user_id: " . $e->getMessage());
             return false;
         }
    }

    public function updateAddress(int $user_id, string $new_address): bool {
        $sql = 'UPDATE "user" SET address = ?, updated_at = NOW() WHERE user_id = ?';
        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$new_address, $user_id]) && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("UserRepository::updateAddress Gagal: " . $e->getMessage());
            throw $e;
        }
    }
}
