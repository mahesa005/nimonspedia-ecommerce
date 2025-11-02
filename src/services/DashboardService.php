<?php
namespace App\Services;

use App\Repositories\StoreRepository;
use App\Repositories\ProductRepository;
use App\Repositories\OrderRepository;

class DashboardService {
    private StoreRepository $storeRepo;
    private ProductRepository $productRepo;
    private OrderRepository $orderRepo;

    public function __construct() {
        $this->storeRepo = new StoreRepository();
        $this->productRepo = new ProductRepository();
        $this->orderRepo = new OrderRepository();
    }

    // Get all dashboard data including store info
    public function getSellerDashboardData(int $user_id): array {
        $store = $this->storeRepo->getByUserId($user_id);
        
        if (!$store) {
            throw new \Exception("Store not found for user ID: $user_id");
        }

        $store_id = (int)$store['store_id'];

        // Get quick stats
        $total_products = $this->productRepo->countByStoreId($store_id);
        $pending_orders = $this->orderRepo->countStoreOrders($store_id, 'waiting_approval', null);
        $total_revenue = $this->orderRepo->getTotalRevenueByStoreId($store_id);

        return [
            'store_info' => $store,
            'quick_stats' => [
                'total_products' => $total_products,
                'pending_orders' => $pending_orders,
                'store_balance' => $store['balance'] ?? 0,
                'total_revenue' => $total_revenue
            ]
        ];
    }
}