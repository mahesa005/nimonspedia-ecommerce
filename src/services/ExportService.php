<?php

namespace App\Services; 
use App\Repositories\ExportRepository;
use Exception;

class ExportService {
    private ExportRepository $repo;
    public function __construct() { 
        $this->repo = new ExportRepository(); 
    }

    public function streamCsv(int $sellerUserId, string $entity, array $params): void {
        $allowed = ['orders','products','revenue'];
        if (!in_array($entity, $allowed, true)) {
            throw new \InvalidArgumentException('Jenis export tidak dikenal');
        }

        $from = $params['from'] ?? null; $to = $params['to'] ?? null;
        foreach (['from','to'] as $k) {
            $v = ${$k};
            if ($v !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) {
                throw new \InvalidArgumentException('Format tanggal salah (YYYY-MM-DD)');
            }
        }

        switch ($entity) {
            case 'orders':
                $headers = ['order_id','order_date','buyer_name','status','total_price'];
                $iter = $this->repo->iterOrdersBySeller($sellerUserId, $from, $to, $params['status'] ?? null);
                break;
            case 'products':
                $headers = ['product_id','product_name','category_name','price','stock','status','updated_at'];
                $iter = $this->repo->iterProductsBySeller($sellerUserId);
                break;
            default:
                $headers = ['date','total_orders','total_revenue','avg_order_value'];
                $iter = $this->repo->iterRevenueDaily($sellerUserId, $from, $to);
                break;
        }

        if (ob_get_level()) ob_end_clean();
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="'.$entity.'_export_'.date('Ymd_His').'.csv"');
        header('X-Content-Type-Options: nosniff');

        echo "\xEF\xBB\xBF"; 
        $out = fopen('php://output', 'w');
        fputcsv($out, $headers);
        foreach ($iter as $row) {
            $line = [];
            foreach ($headers as $h) $line[] = $row[$h] ?? '';
            fputcsv($out, $line);
            flush();
        }
        fclose($out);
        exit;
    }
}