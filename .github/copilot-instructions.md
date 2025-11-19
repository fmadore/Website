# GitHub Copilot Instructions for Frederick Madore Website

## Project Overview

This is a SvelteKit-based academic website using **Svelte 5** with runes, TypeScript, and a comprehensive glassmorphism design system. The project follows atomic design principles and uses a modular CSS architecture.

## Critical: Svelte MCP Usage

**When writing Svelte code, you MUST use the Svelte MCP server tools:**

### Required Workflow:

1. **Always start** by calling `list-sections` to discover relevant documentation
2. **Analyze use_cases** from the list-sections output to identify all relevant documentation sections
3. **Fetch documentation** using `get-documentation` for ALL relevant sections
4. **Write the code** following Svelte 5 best practices and the documentation
5. **Validate with svelte-autofixer** - Call this tool and fix any issues until no problems remain
6. **Optionally generate playground link** - Ask user if they want a playground link (only if not writing to project files)

## Framework & Technology Stack

- **Framework**: SvelteKit with Svelte 5 (runes enabled)
- **TypeScript**: Strict mode with bundler module resolution
- **CSS Architecture**: Modular CSS with utility-first approach
- **Design System**: Glassmorphism-based with comprehensive design tokens
- **Build**: Vite with static adapter for pre-rendering
- **Extensions**: MDSvex for markdown processing

## Svelte 5 Patterns (Always Use Runes)

### Component Structure Requirements

- Use Svelte 5 runes: `$props()`, `$state()`, `$derived()`, `$effect()`
- Always use TypeScript with proper type definitions
- Use `{@render children()}` for slot content instead of `<slot>`
- Destructure props with default values and type annotations

### Standard Component Pattern:

```svelte
<script lang="ts">
	let {
		variant = 'default',
		glassEffect = 'glass-card',
		additionalClasses = '',
		children
	}: {
		variant?: 'default' | 'compact' | 'wide';
		glassEffect?: 'glass-card' | 'glass-panel' | 'glass-medium' | 'glass-light';
		additionalClasses?: string;
		children: any;
	} = $props();

	// Use $derived for computed values
	const combinedClasses = $derived(
		`base-class ${variant} ${glassEffect} ${additionalClasses}`.trim()
	);
</script>

<div class={combinedClasses}>
	{@render children()}
</div>
```

### State Management Rules

- `$state()` for reactive local state
- `$derived()` for computed values (NOT reactive statements)
- `$effect()` for side effects (NOT $: labels)
- Stores from `src/lib/stores/` for global state

## Design System - Glassmorphism

### Always Use CSS Variables (from `src/styles/base/variables.css`)

The project uses a comprehensive design token system. **ALWAYS use CSS variables, never hardcoded values.**

**Colors:**

- Primary: `var(--color-primary)`, `var(--color-primary-rgb)`, `var(--color-primary-dark)`
- Secondary: `var(--color-secondary)`, `var(--color-secondary-rgb)`
- Accent: `var(--color-accent)`, `var(--color-accent-rgb)`
- Highlight: `var(--color-highlight)`, `var(--color-highlight-rgb)`
- Success: `var(--color-success)`, `var(--color-success-rgb)`
- Text: `var(--color-text)`, `var(--color-text-light)`, `var(--color-text-muted)`, `var(--color-text-emphasis)`
- Surface: `var(--color-surface)`, `var(--color-surface-rgb)`, `var(--color-surface-alt)`, `var(--color-background)`

**Spacing Scale** (0.25rem = 4px base):

- `var(--spacing-1)` through `var(--spacing-48)` (1-12rem)
- Common: `var(--spacing-4)` (1rem), `var(--spacing-8)` (2rem), `var(--spacing-16)` (4rem)

**Typography:**

- Families: `var(--font-family-sans)`, `var(--font-family-serif)`, `var(--font-family-mono)`
- Sizes: `var(--font-size-xs)` (0.75rem) through `var(--font-size-6xl)` (4rem)
- Weights: `var(--font-weight-light)` (300) through `var(--font-weight-black)` (900)
- Line heights: `var(--line-height-tight)` through `var(--line-height-loose)`

**Borders & Effects:**

- Radius: `var(--border-radius-sm)` through `var(--border-radius-2xl)`, `var(--border-radius-full)`
- Shadows: `var(--shadow-sm)` through `var(--shadow-xl)`
- Transitions: `var(--transition-duration-75)` through `var(--transition-duration-500)`

**Breakpoints:**

- `var(--breakpoint-sm)`: 640px, `var(--breakpoint-md)`: 768px
- `var(--breakpoint-lg)`: 1024px, `var(--breakpoint-xl)`: 1280px

### Glassmorphism Classes (Required for UI)

**Base glass effects:**

- `.glass` - Standard effect
- `.glass-light` - Subtle
- `.glass-medium` - Medium
- `.glass-heavy` - Strong

**Component-specific:**

- `.glass-card` - For cards (includes hover)
- `.glass-panel` - For panels/sidebars
- `.glass-nav` - For navigation
- `.glass-button` - For buttons

**Colored variants:**

- `.glass-primary`, `.glass-accent`, `.glass-highlight`, `.glass-success`

### Standard Glassmorphism Pattern:

```css
background: linear-gradient(
	135deg,
	rgba(var(--color-primary-rgb), 0.03) 0%,
	rgba(var(--color-highlight-rgb), 0.02) 50%,
	rgba(var(--color-accent-rgb), 0.01) 100%
);
backdrop-filter: blur(var(--glass-blur-amount));
-webkit-backdrop-filter: blur(var(--glass-blur-amount));
border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.2);
box-shadow:
	var(--shadow-lg),
	inset 0 1px 0 rgba(var(--color-white-rgb), 0.2);
```

## Styling Guidelines

### Component Styling Priority:

1. Component-scoped styles for specific needs
2. Utility classes for layout/spacing/common patterns
3. Glassmorphism utilities for glass effects
4. CSS variables for all colors, spacing, typography

### Dark Mode Support:

- Automatic via CSS variables
- Use `html.dark` selector for overrides
- Always test both themes

### Responsive Design:

- Mobile-first with breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Use responsive utilities: `.md:text-lg`, `.lg:p-8`

### Accessibility Requirements:

- Proper ARIA labels and roles
- Semantic HTML elements
- Keyboard navigation support
- Focus states on interactive elements
- Respect `prefers-reduced-motion`

## TypeScript Standards

- Strict mode enabled
- Proper type definitions for all props/state
- Use `import type { ... }` for type imports
- Avoid `any` - use proper interfaces or unions

## Common Patterns

### Page Layout:

```svelte
<script lang="ts">
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';

	let { title, description } = $props();
</script>

<PageHeader {title} {description} />

<ContentBody variant="default" glassEffect="glass-card">
	{#snippet children()}
		<!-- Content -->
	{/snippet}
</ContentBody>
```

## File Organization

- Base styles: `src/styles/base/`
- Components: `src/lib/components/` (atoms, molecules, organisms)
- Pages: `src/routes/`
- Utilities: `src/styles/utilities/`
- Use `$lib` alias for imports

## CSS Architecture Reference

> **📘 Full Documentation**: See [CSS-README.md](../src/styles/CSS-README.md) for comprehensive CSS architecture details.

### Key Principles:

1. **Import Order**: Base → Layout → Components → Utilities (defined in `src/app.css`)
2. **Styling Priority**: Component-scoped styles → Utility classes → Glassmorphism utilities → CSS variables
3. **Page-Specific Styles**: Keep in Svelte component `<style>` blocks, not separate CSS files
4. **Shared Patterns**: Use `entity-cards.css` for list-based content (publications, communications, etc.)

### Essential Utility Modules:

- **Spacing**: `.m-*`, `.p-*`, `.gap-*` (spacing scale: 0-12)
- **Layout**: `.flex`, `.grid`, `.container`, display/overflow utilities
- **Colors**: `.text-*`, `.bg-*`, `.border-*` (all use CSS variables)
- **Typography**: Font sizes, weights, alignment (in `base/typography.css`)
- **Glassmorphism**: `.glass`, `.glass-card`, `.glass-panel`, `.glass-button`
- **Images**: `.responsive-image`, `.aspect-*`, `.object-*` (in `utilities/images.css`)
- **Sizing**: `.w-*`, `.h-*`, `.max-w-*` (in `utilities/sizing.css`)

### Component CSS Modules:

- `buttons.css` - Complete button system (`.btn`, `.btn-primary`, `.btn-outline-*`, size variants)
- `cards.css` - Card components (`.card`, `.card-body`, layout variants)
- `entity-cards.css` - Unified styles for publication/communication lists
- `panels.css` - Panel containers with filters (`.panel`, `.panel-activities`)
- `activity-list.css` - Timeline-style lists for activities
- `navigation-utilities.css` - Shared utilities for navigation components
- `animations.css` - Scroll animations (`.fade-in-up`, `.stagger-*`, reduced motion support)

## Remember

- Always use Svelte MCP tools when writing Svelte code
- Prioritize consistency with existing patterns
- Maintain glassmorphism design aesthetic
- Ensure accessibility and performance standards
- Use Svelte 5 runes syntax exclusively (no legacy Svelte 4 patterns)
- Refer to CSS-README.md for detailed styling guidance
