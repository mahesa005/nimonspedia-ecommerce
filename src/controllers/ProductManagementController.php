<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Services\ProductService;
use App\Repositories\StoreRepository;

class ProductManagementController {
    private ProductService $productService;
    private StoreRepository $storeRepo;
    private View $view;

    public function __construct() {
        $this->productService = new ProductService();
        $this->storeRepo = new StoreRepository();
        $this->view = new View();
    }

    /**
     * GET /seller/products
     * Show product management page
     */
    public function index(Request $request) {
        $userId = Auth::id();
        

        try {
            // Get filter parameters
            $search = $request->getQuery('search');
            $categoryId = $request->getQuery('category');
            $sortBy = $request->getQuery('sort_by', 'product_name');
            $sortOrder = $request->getQuery('sort_order', 'ASC');
            $storeId = $this->storeRepo->getByUserId($userId);

            // Get products from service
            $products = $this->productService->getProductsByUser(
                $userId,
                $search,
                $categoryId ? (int)$categoryId : null,
                $sortBy,
                $sortOrder
            );

            // Get categories for filter
            $categories = $this->productService->getAllCategories();

            // Render view
            $view = new View();
            $view->setData('pageTitle', 'Product Management');
            $view->setData('products', $products);
            $view->setData('categories', $categories);
            $view->setData('currentSearch', $search);
            $view->setData('currentCategory', $categoryId);
            $view->setData('currentSort', $sortBy);
            $view->setData('currentOrder', $sortOrder);
            $view->setData('store', $storeId);
            $view->renderPage('pages/seller/product_management.php');

        } catch (\Exception $e) {
            header('Location: /dashboard?error=' . urlencode($e->getMessage()));
            exit;
        }
    }

    /**
     * GET /seller/products/create
     * Show create product form
     */
    public function create(Request $request) {
        $userId = Auth::id();

        try {
            // Check if user has a store
            $store = $this->productService->getStoreByUserId($userId);
            
            if (!$store) {
                header('Location: /dashboard?error=store_not_found');
                exit;
            }

            // Get categories
            $categories = $this->productService->getAllCategories();

            // Render view
            $view = new View();
            $view->setData('pageTitle', 'Add New Product');
            $view->setData('categories', $categories);
            $view->setData('store', $store);
            $view->renderPage('pages/seller/product_create.php');

        } catch (\Exception $e) {
            header('Location: /seller/products?error=' . urlencode($e->getMessage()));
            exit;
        }
    }

    /**
     * POST /seller/products/store
     * Store new product
     */
    public function store(Request $request) {
        $userId = Auth::id();

        // Get form data
        $data = [
            'product_name' => $request->getBody('product_name'),
            'description' => $request->getBody('description'),
            'price' => $request->getBody('price'),
            'stock' => $request->getBody('stock'),
            'category_id' => $request->getBody('category_id')
        ];

        error_log('Store data: ' . print_r($data, true));
        error_log('Product name type: ' . gettype($data['product_name']));
        error_log('Description type: ' . gettype($data['description']));

        $file = $request->getFile('image');
        error_log('File: ' . print_r($file, true));
        // Create product via service
        $result = $this->productService->createProduct($userId, $data, $file);

        if ($result['success']) {
            header('Location: /seller/products?success=' . urlencode($result['message']));
        } else {
            $_SESSION['form_data'] = $data;
            $_SESSION['form_error'] = $result['message'];
            header('Location: /seller/products/create');
        }
        exit;
    }

    /**
     * GET /seller/products/{id}/edit
     * Show edit product form
     */
    public function edit(Request $request, int $id) {
        $userId = Auth::id();

        try {
            $product = $this->productService->getProductForEdit($userId, $id);
            
            if (!$product) {
                $_SESSION['error_message'] = 'Product not found';
                header('Location: /seller/products');
                exit;
            }

            $categories = $this->productService->getAllCategories();


            $this->view->setData('product', $product);
            $this->view->setData('categories', $categories);
            $this->view->renderPage('pages/seller/product_edit.php');

        } catch (\Exception $e) {
            error_log('Error in edit: ' . $e->getMessage());
            header('Location: /seller/products');
            exit;
        }
    }

    /**
     * POST /seller/products/{id}/update
     * Update product
     */
    public function update(Request $request, int $productId) {
        $userId = Auth::id();

        // Get form data
        $data = [
            'product_name' => $request->getBody('product_name'),
            'description' => $request->getBody('description'),
            'price' => $request->getBody('price'),
            'stock' => $request->getBody('stock'),
            'category_id' => $request->getBody('category_id')
        ];

        // Get uploaded file (optional for update)
        $file = $request->getFile('image');

        // Update product via service
        $result = $this->productService->updateProduct($userId, $productId, $data, $file);

        if ($result['success']) {
            header('Location: /seller/products?success=' . urlencode($result['message']));
        } else {
            $_SESSION['form_data'] = $data;
            $_SESSION['form_error'] = $result['message'];
            header('Location: /seller/products/' . $productId . '/edit');
        }
        exit;
    }

    /**
     * POST /seller/products/delete
     * Delete product (AJAX endpoint)
     */
    public function delete(Request $request) {
        header('Content-Type: application/json');

        $userId = Auth::id();
        $productId = (int) $request->getBody('product_id');

        // Delete product via service
        $result = $this->productService->deleteProduct($userId, $productId);

        echo json_encode($result);
    }
}