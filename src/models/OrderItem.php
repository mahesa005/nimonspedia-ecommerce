<?php
namespace App\Models;

class OrderItem {
    public int $order_item_id;
    public int $order_id;
    public int $product_id;
    public int $quantity;
    public int $price_at_order;
    public int $subtotal;
    public ?Product $product = null;

    public function __construct(array $data) {
        $this->order_item_id = (int) ($data['order_item_id'] ?? 0);
        $this->order_id = (int) ($data['order_id'] ?? 0);
        $this->product_id = (int) ($data['product_id'] ?? 0);
        $this->quantity = (int) ($data['quantity'] ?? 0);
        $this->price_at_order = (int) ($data['price_at_order'] ?? 0);
        $this->subtotal = (int) ($data['subtotal'] ?? 0);
    }
}