<link rel="stylesheet" href="/css/pages/product_management.css">

<div class="tp-page">
  <!-- Top Bar: Title + CTA -->
  <div class="tp-heading card">
    <div class="left">
      <h1>Kelola Produk</h1>
      <p class="sub">Pantau performa produk dan kelola stok secara cepat</p>
    </div>
    <div class="right">
      <a href="/seller/products/add" class="btn btn-primary">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        Buat Produk Baru
      </a>
    </div>
  </div>


  <!-- Metrics cards -->
  <div class="metric-grid">
    <div class="metric card">
      <div class="label">Produk Aktif</div>
      <div class="value"><?= number_format($stats['active_products'] ?? count($products ?? [])) ?></div>
      <div class="delta up">+<?= (int)($stats['active_delta'] ?? 0) ?></div>
    </div>
    <div class="metric card">
      <div class="label">Stok Menipis</div>
      <div class="value warn"><?= number_format($stats['low_stock'] ?? 0) ?></div>
      <div class="delta">perlu tindakan</div>
    </div>
    <div class="metric card">
      <div class="label">Pendapatan Bulan Ini</div>
      <div class="value">Rp <?= number_format($stats['revenue_month'] ?? 0, 0, ',', '.') ?></div>
      <div class="delta up">+<?= (int)($stats['revenue_delta'] ?? 0) ?>%</div>
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
              $active = ((int)$p['stock'] > 0);
              $img = $p['main_image_path'] ?? '/assets/images/placeholder.png';
            ?>
            <tr data-id="<?= (int)$p['product_id'] ?>">
              <td>
                <span class="badge-dot <?= $active ? 'on' : 'off' ?>"></span>
                <span class="status-text"><?= $active ? 'Aktif' : 'Habis' ?></span>
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
                <a class="icon-btn" href="/seller/products/<?= (int)$p['product_id'] ?>/edit" title="Edit">
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                </a>
                <button class="icon-btn danger btn-delete"
                        data-product-id="<?= (int)$p['product_id'] ?>"
                        data-product-name="<?= htmlspecialchars($p['product_name']) ?>"
                        title="Hapus">
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m1 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h10z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
                </button>
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
              <button type="button" class="btn btn-danger" id="confirm-delete">Delete</button>
          </div>
      </div>
  </div>
</div>

<script src="/js/pages/product_management.js"></script>
