document.addEventListener('DOMContentLoaded', function() {
    const step2 = document.getElementById('step-2');
    const roleInputs = document.querySelectorAll('input[name="role"]');
    
    roleInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'SELLER') {
                step2.style.display = 'block';
                document.getElementById('store-name').required = true;
            } else {
                step2.style.display = 'none';
                document.getElementById('store-name').required = false;
            }
        });
    });

    const quill = new Quill('#editor-container', {
      theme: 'snow',
      placeholder: 'Deskripsikan toko Anda...',
    });

    const descriptionInput = document.getElementById('store-description-input');

    quill.on('text-change', () => {
      descriptionInput.value = quill.root.innerHTML;
    });

    const oldDescription = document.getElementById('store-description-input').value;
    if (oldDescription) {
        quill.root.innerHTML = oldDescription;
    }


    const form = document.querySelector('.forms-container');
    const registerButton = document.getElementById('registerButton');

    if (form && registerButton) {
        form.addEventListener('submit', () => {
            registerButton.classList.add('loading');
            registerButton.disabled = true;
        });
    }

    const passwordInput = document.getElementById('password');
    const eyeOpenPass = document.querySelector('.eye-open');
    const eyeClosedPass = document.querySelector('.eye-closed');
    const confirmPassword = document.getElementById('confirm_password');
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

    if (confirmPassword && eyeOpenCPass && eyeCloseCPass) {
        eyeOpenCPass.addEventListener('click', () => {
          confirmPassword.type = 'text';
          eyeOpenCPass.style.display = 'none';
          eyeCloseCPass.style.display = 'block';
        });

        eyeCloseCPass.addEventListener('click', () => {
          confirmPassword.type = 'password';
          eyeCloseCPass.style.display = 'none';
          eyeOpenCPass.style.display = 'block';
        });
    }

});