document.addEventListener('DOMContentLoaded', function() {
    const quantityInput = document.getElementById('quantityInput');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const stockStatus = document.getElementById('stockStatus');
    
    const stockText = stockStatus?.textContent || '';
    const stockMatch = stockText.match(/\((\d+) unit\)/);
    const maxStock = stockMatch ? parseInt(stockMatch[1]) : 25;
    
    if (quantityInput) {
        quantityInput.max = maxStock;
    }
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
                updateButtonStates();
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue < maxStock) {
                quantityInput.value = currentValue + 1;
                updateButtonStates();
            } else {
                showToast('Jumlah maksimal adalah ' + maxStock + ' unit', 'error');
            }
        });
    }
    
    function updateButtonStates() {
        const currentValue = parseInt(quantityInput.value);
        
        if (decreaseBtn) {
            decreaseBtn.disabled = currentValue <= 1;
        }
        
        if (increaseBtn) {
            increaseBtn.disabled = currentValue >= maxStock;
        }
    }
    
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            
            if (isNaN(value) || value < 1) {
                this.value = 1;
            } else if (value > maxStock) {
                this.value = maxStock;
                showToast('Jumlah maksimal adalah ' + maxStock + ' unit', 'error');
            }
            
            updateButtonStates();
        });
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async function() {
            if (this.disabled) {
                showToast('Produk sedang tidak tersedia', 'error');
                return;
            }
            
            const quantity = parseInt(quantityInput.value);
            const productName = document.getElementById('productName')?.textContent || 'Produk';
            const productId = getProductIdFromPage();
            
            if (!productId) {
                showToast('ID produk tidak ditemukan', 'error');
                return;
            }
            
            if (quantity < 1 || quantity > maxStock) {
                showToast('Jumlah tidak valid', 'error');
                return;
            }
            
            addToCartBtn.disabled = true;
            const btnText = addToCartBtn.querySelector('.btn-text');
            const originalText = btnText.innerHTML;
            btnText.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning"><circle cx="12" cy="12" r="10"></circle></svg> Menambahkan...';
            
            try {
                const response = await addToCartAPI(productId, quantity);
                
                if (response.success) {
                    showToast(response.message || `${productName} berhasil ditambahkan ke keranjang (${quantity} unit)`, 'success');
                    
                    quantityInput.value = 1;
                    updateButtonStates();
                    
                    if (response.cartItemCount) {
                        updateCartBadge(response.cartItemCount);
                    }
                } else {
                    showToast(response.message || 'Gagal menambahkan ke keranjang', 'error');
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                showToast(error.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
            } finally {
                addToCartBtn.disabled = false;
                btnText.innerHTML = originalText;
            }
        });
    }
    
    function addToCartAPI(productId, quantity) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.open('POST', '/api/cart/add', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            xhr.onload = function() {
                try {
                    const data = JSON.parse(xhr.responseText);
                    
                    if (xhr.status >= 200 && xhr.status < 400) {
                        resolve(data);
                    } else {
                        reject(new Error(data.message || 'Gagal menambahkan ke keranjang'));
                    }
                } catch (e) {
                    reject(new Error('Terjadi kesalahan saat memproses respons server'));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('Terjadi kesalahan jaringan. Silakan coba lagi.'));
            };
            
            xhr.ontimeout = function() {
                reject(new Error('Permintaan timeout. Silakan coba lagi.'));
            };
            
            xhr.timeout = 30000;
            
            const requestData = JSON.stringify({
                product_id: productId,
                quantity: quantity
            });
            
            xhr.send(requestData);
        });
    }
    
    function getProductIdFromPage() {
        const urlMatch = window.location.pathname.match(/\/products\/(\d+)/);
        if (urlMatch) {
            return parseInt(urlMatch[1]);
        }
        
        return null;
    }
    
    function updateCartBadge(count) {
        const cartBadge = document.querySelector('.item-counter');
        if (cartBadge && count !== undefined) {
            cartBadge.textContent = count;
        } else if (!cartBadge && count == 1) {
            const newBadge = document.createElement('div');
            newBadge.classList.add('item-counter');
            newBadge.textContent = count;
            const cartIcon = document.querySelector('.navbar-cart');
            if (cartIcon) {
                cartIcon.appendChild(newBadge);
            }
        }
    }
    
    updateButtonStates();
});