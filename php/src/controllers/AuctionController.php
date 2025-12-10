<?php
namespace App\Controllers;

use App\Services\AuctionService;
use App\Core\Request;

class AuctionController {
    private AuctionService $auctionService;

    public function __construct() {
        $this->auctionService = new AuctionService();
    }

    public function index(Request $request) {
        header('Content-Type: application/json');
        
        try {
            $page = (int) ($request->get('page') ?? 1);
            $limit = (int) ($request->get('limit') ?? 12);
            $search = $request->get('search') ?? '';
            $status = $request->get('status') ?? 'active';

            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 12;

            $result = $this->auctionService->getAuctions($page, $limit, $search, $status);

            echo json_encode(['success' => true, 'data' => $result['data'], 'meta' => $result['meta']]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
