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

    public function getStoreOrders($store_id, $status = null, $search = null, $limit = 10, $offset = 0) {
        $sql = 'SELECT o.*, u.name as buyer_name 
                FROM "order" o
                JOIN "user" u ON o.buyer_id = u.user_id
                WHERE o.store_id = :store_id';
        
        if ($status) {
            $sql .= ' AND o.status = :status';
        }

        if ($search) {
            $sql .= ' AND (o.order_id::text LIKE :search OR u.name ILIKE :search)';
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

    public function countStoreOrders(int $store_id, ?string $status, ?string $search): int {
        $sql = 'SELECT COUNT(*) 
                FROM "order" o
                JOIN "user" u ON o.buyer_id = u.user_id
                WHERE o.store_id = :store_id';
        
        if ($status) {
            $sql .= ' AND o.status = :status';
        }

        if ($search) {
            $sql .= ' AND (o.order_id::text ILIKE :search OR u.name ILIKE :search)';
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

     public function updateStatus(int $order_id, string $new_status, ?string $reject_reason = null, ?string $delivery_time = null): bool {
        try {
            $this->db->beginTransaction();

            $orderSql = 'SELECT store_id, total_price, status FROM "order" WHERE order_id = :order_id';
            $orderStmt = $this->db->prepare($orderSql);
            $orderStmt->bindValue(':order_id', $order_id, PDO::PARAM_INT);
            $orderStmt->execute();
            $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                $this->db->rollBack();
                return false;
            }

            $sql = 'UPDATE "order" SET status = :status';
            
            if ($reject_reason !== null) {
                $sql .= ', reject_reason = :reject_reason';
            }
            
            if ($delivery_time !== null) {
                $sql .= ', delivery_time = :delivery_time';
            }
            
            $sql .= ' WHERE order_id = :order_id';
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':status', $new_status, PDO::PARAM_STR);
            $stmt->bindValue(':order_id', $order_id, PDO::PARAM_INT);
            
            if ($reject_reason !== null) {
                $stmt->bindValue(':reject_reason', $reject_reason, PDO::PARAM_STR);
            }
            
            if ($delivery_time !== null) {
                $stmt->bindValue(':delivery_time', $delivery_time, PDO::PARAM_STR);
            }
            
            $success = $stmt->execute();

            if (!$success) {
                $this->db->rollBack();
                return false;
            }

            if ($new_status === 'received' && $order['status'] !== 'received') {
                $balanceSql = 'UPDATE "store" 
                              SET balance = balance + :amount 
                              WHERE store_id = :store_id';
                
                $balanceStmt = $this->db->prepare($balanceSql);
                $balanceStmt->bindValue(':amount', $order['total_price'], PDO::PARAM_STR);
                $balanceStmt->bindValue(':store_id', $order['store_id'], PDO::PARAM_INT);
                
                $balanceUpdated = $balanceStmt->execute();
                
                if (!$balanceUpdated) {
                    $this->db->rollBack();
                    error_log("Failed to update store balance for order #$order_id");
                    return false;
                }

                error_log("Store #{$order['store_id']} balance updated +{$order['total_price']} from order #$order_id");
            }

            $this->db->commit();
            return true;

        } catch (\PDOException $e) {
            $this->db->rollBack();
            error_log("Database error (updateStatus): " . $e->getMessage());
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

    public function getTotalRevenueByStoreId($store_id): ?int {
        $sql = 'SELECT balance FROM "store" WHERE store_id = :store_id';
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['store_id' => $store_id]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? (int) $result['balance'] : null;
        } catch (PDOException $e) {
            error_log("Database error (getTotalRevenueByStoreId): " . $e->getMessage());
            return null;
        }
    }
}
