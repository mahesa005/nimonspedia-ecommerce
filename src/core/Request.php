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

    
    public function getBody(): array {
        if ($this->method === 'POST') {
            return $this->post_data;
        }
        return $this->get_data;
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
}