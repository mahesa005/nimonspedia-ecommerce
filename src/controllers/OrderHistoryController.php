<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\View;
use App\Services\OrderService;
use App\Core\Request;

class OrderHistoryController {
    
   private OrderService $orderService;

   public function __construct() {
      $this->orderService = new \App\Services\OrderService();
   }

   public function showPage(Request $request) {
      $buyer_id = Auth::id(); 
        
      $status_filter = $_GET['status'] ?? null;
        
      $orders = $this->orderService->getBuyerHistory($buyer_id, $status_filter);

      $view = new View();

      $view->setData('pageTitle', 'Riwayat Pesanan');
      $view->setData('pageStyles', ['/css/pages/order_history.css']);
      $view->setData('pageScripts', ['/js/pages/order_history.js']);
      $view->setData('navbarFile', 'components/navbar_buyer.php');
      $view->setData('orders', $orders);
      $view->setData('current_filter', $status_filter);
        
      $view->renderPage('pages/order_history.php');
   }

   public function updateStatus(Request $request) {
        header('Content-Type: application/json');
        
        // Log untuk debugging
        error_log("=== updateStatus called ===");
        error_log("POST data: " . print_r($_POST, true));
        error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
        
        try {
            $buyer_id = Auth::id();
            
            if (!$buyer_id) {
                error_log("Unauthorized - no buyer_id");
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Anda harus login terlebih dahulu'
                ]);
                exit;
            }

            $order_id = $_POST['order_id'] ?? $request->post('order_id') ?? null;
            $status = $_POST['status'] ?? $request->post('status') ?? null;

            error_log("Raw - Order ID: {$order_id}, Status: {$status}, Buyer ID: {$buyer_id}");

            if (!$order_id || !$status) {
                error_log("Missing order_id or status");
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Order ID dan status harus diisi'
                ]);
                exit;
            }

            $order_id = (int) $order_id;
            $buyer_id = (int) $buyer_id;
            $status = (string) $status;

            error_log("Casted - Order ID: {$order_id}, Status: {$status}, Buyer ID: {$buyer_id}");

            $result = $this->orderService->updateOrderStatus(
                $order_id, 
                $status, 
                $buyer_id
            );

            error_log("Result: " . print_r($result, true));

            $httpCode = $result['success'] ? 200 : 400;
            http_response_code($httpCode);
            echo json_encode($result);

        } catch (\Exception $e) {
            error_log("OrderHistoryController::updateStatus exception: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
            ]);
        }
        exit;
    }
    
}
