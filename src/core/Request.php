<?php
namespace App\Core;

class Request {
    private array $get_data;
    private array $post_data;
    private array $files_data;
    private string $method;
    private string $path;

    public function __construct() {
        $this->get_data = $_GET;
        $this->post_data = $_POST;
        $this->files_data = $_FILES;
        $this->method = $_SERVER['REQUEST_METHOD'];
        
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
    }

    public function getMethod(): string {
        return $this->method;
    }

    public function getPath(): string {
        return $this->path;
    }

    
    public function getBody(?string $key = null, $default = null) {
        if ($this->method === 'GET') {
            $arr = $_GET;
        } else {
            $ct = $_SERVER['CONTENT_TYPE'] ?? '';
            if (stripos($ct, 'application/json') === 0) {
                static $jsonCache = null;
                if ($jsonCache === null) {
                    $raw = file_get_contents('php://input') ?: '';
                    $jsonCache = json_decode($raw, true) ?: [];
                }
                $arr = $jsonCache;
            } else {
                // form-urlencoded & multipart/form-data
                $arr = $_POST;
            }   
        }
        if ($key === null) return $arr;
        return array_key_exists($key, $arr) ? $arr[$key] : $default;
    }

    public function getDataBody(string $key, $default = null) {
        $body = $this->getBody();
        return $body[$key] ?? $default;
    }

    public function getFiles(): array {
        return $this->files_data;
    }

    public function getFile(string $key): ?array {
        return $this->files_data[$key] ?? null;
    }
    
    public function getQuery(?string $key = null, $default = null) {
        if ($key === null) return $_GET;
        return array_key_exists($key, $_GET) ? $this->sanitize($_GET[$key]) : $default;
    }
}