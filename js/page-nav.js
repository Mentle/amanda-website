// Simple page navigation for multi-page site
document.addEventListener('DOMContentLoaded', () => {
    // Navigation menu functionality
    const menuBtn = document.querySelector('.header-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    let isMenuOpen = false;
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });
    }
    
    function toggleMenu() {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        navMenu.classList.add('active');
        isMenuOpen = true;
    }
    
    function closeMenu() {
        navMenu.classList.remove('active');
        isMenuOpen = false;
    }
    
    // Footer visibility on homepage
    const footer = document.getElementById('main-footer');
    if (footer) {
        let isFooterVisible = false;
        
        function checkFooterVisibility() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Show footer when scrolled to bottom (within 100px)
            const shouldShowFooter = scrollTop + windowHeight >= documentHeight - 100;
            
            if (shouldShowFooter && !isFooterVisible) {
                footer.classList.add('visible');
                isFooterVisible = true;
            } else if (!shouldShowFooter && isFooterVisible) {
                footer.classList.remove('visible');
                isFooterVisible = false;
            }
        }
        
        window.addEventListener('scroll', checkFooterVisibility);
        checkFooterVisibility(); // Check on load
    }
});
