<div class="container main-content">
    <h1 class="section-title">Checkout</h1>
    
    <form id="checkoutForm" action="/checkout" method="POST">
        <div class="checkout-wrapper">
            <div class="checkout-left">
                
                <div class="address-section">
                    <h2 class="sub-section-title">Alamat Pengiriman</h2>

                    <div class="address-display" id="addressDisplay">
                        <div class="address-info">
                            <h3 id="addressUserName"><?php echo htmlspecialchars($user->name); ?></h3>
                        </div>
                        <div class="address-detail" id="addressText">
                            <?php echo nl2br(htmlspecialchars($user->address)); ?>
                        </div>
                        <div class="address-action">
                            <button type="button" class="address-btn" id="editAddressBtn">Ubah Alamat</button>
                        </div>
                    </div>

                    <div class="edit-address" id="editAddressForm" style="display: none;">
                        <div class="forms">
                            <label for="addressInput">Alamat Baru:</label>
                            <textarea id="addressInput" name="address" required><?php echo htmlspecialchars($user->address ?? ''); ?></textarea>
                        </div>
                        <div class="address-action">
                            <button type="button" class="address-btn" id="cancelEditAddressBtn">Batal</button>
                            <button type="button" class="submit-btn" id="saveAddressBtn">Simpan Alamat</button>
                        </div>
                    </div>
                </div>
                
                <h2 class="sub-section-title">Produk yang Dipesan</h2>
                
                <?php foreach($stores as $store): ?>
                <div class="store-section">
                    <div class="store-header">
                        <span class="store-name"><?php echo htmlspecialchars($store->store_name); ?></span>
                    </div>

                    <?php foreach($products_by_store[$store->store_id] as $item): 
                        $product = $item->product;
                    ?>
                    <div class="product-item">
                        <div class="product-image">
                            <img src="<?php echo htmlspecialchars($product->getImagePath()); ?>" alt="<?php echo htmlspecialchars($product->product_name); ?>"/>
                        </div>
                        <div class="product-info">
                            <div class="product-name"><?php echo htmlspecialchars($product->product_name); ?></div>
                            <div class="product-quantity"><?php echo htmlspecialchars($item->quantity); ?> x Rp <?php echo htmlspecialchars(number_format($product->price, 0, ',', '.')); ?></div>
                        </div>
                        <div class="product-subtotal">
                            Rp <?php echo htmlspecialchars(number_format($item->getSubtotal(), 0, ',', '.')); ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endforeach; ?>

            </div>

            <div class="checkout-right">
                <div class="summary-card">
                    <h3 class="summary-title">Ringkasan Belanja</h3>

                    <div class="summary-row">
                        <span class="summary-label">Total Harga (<?php echo $num_of_items; ?> barang)</span>
                        <span classs="summary-value">Rp <?php echo htmlspecialchars(number_format($total_price, 0, ',', '.' )); ?></span>
                    </div>
                    
                    <div class="summary-total">
                        <span class="summary-label">Total Tagihan</span>
                        <span class="summary-value">Rp <?php echo htmlspecialchars(number_format($total_price, 0, ',', '.' )); ?></span>
                    </div>

                    <div class="balance-section">
                        <div class="balance-row">
                            <span class="balance-label">Saldo Anda</span>
                            <span class="balance-value" id="userBalanceText">Rp <?php echo htmlspecialchars(number_format($user->balance, 0, ',', '.' )); ?></span>
                        </div>
                        
                        <?php $remaining_balance = $user->balance - $total_price; ?>
                        <div class="balance-row">
                            <span class="balance-label">Sisa Saldo</span>
                            <span class="balance-value <?php echo ($remaining_balance < 0) ? 'minus' : ''; ?>" id="remainingBalanceText">
                                Rp <?php echo htmlspecialchars(number_format($remaining_balance, 0, ',', '.' )); ?>
                            </span>
                        </div>

                        <div class="balance-warning" id="balanceWarning" style="<?php echo ($remaining_balance < 0) ? '' : 'display: none;'; ?>">
                            <span>Saldo tidak cukup</span>
                            <button type="button" class="topup-link" id="openTopupModalBtn">Top-up Balance</button>
                        </div>

                        <button type="button" class="checkout-btn" id="checkoutBtn" <?php echo ($remaining_balance < 0) ? 'disabled' : ''; ?>>
                            <span class="btn-text">Bayar dan Buat Pesanan</span>
                            <span class="loader" style="display: none;"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

<div class="modal-wrapper" id="confirmModalWrapper" style="display: none;">
    <dialog id="confirmDialog" class="confirm-dialog">
        <h3>Konfirmasi Checkout</h3>
        <p>Anda akan membayar sebesar <strong>Rp <?php echo htmlspecialchars(number_format($total_price, 0, ',', '.' )); ?></strong>. Lanjutkan?</p>
        <div class="dialog-actions">
            <button type="button" class="cancel-btn" id="cancelCheckoutBtn">Batal</button>
            <button type="button" class="submit-btn" id="confirmCheckoutBtn">Ya, Bayar</button>
        </div>
    </dialog>
</div>