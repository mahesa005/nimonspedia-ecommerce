// Search with debounce
let searchTimeout;
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');

// Debounce search
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 500);
});

categoryFilter.addEventListener('change', applyFilters);

sortSelect.addEventListener('change', applyFilters);

function applyFilters() {
    const search = searchInput.value;
    const category = categoryFilter.value;
    const sortParts = sortSelect.value.split('-');

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sortParts[0]) params.set('sort_by', sortParts[0]);
    if (sortParts[1]) params.set('sort_order', sortParts[1]);

    window.location.href = '/seller/products?' + params.toString();
}

const deleteButtons = document.querySelectorAll('.btn-delete');
const deleteModal = document.getElementById('deleteModal');
const deleteProductName = document.getElementById('delete-product-name');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

let productToDelete = null;

deleteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        productToDelete = this.dataset.productId;
        const productName = this.dataset.productName;

        deleteProductName.textContent = productName;
        deleteModal.classList.add('show');
    });
});

deleteModal.addEventListener('click', function(e) {
    if (e.target === deleteModal) {
        deleteModal.classList.remove('show');
        productToDelete = null;
    }
});

cancelDeleteBtn.addEventListener('click', function() {
    deleteModal.classList.remove('show');
    productToDelete = null;
});

confirmDeleteBtn.addEventListener('click', function() {
    if (!productToDelete) return;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'Deleting...';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/seller/products/delete', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Delete';

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);

                    if (data.success) {
                        const row = document.querySelector(`tr[data-product-id="${productToDelete}"]`);
                        if (row) row.remove();

                        deleteModal.classList.remove('show');
                        window.location.reload();
                    } else {
                        alert('Error: ' + (data.message || 'Unknown error'));
                    }
                } catch (e) {
                    console.error('Invalid JSON:', e);
                    alert('Invalid server response');
                }
            } else {
                console.error('XHR Error:', xhr.status, xhr.statusText);
                alert('Failed to delete product');
            }

            productToDelete = null;
        }
    };

    xhr.onerror = function() {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete';
        console.error('XHR network error');
        alert('Network error occurred');
        productToDelete = null;
    };

    const body = JSON.stringify({ product_id: productToDelete });
    xhr.send(body);
});
