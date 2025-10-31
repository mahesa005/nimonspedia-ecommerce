<?php
namespace App\Services;

use App\Repositories\CategoryRepository;

class CategoryService {
    private CategoryRepository $category_repo;

    public function __construct() {
        $this->category_repo = new CategoryRepository();
    }

    public function getAllCategories(): array {
        return $this->category_repo->findAll();
    }

    public function getCategoriesByStoreId(int $store_id): array {
        return $this->category_repo->findAllByStoreId($store_id);
    }
}