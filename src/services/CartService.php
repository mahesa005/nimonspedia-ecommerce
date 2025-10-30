<?php
namespace App\Services;

use App\Repositories\CartRepository;
use App\Repositories\ProductRepository;
use Exception;
use PDOException;

class CartService {
    private CartRepository $cart_repo;
    private ProductRepository $product_repo;

    public function __construct() {
        $this->cart_repo = new CartRepository();
        $this->product_repo = new ProductRepository();
    }

    public function getCartItems(int $buyer_id): array {
        // TODO
    }

    public function countUniqueItems(int $buyer_id): int {
         try {
            return $this->cart_repo->countUniqueItems($buyer_id);
        } catch (PDOException $e) {
            error_log("Error counting cart items for buyer $buyer_id: " . $e->getMessage());
            return 0;
        }
    }

    public function addItem(int $buyer_id, int $product_id, int $quantity): bool {
        if ($quantity <= 0) {
            throw new Exception("Kuantitas harus positif.");
        }

        try {
            $product = $this->product_repo->findById($product_id);
            if (!$product || $product->isDeleted()) {
                throw new Exception("Produk tidak ditemukan atau tidak tersedia.");
            }
            if ($product->isOutOfStock()) {
                 throw new Exception("Stok produk ini sedang habis.");
            }

            $existing_item = $this->cart_repo->findItem($buyer_id, $product_id);

            if ($existing_item) {
                $new_quantity = $existing_item->quantity + $quantity;

                if ($new_quantity > $product->stock) {
                    $available_add = $product->stock - $existing_item->quantity;
                    $message = "Stok tidak mencukupi. Anda sudah memiliki {$existing_item->quantity} di keranjang.";
                    if ($available_add > 0) {
                        $message .= " Anda hanya bisa menambah {$available_add} lagi.";
                    } else {
                         $message .= " Stok saat ini: {$product->stock}.";
                    }
                    throw new Exception($message);
                }
                
                return $this->cart_repo->updateQuantity($existing_item->cart_item_id, $new_quantity);

            } else {
                if ($quantity > $product->stock) {
                    throw new Exception("Stok tidak mencukupi (tersisa {$product->stock}). Anda mencoba menambahkan {$quantity}.");
                }

                return $this->cart_repo->addItem($buyer_id, $product_id, $quantity);
            }

        } catch (PDOException $e) {
            error_log("Database error adding item to cart for buyer $buyer_id, product $product_id: " . $e->getMessage());
            throw new Exception("Gagal menambahkan item ke keranjang karena masalah database.");
        }
    }

    public function updateItemQuantity(int $cart_item_id, int $new_quantity, int $buyer_id): bool {
        // TODO
    }

    public function removeItem(int $cart_item_id, int $buyer_id): bool {
        // TODO
    }

    public function clearCart(int $buyer_id): bool {
        // TODO
    }
}