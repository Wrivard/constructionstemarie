# Section Content28 Component Documentation

## Overview
The `section_content28 color-scheme-3` component is a comprehensive content layout system designed for long-form content pages with an integrated table of contents sidebar. This component is specifically used for the cookie policy page and provides a structured, accessible way to present detailed information.

## Component Structure

### HTML Structure
```html
<section class="section_content28 color-scheme-3">
  <div class="padding-global">
    <div class="container-large">
      <div class="padding-section-large">
        <div class="content28_component">
          <!-- Main Content Area -->
          <div class="max-width-large">
            <div fs-toc-element="contents" class="text-rich-text w-richtext">
              <!-- Content goes here -->
            </div>
          </div>
          
          <!-- Table of Contents Sidebar -->
          <div class="content28_sidebar">
            <div class="content28_sidebar-heading">
              <h3 class="heading-style-h5">Table des matières</h3>
              <div class="content28_accordion-icon w-embed">
                <!-- Chevron SVG -->
              </div>
            </div>
            <div class="content28_link-content">
              <!-- TOC Links -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Key Features

### 1. Color Scheme System
- **Background**: White (`--color-scheme-3--background`)
- **Text**: Dark neutral (`--color-scheme-3--text`)
- **Accent**: Donkey brown (`--color-scheme-3--accent`)
- **Border**: Light neutral with opacity (`--color-scheme-3--border`)

### 2. Layout System
- **Desktop**: Two-column grid layout (content + sidebar)
- **Mobile**: Single column with sidebar above content
- **Responsive**: Automatically adapts to different screen sizes

### 3. Table of Contents (TOC)
- **Sticky positioning** on desktop
- **Hierarchical navigation** with nested links
- **Interactive elements** for expand/collapse functionality
- **Current page highlighting**

## CSS Classes and Styling

### Main Container Classes
```css
.section_content28.color-scheme-3 {
  background-color: var(--color-scheme-3--background);
  color: var(--color-scheme-3--text);
}

.content28_component {
  grid-column-gap: 4rem;
  grid-row-gap: 2rem;
  grid-template-rows: auto;
  grid-template-columns: 1fr 20rem;
  grid-auto-columns: 1fr;
  align-items: flex-start;
  display: grid;
}
```

### Sidebar Classes
```css
.content28_sidebar {
  flex-direction: column;
  width: 100%;
  margin-left: 12rem;
  display: flex;
  position: sticky;
  top: 2rem;
}

.content28_sidebar-heading {
  font-size: 1.5rem;
  /* Additional styling for mobile */
}
```

### Link Classes
```css
.content28_link {
  width: 100%;
  padding: .75rem 1rem;
  text-decoration: none;
}

.content28_link.current {
  border-style: solid;
  border-color: var(--color-scheme-1--border);
  background-color: var(--color-scheme-1--foreground);
  font-weight: 600;
}

.content28_link-wrapper.is-h3, 
.content28_link-wrapper.is-h4, 
.content28_link-wrapper.is-h5, 
.content28_link-wrapper.is-h6 {
  padding-left: 1rem;
}
```

## Content Structure Guidelines

### 1. Header Section
```html
<div style="text-align: center; padding: 30px 20px; background: #a69272; color: white; border-radius: 12px; margin-bottom: 30px;">
  <h1 style="font-size: 2.2rem; margin: 0 0 8px 0; font-weight: 600;">Page Title</h1>
  <p style="font-size: 0.95rem; margin: 0; opacity: 0.9;"><strong>Last Updated: Date</strong></p>
</div>
```

### 2. Content Sections
```html
<section id="section-id" style="margin-bottom: 35px;">
  <h2 style="color: #000; font-size: 1.4rem; margin-bottom: 12px; font-weight: 600; border-bottom: 2px solid #a69272; padding-bottom: 6px; display: inline-block;">Section Title</h2>
  <!-- Content goes here -->
</section>
```

### 3. Card Layouts
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin: 20px 0;">
  <div style="background: #fbf9f7; border: 1px solid #d8cbb5; border-radius: 8px; padding: 18px;">
    <h3 style="color: #000; margin-top: 0; margin-bottom: 10px; font-size: 1.1rem; font-weight: 600;">Card Title</h3>
    <p style="margin-bottom: 0; font-size: 0.9rem; line-height: 1.5; color: #666;">Card content</p>
  </div>
</div>
```

### 4. Data Tables
```html
<div style="overflow-x: auto; margin: 20px 0;">
  <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(166,146,114,0.15);">
    <thead>
      <tr style="background: #a69272; color: white;">
        <th style="padding: 12px 15px; text-align: left; font-weight: 600; font-size: 0.9rem;">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 15px; font-family: monospace; font-weight: 600; font-size: 0.85rem;">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Responsive Behavior

### Desktop (992px+)
- Two-column layout with content on left, sidebar on right
- Sidebar is sticky positioned
- 4rem gap between columns

### Tablet (768px - 991px)
- Single column layout
- Sidebar appears above content
- 3rem gap between elements

### Mobile (767px and below)
- Single column layout
- Sidebar heading becomes collapsible
- Reduced padding and margins

## Integration with Finsweet Table of Contents

The component includes integration with Finsweet's Table of Contents attributes:

### Required Attributes
- `fs-toc-element="contents"` on the main content container
- `fs-toc-element="link"` on each TOC link
- `fs-toc-element="ix-trigger"` on expand/collapse triggers

### Setup Instructions
1. Remove current classes from `content27_link` elements
2. Add element triggers for expand/collapse functionality
3. Configure animations for expand/collapse states
4. Disable interactions on tablet and below

## Color Palette

### Primary Colors
- **Background**: `#ffffff` (White)
- **Text**: `#312b22` (Dark neutral)
- **Accent**: `#a69272` (Donkey brown)

### Secondary Colors
- **Light Background**: `#fbf9f7`
- **Border**: `#d8cbb5`
- **Muted Text**: `#666666`

## Accessibility Features

1. **Semantic HTML**: Proper use of headings, sections, and landmarks
2. **Keyboard Navigation**: All interactive elements are keyboard accessible
3. **Focus States**: Clear focus indicators for navigation
4. **Screen Reader Support**: Proper ARIA labels and roles
5. **Color Contrast**: Meets WCAG guidelines for text contrast

## Usage Examples

### Basic Implementation
```html
<section class="section_content28 color-scheme-3">
  <div class="padding-global">
    <div class="container-large">
      <div class="padding-section-large">
        <div class="content28_component">
          <div class="max-width-large">
            <div fs-toc-element="contents" class="text-rich-text w-richtext">
              <!-- Your content here -->
            </div>
          </div>
          <div class="content28_sidebar">
            <!-- TOC implementation -->
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Custom Styling
To customize the component, override the CSS custom properties:

```css
.section_content28.color-scheme-3 {
  --color-scheme-3--background: #your-color;
  --color-scheme-3--text: #your-text-color;
  --color-scheme-3--accent: #your-accent-color;
}
```

## Best Practices

1. **Content Organization**: Use clear heading hierarchy (H1 → H2 → H3, etc.)
2. **Section IDs**: Ensure each section has a unique ID for TOC linking
3. **Mobile First**: Design content to work well on mobile devices
4. **Performance**: Keep inline styles minimal and use CSS classes when possible
5. **Accessibility**: Test with screen readers and keyboard navigation
6. **Content Length**: This component works best with substantial content that benefits from a table of contents

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Webflow CSS framework
- Finsweet Table of Contents attributes (optional)
- Custom CSS variables for color scheme system
