class BackgroundAnimation {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: document.getElementById('background-canvas')
        });

        // Make the canvas interactive
        this.renderer.domElement.style.pointerEvents = 'auto';
        document.getElementById('background-canvas').style.pointerEvents = 'auto';

        this.container = document.getElementById('background-canvas');

        // Mouse vectors for model rotation
        this.mouse = new THREE.Vector2(0, 0);
        this.prevMouse = new THREE.Vector2(0, 0);
        this.mouseVelocity = new THREE.Vector2(0, 0);

        // Main 3D model references
        this.model = null;
        this.modelScale = 3;
        this.modelPosition = new THREE.Vector3(0, 29, -4.8);
        this.baseRotation = new THREE.Vector3(1.529, 6.4, 0.0046);
        this.targetRotation = new THREE.Vector3().copy(this.baseRotation);
        this.modelRotation = new THREE.Vector3().copy(this.baseRotation);

        // Particle data (the PLY point cloud)
        this.originalPositions = null;
        this.currentPositions = null;
        this.velocities = null;
        this.particleSize = 0.5;

        // Store original colors when loading the model
        this.originalColors = null;

        // Dissolve / scroll-based properties
        this.scrollProgress = 0;
        this.disperseProgress = 0;
        this.disperseThreshold = 0.2; // Changed from 0.3 to 0.2
        this.disperseSpeed = 2;
        this.particleDispersionVectors = null;

        // Intro animation properties (optional swirl-in effect)
        this.isAnimatingIn = true;
        this.animationStartTime = Date.now();
        this.animationDuration = 3000;
        this.orbitalParams = []; // Holds swirl parameters for each point

        // Breathing / advanced animations
        this.breathingStarted = false;
        this.breathingTime = 0;
        this.breathingSpeed = 0.3;
        this.breathingAmount = 0.1;
        this.breathingOffsets = [0, Math.PI * 2/3, Math.PI * 4/3];

        // --- New: final text morphing ---
        this.finalTextPositions = null;  // will hold positions for "ABOUT/CONTACT/PROJECTS"
        this.reassembleProgress = 0;     // goes from 0..1 after scroll > 1.0
        this.originalTextGeometry = null; // Store original merged geometry for resize handling
        this.sampledTextPoints = null;    // Store sampled points for text
        this.pointGroups = null;         // Store which points belong to which word

        // Text scatter animation properties
        this.textScatterProgress = 0;
        this.textScatterActive = false;
        this.textScatterDirection = 'out'; // 'out' or 'in'
        this.textScatterSpeed = 0.6; // Reduced from 15
        this.textScatterVectors = null;
        this.activeWindowId = null;

        // Set up lights, camera, and initial positions
        this.calculateCameraPosition();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.position.copy(this.initialCameraPosition);
        this.camera.lookAt(0, 0, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        frontLight.position.set(0, 0, 5);
        this.scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
        backLight.position.set(0, 0, -5);
        this.scene.add(backLight);

        // Load the PLY model
        this.loadModel();

        // Basic event listeners (model rotation, scroll, resize)
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('touchmove', (e) => {
            if (this.scrollProgress < 0) return; // Don't interact before scroll
            const touch = e.touches[0];
            this.onMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        window.addEventListener('touchstart', (e) => {
            if (this.scrollProgress < 0) return; // Don't interact before scroll
            const touch = e.touches[0];
            this.onMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // Add click event listener for text interaction
        this.renderer.domElement.addEventListener('click', this.onCanvasClick.bind(this));
        this.raycaster = new THREE.Raycaster();

        // Start the main animation loop
        this.animate();

        // Theme change observer (optional)
        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.updateTheme();
                }
            });
        });
        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Debug properties (optional)
        this.debugMode = false;

        // Store last scroll position and hero height for resize handling
        this.lastScrollPosition = undefined;
        this.lastHeroHeight = undefined;
        this.currentScrollProgress = 0;

        // Initialize close buttons for windows
        this.initializeCloseButtons();

        // Initialize back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const window = btn.closest('.content-window');
                this.closeWindow(window.id);
            });
        });

        // Add this at the end of the constructor
        this.windowScrollHandler = this.preventBackgroundScroll.bind(this);
    }

    // --------------------------------------------------
    //  MOUSE & ROTATION
    // --------------------------------------------------

    onMouseMove(event) {
        // Convert mouse position to normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Calculate velocity (push points away from the mouse if wanted)
        this.mouseVelocity.x = this.mouse.x - this.prevMouse.x;
        this.mouseVelocity.y = this.mouse.y - this.prevMouse.y;

        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;

        // Reduce tilt effect based on dissolve progress
        const minTiltFactor = 0.05;
        const tiltReduction =
            minTiltFactor + ((1 - minTiltFactor) * (1 - (this.disperseProgress / 0.87)));
        const tiltX = this.mouse.y * 0.5 * tiltReduction; // tilt around X-axis
        const tiltY = this.mouse.x * 0.5 * tiltReduction; // tilt around Y-axis

        // Update target rotation
        this.targetRotation.x = this.baseRotation.x + tiltX;
        this.targetRotation.y = this.baseRotation.y + tiltY;

        // Interpolate rotation
        const interpolationSpeed = 0.1 * (1 - (this.disperseProgress / 0.87) * 0.9);
        this.modelRotation.x += (this.targetRotation.x - this.modelRotation.x) * interpolationSpeed;
        this.modelRotation.y += (this.targetRotation.y - this.modelRotation.y) * interpolationSpeed;

        if (this.model) {
            this.model.rotation.x = this.modelRotation.x;
            this.model.rotation.y = this.modelRotation.y;
        }
    }

    // --------------------------------------------------
    //  SCROLL LOGIC
    // --------------------------------------------------

    handleScroll() {
        const scrollPosition = window.pageYOffset;
        const heroHeight = window.innerHeight;
        const scrollProgress = scrollPosition / heroHeight;
        this.scrollProgress = scrollProgress;

        // Add/remove scrolled class to body for global state
        if (scrollProgress > 0.1) {
            document.body.classList.add('scrolled');
            this.renderer.domElement.style.pointerEvents = 'auto';
        } else {
            document.body.classList.remove('scrolled');
            this.renderer.domElement.style.pointerEvents = 'auto';
        }

        // Text fade out (0-40% scroll)
        const textProgress = Math.min(scrollProgress / 0.4, 1);
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = Math.max(0, 1 - textProgress * 1.2);
        }

        // Zoom progress (40-70% => up to 0.3 max)
        let zoomProgress = 0;
        const maxZoom = 0.3;
        if (scrollProgress > 0.4) {
            zoomProgress = Math.min((scrollProgress - 0.4) / 0.3, 1) * maxZoom;
        }

        // Dissolve progress (70-100% => up to 0.87)
        let dissolveProgress = 0;
        if (scrollProgress > 0.7) {
            dissolveProgress = Math.min((scrollProgress - 0.7) / 0.3, 1) * 0.87;
        }
        this.disperseProgress = dissolveProgress;

        // Text morphing progress (100-200%)
        if (scrollProgress > 1.0) {
            // from 1.0 to 2.0 => reassembleProgress: 0..1
            const reassembleRange = 1.0; // 2.0 - 1.0
            this.reassembleProgress = Math.min((scrollProgress - 1.0) / reassembleRange, 1);
        } else {
            this.reassembleProgress = 0;
        }

        // Interpolate camera position for the zoom
        const newPosition = new THREE.Vector3();
        newPosition.lerpVectors(
            this.initialCameraPosition,
            this.zoomTarget,
            zoomProgress
        );
        this.camera.position.copy(newPosition);
        this.camera.lookAt(this.modelPosition);

        // If we haven't set up dispersion vectors yet, do so
        if (dissolveProgress > 0 && !this.particleDispersionVectors) {
            this.initParticleDispersion();
        }
    }

    // --------------------------------------------------
    //  ANIMATION LOOP
    // --------------------------------------------------

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update points (main model’s dissolve/mouse logic)
        this.updatePoints();

        // Optional swirl “intro” if still animating in
        this.updateIntroAnimation();

        // Further smooth rotation if not fully dissolved
        if (this.model && this.disperseProgress < 1) {
            this.modelRotation.x += (this.targetRotation.x - this.modelRotation.x) * 0.05;
            this.modelRotation.y += (this.targetRotation.y - this.modelRotation.y) * 0.05;
            this.model.rotation.set(
                this.modelRotation.x,
                this.modelRotation.y,
                this.modelRotation.z
            );
        }

        this.renderer.render(this.scene, this.camera);
    }

    // --------------------------------------------------
    //  DISSOLVING POINT CLOUD + REASSEMBLY
    // --------------------------------------------------

    updatePoints() {
        if (!this.model) return;

        const positions = this.model.geometry.attributes.position.array;
        const colors = this.model.geometry.attributes.color.array;
        const time = Date.now() * 0.001;
        const fov = this.camera.fov * (Math.PI / 180);
        const scale = Math.abs(this.camera.position.z - this.modelPosition.z) * Math.tan(fov / 2) * 2;

        // Get theme-based color
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const themeColor = isDarkTheme ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 };

        // Scale down the visual effect of dissolve
        const scaledDisperseProgress = this.disperseProgress * 0.17;

        // Disable breathing if fully dissolved
        const disableBreathing = this.disperseProgress >= 0.87;

        // Update text scatter animation
        if (this.textScatterActive) {
            if (!this.textScatterVectors) {
                this.initTextScatterVectors();
            }
            
            if (this.textScatterDirection === 'out') {
                this.textScatterProgress = Math.min(1, this.textScatterProgress + 0.015); // Reduced from 0.03
                if (this.textScatterProgress >= 1) {
                    if (this.activeWindowId) {
                        this.showWindow(this.activeWindowId);
                    }
                }
            } else {
                this.textScatterProgress = Math.max(0, this.textScatterProgress - 0.015); // Reduced from 0.03
                if (this.textScatterProgress <= 0) {
                    this.textScatterActive = false;
                }
            }

            // Apply scatter effect to all points when text is active
            if (this.finalTextPositions && this.reassembleProgress >= 1) {
                for (let i = 0; i < positions.length; i += 3) {
                    const idx = i / 3;
                    const scatterVector = this.textScatterVectors[idx];
                    
                    // Get the base text position
                    const baseX = this.finalTextPositions[i];
                    const baseY = this.finalTextPositions[i + 1];
                    const baseZ = this.finalTextPositions[i + 2];

                    // Apply scatter effect with easing
                    const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    const easedScatter = easeInOut(this.textScatterProgress);
                    
                    positions[i] = baseX + scatterVector.x * easedScatter * this.textScatterSpeed;
                    positions[i + 1] = baseY + scatterVector.y * easedScatter * this.textScatterSpeed;
                    positions[i + 2] = baseZ + scatterVector.z * easedScatter * this.textScatterSpeed;
                }
                this.model.geometry.attributes.position.needsUpdate = true;
                return; // Skip other position updates when scattering
            }
        }

        // Regular point updates (only if not scattering)
        for (let i = 0; i < positions.length; i += 3) {
            const idx = i / 3;
            
            // Color transition for text reassembly
            if (this.finalTextPositions && this.reassembleProgress > 0) {
                const t = this.reassembleProgress;
                const colorIdx = i;
                
                colors[colorIdx] = this.originalColors[colorIdx] * (1 - t) + themeColor.r * t;
                colors[colorIdx + 1] = this.originalColors[colorIdx + 1] * (1 - t) + themeColor.g * t;
                colors[colorIdx + 2] = this.originalColors[colorIdx + 2] * (1 - t) + themeColor.b * t;
            } else {
                colors[i] = this.originalColors[i];
                colors[i + 1] = this.originalColors[i + 1];
                colors[i + 2] = this.originalColors[i + 2];
            }

            // --- Mouse “push” effect, radius-based ---
            const screenX = positions[i] / scale;
            const screenY = positions[i + 1] / scale;
            const dx = screenX - this.mouse.x;
            const dy = screenY - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Gentle push radius
            const radius = 0.4;
            if (distance < radius) {
                const t = distance / radius;
                const smoothForce = 1 - (t * t * (3 - 2 * t));
                const force = smoothForce * 0.1;
                const velocityInfluence = 1.5;

                this.velocities[i] += this.mouseVelocity.x * velocityInfluence * scale * force;
                this.velocities[i + 1] += this.mouseVelocity.y * velocityInfluence * scale * force;

                // Gentle push away from mouse
                this.velocities[i] += (dx / distance) * force * scale * 0.5;
                this.velocities[i + 1] += (dy / distance) * force * scale * 0.5;
            }

            // --- Dispersion (dissolve) logic ---
            if (this.disperseProgress > 0 && this.particleDispersionVectors) {
                const dispersionVector = this.particleDispersionVectors[idx];
                const dispersionX = dispersionVector.x * scaledDisperseProgress * this.disperseSpeed;
                const dispersionY = dispersionVector.y * scaledDisperseProgress * this.disperseSpeed;
                const dispersionZ = dispersionVector.z * scaledDisperseProgress * this.disperseSpeed;

                positions[i] = this.originalPositions[i] + dispersionX;
                positions[i + 1] = this.originalPositions[i + 1] + dispersionY;
                positions[i + 2] = this.originalPositions[i + 2] + dispersionZ;
            } else {
                // Breathing / ambient motion if not dissolved
                let offsetX = 0, offsetY = 0, offsetZ = 0;
                if (!disableBreathing) {
                    const ambientMotionScale = 0.03 * (1 - (this.disperseProgress / 0.87));
                    offsetX = Math.sin(time + idx * 0.1) * ambientMotionScale;
                    offsetY = Math.cos(time + idx * 0.1) * ambientMotionScale;
                    offsetZ = Math.sin(time * 0.5 + idx * 0.1) * ambientMotionScale;
                }

                // Apply velocity decay
                this.velocities[i] *= 0.9;
                this.velocities[i + 1] *= 0.9;
                this.velocities[i + 2] *= 0.9;

                positions[i] = this.originalPositions[i] + offsetX + this.velocities[i];
                positions[i + 1] = this.originalPositions[i + 1] + offsetY + this.velocities[i + 1];
                positions[i + 2] = this.originalPositions[i + 2] + offsetZ + this.velocities[i + 2];
            }
        }

        // --- NEW: reassembly into "ABOUT CONTACT PROJECTS" ---
        if (this.finalTextPositions && this.reassembleProgress > 0) {
            const t = this.reassembleProgress; // 0..1
            for (let i = 0; i < positions.length; i += 3) {
                const dispersedX = positions[i];
                const dispersedY = positions[i + 1];
                const dispersedZ = positions[i + 2];

                const targetX = this.finalTextPositions[i];
                const targetY = this.finalTextPositions[i + 1];
                const targetZ = this.finalTextPositions[i + 2];

                positions[i]   = dispersedX + (targetX - dispersedX) * t;
                positions[i+1] = dispersedY + (targetY - dispersedY) * t;
                positions[i+2] = dispersedZ + (targetZ - dispersedZ) * t;
            }
        }

        this.model.geometry.attributes.position.needsUpdate = true;
        this.model.geometry.attributes.color.needsUpdate = true;
    }

    initParticleDispersion() {
        if (!this.model) return;

        const positions = this.model.geometry.attributes.position.array;
        this.particleDispersionVectors = [];

        for (let i = 0; i < positions.length; i += 3) {
            // Random direction vector for dissolve
            const angle = Math.random() * Math.PI * 2;
            const z = Math.random() * 2 - 1;
            const speed = 50 + Math.random() * 100;

            this.particleDispersionVectors.push({
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
                z: z * speed
            });
        }
    }

    initTextScatterVectors() {
        if (!this.model || this.textScatterVectors) return;

        const positions = this.model.geometry.attributes.position.array;
        this.textScatterVectors = [];

        for (let i = 0; i < positions.length; i += 3) {
            // Random scatter direction with emphasis on outward movement
            const angle = Math.random() * Math.PI * 2;
            const radialSpeed = 20 + Math.random() * 15;  // Reduced from 30-50
            const outwardSpeed = 35 + Math.random() * 25; // Reduced from 50-80

            this.textScatterVectors.push({
                x: Math.cos(angle) * radialSpeed,
                y: Math.sin(angle) * radialSpeed,
                z: outwardSpeed
            });
        }
    }

    // --------------------------------------------------
    //  INTRO SWIRL-IN ANIMATION (Optional)
    // --------------------------------------------------

    initParticlePositions() {
        if (!this.model) return;

        const positions = this.model.geometry.attributes.position.array;
        const spread = 200;

        for (let i = 0; i < positions.length; i += 3) {
            // Store original position
            this.originalPositions[i] = positions[i];
            this.originalPositions[i + 1] = positions[i + 1];
            this.originalPositions[i + 2] = positions[i + 2];

            // Assign random “outside” start positions
            const angle = Math.random() * Math.PI * 2;
            const distance = spread + Math.random() * spread;

            // Orbital swirl parameters
            const orbitSpeed = 0.5 + Math.random() * 1.5;
            const orbitPhase = Math.random() * Math.PI * 2;
            const orbitRadius = 50 + Math.random() * 150;

            this.orbitalParams[i / 3] = {
                startAngle: angle,
                startDistance: distance,
                orbitSpeed,
                orbitPhase,
                orbitRadius,
                spiralTightness: 0.15 + Math.random() * 0.2
            };

            // Place them initially far out
            positions[i] = Math.cos(angle) * distance;
            positions[i + 1] = Math.sin(angle) * distance;
            positions[i + 2] = this.originalPositions[i + 2] + (Math.random() - 0.5) * spread;
        }

        this.model.geometry.attributes.position.needsUpdate = true;
    }

    updateIntroAnimation() {
        if (!this.isAnimatingIn || !this.model) return;

        const elapsed = Date.now() - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        // Custom easing for a smooth swirl
        const easing = (t) => {
            return 0.5 * (1 - Math.cos(t * Math.PI)) * (1 - (1 - t) * (1 - t));
        };
        const easedProgress = easing(progress);

        const positions = this.model.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            const params = this.orbitalParams[i / 3];
            if (!params) continue;

            const time = progress * Math.PI * 2 * params.orbitSpeed + params.orbitPhase;
            const spiralRadius = params.orbitRadius * (1 - easedProgress);
            const spiralAngle = time + params.startAngle * (1 - easedProgress);

            // Spiral path
            const spiralX = Math.cos(spiralAngle) * spiralRadius;
            const spiralY = Math.sin(spiralAngle) * spiralRadius;
            const spiralZ = (1 - easedProgress) * params.startDistance * 0.2;

            // Slight flowing motion
            const flowX = Math.sin(time * 2 + params.orbitPhase) * 5 * (1 - easedProgress);
            const flowY = Math.cos(time * 2 + params.orbitPhase) * 5 * (1 - easedProgress);

            positions[i] =
                this.originalPositions[i] * easedProgress +
                (spiralX + flowX) * (1 - easedProgress);

            positions[i + 1] =
                this.originalPositions[i + 1] * easedProgress +
                (spiralY + flowY) * (1 - easedProgress);

            positions[i + 2] =
                this.originalPositions[i + 2] * easedProgress +
                spiralZ * (1 - easedProgress);
        }

        this.model.geometry.attributes.position.needsUpdate = true;

        // Once done, stop swirling
        if (progress >= 1) {
            this.isAnimatingIn = false;
            this.orbitalParams = null;
        }
    }

    // --------------------------------------------------
    //  LOADING THE MODEL + LOADING THE TEXT
    // --------------------------------------------------

    loadModel() {
        const loader = new THREE.PLYLoader();
        const modelPath = 'Models/orchid.ply';

        loader.load(
            modelPath,
            (geometry) => {
                const bufferGeometry = geometry.isBufferGeometry
                    ? geometry
                    : new THREE.BufferGeometry().fromGeometry(geometry);

                bufferGeometry.computeVertexNormals();

                this.originalPositions = new Float32Array(
                    bufferGeometry.attributes.position.array
                );
                this.currentPositions = new Float32Array(this.originalPositions);
                this.velocities = new Float32Array(this.originalPositions.length);
                
                // Store original colors
                this.originalColors = new Float32Array(bufferGeometry.attributes.color.array);

                const material = new THREE.PointsMaterial({
                    size: this.particleSize,
                    vertexColors: true,
                    sizeAttenuation: true,
                    map: this.createParticleTexture(),
                    transparent: true,
                    alphaTest: 0.5
                });

                this.model = new THREE.Points(bufferGeometry, material);

                bufferGeometry.computeBoundingBox();
                const box = bufferGeometry.boundingBox;
                const center = box.getCenter(new THREE.Vector3());
                // Move the point cloud so its center is at (0,0,0) prior to reposition
                this.model.position.copy(center).multiplyScalar(-1);

                // Then offset to desired location
                this.model.position.add(this.modelPosition);
                this.model.scale.setScalar(this.modelScale);
                this.model.rotation.set(
                    this.modelRotation.x,
                    this.modelRotation.y,
                    this.modelRotation.z
                );

                // Initialize particle dispersion vectors
                this.initParticleDispersion();
                this.initParticlePositions();

                // Add the model to the scene
                this.scene.add(this.model);

                // Load text positions after model is loaded
                this.loadTextPositions();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('Error loading PLY:', error);
            }
        );
    }

    loadTextPositions() {
        const loader = new THREE.FontLoader();
        const modelPaths = [
            'fonts/helvetiker_regular.typeface.json'
        ];
        const loadedGeometries = [];
        let loadedCount = 0;

        const processGeometries = () => {
            if (loadedCount === modelPaths.length) {
                // Create text geometries
                const font = loadedGeometries[0];
                const textGeometries = [];
                const words = ['ABOUT', 'CLIENTS', 'CONTACT'];
                const yPositions = [5, 0, -5];  // Vertical spacing between words

                words.forEach((text, index) => {
                    // Create a simple plane geometry instead of text geometry
                    const geometry = new THREE.PlaneGeometry(0.01, 0.01);
                    geometry.translate(0, yPositions[index], 0);
                    textGeometries.push(geometry);
                });

                const mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(textGeometries);
                mergedGeometry.translate(0, 0, 5);
                
                // Store original merged geometry for resize handling
                this.originalTextGeometry = mergedGeometry.clone();

                // Ensure we have enough points for the text
                const pointsNeeded = words.join('').length * 300; // 300 points per letter
                
                if (this.originalPositions.length < pointsNeeded) {
                    let newPositions = new Float32Array(pointsNeeded * 3);  
                
                    for (let i = 0; i < newPositions.length; i += 3) {
                        const originalIndex = (i % this.originalPositions.length);
                        newPositions[i] = this.originalPositions[originalIndex];
                        newPositions[i + 1] = this.originalPositions[originalIndex + 1];
                        newPositions[i + 2] = this.originalPositions[originalIndex + 2];
                    }
                
                    this.originalPositions = newPositions;
                
                    if (this.model) {
                        this.model.geometry.setAttribute('position', new THREE.BufferAttribute(this.originalPositions, 3));
                        this.model.geometry.attributes.position.needsUpdate = true;
                    }
                }

                // Sample points using canvas-based approach
                if (this.originalPositions) {
                    const result = this.sampleGeometryPointsWithGroups(textGeometries, this.originalPositions.length / 3);
                    this.sampledTextPoints = result.points;
                    this.pointGroups = result.groups;
                }
                
                // Use the stored points
                if (this.sampledTextPoints) {
                    this.finalTextPositions = new Float32Array(this.sampledTextPoints);
                }
            }
        };

        // Load font
        loader.load(
            modelPaths[0],
            (font) => {
                loadedGeometries[0] = font;
                loadedCount++;
                processGeometries();
            },
            null,
            (error) => console.error('Error loading font:', error)
        );
    }

    sampleGeometryPointsWithGroups(geometries, totalCount) {
        const points = new Float32Array(totalCount * 3);
        const groups = new Array(totalCount);
        
        let currentIndex = 0;
        
        // Configuration for text appearance
        const config = {
            canvasWidth: 1024,
            canvasHeight: 256,
            fontSize: 180
        };

        // Adjust scale based on screen width
        let worldScale;
        const width = window.innerWidth;
        if (width <= 360) {
            worldScale = 0.023;  // Much bigger for very small screens
        } else if (width <= 500) {
            worldScale = 0.023;  // Bigger for small mobile
        } else if (width <= 768) {
            worldScale = 0.02;   // Big for mobile
        } else if (width <= 1024) {
            worldScale = 0.018;  // Medium for tablets
        } else {
            worldScale = 0.015;  // Original size for desktop
        }

        config.worldScale = worldScale;
        config.verticalSpacing = 5;
        config.zPosition = 5;
        
        geometries.forEach((geometry, groupIndex) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = config.canvasWidth;
            canvas.height = config.canvasHeight;
            
            // Set up the canvas for text rendering
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = `bold ${config.fontSize}px Arial`;  
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw the text
            const text = ['ABOUT', 'SERVICES', 'CONTACT'][groupIndex];
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            
            // Get pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            // Count white pixels for distribution
            let whitePixels = 0;
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i] > 128) whitePixels++;
            }
            
            // Calculate points for this text based on its pixel count
            const pointsForText = Math.floor((whitePixels / (canvas.width * canvas.height)) * totalCount * 2);
            
            // Sample points from white pixels
            let attempts = 0;
            let pointsAdded = 0;
            const maxAttempts = pointsForText * 4;  
            
            while (pointsAdded < pointsForText && attempts < maxAttempts && currentIndex < totalCount) {
                const x = Math.floor(Math.random() * canvas.width);
                const y = Math.floor(Math.random() * canvas.height);
                const pixelIndex = (y * canvas.width + x) * 4;
                
                if (pixels[pixelIndex] > 128) {  
                    // Convert canvas coordinates to world coordinates with new scaling
                    const worldX = (x - canvas.width/2) * config.worldScale;
                    const worldY = (canvas.height/2 - y) * config.worldScale;
                    
                    // Position vertically with more spacing
                    const yOffset = (1 - groupIndex) * config.verticalSpacing;
                    
                    points[currentIndex * 3] = worldX;
                    points[currentIndex * 3 + 1] = worldY + yOffset;
                    points[currentIndex * 3 + 2] = config.zPosition;
                    
                    groups[currentIndex] = groupIndex;
                    currentIndex++;
                    pointsAdded++;
                }
                attempts++;
            }
        });
        
        return { points, groups };
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Simple white circle
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    // --------------------------------------------------
    //  CAMERA & RESIZE
    // --------------------------------------------------

    calculateCameraPosition() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = width / height;

        // Default
        let y = -60;
        let z = 5;
        let zoomY = 29;
        let zoomZ = -4.7;

        // Responsive tweaks (modify as needed)
        if (width <= 360) {
            y = -180; // further away
            z = 5;
            zoomY = 40;
            zoomZ = -6;
        } else if (width <= 500) {
            y = -160; // further away
            z = 5;
            zoomY = 40;
            zoomZ = -6;
        } else if (width <= 768) {
            y = -120; // further away
            z = 5;
            zoomY = 40;
            zoomZ = -6;
        } else if (width <= 1024) {
            y = -80;
            z = 5;
            zoomY = 35;
            zoomZ = -5.5;
        } else if (width <= 1440) {
            y = -60;
            z = 5;
            zoomY = 30;
            zoomZ = -5;
        } else {
            y = -60;
            z = 5;
            zoomY = 29;
            zoomZ = -4.7;
        }

        // Adjust if portrait or ultrawide
        if (aspectRatio < 1) {
            y *= 0.8;
            z *= 1.2;
            zoomY *= 0.9;
        } else if (aspectRatio > 2) {
            y *= 1.2;
            z *= 0.8;
            zoomY *= 1.1;
        }

        this.initialCameraPosition = new THREE.Vector3(0, y, z);
        this.zoomTarget = new THREE.Vector3(0, zoomY, zoomZ);

        // Only reset camera position if we're not already scrolled
        if (this.camera) {
            if (!this.currentScrollProgress || this.currentScrollProgress === 0) {
                this.camera.position.copy(this.initialCameraPosition);
                this.camera.lookAt(0, 0, 0);
            } else {
                // If we're scrolled, maintain the zoom level
                const zoomProgress = this.currentScrollProgress > 0.4 ? 
                    Math.min((this.currentScrollProgress - 0.4) / 0.3, 1) * 0.3 : 0;

                const newPosition = new THREE.Vector3();
                newPosition.lerpVectors(
                    this.initialCameraPosition,
                    this.zoomTarget,
                    zoomProgress
                );
                this.camera.position.copy(newPosition);
                this.camera.lookAt(this.modelPosition);
            }
        }
    }

    onWindowResize() {
        console.log('Resize Event - Before:', {
            lastScrollPosition: this.lastScrollPosition,
            lastHeroHeight: this.lastHeroHeight,
            currentScrollProgress: this.currentScrollProgress,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            finalTextPositions: this.finalTextPositions ? 'exists' : 'null'
        });

        // Update camera aspect and renderer size first
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Use stored sampled points
        if (this.sampledTextPoints) {
            console.log('Using stored text positions');
            this.finalTextPositions = new Float32Array(this.sampledTextPoints);
        }

        // Calculate new camera position (this now respects scroll state)
        this.calculateCameraPosition();

        // Preserve scroll state by recalculating with new window height
        if (this.lastScrollPosition !== undefined && this.lastHeroHeight !== undefined) {
            // Adjust scroll position to maintain relative progress
            const oldProgress = this.lastScrollPosition / this.lastHeroHeight;
            const newScrollY = oldProgress * window.innerHeight;
            
            console.log('Preserving scroll state:', {
                oldProgress,
                newScrollY,
                oldHeight: this.lastHeroHeight,
                newHeight: window.innerHeight
            });
            
            // Update stored values
            this.lastHeroHeight = window.innerHeight;
            this.lastScrollPosition = newScrollY;
            
            // Manually trigger scroll handler to update everything
            this.handleScroll();
        }

        // Update text position based on flower size
        this.updateTextPosition();

        console.log('Resize Event - After:', {
            lastScrollPosition: this.lastScrollPosition,
            lastHeroHeight: this.lastHeroHeight,
            currentScrollProgress: this.currentScrollProgress,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            finalTextPositions: this.finalTextPositions ? 'exists' : 'null'
        });
    }

    updateTextPosition() {
        const introText = document.querySelector('.intro-text');
        if (!introText || !this.model) return;

        // Get flower bounding box
        const flowerBox = new THREE.Box3().setFromObject(this.model);
        const flowerSize = new THREE.Vector3();
        flowerBox.getSize(flowerSize);

        // Convert flower world position to screen coordinates
        const flowerScreenPos = this.model.position.clone();
        flowerScreenPos.project(this.camera);

        // Convert to pixel coordinates
        const pixelX = (flowerScreenPos.x + 1) * window.innerWidth / 2;
        const pixelY = (-flowerScreenPos.y + 1) * window.innerHeight / 2;

        // Calculate safe area for text
        const safeLeft = Math.min(window.innerWidth * 0.05, pixelX - flowerSize.x * 100);
        const safeWidth = Math.min(400, window.innerWidth * 0.3);

        // Update text position if it would overlap with flower
        if (introText) {
            const textRight = safeLeft + safeWidth;
            const flowerLeft = pixelX - flowerSize.x * 50;
            
            if (textRight > flowerLeft) {
                introText.style.maxWidth = `${flowerLeft - safeLeft - 20}px`;
            }
        }
    }

    // --------------------------------------------------
    //  THEME HANDLING (IF NEEDED)
    // --------------------------------------------------

    updateTheme() {
        // Force a color update when theme changes
        if (this.model && this.reassembleProgress > 0) {
            this.model.geometry.attributes.color.needsUpdate = true;
        }
    }

    // --------------------------------------------------
    //  (OPTIONAL) DEBUG CONTROLS
    // --------------------------------------------------

    initDebugControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'd') {
                this.debugMode = !this.debugMode;
                console.log('Debug mode:', this.debugMode);
            }
            if (!this.debugMode) return;

            // Example: Arrow keys to nudge model
            const moveAmount = e.shiftKey ? 0.1 : 0.5;
            switch (e.key) {
                case 'ArrowUp':
                    if (e.ctrlKey || e.metaKey) {
                        this.modelPosition.z -= moveAmount;
                    } else {
                        this.modelPosition.y += moveAmount;
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey || e.metaKey) {
                        this.modelPosition.z += moveAmount;
                    } else {
                        this.modelPosition.y -= moveAmount;
                    }
                    break;
                case 'ArrowLeft':
                    this.modelPosition.x -= moveAmount;
                    break;
                case 'ArrowRight':
                    this.modelPosition.x += moveAmount;
                    break;
            }
            // Re-apply
            if (this.model) {
                this.model.position.set(
                    this.modelPosition.x,
                    this.modelPosition.y,
                    this.modelPosition.z
                );
            }
        });
    }

    preventBackgroundScroll(e) {
        if (document.body.classList.contains('window-open')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    // Add method for handling text clicks
    onCanvasClick(event) {
        // Only allow clicking when text is fully formed and not already animating
        if (!this.model || this.disperseProgress < 0.87 || this.reassembleProgress < 1 || this.textScatterActive) return;

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        // Check for intersections with the point cloud
        const intersects = this.raycaster.intersectObject(this.model);

        if (intersects.length > 0) {
            // Get the index of the clicked point
            const pointIndex = intersects[0].index;
            
            // Determine which group (word) was clicked
            const groupIndex = this.pointGroups[pointIndex];
            
            // Initialize scatter vectors if not already done
            if (!this.textScatterVectors) {
                this.initTextScatterVectors();
            }
            
            // Start scatter animation and set the window to open
            this.textScatterActive = true;
            this.textScatterDirection = 'out';
            this.textScatterProgress = 0;
            
            // Store the window ID to open after animation
            switch(groupIndex) {
                case 0:
                    this.activeWindowId = 'about-window';
                    break;
                case 1:
                    this.activeWindowId = 'services-window';
                    break;
                case 2:
                    this.activeWindowId = 'contact-window';
                    break;
            }
        }
    }

    // Add method to initialize close buttons
    initializeCloseButtons() {
        const windows = ['about-window', 'services-window', 'contact-window'];
        windows.forEach(windowId => {
            const windowElement = document.getElementById(windowId);
            if (windowElement) {
                const closeBtn = windowElement.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        // Start scatter-in animation
                        this.textScatterActive = true;
                        this.textScatterDirection = 'in';
                        this.textScatterProgress = 1;
                        
                        // Hide the window immediately
                        windowElement.style.display = 'none';
                        this.activeWindowId = null;
                    });
                }
            }
        });
    }

    // Update window display methods
    showWindow(windowId) {
        const window = document.getElementById(windowId);
        window.style.display = 'block';
        
        // Set scroll position CSS variable
        document.documentElement.style.setProperty('--scroll-top', `${window.scrollY}px`);
        
        // Trigger reflow
        window.offsetHeight;
        window.classList.add('visible');
        document.body.classList.add('window-open');
        
        // Add global scroll prevention
        document.addEventListener('wheel', this.windowScrollHandler, { passive: false });
        document.addEventListener('touchmove', this.windowScrollHandler, { passive: false });
        document.addEventListener('scroll', this.windowScrollHandler, { passive: false });
    }

    closeWindow(windowId) {
        const window = document.getElementById(windowId);
        window.classList.remove('visible');
        document.body.classList.remove('window-open');
        
        // Remove scroll event listeners
        if (window._preventScrollHandler) {
            window.removeEventListener('wheel', window._preventScrollHandler);
            window.removeEventListener('touchmove', window._preventScrollHandler);
            delete window._preventScrollHandler;
        }
        
        // Remove global scroll prevention
        document.removeEventListener('wheel', this.windowScrollHandler);
        document.removeEventListener('touchmove', this.windowScrollHandler);
        document.removeEventListener('scroll', this.windowScrollHandler);
        
        // Start scatter-in animation
        this.textScatterActive = true;
        this.textScatterDirection = 'in';
        
        // Wait for fade out before hiding
        setTimeout(() => {
            window.style.display = 'none';
            // Set scroll to bottom without animation
            document.documentElement.style.scrollBehavior = 'auto';
            document.documentElement.scrollTop = document.documentElement.scrollHeight;
            document.documentElement.style.scrollBehavior = '';
        }, 500); // Match the CSS transition duration
    }
}

// Init once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundAnimation();
});