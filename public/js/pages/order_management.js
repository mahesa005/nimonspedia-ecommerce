const statusLabels = {
    'waiting_approval': 'Menunggu Persetujuan',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'on_delivery': 'Dalam Pengiriman',
    'completed': 'Selesai'
};

const statusColors = {
    'waiting_approval': 'orange',
    'approved': 'blue',
    'rejected': 'red',
    'on_delivery': 'purple',
    'completed': 'green'
};

function showOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    
    document.getElementById('modalOrderId').textContent = '#' + order.order_id;
    document.getElementById('modalBuyerName').textContent = order.buyer_name || 'N/A';
    document.getElementById('modalTotal').textContent = 'Rp ' + parseInt(order.total_price).toLocaleString('id-ID');
    document.getElementById('modalAddress').textContent = order.shipping_address || '-';
    document.getElementById('modalDate').textContent = new Date(order.created_at).toLocaleString('id-ID');
    
    const statusBadge = `<span class="status-badge status-${statusColors[order.status] || 'gray'}">${statusLabels[order.status] || order.status}</span>`;
    document.getElementById('modalStatus').innerHTML = statusBadge;
    
    renderOrderActions(order);
    
    modal.classList.add('active');
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

document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-20px)';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
});