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

    public function getStoreOrders($store_id, $status = nul, $search = null, $limit = 10, $offset = 0) {
        $sql = 'SELECT o.*, u.name as buyer_name 
                FROM "order" o
                JOIN "user" u ON o.buyer_id = u.user_id
                WHERE o.store_id = :store_id';
        
        if ($status) {
            $sql .= ' AND o.status = :status';
        }

        if ($search) {
            $sql .= 'AND (o.order_id::text LIKE :search OR u.name ILIKE :search)';
        }

        $sql .= ' ORDER BY o.created_at DESC
                  LIMIT :limit OFFSET :offset';
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':store_id', $store_id, PDO::PARAM_INT);
            
            if ($status) {
                $stmt->bindValue(':status', $status, PDO::PARAM_STR);
            }

            if ($search) {
                $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
            }

            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

            $stmt->execute();
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $orders;
        } catch (PDOException $e) {
            error_log("Database error (getStoreOrders): " . $e->getMessage());
            return [];
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

    public function countStoreOrders(int $store_id, ?string $status, ?string $search) {
        $sql = 'SELECT COUNT(*) 
                FROM "order" o
                JOIN "user" u ON o.buyer_id = u.user_id
                WHERE o.store_id = :store_id';
        
        if ($status) {
            $sql .= ' AND o.status = :status';
        }

        if ($search) {
            $sql .= ' AND (o.order_id::text LIKE :search OR u.name ILIKE :search)';
        }

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':store_id', $store_id, PDO::PARAM_INT);
            
            if ($status) {
                $stmt->bindValue(':status', $status, PDO::PARAM_STR);
            }

            if ($search) {
                $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
            }

            $stmt->execute();
            return (int) $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Database error (countStoreOrders): " . $e->getMessage());
            return 0;
        }
    }

    public function getOrderByIdAndStore(int $order_id, int $store_id) {
        $sql = 'SELECT * FROM "order" 
                WHERE order_id = :order_id 
                AND store_id = :store_id';
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'order_id' => $order_id,
                'store_id' => $store_id
            ]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            return $data ? new Order($data) : null;
        } catch (PDOException $e) {
            error_log("Database error (getOrderByIdAndStore): " . $e->getMessage());
            return null;
        }   
    }

    public function updateStatusSeller(int $order_id, string $new_status, ?string $reject_reason = null, ?string $delivery_time = null) {
        $params = [':order_id' => $order_id];
        
        if ($new_status === 'approved') {
            $sql = 'UPDATE "order" SET status = \'approved\', confirmed_at = NOW() 
                    WHERE order_id = :order_id';
        } 
        elseif ($new_status === 'rejected') {
            $sql = 'UPDATE "order" SET status = \'rejected\', confirmed_at = NOW(), reject_reason = :reason 
                    WHERE order_id = :order_id';
            $params[':reason'] = $reject_reason;
        } 
        elseif ($new_status === 'on_delivery') {
            $sql = 'UPDATE "order" SET status = \'on_delivery\', delivery_time = :delivery_time 
                    WHERE order_id = :order_id';
            $params[':delivery_time'] = $delivery_time;
        } 
        else {
            return false; 
        }

        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute($params); 
        } catch (PDOException $e) {
            error_log("Error in updateStatus: " . $e->getMessage());
            return false; 
        }
    }

    public function getOrderItems(int $order_id) {
        try {
            $sql = 'SELECT oi.*, p.product_name, p.main_image_path 
                    FROM "order_items" oi
                    JOIN "product" p ON oi.product_id = p.product_id
                    WHERE oi.order_id = :order_id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':order_id' => $order_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log("Error in getOrderItems: " . $e->getMessage());
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

            $returnStockSql = '
                UPDATE product
                SET stock = stock + oi.quantity
                FROM order_items oi
                WHERE oi.product_id = product.product_id
                AND oi.order_id = :order_id
            ';

            $returnStockStmt = $this->db->prepare($returnStockSql);
            $returnStockStmt->execute(['order_id' => $order_id]);

            error_log("Stock returned for order_id: {$order_id}");

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
