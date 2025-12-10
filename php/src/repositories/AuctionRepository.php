<?php
namespace App\Repositories;

use App\Core\Database;
use PDO;

class AuctionRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function findPaginated(
        int $limit, 
        int $offset, 
        string $search = '', 
        string $status = 'active',
        string $sort = 'newest'
    ): array {
        $params = [];
        $where = "WHERE 1=1";

        // Status Filter
        if ($status === 'scheduled') {
            $where .= " AND a.status = 'scheduled'";
        } else {
             // Default to active/ongoing
             $where .= " AND a.status IN ('active', 'ongoing')";
        }

        // Search Filter (Product Name or Store Name)
        if (!empty($search)) {
            $where .= " AND (p.product_name ILIKE :search OR s.store_name ILIKE :search)";
            $params[':search'] = "%$search%";
        }

        // Sorting
        $orderBy = "ORDER BY a.created_at DESC"; // Default
        if ($sort === 'ending_soon') {
            $orderBy = "ORDER BY a.end_time ASC";
        } elseif ($sort === 'starting_soon') {
            $orderBy = "ORDER BY a.start_time ASC";
        }

        $sql = "SELECT 
                    a.*,
                    p.product_name,
                    p.main_image_path,
                    s.store_name,
                    s.store_id,
                    (SELECT COUNT(*) FROM auction_bids ab WHERE ab.auction_id = a.auction_id) as bidder_count
                FROM auctions a
                JOIN product p ON a.product_id = p.product_id
                JOIN store s ON p.store_id = s.store_id
                $where
                $orderBy
                LIMIT :limit OFFSET :offset";

        $params[':limit'] = $limit;
        $params[':offset'] = $offset;

        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $type = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
            $stmt->bindValue($key, $value, $type);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll(string $search = '', string $status = 'active'): int {
        $params = [];
        $where = "WHERE 1=1";

        if ($status === 'scheduled') {
            $where .= " AND a.status = 'scheduled'";
        } else {
             $where .= " AND a.status IN ('active', 'ongoing')";
        }

        if (!empty($search)) {
            $where .= " AND (p.product_name ILIKE :search OR s.store_name ILIKE :search)";
            $params[':search'] = "%$search%";
        }

        $sql = "SELECT COUNT(*) 
                FROM auctions a
                JOIN product p ON a.product_id = p.product_id
                JOIN store s ON p.store_id = s.store_id
                $where";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }
}
