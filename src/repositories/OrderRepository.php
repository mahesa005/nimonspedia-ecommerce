<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\Order;
use App\Models\Store;
use PDO;
use PDOException;

class OrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function countPendingOrders(int $store_id): ?int {
        $sql = 'SELECT COUNT(order_id)
                FROM "order"
                WHERE store_id = :store_id
                AND status = \'waiting_approval\'';

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['store_id' => $store_id]);

            $count = $stmt->fetchColumn();
            return $count !== false ? (int)$count : null;
        } catch (PDOException $e) {
            error_log("Database error (countPendingOrders): " . $e->getMessage());
            return null;
        }
    }

    public function create(int $buyer_id, int $store_id, int $total_price, string $shipping_address): int {
        $sql = 'INSERT INTO "order" (buyer_id, store_id, total_price, shipping_address, created_at)
                VALUES (?, ?, ?, ?, NOW())
                RETURNING order_id';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $buyer_id,
                $store_id,
                $total_price,
                $shipping_address
            ]);
            
            return (int) $stmt->fetchColumn(); 

        } catch (PDOException $e) {
            error_log("OrderRepository::create Gagal: " . $e->getMessage());
            throw $e;
        }
    }

    public function findById(int $order_id): ?Order {
        $sql = 'SELECT * FROM "order" WHERE order_id = :order_id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['order_id' => $order_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new Order($data) : null;
    }

    public function findOrdersByBuyerId(int $buyer_id, ?string $status_filter = null): array {
        $params = ['buyer_id' => $buyer_id];
        $sql = 'SELECT 
                    o.order_id, o.buyer_id, o.store_id, o.total_price, 
                    o.shipping_address, o.status, o.created_at, o.received_at,
                    s.store_id AS s_store_id,
                    s.user_id AS s_user_id,
                    s.store_name AS s_store_name,
                    s.store_description AS s_store_description,
                    s.store_logo_path AS s_store_logo_path,
                    s.created_at AS s_created_at
                FROM "order" o
                JOIN "store" s ON o.store_id = s.store_id
                WHERE o.buyer_id = :buyer_id';

        if ($status_filter) {
            $sql .= ' AND o.status = :status';
            $params['status'] = $status_filter;
        }

        $sql .= ' ORDER BY o.created_at DESC';

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            $orders = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $orderData = [
                    'order_id' => $row['order_id'],
                    'buyer_id' => $row['buyer_id'],
                    'store_id' => $row['store_id'],
                    'total_price' => $row['total_price'],
                    'shipping_address' => $row['shipping_address'],
                    'status' => $row['status'],
                    'created_at' => $row['created_at'],
                    'received_at' => $row['received_at']
                ];

                $storeData = [
                    'store_id' => $row['s_store_id'],
                    'user_id' => $row['s_user_id'],
                    'store_name' => $row['s_store_name'],
                    'store_description' => $row['s_store_description'] ?? '',
                    'store_logo_path' => $row['s_store_logo_path'],
                    'created_at' => $row['s_created_at']
                ];

                $order = new Order($orderData);
                $order->store = new Store($storeData);
                $orders[] = $order;
            }
            return $orders;
        } catch (PDOException $e) {
            error_log("Error fetching buyer orders: " . $e->getMessage());
            return [];
        }
    }

    public function updateStatus(int $order_id, string $new_status, int $buyer_id): bool {
        try {
            error_log("OrderRepository::updateStatus - order_id: {$order_id}, status: {$new_status}, buyer_id: {$buyer_id}");
            
            $allowedStatuses = ['waiting_approval', 'on_delivery', 'received', 'rejected'];
            if (!in_array($new_status, $allowedStatuses)) {
                error_log("Invalid status: {$new_status}");
                throw new \Exception("Status tidak valid: {$new_status}");
            }

            $sql = 'UPDATE "order" 
                    SET status = CAST(:status AS order_status)';

            if ($new_status === 'received') {
                $sql .= ', received_at = NOW()';
            }
            
            $sql .= ' WHERE order_id = :order_id AND buyer_id = :buyer_id';

            error_log("SQL: {$sql}");

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                'status' => $new_status,
                'order_id' => $order_id,
                'buyer_id' => $buyer_id
            ]);

            $rowCount = $stmt->rowCount();
            error_log("Rows affected: {$rowCount}");

            return $result && $rowCount > 0;

        } catch (PDOException $e) {
            error_log("PDOException in updateStatus: " . $e->getMessage());
            throw $e;
        } catch (\Exception $e) {
            error_log("Exception in updateStatus: " . $e->getMessage());
            throw $e;
        }
    }

    public function cancelOrder(int $order_id, int $buyer_id): bool {
        try {
            error_log("OrderRepository::cancelOrder - order_id: {$order_id}, buyer_id: {$buyer_id}");
            
            $this->db->beginTransaction();

            $order = $this->findById($order_id);
            if (!$order) {
                throw new \Exception("Order tidak ditemukan");
            }
            
            if ($order->buyer_id !== $buyer_id) {
                throw new \Exception("Order bukan milik Anda");
            }

            error_log("Order found - status: {$order->status}, total: {$order->total_price}");

            if ($order->status !== 'waiting_approval') {
                throw new \Exception("Order dengan status {$order->status} tidak dapat dibatalkan");
            }

            $updateSql = 'UPDATE "order" 
                         SET status = CAST(:status AS order_status)
                         WHERE order_id = :order_id AND buyer_id = :buyer_id';
            
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->execute([
                'status' => 'rejected',
                'order_id' => $order_id,
                'buyer_id' => $buyer_id
            ]);

            if ($updateStmt->rowCount() === 0) {
                throw new \Exception("Gagal update status order");
            }

            error_log("Order status updated to rejected");

            $refundSql = 'UPDATE "user" 
                         SET balance = balance + :amount 
                         WHERE user_id = :buyer_id';
            
            $refundStmt = $this->db->prepare($refundSql);
            $refundStmt->execute([
                'amount' => $order->total_price,
                'buyer_id' => $buyer_id
            ]);

            error_log("Balance refunded: " . $order->total_price);

            $this->db->commit();
            error_log("Transaction committed successfully");
            return true;

        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Transaction rolled back: " . $e->getMessage());
            throw $e;
        }
    }
}
