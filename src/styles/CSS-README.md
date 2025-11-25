# CSS Architecture Documentation

This document outlines the CSS architecture used in this project. The CSS is organized using a modular approach with a focus on maintainability, scalability, and reusability.

## Directory Structure

The CSS is organized into the following directory structure:

```
src/
├── app.css            # Main entry point that stitches the modules together
└── styles/
    ├── base/          # Base styles, resets, and variables
    ├── components/    # Reusable UI components
    ├── layout/        # Layout components and structures
    └── utilities/     # Utility classes
```

## Main CSS Entry Point

The `src/app.css` file serves as the main entry point that imports all other CSS files. Imports are grouped so that design tokens load first, followed by layout scaffolding, component collections, and finally the utility layer. This guarantees that variables and mixins are available before anything depends on them and keeps bundle composition predictable when the project is prerendered.

- **Import order**: Base → Layout → Components → Utilities (mirrors the block comments inside `app.css`).
- **Adding new modules**: Place new files under the appropriate directory, then add a matching `@import` in the same section to preserve the layering above.
- **Component overrides**: Prefer Svelte component-scoped styles for one-off tweaks; reach for global imports only when multiple pages need the change.

## Extending the CSS System

When you need to introduce new styling primitives, follow this workflow to stay aligned with the design system:

1. **Check existing layers first**: Reuse utilities or component classes whenever possible. Most spacing, color, typography, and interaction patterns already exist.
2. **Scope deliberately**:
    - Component-specific visuals belong in the Svelte file's `<style>` block.
    - Shared UI patterns live under `styles/components/` with descriptive, atomic names.
    - System-wide helpers go into the utility folder alongside peers (e.g., `utilities/flex.css`).
3. **Lean on design tokens**: Reference values from `base/variables.css` instead of hard-coded numbers or hex values. This keeps light/dark themes and glassmorphism effects consistent.
4. **Respect motion and accessibility**: Mirror the patterns in `reset.css` and `animations.css` by honoring `prefers-reduced-motion`, `prefers-contrast`, and focus-visible treatments.
5. **Document the change**: Update this README (or the component docs in `docs/components/`) so future contributors know the intent behind the new styles.

## Base Styles

Base styles define the foundation of the site's design.

### Variables (`base/variables.css`)

**Design System v2.0** - A comprehensive design token system with foundation → semantic layering.

#### Token Architecture

1. **Foundation Tokens** (`--sys-*`): Raw values that rarely change
2. **Semantic Tokens** (`--color-*`, `--space-*`, etc.): Meaningful names for usage context
3. **Legacy Aliases** (`--spacing-*`): Backward-compatible mappings

#### Color System

- **Primary**: Academic blue (`#1d4ed8`) with `-dark`, `-light`, `-lighter` variants
- **Secondary**: Neutral slate for supporting elements
- **Accent**: Teal (`#14b8a6`) for highlights and badges
- **Highlight**: Amber (`#f59e0b`) for attention/importance
- **Success**: Emerald (`#10b981`) for positive states
- **Danger**: Red (`#dc2626`) for errors and destructive actions
- **All colors include RGB variants** for use with `rgba()`

#### Spacing System (8-point grid)

- **Semantic scale**: `--space-2xs` through `--space-7xl`
- **Numeric scale**: `--space-0` through `--space-64`
- **Tight variants**: `--space-md-tight` (14px), `--space-xl-tight` (28px) for in-between values
- **Legacy aliases**: `--spacing-*` map to `--space-*` for compatibility

#### Typography Scale (Minor Third 1.2 ratio)

- **Fluid sizing**: Uses `clamp()` for responsive scaling
- **Font sizes**: `--font-size-xs` through `--font-size-5xl`
- **Contextual sizes**: `--font-size-heading-1` through `--font-size-heading-6`
- **Line heights**: `--line-height-tight` through `--line-height-loose`

#### Shadows (Multi-layer system)

- **Depth levels**: `--shadow-xs` through `--shadow-2xl`
- **Colored shadows**: `--shadow-primary`, `--shadow-accent`, etc.
- **Glass shadows**: `--shadow-glass`, `--shadow-glass-lg`

#### Animation & Transitions

- **Duration scale**: `--duration-instant` (75ms) through `--duration-slower` (700ms)
- **Easing functions**: `--ease-in`, `--ease-out`, `--ease-bounce`, `--ease-spring`
- **Legacy mappings**: `--anim-duration-*` and `--anim-ease-*`

Example usage:

```css
.example {
	color: var(--color-primary);
	margin-bottom: var(--space-md); /* or --spacing-4 */
	background-color: rgba(var(--color-primary-rgb), 0.1);
	box-shadow: var(--shadow-md);
	transition: all var(--duration-normal) var(--ease-out);
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

Modern, comprehensive button system with enhanced accessibility and user experience:

- **Base button**: `.btn` with modern styling, flexbox layout, and smooth transitions
- **Color variants**:
  - `.btn-primary`: Academic blue with gradient
  - `.btn-secondary`: Neutral with subtle background
  - `.btn-ghost`: Minimal style for tertiary actions
  - `.btn-danger`: Red variant for destructive actions
- **Outline variants**: `.btn-outline-primary`, `.btn-outline-secondary` with transparent backgrounds
- **Glass variants**: `.btn-glass` with glassmorphism effects, can be combined with other variants
- **Size variants**: `.btn-sm`, `.btn-lg` with proportional spacing
- **Layout variants**:
  - `.btn-block`: Full width
  - `.btn-icon-only`: Square buttons for icons with proper sizing
  - `.btn-with-icon`: Automatically applied when icons are present
- **States**:
  - Hover effects with subtle lift animations
  - Focus-visible with custom outline
  - Active state with scale effect
  - Loading state with spinner (`.btn-loading`)
  - Disabled state with reduced opacity
- **Accessibility features**:
  - Proper ARIA attributes support
  - High contrast mode adjustments
  - Reduced motion support
  - Touch-friendly sizing
- **Dark mode support**: Automatic adaptations for all button variants
- **Legacy compatibility**: Maintains support for existing `.control-button-rounded` class

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

### Entity Cards (`components/entity-cards.css`)

Unified card styles for list-based entities (e.g., Publications, Communications) that align with the design philosophy and global CSS tokens.

- Purpose: Provide a consistent look-and-feel for content cards across pages without duplicating styles in components.
- Uses only global design tokens: colors, spacing, typography, border radius, shadows, and transitions.
- Glassmorphism: Works in tandem with `.glass-card` from glass utilities for subtle depth and dark-mode support.
- Responsive: Single-column on mobile; image + content grid from `md` breakpoint.
- Core classes:
  - `.entity-list-item` – list item wrapper with consistent spacing
  - `.entity-card` – glass gradient background, radius, hover lift, shadows
  - `.entity-grid` – layout for image and content columns
  - `.entity-image-container`, `.entity-cover-image` – image placement and styling (5/7 aspect)
  - `.entity-content` – vertical stack container
  - `.entity-meta`, `.entity-type`, `.entity-language` – compact metadata line
  - `.entity-title`, `.entity-title-link` – title style and hover color
  - `.entity-details`, `.entity-abstract` – body text styles
  - `.entity-tags`, `.entity-links`, `.entity-link-btn` – tag row and external links with arrow indicator

Usage notes:

- Combine `.entity-card` with `.glass-card` to inherit the global glass effects and dark mode.
- For external links in cards, prefer `entity-link-btn` alongside button utilities (e.g., `btn btn-outline-primary btn-sm`).
- Keep component-specific micro-styles local (e.g., an author or country filter button), but rely on entity classes for layout and visual system.

Adoption:

- `PublicationItem.svelte` and `CommunicationItem.svelte` are refactored to use these classes for full visual parity across pages.

### ContentBody Component

The `ContentBody` component (`src/lib/components/common/ContentBody.svelte`) is a reusable container for main content areas that provides:

- **Glassmorphism effects**: Consistent glass effects using the glassmorphism utilities
- **Typography styling**: Comprehensive text styling with CSS variables
- **Responsive design**: Mobile-first approach with proper scaling
- **Dark mode support**: Automatic theme adaptation
- **Multiple variants**: Default, compact, and wide options
- **Flexible glass effects**: Support for all glassmorphism utility classes

The component centralizes content styling that was previously scattered across individual pages, ensuring consistency and maintainability.

### PageHeader Component

The `PageHeader` component (`src/lib/components/common/PageHeader.svelte`) provides a consistent, animated header for pages with:

- **Dynamic metadata**: Supports title, date, type badges, authors, editors, and tags
- **Navigation**: Optional back link with animation
- **Visual styling**: Glassmorphism effects, title accents, and responsive typography
- **Animations**: Staggered entrance animations for all elements
- **Flexibility**: Adapts to different content types (articles, events, standard pages)

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

- `.panel`: Base panel with glassmorphism effects and subtle gradient overlays
- **Panel structure**: `.panel-header`, `.panel-content`, `.panel-footer`
- **Panel titles**: `.panel-title` with animated accent lines
- **Content elements**: `.no-items`, `.item-list`, `.view-all-container`
- **Filter systems**: `.year-filters`, `.filter-button`, `.type-filters-section`
- **Variants**: `.panel-activities`, `.panel-items` with different gradient schemes
- **Dark mode support**: Complete dark theme overrides
- **Responsive design**: Mobile-optimized spacing and typography

### Activity List (`components/activity-list.css`)

Specialized component for activity timelines:

- `.activity-list`: Timeline-style list
- `.activity-item`: Individual activity with border accent and hover effects
- **Activity elements**: `.activity-title`, `.activity-date`, `.activity-summary`
- **Filters**: `.activity-filters`, `.filter-tag`, `.year-tag`
- **Interactive elements**: Hover effects, active states
- **Year navigation**: `.year-count` for activity counts

### Skill Tags (Component-based)

Skill/technology tags are now handled through the `TagList` component which uses the `Button` component with glassmorphism effects. No dedicated CSS file is needed as styling is handled through the button system and component props.

### Animations (`components/animations.css`)

Comprehensive scroll animation system for creating smooth, engaging user experiences:

- **Base animation states**: `.animate-in`, `.animate-out` for controlling animation visibility
- **Fade animations**: `.fade-in`, `.fade-in-up`, `.fade-in-down`, `.fade-in-left`, `.fade-in-right`
- **Scale animations**: `.scale-in`, `.scale-in-center` for zoom effects
- **Slide animations**: `.slide-in-up`, `.slide-in-down`, `.slide-in-left`, `.slide-in-right`
- **Bounce animations**: `.bounce-in` for playful entrance effects
- **Stagger delays**: `.stagger-1` through `.stagger-6` for sequential list animations
- **Reading progress**: `.reading-progress` for scroll progress indicators
- **Parallax support**: `.parallax-container`, `.parallax-element` for depth effects
- **Performance optimizations**: Uses `will-change` and `transform` for smooth animations
- **Accessibility**: Respects `prefers-reduced-motion` for users who prefer minimal animation
- **Mobile optimizations**: Reduced transform distances and faster animations on mobile
- **Responsive**: All animations work across all device sizes

The animation system integrates with JavaScript utilities (`src/lib/utils/scrollAnimations.ts`) to provide:

- Intersection Observer-based scroll triggers
- Svelte actions for easy component integration
- Staggered animations for lists
- Smooth scrolling navigation
- Parallax effects
- Reading progress indicators

## Page-Specific Styles

**Note**: There is intentionally no `styles/pages/` directory anymore. Page-level design lives alongside its Svelte component so the styles ship only where they are used. Shared presentation (e.g., publications and communications) is centralized in `components/entity-cards.css`, while components keep only minimal, truly unique tweaks such as advisor badges or filter button placement.

## Utilities

Comprehensive utility class system for rapid development.

### Spacing (`utilities/spacing.css`)

Essential spacing utility system using the 8-point grid:

- **Margin utilities**: `.m-*`, `.mx-*`, `.my-*`, `.mt-*`, `.mb-*`, `.mr-*`, `.ml-*`
- **Padding utilities**: `.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.pb-*`
- **Gap utilities**: `.gap-*`, `.gap-x-*`, `.gap-y-*`
- **Space between**: `.space-y-*` for consistent vertical spacing
- **Responsive variants**: Essential utilities available with `sm:`, `md:`, `lg:` prefixes
- **Token mapping**: Utilities use semantic tokens (`--space-md`, `--space-lg`) for consistency
- **Scale**: Common values (0, 1, 2, 3, 4, 6, 8, 12) mapped to semantic names

### Colors (`utilities/colors.css`)

Comprehensive color utility system:

- **Text colors**: `.text-primary`, `.text-secondary`, `.text-accent`, `.text-highlight`, `.text-success`, `.text-danger`, `.text-default`, `.text-light`, `.text-white`, `.text-black`, `.text-muted`, `.text-emphasis`
- **Background colors**: `.bg-*` variants including `.bg-surface`, `.bg-surface-alt`, `.bg-danger`, and opacity variants (`.bg-primary-10`, `.bg-primary-20`, etc.)
- **Border colors**: `.border-*` variants including `.border-danger` with comprehensive color options
- **Border styles**: `.border`, `.border-0`, `.border-2`, `.border-4`, directional borders
- **Interactive states**: Hover and focus variants for all color utilities
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

- **Shadow levels**: `.shadow-xs`, `.shadow-sm`, `.shadow`, `.shadow-md`, `.shadow-lg`, `.shadow-xl`, `.shadow-none`
- **Interactive states**: `.hover:shadow-*` variants
- **Responsive variants**: Available at all breakpoints

Note: The design system also includes colored shadows (`--shadow-primary`, `--shadow-accent`) and glass shadows (`--shadow-glass`) defined in variables.css.

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

- **Transition types**: `.transition`, `.transition-colors`, `.transition-opacity`, `.transition-shadow`, `.transition-transform`, `.transition-none`
- **Duration**: `.duration-75` through `.duration-500`
- **Easing**: `.ease-linear`, `.ease-in`, `.ease-out`, `.ease-in-out`
- **Responsive variants**: Available at all breakpoints

### Images (`utilities/images.css`)

Image handling utilities for better performance and responsiveness:

- **Responsive images**: `.responsive-image`
- **Aspect ratios**: `.aspect-square`, `.aspect-video`, `.aspect-photo`, `.aspect-card`, `.aspect-book`
- **Object fit**: `.object-cover`, `.object-contain`, `.object-fill`
- **Image containers**: `.image-container` with hover effects
- **Loading states**: `.image-loading` with skeleton animation
- **Specific components**: `.publication-cover`, `.communication-image`, `.hero-image`, `.card-image-content`, `.preview-card-image`

### Glassmorphism (`utilities/glassmorphism.css`)

Modern glass effect utilities for creating frosted glass UI elements:

- **Base glass effects**: `.glass`, `.glass-light`, `.glass-medium`, `.glass-heavy`
- **Colored glass**: `.glass-primary`, `.glass-accent`, `.glass-highlight`, `.glass-success`
- **Blur levels**: `.glass-blur-sm`, `.glass-blur-md`, `.glass-blur-lg`, `.glass-blur-xl`, `.glass-blur-2xl`
- **Component-specific**: `.glass-card`, `.glass-panel`, `.glass-panel-light`, `.glass-nav`, `.glass-button`
- **Button variants**: Enhanced glass button styling with improved contrast
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

The CSS is built with a mobile-first approach using PostCSS Custom Media queries.

### Breakpoints

We use standard breakpoints defined in `src/styles/base/media.css`:

- **Small (`--sm`)**: 640px
- **Medium (`--md`)**: 768px
- **Large (`--lg`)**: 1024px
- **Extra Large (`--xl`)**: 1280px
- **2X Large (`--2xl`)**: 1536px

### Writing Media Queries

**IMPORTANT**: Do NOT use CSS variables (e.g., `var(--breakpoint-md)`) inside media queries as this is not supported by browsers. Instead, use the PostCSS Custom Media syntax:

```css
/* Correct usage */
@media (--md) {
  .my-component {
    padding: var(--spacing-8);
  }
}

/* Legacy/Invalid usage - DO NOT USE */
@media (min-width: var(--breakpoint-md)) { ... }
```

- **Base styles**: Designed for mobile devices first (no media query).
- **Progressive enhancement**: Use `@media (--breakpoint)` to apply styles for larger screens.
- **Utility responsiveness**: Most utilities are available with breakpoint prefixes (e.g., `.md:text-lg`).

## JavaScript Utilities Integration

The CSS framework integrates with several JavaScript utilities for enhanced functionality:

### Scroll Animations (`src/lib/utils/scrollAnimations.ts`)

Provides programmatic control over scroll-triggered animations:

- **`scrollAnimate`**: Svelte action for adding scroll animations to any element
- **`staggeredAnimation`**: Creates sequential animations for lists of elements
- **`smoothScrollTo`**: Smooth scrolling navigation with customizable easing
- **`parallaxScroll`**: Parallax effects for background elements
- **`createReadingProgress`**: Reading progress indicators for long content

Example usage:

```svelte
<!-- Basic scroll animation -->
<div use:scrollAnimate={{ animationClass: 'fade-in-up', delay: 200 }}>
	Content that animates on scroll
</div>

<!-- Smooth scroll navigation -->
<button onclick={() => smoothScrollTo('#section', { offset: 80 })}> Scroll to Section </button>
```

### Cookie Consent Management (`src/lib/utils/cookieConsent.ts`)

Robust cookie consent system with persistence and categorization:

- **Automatic expiration**: Consent expires after configurable period (default: 365 days)
- **Category management**: Separate consent for analytics, marketing, preferences
- **Version tracking**: Can require new consent when privacy policy changes
- **Browser compatibility**: Handles localStorage errors and private browsing
- **Legacy migration**: Automatically upgrades from older consent formats

The system provides both a class-based API and utility functions:

```typescript
import { cookieConsent, needsCookieConsent, isAnalyticsAllowed } from '$lib/utils/cookieConsent';

// Check if consent is needed
if (needsCookieConsent()) {
	// Show consent banner
}

// Check specific categories
if (isAnalyticsAllowed()) {
	// Enable analytics tracking
}
```

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
11. **Use scroll animations judiciously** - respect user preferences and performance
12. **Implement proper cookie consent** using the provided utilities for GDPR compliance
13. **For list-based content cards**, use the `entity-cards.css` module instead of creating bespoke card CSS inside components, and augment only when component-specific behavior truly requires it.

## Performance Considerations

- **Modular imports**: CSS is split into logical modules for better caching
- **Utility-first approach**: Reduces CSS bloat through reusable classes
- **CSS variables**: Enable efficient theming and customization
- **Modern features**: Uses modern CSS features for better performance
- **Print optimization**: Includes print-specific styles where needed
- **Animation performance**: Scroll animations use `transform` and `opacity` for optimal performance
- **Intersection Observer**: Efficient scroll detection without performance impact
- **Reduced motion support**: Respects user accessibility preferences
- **Cookie consent optimization**: Minimal localStorage usage with error handling
