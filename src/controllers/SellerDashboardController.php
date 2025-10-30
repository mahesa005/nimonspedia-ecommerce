<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Services\DashboardService;
use App\Repositories\StoreRepository;

class SellerDashboardController {
    private DashboardService $dashboardService;
    private StoreRepository $storeRepo;
    private View $view;

    public function __construct() {
        $this->dashboardService = new DashboardService();
        $this->storeRepo = new StoreRepository();
        $this->view = new View();
    }

    /**
     * GET /seller/dashboard
     * Show seller dashboard
     */
    public function index(Request $request) {
        $userId = Auth::id();

        try {
            // Get dashboard data from service
            $dashboardData = $this->dashboardService->getSellerDashboardData($userId);
            $storeId = $this->storeRepo->getByUserId($userId);

            // Render view
            $this->view->setData('pageTitle', 'Seller Dashboard');
            $this->view->setData('dashboardData', $dashboardData);
            $this->view->setData('store', $storeId);
            $this->view->renderPage('pages/seller/dashboard.php');

        } catch (\Exception $e) {
            header('Location: /login?error=' . urlencode($e->getMessage()));
            exit;
        }
    }

}
