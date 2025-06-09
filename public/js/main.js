// Main JavaScript file for Job Portal

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-dismiss alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Handle job search form submission
    const jobSearchForm = document.querySelector('form[action="/jobs"]');
    if (jobSearchForm) {
        jobSearchForm.addEventListener('submit', function(e) {
            // Prevent empty search submissions
            const searchInput = this.querySelector('input[name="search"]');
            if (searchInput && searchInput.value.trim() === '') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // Location-based form functionality
    const isRemoteCheckbox = document.getElementById('is_remote');
    const locationInput = document.getElementById('location');
    
    if (isRemoteCheckbox && locationInput) {
        isRemoteCheckbox.addEventListener('change', function() {
            if (this.checked) {
                locationInput.disabled = true;
                locationInput.value = '';
            } else {
                locationInput.disabled = false;
            }
        });
        
        // Initialize on page load
        if (isRemoteCheckbox.checked) {
            locationInput.disabled = true;
        }
    }

    // Salary range validation
    const salaryMinInput = document.getElementById('salary_min');
    const salaryMaxInput = document.getElementById('salary_max');
    
    if (salaryMinInput && salaryMaxInput) {
        salaryMaxInput.addEventListener('change', function() {
            const minValue = parseInt(salaryMinInput.value) || 0;
            const maxValue = parseInt(this.value) || 0;
            
            if (maxValue > 0 && maxValue < minValue) {
                alert('Maximum salary cannot be less than minimum salary');
                this.value = minValue;
            }
        });
    }

    // Share functionality (placeholder)
    const shareButtons = document.querySelectorAll('.btn[data-share]');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const url = window.location.href;
            
            // Check if Web Share API is available
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: url
                }).then(() => {
                    console.log('Successfully shared');
                }).catch(error => {
                    console.error('Error sharing:', error);
                    fallbackShare(url);
                });
            } else {
                fallbackShare(url);
            }
        });
    });

    function fallbackShare(url) {
        // Fallback for browsers that don't support Web Share API
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = url;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        
        alert('Link copied to clipboard!');
    }

    // Initialize date fields with default values if needed
    const deadlineInput = document.getElementById('deadline');
    if (deadlineInput && !deadlineInput.value) {
        // Set default deadline to 30 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        
        // Format date as YYYY-MM-DD
        const year = defaultDate.getFullYear();
        const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const day = String(defaultDate.getDate()).padStart(2, '0');
        
        deadlineInput.value = `${year}-${month}-${day}`;
    }
});