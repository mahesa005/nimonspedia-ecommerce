<div class="order-history-page">
    <h1>Order History</h1>

    <nav class="order-filters">
        <a href="/orders" 
           class="filter-btn <?= empty($status_filter) ? 'active' : '' ?>">
           All Orders
        </a>
        <a href="/orders?status=waiting_approval" 
           class="filter-btn <?= ($status_filter ?? '') === 'waiting_approval' ? 'active' : '' ?>">
           Waiting Approval
        </a>
        <a href="/orders?status=on_delivery" 
           class="filter-btn <?= ($status_filter ?? '') === 'on_delivery' ? 'active' : '' ?>">
           On Delivery
        </a>
        <a href="/orders?status=received" 
           class="filter-btn <?= ($status_filter ?? '') === 'received' ? 'active' : '' ?>">
           Received
        </a>
        <a href="/orders?status=rejected" 
           class="filter-btn <?= ($status_filter ?? '') === 'rejected' ? 'active' : '' ?>">
           Cancelled
        </a>
    </nav>

    <?php if (empty($orders)): ?>
        <div class="empty-orders">
            <div class="empty-icon"></div>
            <p>There are no orders with this status yet</p>
            <a href="/" class="btn btn-primary">Start Shopping</a>
        </div>
    <?php else: ?>
        <div class="order-list">
            <?php foreach ($orders as $order): ?>
                <div class="order-card" id="order-card-<?= $order->order_id ?>">
                    
                    <div class="order-header">
                        <div class="order-info">
                            <span class="order-id">Order #<?= $order->order_id ?></span>
                            <span class="order-date"><?= date('d M Y, H:i', strtotime($order->created_at)) ?></span>
                            <?php if (isset($order->store) && $order->store): ?>
                                <a href="/store/<?= $order->store->store_id ?>" class="store-link">
                                    <?= htmlspecialchars($order->store->store_name) ?>
                                </a>
                            <?php endif; ?>
                        </div>
                        <span class="order-status status-<?= $order->status ?>">
                            <?= ucfirst(str_replace('_', ' ', $order->status)) ?>
                        </span>
                    </div>

                    <div class="order-body">
                        <div class="order-items">
                            <?php 
                            $items = $order->order_items ?? $order->items ?? [];
                            if (!empty($items)): 
                            ?>
                                <?php foreach ($items as $item): ?>
                                    <div class="order-item">
                                        <?php 
                                        $imagePath = $item->product->main_image_path 
                                                  ?? $item->product->image_path 
                                                  ?? '/image/default-product.png';
                                        ?>
                                        <img src="<?= htmlspecialchars($imagePath) ?>" 
                                             alt="<?= htmlspecialchars($item->product->product_name ?? 'Product') ?>" 
                                             class="item-image">
                                        
                                        <div class="item-details">
                                            <div class="item-name"><?= htmlspecialchars($item->product->product_name ?? 'Product') ?></div>
                                            <?php 
                                            $price = $item->price_at_order ?? $item->price ?? 0;
                                            ?>
                                            <div class="item-quantity"><?= $item->quantity ?> x Rp <?= number_format($price, 0, ',', '.') ?></div>
                                        </div>
                                        
                                        <div class="item-price">
                                            <?php 
                                            $subtotal = $item->subtotal ?? ($item->quantity * $price);
                                            ?>
                                            Rp <?= number_format($subtotal, 0, ',', '.') ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="order-footer">
                        <div class="shipping-address">
                            <div class="address-label">Shipping address</div>
                            <div class="address-text"><?= htmlspecialchars($order->shipping_address) ?></div>
                        </div>

                        <div class="order-total-section">
                            <div class="total-label">Total payment</div>
                            <div class="total-price">Rp <?= number_format($order->total_price, 0, ',', '.') ?></div>

                            <div class="order-actions">
                                <?php if ($order->status === 'on_delivery'): ?>
                                    <button class="btn btn-success btn-confirm-receipt" 
                                            data-order-id="<?= $order->order_id ?>">
                                        ✓ Receive Orders
                                    </button>
                                <?php endif; ?>

                                <?php if ($order->status === 'waiting_approval'): ?>
                                    <button class="btn btn-danger btn-cancel-order" 
                                            data-order-id="<?= $order->order_id ?>">
                                        ✕ Cancel Order
                                    </button>
                                <?php endif; ?>

                                <?php if ($order->status === 'received'): ?>
                                    <a href="/store/<?= $order->store->store_id ?? '#' ?>" class="btn btn-primary">
                                       Buy Again
                                    </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>
