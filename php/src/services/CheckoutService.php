<?php
namespace App\Services;

use App\Core\Database;
use App\Repositories\UserRepository;
use App\Repositories\ProductRepository;
use App\Repositories\CartRepository;
use App\Repositories\OrderRepository;
use App\Repositories\OrderItemRepository;
use PDO;
use Exception;

class CheckoutService {
    private PDO $db;
    private CartService $cart_service;
    private UserRepository $user_repo;
    private ProductRepository $product_repo;
    private CartRepository $cart_repo;
    private OrderRepository $order_repo;
    private OrderItemRepository $order_item_repo;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->cart_service = new CartService();
        $this->user_repo = new UserRepository();
        $this->product_repo = new ProductRepository();
        $this->cart_repo = new CartRepository();
        $this->order_repo = new OrderRepository();
        $this->order_item_repo = new OrderItemRepository();
    }


    public function processCheckout(int $buyer_id, string $shipping_address): void {
        $checkout_data = $this->cart_service->getCartForCheckout($buyer_id);
        $total_price = $checkout_data['total_price'];

        if ($checkout_data['num_of_items'] === 0) {
            throw new Exception("Keranjang kosong.");
        }

        $user = $this->user_repo->findById($buyer_id);
        if ($user->balance < $total_price) {
            throw new Exception("Saldo tidak cukup untuk melakukan transaksi.");
        }

        try {
            $this->db->beginTransaction();

            $this->user_repo->updateBalance($buyer_id, $user->balance - $total_price);

            foreach ($checkout_data['stores'] as $store) {
                $store_id = $store->store_id;
                $items_in_store = $checkout_data['products_by_store'][$store_id];
                
                $store_total = 0;
                foreach ($items_in_store as $item) {
                    $store_total += $item->getSubtotal();
                }

                $order_id = $this->order_repo->create(
                    $buyer_id,
                    $store_id,
                    $store_total,
                    $shipping_address
                );

                foreach ($items_in_store as $item) {
                    $product = $item->product;
                    $quantity = $item->quantity;

                    $current_stock = $this->product_repo->getStock($product->product_id);
                    if ($quantity > $current_stock) {
                        throw new Exception("Stok untuk {$product->product_name} tidak mencukupi (tersisa {$current_stock}).");
                    }

                    $this->product_repo->reduceStock($product->product_id, $quantity);

                    $this->order_item_repo->create(
                        $order_id,
                        $product->product_id,
                        $quantity,
                        $product->price
                    );
                }
            }

            $this->cart_repo->clearByBuyerId($buyer_id);

            $this->db->commit();

        } catch (Exception $e) {
            $this->db->rollBack();
            
            throw $e;
        }
    }
}