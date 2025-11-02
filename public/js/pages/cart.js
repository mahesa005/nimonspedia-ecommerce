const emptyCartHTML = `
    <div class="cart-empty">
        <img src="/image/empty-cart.svg" alt="Keranjang Kosong" class="empty-cart-icon">
        <p>Keranjang Anda masih kosong.</p>
        <a href="/" class="btn btn-primary">Mulai Belanja</a>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {

    const cartItemsContainer = document.querySelector('.cart-items');

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('btn-delete')) {
                handleDelete(target);
            }
            
            if (target.classList.contains('btn-inc') || target.classList.contains('btn-dec')) {
                handleQuantityChange(target);
            }
        });

        cartItemsContainer.addEventListener('change', (event) => {
             const target = event.target;
             if(target.classList.contains('input-quantity')) {
                handleQuantityInputChange(target);
             }
        });
    }

});


function handleDelete(button) {
    const itemId = button.dataset.itemId;

    if (!confirm('Anda yakin ingin menghapus item ini dari keranjang?')) return;

    fetch('/cart/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ cart_item_id: itemId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const itemElem = document.querySelector(`.cart-item[data-item-id="${itemId}"]`);
            const storeGroup = itemElem.closest('.store-group');

            itemElem.remove();

            if (storeGroup.querySelectorAll('.cart-item').length === 0) {
                storeGroup.remove();
            }

            updateTotals(data.grandTotal);
            updateNavbarBadge(data.newCount);

            if (data.stores) updateStoreTotals(data.stores);

            showToast('Item berhasil dihapus', 'success');

            const cartContainer = document.querySelector('.cart-container');
            const remainingStores = document.querySelectorAll('.store-group');

            if (remainingStores.length === 0 && cartContainer) {
                cartContainer.outerHTML = emptyCartHTML;
            }
        } else {
            showToast(data.message || 'Gagal menghapus item', 'error');
        }
    })
    .catch(err => {
        console.error('Network or JSON error:', err);
        showToast('Terjadi kesalahan jaringan', 'error');
    });
}

function handleQuantityChange(button) {
    const itemId = button.dataset.itemId;
    const input = document.querySelector(`.input-quantity[data-item-id="${itemId}"]`);
    let quantity = parseInt(input.value);
    
    if(button.classList.contains('btn-inc')) {
        quantity++;
    } else {
        quantity--;
    }
    
    if (quantity < 1) quantity = 1;
    
    input.value = quantity;
    
    updateItemOnServer(itemId, quantity, input);
}

function handleQuantityInputChange(input) {
    let quantity = parseInt(input.value);
    const itemId = input.dataset.itemId;

    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        input.value = 1;
    }
    
    updateItemOnServer(itemId, quantity, input);
}


function updateItemOnServer(itemId, quantity, input) {
    fetch('/cart/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ cart_item_id: itemId, quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const subtotalElem = document.getElementById(`subtotal-${itemId}`);
            if (subtotalElem && data.stores) {
                const store = Object.values(data.stores)[0];
                const item = store.items.find(i => i.cart_item_id === itemId);
                if (item) {
                    subtotalElem.textContent =
                        `Rp ${(item.product.price * item.quantity).toLocaleString('id-ID')}`;
                }
            }

            if (data.stores) updateStoreTotals(data.stores);

            const grandTotalElem = document.getElementById('grand-total');
            if (grandTotalElem) {
                grandTotalElem.textContent =
                    `Rp ${data.grandTotal.toLocaleString('id-ID')}`;
            }

            showToast('Kuantitas diperbarui', 'success');
        } else {
            showToast(data.message || 'Gagal update kuantitas', 'error');
            if (input) input.value = data.oldQuantity; 
        }
    })
    .catch(err => {
        console.error('Network or JSON error:', err);
        showToast('Terjadi kesalahan jaringan', 'error');
    });
}


function updateTotals(newGrandTotal) {
    document.getElementById('grand-total').textContent = `Rp ${newGrandTotal.toLocaleString('id-ID')}`;
}

function updateNavbarBadge(newCount) {
    const badge = document.querySelector('.item-counter');
    if (badge) {
        if (newCount > 0) {
            badge.textContent = newCount;
        } else {
            badge.remove();
        }
    }
}

function updateStoreTotals(stores) {
    Object.values(stores).forEach(store => {
        const storeTotalElem = document.getElementById(`store-total-${store.store_id}`);
        if (storeTotalElem) {
            storeTotalElem.textContent = `Rp ${store.storeTotal.toLocaleString('id-ID')}`;
        }

        const storeSummaryTotal = document.getElementById(`summary-store-total-${store.store_id}`);
        if (storeSummaryTotal) {
            storeSummaryTotal.textContent = `Rp ${store.storeTotal.toLocaleString('id-ID')}`;
        }
    });
}