<?php
namespace App\Core\Middleware;

use App\Core\Auth;


class GuestMiddleware implements MiddlewareInterface {
    public function handle(): bool {
        if (Auth::check()) {
            header('Location: /');
            return false;
        }
        return true;
    }
}
