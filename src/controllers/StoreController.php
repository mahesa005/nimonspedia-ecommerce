<?php

namespace App\Controllers;

use App\Core\View;
use App\Repositories\StoreRepository;
use App\Repositories\ProductRepository;
use App\Repositories\CategoryRepository;

class StoreController {
    public function showDetail(Request $request, string $id) {
        $storeRepo = new StoreRepository();
        $productRepo = new ProductRepository();
        $categoryRepo = new CategoryRepository();

        $store = $storeRepo->findById($id);

        if (!$store) {
            http_response_code(404);
            View::render('pages/404', ['message' => 'Toko tidak ditemukan']); 
            return;
        }

        $filters = $_GET;
        $productData = $productRepo->getByStoreId($id, $filters); 
        $categories = $categoryRepo->findAll(); 

        $data = [
            'store' => $store,
            'products' => $productData['products'],
            'pagination' => [
                'total' => $productData['total'],
                'page' => $productData['page'],
                'totalPages' => $productData['totalPages']
            ],
            'categories' => $categories,
            'filters' => $filters
        ];

        View::render('pages/detail_store', $data);
    }
}