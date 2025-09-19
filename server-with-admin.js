const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 8000;

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// API endpoint to serve portfolio data
app.get('/api/portfolio', (req, res) => {
    try {
        const portfolioDir = path.join(__dirname, 'amanda-portfolio-cms', 'content', 'portfolio');
        const files = fs.readdirSync(portfolioDir);
        const portfolioItems = [];

        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(portfolioDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const item = JSON.parse(content);
                    portfolioItems.push(item);
                } catch (error) {
                    console.error(`Error reading ${file}:`, error);
                }
            }
        });

        // Sort by order field
        portfolioItems.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        res.json(portfolioItems);
    } catch (error) {
        console.error('Error loading portfolio:', error);
        res.status(500).json({ error: 'Failed to load portfolio data' });
    }
});

// API endpoint to serve site settings
app.get('/api/settings', (req, res) => {
    try {
        const settingsPath = path.join(__dirname, 'amanda-portfolio-cms', 'content', 'settings', 'site.json');
        const content = fs.readFileSync(settingsPath, 'utf8');
        const settings = JSON.parse(content);
        res.json(settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Return the relative path to the uploaded file
        const filePath = `uploads/${req.file.filename}`;
        res.json({ 
            success: true, 
            filePath: filePath,
            originalName: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Serve static files from the current directory (your portfolio site)
app.use(express.static(__dirname));

// Serve Tina CMS uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'amanda-portfolio-cms', 'public', 'uploads')));

// Proxy /admin requests to the Tina CMS running on port 3000
app.use('/admin', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/admin': '/admin', // Keep the /admin path
  },
}));

// Serve the main portfolio page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle all other routes by serving the main page (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Amanda's Portfolio is running at:`);
    console.log(`   Portfolio: http://localhost:${PORT}`);
    console.log(`   Admin:     http://localhost:${PORT}/admin`);
    console.log('');
    console.log('Make sure Tina CMS is running on port 3000 for admin access');
    console.log('Press Ctrl+C to stop the server');
});
