document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Animate confidence meters on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress-bar');
                if (progressBar) {
                    const width = progressBar.getAttribute('aria-valuenow') || progressBar.style.width;
                    progressBar.style.width = '0%';
                    setTimeout(() => {
                        progressBar.style.width = width;
                    }, 100);
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.match-card').forEach(card => {
        observer.observe(card);
    });

    // Filter buttons on Homepage
    const filterButtons = document.querySelectorAll('[data-filter]');
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                filterButtons.forEach(b => b.classList.remove('active', 'btn-primary'));
                filterButtons.forEach(b => b.classList.add('btn-outline-primary'));
                
                // Add active to clicked
                e.target.classList.remove('btn-outline-primary');
                e.target.classList.add('active', 'btn-primary');
                
                // In a real app, this would filter the DOM or make an AJAX call
                // For now, we'll just console log
                console.log('Filter:', e.target.dataset.filter);
            });
        });
    }

    // Confirmation for delete actions
    const deleteForms = document.querySelectorAll('form[action*="/delete/"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
                form.submit();
            }
        });
    });
});
