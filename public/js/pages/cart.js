const emptyCartHTML = `
    <div class="cart-empty-wrapper">
        <div class="cart-empty">
            <img src="/image/empty-cart.svg" alt="Keranjang Kosong" class="empty-cart-icon">
            <p>Keranjang Anda masih kosong.</p>
            <a href="/" class="btn btn-primary">Mulai Belanja</a>
        </div>
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
            if (target.classList.contains('input-quantity')) {
                handleQuantityInputChange(target);
            }
        });
    }
});

function handleDelete(button) {
    const itemId = button.dataset.itemId;
    if (!confirm('Anda yakin ingin menghapus item ini dari keranjang?')) return;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/cart/delete', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);

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
            } catch (err) {
                console.error('JSON parse error:', err);
                showToast('Terjadi kesalahan saat memproses respons', 'error');
            }
        } else {
            showToast('Terjadi kesalahan jaringan', 'error');
        }
    };

    xhr.onerror = function() {
        showToast('Terjadi kesalahan jaringan', 'error');
    };

    xhr.send(JSON.stringify({ cart_item_id: itemId }));
}

function handleQuantityChange(button) {
    const itemId = button.dataset.itemId;
    const input = document.querySelector(`.input-quantity[data-item-id="${itemId}"]`);
    const stock = parseInt(input.dataset.stock);
    let quantity = parseInt(input.value);

    if (button.classList.contains('btn-inc')) {
        quantity++;
    } else {
        quantity--;
    }

    if (quantity < 1) {
        quantity = 1;
        showToast(`Belanja minimal 1 produk`, 'error');
        return;
    }

    if (stock && quantity > stock) {
        quantity = stock;
        input.value = stock;
        showToast(`Stok maksimal ${stock}`, 'error');
        return;
    }

    input.value = quantity;
    updateItemOnServer(itemId, quantity, input);
}

function handleQuantityInputChange(input) {
    let quantity = parseInt(input.value);
    const itemId = input.dataset.itemId;
    const stock = parseInt(input.dataset.stock);

    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        input.value = 1;
        showToast(`Belanja minimal 1 produk`, 'error');
        return;
    }

    if (stock && quantity > stock) {
        quantity = stock;
        input.value = stock;
        showToast(`Stok maksimal ${stock}`, 'error');
        return;
    }

    updateItemOnServer(itemId, quantity, input);
}

function updateItemOnServer(itemId, quantity, input) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/cart/update', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);

                if (data.success) {
                    const subtotalElem = document.getElementById(`subtotal-${itemId}`);
                    if (subtotalElem && data.stores) {
                        let foundItem = null;
                        for (const store of Object.values(data.stores)) {
                            const item = store.items.find(i => i.cart_item_id == itemId);
                            if (item) {
                                foundItem = item;
                                break;
                            }
                        }

                        if (foundItem) {
                            subtotalElem.textContent =
                                `Rp ${(foundItem.product.price * foundItem.quantity).toLocaleString('id-ID')}`;
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
                    if (input) {
                        const safeValue = data.oldQuantity ?? input.value ?? 1;
                        input.value = parseInt(safeValue) || 1;
                    }
                }
            } catch (err) {
                console.error('JSON parse error:', err);
                showToast('Terjadi kesalahan saat memproses respons', 'error');
            }
        } else {
            showToast('Terjadi kesalahan jaringan', 'error');
        }
    };

    xhr.onerror = function() {
        showToast('Terjadi kesalahan jaringan', 'error');
    };

    xhr.send(JSON.stringify({ cart_item_id: itemId, quantity }));
}

function updateTotals(newGrandTotal) {
    const el = document.getElementById('grand-total');
    if (el) el.textContent = `Rp ${newGrandTotal.toLocaleString('id-ID')}`;
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