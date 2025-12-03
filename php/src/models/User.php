<?php
namespace App\Models;

class User {
    public int $user_id;
    public string $email;
    public string $password;
    public string $role;
    public string $name;
    public ?string $address;
    public int $balance;
    public string $created_at;
    public string $updated_at;

    public function __construct(array $data) {
        $this->user_id = $data['user_id'];
        $this->email = $data['email'];
        $this->password = $data['password'];
        $this->role = $data['role'];
        $this->name = $data['name'];
        $this->address = $data['address'] ?? null;
        $this->balance = $data['balance'];
        $this->created_at = $data['created_at'];
        $this->updated_at = $data['updated_at'];
    }

    public function isSeller(): bool {
        return $this->role === 'SELLER';
    }
}
