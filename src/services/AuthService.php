<?php
namespace App\Services;

require_once __DIR__ . '/../../lib/htmlpurifier-4.15.0/library/HTMLPurifier.auto.php';

use App\Repositories\UserRepository;
use App\Repositories\StoreRepository;
use App\Core\Session;
use Exception;
use HTMLPurifier;
use HTMLPurifier_Config;

class AuthService {
    private UserRepository $user_repo;
    private StoreRepository $store_repo;
    private HTMLPurifier $html_purifier;

    public function __construct() {
        $this->user_repo = new UserRepository();
        $this->store_repo = new StoreRepository();

        $config = HTMLPurifier_Config::createDefault();
        $this->html_purifier = new HTMLPurifier($config);
    }

    public function login(array $data): void {
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (empty($email) || empty($password)) {
            throw new Exception('Email and password are required.');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }

        $user = $this->user_repo->findByEmail($email);

        if (!$user || !password_verify($password, $user->password)) {
            throw new Exception('Invalid email or password.');
        }

        Session::set('user_id', $user->user_id);
        Session::set('role', $user->role);
    }

public function register(array $data, array $files): void {
        $this->validateRegistrationData($data, $files);

        $role = $data['role'];
        $clean_description = null;
        $logo_path = null;

        $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);

        if ($role === 'SELLER') {
            $dirty_description = $data['store_description'] ?? '';
            $clean_description = $this->html_purifier->purify($dirty_description);

            $logo_file = $files['store_logo'] ?? null;
            if ($logo_file && $logo_file['error'] === UPLOAD_ERR_OK) {
                $logo_path = $this->handleLogoUpload($logo_file);
            }
        }

        try {
            $user_id = $this->user_repo->create(
                $data['name'],
                $data['email'],
                $hashed_password,
                $data['address'],
                $role
            );

            if ($role === 'SELLER') {
                $this->store_repo->create(
                    $user_id,
                    $data['store_name'],
                    $clean_description ?? '',
                    $logo_path
                );
            }
        } catch (PDOException $e) {
            if ($logo_path && file_exists(__DIR__ . '/../../public' . $logo_path)) {
                unlink(__DIR__ . '/../../public' . $logo_path);
            }
            throw new Exception("Gagal daftar akun. Tolong coba lagi.");
        }

        Session::set('user_id', $user_id);
        Session::set('role', $role);
    }

private function validateRegistrationData(array $data, array $files): void {
        $required_fields = ['role', 'name', 'email', 'password', 'confirm_password', 'address'];
        foreach ($required_fields as $field) {
            if (empty(trim($data[$field] ?? ''))) {
                throw new Exception(ucfirst(str_replace('_', ' ', $field)) . " dibutuhkan.");
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Format Email invalid.");
        }

        if ($data['password'] !== $data['confirm_password']) {
            throw new Exception("Passwords tidak sama.");
        }

        if (
            strlen($data['password']) < 8 ||
            !preg_match('/[A-Z]/', $data['password']) ||
            !preg_match('/[a-z]/', $data['password']) ||
            !preg_match('/[0-9]/', $data['password']) ||
            !preg_match('/[\W_]/', $data['password'])
        ) {
            throw new Exception("Password harus terdiri dari 8 karakter dan termasuk huruf kapital dan non kapital, angka, dan simbol.");
        }

        if ($this->user_repo->findByEmail($data['email'])) {
            throw new Exception("Email sudah dipakai.");
        }

        if ($data['role'] === 'SELLER') {
            if (empty(trim($data['store_name'] ?? ''))) {
                throw new Exception("Nama toko dibutuhkan untuk penjual.");
            }
            if (strlen($data['store_name']) > 100) {
                 throw new Exception("Nama toko tidak boleh lebih dari 100 karakter.");
            }

            $logo_file = $files['store_logo'] ?? null;
            if ($logo_file && $logo_file['error'] !== UPLOAD_ERR_NO_FILE) {
                if ($logo_file['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception("Error upload logo.");
                }

                if ($logo_file['size'] > 2 * 1024 * 1024) {
                    throw new Exception("Ukuran file logo tidak boleh lebih dari 2MB.");
                }

                $allowed_extensions = ['jpg', 'jpeg', 'png', 'webp'];
                $extension = strtolower(pathinfo($logo_file['name'], PATHINFO_EXTENSION));
                if (!in_array($extension, $allowed_extensions)) {
                     throw new Exception("Logo file type invalid. Allowed: jpg, jpeg, png, webp.");
                }
            }
        }
    }

    private function handleLogoUpload(array $file): ?string {
        $upload_dir = '/uploads/logos/';
        $public_path = __DIR__ . '/../../public' . $upload_dir;

        if (!is_dir($public_path)) {
            mkdir($public_path, 0775, true);
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $unique_filename = uniqid('logo_', true) . '.' . $extension;
        $destination = $public_path . $unique_filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            return $upload_dir . $unique_filename;
        } else {
            throw new Exception("Failed to save uploaded logo.");
        }
    }
}
