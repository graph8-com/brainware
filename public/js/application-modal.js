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
                            // Ensure jitsu.push is available before calling it
                            if (typeof window.jitsu.push === 'function') {
                                window.jitsu.push(["track", "application_submitted", {
                                    timestamp,
                                    name,
                                    email,
                                    country,
                                    note,
                                    page_url: window.location.href,
                                    page_title: document.title,
                                    application_source: 'founders_page'
                                }]);
                                console.log('Application tracked with window.jitsu method');
                            } else {
                                // Direct tracking with jitsu.track if available
                                if (typeof window.jitsu.track === 'function') {
                                    window.jitsu.track("application_submitted", {
                                        timestamp,
                                        name,
                                        email,
                                        country,
                                        note,
                                        page_url: window.location.href,
                                        page_title: document.title,
                                        application_source: 'founders_page'
                                    });
                                    console.log('Application tracked with window.jitsu.track method');
                                } else {
                                    console.error('No valid jitsu tracking method available');
                                }
                            }
                        } catch (e) {
                            console.error('Error using fallback jitsu method:', e);
                        }
                    }
                }
                
                // Also try to save via server as a backup
                try {
                    // Determine the correct server URL based on environment
                    const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                        ? 'http://localhost:8080/save_application'
                        : null; // Disable server submission in production for now
                        
                    if (serverUrl) {
                        console.log(`Submitting to server: ${serverUrl}`);
                        
                        fetch(serverUrl, {
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
                    } else {
                        console.log('Server submission disabled in production environment - using localStorage only');
                    }
                    
                    // Create download for the applications.txt file
                    const allFormattedData = applications.map(app => app.formattedText).join('');
                    
                    // Show a simple thank you message in a toast notification
                    const toastNotification = document.createElement('div');
                    toastNotification.className = 'fixed bottom-4 right-4 bg-teal-600 text-white py-4 px-6 rounded-lg shadow-lg z-50 flex items-center';
                    toastNotification.innerHTML = `
                        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <div>
                            <p class="font-medium">Thank you for your application!</p>
                            <p class="text-sm opacity-90">We'll be in touch soon.</p>
                        </div>
                    `;
                    document.body.appendChild(toastNotification);
                    
                    // Close the modal
                    closeModal();
                    
                    // Reset form
                    applicationForm.reset();
                    
                    // Remove toast notification after 5 seconds
                    setTimeout(() => {
                        toastNotification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                        setTimeout(() => {
                            document.body.removeChild(toastNotification);
                        }, 500);
                    }, 5000);
                    
                } catch (error) {
                    console.error('Error:', error);
                    messageElement.textContent = 'An error occurred while processing your application. Please try again.';
                    messageElement.classList.remove('text-green-500', 'text-white');
                    messageElement.classList.add('text-red-500');
                }
            } catch (error) {
                console.error('Error:', error);
                messageElement.textContent = 'An error occurred while processing your application. Please try again.';
                messageElement.classList.remove('text-green-500', 'text-white');
                messageElement.classList.add('text-red-500');
            }
        });
    }
});
