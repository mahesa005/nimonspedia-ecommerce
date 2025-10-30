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
}
