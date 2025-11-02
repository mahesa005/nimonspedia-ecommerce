<?php 

use App\Core\Auth;
?>
<div class="container main-content">
    <div class="product-detail">
        
        <div class="product-image-section">
            <div class="product-image-main">
                <img id="mainImage" src="<?php echo htmlspecialchars($product->getImagePath()); ?>" alt="<?php echo htmlspecialchars($product->product_name)?>">
            </div>
        </div>

        <div class="product-info-section">
            <div class="product-header">
                <h1 class="product-name" id="productName"><?php echo htmlspecialchars($product->product_name)?></h1>
                <div class="product-category">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <?php foreach ($categories as $category): ?>
                    <span id="productCategory"><?php echo htmlspecialchars($category->name)?></span>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="product-price" id="productPrice">Rp<?php echo htmlspecialchars(number_format($product->price, 0, ',', '.'))?></div>
            
            <div class="product-stock <?php if ($product->isOutOfStock()):?>out-of-stock<?php endif;?>">
                <span class="stock-label">Stok:</span>
                <span class="stock-value" id="stockStatus">
                    <?php if ($product->isOutOfStock()):?>Stok Habis <?php else: ?>Tersedia <?php endif;?>(<?php echo htmlspecialchars($product->stock)?> unit)</span>
            </div>

            <a href="/store/<?php echo htmlspecialchars($product->store_id); ?>" class="store-info-link">
                <div class="store-info">
                    <div class="store-header">
                        <div class="store-avatar">
                            <?php if (!empty($store->store_logo_path)): ?>
                                <img 
                                    src="<?php echo htmlspecialchars($store->getLogoPath()); ?>" 
                                    alt="<?php echo htmlspecialchars($store->store_name); ?> Logo" 
                                    class="store-logo-img"
                                >
                            <?php else: ?>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            <?php endif; ?>
                        </div>
                        <div class="store-details">
                            <h3 class="store-name" id="storeName"><?php echo htmlspecialchars($product->store_name)?></h3>
                        </div>
                    </div>
                    <div class="store-description"><?php echo ($store->store_description) ?></div>
                </div>
            </a>

            <?php if (Auth::check()): ?>
            <div class="add-to-cart-section" id="addToCartSection">
                <div class="quantity-selector">
                    <label class="quantity-label">Jumlah:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn" id="decreaseBtn">-</button>
                        <input type="number" class="quantity-input" id="quantityInput" value="1" min="1" readonly>
                        <button class="quantity-btn" id="increaseBtn">+</button>
                    </div>
                </div>
                <button class="add-to-cart-btn" id="addToCartBtn" <?php echo $product->isOutOfStock() ? 'disabled' : ''; ?>>
                    <span class="btn-text">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Tambah ke Keranjang
                    </span>
                </button>
            </div>
            <?php else: ?>
            <div class="guest-message" id="guestMessage">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Silakan <a href="/login" class="login-link">login</a> untuk menambahkan produk ke keranjang</span>
            </div>
            <?php endif; ?>

            <div class="product-description">
                <h2 class="section-title">Deskripsi Produk</h2>
                <div class="description-content" id="productDescription">
                    <?php echo $product->description?>
                </div>
            </div>
        </div>
    </div>
</div>