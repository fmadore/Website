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
- Colors
- Spacing
- Typography
- Border radius
- Box shadows

Example usage:
```css
.example {
  color: var(--color-primary);
  margin-bottom: var(--spacing-4);
}
```

### Typography (`base/typography.css`)

Defines styles for:
- Base font settings
- Headings (h1-h6)
- Paragraphs
- Links
- Lists
- Inline text elements (strong, em, code)
- Typography utility classes

### Reset (`base/reset.css`)

Provides consistent styling across browsers by:
- Setting box-sizing to border-box
- Removing default margins and paddings
- Setting core body defaults
- Normalizing image display
- Improving form element styling

## Layout Components

Layout styles define the structural elements of the site.

### Container (`layout/container.css`)

Provides responsive container classes for controlling layout width:
- `.container`: Responsive container with max-widths at different breakpoints
- `.container-fluid`: Full-width container
- `.section`: Content section with vertical padding

### Grid (`layout/grid.css`)

Implements a flexible grid system:
- `.grid`: Base grid container
- `.grid-cols-*`: Grid column templates
- Responsive variants for different breakpoints
- Gap utilities
- Column span classes

### Header (`layout/header.css`)

Styles for the site header:
- Header container
- Logo
- Navigation
- Dropdown menus
- Responsive adaptations

### Footer (`layout/footer.css`)

Styles for the site footer:
- Footer container
- Social links
- Footer text
- Footer navigation
- Footer gradients and decorative elements

## UI Components

Reusable components that can be used across the site.

### Buttons (`components/buttons.css`)

Button styles and variations:
- `.btn`: Base button style
- `.btn-primary`, `.btn-secondary`: Button color variations
- `.btn-outline-primary`, `.btn-outline-secondary`: Outline button variations
- `.btn-sm`, `.btn-lg`: Size variations
- `.btn-block`: Full-width button
- `.btn-icon`: Button with icon
- Disabled button states

### Cards (`components/cards.css`)

Card component styles:
- `.card`: Base card container
- `.card-image`: Card image
- `.card-body`: Card content container
- `.card-title`, `.card-subtitle`: Card headings
- `.card-text`: Card content
- `.card-footer`: Card footer
- `.card-horizontal`: Horizontal card layout
- `.card-link`: Linked card with visual indicator
- Card variations and modifiers (compact, bordered, etc.)

### Navigation (`components/navigation.css`)

Navigation components:
- `.main-nav`: Main navigation container
- `.nav-list`, `.nav-item`, `.nav-link`: Navigation elements
- `.nav-link.active`: Active navigation state
- `.dropdown-trigger`, `.dropdown-icon`: Dropdown navigation
- `.dropdown-menu`, `.dropdown-item`: Dropdown contents
- Responsive navigation
- Mobile navigation toggle

### Dropdown (`components/dropdown.css`)

Dropdown menus:
- `.dropdown`: Dropdown container
- `.dropdown-toggle`, `.dropdown-toggle-icon`: Dropdown trigger
- `.dropdown-menu`: Dropdown content
- `.dropdown-item`: Dropdown links
- `.dropdown-divider`: Divider between items
- `.dropdown-menu-right`, `.dropdown-menu-center`: Dropdown positions
- `.dropdown-menu-sm`, `.dropdown-menu-lg`: Size variations
- `.dropdown-menu-animate`: Animations and transitions
- `.dropdown-item-with-icon`: Icon support for menu items

### Activity List (`components/activity-list.css`)

Activity and timeline components:
- `.activity-list`: List container
- `.activity-item`: Individual activity items
- `.activity-title`, `.activity-date`: Activity metadata
- `.activity-link`, `.activity-summary`: Content elements
- `.activity-filters`, `.filter-tag`: Filtering controls 
- `.year-tag`, `.year-count`: Year-based filtering
- `.see-more`: "View more" link styling

## Page-Specific Styles

Styles that are specific to individual pages.

### Home (`pages/home.css`)

Styles specific to the homepage:
- `.home-intro`: Introduction section
- `.activity-section`: Recent activities
- `.activity-section-title`: Section headers
- `.year-filters`: Year filter buttons
- `.profile-section`: Profile display
- `.profile-header`, `.profile-photo`: Profile components
- `.profile-content`, `.main-content-card`: Content containers
- `.sidebar-card`: Sidebar styles
- `.enhanced-header`: Enhanced header style with gradients
- Dark mode overrides for homepage components

### Research (`pages/research.css`)

Styles for research pages:
- `.research-project`: Research project container
- `.project-header`, `.project-title`: Project headers
- `.project-image`, `.project-content`: Project visuals and content
- `.project-method-cards`: Research methods display
- `.method-card`, `.method-title`: Method card components
- `.research-grid`: Grid of research projects
- `.project-card`, `.project-card-image`: Project card components

### Publications (`pages/publications.css`)

Styles for publication listings:
- `.publication-list`: Publication list container
- `.publication-title a`: Publication title links
- `.filter-button`, `.filter-button.active`: Publication filter controls
- `.citation-button`, `.citation-box`: Citation display controls

### Contact (`pages/contact.css`)

Styles for the contact page:
- `.contact-section`: Contact section container
- `.contact-info`: Contact information
- `.contact-address`: Contact address formatting
- `.social-links-grid`: Social media links grid
- `.social-link-card`: Social link cards
- `.contact-form`, `.form-group`: Contact form elements
- Form input and textarea styles

## Utilities

Utility classes for common styling needs.

### Spacing (`utilities/spacing.css`)

Spacing utility classes:
- Margin utilities (`.m-*`, `.mx-*`, `.my-*`, `.mt-*`, `.mb-*`, `.mr-*`, `.ml-*`)
- Padding utilities (`.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.pb-*`, `.pl-*`, `.pr-*`)
- Gap utilities for flex/grid (`.gap-*`, `.gap-x-*`, `.gap-y-*`)
- Space between children (`.space-x-*`, `.space-y-*`)
- All utilities use the spacing variables

### Colors (`utilities/colors.css`)

Color utility classes:
- Text colors (`.text-primary`, `.text-secondary`, `.text-accent`, `.text-highlight`, `.text-success`, `.text-default`, `.text-light`, `.text-white`, `.text-black`)
- Background colors (`.bg-primary`, `.bg-secondary`, `.bg-accent`, `.bg-highlight`, `.bg-success`, `.bg-default`, `.bg-white`, `.bg-black`, `.bg-transparent`)
- Border colors (`.border-primary`, `.border-secondary`, `.border-accent`, `.border-highlight`, `.border-success`, `.border-default`, `.border-white`, `.border-black`, `.border-transparent`)
- Hover/focus variants for text, background, and border

### Typography (`utilities/typography.css`)

Typography utility classes:
- Font families (`.font-sans`, `.font-serif`, `.font-mono`)
- Font sizes (`.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`, `.text-2xl`, `.text-3xl`, `.text-4xl`)
- Font weights (`.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`)
- Text alignment (`.text-left`, `.text-center`, `.text-right`, `.text-justify`)
- Line height, letter spacing, text transform, text decoration
- Truncation, whitespace, and list utilities
- Prose class for long-form content

### Flex (`utilities/flex.css`)

Flexbox utility classes:
- Flex container (`.flex`, `.inline-flex`)
- Flex direction (`.flex-row`, `.flex-col`, etc.)
- Flex wrap, grow, shrink, and shorthand (`.flex-wrap`, `.flex-1`, etc.)
- Justify/align content and items (`.justify-center`, `.items-center`, etc.)
- Order and self-alignment utilities
- Responsive variants for all major flex utilities

### Layout (`utilities/layout.css`)

- `.sveltekit-body-container`: Utility for SvelteKit body container

### Class Naming Convention

The CSS follows a component-based naming convention:
- Component: `.component-name`
- Element: `.component-name-element`
- Modifier: `.component-name--modifier` or `.component-name-element--modifier`

### Responsive Approach

The CSS is built with a mobile-first approach:
- Base styles are for mobile devices
- Media queries are used to adapt for larger screens
- Breakpoints: 640px, 768px, 1024px, 1280px

### Best Practices

When using this CSS framework:

1. Use the existing components and utilities whenever possible.
2. Use semantic class names for complex components (e.g., `.profile-card`, `.main-content-card`).
3. Use utility classes for layout, spacing, color, and typography where appropriate.
4. Follow the established naming patterns when creating new styles.
5. Place page-specific styles in the appropriate page CSS file.
6. Use variables for colors, spacing, and other design tokens.
7. Avoid inline styles or !important declarations.
8. Document all new utilities and component classes.