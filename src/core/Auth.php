<?php
namespace App\Core;

class Auth {
    public static function check(): bool {
        return Session::get('user_id') !== null;
    }

    public static function id(): ?int {
        return Session::get('user_id');
    }

    public static function role(): ?string {
        return Session::get('role');
    }
}