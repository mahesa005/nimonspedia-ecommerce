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
            FROM "order" o
            JOIN "user" u ON u.user_id = o.buyer_id
            WHERE o.store_id = (SELECT s.store_id FROM "store" s WHERE s.user_id = :uid)
                AND (:from::date IS NULL OR o.created_at::date >= :from::date)
                AND (:to::date   IS NULL OR o.created_at::date <= :to::date)
                AND (:status::order_status IS NULL OR o.status = :status::order_status)
            ORDER BY o.created_at DESC';
        
        error_log("ExportRepository::iterOrdersBySeller - Query: {$sql}");
        error_log("ExportRepository::iterOrdersBySeller - Params: uid={$sellerUserId}, from={$from}, to={$to}, status={$status}");
        
        $st = $this->db->prepare($sql);
        $st->execute(['uid'=>$sellerUserId,'from'=>$from,'to'=>$to,'status'=>$status]);
        
        $rowCount = 0;
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            $rowCount++;
            error_log("ExportRepository::iterOrdersBySeller - Row {$rowCount}: " . json_encode($row));
            yield $row;
        }
        error_log("ExportRepository::iterOrdersBySeller - Total rows fetched: {$rowCount}");
    }

    public function iterProductsBySeller(int $sellerUserId): \Generator {
        $sql = '
            SELECT 
                p.product_id, 
                p.product_name, 
                p.price, 
                p.stock, 
                p.created_at,
                p.updated_at
            FROM "product" p
            WHERE p.store_id = (SELECT s.store_id FROM "store" s WHERE s.user_id = :uid)
              AND p.deleted_at IS NULL
            ORDER BY p.updated_at DESC';
        
        error_log("ExportRepository::iterProductsBySeller - Query: {$sql}");
        error_log("ExportRepository::iterProductsBySeller - Params: uid={$sellerUserId}");
        
        $st = $this->db->prepare($sql);
        $st->execute(['uid'=>$sellerUserId]);
        
        $rowCount = 0;
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            $rowCount++;
            error_log("ExportRepository::iterProductsBySeller - Row {$rowCount}: " . json_encode($row));
            yield $row;
        }
        error_log("ExportRepository::iterProductsBySeller - Total rows fetched: {$rowCount}");
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
            FROM "order" o
            WHERE o.store_id = (SELECT s.store_id FROM "store" s WHERE s.user_id = :uid)
              AND (:from::date IS NULL OR o.created_at::date >= :from::date)
              AND (:to::date   IS NULL OR o.created_at::date <= :to::date)
              AND o.status IN (\'received\')
            GROUP BY 1
            ORDER BY 1 DESC';
        
        error_log("ExportRepository::iterRevenueDaily - Query: {$sql}");
        error_log("ExportRepository::iterRevenueDaily - Params: uid={$sellerUserId}, from={$from}, to={$to}");
        
        $st = $this->db->prepare($sql);
        $st->execute(['uid'=>$sellerUserId,'from'=>$from,'to'=>$to]);
        
        $rowCount = 0;
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            $rowCount++;
            error_log("ExportRepository::iterRevenueDaily - Row {$rowCount}: " . json_encode($row));
            yield $row;
        }
        error_log("ExportRepository::iterRevenueDaily - Total rows fetched: {$rowCount}");
    }
}