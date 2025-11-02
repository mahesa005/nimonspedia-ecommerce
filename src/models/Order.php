<?php
namespace App\Models;

class Order {
    public int $order_id;
    public int $buyer_id;
    public int $store_id;
    public int $total_price;
    public string $shipping_address;
    public string $status;
    public string $created_at;
    public ?string $reject_reason;
    public ?string $confirmed_at;
    public ?string $delivery_time;
    public ?string $received_at;
    
    public ?Store $store = null;
    public array $items = [];
    public ?User $buyer = null;


    public function __construct(array $data) {
        $this->order_id = (int)($data['order_id'] ?? 0);
        $this->buyer_id = (int)($data['buyer_id'] ?? 0);
        $this->store_id = (int)($data['store_id'] ?? 0);
        $this->total_price = (int)($data['total_price'] ?? 0);
        $this->shipping_address = $data['shipping_address'] ?? '';
        $this->status = $data['status'] ?? 'waiting_approval';
        $this->created_at = $data['created_at'] ?? '';
        $this->reject_reason = $data['reject_reason'] ?? null;
        $this->confirmed_at = $data['confirmed_at'] ?? null;
        $this->delivery_time = $data['delivery_time'] ?? null;
        $this->received_at = $data['received_at'] ?? null;

        if (isset($data['order_items']) && is_array($data['order_items'])) {
             $this->order_items = $data['order_items'];
        }
    }

    public function getStatusBadgeClass(): string {
        switch ($this->status) {
            case 'approved': return 'status-approved';
            case 'on_delivery': return 'status-delivery';
            case 'received': return 'status-received';
            case 'rejected': return 'status-rejected';
            case 'waiting_approval':
            default: return 'status-waiting';
        }
    }
}
