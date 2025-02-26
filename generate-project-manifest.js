const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = './projects';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Get all image files in a directory
function getImagesInDirectory(dir) {
    return fs.readdirSync(dir)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return IMAGE_EXTENSIONS.includes(ext);
        });
}

// Generate manifest for each project
function generateProjectManifests() {
    const projects = [];
    
    // Read project directories
    const projectDirs = fs.readdirSync(PROJECTS_DIR)
        .filter(file => fs.statSync(path.join(PROJECTS_DIR, file)).isDirectory());

    projectDirs.forEach(projectDir => {
        const projectPath = path.join(PROJECTS_DIR, projectDir);
        
        // Get hero image (first image in project root)
        const rootImages = getImagesInDirectory(projectPath);
        if (rootImages.length === 0) {
            console.warn(`Warning: No hero image found in ${projectDir}`);
            return;
        }
        
        // Get sub-images
        const subImagesPath = path.join(projectPath, 'sub-images');
        let subImages = [];
        if (fs.existsSync(subImagesPath)) {
            subImages = getImagesInDirectory(subImagesPath);
        }
        
        // Create project manifest
        const projectManifest = {
            subImages: subImages
        };
        
        // Save project manifest
        fs.writeFileSync(
            path.join(projectPath, 'manifest.json'),
            JSON.stringify(projectManifest, null, 2)
        );
        
        // Add to projects list
        projects.push({
            name: projectDir,
            folder: projectDir,
            heroImage: rootImages[0],
            description: fs.existsSync(path.join(projectPath, 'description.txt')) 
                ? fs.readFileSync(path.join(projectPath, 'description.txt'), 'utf-8')
                : ''
        });
    });
    
    // Save main projects.json
    fs.writeFileSync(
        path.join(PROJECTS_DIR, 'projects.json'),
        JSON.stringify(projects, null, 2)
    );
    
    console.log('Generated project manifests successfully!');
}

generateProjectManifests();
