# Reference Components

This folder contains all components related to item references (publications and communications) with consistent glassmorphism design implementation.

## Components

### `ItemReference.svelte`
Main component that handles reference display with hover/click preview functionality.
- **Glassmorphism**: Uses minimal 2px blur for subtle hover effects that don't interfere with text
- **Features**: Touch device support, keyboard navigation, accessibility
- **Usage**: `<ItemReference id="item-id" />`

### `ReferenceLink.svelte`  
The clickable reference link element with citation formatting.
- **Glassmorphism**: Uses 4px blur with optimized opacity for better text readability
- **Features**: Auto-generated citation format, enhanced font weight for clarity
- **Usage**: Used internally by ItemReference

### `ReferencePreviewCard.svelte`
Preview card that appears on hover/click with item details.
- **Glassmorphism**: Uses 8px blur with high opacity background (95%+) for excellent text readability
- **Features**: Smart positioning, optimized shadows, solid content backgrounds
- **Usage**: Used internally by ItemReference

## Global CSS System Integration

All components are fully integrated with the global CSS design system using CSS variables for consistency:

### CSS Variables Used
- **Spacing**: `--spacing-1`, `--spacing-2`, `--spacing-3` for consistent padding/margins
- **Typography**: `--font-size-*`, `--font-weight-*`, `--line-height-*` for text styling
- **Colors**: `--color-primary-rgb`, `--color-accent-rgb` with global opacity variables
- **Opacity**: `--opacity-very-low`, `--opacity-low`, `--opacity-medium`, `--opacity-medium-high`, `--opacity-high`
- **Borders**: `--border-width-thin`, `--border-radius-*` for consistent borders
- **Shadows**: `--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`
- **Transforms**: `--transform-lift-sm`, `--transform-lift-md`

### Blur Values (Optimized for Readability)
- **ItemReference**: 2px blur (minimal hover effects using global opacity values)
- **ReferenceLink**: 4px blur (readable interactive elements with global variables)  
- **ReferencePreviewCard**: 8px blur (content areas with global shadow and opacity system)

### Design System Benefits
- **Consistency**: All components use the same global design tokens
- **Maintainability**: Changes to global values automatically update all components
- **Scalability**: Easy to extend with new variants using existing system
- **Theme compatibility**: Seamless light/dark mode transitions

### Accessibility
- Full keyboard navigation support
- ARIA labels and proper roles
- Reduced motion support
- High contrast mode support
- Backdrop filter fallbacks for older browsers

### Browser Support
- Backdrop filter with webkit prefixes
- Graceful fallbacks for unsupported browsers
- Touch device detection and optimization

## Import Path
```javascript
import ItemReference from '$lib/components/reference/ItemReference.svelte';
```

The components are now centralized in this folder for better maintainability and consistent design implementation. 