class PortfolioGallery {
    constructor() {
        this.gallery = document.getElementById('portfolio-gallery');
        console.log('🎨 Portfolio Gallery initialized, gallery element:', this.gallery);
        this.portfolioItems = [];
        this.lightboxOpen = false;
        this.currentImageIndex = 0;
        
        if (!this.gallery) {
            console.error('❌ Portfolio gallery element not found!');
            return;
        }
        
        this.init();
    }

    async init() {
        await this.loadPortfolioData();
        await this.loadSiteSettings();
        this.renderGallery();
        this.setupLightbox();
    }

    async loadPortfolioData() {
        try {
            // Load from our API endpoint that serves Tina CMS data
            const response = await fetch('/api/portfolio');
            
            if (response.ok) {
                this.portfolioItems = await response.json();
                console.log('✅ Loaded portfolio data from Tina CMS:', this.portfolioItems);
                
                // If no items, use fallback
                if (this.portfolioItems.length === 0) {
                    console.warn('No portfolio items found, using fallback data');
                    this.portfolioItems = this.getFallbackData();
                }
            } else {
                throw new Error(`API responded with status: ${response.status}`);
            }

        } catch (error) {
            console.error('Error loading portfolio data from API:', error);
            console.log('Using fallback data instead');
            this.portfolioItems = this.getFallbackData();
        }
    }

    async loadSiteSettings() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const settings = await response.json();
                
                // Update portfolio intro text
                const portfolioIntro = document.querySelector('.portfolio-intro p');
                if (portfolioIntro && settings.portfolioIntro) {
                    portfolioIntro.textContent = settings.portfolioIntro;
                }
                
                console.log('✅ Loaded site settings from Tina CMS:', settings);
            }
        } catch (error) {
            console.error('Error loading site settings:', error);
        }
    }

    getFallbackData() {
        return [
            {
                title: "Ethereal Collection",
                description: "A sustainable luxury collection inspired by natural phenomena.",
                image: "images/profile.webp", // Using existing image as placeholder
                alt: "Ethereal Collection",
                order: 1,
                featured: true
            },
            {
                title: "Metamorphosis",
                description: "Experimental pieces exploring transformation in fashion.",
                image: "images/profile.webp", // Using existing image as placeholder
                alt: "Metamorphosis Collection",
                order: 2,
                featured: false
            },
            {
                title: "Digital Fashion",
                description: "Virtual couture pushing the boundaries of digital design.",
                image: "images/profile.webp", // Using existing image as placeholder
                alt: "Digital Fashion Collection",
                order: 3,
                featured: true
            }
        ];
    }

    renderGallery() {
        console.log('🖼️ Rendering gallery with items:', this.portfolioItems);
        if (!this.gallery) {
            console.error('❌ Gallery element not found during render!');
            return;
        }

        this.gallery.innerHTML = '';

        this.portfolioItems.forEach((item, index) => {
            console.log('📸 Rendering item:', item.title);
            const galleryItem = document.createElement('div');
            galleryItem.className = `gallery-item`;
            
            // Use heroImage if available, fallback to old image field
            const heroImage = item.heroImage || item.image;
            
            // Count total images (hero + project images)
            const projectImageCount = (item.projectImages && Array.isArray(item.projectImages)) ? item.projectImages.length : 0;
            const heroImageCount = (item.heroImage || item.image) ? 1 : 0;
            const imageCount = heroImageCount + projectImageCount;
            
            galleryItem.innerHTML = `
                <div class="gallery-image-container">
                    <img src="${heroImage}" alt="${item.title}" class="gallery-image" loading="lazy">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h3 class="gallery-title">${item.title}</h3>
                            <p class="gallery-description">${item.description}</p>
                            ${item.category ? `<span class="gallery-category">${item.category}</span>` : ''}
                            ${item.year ? `<span class="gallery-year">${item.year}</span>` : ''}
                            ${imageCount > 0 ? `<span class="gallery-count">${imageCount} images</span>` : ''}
                        </div>
                        <button class="gallery-expand" aria-label="View project details">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            `;

            // Add click event for project detail view
            galleryItem.addEventListener('click', () => {
                this.openProjectDetail(index);
            });

            this.gallery.appendChild(galleryItem);
        });
    }

    setupLightbox() {
        // Create project detail view HTML
        const lightbox = document.createElement('div');
        lightbox.className = 'portfolio-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay">
                <div class="lightbox-container">
                    <button class="lightbox-close" aria-label="Close project view">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="project-detail-content">
                        <div class="project-header">
                            <h2 class="project-title"></h2>
                            <div class="project-meta">
                                <span class="project-category"></span>
                                <span class="project-year"></span>
                                <span class="project-client"></span>
                            </div>
                            <p class="project-description"></p>
                        </div>
                        <div class="project-images">
                            <div class="main-image-container">
                                <img class="main-image" src="" alt="">
                                <div class="image-navigation">
                                    <button class="image-prev" aria-label="Previous image">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="image-next" aria-label="Next image">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="image-thumbnails">
                                <!-- Thumbnails will be populated here -->
                            </div>
                            <div class="image-caption"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);

        // Add event listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.image-prev').addEventListener('click', () => this.previousImage());
        lightbox.querySelector('.image-next').addEventListener('click', () => this.nextImage());
        lightbox.querySelector('.lightbox-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightboxOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.previousImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });

        this.lightbox = lightbox;
    }

    openProjectDetail(index) {
        this.currentProjectIndex = index;
        this.currentImageIndex = 0;
        this.lightboxOpen = true;
        this.updateProjectDetailContent();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightboxOpen = false;
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    previousImage() {
        const images = this.currentProjectImages || [];
        if (images.length > 0) {
            this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
            this.updateMainImage();
        }
    }

    nextImage() {
        const images = this.currentProjectImages || [];
        if (images.length > 0) {
            this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
            this.updateMainImage();
        }
    }

    updateProjectDetailContent() {
        const project = this.portfolioItems[this.currentProjectIndex];
        
        if (!this.lightbox) {
            console.error('❌ Lightbox not initialized!');
            return;
        }
        
        // Update project info
        this.lightbox.querySelector('.project-title').textContent = project.title;
        this.lightbox.querySelector('.project-description').textContent = project.description;
        
        // Update meta information
        const categoryEl = this.lightbox.querySelector('.project-category');
        const yearEl = this.lightbox.querySelector('.project-year');
        const clientEl = this.lightbox.querySelector('.project-client');
        
        categoryEl.textContent = project.category || '';
        categoryEl.style.display = project.category ? 'inline' : 'none';
        
        yearEl.textContent = project.year || '';
        yearEl.style.display = project.year ? 'inline' : 'none';
        
        clientEl.textContent = project.client ? `Client: ${project.client}` : '';
        clientEl.style.display = project.client ? 'inline' : 'none';
        
        // Setup images
        this.setupProjectImages();
    }

    setupProjectImages() {
        const project = this.portfolioItems[this.currentProjectIndex];
        
        if (!this.lightbox) {
            console.error('❌ Lightbox not initialized in setupProjectImages!');
            return;
        }
        
        // Start with hero image, then add project images
        const heroImage = project.heroImage || project.image;
        const projectImageUrls = project.projectImages || [];
        
        // Create images array starting with hero image
        const images = [];
        
        // Add hero image first
        if (heroImage) {
            images.push({
                src: heroImage,
                alt: `${project.title} - Hero Image`,
                caption: ''
            });
        }
        
        // Add project images
        projectImageUrls.forEach((url, index) => {
            images.push({
                src: url,
                alt: `${project.title} - Image ${index + 2}`,
                caption: ''
            });
        });
        
        const thumbnailsContainer = this.lightbox.querySelector('.image-thumbnails');
        
        // Clear existing thumbnails
        thumbnailsContainer.innerHTML = '';
        
        if (images.length === 0) {
            // If no project images, show hero image
            const heroImage = project.heroImage || project.image;
            this.lightbox.querySelector('.main-image').src = heroImage;
            this.lightbox.querySelector('.main-image').alt = project.title;
            this.lightbox.querySelector('.image-caption').textContent = '';
            return;
        }
        
        // Store images for navigation
        this.currentProjectImages = images;
        
        // Create thumbnails
        images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
            thumb.addEventListener('click', () => {
                this.currentImageIndex = index;
                this.updateMainImage();
            });
            thumbnailsContainer.appendChild(thumb);
        });
        
        // Set initial main image
        this.currentImageIndex = 0;
        this.updateMainImage();
    }

    updateMainImage() {
        const images = this.currentProjectImages || [];
        
        if (images.length === 0 || !this.lightbox) return;
        
        const currentImage = images[this.currentImageIndex];
        this.lightbox.querySelector('.main-image').src = currentImage.src;
        this.lightbox.querySelector('.main-image').alt = currentImage.alt;
        
        // Hide caption completely if empty
        const captionEl = this.lightbox.querySelector('.image-caption');
        if (currentImage.caption && currentImage.caption.trim()) {
            captionEl.textContent = currentImage.caption;
            captionEl.style.display = 'block';
        } else {
            captionEl.style.display = 'none';
        }
        
        // Update active thumbnail
        this.lightbox.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentImageIndex);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Don't initialize immediately, wait for window to be opened
    console.log('🎨 Portfolio Gallery script loaded, waiting for window to open...');
    
    // Backup initialization after a delay (in case window opening doesn't trigger)
    setTimeout(() => {
        if (!window.portfolioGalleryInstance && document.getElementById('portfolio-gallery')) {
            console.log('🎨 Backup initialization of Portfolio Gallery...');
            window.portfolioGalleryInstance = new PortfolioGallery();
        }
    }, 3000);
});

// Function to initialize gallery when services window opens
window.initPortfolioGallery = function() {
    if (!window.portfolioGalleryInstance) {
        console.log('🎨 Initializing Portfolio Gallery...');
        window.portfolioGalleryInstance = new PortfolioGallery();
    }
};
