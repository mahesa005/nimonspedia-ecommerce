<?php
namespace App\Services;

use App\Repositories\UserRepository;
use App\Core\Session;
use Exception;

class AuthService {
    private UserRepository $user_repo;

    public function __construct() {
        $this->user_repo = new UserRepository();
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

        // TODO: Password belum dihash
        if (!$user || !($password === $user->password)) {
            throw new Exception('Invalid email or password.');
        }

        Session::set('user_id', $user->user_id);
        Session::set('role', $user->role);
    }
}
