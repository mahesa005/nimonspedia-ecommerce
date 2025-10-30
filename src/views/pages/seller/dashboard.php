<?php
$data = $dashboardData ?? [];
$storeInfo = $data['store_info'] ?? [];
$quickStats = $data['quick_stats'] ?? [];

$totalProducts = $quickStats['total_products'] ?? 0;
$pendingOrders = $quickStats['pending_orders'] ?? 0;
$storeBalance = $quickStats['store_balance'] ?? 0;
$totalRevenue = $quickStats['total_revenue'] ?? 0;

function rph($n) {
    return 'Rp ' . number_format((float)$n, 0, ',', '.');
}
?>

<link rel="stylesheet" href="/css/pages/seller_dashboard.css">

<?php include __DIR__ . '/../../components/navbar_seller.php'; ?>

<div class="tp-page">
  <div class="tp-heading">
    <div class="left">
      <h1>Dashboard Seller</h1>
      <p class="sub">Pantau performa toko Anda secara real-time</p>
    </div>
    <div class="right">
      <a href="/seller/products" class="btn btn-ghost">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Kelola Produk
      </a>
      <a href="/seller/products/add" class="btn btn-primary">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
        Tambah Produk
      </a>
    </div>
  </div>

  <div class="metric-grid">
    <div class="metric card" data-metric="products">
      <div class="metric-icon blue">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div class="metric-content">
        <div class="label">Total Produk</div>
        <div class="value"><?= number_format($totalProducts) ?></div>
        <div class="delta">Aktif di toko</div>
      </div>
    </div>

    <div class="metric card" data-metric="revenue">
      <div class="metric-icon green">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="metric-content">
        <div class="label">Total Pendapatan</div>
        <div class="value"><?= rph($totalRevenue) ?></div>
        <div class="delta">Dari semua penjualan</div>
      </div>
    </div>

    <div class="metric card" data-metric="orders">
      <div class="metric-icon purple">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div class="metric-content">
        <div class="label">Pesanan Pending</div>
        <div class="value"><?= number_format($pendingOrders) ?></div>
        <div class="delta">Menunggu approval</div>
      </div>
    </div>

    <div class="metric card" data-metric="balance">
      <div class="metric-icon gray">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="metric-content">
        <div class="label">Saldo Toko</div>
        <div class="value"><?= rph($storeBalance) ?></div>
        <div class="delta">Saldo tersedia</div>
      </div>
    </div>
  </div>

  <div class="dashboard-grid">
    <div class="dashboard-left">
      <div class="card section store-info-card">
        <div class="section-header">
          <h2>Informasi Toko</h2>
          <button class="btn-icon" id="editStoreBtn" title="Edit Toko">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
        </div>
        <div class="store-details">
          <?php if (!empty($storeInfo['store_logo_path'])): ?>
          <div class="store-logo-container">
            <img src="<?= htmlspecialchars($storeInfo['store_logo_path']) ?>" alt="Store Logo" class="store-logo-img">
          </div>
          <?php endif; ?>
          <div class="store-info-item">
            <strong>Nama Toko</strong>
            <span><?= htmlspecialchars($storeInfo['store_name'] ?? '-') ?></span>
          </div>
          <?php if (!empty($storeInfo['store_description'])): ?>
          <div class="store-info-item">
            <strong>Deskripsi</strong>
            <p class="store-desc"><?= htmlspecialchars($storeInfo['store_description']) ?></p>
          </div>
          <?php endif; ?>
        </div>
      </div>
    </div>

    <div class="dashboard-right">
      <div class="card section">
        <div class="section-header">
          <h2>Aksi Cepat</h2>
        </div>
        <div class="action-list">
          <a href="/seller/products/add" class="action-item">
            <div class="action-icon blue">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="action-text">
              <div class="action-title">Tambah Produk</div>
              <div class="action-desc muted">Buat produk baru</div>
            </div>
          </a>

          <a href="/seller/products" class="action-item">
            <div class="action-icon green">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="action-text">
              <div class="action-title">Kelola Produk</div>
              <div class="action-desc muted">Update stok dan informasi</div>
            </div>
          </a>

          <a href="/seller/orders" class="action-item">
            <div class="action-icon purple">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="action-text">
              <div class="action-title">Kelola Pesanan</div>
              <div class="action-desc muted">Proses pesanan masuk</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="/js/pages/seller_dashboard.js"></script>