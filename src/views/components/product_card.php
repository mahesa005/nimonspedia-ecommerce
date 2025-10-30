<?php

use App\Core\Auth;

$product_link = '/products/' . $product->product_id;
$store_link = '/store/' . $product->store_id;
$product_image = $product->getImagePath();
$product_name = $product->product_name;
$product_price = 'Rp ' . number_format($product->price, 0, ',', '.');
$store_name = $product->store_name ?? 'Toko Tidak Ditemukan';
$stock_class = $product->isOutOfStock() ? 'out-of-stock' : '';

?>
<div class="product-card <?php echo $stock_class; ?>">
    <a href="<?php echo htmlspecialchars($product_link); ?>" class="product-link">
        <img src="<?php echo htmlspecialchars($product_image); ?>" alt="<?php echo htmlspecialchars($product_name); ?>" class="product-image">
        <div class="product-details">
            <p class="product-name"><?php echo htmlspecialchars($product_name); ?></p>
            <p class="product-price"><?php echo htmlspecialchars($product_price); ?></p>
        </div>
    </a>
    <a href="<?php echo htmlspecialchars($store_link); ?>" class="store-link">
        <p class="product-store"><?php echo htmlspecialchars($store_name); ?></p>
    </a>
</div>