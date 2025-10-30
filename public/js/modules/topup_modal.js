document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('balanceDialog');
    const openBtn = document.getElementById('openBalanceModal');
    const closeBtn = document.getElementById('closeBalanceDialog');
    const form = document.getElementById('topUpForm');
    const amountInput = document.getElementById('topUpAmount');

    if (!dialog || !openBtn || !closeBtn || !form || !amountInput) {
        console.warn("Elemen modal top-up tidak ditemukan.");
        return;
    }

    openBtn.addEventListener('click', () => {
        dialog.showModal();
        amountInput.focus();
    });

    closeBtn.addEventListener('click', () => {
         dialog.close();
    });

    dialog.addEventListener('click', e => {
        if (e.target === dialog) {
            dialog.close();
            modalWrapper.style.display = 'none';
        }
    });
    
    dialog.addEventListener('close', () => {
        form.reset();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(amountInput.value, 10);

        if (isNaN(amount) || amount < 1000) {
            showToast('Tolong masukkan jumlah yang valid (minimal Rp 1.000)', 'error');
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/buyer/balance/topup', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onload = function() {
            dialog.close();
            try {
                const response = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && response.success) {
                    showToast(response.message || 'Top up berhasil!', 'success');
                    const balanceElement = document.querySelector('.navbar-balance');
                    if (balanceElement && response.newBalanceFormatted) {
                        balanceElement.textContent = 'Rp ' + response.newBalanceFormatted; 
                    }
                } else {
                    showToast(response.message || 'Top up gagal. Silakan coba lagi.', 'error');
                }
            } catch (error) {
                 showToast('Terjadi kesalahan saat memproses top up.', 'error');
                 console.error("Top up error:", error, xhr.responseText);
            }
        };

        xhr.onerror = function() {
            dialog.close();
            showToast('Gagal terhubung ke server. Periksa koneksi Anda.', 'error');
            console.error("Network error during top up");
        };

        xhr.send(`amount=${amount}`); 
    });
});