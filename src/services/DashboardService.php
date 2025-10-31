<?php
namespace App\Services;

use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use App\Repositories\StoreRepository;
use Exception;

class DashboardService {
    private StoreRepository $storeRepo;
    private ProductRepository $productRepo;
    private OrderRepository $orderRepo;

    public function __construct() {
        $this->storeRepo = new StoreRepository();
        $this->productRepo = new ProductRepository();
        $this->orderRepo = new OrderRepository();
    }

    public function getSellerDashboardData(int $user_id): array {
        // 1. Get Store Info
        $storeInfo = $this->storeRepo->getByUserId($user_id);
        if (!$storeInfo) {
            throw new Exception("Toko tidak ditemukan untuk user ID: $user_id");
        }
        $store_id = (int)$storeInfo['store_id'];

        // 2. Get Quick Stats
        $totalProducts = $this->productRepo->countByStoreId($store_id) ?? 0;
        $pendingOrders = $this->orderRepo->countPendingOrders($store_id) ?? 0;
        $storeBalance = $this->storeRepo->getStoreBalance($store_id) ?? 0;

        // 3. Total Revenue from storeInfo balance
        $totalRevenue = (int)$storeInfo['balance'];

        // 4. Return structured data
        return [
            'store_info' => $storeInfo,
            'quick_stats' => [
                'total_products' => $totalProducts,
                'pending_orders' => $pendingOrders,
                'store_balance' => $storeBalance,
                'total_revenue' => $totalRevenue
            ]
        ];
    }

}
