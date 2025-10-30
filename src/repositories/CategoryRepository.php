<?php
namespace App\Repositories;

use App\Core\Database;
use App\Models\Category;
use PDO;

class CategoryRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            'SELECT category_id, name FROM category ORDER BY name ASC'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findAll(): array {
        $sql = 'SELECT * FROM category ORDER BY name ASC';
        $stmt = $this->db->query($sql);

        $categories = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categories[] = new Category($row);
        }
        return $categories;
    }

    public function findByProductId(int $product_id): array {
        $sql = 'SELECT c.* FROM "category" c
                JOIN "category_item" ci ON c.category_id = ci.category_id
                WHERE ci.product_id = ? 
                ORDER BY c.name';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$product_id]);
        $categories = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categories[] = new Category($row);
        }
        return $categories;
    }
}
