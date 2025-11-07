# CSS Grid Rendering Artifact - Angled Line Bug

## Problem Description

A thin, diagonal line appears across the contact section on certain pages, particularly when the browser window is not in fullscreen mode. The line:

- Appears diagonally across the contact section and sometimes extends into the map
- Cannot be clicked or inspected with browser DevTools (not a DOM element)
- Only appears when the browser window is not fullscreen
- Sometimes appears as two lines
- Only appears on pages that have a `section_gallery5` (gallery section) before the contact section
- Does NOT appear on pages without the gallery section before the contact section
- **Also appears in FAQ sections** on renovation pages (renovation-laval, renovation-terrebonne, etc.) where `section_cta27` appears before `section_faq2`

## Root Cause

The bug is caused by **CSS Grid rendering artifacts** from the `gallery5_row` grid layout bleeding into the adjacent `section_contact16` (contact section). 

### Why It Happens

1. **CSS Grid Sub-pixel Rendering**: The `gallery5_row` uses a 3-column grid (`grid-template-columns: 1fr 1fr 1fr`) which can create visual artifacts at certain viewport sizes due to sub-pixel positioning calculations.

2. **Browser Rendering Bug**: When the browser window is not fullscreen, the grid columns may not align perfectly, causing the browser's rendering engine to create visual artifacts (lines) that extend beyond the grid container's boundaries.

3. **Lack of Layout Isolation**: Without proper CSS containment, the grid layout calculations from one section can visually "bleed" into adjacent sections, especially when:
   - The browser window is resized to non-fullscreen dimensions
   - The viewport size creates fractional pixel calculations
   - Grid gaps and column boundaries don't align perfectly

4. **Why It Only Appears on Some Pages**: 
   - Pages with `section_gallery5` before `section_contact16` → **Line appears in contact section**
   - Pages without `section_gallery5` before `section_contact16` → **No line in contact section**
   - Pages with `section_cta27` before `section_faq2` → **Line appears in FAQ section** (renovation pages)

## Solution

The fix involves adding **CSS containment** and **overflow protection** to isolate the grid layout calculations and prevent visual artifacts from bleeding between sections.

### Global Fix (Recommended - Best Practice)

**✅ RECOMMENDED APPROACH**: For a site-wide fix that prevents this issue across all sections, add this global CSS rule at the top of your stylesheet:

```css
/* Global fix for CSS Grid rendering artifacts - prevents angled lines across all sections */
/* This applies CSS containment to all sections to prevent grid rendering artifacts from bleeding between sections */
section[class*="section_"] {
  position: relative;
  isolation: isolate;
  contain: layout style paint;
  transform: translateZ(0);
  will-change: auto;
}

/* Apply containment to all Webflow grid containers to prevent artifacts */
.w-layout-grid {
  position: relative;
  contain: layout;
}
```

**Why the Global Fix is Better:**
- ✅ **Prevents the bug site-wide** - Works for all current and future sections automatically
- ✅ **Less maintenance** - No need to fix each section individually
- ✅ **Consistent behavior** - All sections use the same containment rules
- ✅ **Future-proof** - Automatically applies to new sections you add
- ✅ **Safe to use** - CSS containment is a standard, well-supported property
- ✅ **Performance-friendly** - Can actually improve rendering performance by isolating layout calculations

**Is it Dangerous?**
- ❌ **No, it's safe** - CSS containment (`contain: layout style paint`) is a standard CSS property designed for this exact purpose
- ❌ **No clipping issues** - We removed `overflow: hidden !important` from the global fix to avoid clipping legitimate content
- ❌ **No performance impact** - The containment can actually improve performance by isolating layout calculations
- ⚠️ **Minor consideration** - `transform: translateZ(0)` forces hardware acceleration, which has minimal performance overhead but is generally beneficial

**When to Use Global Fix:**
- ✅ Use when you have multiple sections that could be affected
- ✅ Use for new projects to prevent the issue from the start
- ✅ Use when you want a consistent, maintainable solution

**When to Use Per-Section Fix:**
- ⚠️ Only use if the global fix causes unexpected issues with specific sections
- ⚠️ Use if you need more granular control over specific sections
- ⚠️ Use if you're working with legacy code that can't be modified globally

### Per-Section Fix (If Global Fix Doesn't Work)

If you need to fix specific sections individually, add the following CSS rules:

```css
/* Fix for gallery5 section - prevent grid artifacts */
.section_gallery5 {
  overflow: hidden !important;
  position: relative;
  isolation: isolate;
  border: none !important;
  outline: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  contain: layout style paint;
  transform: translateZ(0);
  will-change: auto;
}

.section_gallery5 * {
  border: none !important;
  outline: none !important;
  background-image: none !important;
}

.section_gallery5 *::before,
.section_gallery5 *::after {
  display: none !important;
  content: none !important;
  background: none !important;
  background-image: none !important;
}

.gallery5_component {
  overflow: hidden !important;
  position: relative;
  contain: layout;
}

.gallery5_grid-list {
  overflow: hidden !important;
  position: relative;
  contain: layout;
}

.gallery5_row {
  grid-column-gap: 2rem;
  grid-row-gap: 2rem;
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr 1fr;
  overflow: hidden;
  position: relative;
}

/* Fix for contact section - prevent artifacts from bleeding in */
.section_contact16 {
  overflow: hidden !important;
  position: relative;
  border: none !important;
  outline: none !important;
  isolation: isolate;
  contain: layout style paint;
  transform: translateZ(0);
  will-change: auto;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.contact16_component {
  overflow: hidden !important;
  position: relative;
  contain: layout;
}

.contact16_content {
  grid-column-gap: 5rem;
  grid-row-gap: 4rem;
  grid-template-rows: auto;
  grid-template-columns: 1fr .75fr;
  grid-auto-columns: 1fr;
  align-items: start;
  display: grid;
  overflow: hidden !important;
  position: relative;
  contain: layout;
  transform: translateZ(0);
}

.section_contact16 * {
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  background-image: none !important;
}

.section_contact16 *::before,
.section_contact16 *::after {
  display: none !important;
  content: none !important;
  background: none !important;
  background-image: none !important;
}

/* Fix for CTA section - prevent artifacts from bleeding into FAQ section */
.section_cta27 {
  position: relative;
  overflow: hidden !important;
  isolation: isolate;
  contain: layout style paint;
  transform: translateZ(0);
  will-change: auto;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.cta27_component {
  overflow: hidden !important;
  position: relative;
  contain: layout;
}

.section_cta27 * {
  border: none !important;
  outline: none !important;
  background-image: none !important;
}

.section_cta27 *::before,
.section_cta27 *::after {
  display: none !important;
  content: none !important;
  background: none !important;
  background-image: none !important;
}

/* Fix for FAQ section - prevent artifacts from bleeding in */
.section_faq2 {
  overflow: hidden !important;
  position: relative;
  border: none !important;
  outline: none !important;
  isolation: isolate;
  contain: layout style paint;
  transform: translateZ(0);
  will-change: auto;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.faq2_component {
  overflow: hidden !important;
  position: relative;
  contain: layout;
}

.section_faq2 * {
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  background-image: none !important;
}

.section_faq2 *::before,
.section_faq2 *::after {
  display: none !important;
  content: none !important;
  background: none !important;
  background-image: none !important;
}
```

## Key CSS Properties Explained

### `contain: layout style paint`
- **Purpose**: Isolates layout calculations, preventing one section's layout from affecting adjacent sections
- **Effect**: Creates a layout boundary that prevents grid rendering artifacts from bleeding through

### `isolation: isolate`
- **Purpose**: Creates a new stacking context, isolating the element from its siblings
- **Effect**: Prevents visual artifacts from overlapping between sections

### `overflow: hidden !important`
- **Purpose**: Clips any content that extends beyond the container boundaries
- **Effect**: Prevents grid artifacts from being visible outside the section

### `transform: translateZ(0)`
- **Purpose**: Forces hardware acceleration by creating a new compositing layer
- **Effect**: Uses GPU rendering which can prevent sub-pixel rendering bugs

### `will-change: auto`
- **Purpose**: Hints to the browser about what properties will change
- **Effect**: Optimizes rendering performance and can prevent rendering artifacts

## How to Identify This Bug

1. **Visual Check**: Look for thin, diagonal lines that appear across sections
2. **DevTools Check**: Try to click/inspect the line - if it can't be selected, it's likely a rendering artifact
3. **Viewport Check**: Resize the browser window - the line typically appears when not fullscreen
4. **Page Comparison**: Check if the line appears on pages with grid sections before the affected section (contact or FAQ)

## Prevention Tips

1. **Always use CSS containment** on grid sections that appear before other sections
2. **Add overflow protection** to grid containers
3. **Use isolation** to create stacking contexts between sections
4. **Test at different viewport sizes** - especially non-fullscreen dimensions
5. **Consider using Flexbox** instead of Grid for simpler layouts if artifacts persist

## Browser Compatibility

This bug has been observed in:
- Chrome/Edge (Chromium-based browsers)
- Firefox
- Safari

The fix works across all modern browsers that support CSS containment (`contain` property).

## Related Issues

- CSS Grid sub-pixel rendering bugs
- Browser rendering artifacts at fractional viewport sizes
- Layout bleeding between adjacent sections
- Visual artifacts that can't be inspected in DevTools

## Additional Notes

- This bug is more common when using CSS Grid with fractional units (`fr`)
- The issue is exacerbated when grid gaps don't align perfectly with pixel boundaries
- Adding a wrapper div with explicit height/width constraints can sometimes help if containment doesn't work
- In extreme cases, switching from Grid to Flexbox may be necessary

