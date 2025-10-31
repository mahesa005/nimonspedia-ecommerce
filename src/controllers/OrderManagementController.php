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

    /**
     * Handle GET /seller/orders
     * Display orders list page with filters and pagination
     */
    public function index(Request $request) {
        $user_id = Auth::id();
        $queryParams = $_GET;

        try {
            // fetch data needed by the view
            $data = $this->orderService->getOrdersPageData($user_id, $queryParams);

            // Set data to be sent to the view
            $this->view->setData('pageTitle', 'Manage Orders');
            $this->view->setData('orders', $data['orders']);
            $this->view->setData('pagination', $data['pagination']);
            $this->view->setData('filters', $data['filters']);

            // Render page
            $this->view->renderPage('pages/seller/order_management.php');

        } catch (Exception $e) {
            // If failed (e.g. store not found), redirect to dashboard with error
            Session::set('error_message', $e->getMessage());
            header('Location: /seller/dashboard');
            exit;
        }
    }

    /**
     * Handle POST /seller/orders/action
     * Process approve, reject, or set_delivery actions
     */
    public function handleAction(Request $request) {
        $user_id = Auth::id();
        $postData = $request->getBody(); // retrieve request body ($_POST)

        try {
            // Call service to process action
            $result = $this->orderService->processOrderAction($user_id, $postData);

            // Set success message to session
            Session::set('success_message', $result['message']);

        } catch (Exception $e) {
            // Set error message to session
            Session::set('error_message', $e->getMessage());
        }

        // Always redirect back to order management page
        // (to display success/error message)
        header('Location: /seller/orders');
        exit;
    }
}