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

    public function dispatch(string $uri, string $method, Request $request): void {
        $uri = rtrim($uri, '/') ?: '/';
        
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            if (preg_match($route['pattern'], $uri, $matches)) {
                foreach ($route['middleware'] as $middlewareClass) {
                    $middleware = new $middlewareClass();
                    if (!$middleware->handle()) {
                        return;
                    }
                }
                
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                if (is_callable($route['action'])) {
                    call_user_func($route['action'], ...array_values($params));
                    return;
                }
                
                if (is_array($route['action']) && count($route['action']) === 2) {
                    [$class, $function] = $route['action'];
                    
                    if (class_exists($class) && method_exists($class, $function)) {
                        $controllerInstance = new $class();
                        if (!empty($params)) {
                            $controllerInstance->$function($request, ...array_values($params));
                        } else {
                            $controllerInstance->$function($request);
                        }
                        return;
                    }
                }

                error_log("Router Error: Invalid action format for URI '{$route['uri']}'.");
                break;
            }
        }
        
        http_response_code(404);
        $view = new View();
        $view->renderPage('pages/404.php');
    }
}