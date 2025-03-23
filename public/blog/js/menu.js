// Set active menu item based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Set active menu item based on current page
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        if ((currentPath === '/' && itemPath === '/') || 
            (currentPath !== '/' && itemPath !== '/' && currentPath.includes(itemPath))) {
            item.classList.add('active');
        }
    });
    
    // Overlay menu functionality
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    let isMenuOpen = false;
    
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        // Toggle body and button class for menu state
        body.classList.toggle('menu-open', isMenuOpen);
        
        // Toggle menu visibility with fade effect
        if (isMenuOpen) {
            navMenu.classList.remove('hidden');
            // Trigger reflow to ensure transition works
            navMenu.offsetWidth;
            navMenu.classList.add('active');
            body.style.overflow = 'hidden';
        } else {
            navMenu.classList.remove('active');
            setTimeout(() => {
                if (!isMenuOpen) { // Check again in case it was reopened
                    navMenu.classList.add('hidden');
                }
            }, 300); // Match transition duration
            body.style.overflow = '';
        }
    }
    
    // Toggle menu on button click
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    // Close menu on navigation item click
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) toggleMenu();
    });
});
