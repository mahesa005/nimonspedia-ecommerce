document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-confirm-receipt').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const orderId = this.dataset.orderId;
            
            if (confirm('Apakah Anda yakin sudah menerima pesanan ini?')) {
                await updateOrderStatus(orderId, 'received', this);
            }
        });
    });

    document.querySelectorAll('.btn-cancel-order').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const orderId = this.dataset.orderId;
            
            if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Saldo akan dikembalikan.')) {
                await updateOrderStatus(orderId, 'rejected', this);
            }
        });
    });
});

async function updateOrderStatus(orderId, status, buttonElement) {
    const originalText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<span class="loading-spinner"></span> Memproses...';

    try {
        const formData = new FormData();
        formData.append('order_id', orderId);
        formData.append('status', status);

        const response = await fetch('/orders/update-status', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server mengembalikan response yang tidak valid');
        }
        
        if (response.ok && result.success) {
            showToast(result.message || 'Status berhasil diperbarui', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showToast(result.message || 'Gagal memperbarui status', 'error');
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Terjadi kesalahan: ' + error.message, 'error');
        buttonElement.disabled = false;
        buttonElement.innerHTML = originalText;
    }
}

if (typeof window.showToast !== 'function') {
    window.showToast = function(message, type) {
        alert(message);
    };
}