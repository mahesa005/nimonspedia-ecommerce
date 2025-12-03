<?php
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
        $entity = $req->getQuery('entity') ?? 'orders';
        $params = [
            'from'   => $req->getQuery('from'),
            'to'     => $req->getQuery('to'),
            'status' => $req->getQuery('status'),
        ];

        try {
            $this->svc->streamCsv($sellerUserId, $entity, $params);
            return;
        } catch (\Throwable $e) {
            if (!headers_sent()) {
                Session::set('error', 'Export gagal: '.$e->getMessage());
                header('Location: /seller/dashboard');
            } else {
                error_log('Export CSV error (headers already sent): '.$e->getMessage());
            }
        }
    }

}
