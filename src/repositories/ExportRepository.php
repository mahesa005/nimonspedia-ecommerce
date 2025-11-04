<?php
namespace App\Repositories;

use App\Core\Database;
use PDO;

class ExportRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function iterOrdersBySeller(int $sellerUserId, ?string $from, ?string $to, ?string $status): \Generator {
        $sql = '
            SELECT 
                o.order_id,
                o.created_at AS order_date,
                u.name       AS buyer_name,
                o.status,
                o.total_price
            FROM "Order" o
            JOIN "User" u ON u.user_id = o.buyer_id
            WHERE o.store_id = (SELECT s.store_id FROM store s WHERE s.user_id = :uid)
              AND (:from IS NULL OR o.created_at::date >= CAST(:from AS date))
              AND (:to   IS NULL OR o.created_at::date <= CAST(:to   AS date))
              AND (:status IS NULL OR o.status = :status)
            ORDER BY o.created_at DESC';
        $st = $this->db->prepare($sql);
        $st->execute([
            'uid'    => $sellerUserId,
            'from'   => $from,
            'to'     => $to,
            'status' => $status
        ]);
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            yield $row;
        }
    }

    public function iterProductsBySeller(int $sellerUserId): \Generator {
        $sql = '
            SELECT 
                p.product_id, 
                p.product_name, 
                c.category_name, 
                p.price, 
                p.stock, 
                p.status, 
                p.updated_at
            FROM "Product" p
            LEFT JOIN "Category" c ON c.category_id = p.category_id
            WHERE p.store_id = (SELECT s.store_id FROM store s WHERE s.user_id = :uid)
            ORDER BY p.updated_at DESC';
        $st = $this->db->prepare($sql);
        $st->execute(['uid' => $sellerUserId]);
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            yield $row;
        }
    }

    public function iterRevenueDaily(int $sellerUserId, ?string $from, ?string $to): \Generator {
        $sql = '
            SELECT
              o.created_at::date AS date,
              COUNT(*)           AS total_orders,
              COALESCE(SUM(o.total_price), 0) AS total_revenue,
              CASE 
                WHEN COUNT(*) = 0 THEN 0 
                ELSE ROUND(COALESCE(SUM(o.total_price),0)::numeric / COUNT(*), 2) 
              END AS avg_order_value
            FROM "Order" o
            WHERE o.store_id = (SELECT s.store_id FROM store s WHERE s.user_id = :uid)
              AND (:from IS NULL OR o.created_at::date >= CAST(:from AS date))
              AND (:to   IS NULL OR o.created_at::date <= CAST(:to   AS date))
              AND o.status IN (\'delivered\', \'received\')
            GROUP BY 1
            ORDER BY 1 DESC';
        $st = $this->db->prepare($sql);
        $st->execute([
            'uid'  => $sellerUserId,
            'from' => $from,
            'to'   => $to
        ]);
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            yield $row;
        }
    }
}
