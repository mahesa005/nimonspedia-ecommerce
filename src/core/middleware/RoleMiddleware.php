<?php

namespace App\Core\Middleware;

use App\Core\Auth; // Use authentication before redirecting to controller

// Create Role Middleware

class RoleMiddleware implements MiddlewareInterface{
    public function handle(): bool {
        $role = Auth::role();
        
        // Check if user is SELLER
        if (!$role || $role !== 'SELLER') {
            header('Location: /dashboard');
            return false;
        }
        
        return true;
    }
}
