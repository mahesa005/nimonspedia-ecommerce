document.addEventListener('DOMContentLoaded', () => {

    const orderList = document.querySelector('.order-list');
    
    if (!orderList) {
        return;
    }

    orderList.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        
        if (!target) return;

        if (target.classList.contains('btn-view-details')) {
            event.preventDefault();
            handleToggleDetails(target);
        }
        
        if (target.classList.contains('btn-confirm-receipt')) {
            event.preventDefault();
            handleUpdateStatus(target, 'received', 'Apakah Anda yakin sudah menerima pesanan ini?');
        }
        
        if (target.classList.contains('btn-cancel-order')) {
            event.preventDefault();
            handleUpdateStatus(target, 'rejected', 'Apakah Anda yakin ingin membatalkan pesanan ini? Saldo akan dikembalikan.');
        }
    });

    function handleToggleDetails(button) {
        const orderCard = button.closest('.order-card');
        if (orderCard) {
            orderCard.classList.toggle('details-active');
            
            if (orderCard.classList.contains('details-active')) {
                button.textContent = 'Sembunyikan Detail';
            } else {
                button.textContent = 'Lihat Detail';
            }
        }
    }

    function handleUpdateStatus(buttonElement, status, confirmMessage) {
        const orderId = buttonElement.dataset.orderId;
        if (!orderId) return;

        if (!confirm(confirmMessage)) {
            return;
        }

        const originalText = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<span class="loading-spinner"></span> Memproses...'; 

        const formData = new FormData();
        formData.append('order_id', orderId);
        formData.append('status', status);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/orders/update-status', true); 

        xhr.onload = function() {
            let result;
            const contentType = xhr.getResponseHeader('content-type');

            try {
                if (contentType && contentType.includes('application/json')) {
                    result = JSON.parse(xhr.responseText);
                } else {
                    console.error('Non-JSON response:', xhr.responseText);
                    throw new Error('Server mengembalikan response yang tidak valid');
                }
                
                if (xhr.status >= 200 && xhr.status < 300 && result.success) {
                    showToast(result.message || 'Status berhasil diperbarui', 'success');
                    
                    const statusBadge = document.getElementById(`status-badge-${orderId}`);
                    if (statusBadge) {
                        statusBadge.textContent = ucfirst(status.replace('_', ' '));
                        statusBadge.className = 'order-status';
                        statusBadge.classList.add(`status-${status}`);
                    }

                    const actionsDiv = document.getElementById(`actions-${orderId}`);
                    if (actionsDiv) {
                        if (status === 'received') {
                            const storeLink = document.querySelector(`#order-card-${orderId} .store-link`);
                            let storeHref = '/'; 
                            if (storeLink) {
                                storeHref = storeLink.getAttribute('href');
                            }
                            actionsDiv.innerHTML = `<a href="${storeHref}" class="btn btn-primary">Beli Lagi</a>`;
                        } else if (status === 'rejected') {
                            actionsDiv.innerHTML = '<p>Pesanan Dibatalkan</p>';
                            location.reload(); 
                        }
                    }
                    
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
        };

        xhr.onerror = function() {
            console.error('Network Error');
            showToast('Terjadi kesalahan jaringan. Coba lagi.', 'error');
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
        };

        xhr.send(formData);
    }

    if (typeof window.showToast !== 'function') {
        window.showToast = function(message, type) {
            console.log(`Toast (${type}): ${message}`);
            alert(message);
        };
    }
    function ucfirst(str) {
        if (typeof str !== 'string' || str.length === 0) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});