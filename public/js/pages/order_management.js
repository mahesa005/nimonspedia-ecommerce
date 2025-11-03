const statusLabels = {
    'waiting_approval': 'Menunggu Persetujuan',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'on_delivery': 'Dalam Pengiriman',
    'received': 'Diterima', 
    'completed': 'Selesai'
};

const statusColors = {
    'waiting_approval': 'orange',
    'approved': 'blue',
    'rejected': 'red',
    'on_delivery': 'purple',
    'received': 'green', 
    'completed': 'green'
};

// Auto-submit filter form
document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filterForm');
    const statusSelect = document.getElementById('status');
    const searchInput = document.getElementById('search');
    let searchTimeout;

    // Auto-submit on status change
    statusSelect.addEventListener('change', function() {
        filterForm.submit();
    });

    // Auto-submit on search input with debounce (wait 500ms after user stops typing)
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterForm.submit();
        }, 500); // 500ms delay
    });

    // Auto-hide alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-20px)';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
});

function showOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    
    document.getElementById('modalOrderId').textContent = '#' + order.order_id;
    document.getElementById('modalBuyerName').textContent = order.buyer_name || 'N/A';
    document.getElementById('modalTotal').textContent = 'Rp ' + parseInt(order.total_price).toLocaleString('id-ID');
    document.getElementById('modalAddress').textContent = order.shipping_address || '-';
    document.getElementById('modalDate').textContent = new Date(order.created_at).toLocaleString('id-ID');
    
    // Set status
    const statusLabels = {
        'waiting_approval': 'Menunggu Persetujuan',
        'approved': 'Disetujui',
        'rejected': 'Ditolak',
        'on_delivery': 'Dalam Pengiriman',
        'received': 'Diterima',
        'completed': 'Selesai'
    };
    
    const statusColors = {
        'waiting_approval': 'orange',
        'approved': 'blue',
        'rejected': 'red',
        'on_delivery': 'purple',
        'received': 'green',
        'completed': 'green'
    };
    
    const statusLabel = statusLabels[order.status] || order.status;
    const statusColor = statusColors[order.status] || 'gray';
    
    document.getElementById('modalStatus').innerHTML = 
        `<span class="status-badge status-${statusColor}">${statusLabel}</span>`;
    
    // Render products list

    renderOrderActions(order);
    const productsList = document.getElementById('modalProductsList');
    productsList.innerHTML = '';
    if (order.products && order.products.length > 0) {
        order.products.forEach(p => {
            const item = document.createElement('div');
            item.className = 'product-item';
            const img = p.main_image_path ? `<img src="${p.main_image_path}" alt="${escapeHtml(p.product_name)}" class="product-image">`
                                          : `<div class="product-image-placeholder"><svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></div>`;
            item.innerHTML = `
                ${img}
                <div class="product-details">
                    <div class="product-name"><strong>${escapeHtml(p.product_name)}</strong></div>
                    <div class="product-meta">
                        <span>Kuantitas: ${p.quantity}</span>
                        <span class="product-price"> Rp ${Number(p.subtotal * p.quantity).toLocaleString('id-ID')}</span>
                        <span>Subtotal: Rp ${Number(p.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            `;
            productsList.appendChild(item);
        });
    } else {
        productsList.innerHTML = '<div class="muted">Tidak ada produk</div>';
    }
    
    modal.classList.add('active');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function closeModal() {
    document.getElementById('orderModal').classList.remove('active');
}

function renderOrderActions(order) {
    const container = document.getElementById('orderActions');
    let html = '';

    if (order.status === 'waiting_approval') {
        html = `
            <form method="POST" action="/seller/orders/action" class="action-form" onsubmit="return confirm('Setujui pesanan ini?')">
                <input type="hidden" name="action" value="approve">
                <input type="hidden" name="order_id" value="${order.order_id}">
                <button type="submit" class="btn btn-primary" style="width: 100%">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    Setujui Pesanan
                </button>
            </form>
            
            <form method="POST" action="/seller/orders/action" class="action-form" onsubmit="return confirmReject(event)">
                <input type="hidden" name="action" value="reject">
                <input type="hidden" name="order_id" value="${order.order_id}">
                <div class="form-group">
                    <label for="reject_reason">Alasan Penolakan *</label>
                    <textarea name="reject_reason" id="reject_reason" required placeholder="Masukkan alasan penolakan..."></textarea>
                </div>
                <button type="submit" class="btn" style="width: 100%; background: var(--red); color: white">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    Tolak Pesanan
                </button>
            </form>
        `;
    } else if (order.status === 'approved') {
        html = `
            <form method="POST" action="/seller/orders/action" class="action-form" onsubmit="return confirm('Atur pengiriman pesanan ini?')">
                <input type="hidden" name="action" value="set_delivery">
                <input type="hidden" name="order_id" value="${order.order_id}">
                <div class="form-group">
                    <label for="delivery_time">Waktu Pengiriman *</label>
                    <input type="datetime-local" name="delivery_time" id="delivery_time" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    Atur Pengiriman
                </button>
            </form>
        `;
    } else if (order.status === 'rejected' && order.reject_reason) {
        html = `
            <div class="action-form" style="background: var(--red-light); border: 1px solid var(--red)">
                <strong style="color: var(--red)">Alasan Penolakan:</strong>
                <p style="margin-top: 8px">${order.reject_reason}</p>
            </div>
        `;
    } else if (order.status === 'on_delivery' && order.delivery_time) {
        html = `
            <div class="action-form" style="background: var(--purple-light); border: 1px solid var(--purple)">
                <strong style="color: var(--purple)">Waktu Pengiriman:</strong>
                <p style="margin-top: 8px">${new Date(order.delivery_time).toLocaleString('id-ID')}</p>
            </div>
        `;
    
    } else if (order.status === 'received') {
        html = `
            <div class="action-form" style="background: var(--tp-green-light); border: 1px solid var(--tp-green)">
                <strong style="color: var(--tp-green-dark)">✓ Pesanan Diterima</strong>
                <p style="margin-top: 8px">Balance toko telah diupdate dengan Rp ${parseInt(order.total_price).toLocaleString('id-ID')}</p>
            </div>
        `;
    } else if (order.status === 'completed') {
        html = `
            <div class="action-form" style="background: var(--tp-green-light); border: 1px solid var(--tp-green)">
                <strong style="color: var(--tp-green-dark)">✓ Pesanan Selesai</strong>
            </div>
        `;
    } else {
        html = '<p style="text-align: center; color: var(--tp-gray-500)">Tidak ada aksi yang tersedia</p>';
    }

    container.innerHTML = html;
}

function confirmReject(e) {
    const reason = document.getElementById('reject_reason').value.trim();
    if (!reason) {
        alert('Alasan penolakan wajib diisi');
        e.preventDefault();
        return false;
    }
    return confirm('Yakin ingin menolak pesanan ini? Saldo pembeli akan dikembalikan.');
}

window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
}