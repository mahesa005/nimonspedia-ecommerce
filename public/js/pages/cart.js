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

    if (!confirm('Anda yakin ingin menghapus item ini dari keranjang?')) {
        return;
    }

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
            document.querySelector(`.cart-item[data-item-id="${itemId}"]`).remove();
            
            updateTotals(data.newGrandTotal); 
            
            updateNavbarBadge(data.newCount);

            showToast('Item berhasil dihapus', 'success');
        } else {
            showToast(data.message || 'Gagal menghapus item', 'error');
        }
    })
    .catch(() => showToast('Terjadi kesalahan jaringan', 'error'));
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
    
    updateItemOnServer(itemId, quantity);
}

function handleQuantityInputChange(input) {
    let quantity = parseInt(input.value);
    const itemId = input.dataset.itemId;

    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        input.value = 1;
    }
    
    updateItemOnServer(itemId, quantity);
}


function updateItemOnServer(itemId, quantity) {
    
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
            document.getElementById(`subtotal-${itemId}`).textContent = `Rp ${data.newSubtotal.toLocaleString('id-ID')}`;
            document.getElementById('grand-total').textContent = `Rp ${data.newGrandTotal.toLocaleString('id-ID')}`;
            
            showToast('Kuantitas diperbarui', 'success');
        } else {
            showToast(data.message || 'Gagal update kuantitas', 'error');
            input.value = data.oldQuantity; 
        }
    })
    .catch(() => showToast('Terjadi kesalahan jaringan', 'error'));
}

function updateTotals(newGrandTotal) {
    document.getElementById('grand-total').textContent = `Rp ${newGrandTotal.toLocaleString('id-ID')}`;
}

function updateNavbarBadge(newCount) {
    const badge = document.getElementById('cart-badge');
    if(badge) {
        badge.textContent = newCount;
        badge.style.display = newCount > 0 ? 'block' : 'none';
    }
}