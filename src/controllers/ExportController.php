<?php
// src/Controllers/ExportController.php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Session;
use App\Services\ExportService;

class ExportController {
    private ExportService $svc;

    public function __construct() {
        $this->svc = new ExportService();
    }

    public function download(Request $req): void {
        $sellerUserId = Auth::id();

        // Ambil query params via getQuery(); default entity 'orders'
        $entity = $req->getQuery('entity') ?? 'orders';

        // Kumpulin filter dalam array asosiatif
        $params = [
            'from'   => $req->getQuery('from'),
            'to'     => $req->getQuery('to'),
            'status' => $req->getQuery('status'),
        ];

        try {
            $this->svc->streamCsv($sellerUserId, $entity, $params);
        } catch (\Throwable $e) {
            Session::set('error', 'Export gagal: ' . $e->getMessage());
            header('Location: /seller/dashboard');
        }
    }
}
