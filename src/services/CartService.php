<?php
namespace App\Services;

use App\Repositories\CartRepository;
use App\Repositories\ProductRepository;
use App\Repositories\StoreRepository;
use App\Models\CartItem;
use App\Models\Product;
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
        try {
            $rows = $this->cart_repo->findAllByBuyerId($buyer_id);
            
            $groupedByStore = [];
            $grandTotal = 0;

            foreach ($rows as $row) {
                $product = new Product($row); 
                $cartItem = new CartItem($row);
                $cartItem->product = $product;
                
                $subtotal = $cartItem->getSubtotal();
                
                $storeName = $product->store_name;
                if (!isset($groupedByStore[$storeName])) {
                    $groupedByStore[$storeName] = [
                        'store_id' => $product->store_id,
                        'items' => [],
                        'storeTotal' => 0
                    ];
                }
                
                $groupedByStore[$storeName]['items'][] = $cartItem;
                $groupedByStore[$storeName]['storeTotal'] += $subtotal;
                $grandTotal += $subtotal;
            }
            
            return ['stores' => $groupedByStore, 'grandTotal' => $grandTotal];

        } catch (PDOException $e) {
            error_log("Error getting cart items: " . $e->getMessage());
            throw new Exception("Tidak dapat mengambil keranjang belanja.");
        }
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
                
                return $this->cart_repo->updateQuantity($existing_item->cart_item_id, $new_quantity, $buyer_id);

            } else {
                if ($quantity > $product->stock) {
                    throw new Exception("Stok tidak mencukupi (tersisa {$product->stock}). Anda mencoba menambahkan {$quantity}.");
                }

                return $this->cart_repo->addItem($buyer_id, $product_id, $quantity);
            }

        } catch (PDOException $e) {
            error_log("Database error adding item to cart for buyer $buyer_id, product $product_id: " . $e->getMessage());
            throw new Exception("Gagal menambahkan item ke keranjang karena masalah database.");
            throw new Exception("Kuantitas harus lebih dari 0");
        }
        
        $product = $this->product_repo->findById($product_id);
        if (!$product) {
            throw new Exception("Produk tidak ditemukan.");
        }

        $existingItem = $this->cart_repo->findByBuyerAndProduct($buyer_id, $product_id);

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $quantity;
            if ($product->stock < $newQuantity) {
                throw new Exception("Stok tidak mencukupi (tersisa $product->stock)");
            }
            return $this->cart_repo->updateQuantity($existingItem->cart_item_id, $newQuantity, $buyer_id);
        } else {
            if ($product->stock < $quantity) {
                throw new Exception("Stok tidak mencukupi (tersisa $product->stock)");
            }
            return $this->cart_repo->create($buyer_id, $product_id, $quantity) > 0;
        }
    }

    public function updateItemQuantity(int $cart_item_id, int $new_quantity, int $buyer_id): bool {
        if ($new_quantity < 1) {
            return $this->removeItem($cart_item_id, $buyer_id);
        }

        // Cek stok
        $item = $this->cart_repo->findItemById($cart_item_id, $buyer_id);
        if (!$item) {
            throw new Exception("Item tidak ditemukan di keranjang.");
        }
        
        $product = $this->product_repo->findById($item->product_id);
        if ($product->stock < $new_quantity) {
            throw new Exception("Stok tidak mencukupi (tersisa $product->stock).");
        }
        
        return $this->cart_repo->updateQuantity($cart_item_id, $new_quantity, $buyer_id);
    }

    public function removeItem(int $cart_item_id, int $buyer_id): bool {
        return $this->cart_repo->remove($cart_item_id, $buyer_id);
    }
    public function clearCart(int $buyer_id): bool {
        return $this->cart_repo->clear($buyer_id);
    }

    public function getCartForCheckout(int $buyer_id): array {
        $cart_items = $this->cart_repo->findByBuyerIdWithDetails($buyer_id);

        $stores = [];
        $products_by_store = [];
        $total_price = 0;
        $num_of_items = 0;

        foreach ($cart_items as $item) {
            $store_id = $item->product->store_id;

            if (!isset($stores[$store_id])) {
                $store = (new StoreRepository())->findById($store_id);
                $stores[$store_id] = $store; 
            }
            
            $products_by_store[$store_id][] = $item;

            $total_price += $item->getSubtotal();
            $num_of_items += $item->quantity;
        }

        return [
            'stores' => array_values($stores),
            'products_by_store' => $products_by_store,
            'total_price' => $total_price,
            'num_of_items' => $num_of_items
        ];
    }
}