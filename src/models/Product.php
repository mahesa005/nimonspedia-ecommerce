<?php
namespace App\Models;

class Product {
    public int $product_id;
    public int $store_id;
    public string $product_name;
    public ?string $description;
    public int $price;
    public int $stock;
    public ?string $main_image_path;
    public string $created_at;
    public string $updated_at;
    public ?string $deleted_at;

    public function __construct(array $data) {
        $this->product_id = (int) ($data['product_id'] ?? 0);
        $this->store_id = (int) ($data['store_id'] ?? 0);
        $this->product_name = $data['product_name'] ?? '';
        $this->description = $data['description'] ?? null;
        $this->price = (int) ($data['price'] ?? 0);
        $this->stock = (int) ($data['stock'] ?? 0);
        $this->main_image_path = $data['main_image_path'] ?? null;
        $this->created_at = $data['created_at'] ?? '';
        $this->updated_at = $data['updated_at'] ?? '';
        $this->deleted_at = $data['deleted_at'] ?? null; // soft delete
    }

    public function isOutOfStock(): bool {
        return $this->stock <= 0;
    }

    public function isDeleted(): bool {
        return !is_null($this->deleted_at);
    }

    public function getImagePath(): string {
        return $this->main_image_path ?? '/images/default_product.png';
    }
}