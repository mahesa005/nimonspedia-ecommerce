document.addEventListener('DOMContentLoaded', () => {

    const profileForm = document.getElementById('form-update-profile');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    const passwordForm = document.getElementById('form-change-password');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    const toggleIcons = document.querySelectorAll('.eye-icon');
    toggleIcons.forEach(icon => {
        icon.addEventListener('click', togglePasswordVisibility);
    });
});

function handleProfileUpdate(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('#btn-save-profile');
    const msgEl = document.getElementById('profile-msg');

    setLoading(button, true);

    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/profile/update', true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            setLoading(button, false);

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (result.success) {
                        showToastMessage(result.message, 'success');
                    } else {
                        showToastMessage(result.message || 'Gagal memperbarui profil.', 'error');
                    }
                } catch (e) {
                    console.error('Invalid JSON:', e);
                    showToastMessage('Respon server tidak valid.', 'error');
                }
            } else {
                showToastMessage('Terjadi kesalahan jaringan.', 'error');
            }
        }
    };

    xhr.onerror = function() {
        setLoading(button, false);
        showToastMessage('Terjadi kesalahan jaringan.', 'error');
    };

    xhr.send(formData);
}

function handlePasswordChange(event) {
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

    if (!confirm('Anda yakin ingin mengubah password Anda?')) return;

    setLoading(button, true);

    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/profile/password', true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            setLoading(button, false);

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (result.success) {
                        showToastMessage(result.message, 'success');
                        form.reset();
                    } else {
                        showToastMessage(result.message || 'Gagal mengubah password.', 'error');
                    }
                } catch (e) {
                    console.error('Invalid JSON:', e);
                    showToastMessage('Respon server tidak valid.', 'error');
                }
            } else {
                showToastMessage('Terjadi kesalahan jaringan.', 'error');
            }
        }
    };

    xhr.onerror = function() {
        setLoading(button, false);
        showToastMessage('Terjadi kesalahan jaringan.', 'error');
    };

    xhr.send(formData);
}

function setLoading(button, isLoading) {
    const spinner = button.querySelector('.loading-spinner');
    if (isLoading) {
        button.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
    } else {
        button.disabled = false;
        if (spinner) spinner.style.display = 'none';
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
        console.warn('Fungsi showToast() tidak ditemukan. Menampilkan via alert.');
        alert(message);
    }
}

function togglePasswordVisibility(event) {
    const clickedIcon = event.currentTarget;
    const targetInputId = clickedIcon.dataset.target;
    if (!targetInputId) return;

    const input = document.getElementById(targetInputId);
    if (!input) return;

    const wrapper = clickedIcon.parentElement;
    const eyeOpen = wrapper.querySelector('.eye-open');
    const eyeClosed = wrapper.querySelector('.eye-closed');

    if (input.type === 'password') {
        input.type = 'text';
        if (eyeOpen) eyeOpen.style.display = 'none';
        if (eyeClosed) eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        if (eyeOpen) eyeOpen.style.display = 'block';
        if (eyeClosed) eyeClosed.style.display = 'none';
    }
}
