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

    public function findById(int $product_id): ?Product {
        $sql = 'SELECT p.*, s.store_name
                FROM "product" p 
                LEFT JOIN "store" s ON p.store_id = s.store_id 
                WHERE p.product_id = ? AND p.deleted_at IS NULL';
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$product_id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($data) {
                $product = new Product($data);
                if (property_exists($product, 'store_name')) {
                    $product->store_name = $data['store_name'];
                }
                return $product;
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error finding product by ID $product_id: " . $e->getMessage());
        }
    }
    /**
     * Get products by store ID with filters
     */
    public function getByStoreId(
        int $storeId,
        ?string $search = null,
        ?int $categoryId = null,
        string $sortBy = 'product_name',
        string $sortOrder = 'ASC',
        int $limit = 100
    ): array {
        $sql = "
            SELECT DISTINCT
                p.product_id,
                p.store_id,
                p.product_name,
                p.description,
                p.price,
                p.stock,
                p.main_image_path,
                p.created_at,
                p.updated_at,
                STRING_AGG(c.name, ', ' ORDER BY c.name) as category_names
            FROM product p
            LEFT JOIN category_item ci ON p.product_id = ci.product_id
            LEFT JOIN category c ON ci.category_id = c.category_id
            WHERE p.store_id = :store_id
            AND p.deleted_at IS NULL
        ";

        $params = ['store_id' => $storeId];

        if ($search) {
            $sql .= " AND p.product_name ILIKE :search";
            $params['search'] = '%' . $search . '%';
        }

        if ($categoryId) {
            $sql .= " AND ci.category_id = :category_id";
            $params['category_id'] = $categoryId;
        }

        $allowedSortColumns = ['product_name', 'price', 'stock', 'created_at'];
        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'product_name';
        }

        $sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';
        $sql .= " GROUP BY p.product_id ";
        $sql .= " ORDER BY p.$sortBy $sortOrder LIMIT :limit";

        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function create(array $data): int {
        try {
            $this->db->beginTransaction();

            // Insert into product table (NO category_id column!)
            $stmt = $this->db->prepare("
                INSERT INTO product (
                    store_id, 
                    product_name, 
                    description, 
                    price, 
                    stock,
                    main_image_path,
                    created_at,
                    updated_at
                ) VALUES (
                    :store_id,
                    :product_name,
                    :description,
                    :price,
                    :stock,
                    :main_image_path,
                    NOW(),
                    NOW()
                )
                RETURNING product_id
            ");

            $stmt->execute([
                'store_id' => $data['store_id'],
                'product_name' => $data['product_name'],
                'description' => $data['description'],
                'price' => $data['price'],
                'stock' => $data['stock'],
                'main_image_path' => $data['main_image_path'] ?? null
            ]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $productId = (int) $result['product_id'];


            if (isset($data['category_id']) && !empty($data['category_id'])) {
                $stmtCategory = $this->db->prepare("
                    INSERT INTO category_item (category_id, product_id)
                    VALUES (:category_id, :product_id)
                ");

                $stmtCategory->execute([
                    'category_id' => (int) $data['category_id'],
                    'product_id' => $productId
                ]);
            }

            $this->db->commit();
            return $productId;

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Get product by ID and store ID
     */
    public function getByIdAndStoreId(int $productId, int $storeId): ?array {
        $stmt = $this->db->prepare("
            SELECT 
                p.*,
                ci.category_id,
                c.name as category_name
            FROM product p
            LEFT JOIN category_item ci ON p.product_id = ci.product_id
            LEFT JOIN category c ON ci.category_id = c.category_id
            WHERE p.product_id = :product_id 
            AND p.store_id = :store_id
            AND p.deleted_at IS NULL
        ");

        $stmt->execute([
            'product_id' => $productId,
            'store_id' => $storeId
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function update(int $productId, int $storeId, array $data): bool {
        try {
            $this->db->beginTransaction();

            // Update product table (NO category_id!)
            $stmt = $this->db->prepare("
                UPDATE product 
                SET 
                    product_name = :product_name,
                    description = :description,
                    price = :price,
                    stock = :stock,
                    main_image_path = :main_image_path,
                    updated_at = NOW()
                WHERE product_id = :product_id 
                AND store_id = :store_id
                AND deleted_at IS NULL
            ");

            $stmt->execute([
                'product_id' => $productId,
                'store_id' => $storeId,
                'product_name' => $data['product_name'],
                'description' => $data['description'],
                'price' => $data['price'],
                'stock' => $data['stock'],
                'main_image_path' => $data['main_image_path'] ?? null
            ]);

            if (isset($data['category_id']) && !empty($data['category_id'])) {
                // Delete old category relations
                $stmtDelete = $this->db->prepare("
                    DELETE FROM category_item 
                    WHERE product_id = :product_id
                ");
                $stmtDelete->execute(['product_id' => $productId]);

                // Insert new category relation
                $stmtInsert = $this->db->prepare("
                    INSERT INTO category_item (category_id, product_id)
                    VALUES (:category_id, :product_id)
                ");
                $stmtInsert->execute([
                    'category_id' => (int) $data['category_id'],
                    'product_id' => $productId
                ]);
            }

            $this->db->commit();
            return true;

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Soft delete product
     */
    public function softDelete(int $productId, int $storeId): bool {
        $stmt = $this->db->prepare("
            UPDATE product 
            SET deleted_at = NOW()
            WHERE product_id = :product_id 
            AND store_id = :store_id
        ");

        return $stmt->execute([
            'product_id' => $productId,
            'store_id' => $storeId
        ]);
    }

    /**
     * Hard delete product
     */
    public function hardDelete(int $productId, int $storeId): bool {
        try {
            $this->db->beginTransaction();

            // Delete from category_item first (foreign key constraint)
            $stmtCategory = $this->db->prepare("
                DELETE FROM category_item 
                WHERE product_id = :product_id
            ");
            $stmtCategory->execute(['product_id' => $productId]);

            // Delete product
            $stmt = $this->db->prepare("
                DELETE FROM product 
                WHERE product_id = :product_id 
                AND store_id = :store_id
            ");
            $stmt->execute([
                'product_id' => $productId,
                'store_id' => $storeId
            ]);

            $this->db->commit();
            return true;

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Count products by store ID
     */
    public function countByStoreId(int $storeId): int {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total 
            FROM product 
            WHERE store_id = :store_id 
            AND deleted_at IS NULL
        ");

        $stmt->execute(['store_id' => $storeId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return (int) $result['total'];
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
        string $sort_order = 'DESC',
        ?int $store_id = null
    ): array {
        $params = [];
        $sql = 'SELECT p.*, s.store_name 
                FROM product p 
                JOIN store s ON p.store_id = s.store_id';
        
        if (!empty($category_ids)) {
             $sql .= ' JOIN category_item ci ON p.product_id = ci.product_id';
        }
        
        $sql .= ' WHERE p.deleted_at IS NULL';


        if (!is_null($store_id)) {
            $sql .= ' AND p.store_id = ?';
            $params[] = $store_id;
        }

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
        ?int $max_price = null,
        ?int $store_id = null
    ): int {
        $params = [];
        $sql = 'SELECT COUNT(DISTINCT p.product_id)
                FROM product p';
        if (!empty($category_ids)) {
             $sql .= ' JOIN category_item ci ON p.product_id = ci.product_id';
        }
        $sql .= ' WHERE p.deleted_at IS NULL';

        if (!is_null($store_id)) {
            $sql .= ' AND p.store_id = ?';
            $params[] = $store_id;
        }

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

    public function countUniqueProducts(int $store_id): ?int {
        $sql = 'SELECT COUNT(product_id) 
                FROM Product 
                WHERE store_id = :store_id 
                AND deleted_at IS NULL';

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['store_id' => $store_id]);
            $count = $stmt->fetchColumn();

            return $count !== false ? (int)$count : null;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return null;
        }
    }

    public function countLowStockProducts(int $store_id, int $threshold): ?int {
        $sql = 'SELECT COUNT(product_id) 
                FROM Product 
                WHERE store_id = :store_id 
                AND stock < :threshold 
                AND deleted_at IS NULL';

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'store_id' => $store_id,
                'threshold' => $threshold
            ]);

            $count = $stmt->fetchColumn();
            return $count !== false ? (int)$count : null;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return null;
        }
    }

    public function getStock(int $product_id): int {
        $sql = 'SELECT stock FROM "product" WHERE product_id = ? FOR UPDATE';
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$product_id]);
            $stock = $stmt->fetchColumn();
            
            if ($stock === false) {
                throw new PDOException("Produk dengan ID $product_id tidak ditemukan saat mengambil stok.");
            }
            return (int) $stock;

        } catch (PDOException $e) {
            error_log("ProductRepository::getStock Gagal: " . $e->getMessage());
            throw $e;
        }
    }

    public function reduceStock(int $product_id, int $quantity): bool {
        $sql = 'UPDATE "product" SET stock = stock - ? WHERE product_id = ?';
        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$quantity, $product_id]) && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("ProductRepository::reduceStock Gagal: " . $e->getMessage());
            throw $e;
        }
    }
}