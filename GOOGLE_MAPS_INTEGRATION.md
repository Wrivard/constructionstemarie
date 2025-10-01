# Google Maps Integration Guide

This guide provides step-by-step instructions for integrating Google Maps into your website, specifically using Google My Maps custom maps. This approach ensures a clean display without the black title bar, proper centering on your service area, and elimination of console errors.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating Your Custom Map](#creating-your-custom-map)
3. [HTML Implementation](#html-implementation)
4. [Content Security Policy (CSP) Configuration](#content-security-policy-csp-configuration)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)
6. [Advanced Customization](#advanced-customization)

## Prerequisites

1. **Google Account**: You need a Google account to create and share custom maps.
2. **Google Maps API Key**: For some advanced features, you may need an API key from the [Google Cloud Console](https://console.cloud.google.com/).
3. **Website with HTML access**: You need to be able to edit your website's HTML and configuration files.

## Creating Your Custom Map

1. **Create a Custom Map**:
   - Go to [Google My Maps](https://www.google.com/maps/d/)
   - Click "Create a New Map"
   - Add your service area by drawing shapes, adding markers, etc.
   - Customize the colors and styles as needed

2. **Share Your Map**:
   - Click the "Share" button
   - Make sure the map is set to "Public" or "Anyone with the link"
   - Copy the share link

3. **Get the Embed URL**:
   - From your map view, click the three-dot menu
   - Select "Embed on my site"
   - Copy the provided iframe code
   - Extract just the URL from the src attribute (should start with `https://www.google.com/maps/d/embed?mid=...`)

## HTML Implementation

Use the following HTML structure to embed your map without the black title bar:

```html
<div class="map-wrapper" style="width: 100%; height: 600px; overflow: hidden;">
  <iframe 
    class="google-map"
    src="YOUR_MAP_EMBED_URL&noprof=1&z=10" 
    width="100%" 
    height="750" 
    style="border:0; margin-top: -150px;" 
    allowfullscreen="" 
    loading="lazy" 
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</div>
```

### Key Components Explained:

1. **Container Div**:
   - `height: 600px`: Sets the visible height of your map
   - `overflow: hidden`: Ensures no scrollbars appear

2. **Iframe Element**:
   - `height: 750px`: Makes the iframe taller than the container (150px extra)
   - `margin-top: -150px`: Pushes the iframe up to hide the black title bar
   - `YOUR_MAP_EMBED_URL`: Replace with your map's embed URL
   - `&noprof=1`: Removes some Google branding
   - `&z=10`: Sets the zoom level (adjust as needed for your area)

3. **Important Parameters**:
   - Add `&z=10` to control zoom level (higher number = more zoomed in)
   - You can add `&center=LAT,LNG` to center on specific coordinates

## Content Security Policy (CSP) Configuration

To avoid console errors, configure your CSP headers in your server configuration. For Vercel, update your `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'self' 'unsafe-inline'; img-src * 'self' data: blob:; font-src * 'self' data:; connect-src * 'self'; frame-src * 'self';"
        }
      ]
    }
  ]
}
```

For other servers:

- **Apache** (.htaccess):
  ```
  Header set Content-Security-Policy-Report-Only "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'self' 'unsafe-inline'; img-src * 'self' data: blob:; font-src * 'self' data:; connect-src * 'self'; frame-src * 'self';"
  ```

- **Nginx**:
  ```
  add_header Content-Security-Policy-Report-Only "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'self' 'unsafe-inline'; img-src * 'self' data: blob:; font-src * 'self' data:; connect-src * 'self'; frame-src * 'self';";
  ```

## Troubleshooting Common Issues

### Map Not Loading

1. **Check URL**: Ensure your embed URL is correct and the map is publicly accessible
2. **CSP Issues**: Check browser console for CSP errors and adjust your headers
3. **CORS Issues**: Make sure your server allows embedding from Google domains

### Black Bar Still Visible

1. **Adjust Margin**: Try increasing the negative margin (e.g., `-170px` instead of `-150px`)
2. **Check Height**: Ensure the iframe is at least 150px taller than the container
3. **Inspect Element**: Use browser dev tools to see if any other elements are causing issues

### Map Not Centered Correctly

1. **Adjust Zoom**: Change the `&z=` parameter (values typically between 8-14)
2. **Set Center**: Add `&center=LAT,LNG` with your desired coordinates
3. **Reset View**: In Google My Maps, set the default view before embedding

## Advanced Customization

### Responsive Design

For better mobile experience, consider using media queries:

```css
@media (max-width: 768px) {
  .map-wrapper {
    height: 400px; /* Smaller height on mobile */
  }
  
  .map-wrapper iframe {
    height: 550px; /* Adjust accordingly */
  }
}
```

### Custom Controls

To add custom controls around your map:

```html
<div class="map-container">
  <div class="map-controls">
    <button onclick="zoomIn()">Zoom In</button>
    <button onclick="zoomOut()">Zoom Out</button>
  </div>
  
  <div class="map-wrapper">
    <!-- iframe as shown above -->
  </div>
  
  <div class="map-legend">
    <p><strong>Legend:</strong> Red area = Primary service area</p>
  </div>
</div>

<script>
  function zoomIn() {
    // Custom zoom functionality
  }
  
  function zoomOut() {
    // Custom zoom functionality
  }
</script>
```

## Quick Reference

### Complete Example

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Area Map</title>
  <style>
    .map-wrapper {
      width: 100%;
      height: 600px;
      overflow: hidden;
      margin: 20px 0;
    }
    
    .google-map {
      width: 100%;
      height: 750px;
      border: 0;
      margin-top: -150px;
    }
    
    @media (max-width: 768px) {
      .map-wrapper {
        height: 400px;
      }
      
      .google-map {
        height: 550px;
      }
    }
  </style>
</head>
<body>
  <h2>Notre zone de service</h2>
  
  <div class="map-wrapper">
    <iframe 
      class="google-map"
      src="https://www.google.com/maps/d/embed?mid=YOUR_MAP_ID&ehbc=2E312F&noprof=1&z=10" 
      allowfullscreen="" 
      loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  </div>
  
  <p>Nous servons toute la région indiquée sur la carte. Contactez-nous pour plus d'informations.</p>
</body>
</html>
```

Replace `YOUR_MAP_ID` with your actual Google My Maps ID.

---

This documentation should help you implement Google Maps across multiple projects with the same clean appearance and functionality we achieved in the current project.
