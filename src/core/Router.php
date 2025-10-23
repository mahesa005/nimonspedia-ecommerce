<?php
namespace App\Core;

class Router {
    private array $routes = [];
    
    public function add(string $method, string $uri, $action) {
        $this->routes[] = [
            'method' => $method,
            'uri' => $uri,
            'action' => $action
        ];
    }
    
    public function dispatch(string $uri, string $method) {
        foreach ($this->routes as $route) {
            if ($route['uri'] === $uri && $route['method'] === $method) {
                
                if (is_callable($route['action'])) {
                    call_user_func($route['action']);
                    return;
                }
                
                [$class, $function] = $route['action'];
                $controllerInstance = new $class();
                $controllerInstance->$function();
                return;
            }
        }
        http_response_code(404);
        echo "404 Not Found: Page '$uri'";
    }
}