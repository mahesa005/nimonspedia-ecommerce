<?php
namespace App\Core\Middleware;

use App\Core\Auth;


class RedirectSellerMiddleware implements MiddlewareInterface {
    public function handle(): bool {
        
        if (Auth::check() && Auth::role() === 'SELLER') {
            
            header('Location: /seller/dashboard');
            return false;
        }

        return true;
    }
}