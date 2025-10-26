document.addEventListener('DOMContentLoaded', function() {
    
    const passwordInput = document.getElementById('password');
    const eyeOpen = document.querySelector('.eye-open');
    const eyeClosed = document.querySelector('.eye-closed');

    if (passwordInput && eyeOpen && eyeClosed) {
        eyeOpen.addEventListener('click', () => {
          passwordInput.type = 'text';
          eyeOpen.style.display = 'none';
          eyeClosed.style.display = 'block';
        });

        eyeClosed.addEventListener('click', () => {
          passwordInput.type = 'password';
          eyeClosed.style.display = 'none';
          eyeOpen.style.display = 'block';
        });
    }

    const form = document.querySelector('.forms-container');
    const loginButton = document.getElementById('loginButton');

    if (form && loginButton) {
        form.addEventListener('submit', () => {
            loginButton.classList.add('loading');
            loginButton.disabled = true;
        });
    }

});