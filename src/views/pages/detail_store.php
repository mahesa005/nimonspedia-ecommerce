<?php

function truncate($text, $length = 100) {
    return strlen($text) > $length ? substr($text, 0, $length) . '...' : $text;
}
?>

<div class="store-page">
    
    <section class="store-header">
        <img src="<?= htmlspecialchars($store->store_logo_path ?? '/images/default-store.png') ?>" alt="store logo" class="store-logo">
        <div class="store-meta">
            <h1><?= htmlspecialchars($store->store_name ?? 'Store') ?></h1>
            <div><?= $store->store_description ?? '' ?></div>
        </div>
    </section>

    <section class="store-filters">
        <form method="GET" class="filter-form">
            <input type="search" name="q" placeholder="Cari produk di toko ini..." 
                   value="<?= htmlspecialchars($filters['q'] ?? '') ?>">
            
            <input type="number" name="min_price" placeholder="Harga Min" 
                   value="<?= htmlspecialchars($filters['min_price'] ?? '') ?>">
            
            <input type="number" name="max_price" placeholder="Harga Max" 
                   value="<?= htmlspecialchars($filters['max_price'] ?? '') ?>">

            <select name="category_id">
                <option value="">Semua Kategori</option>
                <?php foreach ($categories as $category): ?>
                    <option value="<?= $category->category_id ?>" 
                        <?= (isset($filters['category_id']) && $filters['category_id'] == $category->category_id) ? 'selected' : '' ?>>
                        <?= htmlspecialchars($category->name) ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <button type="submit" class="btn">Filter</button>
        </form>
    </section>

    <section class="store-products">
        <h2>Products (Total: <?= $pagination['total'] ?>)</h2>
        <?php if (empty($products)): ?>
            <p>Tidak ada produk yang cocok dengan filter Anda.</p>
        <?php else: ?>
            <div class="product-grid">
                <?php foreach ($products as $p): ?>
                    <div class="product-card <?= $p->stock == 0 ? 'out-of-stock' : '' ?>">
                        <img src="<?= htmlspecialchars($p->main_image_path ?? $p->image_path ?? '/images/default-product.png') ?>" alt="<?= htmlspecialchars($p->product_name) ?>" class="product-image">
                        <div class="product-body">
                            <h3><?= htmlspecialchars($p->product_name) ?></h3>
                            <p class="product-desc"><?= htmlspecialchars(truncate($p->description ?? ($p->short_desc ?? ''))) ?></p>
                            <p class="product-price">Rp <?= number_format((float)($p->price ?? 0), 0, ',', '.') ?></p>
                            <?php if ($p->stock == 0): ?>
                                <p class="stock-info"><strong>Stok Habis</strong></p>
                            <?php endif; ?>
                            <div class="product-actions">
                                <a class="btn" href="/product/<?= (int)$p->product_id ?>">View</a>
                                <button class="btn add-to-cart" data-id="<?= (int)$p->product_id ?>" <?= $p->stock == 0 ? 'disabled' : '' ?>>
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>

    <nav class="pagination">
        <?php if ($pagination['totalPages'] > 1): ?>
            <?php if ($pagination['page'] > 1): ?>
                <a href="?<?= http_build_query(array_merge($filters, ['page' => $pagination['page'] - 1])) ?>">&laquo; Prev</a>
            <?php endif; ?>
            <?php for ($i = 1; $i <= $pagination['totalPages']; $i++): ?>
                <a href="?<?= http_build_query(array_merge($filters, ['page' => $i])) ?>" 
                   class="<?= $i == $pagination['page'] ? 'active' : '' ?>">
                   <?= $i ?>
                </a>
            <?php endfor; ?>
            <?php if ($pagination['page'] < $pagination['totalPages']): ?>
                <a href="?<?= http_build_query(array_merge($filters, ['page' => $pagination['page'] + 1])) ?>">Next &raquo;</a>
            <?php endif; ?>
        <?php endif; ?>
    </nav>
</div>
