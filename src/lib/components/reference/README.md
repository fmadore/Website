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

## Glassmorphism Design Compliance

All components follow the established glassmorphism design system:

### Blur Values (Optimized for Readability)
- **ItemReference**: 2px blur (minimal hover effects)
- **ReferenceLink**: 4px blur (readable interactive elements)  
- **ReferencePreviewCard**: 8px blur (content areas with high opacity backgrounds)

### Gradient Patterns
All use 135-degree gradients with consistent opacity levels:
- Light mode: Primary/accent colors with 0.01-0.08 opacity
- Dark mode: Enhanced opacity (0.02-0.12) for better visibility

### Box Shadows
- Standard glassmorphism shadows with inset highlights
- Enhanced shadows on hover/active states
- Dark mode specific shadow adaptations

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