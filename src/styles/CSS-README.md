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

### Cards (`components/cards.css`)

Card component styles:
- `.card`: Base card container
- `.card-image`: Card image
- `.card-body`: Card content container
- `.card-title`, `.card-subtitle`: Card headings
- `.card-text`: Card content
- `.card-footer`: Card footer
- Card variations and modifiers

### Navigation (`components/navigation.css`)

Navigation components:
- `.main-nav`: Main navigation container
- `.nav-list`, `.nav-item`, `.nav-link`: Navigation elements
- Responsive navigation
- Mobile navigation toggle

### Dropdown (`components/dropdown.css`)

Dropdown menus:
- `.dropdown`: Dropdown container
- `.dropdown-toggle`: Dropdown trigger
- `.dropdown-menu`: Dropdown content
- `.dropdown-item`: Dropdown links
- Dropdown positions and variations

### Activity List (`components/activity-list.css`)

Activity and timeline components:
- `.activity-list`: List container
- `.activity-item`: Individual activity items
- `.activity-title`, `.activity-date`: Activity metadata
- Activity filters
- Year tags

## Page-Specific Styles

Styles that are specific to individual pages.

### Home (`pages/home.css`)

Styles specific to the homepage:
- `.home-intro`: Introduction section
- `.activity-section`: Recent activities
- `.year-filters`: Year filter buttons
- `.profile-section`: Profile display

### Research (`pages/research.css`)

Styles for research pages:
- `.research-project`: Research project container
- `.project-header`, `.project-title`: Project headers
- `.project-method-cards`: Research methods display
- `.research-grid`: Grid of research projects

### Publications (`pages/publications.css`)

Styles for publication listings:
- `.publications-section`: Publication section
- `.publication-list`, `.publication-item`: Publication lists
- `.publication-title`, `.publication-meta`: Publication metadata
- Publication filters
- Citation display

### Contact (`pages/contact.css`)

Styles for the contact page:
- `.contact-section`: Contact section
- `.contact-info`: Contact information
- `.social-links-grid`: Social media links
- Contact form elements

## Utilities

Utility classes for common styling needs.

### Spacing (`utilities/spacing.css`)

Spacing utility classes:
- Margin utilities (`.m-*`, `.mx-*`, `.my-*`, `.mt-*`, `.mb-*`)
- Padding utilities (`.p-*`, `.px-*`, `.py-*`)
- All utilities use the spacing variables

### Colors (`utilities/colors.css`)

Color utility classes:
- Text colors (`.text-*`)
- Background colors (`.bg-*`)
- Border colors (`.border-*`)
- Hover state colors (`.hover\:*`)

## Using This CSS Framework

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

1. Use the existing components and utilities whenever possible
2. Follow the established naming patterns when creating new styles
3. Place page-specific styles in the appropriate page CSS file
4. Use variables for colors, spacing, and other design tokens
5. Avoid inline styles or !important declarations

### Integration with Tailwind

This CSS framework can coexist with Tailwind CSS:
- Tailwind is imported in the main app.css
- The typography plugin enhances long-form content
- Custom classes complement Tailwind's utility-first approach 