/**
 * CSS Particles System
 * Creates lightweight blurry particles with natural floating movement for added depth
 */
class CSSParticles {
    constructor() {
        // Configuration
        this.particleCount = 20; // Fewer particles for better performance
        this.minSize = 8;  // Larger minimum size
        this.maxSize = 25; // Larger maximum size
        this.minOpacity = 0.2; // Increased minimum opacity
        this.maxOpacity = 0.4; // Increased maximum opacity
        
        // Movement configuration
        this.minDuration = 80; // Even slower movement (seconds)
        this.maxDuration = 150; // Even slower for some particles
        this.container = null;
        this.particles = [];
        this.isInitialized = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // Create container for particles
        this.container = document.createElement('div');
        this.container.className = 'particles-container';
        document.body.appendChild(this.container);
        
        // Create particles
        this.createParticles();
        
        // Handle theme changes
        this.observeThemeChanges();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        this.isInitialized = true;
    }
    
    createParticles() {
        // Clear any existing particles
        this.container.innerHTML = '';
        this.particles = [];
        
        // Create new particles
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        // Create particle element
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = this.minSize + Math.random() * (this.maxSize - this.minSize);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random opacity
        const opacity = this.minOpacity + Math.random() * (this.maxOpacity - this.minOpacity);
        particle.style.opacity = opacity;
        
        // Random position within viewport
        const x = Math.random() * 100; // vw
        const y = Math.random() * 100; // vh
        
        // Set initial position
        particle.style.left = `${x}vw`;
        particle.style.top = `${y}vh`;
        
        // Add to container
        this.container.appendChild(particle);
        
        // Movement parameters - more natural floating motion
        const duration = this.minDuration + Math.random() * (this.maxDuration - this.minDuration);
        
        // Create more complex movement patterns
        const particleData = {
            element: particle,
            size,
            // Starting position
            x,
            y,
            // Movement center point (where the particle floats around)
            centerX: x,
            centerY: y,
            // Movement parameters
            duration,
            startTime: Date.now(),
            // Horizontal movement
            xAmplitude: 1 + Math.random() * 3, // Reduced movement range
            xFrequency: 0.05 + Math.random() * 0.1, // Slower oscillation
            // Vertical movement
            yAmplitude: 1 + Math.random() * 3, // Reduced movement range
            yFrequency: 0.03 + Math.random() * 0.08, // Slower oscillation
            // Phase offsets for organic movement
            xPhase: Math.random() * Math.PI * 2,
            yPhase: Math.random() * Math.PI * 2,
            // Secondary movement for more complexity
            secondaryAmplitude: 0.3 + Math.random() * 0.8, // Reduced secondary movement
            secondaryFrequency: 0.1 + Math.random() * 0.2, // Slower secondary movement
            secondaryPhase: Math.random() * Math.PI * 2
        };
        
        this.particles.push(particleData);
        
        // Start animation
        this.animateParticle(particleData);
        
        return particleData;
    }
    
    animateParticle(particleData) {
        const animate = () => {
            const now = Date.now();
            const elapsed = (now - particleData.startTime) / 1000; // seconds
            
            // Calculate movement using sine and cosine for natural floating
            // Primary movement
            const xOffset = Math.sin(elapsed * particleData.xFrequency + particleData.xPhase) * particleData.xAmplitude;
            const yOffset = Math.cos(elapsed * particleData.yFrequency + particleData.yPhase) * particleData.yAmplitude;
            
            // Add secondary movement for more complexity
            const secondaryX = Math.sin(elapsed * particleData.secondaryFrequency + particleData.secondaryPhase) * particleData.secondaryAmplitude;
            const secondaryY = Math.cos(elapsed * particleData.secondaryFrequency * 1.3 + particleData.secondaryPhase) * particleData.secondaryAmplitude;
            
            // Very slow drift upward (barely noticeable)
            const slowDrift = (Math.sin(elapsed * 0.02) * 3) - 0.5; // Slight upward bias
            
            // Update position with combined movements
            const newX = particleData.centerX + xOffset + secondaryX;
            const newY = particleData.centerY + yOffset + secondaryY + slowDrift;
            
            // Apply transform for better performance
            particleData.element.style.transform = `translate(${xOffset + secondaryX}vw, ${yOffset + secondaryY + slowDrift}vh)`;
            
            // Check if particle is still within bounds
            const isOutOfBounds = 
                newX < -10 || 
                newX > 110 || 
                newY < -10 || 
                newY > 110;
            
            if (isOutOfBounds) {
                // Remove old particle
                if (particleData.element.parentNode) {
                    particleData.element.parentNode.removeChild(particleData.element);
                }
                
                // Remove from array
                const index = this.particles.indexOf(particleData);
                if (index > -1) {
                    this.particles.splice(index, 1);
                }
                
                // Create a new particle
                this.createParticle();
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    handleResize() {
        // Recreate particles on window resize for better distribution
        if (this.isInitialized) {
            this.createParticles();
        }
    }
    
    observeThemeChanges() {
        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    // Theme changed, no need to do anything as CSS handles the colors
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
}

// Initialize particles
document.addEventListener('DOMContentLoaded', () => {
    new CSSParticles();
});
