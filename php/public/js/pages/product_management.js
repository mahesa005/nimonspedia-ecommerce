// ===== EXPANDABLE ROWS =====
function initializeExpandableRows() {
  const expandToggles = document.querySelectorAll('.expand-toggle');
  
  expandToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const productId = this.dataset.productId;
      const detailRow = document.querySelector(`.row-detail[data-product-id="${productId}"]`);
      
      if (detailRow) {
        detailRow.classList.toggle('visible');
        this.classList.toggle('expanded');
      }
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeExpandableRows);

// ===== SEARCH & FILTERS =====
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

// ===== AUCTION MODAL =====
const auctionModal = document.getElementById('auctionModal');
const auctionForm = document.getElementById('auction-form');
const auctionSubmitBtn = document.getElementById('auction-submit-btn');
const auctionCancelBtn = document.getElementById('auction-cancel-btn');
const auctionCloseBtn = document.getElementById('auction-close-btn');
const startAuctionButtons = document.querySelectorAll('.btn-start-auction');

let selectedProduct = null;

// Helper: Get JWT token from localStorage (Node API auth)
function getAuthToken() {
  return localStorage.getItem('PHPSESSID') || ''; //
}

// Helper: Set field error message
function setFieldError(fieldName, message) {
  const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = message ? 'block' : 'none';
  }
}

// Helper: Clear all field errors
function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

// Helper: Show global error
function setGlobalError(message) {
  const globalError = document.getElementById('auction-global-error');
  if (globalError) {
    globalError.textContent = message;
    globalError.style.display = message ? 'block' : 'none';
  }
}

// Helper: Clear global error
function clearGlobalError() {
  setGlobalError('');
}

// Open auction modal
startAuctionButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    const productId = parseInt(this.dataset.productId);
    const productName = this.dataset.productName;
    const stock = parseInt(this.dataset.stock);

    selectedProduct = { id: productId, name: productName, stock: stock };

    // Populate modal with product data
    document.getElementById('auction-product-name').textContent = productName;
    document.getElementById('auction-product-id').textContent = productId;
    document.getElementById('auction-product-id-input').value = productId;
    document.getElementById('auction-stock-label').textContent = stock;

    // Set min/max for quantity
    const quantityInput = document.getElementById('auction-quantity');
    quantityInput.max = stock;
    quantityInput.value = '';

    // Clear form
    auctionForm.reset();
    clearFieldErrors();
    clearGlobalError();

    // Set default start time to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('auction-start-time').min = now.toISOString().slice(0, 16);

    // Show modal
    auctionModal.classList.add('show');
    auctionModal.setAttribute('aria-hidden', 'false');
  });
});

// Close auction modal
function closeAuctionModal() {
  auctionModal.classList.remove('show');
  auctionModal.setAttribute('aria-hidden', 'true');
  selectedProduct = null;
  auctionForm.reset();
  clearFieldErrors();
  clearGlobalError();
}

auctionCancelBtn.addEventListener('click', closeAuctionModal);
auctionCloseBtn.addEventListener('click', closeAuctionModal);

// Close modal on backdrop click
auctionModal.addEventListener('click', function(e) {
  if (e.target === auctionModal) {
    closeAuctionModal();
  }
});

// Validate form fields
function validateAuctionForm() {
  clearFieldErrors();
  clearGlobalError();
  
  const productId = parseInt(document.getElementById('auction-product-id-input').value);
  const startTime = document.getElementById('auction-start-time').value;
  const quantity = parseInt(document.getElementById('auction-quantity').value);
  const minIncrement = parseInt(document.getElementById('auction-min-increment').value);
  const startingPrice = parseInt(document.getElementById('auction-starting-price').value);

  let isValid = true;

  // Validate start time (not in past)
  if (!startTime) {
    setFieldError('startTime', 'Jam mulai lelang harus diisi');
    isValid = false;
  } else {
    const startDateTime = new Date(startTime);
    if (startDateTime < new Date()) {
      setFieldError('startTime', 'Jam mulai tidak boleh di masa lalu');
      isValid = false;
    }
  }

  // Validate quantity
  if (!quantity || quantity <= 0) {
    setFieldError('quantity', 'Kuantitas harus lebih dari 0');
    isValid = false;
  } else if (quantity > selectedProduct.stock) {
    setFieldError('quantity', `Kuantitas tidak boleh lebih dari stok (${selectedProduct.stock})`);
    isValid = false;
  }

  // Validate min increment
  if (!minIncrement || minIncrement <= 0) {
    setFieldError('minIncrement', 'Minimum increment harus lebih dari 0');
    isValid = false;
  }

  // Validate starting price
  if (!startingPrice || startingPrice <= 0) {
    setFieldError('startingPrice', 'Harga awal harus lebih dari 0');
    isValid = false;
  }

  return isValid;
}

// Submit auction form
auctionSubmitBtn.addEventListener('click', async function() {
  if (!validateAuctionForm()) {
    return;
  }

  if (!selectedProduct) {
    setGlobalError('Product tidak ditemukan');
    return;
  }

  auctionSubmitBtn.disabled = true;
  auctionSubmitBtn.textContent = 'Loading...';

  const formData = {
    productId: selectedProduct.id,
    startingPrice: parseInt(document.getElementById('auction-starting-price').value),
    minIncrement: parseInt(document.getElementById('auction-min-increment').value),
    quantity: parseInt(document.getElementById('auction-quantity').value),
    startTime: document.getElementById('auction-start-time').value + ':00Z',
    endTime: new Date(new Date(document.getElementById('auction-start-time').value).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19) + 'Z'
  };

  try {
    // Authentication menggunakan PHP session cookies (PHPSESSID) yang otomatis dikirim browser
    const response = await fetch('/api/node/auctions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Kirim cookies termasuk PHPSESSID
      body: JSON.stringify(formData)
    });

    auctionSubmitBtn.disabled = false;
    auctionSubmitBtn.textContent = 'Mulai Lelang';

    const data = await response.json();

    // Cek status 401/403 untuk session expired
    if (response.status === 401 || response.status === 403) {
      setGlobalError('Session expired. Silakan login kembali.');
      console.error('Auth Error:', response.status);
      return;
    }

    if (response.ok && data.success) {
      showToast('Lelang berhasil dibuat!', 'success');
      closeAuctionModal();
      // Reload the page to see updated auction status
      setTimeout(() => window.location.reload(), 1500);
    } else {
      const errorMsg = data.message || 'Failed to create auction';
      setGlobalError(errorMsg);
      console.error('API Error:', data);
    }
  } catch (error) {
    auctionSubmitBtn.disabled = false;
    auctionSubmitBtn.textContent = 'Mulai Lelang';
    console.error('Request failed:', error);
    setGlobalError('Terjadi kesalahan jaringan. Silakan coba lagi.');
  }
});

