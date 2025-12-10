<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Services\StoreService;
use App\Services\CategoryService;
use App\Services\UserService;
use App\Services\CartService;

class StoreController {
    private View $view;
    private StoreService $store_service;
    private CategoryService $category_service;
    private UserService $user_service;
    private CartService $cart_service;

    public function __construct() {
        $this->view = new View();
        $this->store_service = new StoreService();
        $this->category_service = new CategoryService();
        $this->user_service = new UserService();
        $this->cart_service = new CartService();
    }

    public function showStoreDetailPage(Request $request, string $store_id): void {
        $store_id_int = (int) $store_id;

        $store = $this->store_service->getStoreById($store_id_int);

        if (!$store) {
            http_response_code(404);
            $this->view->renderPage('pages/404.php', ['pageTitle' => 'Toko Tidak Ditemukan']);
            return;
        }

        $categories_in_store = $this->category_service->getCategoriesByStoreId($store_id_int);
        
        $user = null;
        $cart_item_count = 0;
        $navbar_file = 'components/navbar_guest.php';
        $styles = ['/css/components/navbar_guest.css', '/css/components/product_card.css', '/css/pages/store_detail.css'];
        $scripts = ['/js/pages/store_detail.js'];

        if (Auth::check()) {
            $user_id = Auth::id();
            $user = $this->user_service->getUserById($user_id);
            $cart_item_count = $this->cart_service->countUniqueItems($user_id);
            
            $navbar_file = 'components/navbar_buyer.php';
            $styles[] = '/css/components/navbar_buyer.css';
            $scripts[] = '/js/components/topup_modal.js';
            $styles[] = '/css/components/topup_modal.css';
        } else {
             $styles[] = '/css/components/navbar_guest.css';
        }

        $this->view->setData('pageTitle', $store->store_name);
        $this->view->setData('navbarFile', $navbar_file);
        $this->view->setData('pageStyles', $styles);
        $this->view->setData('pageScripts', $scripts);
        $this->view->setData('user', $user);
        $this->view->setData('cart_item_count', $cart_item_count);
        
        $this->view->setData('store', $store);
        $this->view->setData('categories', $categories_in_store);

        $this->view->renderPage('pages/store_detail.php');
    }

    public function handleUpdateStore(Request $request): void {
        header('Content-Type: application/json');
        
        try {
            $seller_id = (int)Auth::id();
            if (!$seller_id) {
                throw new Exception("Akses ditolak.", 401);
            }

            $data = $request->getBody();
            $file = $request->getFile('store_logo');

            $result = $this->store_service->updateStoreInfo(
                $seller_id, 
                $data['store_name'] ?? null, 
                $data['store_description'] ?? null, 
                $file
            );

            echo json_encode([
                'success' => true,
                'message' => 'Info toko berhasil diperbarui!',
                'logo_url' => $result['logo_url']
            ]);
            exit;

        } catch (Exception $e) {
            http_response_code($e->getCode() === 401 ? 401 : 400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }

    public function getAllStores(Request $request): void {
        header('Content-Type: application/json');

        $search = $request->getDataBody('search', '');
        error_log('TEST: ' . $search);

        try {
            $result = $this->store_service->getAllStores($search);
            echo json_encode([
                'success' => true,
                'message' => 'Info toko berhasil didapat!',
                'data' => $result
            ]);
        } catch (Exception $e) {
            http_response_code($e->getCode() === 401 ? 401 : 400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }
}
