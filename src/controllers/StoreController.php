<?php
<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\View;
use App\Services\StoreService;
use App\Services\ProductService;
use App\Services\CategoryService;

class StoreController
{
    private StoreService $storeService;
    private ProductService $productService;
    private CategoryService $categoryService;

    public function __construct()
    {
        $this->storeService = new StoreService();
        $this->productService = new ProductService();
        $this->categoryService = new CategoryService();
    }

    public function showStorePage(Request $request)
    {
        $storeId = $request->getParam('id');
        
        if (!$storeId || !is_numeric($storeId)) {
            header('Location: /');
            exit;
        }

        // Get store info
        $store = $this->storeService->getStoreById((int)$storeId);
        
        if (!$store) {
            header('Location: /');
            exit;
        }

        // Get categories for filter
        $categories = $this->categoryService->getAllCategories();

        // Get filter params
        $page = max(1, (int)($request->getQuery('page') ?? 1));
        $limit = 12;
        $search = $request->getQuery('search') ?? '';
        $categoryId = $request->getQuery('category') ?? '';
        $sortBy = $request->getQuery('sort') ?? 'created_at';
        $sortOrder = $request->getQuery('order') ?? 'desc';

        // Get products for this store
        $result = $this->storeService->getStoreProducts(
            (int)$storeId,
            $page,
            $limit,
            $search,
            $categoryId,
            $sortBy,
            $sortOrder
        );

        View::render('pages/store', [
            'store' => $store,
            'products' => $result['products'],
            'categories' => $categories,
            'currentPage' => $page,
            'totalPages' => $result['totalPages'],
            'totalProducts' => $result['total'],
            'filters' => [
                'search' => $search,
                'category' => $categoryId,
                'sort' => $sortBy,
                'order' => $sortOrder
            ]
        ]);
    }

    public function apiGetStoreProducts(Request $request)
    {
        header('Content-Type: application/json');
        
        $storeId = $request->getParam('id');
        
        if (!$storeId || !is_numeric($storeId)) {
            echo json_encode(['success' => false, 'message' => 'Invalid store ID']);
            return;
        }

        $page = max(1, (int)($request->getQuery('page') ?? 1));
        $limit = 12;
        $search = $request->getQuery('search') ?? '';
        $categoryId = $request->getQuery('category') ?? '';
        $sortBy = $request->getQuery('sort') ?? 'created_at';
        $sortOrder = $request->getQuery('order') ?? 'desc';

        $result = $this->storeService->getStoreProducts(
            (int)$storeId,
            $page,
            $limit,
            $search,
            $categoryId,
            $sortBy,
            $sortOrder
        );

        echo json_encode([
            'success' => true,
            'data' => $result
        ]);
    }
}