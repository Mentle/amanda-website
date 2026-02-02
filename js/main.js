// Project data
const projects = [
    {
        title: 'ETHEREAL COLLECTION',
        description: 'A sustainable luxury collection inspired by natural phenomena.',
        image: 'images/project1.jpg'
    },
    {
        title: 'METAMORPHOSIS',
        description: 'Experimental pieces exploring transformation in fashion.',
        image: 'images/project2.jpg'
    },
    {
        title: 'DIGITAL FASHION',
        description: 'Virtual couture pushing the boundaries of digital design.',
        image: 'images/project3.jpg'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Reset scroll position on page load
    window.scrollTo(0, 0);
    
    // Prevent scroll bouncing on macOS
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'auto';

    // Fallback for loading screen - ensure it doesn't get stuck
    const loadingTimeout = setTimeout(() => {
        if (document.body.classList.contains('loading')) {
            console.warn('Loading timeout reached, forcing display of content');
            document.body.classList.remove('loading');
            const loadingScreen = document.querySelector('.loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 500);
            }
        }
    }, 10000); // 10 second timeout as fallback

    // Load projects
    loadProjects();

    // Initialize smooth scrolling
    initSmoothScroll();

    // Initialize form handling
    initContactForm();

    // Initialize intersection observer for animations
    initIntersectionObserver();

    // Intersection Observer for about section
    const aboutSection = document.querySelector('.about-section');
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2
    });

    if (aboutSection) {
        aboutObserver.observe(aboutSection);
    }

    // Profile Card Interaction
    const profileContainer = document.querySelector('.profile-container');
    let isDragging = false;
    let startX;
    let isFlipped = false;
    let hasAnimated = false;

    // Initial card setup - start from back
    if (profileContainer) {
        const cardInner = profileContainer.querySelector('.card-inner');
        cardInner.style.transform = 'rotateY(180deg)';
        isFlipped = true;
    }

    // Intersection Observer for card reveal animation
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                const cardInner = entry.target.querySelector('.card-inner');
                // Small delay for better effect
                setTimeout(() => {
                    cardInner.style.transition = 'transform 1s cubic-bezier(0.645, 0.045, 0.355, 1)';
                    cardInner.style.transform = 'rotateY(0deg)';
                    isFlipped = false;
                }, 400);
            }
        });
    }, { threshold: 0.5 });

    if (profileContainer) {
        cardObserver.observe(profileContainer);
    }

    const handleStart = (e) => {
        e.preventDefault();
        isDragging = true;
        const event = e.type === 'mousedown' ? e : e.touches[0];
        startX = event.clientX;
        
        const cardInner = profileContainer.querySelector('.card-inner');
        cardInner.style.transition = 'none';
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const event = e.type === 'mousemove' ? e : e.touches[0];
        const deltaX = event.clientX - startX;
        
        // Calculate rotation based on drag direction and current state
        let rotation;
        if (isFlipped) {
            rotation = deltaX > 0 ? 180 + deltaX / 2 : 180 + deltaX / 2;
        } else {
            rotation = deltaX > 0 ? deltaX / 2 : deltaX / 2;
        }
        
        const cardInner = profileContainer.querySelector('.card-inner');
        cardInner.style.transform = `rotateY(${rotation}deg)`;
    };

    const handleEnd = (e) => {
        if (!isDragging) return;
        
        const event = e.type === 'mouseup' ? e : e.changedTouches[0];
        const deltaX = event.clientX - startX;
        const cardInner = profileContainer.querySelector('.card-inner');
        
        cardInner.style.transition = 'transform 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)';
        
        // Flip if drag distance is sufficient
        if (Math.abs(deltaX) > 20) {
            if (isFlipped) {
                // If currently showing back
                if (deltaX > 0) {
                    // Dragged right, complete flip to front
                    isFlipped = false;
                    cardInner.style.transform = 'rotateY(360deg)';
                    // Reset to 0 after animation
                    setTimeout(() => {
                        cardInner.style.transition = 'none';
                        cardInner.style.transform = 'rotateY(0deg)';
                    }, 500);
                } else {
                    // Dragged left, complete flip to front
                    isFlipped = false;
                    cardInner.style.transform = 'rotateY(0deg)';
                }
            } else {
                // If currently showing front
                if (deltaX > 0) {
                    // Dragged right, complete flip to back
                    isFlipped = true;
                    cardInner.style.transform = 'rotateY(180deg)';
                } else {
                    // Dragged left, complete flip to back
                    isFlipped = true;
                    cardInner.style.transform = 'rotateY(-180deg)';
                    // Reset to 180 after animation
                    setTimeout(() => {
                        cardInner.style.transition = 'none';
                        cardInner.style.transform = 'rotateY(180deg)';
                    }, 500);
                }
            }
        } else {
            // Return to original position if drag wasn't far enough
            cardInner.style.transform = `rotateY(${isFlipped ? 180 : 0}deg)`;
        }
        
        isDragging = false;
    };

    // Add event listeners
    if (profileContainer) {
        // Prevent default drag behavior
        profileContainer.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Mouse events
        profileContainer.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        
        // Touch events
        profileContainer.addEventListener('touchstart', handleStart);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        
        // Double click to flip
        profileContainer.addEventListener('dblclick', () => {
            const cardInner = profileContainer.querySelector('.card-inner');
            cardInner.style.transition = 'transform 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)';
            isFlipped = !isFlipped;
            cardInner.style.transform = `rotateY(${isFlipped ? 180 : 0}deg)`;
        });
        
        // Prevent image dragging
        const profileImage = profileContainer.querySelector('.profile-image');
        if (profileImage) {
            profileImage.draggable = false;
        }
    }

    // Modal handling
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.about-modal, .contact-modal').classList.remove('visible');
        });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.about-modal, .contact-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('visible');
            }
        });
    });

    // Handle contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add your form submission logic here
            alert('Message sent! (Demo)');
            contactForm.closest('.contact-modal').classList.remove('visible');
        });
    }

    // Theme handling
    function initializeTheme() {
        console.log(' Initializing theme...');
        
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');
        console.log(' Saved theme preference:', savedTheme);
        
        if (savedTheme) {
            // Use saved preference
            console.log(' Using saved theme preference:', savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeToggleIcon(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            console.log(' System prefers:', systemTheme);
            console.log(' Setting theme to match system preference');
            document.documentElement.setAttribute('data-theme', systemTheme);
            updateThemeToggleIcon(systemTheme);
            localStorage.setItem('theme', systemTheme);
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            console.log(' System theme changed:', e.matches ? 'dark' : 'light');
            // Only update if user hasn't set a preference
            if (!localStorage.getItem('theme')) {
                console.log(' Updating theme to match system');
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                updateThemeToggleIcon(newTheme);
            } else {
                console.log(' User has manual preference set, not updating');
            }
        });
    }

    function updateThemeToggleIcon(theme) {
        console.log(' Updating theme toggle icon for:', theme);
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log(' Manual theme toggle:', currentTheme, '→', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        console.log(' Saved new theme preference:', newTheme);
        updateThemeToggleIcon(newTheme);
    }

    // Initialize theme when DOM is ready
    initializeTheme();
    
    // Theme toggle button event listener
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Add scroll event listeners to content windows for header fade effect
    const contentWindows = document.querySelectorAll('.content-window');
    contentWindows.forEach(window => {
        window.addEventListener('scroll', function() {
            const header = this.querySelector('.window-header');
            if (header) {
                if (this.scrollTop > 50) {
                    header.classList.add('fade-out');
                } else {
                    header.classList.remove('fade-out');
                }
            }
        });
    });

    function loadProjects() {
        const projectsGrid = document.querySelector('.project-grid');
        if (!projectsGrid) return; // Guard clause if element not found
        
        projects.forEach(project => {
            const projectElement = document.createElement('article');
            projectElement.className = 'project-card fade-in';
            projectElement.innerHTML = `
                <img src="${project.image}" alt="${project.title}" loading="lazy">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            `;
            projectsGrid.appendChild(projectElement);
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Here you would typically handle form submission
                // For now, we'll just show a success message
                const submitBtn = form.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                // Simulate sending (replace with actual form submission)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                alert('Message sent successfully!');
                form.reset();
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        }
    }

    function initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    function updateZoomProgress(progress) {
        // Removed zoom progress update
    }

    function updateDissolveProgress(progress) {
        // Removed dissolve progress update
    }

    // Footer functionality
    function initializeFooter() {
        const footer = document.getElementById('main-footer');
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
        
        // Check on scroll
        window.addEventListener('scroll', checkFooterVisibility);
        
        // Initial check
        checkFooterVisibility();
    }

    // Initialize footer
    initializeFooter();

    // Reset window styles function (needs to be accessible globally)
    function resetWindowStyles(window) {
        // Reset all our custom aggressive styles to allow original system to work
        window.style.display = '';
        window.style.opacity = '';
        window.style.visibility = '';
        window.style.zIndex = '';
        window.style.transform = '';
        window.style.pointerEvents = '';
        
        // Reset window content styles too
        const windowContent = window.querySelector('.window-content');
        if (windowContent) {
            windowContent.style.display = '';
            windowContent.style.opacity = '';
            windowContent.style.visibility = '';
        }
        
        console.log('🔄 Reset styles for window:', window.id);
    }

    // Initialize navigation menu
    initializeNavMenu();

    // Add event listeners to back buttons to reset window styles and handle menu navigation
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentWindow = btn.closest('.content-window');
            
            // Check if this window was opened via hamburger menu
            if (currentWindow && currentWindow.getAttribute('data-opened-via-menu') === 'true') {
                console.log('🔙 Back button clicked from menu-opened window, going home');
                e.preventDefault(); // Prevent default back button behavior
                e.stopPropagation();
                
                // AGGRESSIVELY close ALL windows manually (bypass original system)
                const allWindows = document.querySelectorAll('.content-window');
                allWindows.forEach(window => {
                    console.log('🔥 Force closing window:', window.id);
                    
                    // Nuclear-level hiding
                    window.classList.remove('visible', 'active', 'show', 'open');
                    window.style.display = 'none';
                    window.style.opacity = '0';
                    window.style.visibility = 'hidden';
                    window.style.zIndex = '-999';
                    window.style.transform = 'translateY(-100vh)';
                    window.style.pointerEvents = 'none';
                    
                    // Hide window content
                    const windowContent = window.querySelector('.window-content');
                    if (windowContent) {
                        windowContent.style.display = 'none';
                        windowContent.style.opacity = '0';
                        windowContent.style.visibility = 'hidden';
                    }
                    
                    // Reset styles after forcing hide
                    resetWindowStyles(window);
                    window.removeAttribute('data-opened-via-menu');
                });
                
                // Force DOM updates
                document.body.offsetHeight;
                
                // Reset body classes
                document.body.classList.remove('window-open');
                document.documentElement.classList.remove('window-open');
                
                // Use the EXACT same animation as the original closeWindow function
                const backgroundInstance = window.backgroundAnimation;
                if (backgroundInstance) {
                    // Don't show model immediately - let the scatter animation control it
                    // Reset rotation first (same as original)
                    if (backgroundInstance.model && backgroundInstance.baseRotation) {
                        backgroundInstance.targetRotation.copy(backgroundInstance.baseRotation);
                        backgroundInstance.modelRotation.copy(backgroundInstance.baseRotation);
                        backgroundInstance.model.rotation.set(
                            backgroundInstance.baseRotation.x,
                            backgroundInstance.baseRotation.y,
                            backgroundInstance.baseRotation.z
                        );
                    }
                    
                    // Reset pointer events based on scroll position (same as original)
                    if (backgroundInstance.scrollProgress > 0.7) {
                        backgroundInstance.renderer.domElement.style.pointerEvents = 'auto';
                    } else {
                        backgroundInstance.renderer.domElement.style.pointerEvents = 'none';
                    }
                    
                    // Remove scroll prevention (same as original)
                    if (backgroundInstance.windowScrollHandler) {
                        document.removeEventListener('wheel', backgroundInstance.windowScrollHandler);
                        document.removeEventListener('touchmove', backgroundInstance.windowScrollHandler);
                    }
                    
                    // Start scatter-in animation (EXACT same as original)
                    backgroundInstance.textScatterActive = true;
                    backgroundInstance.textScatterDirection = 'in';
                    backgroundInstance.activeWindowId = null;
                    
                    // Wait 500ms then scroll to bottom instantly (EXACT same as original)
                    setTimeout(() => {
                        // Set scroll to bottom without animation (same as original)
                        document.documentElement.style.scrollBehavior = 'auto';
                        document.documentElement.scrollTop = document.documentElement.scrollHeight;
                        document.documentElement.style.scrollBehavior = '';
                        
                        // Show model AFTER scroll is complete to avoid flash
                        setTimeout(() => {
                            if (backgroundInstance.model) {
                                backgroundInstance.model.visible = true;
                            }
                        }, 50); // Small delay after scroll completes
                    }, 500); // Match the original 500ms timing
                }
                
                return false; // Prevent further event handling
            } else {
                console.log('🔙 Back button clicked, resetting all window styles (normal behavior)');
                const allWindows = document.querySelectorAll('.content-window');
                allWindows.forEach(window => {
                    resetWindowStyles(window);
                });
            }
        });
    });

    // Navigation menu functionality
    function initializeNavMenu() {
        const menuButtons = document.querySelectorAll('.menu-btn, .header-menu-btn');
        const navMenu = document.getElementById('nav-menu');
        const menuItems = document.querySelectorAll('.nav-menu-item');
        let isMenuOpen = false;

        // Toggle menu on button click
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });
        });

        // Handle menu item clicks
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.getAttribute('data-action');
                handleNavigation(action);
                closeMenu();
            });
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


        function handleNavigation(action) {
            // Get the background animation instance
            const backgroundCanvas = document.getElementById('background-canvas');
            const backgroundInstance = window.backgroundAnimation;

            switch (action) {
                case 'home':
                    // Reset ALL windows to clean state before closing
                    const allWindows = document.querySelectorAll('.content-window');
                    allWindows.forEach(window => {
                        resetWindowStyles(window);
                        window.classList.remove('visible');
                        window.style.display = 'none';
                        window.removeAttribute('data-opened-via-menu');
                    });
                    
                    // Reset body classes
                    document.body.classList.remove('window-open');
                    document.documentElement.classList.remove('window-open');
                    
                    // Reset background animation to home state
                    if (backgroundInstance) {
                        // Show model
                        if (backgroundInstance.model) {
                            backgroundInstance.model.visible = true;
                        }
                        
                        // Reset animation states
                        backgroundInstance.activeWindowId = null;
                        backgroundInstance.textScatterActive = false;
                        backgroundInstance.textScatterProgress = 0;
                        
                        // Remove scroll prevention
                        if (backgroundInstance.windowScrollHandler) {
                            document.removeEventListener('wheel', backgroundInstance.windowScrollHandler);
                            document.removeEventListener('touchmove', backgroundInstance.windowScrollHandler);
                        }
                    }
                    
                    // Scroll to TOP of page (home position)
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                    break;
                case 'about':
                    switchToWindow('about-window');
                    break;
                case 'portfolio':
                    switchToWindow('services-window');
                    break;
                case 'contact':
                    switchToWindow('contact-window');
                    break;
            }
        }

        function switchToWindow(windowId) {
            console.log('🔄 Switching to window:', windowId);
            
            // Get all content windows
            const allWindows = document.querySelectorAll('.content-window');
            const targetWindow = document.getElementById(windowId);
            
            if (targetWindow) {
                // Step 1: NUCLEAR-LEVEL hide ALL windows immediately
                allWindows.forEach(window => {
                    // Remove all possible visible classes
                    window.classList.remove('visible', 'active', 'show', 'open');
                    
                    // Set all possible hide properties
                    window.style.display = 'none';
                    window.style.opacity = '0';
                    window.style.visibility = 'hidden';
                    window.style.zIndex = '-999';
                    window.style.transform = 'translateY(-100vh)';
                    window.style.pointerEvents = 'none';
                    
                    // Mark ALL windows as menu-opened since we're using hamburger navigation
                    window.setAttribute('data-opened-via-menu', 'true');
                    
                    // Also hide the window content specifically
                    const windowContent = window.querySelector('.window-content');
                    if (windowContent) {
                        windowContent.style.display = 'none';
                        windowContent.style.opacity = '0';
                        windowContent.style.visibility = 'hidden';
                    }
                    
                    console.log('🚫 Nuclear-level hiding window:', window.id, '(marked as menu-opened)');
                });
                
                // Force immediate DOM update
                document.body.offsetHeight;
                
                // Step 2: Show only the target window after ensuring others are hidden
                setTimeout(() => {
                    console.log('✅ Showing target window:', windowId);
                    
                    // Double-check all others are STILL hidden with nuclear force
                    allWindows.forEach(window => {
                        if (window.id !== windowId) {
                            window.classList.remove('visible', 'active', 'show', 'open');
                            window.style.display = 'none';
                            window.style.opacity = '0';
                            window.style.visibility = 'hidden';
                            window.style.zIndex = '-999';
                            window.style.transform = 'translateY(-100vh)';
                            window.style.pointerEvents = 'none';
                            
                            // Double-hide window content
                            const windowContent = window.querySelector('.window-content');
                            if (windowContent) {
                                windowContent.style.display = 'none';
                                windowContent.style.opacity = '0';
                                windowContent.style.visibility = 'hidden';
                            }
                        }
                    });
                    
                    // Show target window with FULL visibility restoration
                    targetWindow.style.display = 'block';
                    targetWindow.style.opacity = '1';
                    targetWindow.style.visibility = 'visible';
                    targetWindow.style.zIndex = '1001';
                    targetWindow.style.transform = 'translateY(0)';
                    targetWindow.style.pointerEvents = 'auto';
                    targetWindow.classList.add('visible');
                    
                    // Restore target window content
                    const targetContent = targetWindow.querySelector('.window-content');
                    if (targetContent) {
                        targetContent.style.display = 'block';
                        targetContent.style.opacity = '1';
                        targetContent.style.visibility = 'visible';
                    }
                    
                    // Maintain window-open state
                    document.body.classList.add('window-open');
                    document.documentElement.classList.add('window-open');
                    
                    // Hide 3D model
                    const backgroundInstance = window.backgroundAnimation;
                    if (backgroundInstance && backgroundInstance.model) {
                        backgroundInstance.model.visible = false;
                    }
                    
                    // Initialize portfolio gallery if needed
                    if (windowId === 'services-window' && typeof window.initPortfolioGallery === 'function') {
                        window.initPortfolioGallery();
                    }
                    
                    // Mark this window as opened via hamburger menu
                    targetWindow.setAttribute('data-opened-via-menu', 'true');
                    
                    // Force multiple reflows to ensure changes stick
                    targetWindow.offsetHeight;
                    document.body.offsetHeight;
                    
                    console.log('🎯 Window switch complete. Target visible:', targetWindow.style.display, targetWindow.classList.contains('visible'));
                    
                }, 100);
            }
        }
    }

});
