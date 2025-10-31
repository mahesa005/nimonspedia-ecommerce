// Tunggu sampai semua HTML dimuat
document.addEventListener('DOMContentLoaded', () => {

    const profileForm = document.getElementById('form-update-profile');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    const passwordForm = document.getElementById('form-change-password');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    const toggleButtons = document.querySelectorAll('.btn-toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetInput = document.getElementById(btn.dataset.target);
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                btn.textContent = 'Sembunyikan';
            } else {
                targetInput.type = 'password';
                btn.textContent = 'Lihat';
            }
        });
    });
});

async function handleProfileUpdate(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('#btn-save-profile');
    const msgEl = document.getElementById('profile-msg');
    
    setLoading(button, true);
    const formData = new FormData(form);

    try {
        const response = await fetch('/profile/update', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToastMessage(result.message, 'success');
        } else {
            showToastMessage(result.message || 'Gagal memperbarui profil.', 'error');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showToastMessage('Terjadi kesalahan jaringan.', 'error');
    } finally {
        setLoading(button, false);
    }
}

async function handlePasswordChange(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('#btn-save-password');
    const msgEl = document.getElementById('password-msg');

    const newPass = form.new_password.value;
    const confirmPass = form.confirm_password.value;
    
    // Validasi client-side
    if (newPass !== confirmPass) {
        showMessage(msgEl, 'Password baru dan konfirmasi tidak cocok.', 'error');
        return;
    }
    
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!regex.test(newPass)) {
        showMessage(msgEl, 'Password baru harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.', 'error');
        return;
    }

    const isConfirmed = confirm('Anda yakin ingin mengubah password Anda?');
    if (!isConfirmed) return;

    setLoading(button, true);
    const formData = new FormData(form);

    try {
        const response = await fetch('/profile/password', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToastMessage(result.message, 'success');
            form.reset();
        } else {
            showToastMessage(result.message || 'Gagal mengubah password.', 'error');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showToastMessage('Terjadi kesalahan jaringan.', 'error');
    } finally {
        setLoading(button, false);
    }
}

function setLoading(button, isLoading) {
    const spinner = button.querySelector('.loading-spinner');
    if (isLoading) {
        button.disabled = true;
        spinner.style.display = 'inline-block';
    } else {
        button.disabled = false;
        spinner.style.display = 'none';
    }
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'form-message ' + type;
}

function showToastMessage(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.warn('Fungsi showToast() tidak ditemukan. Tampilkan via alert.');
        alert(message);
    }
}
