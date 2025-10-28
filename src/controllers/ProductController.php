<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Session;
use App\Core\Auth;
use App\Services\ProductService;
use App\Services\CategoryService;

class ProductController {
    private ProductService $product_service;
    private CategoryService $category_service;
    private View $view;

    public function __construct() {
        $this->product_service = new ProductService();
        $this->category_service = new CategoryService();
        $this->view = new View();
    }

    public function showHomePage(Request $request): void {
        $styles = ['/css/components/navbar_guest.css','/css/components/pagination.css', '/css/components/product_card.css', '/css/pages/home.css'];
        $scripts = ['/js/pages/home.js'];

        $categories = $this->category_service->getAllCategories();

        $this->view->setData('pageTitle', 'Home - Nimonspedia');
        $this->view->setData('navbarFile', 'components/navbar_guest.php');
        $this->view->setData('pageStyles', $styles);
        $this->view->setData('pageScripts', $scripts);
        $this->view->setData('categories', $categories);

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
}