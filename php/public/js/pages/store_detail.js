document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('productsGrid');
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationInfo = document.getElementById('paginationInfo');
    const searchInput = document.getElementById('search-input');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const selectedCategoriesContainer = document.getElementById('selectedCategories');
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');
    const sortDropdown = document.getElementById('sort-dropdown');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const applyFiltersBtnSidebar = document.getElementById('apply-filters-sidebar-btn');
    
    const filterToggle = document.getElementById('filterToggle');
    const sidebar = document.getElementById('sidebar');

    const mainContent = document.querySelector('.main-content');
    const storeId = mainContent ? mainContent.dataset.storeId : null;

    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value, 10);
    let currentSearch = '';
    let currentCategories = [];
    let currentMinPrice = '';
    let currentMaxPrice = '';
    let currentSort = 'newest';
    let debounceTimer;
    let currentXHR = null;

    function createSkeletonCard() {
        return `
            <div class="product-card skeleton">
                <div class="skeleton-image"></div>
                <div class="skeleton-details">
                    <div class="skeleton-text skeleton-name"></div>
                    <div class="skeleton-text skeleton-price"></div>
                </div>
                <div class="skeleton-text skeleton-store"></div>
            </div>
        `;
    }

    function fetchAndRenderProducts() {
        if (currentXHR) {
            currentXHR.abort();
        }

        grid.innerHTML = '';
        const skeletonCount = itemsPerPage;
        for (let i = 0; i < skeletonCount; i++) grid.innerHTML += createSkeletonCard();
        paginationContainer.innerHTML = '';
        paginationInfo.textContent = 'Loading...';

        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);
        if (currentSearch) params.append('search', currentSearch);
        currentCategories.forEach(catId => params.append('categories[]', catId));
        if (currentMinPrice) params.append('min_price', currentMinPrice);
        if (currentMaxPrice) params.append('max_price', currentMaxPrice);
        if (currentSort) params.append('sort', currentSort);

        if (storeId) {
            params.append('store_id', storeId);
        }
        
        const apiUrl = `/api/get-products?${params.toString()}`;

        const browserUrl = `${window.location.pathname}?${params.toString()}`;
        history.pushState({ page: currentPage, search: currentSearch}, '', browserUrl);

        currentXHR = new XMLHttpRequest();
        currentXHR.open('GET', apiUrl, true);

        currentXHR.onload = function() {
            if (currentXHR.status >= 200 && currentXHR.status < 300) {
                try {
                    const response = JSON.parse(currentXHR.responseText);
                    grid.innerHTML = response.productHtml || '<p class="empty-state" style="grid-column: 1 / -1; text-align: center;">Tidak ada produk ditemukan.</p>';
                    paginationContainer.innerHTML = response.paginationHtml || '';
                    paginationInfo.textContent = response.paginationInfo || '';
                    currentPage = response.currentPage; 

                } catch (e) {
                    console.error("Error parsing JSON:", e, currentXHR.responseText);
                    grid.innerHTML = '<p class="error">Gagal memproses data produk.</p>';
                    paginationContainer.innerHTML = '';
                    paginationInfo.textContent = 'Error';
                }
            } else {
                console.error("Request failed:", currentXHR.status, currentXHR.statusText);
                grid.innerHTML = '<p class="error">Gagal memuat produk. Silakan coba lagi.</p>';
                paginationContainer.innerHTML = '';
                 paginationInfo.textContent = 'Error';
            }
            currentXHR = null;
        };

        currentXHR.onerror = function() {
            if (currentXHR && currentXHR.readyState !== 4) {
                 console.error("Network error occurred");
                 grid.innerHTML = '<p>Gagal terhubung ke server.</p>';
                 paginationContainer.innerHTML = '';
                 paginationInfo.textContent = 'Error';
            }
             currentXHR = null;
        };

        currentXHR.send();
    }

    function readStateFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        currentPage = parseInt(urlParams.get('page') || '1', 10);
        itemsPerPage = parseInt(urlParams.get('limit') || itemsPerPageSelect.value, 10);
        currentSearch = urlParams.get('search') || '';
        currentCategories = urlParams.getAll('categories[]') || [];
        currentMinPrice = urlParams.get('min_price') || '';
        currentMaxPrice = urlParams.get('max_price') || '';
        currentSort = urlParams.get('sort') || 'newest';

        searchInput.value = currentSearch;
        itemsPerPageSelect.value = itemsPerPage;
        sortDropdown.value = currentSort;
        priceMinInput.value = currentMinPrice;
        priceMaxInput.value = currentMaxPrice;
        categoryCheckboxes.forEach(cb => {
            cb.checked = currentCategories.includes(cb.value);
        });
        updateSelectedCategoriesUI();
    }

    function updateSelectedCategoriesUI() {
        selectedCategoriesContainer.innerHTML = '';
        currentCategories.forEach(catId => {
            const checkbox = document.querySelector(`.category-checkbox[value="${catId}"]`);
            if (checkbox) {
                const categoryName = checkbox.dataset.categoryName || `Category ${catId}`;
                const tag = document.createElement('div');
                tag.className = 'category-tag';
                tag.innerHTML = `
                    ${categoryName}
                    <button data-category-id="${catId}" title="Remove ${categoryName}">×</button>
                `;
                selectedCategoriesContainer.appendChild(tag);
            }
        });
    }

    // Debounce untuk input search
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = searchInput.value;
            currentPage = 1; 
            fetchAndRenderProducts();
        }, 500); 
    });

    document.getElementById('category-filter-group').addEventListener('change', (event) => {
        if (event.target.classList.contains('category-checkbox')) {
            currentCategories = Array.from(categoryCheckboxes)
                                   .filter(cb => cb.checked)
                                   .map(cb => cb.value);
            updateSelectedCategoriesUI();
            currentPage = 1;
            fetchAndRenderProducts(); 
        }
    });

    selectedCategoriesContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.dataset.categoryId) {
            const catIdToRemove = event.target.dataset.categoryId;
            const checkbox = document.querySelector(`.category-checkbox[value="${catIdToRemove}"]`);
            if (checkbox) {
                checkbox.checked = false;
                currentCategories = currentCategories.filter(id => id !== catIdToRemove);
                updateSelectedCategoriesUI();
                 currentPage = 1; 
                 fetchAndRenderProducts(); 
            }
        }
    });

    sortDropdown.addEventListener('change', () => {
        currentSort = sortDropdown.value;
        currentPage = 1;
        fetchAndRenderProducts();
    });

    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value, 10);
        currentPage = 1; 
        fetchAndRenderProducts();
    });

     applyFiltersBtnSidebar.addEventListener('click', () => {
         currentMinPrice = priceMinInput.value;
         currentMaxPrice = priceMaxInput.value;
         currentPage = 1;
         fetchAndRenderProducts();
         if (window.innerWidth <= 768) {
             sidebar.classList.remove('active');
             filterToggle.textContent = '☰ Filter';
         }
     });

    paginationContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.pagination-btn');
        if (targetButton && !targetButton.disabled && !targetButton.classList.contains('active')) {
            const pageToGo = parseInt(targetButton.dataset.page, 10);
            if (!isNaN(pageToGo)) {
                currentPage = pageToGo;
                fetchAndRenderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    function toggleFilterSection(header) {
      const icon = header.querySelector('.filter-toggle-icon');
      const content = header.nextElementSibling;
      icon.classList.toggle('collapsed');
      content.classList.toggle('collapsed');
    }

    window.toggleFilterSection = toggleFilterSection; 

    if (filterToggle && sidebar) {
        filterToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            filterToggle.textContent = sidebar.classList.contains('active') ? '✕ Close' : '☰ Filter';
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!e.target.closest('.sidebar') && !e.target.closest('.filter-toggle') && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    filterToggle.textContent = '☰ Filter';
                }
            }
        });
    }

    readStateFromUrl();
    fetchAndRenderProducts();
});