<?php
namespace App\Models;

class CartItem {
    public int $cart_item_id;
    public int $buyer_id;
    public int $product_id;
    public int $quantity;
    public string $created_at;
    public string $updated_at;
    public ?Product $product = null;

    public function __construct(array $data) {
        $this->cart_item_id = (int) ($data['cart_item_id'] ?? 0);
        $this->buyer_id = (int) ($data['buyer_id'] ?? 0);
        $this->product_id = (int) ($data['product_id'] ?? 0);
        $this->quantity = (int) ($data['quantity'] ?? 0);
        $this->created_at = $data['created_at'] ?? '';
        $this->updated_at = $data['updated_at'] ?? '';
    }

    public function getSubtotal(): int {
        return $this->product ? ($this->product->price * $this->quantity) : 0;
    }
}