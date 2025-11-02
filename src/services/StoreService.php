<?php
namespace App\Services;

use App\Repositories\StoreRepository;
use App\Models\Store;

class StoreService {
    private StoreRepository $storeRepo;

    public function __construct() {
        $this->storeRepo = new StoreRepository();
    }


    // Get store by ID
    public function getStoreById(int $store_id): ?Store {
        return $this->storeRepo->findById($store_id);
    }

    // Get store by user ID
    public function getStoreByUserId(int $user_id): ?array {
        return $this->storeRepo->getByUserId($user_id);
    }

    // Update store balance
    public function updateStoreBalance(int $store_id, float $amount): bool {
        return $this->storeRepo->updateBalance($store_id, $amount);
    }

    // Update store information
    public function updateStore(int $store_id, array $data): bool {
        return $this->storeRepo->update($store_id, $data);
    }
}