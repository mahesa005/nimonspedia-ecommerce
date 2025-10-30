<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Session;
use App\Core\Auth;
use App\Services\ProductService;
use App\Services\CategoryService;
use App\Services\UserService;
use App\Services\CartService;

class ProductController {
    private ProductService $product_service;
    private CategoryService $category_service;
    private UserService $user_service;
    private CartService $cart_service;
    private View $view;

    public function __construct() {
        $this->product_service = new ProductService();
        $this->category_service = new CategoryService();
        $this->user_service = new UserService();$this->cart_service = new CartService();
        $this->view = new View();
    }

    public function showHomePage(Request $request): void {
        $user = null;
        $cart_item_count = 0;
        $navbar_file = 'components/navbar_guest.php';


        $styles = ['/css/components/pagination.css', '/css/components/product_card.css', '/css/pages/home.css'];
        $scripts = ['/js/pages/home.js'];

        $categories = $this->category_service->getAllCategories();

        if (Auth::check()) {
            $user_id = Auth::id();
            $user = $this->user_service->getUserById($user_id);
            $cart_item_count = $this->cart_service->countUniqueItems($user_id);
            
            $navbar_file = 'components/navbar_buyer.php';
            $styles[] = '/css/components/navbar_buyer.css';
            $scripts[] = '/js/modules/topup_modal.js';
            $styles[] = '/css/components/topup_modal.css';
        } else {
            $styles[] = '/css/components/navbar_guest.css';
        }

        $this->view->setData('pageTitle', 'Home - Nimonspedia');
        $this->view->setData('navbarFile', $navbar_file);
        $this->view->setData('pageStyles', $styles);
        $this->view->setData('pageScripts', $scripts);
        $this->view->setData('categories', $categories);
        $this->view->setData('user', $user);
        $this->view->setData('cart_item_count', $cart_item_count);

        $this->view->renderPage('pages/home.php'); 
    }

    public function apiGetProducts(Request $request): void {
            $page = max(1, (int)($request->getDataBody('page', 1)));
            $limit = (int)($request->getDataBody('limit', 12));
            $search = $request->getDataBody('search', '');
            $sort = $request->getDataBody('sort', 'newest');
            
            $category_ids = $request->getDataBody('categories', []);
            if (!is_array($category_ids)) {
                $category_ids = $category_ids ? [$category_ids] : []; 
            }
            $category_ids = array_filter(array_map('intval', $category_ids));

            $min_price_raw = $request->getDataBody('min_price');
            $max_price_raw = $request->getDataBody('max_price');
            $min_price = ($min_price_raw !== '' && is_numeric($min_price_raw) && $min_price_raw >= 0) ? (int)$min_price_raw : null;
            $max_price = ($max_price_raw !== '' && is_numeric($max_price_raw) && $max_price_raw >= 0) ? (int)$max_price_raw : null;

            $result = $this->product_service->getPaginatedProducts(
                $page, $limit, $search, $category_ids, $min_price, $max_price, $sort
            );

            $product_html = '';
            if (!empty($result['data'])) {
                foreach ($result['data'] as $product) {
                    $product_html .= View::renderComponent('product_card.php', ['product' => $product]);
                }
            } else {
                $product_html = '<p class="empty-state" style="grid-column: 1 / -1; text-align: center;">Tidak ada produk yang ditemukan.</p>';
            }

            $pagination_html = View::renderComponent('pagination.php', [
                'current_page' => $result['current_page'],
                'total_pages' => $result['total_pages']
            ]);
            
            $start_item = $result['total_items'] > 0 ? (($result['current_page'] - 1) * $result['limit']) + 1 : 0;
            $end_item = min($result['current_page'] * $result['limit'], $result['total_items']);
            $pagination_info = "Menampilkan {$start_item}-{$end_item} dari {$result['total_items']}";


            $response = [
                'productHtml' => $product_html,
                'paginationHtml' => $pagination_html,
                'paginationInfo' => $pagination_info,
                'currentPage' => $result['current_page'],
                'totalPages' => $result['total_pages'],
                'totalItems' => $result['total_items']
            ];

            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
    }

    public function showProductDetailPage(Request $request, string $id): void {
        $product_id = (int) $id;
        try {
            $product_data = $this->product_service->getProductDetailsById($product_id);

            if (!$product_data || $product_data['product']->isDeleted()) {
                http_response_code(404);
                // $this->view->renderPage('pages/404.php', ['pageTitle' => 'Not Found']);
                return;
            }

            $user = null;
            $cart_item_count = 0;
            $navbar_file = 'components/navbar_guest.php';
            $styles = ['/css/pages/product_detail.css'];
            $scripts = ['/js/pages/product_detail.js'];

            if (Auth::check()) {
                $user_id = Auth::id();
                $user = $this->user_service->getUserById($user_id);
                $cart_item_count = $this->cart_service->countUniqueItems($user_id);
                $navbar_file = 'components/navbar_buyer.php';
                $styles[] = '/css/components/navbar_buyer.css';
                $scripts[] = '/js/modules/topup_modal.js';
            } else {
                 $styles[] = '/css/components/navbar_guest.css';
            }

            $this->view->setData('pageTitle', $product_data['product']->product_name . ' - Nimonspedia');
            $this->view->setData('navbarFile', $navbar_file);
            $this->view->setData('pageStyles', $styles);
            $this->view->setData('pageScripts', $scripts);
            $this->view->setData('user', $user);
            $this->view->setData('cart_item_count', $cart_item_count);
            $this->view->setData('product', $product_data['product']);
            $this->view->setData('store', $product_data['store']);
            $this->view->setData('categories', $product_data['categories']);

            $this->view->renderPage('pages/product_detail.php');

        } catch (Exception $e) {
            error_log("Error showing product detail for ID $product_id: " . $e->getMessage());
            http_response_code(500);
            // $this->view->renderPage('errors/500.php', ['pageTitle' => 'Server Error']);
        }
    }
}