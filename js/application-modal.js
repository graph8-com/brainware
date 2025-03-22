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
            
            // Show loading state
            const messageElement = document.getElementById('form-message');
            messageElement.classList.remove('hidden', 'text-red-500', 'text-green-500');
            messageElement.classList.add('text-white');
            messageElement.textContent = 'Submitting application...';
            
            // Get form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const country = document.getElementById('country').value.trim();
            const note = document.getElementById('note').value.trim();
            
            console.log("Form data being submitted:", { name, email, country, note });
            
            // Client-side validation
            if (!name || !email || !country) {
                messageElement.textContent = 'Please fill in all required fields.';
                messageElement.classList.remove('text-white', 'text-green-500');
                messageElement.classList.add('text-red-500');
                return;
            }
            
            // Format data for text file and email
            const timestamp = new Date().toISOString();
            const formattedData = `Timestamp: ${timestamp}\nName: ${name}\nEmail: ${email}\nCountry: ${country}\nNote: ${note}\n------------------------------------------------------\n\n`;
            
            // Save application to localStorage as a backup
            try {
                // Get existing applications or initialize empty array
                const applications = JSON.parse(localStorage.getItem('brainware_applications') || '[]');
                
                // Add new application
                applications.push({
                    timestamp,
                    name,
                    email,
                    country,
                    note,
                    formattedText: formattedData
                });
                
                // Save back to localStorage
                localStorage.setItem('brainware_applications', JSON.stringify(applications));
                
                // Track the application submission with Jitsu
                // Using the global analytics object that Jitsu creates
                if (window.analytics) {
                    try {
                        console.log('About to track application with Jitsu...');
                        window.analytics.track('application_submitted', {
                            timestamp,
                            name,
                            email,
                            country,
                            note,
                            page_url: window.location.href,
                            page_title: document.title
                        });
                        console.log('Application tracked with Jitsu - event sent successfully');
                    } catch (jitsuError) {
                        console.error('Error tracking with Jitsu:', jitsuError);
                    }
                } else {
                    console.error('Jitsu analytics object not available - make sure Jitsu script is loaded');
                    // Fallback to using window.jitsu if available (newer method)
                    if (window.jitsu) {
                        try {
                            console.log('Trying fallback with window.jitsu...');
                            window.jitsu.push(["track", "application_submitted", {
                                timestamp,
                                name,
                                email,
                                country,
                                note,
                                page_url: window.location.href,
                                page_title: document.title
                            }]);
                            console.log('Application tracked with window.jitsu method');
                        } catch (e) {
                            console.error('Error using fallback jitsu method:', e);
                        }
                    }
                }
                
                // Also try to save via server as a backup
                fetch('http://localhost:8080/save_application', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        name,
                        email,
                        country,
                        note
                    }).toString()
                })
                .then(response => {
                    console.log('Server response:', response.status);
                })
                .catch(error => {
                    console.error('Server error:', error);
                });
                
                // Create download for the applications.txt file
                const allFormattedData = applications.map(app => app.formattedText).join('');
                const blob = new Blob([allFormattedData], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                // Add a new hidden download element to the form
                let downloadBtn = document.getElementById('download-applications');
                if (!downloadBtn) {
                    downloadBtn = document.createElement('a');
                    downloadBtn.id = 'download-applications';
                    downloadBtn.className = 'hidden';
                    downloadBtn.textContent = 'Download Applications';
                    downloadBtn.download = 'applications.txt';
                    applicationForm.appendChild(downloadBtn);
                }
                
                // Update the download link
                downloadBtn.href = url;
                
                // Show success message with download option
                messageElement.innerHTML = `
                    <p class="mb-2">Application submitted successfully!</p>
                    <p class="text-sm mb-3">Your application has been sent to Brainware. You can also:</p>
                    <div class="flex space-x-3">
                        <button id="show-download" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-sm transition-colors">
                            Download Applications
                        </button>
                        <a href="view-applications.html" target="_blank" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm transition-colors inline-flex items-center">
                            View Applications
                        </a>
                    </div>
                `;
                messageElement.classList.remove('text-red-500', 'text-white');
                messageElement.classList.add('text-green-500');
                
                // Add event listener to the download button
                document.getElementById('show-download').addEventListener('click', function() {
                    downloadBtn.click();
                });
                
                // Reset form after success (8 seconds delay)
                setTimeout(() => {
                    applicationForm.reset();
                }, 8000);
                
            } catch (error) {
                console.error('Error:', error);
                messageElement.textContent = 'An error occurred while processing your application. Please try again.';
                messageElement.classList.remove('text-green-500', 'text-white');
                messageElement.classList.add('text-red-500');
            }
        });
    }
});
