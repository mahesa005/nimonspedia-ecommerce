<?php
namespace App\Core;

class Router {
    private array $routes = [];
    
    public function add(string $method, string $uri, $action, array $middleware = []) {
        $this->routes[] = [
            'method' => $method,
            'uri' => $uri,
            'action' => $action,
            'middleware' => $middleware
        ];
    }
    
    public function dispatch(string $uri, string $method, Request $request) {
        foreach ($this->routes as $route) {
            if ($route['uri'] === $uri && $route['method'] === $method) {

                foreach ($route['middleware'] as $middlewareClass) {
                    $middleware = new $middlewareClass();
                    
                    if (!$middleware->handle()) {
                        return;
                    }
                }
                
                if (is_callable($route['action'])) {
                    call_user_func($route['action']);
                    return;
                }
                
                [$class, $function] = $route['action'];
                $controllerInstance = new $class();
                $controllerInstance->$function($request);
                return;
            }
        }
        http_response_code(404);
        echo "404 Not Found: Page '$uri'";
    }
}