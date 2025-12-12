<?php
namespace App\Services;

use App\Core\Database;
use App\Repositories\UserRepository;
use Exception;
use PDO;

class ProfileService {
    private UserRepository $userRepo;
    private PDO $db;

    public function __construct() {
        $this->userRepo = new UserRepository();
        $this->db = Database::getInstance();
    }

    public function getProfile(int $buyer_id): ?\App\Models\User {
        return $this->userRepo->findById($buyer_id);
    }

    public function updateProfile(int $buyer_id, string $name, string $address): bool {
        if (empty($name) || empty($address)) {
            throw new Exception("Nama dan alamat tidak boleh kosong.");
        }
        return $this->userRepo->updateProfile($buyer_id, $name, $address);
    }

    public function changePassword(int $buyer_id, string $old_pass, string $new_pass, string $confirm_pass): bool {
        $user = $this->userRepo->findById($buyer_id);
        if (!$user) {
            throw new Exception("User tidak ditemukan.");
        }

        if (!password_verify($old_pass, $user->password)) {
            throw new Exception("Password lama yang Anda masukkan salah.");
        }

        if ($new_pass !== $confirm_pass) {
            throw new Exception("Password baru dan konfirmasi password tidak cocok.");
        }

        $regex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/';
        if (!preg_match($regex, $new_pass)) {
            throw new Exception("Password baru harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.");
        }
        
        $new_hashed_password = password_hash($new_pass, PASSWORD_DEFAULT);
        return $this->userRepo->updatePassword($buyer_id, $new_hashed_password);
    }

    public function getPreferences($userId) {
        $stmt = $this->db->prepare("SELECT * FROM push_subscriptions WHERE user_id = :uid");
        $stmt->execute([':uid' => $userId]);
        $prefs = $stmt->fetch();

        if (!$prefs) {
            return [
                'chat_enabled' => true,
                'auction_enabled' => true,
                'order_enabled' => true
            ];
        }
        return $prefs;
    }

    public function updatePreferences($userId, $chat, $auction, $order) {
        $current = $this->getPreferences($userId);
        
        $check = $this->db->prepare("SELECT 1 FROM push_subscriptions WHERE user_id = :uid");
        $check->execute([':uid' => $userId]);
        
        if ($check->fetch()) {
            $sql = "UPDATE push_subscriptions SET 
                    chat_enabled = :chat, 
                    auction_enabled = :auction, 
                    order_enabled = :order, 
                    updated_at = NOW() 
                    WHERE user_id = :uid";
        } else {
            $sql = "INSERT INTO push_subscriptions (user_id, chat_enabled, auction_enabled, order_enabled) 
                    VALUES (:uid, :chat, :auction, :order)";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':uid' => $userId,
            ':chat' => $chat ? 1 : 0,
            ':auction' => $auction ? 1 : 0,
            ':order' => $order ? 1 : 0
        ]);
    }
}
