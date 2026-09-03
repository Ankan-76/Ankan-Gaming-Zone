document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Modal Elements
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Function to close modal
    const closeModal = () => {
        modal.classList.remove('active');
    };

    // Event Listener: Close modal on button click
    closeModalBtn.addEventListener('click', closeModal);

    // Event Listener: Close modal if clicking outside the box (on the overlay)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Event Listener: Form Submission
    form.addEventListener('submit', function (event) {
        // Prevent default HTML form submission
        event.preventDefault();
        event.stopPropagation();

        let isValid = true;
        const inputs = form.querySelectorAll('.form-control');

        // 1. Reset previous validation states
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });

        // 2. Perform Validation
        inputs.forEach(input => {
            // Check for empty values
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            }
            
            // Check specific Email format
            if (input.type === "email") {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(input.value)) {
                    input.classList.add('is-invalid');
                    isValid = false;
                }
            }
        });

        // 3. If Valid, Submit to Google Sheets
        if (isValid) {
            // Change button state to "Loading"
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Transmitting...';
            submitBtn.disabled = true;

            // PASTE YOUR GOOGLE SHEET SCRIPT URL HERE
            const scriptURL = 'https://script.google.com/macros/s/AKfycbzjCkoVVbe74Wuqz63NE-M1l18YKlEBtg59pFFQ2FV0Thb0a2ZmPT61H5aJqvZdOtZm/exec';

            fetch(scriptURL, { method: 'POST', body: new FormData(form)})
                .then(response => {
                    form.reset();
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    modal.classList.add('active');
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    alert('Transmission failed. Please try again.');
                });
        }
    });

    // Event Listener: Real-time validation removal
    // (Removes red border as soon as user starts typing)
    form.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', function () {
            if (this.classList.contains('is-invalid')) {
                this.classList.remove('is-invalid');
            }
        });
    });
});