document.addEventListener('DOMContentLoaded', () => {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');

    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');

            if (navbarMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        navbarMenu.querySelectorAll('.navbar-link, .navbar-logout').forEach(link => {
            link.addEventListener('click', () => {
                 if (navbarMenu.classList.contains('active')) {
                     navbarToggle.classList.remove('active');
                     navbarMenu.classList.remove('active');
                     document.body.style.overflow = '';
                 }
            });
        });
    }
});