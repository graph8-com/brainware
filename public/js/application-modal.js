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
            // Handle either company field (PE partners) or country field (other pages)
            const country = document.getElementById('country')?.value.trim() || '';
            const company = document.getElementById('company')?.value.trim() || '';
            const note = document.getElementById('note')?.value.trim() || '';
            const role = document.getElementById('role')?.value.trim() || 'Unknown'; // Get role or default to Unknown
            
            console.log("Form data being submitted:", { name, email, country, company, note, role });
            
            // Client-side validation - check required fields based on which form is being used
            const isCompanyForm = document.getElementById('company') !== null;
            if (!name || !email || (isCompanyForm && !company) || (!isCompanyForm && !country)) {
                messageElement.textContent = 'Please fill in all required fields.';
                messageElement.classList.remove('text-white', 'text-green-500');
                messageElement.classList.add('text-red-500');
                return;
            }
            
            // Format data for text file and email
            const timestamp = new Date().toISOString();
            // Use company field if available, otherwise use country
            const locationOrCompany = company || country;
            const formattedData = `Timestamp: ${timestamp}\nName: ${name}\nEmail: ${email}\n${company ? 'Company' : 'Country'}: ${locationOrCompany}${note ? '\nNote: ' + note : ''}\nRole: ${role}\n------------------------------------------------------\n\n`;
            
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
                    company,
                    note,
                    role, // Add role field to stored application
                    formattedText: formattedData
                });
                
                // Save back to localStorage
                localStorage.setItem('brainware_applications', JSON.stringify(applications));
                
                // Note: Form tracking is now entirely handled by the graph8Loaded script
                // Do not attempt any tracking here to avoid duplicate events
                
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
                                country: country || '',
                                company: company || '',
                                note,
                                role
                            }).toString()
                        })
                        .then(response => {
                            console.log('Server response:', response.status);
                            if (response.status === 200) {
                                console.log('✅ Application saved to server');
                            } else {
                                console.warn('⚠️ Server error:', response.status, response.statusText);
                                console.log('Application saved to localStorage as fallback');
                            }
                            
                            // Show success message
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
                            
                            // Close the modal after short delay (allow time for tracking)
                            setTimeout(() => {
                                closeModal();
                                toastNotification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                                setTimeout(() => {
                                    document.body.removeChild(toastNotification);
                                }, 500);
                            }, 1500);
                        })
                        .catch(error => {
                            console.error('Server error:', error);
                            messageElement.textContent = 'An error occurred while processing your application. Please try again.';
                            messageElement.classList.remove('text-green-500', 'text-white');
                            messageElement.classList.add('text-red-500');
                        });
                    } else {
                        console.log('Server submission disabled in production environment - using localStorage only');
                        
                        // Show success message
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
                        
                        // Close the modal after short delay (allow time for tracking)
                        setTimeout(() => {
                            closeModal();
                            toastNotification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                            setTimeout(() => {
                                document.body.removeChild(toastNotification);
                            }, 500);
                        }, 1500);
                    }
                    
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
            
            const eventData = {
                name,
                email,
                country,
                company,
                note,
                role,
                timestamp: new Date().toISOString(),
                page_url: window.location.href,
                page_title: document.title,
                application_source: window.location.pathname.includes('founders') ? 'founders_page' : 
                                    window.location.pathname.includes('builders') ? 'builders_page' : 
                                    window.location.pathname.includes('pe-partners') ? 'pe_partners_page' : 'landing_page'
            };
            
            trackFormSubmission(eventData);
        });
    }

    function trackFormSubmission(eventData) {
        // Try immediate tracking first
        if (tryTrackEvent(eventData)) return;
        
        // If immediate tracking failed, try again after 1 second
        console.log('⏱️ First tracking attempt failed, retrying in 1 second...');
        setTimeout(() => {
            if (tryTrackEvent(eventData)) return;
            
            // If still failed, try one more time after 2 more seconds (3 seconds total)
            console.log('⏱️ Second tracking attempt failed, retrying in 2 seconds...');
            setTimeout(() => {
                if (tryTrackEvent(eventData)) return;
                
                // If all attempts failed, store in localStorage for potential future replay
                console.warn('❌ All tracking attempts failed, storing event in localStorage');
                storeUnsentEvent(eventData);
            }, 2000);
        }, 1000);
    }

    function tryTrackEvent(eventData) {
        // Try to track using graph8 (preferred method from graph8Loaded)
        if (window.graph8) {
            try {
                // First identify the user
                window.graph8.identify(eventData.email, {
                    email: eventData.email,
                    name: eventData.name,
                    country: eventData.country,
                    company: eventData.company,
                    role: eventData.role, // Include role in identify call
                    application_source: eventData.application_source
                });
                
                // Then track the event
                window.graph8.track("application_submitted", eventData);
                console.log('✅ Application tracked with graph8 method');
                return true;
            } catch (e) {
                console.error('❌ Error tracking with graph8:', e);
            }
        }
        
        // Fallback to analytics.js
        if (window.analytics) {
            try {
                window.analytics.identify(eventData.email, {
                    email: eventData.email,
                    name: eventData.name,
                    country: eventData.country,
                    company: eventData.company,
                    role: eventData.role, // Include role in identify call
                    application_source: eventData.application_source
                });
                
                window.analytics.track('application_submitted', eventData);
                console.log('✅ Application tracked with analytics.js method');
                return true;
            } catch (e) {
                console.error('❌ Error tracking with analytics.js:', e);
            }
        }
        
        // Last-resort fallback to jitsu.push
        if (window.jitsu && typeof window.jitsu.push === 'function') {
            try {
                // Identify user first
                window.jitsu.push(["identify", eventData.email, {
                    email: eventData.email,
                    name: eventData.name,
                    country: eventData.country,
                    company: eventData.company,
                    role: eventData.role, // Include role in identify call
                    application_source: eventData.application_source
                }]);
                
                // Then track the event
                window.jitsu.push(["track", "application_submitted", eventData]);
                console.log('✅ Application tracked with jitsu.push method');
                return true;
            } catch (e) {
                console.error('❌ Error tracking with jitsu.push:', e);
            }
        }
        
        // If we got here, all tracking methods failed
        return false;
    }

    function storeUnsentEvent(eventData) {
        try {
            // Get existing unsent events
            const unsentEvents = JSON.parse(localStorage.getItem('brainware_unsent_events') || '[]');
            
            // Add new event
            unsentEvents.push({
                eventType: 'application_submitted',
                eventData,
                timestamp: new Date().toISOString()
            });
            
            // Store back in localStorage
            localStorage.setItem('brainware_unsent_events', JSON.stringify(unsentEvents));
            console.log('💾 Unsent event stored in localStorage for potential future replay');
        } catch (e) {
            console.error('❌ Error storing unsent event:', e);
        }
    }
});
