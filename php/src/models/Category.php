<?php
namespace App\Models;

class Category {
    public int $category_id;
    public string $name;

    public function __construct(array $data) {
        $this->category_id = (int) ($data['category_id'] ?? 0);
        $this->name = $data['name'] ?? '';
    }
}