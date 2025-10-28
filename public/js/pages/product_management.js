// Search with debounce
let searchTimeout;
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');

// Debounce search
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 500); // 500ms debounce
});

// Category filter
categoryFilter.addEventListener('change', function() {
    applyFilters();
});

// Sort change
sortSelect.addEventListener('change', function() {
    applyFilters();
});

// Apply filters by updating URL
function applyFilters() {
    const search = searchInput.value;
    const category = categoryFilter.value;
    const sort = sortSelect.value.split('-');
    
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort[0]) params.set('sort_by', sort[0]);
    if (sort[1]) params.set('sort_order', sort[1]);
    
    window.location.href = '/seller/products?' + params.toString();
}

// Delete product
const deleteButtons = document.querySelectorAll('.btn-delete');
const deleteModal = document.getElementById('delete-modal');
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

cancelDeleteBtn.addEventListener('click', function() {
    deleteModal.classList.remove('show');
    productToDelete = null;
});

confirmDeleteBtn.addEventListener('click', function() {
    if (!productToDelete) return;
    
    // Show loading
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'Deleting...';
    
    // Send delete request
    fetch('/seller/products/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productToDelete
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove row from table
            const row = document.querySelector(`tr[data-product-id="${productToDelete}"]`);
            if (row) {
                row.remove();
            }
            
            // Close modal
            deleteModal.classList.remove('show');
            
            // Show success message (optional)
            alert('Product deleted successfully');
            
            // Reload if no products left
            const tbody = document.querySelector('.products-table tbody');
            if (tbody && tbody.children.length === 0) {
                window.location.reload();
            }
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete product');
    })
    .finally(() => {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete';
        productToDelete = null;
    });
});

// Close modal on outside click
deleteModal.addEventListener('click', function(e) {
    if (e.target === deleteModal) {
        deleteModal.classList.remove('show');
        productToDelete = null;
    }
});