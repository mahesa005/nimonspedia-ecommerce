<?php
namespace App\Core;

class Router {
    private array $routes = [];
    
    public function add(string $method, string $uri, $action, array $middleware = []) {
        // Convert {id} to regex pattern
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $uri);
        $pattern = '#^' . $pattern . '$#';
        
        $this->routes[] = [
            'method' => $method,
            'uri' => $uri,
            'pattern' => $pattern,
            'action' => $action,
            'middleware' => $middleware
        ];
    }
    
    public function dispatch(string $uri, string $method, Request $request) {
        foreach ($this->routes as $route) {
            // Check method
            if ($route['method'] !== $method) {
                continue;
            }
            
            // Match pattern (supports {id})
            if (preg_match($route['pattern'], $uri, $matches)) {
                // Run middleware
                foreach ($route['middleware'] as $middlewareClass) {
                    $middleware = new $middlewareClass();
                    
                    if (!$middleware->handle()) {
                        return;
                    }
                }
                
                // MODIF utk bisa buka edit product
                // Extract route parameters (e.g., id)
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                // Call controller
                if (is_callable($route['action'])) {
                    call_user_func($route['action'], ...$params);
                    return;
                }
                
                [$class, $function] = $route['action'];
                $controllerInstance = new $class();
                
                // Pass request AND route params (like $id)
                if (!empty($params)) {
                    $controllerInstance->$function($request, ...array_values($params));
                } else {
                    $controllerInstance->$function($request);
                }
                return;
            }
        }
        
        http_response_code(404);
        echo "404 Not Found: Page '$uri'";
    }
}