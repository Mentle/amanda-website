import { getPortfolioProjects, urlFor } from './sanity-client.js';

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
        this.renderGallery();
        this.setupLightbox();
    }

    async loadPortfolioData() {
        try {
            const sanityProjects = await getPortfolioProjects();
            
            if (sanityProjects && sanityProjects.length > 0) {
                this.portfolioItems = sanityProjects.map(project => {
                    // Handle main media with proper crop/hotspot
                    let mainMediaUrl;
                    const isVideo = project.mainMedia?.mediaType === 'video';
                    
                    if (isVideo) {
                        mainMediaUrl = project.mainMedia.videoUrl;
                    } else if (project.mainMedia?.image) {
                        mainMediaUrl = urlFor(project.mainMedia.image)
                            .width(1200)
                            .quality(80)
                            .auto('format')
                            .url();
                    }
                    
                    // Handle supporting media with proper crop/hotspot and optimization
                    const supportingMediaUrls = project.supportingMedia?.map(media => {
                        if (media._type === 'image' && media.asset) {
                            return urlFor(media)
                                .width(1200)
                                .quality(80)
                                .auto('format')
                                .url();
                        } else if (media.asset) {
                            // It's a file (video/gif)
                            return media.asset.url || null;
                        }
                        return null;
                    }).filter(Boolean) || [];
                    
                    // Handle client logos with proper crop/hotspot and optimization
                    const clientLogoUrls = project.clientLogos?.map(logo => {
                        if (logo.asset) {
                            return urlFor(logo)
                                .width(300)
                                .quality(85)
                                .auto('format')
                                .url();
                        }
                        return null;
                    }).filter(Boolean) || [];
                    
                    return {
                        title: project.title,
                        slug: project.slug,
                        category: project.category,
                        clientLogos: clientLogoUrls,
                        description: project.projectDescription,
                        role: project.role,
                        roleDescription: project.roleDescription,
                        skills: project.skills || [],
                        metrics: project.metrics || [],
                        location: project.location,
                        campaignName: project.campaignName,
                        agency: project.agency,
                        mainMedia: mainMediaUrl,
                        isVideo: isVideo,
                        supportingMedia: supportingMediaUrls,
                        order: project.order,
                        featured: project.featured,
                        alt: project.title
                    };
                });
                console.log('✅ Loaded portfolio data from Sanity:', this.portfolioItems);
            } else {
                console.log('⚠️ No projects found in Sanity');
                this.portfolioItems = [];
            }
        } catch (error) {
            console.error('❌ Error loading from Sanity:', error);
            this.portfolioItems = [];
        }
    }

    getStaticPortfolioData() {
        return [
            {
                title: "Ethereal Collection",
                description: "A sustainable luxury collection inspired by natural phenomena.",
                heroImage: "images/profile.webp",
                alt: "Ethereal Collection",
                category: "Fashion Design",
                year: "2024",
                client: "Independent Project",
                order: 1,
                featured: true,
                projectImages: []
            },
            {
                title: "Metamorphosis",
                description: "Experimental pieces exploring transformation in fashion.",
                heroImage: "images/profile.webp",
                alt: "Metamorphosis Collection",
                category: "Experimental",
                year: "2023",
                client: "Art Gallery Collaboration",
                order: 2,
                featured: false,
                projectImages: []
            },
            {
                title: "Digital Fashion",
                description: "Virtual couture pushing the boundaries of digital design.",
                heroImage: "images/profile.webp",
                alt: "Digital Fashion Collection",
                category: "Digital Design",
                year: "2024",
                client: "Tech Fashion Week",
                order: 3,
                featured: true,
                projectImages: []
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
            
            const mainMediaUrl = item.mainMedia;
            const totalMediaCount = 1 + (item.supportingMedia?.length || 0);
            
            // Use smaller thumbnail for gallery grid, full size for lightbox
            const thumbnailUrl = item.isVideo ? mainMediaUrl : mainMediaUrl.replace(/w=1200/, 'w=600');
            
            const mediaElement = item.isVideo 
                ? `<video src="${thumbnailUrl}" class="gallery-image" muted loop playsinline></video>`
                : `<img src="${thumbnailUrl}" alt="${item.title}" class="gallery-image" loading="lazy">`;
            
            galleryItem.innerHTML = `
                <div class="gallery-image-container">
                    ${mediaElement}
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h3 class="gallery-title">${item.title}</h3>
                            <p class="gallery-description">${item.description || ''}</p>
                            ${item.category ? `<span class="gallery-category">${item.category}</span>` : ''}
                            ${item.role ? `<span class="gallery-role">${item.role}</span>` : ''}
                            ${totalMediaCount > 0 ? `<span class="gallery-count">${totalMediaCount} ${item.isVideo ? 'videos' : 'items'}</span>` : ''}
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
            
            // Auto-play video on hover
            if (item.isVideo) {
                const video = galleryItem.querySelector('video');
                galleryItem.addEventListener('mouseenter', () => video?.play());
                galleryItem.addEventListener('mouseleave', () => video?.pause());
            }

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
                        <div class="project-info-column">
                            <div class="project-header">
                                <div class="project-category-tag"></div>
                                <h2 class="project-title"></h2>
                                <div class="project-client-logos"></div>
                                <div class="project-meta-info">
                                    <span class="project-agency"></span>
                                    <span class="project-location"></span>
                                    <span class="project-campaign"></span>
                                </div>
                            </div>
                            
                            <div class="project-body">
                                <div class="project-description-section">
                                    <h3>Project Description</h3>
                                    <p class="project-description"></p>
                                </div>
                                
                                <div class="project-details-grid">
                                    <div class="project-role-section">
                                        <h4 class="role-title"></h4>
                                        <p class="role-description"></p>
                                    </div>
                                    
                                    <div class="skills-section">
                                        <h4>Skills & Tools Used</h4>
                                        <ul class="skills-list"></ul>
                                    </div>
                                    
                                    <div class="metrics-section">
                                        <h4>Metrics</h4>
                                        <div class="metrics-list"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="project-media">
                            <div class="main-media-container">
                                <div class="main-media-wrapper"></div>
                                <div class="media-navigation">
                                    <button class="media-prev" aria-label="Previous media">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="media-next" aria-label="Next media">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="media-thumbnails">
                                <!-- Thumbnails will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);

        // Add event listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.media-prev').addEventListener('click', () => this.previousMedia());
        lightbox.querySelector('.media-next').addEventListener('click', () => this.nextMedia());
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
                    this.previousMedia();
                    break;
                case 'ArrowRight':
                    this.nextMedia();
                    break;
            }
        });

        this.lightbox = lightbox;
    }

    openProjectDetail(index) {
        this.currentProjectIndex = index;
        this.currentMediaIndex = 0;
        this.lightboxOpen = true;
        this.updateProjectDetailContent();
        this.lightbox.classList.add('active');
    }

    closeLightbox() {
        this.lightboxOpen = false;
        this.lightbox.classList.remove('active');
    }

    previousMedia() {
        const media = this.currentProjectMedia || [];
        if (media.length > 0) {
            this.currentMediaIndex = (this.currentMediaIndex - 1 + media.length) % media.length;
            this.updateMainMedia();
        }
    }

    nextMedia() {
        const media = this.currentProjectMedia || [];
        if (media.length > 0) {
            this.currentMediaIndex = (this.currentMediaIndex + 1) % media.length;
            this.updateMainMedia();
        }
    }

    updateProjectDetailContent() {
        const project = this.portfolioItems[this.currentProjectIndex];
        
        if (!this.lightbox) {
            console.error('❌ Lightbox not initialized!');
            return;
        }
        
        // Update category tag
        const categoryTag = this.lightbox.querySelector('.project-category-tag');
        categoryTag.textContent = project.category || '';
        categoryTag.style.display = project.category ? 'block' : 'none';
        
        // Update title
        this.lightbox.querySelector('.project-title').textContent = project.title;
        
        // Update client logos
        const clientLogosContainer = this.lightbox.querySelector('.project-client-logos');
        clientLogosContainer.innerHTML = '';
        if (project.clientLogos && project.clientLogos.length > 0) {
            project.clientLogos.forEach(logoUrl => {
                const img = document.createElement('img');
                img.src = logoUrl;
                img.alt = 'Client logo';
                img.className = 'client-logo';
                clientLogosContainer.appendChild(img);
            });
            clientLogosContainer.style.display = 'flex';
        } else {
            clientLogosContainer.style.display = 'none';
        }
        
        // Update meta info (agency, location, campaign)
        const agencyEl = this.lightbox.querySelector('.project-agency');
        const locationEl = this.lightbox.querySelector('.project-location');
        const campaignEl = this.lightbox.querySelector('.project-campaign');
        
        agencyEl.textContent = project.agency ? `Agency: ${project.agency}` : '';
        agencyEl.style.display = project.agency ? 'inline-block' : 'none';
        
        locationEl.textContent = project.location ? `Location: ${project.location}` : '';
        locationEl.style.display = project.location ? 'inline-block' : 'none';
        
        campaignEl.textContent = project.campaignName ? `Campaign: ${project.campaignName}` : '';
        campaignEl.style.display = project.campaignName ? 'inline-block' : 'none';
        
        // Update description
        this.lightbox.querySelector('.project-description').textContent = project.description || '';
        
        // Update role
        const roleTitle = this.lightbox.querySelector('.role-title');
        const roleDescription = this.lightbox.querySelector('.role-description');
        roleTitle.textContent = project.role ? `My role: ${project.role}` : '';
        roleDescription.textContent = project.roleDescription || '';
        
        // Update skills
        const skillsList = this.lightbox.querySelector('.skills-list');
        skillsList.innerHTML = '';
        if (project.skills && project.skills.length > 0) {
            project.skills.forEach(skill => {
                const li = document.createElement('li');
                li.textContent = skill;
                skillsList.appendChild(li);
            });
        }
        
        // Update metrics
        const metricsList = this.lightbox.querySelector('.metrics-list');
        metricsList.innerHTML = '';
        if (project.metrics && project.metrics.length > 0) {
            project.metrics.forEach(metric => {
                const metricItem = document.createElement('div');
                metricItem.className = 'metric-item';
                
                const icon = this.getMetricIcon(metric.platform);
                metricItem.innerHTML = `
                    <span class="metric-icon">${icon}</span>
                    <span class="metric-value">${metric.value}</span>
                `;
                metricsList.appendChild(metricItem);
            });
        }
        
        // Setup media
        this.setupProjectMedia();
    }
    
    getMetricIcon(platform) {
        const icons = {
            'instagram': '<i class="fab fa-instagram"></i>',
            'tiktok': '<i class="fab fa-tiktok"></i>',
            'youtube': '<i class="fab fa-youtube"></i>',
            'facebook': '<i class="fab fa-facebook"></i>',
            'linkedin': '<i class="fab fa-linkedin"></i>',
            'twitter': '<i class="fab fa-twitter"></i>',
            'views': '<i class="fas fa-eye"></i>',
            'other': '<i class="fas fa-chart-line"></i>'
        };
        return icons[platform] || icons['other'];
    }

    setupProjectMedia() {
        const project = this.portfolioItems[this.currentProjectIndex];
        
        if (!this.lightbox) {
            console.error('❌ Lightbox not initialized in setupProjectMedia!');
            return;
        }
        
        // Create media array starting with main media
        const media = [];
        
        // Add main media first
        if (project.mainMedia) {
            media.push({
                url: project.mainMedia,
                isVideo: project.isVideo,
                alt: `${project.title} - Main`
            });
        }
        
        // Add supporting media
        if (project.supportingMedia && project.supportingMedia.length > 0) {
            project.supportingMedia.forEach((url, index) => {
                const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.webm');
                media.push({
                    url: url,
                    isVideo: isVideo,
                    alt: `${project.title} - ${index + 2}`
                });
            });
        }
        
        const thumbnailsContainer = this.lightbox.querySelector('.media-thumbnails');
        thumbnailsContainer.innerHTML = '';
        
        if (media.length === 0) {
            return;
        }
        
        // Store media for navigation
        this.currentProjectMedia = media;
        
        // Create thumbnails
        media.forEach((item, index) => {
            const thumb = document.createElement('div');
            thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            
            if (item.isVideo) {
                thumb.innerHTML = `
                    <video src="${item.url}" muted></video>
                    <div class="video-indicator"><i class="fas fa-play"></i></div>
                `;
            } else {
                thumb.innerHTML = `<img src="${item.url}" alt="${item.alt}">`;
            }
            
            thumb.addEventListener('click', () => {
                this.currentMediaIndex = index;
                this.updateMainMedia();
            });
            thumbnailsContainer.appendChild(thumb);
        });
        
        // Set initial main media
        this.currentMediaIndex = 0;
        this.updateMainMedia();
    }

    updateMainMedia() {
        const media = this.currentProjectMedia || [];
        
        if (media.length === 0 || !this.lightbox) return;
        
        const currentMedia = media[this.currentMediaIndex];
        const mainMediaWrapper = this.lightbox.querySelector('.main-media-wrapper');
        
        if (currentMedia.isVideo) {
            mainMediaWrapper.innerHTML = `
                <video src="${currentMedia.url}" controls autoplay loop class="main-media">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            mainMediaWrapper.innerHTML = `
                <img src="${currentMedia.url}" alt="${currentMedia.alt}" class="main-media">
            `;
        }
        
        // Update active thumbnail
        this.lightbox.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentMediaIndex);
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
