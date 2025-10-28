<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\Product;
use PDO;

class ProductRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function findAllVisible(): array {
        $sql = 'SELECT * FROM product WHERE deleted_at IS NULL ORDER BY created_at DESC';
        $stmt = $this->db->query($sql);

        $products = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $products[] = new Product($row);
        }
        return $products;
    }

    public function findPaginated(
        int $limit, 
        int $offset, 
        string $search = '', 
        array $category_ids = [], 
        ?int $min_price = null, 
        ?int $max_price = null,
        string $sort_by = 'created_at',
        string $sort_order = 'DESC'
    ): array {
        $params = [];
        $sql = 'SELECT p.*, s.store_name 
                FROM product p 
                JOIN store s ON p.store_id = s.store_id';
        
        if (!empty($category_ids)) {
             $sql .= ' JOIN category_item ci ON p.product_id = ci.product_id';
        }
        
        $sql .= ' WHERE p.deleted_at IS NULL';

        if (!empty($search)) {
            $sql .= ' AND p.product_name ILIKE ?'; 
            $params[] = '%' . $search . '%';
        }
        if (!empty($category_ids)) {
            $placeholders = implode(',', array_fill(0, count($category_ids), '?'));
            $sql .= " AND ci.category_id IN ($placeholders)";
            $params = array_merge($params, $category_ids);
        }
        if (!is_null($min_price)) {
            $sql .= ' AND p.price >= ?';
            $params[] = $min_price;
        }
        if (!is_null($max_price)) {
            $sql .= ' AND p.price <= ?';
            $params[] = $max_price;
        }

        $allowed_sort_columns = ['created_at', 'price'];
        if (!in_array($sort_by, $allowed_sort_columns)) {
            $sort_by = 'created_at';
        }

        $sort_order = strtoupper($sort_order) === 'ASC' ? 'ASC' : 'DESC';

        $sql .= " ORDER BY p.\"$sort_by\" $sort_order LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $products = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $product = new Product($row);
            $product->store_name = $row['store_name']; 
            $products[] = $product;
        }
        return $products;
    }

    public function countAllVisible(
        string $search = '', 
        array $category_ids = [], 
        ?int $min_price = null, 
        ?int $max_price = null
    ): int {
        $params = [];
        $sql = 'SELECT COUNT(DISTINCT p.product_id)
                FROM product p';
        if (!empty($category_ids)) {
             $sql .= ' JOIN category_item ci ON p.product_id = ci.product_id';
        }
        $sql .= ' WHERE p.deleted_at IS NULL';

        if (!empty($search)) {
            $sql .= ' AND p.product_name ILIKE ?';
            $params[] = '%' . $search . '%';
        }
        if (!empty($category_ids)) {
            $placeholders = implode(',', array_fill(0, count($category_ids), '?'));
            $sql .= " AND ci.category_id IN ($placeholders)";
            $params = array_merge($params, $category_ids);
        }
        if (!is_null($min_price)) {
            $sql .= ' AND p.price >= ?';
            $params[] = $min_price;
        }
        if (!is_null($max_price)) {
            $sql .= ' AND p.price <= ?';
            $params[] = $max_price;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }
}