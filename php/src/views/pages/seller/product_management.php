<link rel="stylesheet" href="/css/pages/product_management.css">

<?php include __DIR__ . '/../../components/navbar_seller.php'; ?>

<div class="tp-page">
  <div class="tp-heading">
    <div class="left">
      <h1>Kelola Produk</h1>
      <p class="sub">Kelola semua produk di toko Anda</p>
    </div>
    <div class="right">
      <a href="/seller/dashboard" class="back-btn back-btn--small" title="Kembali ke Dashboard">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>

      <a href="/seller/products/add" class="btn btn-primary">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
        Tambah Produk
      </a>
    </div>
  </div>

  <!-- Filter toolbar -->
  <div class="toolbar card">
    <div class="toolbar-row">
      <div class="search">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        <input id="search-input" type="text" placeholder="Cari produk..." value="<?= htmlspecialchars($currentSearch ?? '') ?>">
      </div>

      <div class="filters">
        <select id="category-filter" class="select">
          <option value="">Semua Kategori</option>
          <?php foreach ($categories as $c): ?>
            <option value="<?= $c['category_id'] ?>" <?= ($currentCategory == $c['category_id']) ? 'selected' : '' ?>>
              <?= htmlspecialchars($c['category_name'] ?? $c['name'] ?? '') ?>
            </option>
          <?php endforeach; ?>
        </select>

        <select id="sort-select" class="select">
          <option value="product_name-ASC"  <?= ($currentSort == 'product_name' && $currentOrder == 'ASC')  ? 'selected' : '' ?>>Nama A–Z</option>
          <option value="product_name-DESC" <?= ($currentSort == 'product_name' && $currentOrder == 'DESC') ? 'selected' : '' ?>>Nama Z–A</option>
          <option value="price-ASC"         <?= ($currentSort == 'price'        && $currentOrder == 'ASC')  ? 'selected' : '' ?>>Harga Rendah–Tinggi</option>
          <option value="price-DESC"        <?= ($currentSort == 'price'        && $currentOrder == 'DESC') ? 'selected' : '' ?>>Harga Tinggi–Rendah</option>
          <option value="stock-ASC"         <?= ($currentSort == 'stock'        && $currentOrder == 'ASC')  ? 'selected' : '' ?>>Stok Sedikit→Banyak</option>
          <option value="stock-DESC"        <?= ($currentSort == 'stock'        && $currentOrder == 'DESC') ? 'selected' : '' ?>>Stok Banyak→Sedikit</option>
        </select>

        <a id="clear-filters" class="btn btn-ghost" href="/seller/products">Reset</a>

      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="card table-card">
    <?php if (empty($products)): ?>
      <div class="empty">
        <img src="/images/empty-box.svg" alt="" />
        <h3>Belum ada produk</h3>
        <p>Tambahkan produk pertamamu untuk mulai berjualan</p>
        <a href="/seller/products/add" class="btn btn-primary">Tambah Produk</a>
      </div>
    <?php else: ?>
      <div class="table-wrap">
        <table class="tp-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($products as $p): ?>
              <?php
                $active        = ((int)$p['stock'] > 0);
                $img           = $p['main_image_path'] ?? '/assets/images/placeholder.png';

                // --- STATUS LELANG ---
                $auctionStatus = $p['auction_status'] ?? null; // ex: 'scheduled', 'active', 'ongoing', 'ended'
                $auctionId     = $p['auction_id'] ?? null;
                $inAuction     = in_array($auctionStatus, ['scheduled', 'active', 'ongoing'], true);

                // text badge lelang
                $auctionBadgeText  = $inAuction ? 'DALAM LELANG' : 'Tidak dilelang';
                $auctionBadgeClass = $inAuction ? 'badge-auction--on' : 'badge-auction--off';
              ?>
              <tr 
                data-id="<?= (int)$p['product_id'] ?>"
                data-stock="<?= (int)$p['stock'] ?>"
                data-auction-id="<?= $auctionId ? (int)$auctionId : '' ?>"
                data-auction-status="<?= htmlspecialchars((string)$auctionStatus) ?>"
              >
                <td>
                  <div class="status-cell">
                    <span class="badge-dot <?= $active ? 'on' : 'off' ?>"></span>
                    <span class="status-text"><?= $active ? 'Aktif' : 'Habis' ?></span>

                    <!-- Badge lelang sesuai spek -->
                    <span class="badge-auction <?= $auctionBadgeClass ?>">
                      <?= $auctionBadgeText ?>
                    </span>
                  </div>
                </td>

                <td>
                  <div class="prod">
                    <img class="thumb" src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($p['product_name']) ?>">
                    <div class="meta">
                      <div class="name"><?= htmlspecialchars($p['product_name']) ?></div>
                      <div class="muted">ID: <?= (int)$p['product_id'] ?></div>
                    </div>
                  </div>
                </td>

                <td><span class="pill"><?= htmlspecialchars($p['category_names'] ?? '-') ?></span></td>

                <td>Rp <?= number_format((float)$p['price'], 0, ',', '.') ?></td>

                <td>
                  <span class="badge <?= ((int)$p['stock'] < 10) ? 'warn' : 'ok' ?>"><?= (int)$p['stock'] ?></span>
                </td>

                <td class="actions">
                  <!-- Tombol EDIT & DELETE: harus disabled kalau produk sedang dilelang -->
                  <a class="icon-btn <?= $inAuction ? 'is-disabled' : '' ?>"
                    href="<?= $inAuction ? 'javascript:void(0)' : '/seller/products/' . (int)$p['product_id'] . '/edit' ?>"
                    title="<?= $inAuction ? 'Tidak dapat mengubah produk yang sedang dilelang' : 'Edit' ?>">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </a>

                  <button class="icon-btn danger btn-delete <?= $inAuction ? 'is-disabled' : '' ?>"
                          data-product-id="<?= (int)$p['product_id'] ?>"
                          data-product-name="<?= htmlspecialchars($p['product_name']) ?>"
                          title="<?= $inAuction ? 'Tidak dapat menghapus produk yang sedang dilelang' : 'Hapus' ?>"
                          <?= $inAuction ? 'disabled' : '' ?>>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m1 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h10z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </svg>
                  </button>

                  <!-- Tombol LELANG -->
                  <?php if ($inAuction && $auctionId): ?>
                    <!-- Produk sedang/lekan aktif → tampilkan "Lihat Lelang" -->
                    <a 
                      href="/auction/<?= (int)$auctionId ?>"
                      class="btn btn-ghost btn-sm"
                      title="Lihat detail lelang"
                    >
                      Lihat Lelang
                    </a>
                  <?php else: ?>
                    <!-- Produk belum dalam lelang → tampilkan "Jadikan Lelang" -->
                    <button 
                      type="button"
                      class="btn btn-primary btn-sm btn-start-auction"
                      data-product-id="<?= (int)$p['product_id'] ?>"
                      data-product-name="<?= htmlspecialchars($p['product_name']) ?>"
                      data-stock="<?= (int)$p['stock'] ?>"
                      title="Jadikan produk ini sebagai barang lelang"
                    >
                      Jadikan Lelang
                    </button>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
  <!-- Delete Confirmation Modal -->
  <div class="modal" id="deleteModal">
      <div class="modal-content">
          <div class="modal-header">
              <h3>Confirm Delete</h3>
          </div>
          <div class="modal-body">
              <p>Are you sure you want to delete <strong id="delete-product-name"></strong>?</p>
              <p class="text-danger">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-ghost" id="cancel-delete">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirm-delete" href="/seller/products">Delete</button>
          </div>
      </div>
  </div>
  <div class="modal" id="auctionModal" aria-hidden="true">
    <div class="modal-content modal-auction">
      <div class="modal-header">
        <h3>Mulai Lelang</h3>
        <button type="button" class="icon-btn" id="auction-close-btn" aria-label="Tutup">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <p class="modal-subtitle">
          Atur informasi lelang untuk produk: 
          <strong id="auction-product-name"></strong> 
          (<span id="auction-product-id"></span>)
        </p>

        <form id="auction-form" novalidate>
          <!-- hidden product_id -->
          <input type="hidden" name="productId" id="auction-product-id-input">

          <!-- Jam mulai lelang -->
          <div class="form-group">
            <label for="auction-start-time">Jam mulai lelang <span class="required">*</span></label>
            <input 
              type="datetime-local" 
              id="auction-start-time" 
              name="startTime" 
              required
            >
            <small class="field-hint">Tidak boleh di masa lalu.</small>
            <small class="field-error" data-error-for="startTime"></small>
          </div>

          <!-- Kuantitas barang -->
          <div class="form-group">
            <label for="auction-quantity">
              Kuantitas barang yang dilelang <span class="required">*</span>
            </label>
            <input 
              type="number" 
              id="auction-quantity" 
              name="quantity" 
              min="1"
              step="1"
              required
            >
            <small class="field-hint">
              Harus ≤ stok produk.
              Stok saat ini: <span id="auction-stock-label"></span>
            </small>
            <small class="field-error" data-error-for="quantity"></small>
          </div>

          <!-- Minimum increment -->
          <div class="form-group">
            <label for="auction-min-increment">
              Minimum increment (kenaikan minimal) <span class="required">*</span>
            </label>
            <input 
              type="number" 
              id="auction-min-increment" 
              name="minIncrement" 
              min="1"
              step="1"
              required
            >
            <small class="field-hint">Tidak boleh ≤ 0.</small>
            <small class="field-error" data-error-for="minIncrement"></small>
          </div>

          <!-- Starting price -->
          <div class="form-group">
            <label for="auction-starting-price">
              Starting price <span class="required">*</span>
            </label>
            <input 
              type="number" 
              id="auction-starting-price" 
              name="startingPrice" 
              min="1"
              step="1"
              required
            >
            <small class="field-hint">Tidak boleh ≤ 0.</small>
            <small class="field-error" data-error-for="startingPrice"></small>
          </div>

        </form>

        <div class="form-global-error" id="auction-global-error"></div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" id="auction-cancel-btn">
          Batal
        </button>
        <button type="button" class="btn btn-primary" id="auction-submit-btn">
          Mulai Lelang
        </button>
      </div>
    </div>
  </div>
</div>

<?php 
// Check if there's a success message
if (isset($_SESSION['success_message'])): 
    $message = $_SESSION['success_message'];
    unset($_SESSION['success_message']);
?>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            showToast('<?php echo addslashes($message); ?>', 'success');
        });
    </script>
<?php endif; ?>

<script src="/js/pages/product_management.js"></script>
