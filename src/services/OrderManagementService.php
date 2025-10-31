<?php
namespace App\Services;

use App\Repositories\OrderRepository;
use App\Repositories\StoreRepository;
use App\Repositories\UserRepository;
use App\Models\Order;
use Exception;

class OrderManagementService {
    private OrderRepository $orderRepo;
    private StoreRepository $storeRepo;
    private UserRepository $userRepo;

    public function __construct() {
        $this->orderRepo = new OrderRepository();
        $this->storeRepo = new StoreRepository();
        $this->userRepo = new UserRepository();
    }

    /*
    * Retrieve all order data
    */
    public function getOrdersPageData(int $user_id, array $querryParams) {
        // 1. Get store_id from user_id
        $store = $this->storeRepo->getByUserId($user_id);
        if (!$store) {
            throw new Exception("Toko tidak ditemukan untuk user ID: $user_id");
        }   
        $store_id = (int)$store['store_id'];

        // 2. Get filter and pagination params
        $status = $queryParams['status'] ?? null;
        $search = $queryParams['search'] ?? null;
        $page = (int)($queryParams['page'] ?? 1);
        $limit = 10; 
        $offset = ($page - 1) * $limit;

        // 3. Get data from repo
        $orders = $this->orderRepo->getStoreOrders($store_id, $status, $search, $limit, $offset);
        $totalOrders = $this->orderRepo->countStoreOrders($store_id, $status, $search);
        
        // 4. Prepare data to be sent to controller
        return [
            'orders' => $orders,
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => ceil($totalOrders / $limit),
                'totalOrders' => $totalOrders
            ],
            'filters' => [
                'status' => $status,
                'search' => $search
            ]
        ];
    }

    /**
     * Proses all POST actionos
     */
    public function processOrderAction(int $user_id, array $postData) {
        // 1. Retrieve store_id
        $store = $this->storeRepo->getByUserId($user_id);
        if (!$store) {
            throw new Exception("Akses ditolak: Toko tidak ditemukan.");
        }
        $store_id = (int)$store['store_id'];

        // 2. Get action
        $action = $postData['action'] ?? '';
        $order_id = (int)($postData['order_id'] ?? 0);

        // 3. Validate order ownership
        $order = $this->orderRepo->getOrderByIdAndStore($order_id, $store_id);
        if (!$order) {
            throw new Exception("Aksi tidak diizinkan atau pesanan #$order_id tidak ditemukan.");
        }

        // 4. Run business logic
        switch ($action) {
            case 'approve':
                return $this->handleApprove($order);
            
            case 'reject':
                $reason = $postData['reject_reason'] ?? '';
                return $this->handleReject($order, $reason);

            case 'set_delivery':
                $delivery_time = $postData['delivery_time'] ?? '';
                return $this->handleSetDelivery($order, $delivery_time);
            
            default:
                throw new Exception("Aksi '$action' tidak valid.");
        }
    }

    // Business specific logic
    private function handleApprove(Order $order) {
        if ($order->status !== 'waiting_approval') {
            throw new Exception("Hanya pesanan 'waiting_approval' yang bisa disetujui.");
        }

        $success = $this->orderRepo->updateStatus($order->order_id, 'approved');
        if (!$success) {
            throw new Exception("Database error: Gagal menyetujui pesanan.");
        }
        return ['message' => "Pesanan #{$order->order_id} berhasil disetujui."];
    }

    private function handleReject(Order $order, string $reason) {
        if ($order->status !== 'waiting_approval') {
            throw new Exception("Hanya pesanan 'waiting_approval' yang bisa ditolak.");
        }
        if (empty($reason)) {
            throw new Exception("Alasan penolakan wajib diisi.");
        }

        $refundSuccess = $this->userRepo->refundBalance($order->buyer_id, $order->total_price);
        if (!$refundSuccess) {
            throw new Exception("Database error: Gagal melakukan refund saldo buyer.");
        }

        $updateSuccess = $this->orderRepo->updateStatus($order->order_id, 'rejected', $reason);
        if (!$updateSuccess) {
            throw new Exception("Database error: Gagal memperbarui status pesanan.");
        }

        return ['message' => "Pesanan #{$order->order_id} berhasil ditolak. Saldo buyer telah dikembalikan."];
    }

    private function handleSetDelivery(Order $order, string $delivery_time) {
        if ($order->status !== 'approved') {
            throw new Exception("Hanya pesanan 'approved' yang bisa diatur pengirimannya.");
        }
        if (empty($delivery_time)) {
            throw new Exception("Waktu pengiriman (delivery_time) wajib diisi.");
        }

        $success = $this->orderRepo->updateStatus($order->order_id, 'on_delivery', null, $delivery_time);
        if (!$success) {
            throw new Exception("Database error: Gagal mengatur pengiriman.");
        }
        return ['message' => "Pesanan #{$order->order_id} telah diatur untuk pengiriman."];
    }
}