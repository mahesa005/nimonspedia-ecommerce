<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Core\Auth;
use App\Services\ProductService;

class ProductManagementController {
    private ProductService $productService;
    private View $view;

    public function __construct() {
        $this->productService = new ProductService();
        $this->view = new View();
    }

    // GET /seller/products
    // Show product management page
    public function index(Request $request) {
        $userId = Auth::id();

        try {
            // Get filter parameters
            $search = $request->getQuery('search');
            $categoryId = $request->getQuery('category');
            $sortBy = $request->getQuery('sort_by', 'product_name');
            $sortOrder = $request->getQuery('sort_order', 'ASC');

            // Get store via service
            $store = $this->productService->getStoreByUserId($userId);
            
            if (!$store) {
                throw new \Exception('Store not found');
            }

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
            $this->view->setData('pageTitle', 'Product Management');
            $this->view->setData('products', $products);
            $this->view->setData('categories', $categories);
            $this->view->setData('currentSearch', $search);
            $this->view->setData('currentCategory', $categoryId);
            $this->view->setData('currentSort', $sortBy);
            $this->view->setData('currentOrder', $sortOrder);
            $this->view->setData('store', $store);
            $this->view->renderPage('pages/seller/product_management.php');

        } catch (\Exception $e) {
            header('Location: /dashboard?error=' . urlencode($e->getMessage()));
            exit;
        }
    }

    // GET /seller/products/create
    // Show create product form
    public function create(Request $request) {
        $userId = Auth::id();

        try {
            // Check if user has a store via service
            $store = $this->productService->getStoreByUserId($userId);
            
            if (!$store) {
                header('Location: /dashboard?error=store_not_found');
                exit;
            }

            // Get categories
            $categories = $this->productService->getAllCategories();

            // Render view
            $this->view->setData('pageTitle', 'Add New Product');
            $this->view->setData('categories', $categories);
            $this->view->setData('store', $store);
            $this->view->renderPage('pages/seller/product_create.php');

        } catch (\Exception $e) {
            header('Location: /seller/products?error=' . urlencode($e->getMessage()));
            exit;
        }
    }

    // POST /seller/products/store
    // Store new product
    public function store(Request $request) {
        $userId = Auth::id();

        $data = [
            'product_name' => $request->getBody('product_name'),
            'description' => $request->getBody('description'),
            'price' => $request->getBody('price'),
            'stock' => $request->getBody('stock'),
            'category_id' => $request->getBody('category_id')
        ];

        $file = $request->getFile('image');

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

    // GET /seller/products/{id}/edit
    // Show edit product form
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
            
            // Get store via service
            $store = $this->productService->getStoreByUserId($userId);

            $this->view->setData('product', $product);
            $this->view->setData('categories', $categories);
            $this->view->setData('store', $store);
            $this->view->renderPage('pages/seller/product_edit.php');

        } catch (\Exception $e) {
            error_log('Error in edit: ' . $e->getMessage());
            header('Location: /seller/products');
            exit;
        }
    }

    // POST /seller/products/{id}/update
    // Update product
    public function update(Request $request, int $productId) {
        $userId = Auth::id();

        $data = [
            'product_name' => $request->getBody('product_name'),
            'description' => $request->getBody('description'),
            'price' => $request->getBody('price'),
            'stock' => $request->getBody('stock'),
            'category_id' => $request->getBody('category_id')
        ];

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

    // POST /seller/products/delete
    // Delete product (AJAX endpoint)
    public function delete(Request $request) {
        header('Content-Type: application/json');

        $userId = Auth::id();
        $productId = (int) $request->getBody('product_id');

        // Delete product via service
        $result = $this->productService->deleteProduct($userId, $productId);

        echo json_encode($result);
    }
}