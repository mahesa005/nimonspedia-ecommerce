<div class="order-history-page">
    <h1>Riwayat Pesanan</h1>

    <nav class="order-filters">
        <a href="/orders" 
           class="filter-btn <?php echo empty($current_filter) ? 'active' : '' ?>">
           Semua
        </a>
        <a href="/orders?status=waiting_approval" 
           class="filter-btn <?php echo ($current_filter ?? '') === 'waiting_approval' ? 'active' : '' ?>">
           Menunggu Konfirmasi
        </a>
        <a href="/orders?status=on_delivery" 
           class="filter-btn <?php echo ($current_filter ?? '') === 'on_delivery' ? 'active' : '' ?>">
           Dikirim
        </a>
        <a href="/orders?status=received" 
           class="filter-btn <?php echo ($current_filter ?? '') === 'received' ? 'active' : '' ?>">
           Selesai
        </a>
        <a href="/orders?status=rejected" 
           class="filter-btn <?php echo ($current_filter ?? '') === 'rejected' ? 'active' : '' ?>">
           Dibatalkan
        </a>
    </nav>

    <?php if (!isset($orders) || empty($orders)): ?>
        <div class="empty-orders">
            <div class="empty-icon"></div>
            <p>Belum ada pesanan.</p>
            <a href="/" class="btn btn-primary">Mulai Belanja</a>
        </div>
    <?php else: ?>
        <div class="order-list">
            <?php foreach ($orders as $order): ?>
                <div class="order-card" id="order-card-<?php echo $order->order_id; ?>">
                    
                    <div class="order-header">
                        <div class="order-info">
                            <span class="order-id">#<?php echo $order->order_id; ?></span>
                            <span class="order-date"><?php echo date('d M Y, H:i', strtotime($order->created_at)); ?></span>
                            <?php if (isset($order->store)): ?>
                                <a href="/store/<?php echo $order->store->store_id; ?>" class="store-link">
                                    <?php echo htmlspecialchars($order->store->store_name); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                        <div class="order-header-actions">
                            <button class="btn btn-secondary btn-view-details" data-order-id="<?php echo $order->order_id; ?>">
                                Lihat Detail
                            </button>
                            <span class="order-status status-<?php echo $order->status; ?>" id="status-badge-<?php echo $order->order_id; ?>">
                                <?php echo ucfirst(str_replace('_', ' ', $order->status)); ?>
                            </span>
                        </div>
                    </div>

                    <div class="order-body">
                        <div class="order-items">
                            <?php 
                            $items = $order->items ?? [];
                            foreach ($items as $item): 
                                if (!isset($item->product)) continue; 
                            ?>
                                <div class="order-item">
                                    <img src="<?php echo htmlspecialchars($item->product->getImagePath()); ?>" 
                                         alt="<?php echo htmlspecialchars($item->product->product_name); ?>" 
                                         class="item-image">
                                    
                                    <div class="item-details">
                                        <div class="item-name"><?php echo htmlspecialchars($item->product->product_name); ?></div>
                                        <div class="item-quantity">
                                            <?php echo $item->quantity; ?> x Rp <?php echo number_format($item->price_at_order, 0, ',', '.'); ?>
                                        </div>
                                        
                                        <div class="item-description">
                                            <?php 
                                                echo nl2br($item->product->description ?? 'Tidak ada deskripsi.');
                                            ?>
                                        </div>
                                    </div>
                                    
                                    <div class="item-price">
                                        Rp <?php echo number_format($item->subtotal, 0, ',', '.'); ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="order-details-expandable" id="details-expand-<?php echo $order->order_id; ?>">
                        <div class="order-footer">
                            <div class="order-details-col">
                                <div class="shipping-address">
                                    <div class="info-label">Alamat Pengiriman</div>
                                    <div class="info-text"><?php echo nl2br(htmlspecialchars($order->shipping_address)); ?></div>
                                </div>
                                <?php if ($order->status === 'rejected' && !empty($order->reject_reason)): ?>
                                    <div class="reject-info">
                                        <div class="info-label">Alasan Dibatalkan</div>
                                        <div class="info-text"><?php echo htmlspecialchars($order->reject_reason); ?></div>
                                    </div>
                                    <div class="refund-info">
                                        <div class="info-label">Dana Dikembalikan</div>
                                        <div class="info-text">Rp <?php echo number_format($order->total_price, 0, ',', '.'); ?></div>
                                    </div>
                                <?php endif; ?>
                                <?php if ($order->status === 'on_delivery' && !empty($order->delivery_time)): ?>
                                    <div class="delivery-info">
                                        <div class="info-label">Estimasi Tiba</div>
                                        <div class="info-text"><?php echo date('d M Y', strtotime($order->delivery_time)); ?></div>
                                    </div>
                                <?php endif; ?>
                                <?php if ($order->status === 'received' && !empty($order->received_at)): ?>
                                    <div class="delivery-info">
                                        <div class="info-label">Diterima pada</div>
                                        <div class="info-text"><?php echo date('d M Y', strtotime($order->received_at)); ?></div>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <div class="order-total-section">
                                <div class="total-label">Total Pembayaran</div>
                                <div class="total-price">Rp <?php echo number_format($order->total_price, 0, ',', '.'); ?></div>
                                
                                <div class="order-actions" id="actions-<?php echo $order->order_id; ?>">
                                    <?php if ($order->status === 'on_delivery'): 
                                        $is_past_delivery = !$order->delivery_time || time() >= strtotime($order->delivery_time);
                                    ?>
                                        <button class="btn btn-success btn-confirm-receipt" 
                                                data-order-id="<?php echo $order->order_id; ?>"
                                                <?php if (!$is_past_delivery) echo 'disabled'; ?>
                                                title="<?php if (!$is_past_delivery) echo 'Bisa dikonfirmasi setelah ' . date('d M Y', strtotime($order->delivery_time)); ?>">
                                            ✓ Konfirmasi Pesanan Diterima
                                        </button>
                                    <?php endif; ?>
                                    <?php if ($order->status === 'waiting_approval'): ?>
                                        <button class="btn btn-danger btn-cancel-order" 
                                                data-order-id="<?php echo $order->order_id; ?>">
                                            ✕ Batalkan Pesanan
                                        </button>
                                    <?php endif; ?>
                                    <?php if ($order->status === 'received' && isset($order->store)): ?>
                                        <a href="/store/<?php echo $order->store->store_id; ?>" class="btn btn-primary">
                                            Beli Lagi
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div> </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>