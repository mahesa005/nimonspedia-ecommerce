<?php
namespace App\Services;

use App\Repositories\StoreRepository;
use App\Models\Store;

class StoreService {
    private StoreRepository $store_repo;

    public function __construct() {
        $this->store_repo = new StoreRepository();
    }

    public function getStoreById(int $store_id): ?Store {
        return $this->store_repo->findById($store_id); 
    }
}