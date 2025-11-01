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
    public ?string $received_at;

    public ?Store $store = null;
    public array $items = [];

    public function __construct(array $data) {
        $this->order_id = (int)($data['order_id'] ?? 0);
        $this->buyer_id = (int)($data['buyer_id'] ?? 0);
        $this->store_id = (int)($data['store_id'] ?? 0);
        $this->total_price = (int)($data['total_price'] ?? 0);
        $this->shipping_address = $data['shipping_address'] ?? '';
        $this->status = $data['status'] ?? 'waiting_approval';
        $this->created_at = $data['created_at'] ?? '';
        $this->received_at = $data['received_at'] ?? null;
    }
}