# Sanity CMS Setup Guide

## Overview
Your portfolio is now integrated with Sanity.io for content management. This allows you to easily add, edit, and manage portfolio projects through a beautiful admin interface.

## Project Details
- **Project ID**: sy1y9q7w
- **Organization ID**: oO1IZQLHF
- **Dataset**: production
- **Studio URL**: https://amandamichelena.sanity.studio/

## Quick Start

### Access Your CMS
Go to **https://amandamichelena.sanity.studio/** to manage your portfolio content from anywhere!

### Run the Portfolio Site Locally
```bash
npm start
# or
python3 -m http.server 8000
```
Site will be available at: http://localhost:8000

## Using Sanity Studio

### Adding a New Portfolio Project

1. Open Sanity Studio at https://amandamichelena.sanity.studio/
2. Click "Portfolio Projects" in the sidebar
3. Click "Create new Portfolio Projects"
4. Fill in the fields:
   - **Title**: Project name (required)
   - **Slug**: Auto-generated from title (click "Generate")
   - **Description**: Brief project description (required)
   - **Hero Image**: Main thumbnail image for the gallery
   - **Hero Video**: Optional video to use instead of hero image
   - **Project Images**: Additional images shown in project detail view
   - **Project Videos**: Additional videos for the project
   - **Category**: Select from predefined categories
   - **Year**: 4-digit year (e.g., 2024)
   - **Client**: Client name
   - **Display Order**: Lower numbers appear first (required)
   - **Featured Project**: Toggle to highlight this project
   - **Published**: Toggle to show/hide on website

5. Click "Publish" to make it live

### Managing Existing Projects

- Click on any project to edit
- Use the "Display Order" field to reorder projects
- Toggle "Published" to hide/show projects without deleting them
- Upload multiple images by clicking "Add item" in the Project Images section

## CORS Configuration

You need to add your domain to Sanity's CORS settings:

1. Go to https://www.sanity.io/manage
2. Select your project (sy1y9q7w)
3. Go to "API" settings
4. Under "CORS Origins", add:
   - `http://localhost:8000` (for local development)
   - `https://amandamichelena.com` (for production)
5. Enable "Allow credentials" for both

## Deploying Sanity Studio

To deploy your Sanity Studio to the web:

```bash
npm run studio:deploy
```

This will deploy your studio to: https://amandamichelena-com.sanity.studio

## API Access

The frontend automatically fetches portfolio data from Sanity using the client configured in `js/sanity-client.js`.

### Query Example
```javascript
import { getPortfolioProjects } from './js/sanity-client.js';

const projects = await getPortfolioProjects();
```

## Schema Structure

The portfolio schema includes:
- Text fields: title, description, category, year, client
- Media fields: heroImage, heroVideo, projectImages, projectVideos
- Boolean fields: featured, published
- Number field: order (for sorting)

## Troubleshooting

### Projects not showing on website?
1. Check that projects are marked as "Published" in Sanity Studio
2. Verify CORS is configured correctly
3. Check browser console for errors
4. Make sure the site is running on http://localhost:8000

### Can't upload images/videos?
1. Check file size (Sanity has limits on free tier)
2. Verify file format is supported
3. Check your Sanity project quota

### Changes not appearing?
1. Sanity uses CDN caching - changes may take a few seconds
2. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Check that you clicked "Publish" in Sanity Studio

## Next Steps

1. Configure CORS in Sanity dashboard (see above)
2. Start adding your portfolio projects
3. Upload images and videos for each project
4. Organize projects using the Display Order field
5. Deploy Sanity Studio for remote access
