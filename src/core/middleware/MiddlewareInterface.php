<?php
namespace App\Core\Middleware;

interface MiddlewareInterface {

    // return true -> lanjut ke controller, false -> redirect ke page lain
    public function handle(): bool;
}