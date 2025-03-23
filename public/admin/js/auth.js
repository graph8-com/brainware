// Authentication utilities for Brainware admin

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('brainware_auth');
    const author = localStorage.getItem('brainware_author');
    
    if (!token || !author) {
        // Redirect to login page if not on login page already
        if (!window.location.pathname.includes('/admin/login.html')) {
            window.location.href = '/admin/login.html';
        }
        return false;
    }
    
    return true;
}

// Get current author
function getCurrentAuthor() {
    return localStorage.getItem('brainware_author');
}

// Logout function
function logout() {
    localStorage.removeItem('brainware_auth');
    localStorage.removeItem('brainware_author');
    window.location.href = '/admin/login.html';
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    // Skip auth check on login page
    if (window.location.pathname.includes('/admin/login.html')) {
        return;
    }
    
    // Check authentication
    checkAuth();
    
    // Add logout button to header if it exists
    const headerNav = document.querySelector('header nav');
    if (headerNav) {
        const logoutButton = document.createElement('a');
        logoutButton.href = '#';
        logoutButton.className = 'text-gray-300 hover:text-white transition-colors flex items-center';
        logoutButton.innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
        `;
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        
        headerNav.appendChild(logoutButton);
    }
});
