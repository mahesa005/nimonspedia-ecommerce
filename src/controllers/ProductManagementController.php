<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Repositories\ProductRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\StoreRepository;

class ProductManagementController {
    private ProductRepository $productRepo;
    private CategoryRepository $categoryRepo;
    private StoreRepository $storeRepo;

    public function __construct() {
        $this->productRepo = new ProductRepository();
        $this->categoryRepo = new CategoryRepository();
        $this->storeRepo = new StoreRepository();
    }

    /**
     * Show product management page
     */
    public function index(Request $request) {
        $userId = Auth::id();
        
        // Get seller's store
        $store = $this->storeRepo->getByUserId($userId);
        
        if (!$store) {
            header('Location: /dashboard?error=store_not_found');
            exit;
        }

        // Get filter parameters
        $search = $request->getQuery('search');
        $categoryId = $request->getQuery('category');
        $sortBy = $request->getQuery('sort_by', 'product_name');
        $sortOrder = $request->getQuery('sort_order', 'ASC');

        // Get products with filters
        $products = $this->productRepo->getByStoreId(
            $store['store_id'],
            $search,
            $categoryId ? (int)$categoryId : null,
            $sortBy,
            $sortOrder
        );

        // Get all categories for filter dropdown
        $categories = $this->categoryRepo->getAll();

        // Render view
        $view = new View();
        $view->setData('pageTitle', 'Product Management');
        $view->setData('products', $products);
        $view->setData('categories', $categories);
        $view->setData('currentSearch', $search);
        $view->setData('currentCategory', $categoryId);
        $view->setData('currentSort', $sortBy);
        $view->setData('currentOrder', $sortOrder);
        $view->renderPage('pages/seller/product_management.php');
    }

    /**
     * Delete product (AJAX endpoint)
     */
    public function delete(Request $request) {
        header('Content-Type: application/json');

        $userId = Auth::id();
        $productId = (int) $request->getBody('product_id');

        try {
            // Get seller's store
            $store = $this->storeRepo->getByUserId($userId);
            
            if (!$store) {
                echo json_encode(['success' => false, 'message' => 'Store not found']);
                return;
            }

            // Verify product belongs to seller
            $product = $this->productRepo->getByIdAndStoreId($productId, $store['store_id']);
            
            if (!$product) {
                echo json_encode(['success' => false, 'message' => 'Product not found']);
                return;
            }

            // Soft delete
            $this->productRepo->softDelete($productId, $store['store_id']);

            echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
            
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}