<?php
namespace App\Services;

use App\Repositories\AuctionRepository;

class AuctionService {
    private AuctionRepository $auctionRepo;

    public function __construct() {
        $this->auctionRepo = new AuctionRepository();
    }

    public function getAuctions(
        int $page, 
        int $limit, 
        string $search = '', 
        string $status = 'active'
    ): array {
        $offset = max(0, ($page - 1) * $limit);
        
        $sort = ($status === 'scheduled') ? 'starting_soon' : 'ending_soon';

        $auctions = $this->auctionRepo->findPaginated($limit, $offset, $search, $status, $sort);
        $totalCount = $this->auctionRepo->countAll($search, $status);
        $totalPages = ($limit > 0) ? ceil($totalCount / $limit) : 0;

        return [
            'data' => $auctions,
            'meta' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_items' => $totalCount,
                'limit' => $limit
            ]
        ];
    }
}
