// Set active menu item based on current page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing menu');
    
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Current path:', currentPath);
    console.log('Nav items found:', navItems.length);
    
    navItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        if (currentPath === '/' && itemPath === '/') {
            item.classList.add('active');
        } else if (currentPath !== '/' && itemPath !== '/' && currentPath.includes(itemPath)) {
            item.classList.add('active');
        }
    });
    
    // Mobile menu functionality
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const mainContent = document.getElementById('main-content');
    const header = document.querySelector('header');
    
    console.log('Menu elements found:', { 
        menuToggle: menuToggle !== null, 
        navMenu: navMenu !== null,
        mainContent: mainContent !== null,
        header: header !== null
    });
    
    if (!menuToggle || !navMenu || !mainContent || !header) {
        console.error('Missing required elements for menu functionality');
        return;
    }
    
    let isMenuOpen = false;
    
    menuToggle.addEventListener('click', () => {
        console.log('Menu toggle clicked');
        isMenuOpen = !isMenuOpen;
        console.log('Menu state changed to:', isMenuOpen);
        
        if (isMenuOpen) {
            // Open menu
            console.log('Menu before opening, classes:', navMenu.className);
            navMenu.classList.remove('hidden');
            navMenu.classList.remove('translate-x-full');
            mainContent.classList.add('pushed');
            header.classList.add('pushed');
            document.body.style.overflow = 'hidden';
            console.log('Menu after opening, classes:', navMenu.className);
            menuToggle.innerHTML = `
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
        } else {
            // Close menu
            console.log('Menu before closing, classes:', navMenu.className);
            navMenu.classList.add('translate-x-full');
            setTimeout(() => {
                navMenu.classList.add('hidden');
                console.log('Menu after timeout, classes:', navMenu.className);
            }, 300);
            mainContent.classList.remove('pushed');
            header.classList.remove('pushed');
            document.body.style.overflow = '';
            console.log('Menu after closing (before timeout), classes:', navMenu.className);
            menuToggle.innerHTML = `
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            `;
        }
    });
});
