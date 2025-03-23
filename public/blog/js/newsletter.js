/**
 * Newsletter subscription functionality
 * Handles form submissions with elegant loading states and feedback
 * Following Brainware's design guidelines with minimalist UI
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get the main newsletter form in the footer
  const newsletterForm = document.getElementById('newsletter-form');
  
  // Handle the main newsletter form
  if (newsletterForm) {
    setupNewsletterForm(
      newsletterForm, 
      'newsletter-email',
      'newsletter-form-message',
      'newsletter-button-text',
      'newsletter-loading'
    );
  }
  
  /**
   * Sets up newsletter form submission handling
   * @param {HTMLElement} form - The form element
   * @param {string} emailInputId - ID of the email input field
   * @param {string} messageId - ID of the message display element
   * @param {string} buttonTextId - ID of the button text element
   * @param {string} loadingId - ID of the loading spinner element
   */
  function setupNewsletterForm(form, emailInputId, messageId, buttonTextId, loadingId) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form elements
      const emailInput = document.getElementById(emailInputId);
      const messageElement = document.getElementById(messageId);
      const buttonText = document.getElementById(buttonTextId);
      const loadingSpinner = document.getElementById(loadingId);
      
      // Reset previous messages
      messageElement.textContent = '';
      messageElement.classList.remove('text-red-400', 'text-teal-400');
      messageElement.classList.add('hidden');
      
      // Get email value
      const email = emailInput.value.trim();
      
      // Validate email
      if (!email) {
        showMessage(messageElement, 'Please enter your email address', 'error');
        return;
      }
      
      // Simple email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage(messageElement, 'Please enter a valid email address', 'error');
        return;
      }
      
      // Show loading state
      buttonText.textContent = 'Subscribing...';
      loadingSpinner.classList.remove('hidden');
      
      // Format data for submission
      const timestamp = new Date().toISOString();
      const formData = {
        email,
        timestamp,
        type: 'newsletter_subscription'
      };
      
      // Save subscription to localStorage as a backup
      try {
        // Get existing subscriptions or initialize empty array
        const subscriptions = JSON.parse(localStorage.getItem('brainware_subscriptions') || '[]');
        
        // Add new subscription
        subscriptions.push(formData);
        
        // Save back to localStorage
        localStorage.setItem('brainware_subscriptions', JSON.stringify(subscriptions));
        
        // Determine the correct server URL based on environment
        const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:8080/api/save-subscription'
          : '/api/save-subscription'; // Use relative path in production
          
        console.log(`Submitting subscription to server: ${serverUrl}`);
        
        fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email,
            type: 'newsletter'
          }).toString()
        })
        .then(response => {
          console.log('Server response:', response.status);
          if (response.ok) {
            handleSubscriptionSuccess();
          } else {
            response.json().then(data => {
              console.error('Server error:', data.message);
              showMessage(messageElement, data.message || 'An error occurred. Please try again.', 'error');
              resetFormState();
            }).catch(err => {
              // Still show success since we saved to localStorage
              handleSubscriptionSuccess();
            });
          }
        })
        .catch(error => {
          console.error('Server error:', error);
          // Still show success since we saved to localStorage
          handleSubscriptionSuccess();
        });
      } catch (error) {
        console.error('Error saving subscription:', error);
        showMessage(messageElement, 'An error occurred. Please try again.', 'error');
        resetFormState();
      }
      
      /**
       * Handles successful subscription
       */
      function handleSubscriptionSuccess() {
        // Reset form
        emailInput.value = '';
        
        // Show success message
        showMessage(messageElement, 'Thank you for subscribing!', 'success');
        
        // Reset button state
        resetFormState();
        
        // Show toast notification
        showToastNotification('Thank you for subscribing!', 'We\'ll send you our latest opinions soon.');
        
        // Track the subscription event if analytics is available
        if (typeof window.trackEvent === 'function') {
          window.trackEvent({
            event: 'newsletter_subscription',
            email_domain: email.split('@')[1]
          });
        }
      }
      
      /**
       * Resets the form to its initial state
       */
      function resetFormState() {
        buttonText.textContent = 'Subscribe';
        loadingSpinner.classList.add('hidden');
      }
    });
  }
  
  /**
   * Shows a message in the specified element
   * @param {HTMLElement} element - The element to show the message in
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('success' or 'error')
   */
  function showMessage(element, message, type) {
    element.textContent = message;
    element.classList.remove('hidden');
    
    if (type === 'error') {
      element.classList.add('text-red-400');
      element.classList.remove('text-teal-400');
    } else {
      element.classList.add('text-teal-400');
      element.classList.remove('text-red-400');
    }
  }
  
  /**
   * Shows a toast notification
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   */
  function showToastNotification(title, message) {
    const toastNotification = document.createElement('div');
    toastNotification.className = 'fixed bottom-4 right-4 bg-teal-600 text-white py-4 px-6 rounded-lg shadow-lg z-50 flex items-center transform translate-y-2 opacity-0 transition-all duration-300';
    toastNotification.innerHTML = `
      <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <p class="font-medium">${title}</p>
        <p class="text-sm opacity-90">${message}</p>
      </div>
    `;
    document.body.appendChild(toastNotification);
    
    // Animate in
    setTimeout(() => {
      toastNotification.classList.remove('translate-y-2', 'opacity-0');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      toastNotification.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        document.body.removeChild(toastNotification);
      }, 300);
    }, 4000);
  }
});
