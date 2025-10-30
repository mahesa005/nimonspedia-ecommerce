document.addEventListener('DOMContentLoaded', function() {
    initMetricAnimations();
    initEditStoreButton();

    function initMetricAnimations() {
        const metrics = document.querySelectorAll('.metric');
        metrics.forEach((metric, index) => {
            metric.style.opacity = '0';
            metric.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                metric.style.transition = 'all 0.5s ease';
                metric.style.opacity = '1';
                metric.style.transform = 'translateY(0)';
            }, index * 100);

            metric.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            });

            metric.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    function initEditStoreButton() {
        const btn = document.getElementById('editStoreBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                window.location.href = '/seller/store/edit';
            });
        }
    }
});