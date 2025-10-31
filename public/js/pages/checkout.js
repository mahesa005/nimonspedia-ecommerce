document.addEventListener('DOMContentLoaded', () => {
    const editAddressBtn = document.getElementById('editAddressBtn');
    const addressDisplay = document.getElementById('addressDisplay');
    const editAddressForm = document.getElementById('editAddressForm');
    const cancelEditAddressBtn = document.getElementById('cancelEditAddressBtn');
    const saveAddressBtn = document.getElementById('saveAddressBtn');
    const addressInput = document.getElementById('addressInput');
    const addressText = document.getElementById('addressText');

    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const confirmModalWrapper = document.getElementById('confirmModalWrapper');
    const confirmDialog = document.getElementById('confirmDialog');
    const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
    const confirmCheckoutBtn = document.getElementById('confirmCheckoutBtn');
    const openTopupModalBtn = document.getElementById('openTopupModalBtn');

    if (editAddressBtn) {
        editAddressBtn.addEventListener('click', () => {
            addressDisplay.style.display = 'none';
            editAddressForm.style.display = 'block';
            addressInput.focus();
        });
    }
    if (cancelEditAddressBtn) {
        cancelEditAddressBtn.addEventListener('click', () => {
            addressDisplay.style.display = 'block';
            editAddressForm.style.display = 'none';
            addressInput.value = addressText.innerText.trim();
        });
    }
    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', () => {
            const newAddress = addressInput.value;
            if (newAddress.trim() === '') {
                showToast('Alamat tidak boleh kosong.', 'error');
                return;
            }
            
            saveAddressBtn.disabled = true;
            saveAddressBtn.textContent = 'Menyimpan...';

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/profile/address', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            xhr.onload = function() {
                saveAddressBtn.disabled = false;
                saveAddressBtn.textContent = 'Simpan Alamat';
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        addressText.innerText = newAddress;
                        addressDisplay.style.display = 'block';
                        editAddressForm.style.display = 'none';
                        showToast(response.message || 'Alamat berhasil diperbarui!', 'success');
                    } else {
                        showToast(response.message || 'Gagal menyimpan alamat.', 'error');
                    }
                } catch (e) {
                    showToast('Gagal memproses respons server.', 'error');
                }
            };
            xhr.onerror = () => {
                 saveAddressBtn.disabled = false;
                 saveAddressBtn.textContent = 'Simpan Alamat';
                 showToast('Gagal terhubung ke server.', 'error');
            };
            xhr.send(`address=${encodeURIComponent(newAddress)}`);
        });
    }

    if (openTopupModalBtn) {
        openTopupModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const openBtn = document.getElementById('openBalanceModal');
            if(openBtn) {
                openBtn.click();
            } else {
                console.error('Tombol modal top-up tidak ditemukan.');
            }
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            confirmModalWrapper.style.display = 'flex';
            confirmDialog.showModal();
        });
    }
    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', () => {
            confirmDialog.close();
        });
    }
    if (confirmModalWrapper) {
        confirmModalWrapper.addEventListener('click', (e) => {
             if (e.target === confirmModalWrapper) {
                 confirmDialog.close();
             }
        });
    }
     if (confirmDialog) {
        confirmDialog.addEventListener('close', () => {
             confirmModalWrapper.style.display = 'none';
        });
     }
    
    if (confirmCheckoutBtn) {
        confirmCheckoutBtn.addEventListener('click', () => {
            const btnText = checkoutBtn.querySelector('.btn-text');
            const loader = checkoutBtn.querySelector('.loader');
            
            checkoutBtn.disabled = true;
            if(btnText) btnText.style.display = 'none';
            if(loader) loader.style.display = 'inline-block';

            confirmDialog.close();
            
            checkoutForm.submit();
        });
    }
});