<?php
namespace App\Services;

use App\Repositories\ProductRepository;

class ProductService {
    private ProductRepository $product_repo;

    public function __construct() {
        $this->product_repo = new ProductRepository();
    }

    public function getAllVisibleProducts(): array {
        return $this->product_repo->findAllVisible();
    }

    public function getPaginatedProducts(
        int $page, 
        int $limit, 
        string $search = '', 
        array $category_ids = [], 
        ?int $min_price = null, 
        ?int $max_price = null,
        string $sort = 'newest'
    ): array {
        $offset = max(0, ($page - 1) * $limit);

        $sort_by = 'created_at';
        $sort_order = 'DESC';
        if ($sort === 'price-low') {
            $sort_by = 'price';
            $sort_order = 'ASC';
        } elseif ($sort === 'price-high') {
            $sort_by = 'price';
            $sort_order = 'DESC';
        }

        $products = $this->product_repo->findPaginated(
            $limit, $offset, $search, $category_ids, $min_price, $max_price, $sort_by, $sort_order
        );
        $total_count = $this->product_repo->countAllVisible(
            $search, $category_ids, $min_price, $max_price
        );
        $total_pages = ($limit > 0) ? ceil($total_count / $limit) : 0;

        return [
            'data' => $products,
            'current_page' => $page,
            'total_pages' => $total_pages,
            'limit' => $limit,
            'total_items' => $total_count
        ];
    }
}