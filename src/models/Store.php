<?php
namespace App\Models;


class Store {
    public int $store_id;
    public int $user_id;
    public string $store_name;
    public string $store_description;
    public ?string $store_logo_path;
    public int $balance;
    public string $created_at;
    public string $updated_at;


    public function __construct(array $data) {
        $this->store_id = (int) $data['store_id'];
        $this->user_id = (int) $data['user_id'];
        $this->store_name = $data['store_name'];
        $this->store_description = $data['store_description'] ?? null;
        $this->store_logo_path = $data['store_logo_path'] ?? null;
        $this->balance = (int) $data['balance'];
        $this->created_at = $data['created_at'];
        $this->updated_at = $data['updated_at'];
    }

    public function getLogoPath(): string {
        return $this->store_logo_path ?? '/images/default_store_logo.png';
    }
}