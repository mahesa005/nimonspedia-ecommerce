<?php
namespace App\Services;

use App\Repositories\ExportRepository;

class ExportService {
    private ExportRepository $repo;

    public function __construct() {
        $this->repo = new ExportRepository();
    }

    public function streamCsv(int $sellerUserId, string $entity, array $params): void {
        @ini_set('display_errors', '0');      
        @set_time_limit(0);                  
        while (ob_get_level() > 0) { ob_end_clean(); }

        $allowed = ['orders','products','revenue'];
        if (!in_array($entity, $allowed, true)) {
            throw new \InvalidArgumentException('Jenis export tidak dikenal');
        }

        $from = $params['from'] ?? null;
        $to   = $params['to']   ?? null;
        foreach (['from','to'] as $k) {
            $v = ${$k};
            if ($v !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) {
                throw new \InvalidArgumentException('Format tanggal salah (YYYY-MM-DD)');
            }
        }

        $status = $params['status'] ?? null;
        if ($status !== null && $status !== '') {
            $statusAllowed = ['waiting_approval','approved','rejected','delivering','received','completed','delivered','shipping']; 
            if (!in_array($status, $statusAllowed, true)) {
                $status = null; 
            }
        }

        switch ($entity) {
            case 'orders':
                $headers = ['order_id','order_date','buyer_name','status','total_price'];
                $iter = $this->repo->iterOrdersBySeller($sellerUserId, $from, $to, $status);
                break;
            case 'products':
                $headers = ['product_id','product_name','price','stock', 'updated_at'];
                $iter = $this->repo->iterProductsBySeller($sellerUserId);
                break;
            default: 
                $headers = ['date','total_orders','total_revenue','avg_order_value'];
                $iter = $this->repo->iterRevenueDaily($sellerUserId, $from, $to);
                break;
        }

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="'.$entity.'_export_'.date('Ymd_His').'.csv"');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');

        echo "\xEF\xBB\xBF";

        $out = fopen('php://output', 'w');

        fputcsv($out, $headers);

        $sanitize = static function ($val) {
            if ($val === null) return '';
            $s = (string)$val;
            return preg_match('/^[=\+\-@]/', $s) ? "'".$s : $s;
        };

        try {
            foreach ($iter as $row) {
                $line = [];
                foreach ($headers as $h) {
                    $line[] = $sanitize($row[$h] ?? '');
                }
                fputcsv($out, $line);
            }
        } finally {
            fclose($out);
            exit; 
        }
    }
}
