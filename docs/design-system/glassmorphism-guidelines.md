# Glassmorphism Design System Guidelines

## Overview

This document outlines the coherent glassmorphism design system implemented across all components. The design ensures visual consistency, proper contrast ratios, and unified aesthetic throughout the application.

## Core Design Principles

### 1. **Consistent Blur Values**
- **Header Navigation**: `blur(20px)` - Strong blur for top-level navigation
- **Main Content Areas**: `blur(10px)` - Standard blur for content containers
- **Interactive Elements**: `blur(8px)` - Lighter blur for buttons and small components
- **Subtle Elements**: `blur(4px)` - Minimal blur for accents and decorations

### 2. **Standardized Gradient Patterns**
All components use the consistent 135-degree gradient pattern:

```css
background: linear-gradient(
  135deg,
  rgba(base-color, opacity-1) 0%,
  rgba(--color-primary-rgb, opacity-2) 50%,
  rgba(--color-highlight-rgb, opacity-3) 100%
);
```

#### Light Mode Opacity Levels:
- **Primary containers**: `0.03, 0.02, 0.01`
- **Hover states**: `0.05, 0.03, 0.02`
- **Header/Navigation**: `0.8, 0.02, 0.01` (higher base opacity)

#### Dark Mode Opacity Levels:
- **Primary containers**: `0.06, 0.04, 0.02`
- **Hover states**: `0.08, 0.06, 0.04`
- **Header/Navigation**: `0.8, 0.04, 0.02`

### 3. **Consistent Box Shadow System**

#### Light Mode Shadows:
```css
box-shadow: 
  0 8px 32px 0 rgba(31, 38, 135, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.2);
```

#### Dark Mode Shadows:
```css
box-shadow: 
  0 8px 32px 0 rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

#### Enhanced Hover Shadows:
```css
/* Light Mode Hover */
box-shadow: 
  0 12px 40px 0 rgba(31, 38, 135, 0.2),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);

/* Dark Mode Hover */
box-shadow: 
  0 12px 40px 0 rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.15);
```

### 4. **Border System**

#### Light Mode:
- **Standard**: `1px solid rgba(255, 255, 255, 0.2)`
- **Hover**: `1px solid rgba(255, 255, 255, 0.3)`

#### Dark Mode:
- **Standard**: `1px solid rgba(255, 255, 255, 0.1)`
- **Hover**: `1px solid rgba(255, 255, 255, 0.15)`

## Component-Specific Implementation

### Header (Navigation)
```css
/* Enhanced backdrop blur for navigation clarity */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

/* Stronger gradient for navigation prominence */
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.8) 0%,
  rgba(var(--color-primary-rgb), 0.02) 50%,
  rgba(var(--color-highlight-rgb), 0.01) 100%
);
```

### Page Header
```css
/* Radial gradient for enhanced visual hierarchy */
background: radial-gradient(
  circle at 20% 20%,
  rgba(var(--color-primary-rgb), 0.06) 0%,
  rgba(var(--color-accent-rgb), 0.02) 35%,
  var(--color-surface) 65%,
  var(--color-background) 100%
);
```

### Content Body
```css
/* Standard glassmorphism with subtle overlay */
background: linear-gradient(
  135deg,
  rgba(var(--color-primary-rgb), 0.03) 0%,
  rgba(var(--color-highlight-rgb), 0.02) 50%,
  rgba(var(--color-accent-rgb), 0.01) 100%
);
backdrop-filter: blur(10px);
```

### Sidebar
```css
/* Consistent with content body but slightly more prominent */
background: linear-gradient(
  135deg,
  rgba(var(--color-primary-rgb), 0.03) 0%,
  rgba(var(--color-highlight-rgb), 0.02) 50%,
  rgba(var(--color-accent-rgb), 0.01) 100%
);
backdrop-filter: blur(10px);
```

### Footer
```css
/* Enhanced glassmorphism with saturation */
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
```

## Hover Effects System

### Standard Hover Enhancement:
```css
.component:hover {
  transform: var(--transform-lift-sm); /* translateY(-2px) */
  /* Enhanced gradient opacity */
  background: linear-gradient(/* stronger opacity values */);
  /* Enhanced shadow */
  box-shadow: /* stronger shadow values */;
}
```

### Transform Values:
- **`--transform-lift-sm`**: `translateY(-2px)` - Subtle lift for cards
- **`--transform-lift-md`**: `translateY(-4px)` - Medium lift for interactive elements
- **`--transform-lift-lg`**: `translateY(-6px)` - Strong lift for primary actions

## Transition System

### Standard Transitions:
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Fast Transitions (for small elements):
```css
transition: all 0.2s ease;
```

### Slow Transitions (for complex animations):
```css
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

## Accessibility Considerations

### Reduced Motion Support:
```css
@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none;
  }
  
  .component:hover {
    transform: none;
  }
}
```

### High Contrast Mode:
```css
@media (prefers-contrast: high) {
  .component {
    border-width: 2px;
  }
}
```

## Browser Fallbacks

### Backdrop Filter Fallback:
```css
@supports not (backdrop-filter: blur(10px)) {
  .glass-component {
    background: rgba(255, 255, 255, 0.9);
  }
  
  :global(html.dark) .glass-component {
    background: rgba(0, 0, 0, 0.8);
  }
}
```

## Usage Guidelines

### ✅ Do:
- Use consistent blur values as specified
- Follow the gradient pattern structure
- Apply proper dark mode adaptations
- Include hover effects for interactive elements
- Use semantic CSS variables for colors
- Include proper fallbacks for older browsers

### ❌ Don't:
- Mix different blur values randomly
- Use solid backgrounds where glassmorphism is expected
- Ignore dark mode implementations
- Skip accessibility considerations
- Override the established shadow system
- Use inconsistent border styles

## Color Variables Reference

### Primary Colors (RGB format for alpha):
- `--color-primary-rgb`
- `--color-highlight-rgb` 
- `--color-accent-rgb`

### Surface Colors:
- `--color-surface`
- `--color-background`
- `--color-dark-surface-rgb` (for dark mode)

### Opacity Variables:
- `--opacity-low`: 0.1
- `--opacity-medium`: 0.3
- `--opacity-medium-high`: 0.5
- `--opacity-high`: 0.8

## Implementation Checklist

When implementing glassmorphism on new components:

- [ ] Applied consistent backdrop-filter blur value
- [ ] Used standard gradient pattern
- [ ] Implemented proper light/dark mode variations
- [ ] Added hover effects with enhanced opacity
- [ ] Included consistent box-shadow system
- [ ] Applied standard border styling
- [ ] Added smooth transitions
- [ ] Included accessibility considerations
- [ ] Tested browser fallbacks
- [ ] Verified mobile responsiveness

This design system ensures visual consistency across all components while maintaining excellent usability and accessibility standards. 