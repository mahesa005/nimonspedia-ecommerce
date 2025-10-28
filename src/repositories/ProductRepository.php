<?php
namespace App\Repositories;

use App\Core\Database;
use PDO;

class ProductRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Get products by store with filters, search, sort
     */
    public function getByStoreId(
        int $storeId,
        ?string $search = null,
        ?int $categoryId = null,
        ?string $sortBy = 'product_name',
        string $sortOrder = 'ASC',
        int $limit = 100
    ): array {
        // whitelist sorting
        $allowedSort = ['product_name', 'price', 'stock', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSort, true) ? $sortBy : 'product_name';
        $sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

        $sql = "SELECT 
                    p.product_id,
                    p.product_name,
                    p.description,
                    p.price,
                    p.stock,
                    p.created_at,
                    p.updated_at,
                    p.main_image_path,
                    COALESCE(string_agg(DISTINCT c.name, ', '), '') AS category_names
                FROM product p
                LEFT JOIN category_item ci ON ci.product_id = p.product_id
                LEFT JOIN category c ON c.category_id = ci.category_id
                WHERE p.store_id = :store_id
                AND p.deleted_at IS NULL";

        $params = ['store_id' => $storeId];

        if ($search) {
            $sql .= " AND LOWER(p.product_name) LIKE LOWER(:search)";
            $params['search'] = "%$search%";
        }

        if ($categoryId) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM category_item ci2
                WHERE ci2.product_id = p.product_id
                AND ci2.category_id = :category_id
            )";
            $params['category_id'] = $categoryId;
        }

        // GROUP BY semua kolom non-aggregat
        $sql .= " GROUP BY 
                    p.product_id, p.product_name, p.description, p.price, p.stock, 
                    p.created_at, p.updated_at, p.main_image_path
                ORDER BY p.$sortBy $sortOrder
                LIMIT :limit";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(":$k", $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    /**
     * Get product by ID (with store validation)
     */
    public function getByIdAndStoreId(int $productId, int $storeId): ?array {
        $stmt = $this->db->prepare(
            "SELECT 
                p.*,
                COALESCE(string_agg(DISTINCT c.name, ', '), '') AS category_names
            FROM product p
            LEFT JOIN category_item ci ON ci.product_id = p.product_id
            LEFT JOIN category c ON c.category_id = ci.category_id
            WHERE p.product_id = :product_id 
            AND p.store_id = :store_id
            AND p.deleted_at IS NULL
            GROUP BY p.product_id"
        );
        $stmt->execute([
            'product_id' => $productId,
            'store_id' => $storeId
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    /**
     * Soft delete product
     */
    public function softDelete(int $productId, int $storeId): bool {
        // Check if product has pending orders
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) as count
             FROM order_item oi
             JOIN \"order\" o ON oi.order_id = o.order_id
             WHERE oi.product_id = :product_id
             AND o.status IN ('waiting_approval', 'approved', 'on_delivery')"
        );
        $stmt->execute(['product_id' => $productId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result['count'] > 0) {
            throw new \Exception('Cannot delete product with pending orders');
        }

        // Soft delete
        $stmt = $this->db->prepare(
            "UPDATE product 
             SET deleted_at = NOW() 
             WHERE product_id = :product_id 
             AND store_id = :store_id
             AND deleted_at IS NULL"
        );
        
        return $stmt->execute([
            'product_id' => $productId,
            'store_id' => $storeId
        ]);
    }

    /**
     * Hard delete product (use with caution)
     */
    public function hardDelete(int $productId, int $storeId): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM product 
             WHERE product_id = :product_id 
             AND store_id = :store_id"
        );
        
        return $stmt->execute([
            'product_id' => $productId,
            'store_id' => $storeId
        ]);
    }

    /**
     * Count products by store
     */
    public function countByStoreId(int $storeId): int {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) as count 
             FROM product 
             WHERE store_id = :store_id 
             AND deleted_at IS NULL"
        );
        $stmt->execute(['store_id' => $storeId]);
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    /**
     * Create product
     */
    public function create(array $data): int {
        $stmt = $this->db->prepare(
            "INSERT INTO product (
                store_id, product_name, description, price, stock
            ) VALUES (
                :store_id, :product_name, :description, :price, :stock
            ) RETURNING product_id"
        );

        $stmt->execute([
            'store_id' => $data['store_id'],
            'product_name' => $data['product_name'],
            'description' => $data['description'],
            'price' => $data['price'],
            'stock' => $data['stock'],
        ]);

        $productId = (int) $stmt->fetch(PDO::FETCH_ASSOC)['product_id'];

        // jika form kirim 1 kategori: $data['category_id']
        if (!empty($data['category_id'])) {
            $this->setCategories($productId, [$data['category_id']]);
        }
        // kalau multiple: kirim array category_ids dan langsung setCategories

        return $productId;
    }

    public function update(int $productId, int $storeId, array $data): bool {
        $stmt = $this->db->prepare(
            "UPDATE product 
            SET product_name = :product_name,
                description = :description,
                price = :price,
                stock = :stock
            WHERE product_id = :product_id 
            AND store_id = :store_id
            AND deleted_at IS NULL"
        );

        $ok = $stmt->execute([
            'product_id' => $productId,
            'store_id' => $storeId,
            'product_name' => $data['product_name'],
            'description' => $data['description'],
            'price' => $data['price'],
            'stock' => $data['stock'],
        ]);

        if ($ok && array_key_exists('category_ids', $data)) {
            $this->setCategories($productId, $data['category_ids']);
        } elseif ($ok && array_key_exists('category_id', $data)) {
            $this->setCategories($productId, [$data['category_id']]);
        }

        return $ok;
    }

    private function setCategories(int $productId, array $categoryIds): void {
        // bersihkan dulu
        $del = $this->db->prepare("DELETE FROM category_item WHERE product_id = :pid");
        $del->execute(['pid' => $productId]);

        if (empty($categoryIds)) return;

        $sql = "INSERT INTO category_item (category_id, product_id) VALUES ";
        $vals = [];
        $params = [];
        foreach ($categoryIds as $i => $cid) {
            $vals[] = "(:c$i, :p$i)";
            $params["c$i"] = (int)$cid;
            $params["p$i"] = $productId;
        }
        $sql .= implode(", ", $vals);
        $ins = $this->db->prepare($sql);
        $ins->execute($params);
    }

}