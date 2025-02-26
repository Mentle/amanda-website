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

    // Remove scroll handler for navigation
    // function handleScroll() {
    //     const nav = document.querySelector('.navigation');
    //     if (window.scrollY > 50) {
    //         nav.classList.add('scrolled');
    //     } else {
    //         nav.classList.remove('scrolled');
    //     }
    // }

    // window.addEventListener('scroll', handleScroll);
    // handleScroll(); // Call once on page load

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

});
