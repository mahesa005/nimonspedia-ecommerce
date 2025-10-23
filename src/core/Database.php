<?php
namespace App\Core;

use PDO;

class Database {
    private static ?PDO $instance = null;

    private function __construct() {}

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $host = getenv('POSTGRES_HOST');
            $db_name = getenv('POSTGRES_DB');
            $user = getenv('POSTGRES_USER');
            $pass = getenv('POSTGRES_PASSWORD');

            $dsn = "pgsql:host=$host;dbname=$db_name";            

            try {
                self::$instance = new PDO($dsn, $user, $pass);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die("Database connection failed: " . $e->getMessage());
            }
        }

        return self::$instance;
    }
}
