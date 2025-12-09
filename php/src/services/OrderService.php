<?php
namespace App\Services;

use App\Repositories\OrderRepository;
use App\Repositories\OrderItemRepository;
use App\Repositories\UserRepository;
use App\Repositories\StoreRepository;

require_once __DIR__ . '/../util/notification_helper.php';

class OrderService {
    
    private OrderRepository $orderRepo;
    private OrderItemRepository $orderItemRepo;
    private UserRepository $userRepo;
    private StoreRepository $storeRepo;

    public function __construct() {
        $this->orderRepo = new OrderRepository();
        $this->orderItemRepo = new OrderItemRepository();
        $this->userRepo = new UserRepository();
        $this->storeRepo = new StoreRepository();
    }

    public function getBuyerHistory(int $buyer_id, ?string $status_filter = null): array {
        $orders = $this->orderRepo->findOrdersByBuyerId($buyer_id, $status_filter);
        
        foreach ($orders as $order) {
            $order->items = $this->orderItemRepo->findByOrderId($order->order_id);
        }
        
        return $orders;
    }

    public function updateOrderStatus($order_id, $new_status, $buyer_id): array {
        try {
            $order_id = (int) $order_id;
            $buyer_id = (int) $buyer_id;
            $new_status = (string) $new_status;

            error_log("OrderService::updateOrderStatus - order_id: {$order_id}, status: {$new_status}, buyer_id: {$buyer_id}");

            $allowedStatuses = ['received', 'rejected'];
            if (!in_array($new_status, $allowedStatuses)) {
                return [
                    'success' => false,
                    'message' => 'Status tidak valid'
                ];
            }

            if ($new_status === 'rejected') {
                $result = $this->orderRepo->cancelOrder($order_id, $buyer_id);
                
                if ($result) {
                    $user = $this->userRepo->findById($buyer_id);
                    if ($user && isset($_SESSION['user'])) {
                        $_SESSION['user']['balance'] = $user->balance;
                    }

                    $order = $this->orderRepo->findById($order_id);
                    if ($order) {
                            $userId = $this->storeRepo->getUserIdByStoreId($order->store_id);
                            
                            if ($userId) {
                                sendPushNotification(
                                    $userId,
                                    "Pesanan Dibatalkan",
                                    "Pembeli telah membatalkan pesanan #{$order_id}.",
                                    "/seller/orders"
                                );
                            }
                    }

                    return [
                        'success' => true,
                        'message' => 'Pesanan berhasil dibatalkan dan saldo dikembalikan'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Gagal membatalkan pesanan'
                    ];
                }
            }

            $result = $this->orderRepo->updateStatus($order_id, $new_status, $buyer_id);
            
            if ($result) {
                $order = $this->orderRepo->findById($order_id);
                if ($order) {
                        $userId = $this->storeRepo->getUserIdByStoreId($order->store_id);
                        
                        if ($userId) {
                            sendPushNotification(
                                $userId,
                                "Pesanan Diterima",
                                "Pembeli telah menerima pesanan #{$order_id}.",
                                "/seller/orders"
                            );
                        }
                }
                return [
                    'success' => true,
                    'message' => 'Status pesanan berhasil diperbarui'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Gagal memperbarui status pesanan'
                ];
            }

        } catch (\Exception $e) {
            error_log("OrderService::updateOrderStatus error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}