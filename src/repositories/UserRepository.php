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
}
