# Image Performance Optimizations

This document outlines the image performance improvements made to address Google PageSpeed Insights feedback about missing explicit width and height attributes.

## Changes Made

### 1. Added Explicit Dimensions
- Added `width` and `height` attributes to all `<img>` elements to prevent Cumulative Layout Shift (CLS)
- Used appropriate dimensions for different image types:
  - Publication/Communication covers: 200x280 (5:7 aspect ratio)
  - Card images: 300x200 (3:2 aspect ratio)  
  - Hero images: 600x400 (3:2 aspect ratio)
  - Preview card images: 120x160 (5:7 aspect ratio)
  - Research page images: 800x600 (4:3 aspect ratio)

### 2. Loading Optimizations
- Added `loading="lazy"` for images below the fold (most list images, research images, etc.)
- Added `loading="eager"` for above-the-fold images (profile picture)
- Added `decoding="async"` for better browser performance

### 3. CSS Improvements
- Added `aspect-ratio` CSS properties for consistent layouts
- Enhanced `object-fit: cover` usage for better image fitting
- Created utility classes in `styles/utilities/images.css` for reusable image styling

### 4. Components Updated

#### Publications Page
- **PublicationItem.svelte**: Added dimensions and lazy loading to publication cover images
- **Card.svelte**: Enhanced generic card component with proper image attributes

#### Communications Page  
- **CommunicationItem.svelte**: Added dimensions and lazy loading to communication images

#### Common Components
- **HeroImageDisplay.svelte**: Added dimensions to hero images
- **ReferencePreviewCard.svelte**: Added dimensions to preview card images
- **ProfileBanner.svelte**: Added eager loading for above-the-fold profile image

#### Page Components
- **Research pages**: Added dimensions to all research project images
- **Digital humanities pages**: Added dimensions to gallery images

## Performance Benefits

1. **Reduced Cumulative Layout Shift (CLS)**: Explicit dimensions prevent layout shifts as images load
2. **Faster Perceived Performance**: Lazy loading reduces initial page load time
3. **Better Core Web Vitals**: Improved LCP (Largest Contentful Paint) scores
4. **Consistent Layouts**: Aspect ratios ensure predictable image containers

## CSS Utilities Added

Created `styles/utilities/images.css` with:
- Aspect ratio utilities (`.aspect-square`, `.aspect-video`, `.aspect-photo`, etc.)
- Object-fit utilities (`.object-cover`, `.object-contain`, etc.)
- Loading state animations
- Responsive image base classes

## Browser Support

- `loading="lazy"`: Supported in all modern browsers
- `decoding="async"`: Supported in all modern browsers  
- `aspect-ratio`: Supported in all modern browsers (CSS feature)

## Testing

The changes maintain backward compatibility while providing significant performance improvements. All components render correctly and images maintain their responsive behavior.
