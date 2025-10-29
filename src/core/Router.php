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

    public function dispatch(string $uri, string $method, Request $request): void {
        $uri = rtrim($uri, '/') ?: '/';
        
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            $routeUri = rtrim($route['uri'], '/') ?: '/';
            
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $routeUri);

            $pattern = str_replace('/', '\/', $pattern);
            $regex = '/^' . $pattern . '$/';
            
            $matches = [];
            if (preg_match($regex, $uri, $matches)) {
                foreach ($route['middleware'] as $middlewareClass) {
                    $middleware = new $middlewareClass();
                    
                    if (!$middleware->handle()) {
                        return;
                    }
                }
                
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                if (is_array($route['action']) && count($route['action']) === 2) {
                    [$class, $function] = $route['action'];
                    
                    if (class_exists($class) && method_exists($class, $function)) {
                        $controllerInstance = new $class();
                        
                        $args = array_merge([$request], $params);
                        
                        call_user_func_array([$controllerInstance, $function], $args);
                        
                        return;
                    } else {
                        error_log("Router Error: Controller class '$class' or method '$function' not found for URI '{$route['uri']}'.");
                    }
                } elseif (is_callable($route['action'])) {
                    $args = array_merge([$request], $params);
                    call_user_func_array($route['action'], $args);
                    return;
                } else {
                    error_log("Router Error: Invalid action format for URI '{$route['uri']}'. Expected [Class::class, 'method'] or callable.");
                }
            }
        }
        
        http_response_code(404);
        echo "404 Not Found: Page '$uri'"; 
    }
}