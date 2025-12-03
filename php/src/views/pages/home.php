<?php
use App\Core\View;
?>
<div class="container">
    <aside class="sidebar" id="sidebar">
        <div class="filter-title">Filter</div>
        
        <div class="filter-section">
            <div class="filter-header" onclick="toggleFilterSection(this)">
                <span>Kategori</span>
                <span class="filter-toggle-icon">▼</span>
            </div>
            <div class="filter-content">
                <div class="filter-group" id="category-filter-group">
                    <?php if (!empty($categories)): ?>
                        <?php foreach ($categories as $category): ?>
                            <label>
                                <input type="checkbox" 
                                       class="category-checkbox" 
                                       name="categories[]" 
                                       value="<?php echo $category->category_id; ?>"
                                       data-category-name="<?php echo htmlspecialchars($category->name); ?>">
                                <?php echo htmlspecialchars($category->name); ?>
                            </label>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <p>Kategori tidak tersedia.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <div class="filter-section">
            <div class="filter-header" onclick="toggleFilterSection(this)">
                <span>Harga</span>
                <span class="filter-toggle-icon">▼</span>
            </div>
            <div class="filter-content">
                <div class="filter-group">
                    <div class="price-inputs">
                        <div class="price-input-group">
                            <label>Rp</label>
                            <input type="number" id="priceMin" placeholder="Min" min="0" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        </div>
                        <div class="price-input-group">
                            <label>Rp</label>
                            <input type="number" id="priceMax" placeholder="Max" min="0" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button id="apply-filters-sidebar-btn" class="btn btn--primary" style="width: 100%; margin-top: 1rem;">Terapkan Filter</button>
    </aside>

    <div class="main-content">
        <div class="search-section">
            <button class="filter-toggle" id="filterToggle">☰ Filter</button>
            <div class="search-bar">
                <input type="search" id="search-input" placeholder="Search products..."> 
                <select class="sort-dropdown" id="sort-dropdown" aria-label="Urutkan berdasarkan"> 
                    <option value="newest">Terbaru</option>
                    <option value="price-low">Harga: Rendah ke Tinggi</option>
                    <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
            </div>
        </div>

        <div class="selected-categories" id="selectedCategories"></div>

        <div class="products-grid" id="productsGrid">
            <p>Memuat Produk...</p>
        </div>

        <div class="pagination-section">
            <div class="items-per-page">
                <label for="itemsPerPage">Tampilkan:</label>
                <select id="itemsPerPage"> 
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="12" selected>12</option> 
                    <option value="16">16</option>
                </select>
            </div>
            <div class="pagination-info" id="paginationInfo"> 
                Menampilkan 0-0 dari 0
            </div>
            <div class="pagination-buttons" id="paginationContainer"> 
            </div>
        </div>
    </div>
</div>