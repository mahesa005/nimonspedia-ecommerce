<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Auth;
use App\Services\UserService;
use Exception;

class BuyerProfileController {
    private UserService $user_service;

    public function __construct() {
        $this->user_service = new UserService();
    }
    

    public function handleTopUp(Request $request): void {
        header('Content-Type: application/json');
        $user_id = Auth::id();
        
        $amount_raw = $request->getDataBody ('amount');
        $amount = filter_var($amount_raw, FILTER_VALIDATE_INT);

        if ($amount === false || $amount < 1000) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Jumlah top up tidak valid (minimal Rp 1.000).']);
            exit;
        }

        try {
            $new_balance = $this->user_service->topUpBalance($user_id, $amount);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Top up saldo berhasil!',
                'newBalanceFormatted' => number_format($new_balance, 0, ',', '.')
            ]);
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
}