document.addEventListener('DOMContentLoaded', function() {
    const step2 = document.getElementById('step-2');
    const roleInputs = document.querySelectorAll('input[name="role"]');
    const storeNameInput = document.getElementById('store-name');
    const descriptionInput = document.getElementById('store-description-input');
    const form = document.querySelector('.forms-container');
    const registerButton = document.getElementById('registerButton');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const logoInput = document.getElementById('store-logo');

    roleInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'SELLER') {
                step2.style.display = 'block';
                storeNameInput.required = true;
            } else {
                step2.style.display = 'none';
                storeNameInput.required = false;
            }
        });
    });

    const quill = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: 'Deskripsikan toko Anda...',
    });

    quill.on('text-change', () => {
        descriptionInput.value = quill.root.innerHTML;
    });

    const oldDescription = descriptionInput.value;
    if (oldDescription) {
        quill.root.innerHTML = oldDescription;
    }

    const eyeOpenPass = document.getElementById('toggle-password-open');
    const eyeClosedPass = document.getElementById('toggle-password-closed');
    const eyeOpenCPass = document.getElementById('toggle-confirm-password-open');
    const eyeCloseCPass = document.getElementById('toggle-confirm-password-closed');

    if (passwordInput && eyeOpenPass && eyeClosedPass) {
        eyeOpenPass.addEventListener('click', () => {
            passwordInput.type = 'text';
            eyeOpenPass.style.display = 'none';
            eyeClosedPass.style.display = 'block';
        });

        eyeClosedPass.addEventListener('click', () => {
            passwordInput.type = 'password';
            eyeClosedPass.style.display = 'none';
            eyeOpenPass.style.display = 'block';
        });
    }

    if (confirmPasswordInput && eyeOpenCPass && eyeCloseCPass) {
        eyeOpenCPass.addEventListener('click', () => {
            confirmPasswordInput.type = 'text';
            eyeOpenCPass.style.display = 'none';
            eyeCloseCPass.style.display = 'block';
        });

        eyeCloseCPass.addEventListener('click', () => {
            confirmPasswordInput.type = 'password';
            eyeCloseCPass.style.display = 'none';
            eyeOpenCPass.style.display = 'block';
        });
    }

    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            let logoPreview = document.getElementById('logo-preview-container');
            if (!logoPreview) {
                logoPreview = document.createElement('div');
                logoPreview.id = 'logo-preview-container';
                logoInput.after(logoPreview);
            }

            const MAX_SIZE = 2 * 1024 * 1024;
            const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

            if (file.size > MAX_SIZE) {
                showToast('Ukuran file logo tidak boleh melebihi 2MB.', 'error');
                logoInput.value = '';
                logoPreview.innerHTML = '';
                return;
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                showToast('Tipe file logo tidak valid (hanya JPG, PNG, WEBP).', 'error');
                logoInput.value = '';
                logoPreview.innerHTML = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(ev) {
                logoPreview.innerHTML = `
                    <p class="forms-label" style="margin-top: 10px;">Preview Logo:</p>
                    <img src="${ev.target.result}" alt="Logo Preview" style="max-width: 150px; height: auto; border-radius: 8px; border: 1px solid #ccc;">
                `;
            };
            reader.readAsDataURL(file);
        });
    }

    if (typeof window.showToast !== 'function') {
        window.showToast = function(message, type) {
            console.log(`Toast (${type}): ${message}`);
            alert(message);
        };
    }

    if (form && registerButton) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            descriptionInput.value = quill.root.innerHTML;

            const errors = [];
            const password = passwordInput.value;
            const confirmPass = confirmPasswordInput.value;
            const selectedRole = document.querySelector('input[name="role"]:checked').value;

            if (password.length < 8) errors.push('Password minimal 8 karakter.');
            if (!/[A-Z]/.test(password)) errors.push('Password harus mengandung huruf besar.');
            if (!/[a-z]/.test(password)) errors.push('Password harus mengandung huruf kecil.');
            if (!/[0-9]/.test(password)) errors.push('Password harus mengandung angka.');
            if (!/[\W_]/.test(password)) errors.push('Password harus mengandung simbol.');
            if (password !== confirmPass) errors.push('Konfirmasi password tidak cocok.');

            if (selectedRole === 'SELLER') {
                const file = logoInput.files[0];

                if (storeNameInput.value.trim() === '') {
                    errors.push('Nama toko tidak boleh kosong.');
                }
                if (storeNameInput.value.length > 100) {
                    errors.push('Nama toko tidak boleh lebih dari 100 karakter.');
                }

                if (file) {
                    const MAX_SIZE = 2 * 1024 * 1024;
                    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
                    if (file.size > MAX_SIZE) errors.push('Ukuran file logo tidak boleh melebihi 2MB.');
                    if (!ALLOWED_TYPES.includes(file.type)) errors.push('Tipe file logo tidak valid (JPG, PNG, WEBP).');
                }
            }

            if (errors.length > 0) {
                errors.forEach(err => showToast(err, 'error'));
                registerButton.classList.remove('loading');
                registerButton.disabled = false;
            } else {
                registerButton.classList.add('loading');
                registerButton.disabled = true;
                form.submit();
            }
        });
    }
});