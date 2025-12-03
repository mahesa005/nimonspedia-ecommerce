<?php
namespace App\Core\Middleware;

use App\Core\Auth;


class AuthMiddleware implements MiddlewareInterface {
    public function handle(): bool {
        if (!Auth::check()) {
            header('Location: /login');
            return false;
        }
        return true;
    }
}
