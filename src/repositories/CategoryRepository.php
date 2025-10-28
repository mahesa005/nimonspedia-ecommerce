<?php
namespace App\Repositories;

use App\Core\Database;
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
}
