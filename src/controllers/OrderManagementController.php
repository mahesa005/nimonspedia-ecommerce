<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Core\Session;
use App\Services\OrderManagementService;
use Exception;

class OrderManagementController {
    private OrderManagementService $orderService;
    private View $view;

    public function __construct() {
        $this->orderService = new OrderManagementService();
        $this->view = new View();
    }

    // Handle GET /seller/orders
    // Display orders list page with filters and pagination
    public function index(Request $request) {
        $user_id = Auth::id();
        

        try {
            $limit = (int)$request->getQuery('limit', 10);
            $validLimits = [4, 8, 12, 20];
            if (!in_array($limit, $validLimits)) {
                $limit = 10;
            }
            
            $page = max(1, (int)$request->getQuery('page', 1));
            $offset = ($page - 1) * $limit;

             $queryParams = [
                'status' => $request->getQuery('status'),
                'search' => $request->getQuery('search'),
                'page' => $page,
                'limit' => $limit
            ];

            // Get all data from service (includes store info)
            $data = $this->orderService->getOrdersPageData($user_id, $queryParams);


            // Set data to be sent to the view
            $this->view->setData('pageTitle', 'Kelola Pesanan');
            $this->view->setData('orders', $data['orders']);
            $this->view->setData('pagination', $data['pagination']);
            $this->view->setData('filters', $data['filters']);
            $this->view->setData('store', $data['store']); // Store from service
            $this->view->setData('currentLimit', $limit);
            error_log("DEBUG orders dump: " . print_r($data['orders'] ?? [], true));

            // Render page
            $this->view->renderPage('pages/seller/order_management.php');

        } catch (Exception $e) {
            Session::set('error_message', $e->getMessage());
            header('Location: /seller/dashboard');
            exit;
        }
    }

    // Handle POST /seller/orders/action
    // Process approve, reject, or set_delivery actions
    public function handleAction(Request $request) {
        $user_id = Auth::id();
        $postData = $request->getBody();

        try {
            $result = $this->orderService->processOrderAction($user_id, $postData);
            Session::set('success_message', $result['message']);

        } catch (Exception $e) {
            Session::set('error_message', $e->getMessage());
        }

        header('Location: /seller/orders');
        exit;
    }
}