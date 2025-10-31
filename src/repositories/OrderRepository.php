<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\Order;
use PDO;
use PDOException;

class OrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function countPendingOrders(int $store_id): ?int {
        $sql = 'SELECT COUNT(order_id)
                FROM "Order"
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

    public function updateStatus(int $order_id, string $new_status, ?string $reject_reason = null, ?string $delivery_time = null) {
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
}
