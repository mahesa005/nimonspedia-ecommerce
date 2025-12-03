<?php
namespace App\Services;

use App\Repositories\UserRepository;
use App\Models\User;
use Exception;

class UserService {
    private UserRepository $user_repo;

    public function __construct() {
        $this->user_repo = new UserRepository();
    }

    public function getUserById(int $user_id): ?User {
        try {
            return $this->user_repo->findById($user_id);
        } catch (PDOException $e) {
            error_log("Error fetching user $user_id: " . $e->getMessage());
            return null;
        }
    }

    public function topUpBalance(int $user_id, int $amount): int {
        if ($amount < 1000) {
            throw new Exception("Jumlah top up minimal adalah Rp 1.000.");
        }

        $user = $this->user_repo->findById($user_id);
        if (!$user) {
            throw new Exception("Pengguna tidak ditemukan.");
        }
        
        $new_balance = $user->balance + $amount;

        $success = $this->user_repo->updateBalance($user_id, $new_balance);
        
        if (!$success) {
             throw new Exception("Gagal memperbarui saldo di database.");
        }

        return $new_balance;
    }

    public function updateAddress(int $user_id, ?string $new_address): bool {
        if (empty(trim($new_address ?? ''))) {
            throw new Exception("Alamat tidak boleh kosong.");
        }
        
        try {
            return $this->user_repo->updateAddress($user_id, trim($new_address));
        } catch (PDOException $e) {
            error_log("Gagal update alamat untuk user $user_id: " . $e->getMessage());
            throw new Exception("Gagal memperbarui alamat karena masalah database."); 
        }
    }
}