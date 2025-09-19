# Tina CMS Setup Guide

## Quick Start

1. **Install Tina CMS dependencies:**
   ```bash
   npm install
   ```

2. **Get Tina credentials:**
   - Go to [tina.io](https://tina.io) and create an account
   - Create a new project
   - Get your `clientId` and `token` from the project dashboard

3. **Configure Tina:**
   - Open `tina/config.js`
   - Replace `clientId: null` with your actual client ID
   - Replace `token: null` with your actual token

4. **Run with Tina CMS:**
   ```bash
   npm run dev
   ```
   This will start both the Python server and Tina's admin interface.

5. **Access the admin:**
   - Portfolio site: `http://localhost:8000`
   - Tina admin: `http://localhost:8000/admin`

## Managing Portfolio Images

### Adding New Images:
1. Go to `http://localhost:8000/admin`
2. Navigate to "Portfolio" collection
3. Click "Create New"
4. Fill in:
   - **Title**: Name of the work/collection
   - **Description**: Brief description
   - **Image**: Upload your image file
   - **Alt Text**: Accessibility description
   - **Display Order**: Number for sorting (1, 2, 3...)
   - **Featured**: Check if this should be displayed larger

### Image Guidelines:
- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 1200px wide minimum
- **Aspect Ratio**: 4:5 for regular items, 16:10 for featured items
- **File Size**: Keep under 2MB for web performance

### Organizing Images:
- Use the **Display Order** field to control the sequence
- **Featured** images appear larger in the gallery
- Images are automatically optimized for web display

## Site Settings

You can also edit global site settings:
1. Go to "Site Settings" in the admin
2. Update:
   - Portfolio introduction text
   - Contact information
   - Site title

## Development Notes

- Portfolio data is stored in `content/portfolio/` as JSON files
- Site settings are in `content/settings/site.json`
- Images should be placed in the `images/` folder
- The gallery automatically loads and displays all portfolio items

## Production Deployment

For production deployment:
1. Run `npm run build` to build the Tina admin
2. Deploy the entire site to your hosting provider
3. Ensure your hosting supports the Tina admin interface

## Fallback Mode

If Tina CMS is not configured, the gallery will use placeholder data with the existing profile image. This ensures the site always works even without CMS setup.
