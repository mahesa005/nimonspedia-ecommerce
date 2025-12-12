<?php

use App\Models\Store;
use App\Services\FeatureService;

$current_store = $store ?? null;
$store_balance_formatted = '0';
if ($current_store) {
    $store_balance_formatted = number_format($current_store["balance"], 0, ',', '.');
}
?>

$chatStatus = FeatureService::getStatus('chat_enabled');

<header>
    <link rel="stylesheet" href="/css/components/navbar_seller.css">
    <nav class="navbar">
        <a href="/seller/dashboard" class="navbar-brand">Nimonspedia Seller</a>

        <button class="navbar-toggle" id="navbarToggle" aria-label="Toggle navigation">
            <span class="navbar-toggle-icon"></span>
            <span class="navbar-toggle-icon"></span>
            <span class="navbar-toggle-icon"></span>
        </button>

        <div class="navbar-menu" id="navbarMenu">
            <div class="navbar-links">
                <a href="/seller/dashboard" class="navbar-link">Dashboard</a>
                <a href="/seller/products" class="navbar-link">Produk</a>
                <a href="/seller/orders" class="navbar-link">Pesanan</a>
                <?php if ($chatStatus['enabled']): ?>
                    <a href="/chat" class="navbar-link">Chat</a>
                <?php endif; ?>
            </div>

            <div class="navbar-actions">
                <div class="navbar-store-balance">
                    Rp<?php echo htmlspecialchars($store_balance_formatted); ?>
                </div>
                <a href="/logout" class="navbar-logout btn--secondary">Logout</a>
            </div>
        </div>
    </nav>
</header>
<script src="/js/modules/navbar_seller.js" defer></script>