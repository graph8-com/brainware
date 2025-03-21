document.addEventListener('DOMContentLoaded', function() {
    // Get the modal
    const modal = document.getElementById('application-modal');
    
    // Get all buttons that should open the modal
    const applyButtons = document.querySelectorAll('.apply-now-btn');
    
    // Get the close button
    const closeButton = document.querySelector('.modal-close');
    
    // When the user clicks on an apply button, open the modal
    applyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden'); // Prevent scrolling
        });
    });
    
    // When the user clicks on the close button, close the modal
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeModal();
        });
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal function
    function closeModal() {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        document.getElementById('application-form').reset();
        document.getElementById('form-message').textContent = '';
        document.getElementById('form-message').classList.add('hidden');
    }
    
    // Handle form submission
    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(applicationForm);
            
            // Submit form asynchronously
            fetch('save_application.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const messageElement = document.getElementById('form-message');
                messageElement.classList.remove('hidden');
                
                if (data.success) {
                    messageElement.textContent = data.message;
                    messageElement.classList.remove('text-red-500');
                    messageElement.classList.add('text-green-500');
                    
                    // Reset form after successful submission
                    setTimeout(() => {
                        applicationForm.reset();
                        // Close modal after 2 seconds
                        setTimeout(closeModal, 2000);
                    }, 1000);
                } else {
                    messageElement.textContent = data.message;
                    messageElement.classList.remove('text-green-500');
                    messageElement.classList.add('text-red-500');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const messageElement = document.getElementById('form-message');
                messageElement.classList.remove('hidden');
                messageElement.textContent = 'An error occurred. Please try again.';
                messageElement.classList.remove('text-green-500');
                messageElement.classList.add('text-red-500');
            });
        });
    }
});
