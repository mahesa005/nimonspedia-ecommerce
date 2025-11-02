<?php
namespace App\Services;

use App\Repositories\UserRepository;
use Exception;

class ProfileService {
    private UserRepository $userRepo;

    public function __construct() {
        $this->userRepo = new UserRepository();
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
}
