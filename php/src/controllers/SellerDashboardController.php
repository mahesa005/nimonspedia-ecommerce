<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Services\DashboardService;
use App\Services\ProfileService;

class SellerDashboardController {
    private DashboardService $dashboardService;
    private View $view;
    private ProfileService $profileService;

    public function __construct() {
        $this->dashboardService = new DashboardService();
        $this->view = new View();
        $this->profileService = new ProfileService();
    }

    // GET /seller/dashboard
    // Show seller dashboard
    public function index(Request $request) {
        $userId = Auth::id();

        try {
            // Get all dashboard data from service (includes store info)
            $dashboardData = $this->dashboardService->getSellerDashboardData($userId);

            $preferences = $this->profileService->getPreferences($userId);

            $dashboardData['preferences'] = $preferences;

            // Render view
            $this->view->setData('pageTitle', 'Seller Dashboard');
            $this->view->setData('dashboardData', $dashboardData);
            $this->view->setData('store', $dashboardData['store_info']); // Pass store from dashboard data
            $this->view->renderPage('pages/seller/dashboard.php');

        } catch (\Exception $e) {
            header('Location: /login?error=' . urlencode($e->getMessage()));
            exit;
        }
    }

    // Add method to handle AJAX update requests
    // POST /seller/preferences/update
    public function updatePreferences() {
        header('Content-Type: application/json');
        
        try {
            $userId = Auth::id();
            
            $chat = isset($_POST['chat_enabled']) && ($_POST['chat_enabled'] === '1' || $_POST['chat_enabled'] === 'true');
            $auction = isset($_POST['auction_enabled']) && ($_POST['auction_enabled'] === '1' || $_POST['auction_enabled'] === 'true');
            $order = isset($_POST['order_enabled']) && ($_POST['order_enabled'] === '1' || $_POST['order_enabled'] === 'true');

            $this->profileService->updatePreferences($userId, $chat, $auction, $order);
            
            echo json_encode(['success' => true, 'message' => 'Pengaturan notifikasi berhasil disimpan.']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }
}