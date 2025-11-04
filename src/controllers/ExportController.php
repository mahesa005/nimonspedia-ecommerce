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

    // src/Controllers/ExportController.php
    public function download(Request $req): void {
        $sellerUserId = Auth::id();
        $entity = $req->getQuery('entity') ?? 'orders';
        $params = [
            'from'   => $req->getQuery('from'),
            'to'     => $req->getQuery('to'),
            'status' => $req->getQuery('status'),
        ];

        try {
            // Service akan mengirim header + CSV dan lalu exit();
            $this->svc->streamCsv($sellerUserId, $entity, $params);
            return; // jaga-jaga
        } catch (\Throwable $e) {
            // Kalau BELUM ada output, baru boleh redirect.
            if (!headers_sent()) {
                Session::set('error', 'Export gagal: '.$e->getMessage());
                header('Location: /seller/dashboard');
            } else {
                // Sudah ada output -> jangan kirim header apa pun lagi
                error_log('Export CSV error (headers already sent): '.$e->getMessage());
            }
        }
    }

}
