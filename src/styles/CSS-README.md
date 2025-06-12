# CSS Architecture Documentation

This document outlines the CSS architecture used in this project. The CSS is organized using a modular approach with a focus on maintainability, scalability, and reusability.

## Directory Structure

The CSS is organized into the following directory structure:

```
src/
└── styles/
    ├── base/           # Base styles, resets, and variables
    ├── layout/         # Layout components and structures
    ├── components/     # Reusable UI components
    ├── pages/          # Page-specific styles
    └── utilities/      # Utility classes
```

## Main CSS Entry Point

The `src/app.css` file serves as the main entry point that imports all other CSS files. This approach allows for better organization while still maintaining a single point of entry.

## Base Styles

Base styles define the foundation of the site's design.

### Variables (`base/variables.css`)

Contains CSS custom properties (variables) for:

- **Colors**: Primary, secondary, accent, highlight, success colors with RGB variants
- **Academic-specific colors**: Citation, quote, note colors
- **Surface colors**: Background variations, surface colors for light/dark themes
- **Spacing**: Comprehensive spacing scale from 1-32 units
- **Typography**: Font families (sans, serif, mono), font sizes, line heights, letter spacing, font weights
- **Border radius**: From small to full radius options
- **Box shadows**: Multiple shadow levels for depth
- **Opacity and transform values**: For consistent animations
- **Dark theme overrides**: Complete dark mode color palette

Example usage:

```css
.example {
	color: var(--color-primary);
	margin-bottom: var(--spacing-4);
	background-color: rgba(var(--color-primary-rgb), 0.1);
}
```

### Typography (`base/typography.css`)

Comprehensive typography system including:

- **Base font settings**: Modern font features, antialiasing
- **Headings (h1-h6)**: Serif font family with proper hierarchy
- **Paragraphs and links**: Default styling with hover states
- **Lists**: Styled ordered and unordered lists
- **Inline elements**: Strong, em, code, small text
- **Blockquotes**: Enhanced styling with background and borders
- **Academic elements**: Citations, footnotes, abstracts, keywords
- **Code blocks**: Enhanced pre and code styling
- **Tables**: Responsive table styling
- **Print optimizations**: Print-friendly styles
- **Responsive typography utilities**: Font sizes, weights, alignment, line height, letter spacing
- **Prose class**: Long-form content styling

### Reset (`base/reset.css`)

Provides consistent styling across browsers by:

- Setting box-sizing to border-box for all elements
- Removing default margins and paddings
- Setting core body defaults with smooth scrolling
- Normalizing image display
- Improving form element styling
- Respecting reduced motion preferences

## Layout Components

Layout styles define the structural elements of the site.

### Container (`layout/container.css`)

Provides responsive container classes:

- `.container`: Responsive container with max-widths at breakpoints (640px, 768px, 1024px, 1280px)
- `.container-fluid`: Full-width container
- `.section`: Content section with vertical padding
- `.section-sm`, `.section-lg`: Size variations

### Grid (`layout/grid.css`)

Comprehensive grid system:

- `.grid`: Base grid container
- `.grid-cols-*`: Grid column templates (1-12 columns)
- **Responsive variants**: `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Column spans**: `.col-span-*` classes
- **Grid rows**: Row template classes
- **Auto flow**: Row and column flow control
- **Content grid**: Specialized grid for content cards

## UI Components

Reusable components that can be used across the site.

### Buttons (`components/buttons.css`)

Comprehensive button system:

- `.btn`: Base button with modern styling and transitions
- **Color variants**: `.btn-primary`, `.btn-secondary`
- **Outline variants**: `.btn-outline-primary`, `.btn-outline-secondary`
- **Glass variants**: `.btn-glass`, `.btn-glass-primary` with glassmorphism effects
- **Size variants**: `.btn-sm`, `.btn-lg`
- **Layout variants**: `.btn-block`, `.btn-icon`
- **States**: Hover, focus, active, disabled
- **Custom controls**: `.control-button-rounded` with specific styling
- **Dark mode support**: Automatic adaptations for all button variants

### Cards (`components/cards.css`)

Flexible card component system with glassmorphism effects:

- `.card`: Base card with glassmorphism styling, backdrop blur, and hover effects
- **Card elements**: `.card-image`, `.card-body`, `.card-title`, `.card-subtitle`, `.card-text`, `.card-footer`
- **Variations**: `.card-compact`, `.card-bordered`, `.card-shadow`, `.card-shadow-lg`
- **Layouts**: `.card-horizontal` with responsive behavior
- **Visual indicators**: `.card-link` with animated arrows
- **Grid system**: `.card-grid` with responsive columns
- **Background variants**: Color-themed cards
- **Border variants**: Colored borders
- **Glass effects**: Automatic glassmorphism with backdrop blur and transparency
- **Dark mode support**: Seamless dark theme adaptations

### ContentBody Component

The `ContentBody` component (`src/lib/components/common/ContentBody.svelte`) is a reusable container for main content areas that provides:

- **Glassmorphism effects**: Consistent glass effects using the glassmorphism utilities
- **Typography styling**: Comprehensive text styling with CSS variables
- **Responsive design**: Mobile-first approach with proper scaling
- **Dark mode support**: Automatic theme adaptation
- **Multiple variants**: Default, compact, and wide options
- **Flexible glass effects**: Support for all glassmorphism utility classes

The component centralizes content styling that was previously scattered across individual pages, ensuring consistency and maintainability.

### Navigation Components

Navigation is now implemented using component-scoped styles in individual Svelte components:

- **Header.svelte**: Site header with glassmorphism effects, logo, and desktop controls
- **DesktopNav.svelte**: Desktop navigation with responsive behavior
- **NavLink.svelte**: Individual navigation links with hover effects and accessibility
- **NavItemWithDropdown.svelte**: Navigation items with dropdown functionality
- **DropdownMenu.svelte**: Dropdown menus with glassmorphism and animations
- **HamburgerButton.svelte**: Mobile menu toggle with smooth animations
- **MobileMenu.svelte**: Full-screen mobile navigation with staggered animations
- **ThemeToggle.svelte**: Theme switching component

### Navigation Utilities (`components/navigation-utilities.css`)

Shared utilities used across navigation components:

- **Accessibility**: `.sr-only` for screen readers, focus-visible styles
- **Reduced motion**: Respects user motion preferences
- **High contrast**: Enhanced visibility for accessibility

### Panels (`components/panels.css`)

Reusable panel components for content organization:

- `.panel`: Base panel with surface styling
- **Panel structure**: `.panel-header`, `.panel-content`, `.panel-footer`
- **Content elements**: `.no-items`, `.item-list`, `.view-all-link`
- **Filter systems**: `.year-filters`, `.filter-button`, `.type-filters-section`
- **Variants**: Activities panel, items panel
- **Dark mode support**: Complete dark theme overrides

### Activity List (`components/activity-list.css`)

Specialized component for activity timelines:

- `.activity-list`: Timeline-style list
- `.activity-item`: Individual activity with border accent
- **Activity elements**: `.activity-title`, `.activity-date`, `.activity-summary`
- **Filters**: `.activity-filters`, `.filter-tag`, `.year-tag`
- **Interactive elements**: Hover effects, active states

### Skill Tags (`components/skill-tags.css`)

Component for displaying skill/technology tags:

- `.project-skills-container`: Container for skill lists
- `.skills-list`: Flexible skill tag layout
- `.project-skill-tag`: Individual skill tags with hover effects

## Page-Specific Styles

Styles that are specific to individual pages.

### Research (`pages/research.css`)

Styles for research project pages:

- `.research-project`: Project container
- **Project elements**: `.project-header`, `.project-title`, `.project-meta`, `.project-image`
- **Content sections**: `.project-content`, `.project-section`, `.project-section-title`
- **Method cards**: `.project-method-cards`, `.method-card`, `.method-title`
- **Project grid**: `.research-grid`, `.project-card` with responsive layout

### Publications (`pages/publications.css`)

Styles for publication listings:

- `.publication-list`: Publication container
- **Publication elements**: `.publication-title`, `.publication-meta`
- **Filters**: `.publication-filters`, `.filter-button` with active states
- **Citations**: `.citation-button`, `.citation-box` with monospace font

## Utilities

Comprehensive utility class system for rapid development.

### Spacing (`utilities/spacing.css`)

Extensive spacing utility system:

- **Margin utilities**: `.m-*`, `.mx-*`, `.my-*`, `.mt-*`, `.mb-*`, `.mr-*`, `.ml-*`
- **Padding utilities**: `.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.pb-*`, `.pl-*`, `.pr-*`
- **Gap utilities**: `.gap-*`, `.gap-x-*`, `.gap-y-*`
- **Space between**: `.space-x-*`, `.space-y-*`
- **Responsive variants**: All utilities available with `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Scale**: 0, 1, 2, 3, 4, 6, 8, 10, 12, 16 spacing units

### Colors (`utilities/colors.css`)

Comprehensive color utility system:

- **Text colors**: `.text-primary`, `.text-secondary`, `.text-accent`, `.text-highlight`, `.text-success`, `.text-default`, `.text-light`, `.text-white`, `.text-black`, `.text-muted`
- **Background colors**: `.bg-*` variants including opacity variants (`.bg-primary-10`, `.bg-primary-20`, etc.)
- **Border colors**: `.border-*` variants
- **Border styles**: `.border`, `.border-0`, `.border-2`, `.border-4`, directional borders
- **Interactive states**: Hover and focus variants
- **Responsive variants**: All color utilities available at all breakpoints

### Flexbox (`utilities/flex.css`)

Complete flexbox utility system:

- **Flex containers**: `.flex`, `.inline-flex`
- **Direction**: `.flex-row`, `.flex-col`, `.flex-row-reverse`, `.flex-col-reverse`
- **Wrap**: `.flex-wrap`, `.flex-nowrap`, `.flex-wrap-reverse`
- **Grow/Shrink**: `.flex-grow`, `.flex-shrink`, `.flex-1`, `.flex-auto`, `.flex-initial`, `.flex-none`
- **Justify content**: `.justify-start`, `.justify-end`, `.justify-center`, `.justify-between`, `.justify-around`, `.justify-evenly`
- **Align items**: `.items-start`, `.items-end`, `.items-center`, `.items-baseline`, `.items-stretch`
- **Align content**: `.content-*` variants
- **Align self**: `.self-*` variants
- **Order**: `.order-*` utilities
- **Responsive variants**: Available at all breakpoints

### Layout (`utilities/layout.css`)

Display and overflow utilities:

- **Display**: `.block`, `.inline-block`, `.inline`, `.inline-grid`, `.hidden`
- **Overflow**: `.overflow-auto`, `.overflow-hidden`, `.overflow-visible`, `.overflow-scroll`
- **Directional overflow**: `.overflow-x-*`, `.overflow-y-*`
- **SvelteKit integration**: `.sveltekit-body-container`
- **Responsive variants**: All utilities available at all breakpoints

### Sizing (`utilities/sizing.css`)

Width, height, and max-width utilities:

- **Width**: `.w-auto`, `.w-full`, `.w-screen`
- **Height**: `.h-auto`, `.h-full`, `.h-screen`
- **Max width**: `.max-w-none`, `.max-w-xs` through `.max-w-7xl`, `.max-w-full`, `.max-w-prose`
- **Responsive variants**: All sizing utilities available at all breakpoints

### Border Radius (`utilities/border-radius.css`)

Comprehensive border radius utilities:

- **All sides**: `.rounded-none`, `.rounded-sm`, `.rounded`, `.rounded-md`, `.rounded-lg`, `.rounded-xl`, `.rounded-2xl`, `.rounded-full`
- **Directional**: `.rounded-t-*`, `.rounded-r-*`, `.rounded-b-*`, `.rounded-l-*`
- **Responsive variants**: Available at all breakpoints

### Shadows (`utilities/shadows.css`)

Box shadow utilities:

- **Shadow levels**: `.shadow-sm`, `.shadow`, `.shadow-md`, `.shadow-lg`, `.shadow-none`
- **Interactive states**: `.hover:shadow-*` variants
- **Responsive variants**: Available at all breakpoints

### Transforms (`utilities/transforms.css`)

Transform utilities for animations and effects:

- **Scale**: `.scale-*` from 0 to 150
- **Translate**: `.translate-x-*`, `.translate-y-*` with positive and negative values
- **Rotate**: `.rotate-*` with positive and negative values
- **Skew**: `.skew-x-*`, `.skew-y-*` with positive and negative values
- **Transform origin**: `.origin-*` for transform origins
- **Interactive states**: `.hover:*` and `.focus:*` variants
- **Responsive variants**: Available at all breakpoints

### Transitions (`utilities/transitions.css`)

Transition and animation utilities:

- **Transition types**: `.transition`, `.transition-colors`, `.transition-opacity`, `.transition-shadow`, `.transition-transform`
- **Duration**: `.duration-75` through `.duration-500`
- **Easing**: `.ease-linear`, `.ease-in`, `.ease-out`, `.ease-in-out`
- **Responsive variants**: Available at all breakpoints

### Images (`utilities/images.css`)

Image handling utilities:

- **Responsive images**: `.responsive-image`
- **Aspect ratios**: `.aspect-square`, `.aspect-video`, `.aspect-photo`, `.aspect-card`, `.aspect-book`
- **Object fit**: `.object-cover`, `.object-contain`, `.object-fill`
- **Image containers**: `.image-container` with hover effects
- **Loading states**: `.image-loading` with skeleton animation
- **Specific components**: `.publication-cover`, `.hero-image`, `.card-image-content`

### Glassmorphism (`utilities/glassmorphism.css`)

Modern glass effect utilities for creating frosted glass UI elements:

- **Base glass effects**: `.glass`, `.glass-light`, `.glass-medium`, `.glass-heavy`
- **Colored glass**: `.glass-primary`, `.glass-accent`, `.glass-highlight`, `.glass-success`
- **Blur levels**: `.glass-blur-sm`, `.glass-blur-md`, `.glass-blur-lg`, `.glass-blur-xl`, `.glass-blur-2xl`
- **Component-specific**: `.glass-card`, `.glass-panel`, `.glass-nav`, `.glass-button`
- **Special effects**: `.glass-frosted` with enhanced saturation
- **Animations**: `.glass-animate`, `.glass-animate-fast`, `.glass-animate-slow`
- **Dark mode support**: Automatic dark theme adaptations
- **Browser fallbacks**: Graceful degradation for unsupported browsers
- **Responsive variants**: Available at all breakpoints

## Class Naming Convention

The CSS follows a component-based naming convention:

- **Component**: `.component-name`
- **Element**: `.component-name-element`
- **Modifier**: `.component-name--modifier` or `.component-name-element--modifier`
- **Utility**: `.utility-value` (e.g., `.text-center`, `.p-4`)
- **Responsive**: `.breakpoint:utility-value` (e.g., `.md:text-lg`, `.lg:p-8`)

## Responsive Approach

The CSS is built with a mobile-first approach:

- **Base styles**: Designed for mobile devices
- **Breakpoints**: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- **Progressive enhancement**: Media queries adapt for larger screens
- **Utility responsiveness**: Most utilities available at all breakpoints

## Best Practices

When using this CSS framework:

1. **Use existing components and utilities** whenever possible
2. **Follow the established naming patterns** when creating new styles
3. **Use semantic class names** for complex components
4. **Leverage utility classes** for layout, spacing, color, and typography
5. **Place page-specific styles** in the appropriate page CSS file
6. **Use CSS variables** for colors, spacing, and other design tokens
7. **Avoid inline styles** or `!important` declarations
8. **Test responsive behavior** across all breakpoints
9. **Consider dark mode** when adding new styles
10. **Document new utilities** and component classes

## Performance Considerations

- **Modular imports**: CSS is split into logical modules for better caching
- **Utility-first approach**: Reduces CSS bloat through reusable classes
- **CSS variables**: Enable efficient theming and customization
- **Modern features**: Uses modern CSS features for better performance
- **Print optimization**: Includes print-specific styles where needed
