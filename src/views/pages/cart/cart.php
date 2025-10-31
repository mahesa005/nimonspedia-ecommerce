<div class="cart-page">
    <h1>Keranjang Belanja Anda</h1>
    
    <?php if (empty($stores)): ?>
        
        <div class="cart-empty">
            <img src="/image/empty-cart.svg" alt="Keranjang Kosong" class="empty-cart-icon">
            <p>Keranjang Anda masih kosong.</p>
            <a href="/" class="btn btn-primary">Mulai Belanja</a>
        </div>

    <?php else: ?>
        
        <div class="cart-container">
            
            <div class="cart-items">
                <?php foreach ($stores as $storeName => $storeData): ?>
                    <div class="store-group">
                        <h3 class="store-name">
                            <a href="/store/<?= $storeData['store_id'] ?>"><?= htmlspecialchars($storeName) ?></a>
                        </h3>
                        
                        <?php foreach ($storeData['items'] as $item):?>
                            <div class="cart-item" data-item-id="<?= $item->cart_item_id ?>">
                                <img src="<?= htmlspecialchars($item->product->main_image_path ?? '/images/default-product.png') ?>" 
                                     alt="<?= htmlspecialchars($item->product->product_name) ?>" class="item-image">
                                
                                <div class="item-details">
                                    <p class="item-name"><?= htmlspecialchars($item->product->product_name) ?></p>
                                    <p class="item-price">Rp <?= number_format($item->product->price) ?></p>
                                </div>
                                
                                <div class="item-quantity">
                                    <button class="btn-quantity btn-dec" data-item-id="<?= $item->cart_item_id ?>">-</button>
                                    <input type="number" value="<?= $item->quantity ?>" class="input-quantity" 
                                           data-item-id="<?= $item->cart_item_id ?>" 
                                           min="1" max="<?= $item->product->stock ?>">
                                    <button class="btn-quantity btn-inc" data-item-id="<?= $item->cart_item_id ?>">+</button>
                                </div>
                                
                                <div class="item-subtotal">
                                    <p>Subtotal:</p>
                                    <p class="price" id="subtotal-<?= $item->cart_item_id ?>">
                                        Rp <?= number_format($item->getSubtotal()) ?>
                                    </p>
                                </div>
                                
                                <div class="item-actions">
                                    <button class="btn-delete" data-item-id="<?= $item->cart_item_id ?>">Hapus</button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                        
                        <div class="store-total">
                            Total Belanja Toko: 
                            <strong id="store-total-<?= $storeData['store_id'] ?>">
                                Rp <?= number_format($storeData['storeTotal']) ?>
                            </strong>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>


            <div class="cart-summary">
                <h3>Rangkuman Belanja</h3>
                <div class="summary-line">
                    <span>Grand Total</span>
                    <span class="price" id="grand-total">Rp <?= number_format($grandTotal) ?></span>
                </div>
                <a href="/checkout" class="btn btn-primary btn-checkout <?= empty($stores) ? 'disabled' : '' ?>">
                    Checkout
                </a>
            </div>
            
        </div>
    <?php endif; ?>
</div>
