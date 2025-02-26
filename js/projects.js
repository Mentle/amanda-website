class ProjectsManager {
    constructor() {
        this.projectsGrid = document.querySelector('.projects-grid');
        this.windowContent = document.querySelector('#projects-window .window-content');
        this.imageExtensions = ['webp'];  // Only use WebP images
        this.projectsPerPage = 8; // 2 rows of 4 columns
        this.currentPage = 1;
        this.allProjects = [];
        this.setupProjects();
    }

    async setupProjects() {
        try {
            // First, get the list of project directories
            const response = await fetch('projects/');
            const html = await response.text();
            
            // Parse the directory listing HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const projectFolders = Array.from(doc.querySelectorAll('a'))
                .map(a => a.href.split('/').filter(Boolean).pop())
                .filter(folder => folder && !folder.includes('.'));

            // Load each project's details
            this.allProjects = await Promise.all(projectFolders.map(async folder => {
                const projectDetails = await this.loadProjectDetails(folder);
                return {
                    name: folder,
                    folder: folder,
                    heroImage: projectDetails.heroImage
                };
            }));

            this.setupPagination();
            this.renderCurrentPage();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error setting up projects:', error);
        }
    }

    setupPagination() {
        const totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
        
        // Create pagination controls if we have more than one page
        if (totalPages > 1) {
            const controls = document.createElement('div');
            controls.className = 'pagination-controls';
            controls.innerHTML = `
                <button class="page-button prev-page" disabled>&larr;</button>
                <span class="page-info">Page <span class="current-page">1</span>/${totalPages}</span>
                <button class="page-button next-page" ${totalPages === 1 ? 'disabled' : ''}>&rarr;</button>
            `;
            
            // Add after the grid but inside window-content
            this.windowContent.appendChild(controls);

            // Add event listeners for pagination
            const prevButton = controls.querySelector('.prev-page');
            const nextButton = controls.querySelector('.next-page');

            prevButton.addEventListener('click', () => this.changePage(-1));
            nextButton.addEventListener('click', () => this.changePage(1));
        }
    }

    changePage(delta) {
        const totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
        const newPage = this.currentPage + delta;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderCurrentPage();
            
            // Update pagination controls
            const controls = document.querySelector('.pagination-controls');
            if (controls) {
                const prevButton = controls.querySelector('.prev-page');
                const nextButton = controls.querySelector('.next-page');
                const currentPageSpan = controls.querySelector('.current-page');
                
                prevButton.disabled = this.currentPage === 1;
                nextButton.disabled = this.currentPage === totalPages;
                currentPageSpan.textContent = this.currentPage;
            }
        }
    }

    renderCurrentPage() {
        const start = (this.currentPage - 1) * this.projectsPerPage;
        const end = start + this.projectsPerPage;
        const currentProjects = this.allProjects.slice(start, end);
        
        this.projectsGrid.innerHTML = currentProjects.map(project => `
            <div class="project-card" data-project="${project.folder}">
                <img src="projects/${project.folder}/${project.heroImage}" 
                     alt="${project.name}" 
                     loading="lazy"
                     class="project-hero">
            </div>
        `).join('');
    }

    async findHeroImage(projectFolder) {
        try {
            const response = await fetch(`projects/${projectFolder}/`);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Look for WebP files in the project root
            const files = Array.from(doc.querySelectorAll('a'))
                .map(a => a.href.split('/').pop())
                .filter(filename => filename && filename.toLowerCase().endsWith('.webp'));

            // If no WebP file found in root, check sub-images
            if (files.length === 0) {
                const subImagesResponse = await fetch(`projects/${projectFolder}/sub-images/`);
                const subImagesHtml = await subImagesResponse.text();
                const subImagesDoc = parser.parseFromString(subImagesHtml, 'text/html');
                const subImageFiles = Array.from(subImagesDoc.querySelectorAll('a'))
                    .map(a => a.href.split('/').pop())
                    .filter(filename => filename && filename.toLowerCase().endsWith('.webp'));
                
                if (subImageFiles.length > 0) {
                    return `sub-images/${subImageFiles[0]}`;
                }
            }

            return files[0] || null;
        } catch (error) {
            console.error('Error finding hero image:', error);
            return null;
        }
    }

    async loadProjectDetails(folder) {
        const heroImage = await this.findHeroImage(folder);
        return {
            heroImage: heroImage || 'placeholder.webp' // Fallback to a placeholder if no image found
        };
    }

    async loadSubImages(projectFolder) {
        try {
            const response = await fetch(`projects/${projectFolder}/sub-images/`);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            return Array.from(doc.querySelectorAll('a'))
                .map(a => a.href.split('/').pop())
                .filter(filename => filename && filename.toLowerCase().endsWith('.webp'));
        } catch (error) {
            console.error('Error loading sub-images:', error);
            return [];
        }
    }

    expandProject(projectFolder) {
        const expandedView = document.createElement('div');
        expandedView.className = 'expanded-project';
        
        expandedView.innerHTML = `
            <div class="expanded-content">
                <button class="close-expanded">&times;</button>
                <div class="project-images">
                    <!-- Images will be loaded from the project's sub-images folder -->
                </div>
                <div class="project-description">
                    <!-- Description will be loaded from description.txt -->
                </div>
            </div>
        `;

        document.body.appendChild(expandedView);
        
        // Load and display project content
        this.loadProjectContent(projectFolder, expandedView);

        // Add animation frame for smooth appearance
        requestAnimationFrame(() => expandedView.classList.add('active'));
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    async loadProjectContent(projectFolder, expandedView) {
        const imagesContainer = expandedView.querySelector('.project-images');
        const descriptionContainer = expandedView.querySelector('.project-description');

        try {
            // Load description if it exists
            try {
                const descriptionResponse = await fetch(`projects/${projectFolder}/description.txt`);
                if (descriptionResponse.ok) {
                    const description = await descriptionResponse.text();
                    descriptionContainer.innerHTML = `<p>${description}</p>`;
                }
            } catch (e) {
                console.log('No description.txt found');
            }

            // Get sub-images directory listing
            const subImages = await this.loadSubImages(projectFolder);
            imagesContainer.innerHTML = subImages.map(image => `
                <img src="projects/${projectFolder}/sub-images/${image}"
                     alt="Project image"
                     loading="lazy"
                     class="project-image">
            `).join('');
        } catch (error) {
            console.error('Error loading project content:', error);
        }
    }

    setupEventListeners() {
        // Project click handler
        this.projectsGrid.addEventListener('click', (e) => {
            const projectCard = e.target.closest('.project-card');
            if (projectCard) {
                const projectFolder = projectCard.dataset.project;
                this.expandProject(projectFolder);
            }
        });

        // Close expanded view handler
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-expanded') || 
                e.target.classList.contains('expanded-project')) {
                const expandedView = e.target.closest('.expanded-project');
                if (expandedView) {
                    expandedView.classList.remove('active');
                    document.body.style.overflow = '';
                    // Remove after animation
                    setTimeout(() => expandedView.remove(), 300);
                }
            }
        });

        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const expandedView = document.querySelector('.expanded-project.active');
                if (expandedView) {
                    expandedView.classList.remove('active');
                    document.body.style.overflow = '';
                    setTimeout(() => expandedView.remove(), 300);
                }
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectsManager();
});
