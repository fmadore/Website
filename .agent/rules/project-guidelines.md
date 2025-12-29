---
trigger: always_on
---

# Frederick Madore Academic Website - Agent Guidelines

## Project Overview

SvelteKit academic website using **Svelte 5** with runes, TypeScript, and glassmorphism design. Uses modular CSS architecture with design tokens.

> **📘 Full CSS Documentation**: See [CSS-README.md](../src/styles/CSS-README.md) for comprehensive details.

## Critical: Svelte MCP Usage

When writing Svelte code, you MUST use the Svelte MCP server tools:

### Available MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `list-sections` | Discover documentation sections | **FIRST** - at start of any Svelte task |
| `get-documentation` | Fetch full documentation content | After list-sections, get ALL relevant sections |
| `svelte-autofixer` | Analyze code for issues/suggestions | **ALWAYS** before finalizing Svelte code |
| `playground-link` | Generate Svelte Playground link | Only after user confirmation |

### Workflow

1. **Start**: Call `list-sections` to discover relevant documentation
2. **Research**: Use `get-documentation` to fetch relevant sections (check `use_cases` field)
3. **Write**: Implement code following Svelte 5 best practices
4. **Validate**: Call `svelte-autofixer` - keep calling until no issues remain
5. **Verify**: Run `npm run check` for TypeScript validation

> [!IMPORTANT]
> You MUST use `svelte-autofixer` when writing Svelte components. Keep calling it until no problems remain.

## Critical: Svelte 5 Requirements

When writing Svelte code, use Context7 MCP to fetch up-to-date Svelte 5 documentation:
1. Query Context7 for Svelte 5 patterns and best practices
2. Write code following Svelte 5 runes syntax
3. Run `npm run check` to validate code

## Svelte 5 Patterns (Always Use Runes)

```svelte
<script lang="ts">
	let {
		variant = 'default',
		children
	}: {
		variant?: 'default' | 'compact';
		children: any;
	} = $props();

	const combinedClasses = $derived(`base-class ${variant}`.trim());
</script>

<div class={combinedClasses}>
	{@render children()}
</div>
```

### Rules

- `$props()` for component props with TypeScript types
- `$state()` for reactive local state
- `$derived()` for computed values (NOT `$:` labels)
- `$effect()` for side effects
- `{@render children()}` instead of `<slot>`

## Design System

**Always use CSS variables from `src/styles/base/variables.css`** - never hardcode values.

| Category   | Examples                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| Colors     | `--color-primary`, `--color-accent`, `--color-text`, `--color-surface`   |
| Spacing    | `--space-sm` through `--space-xl`, or `--spacing-4` (numeric)            |
| Typography | `--font-size-sm`, `--font-family-serif`, `--font-weight-bold`            |
| Effects    | `--shadow-md`, `--border-radius-lg`, `--duration-normal`                 |

### Breakpoints (PostCSS Custom Media)

```css
@media (--sm) { }  /* 640px */
@media (--md) { }  /* 768px */
@media (--lg) { }  /* 1024px */
```

> [!CAUTION]
> **NEVER** use `var()` in media queries - it's invalid CSS.

## Glassmorphism Classes

| Class                       | Use For                  |
| --------------------------- | ------------------------ |
| `.glass-card`               | Cards with hover effects |
| `.glass-panel`              | Panels/sidebars          |
| `.glass-button`             | Buttons                  |
| `.glass-light/medium/heavy` | Intensity variants       |

## Animation System (CSS-Only)

**Use CSS classes, NOT the deprecated `scrollAnimations.ts`:**

| Class                  | Effect                      |
| ---------------------- | --------------------------- |
| `.scroll-reveal`       | Fade-up on viewport entry   |
| `.scroll-reveal-scale` | Scale-in for cards/images   |
| `.grid-stagger`        | Stagger children animations |
| `.page-enter`          | Page load animation         |

```svelte
<section class="scroll-reveal">...</section>
<div class="card scroll-reveal-scale">...</div>
<ul class="grid-stagger">{#each items}<li>...</li>{/each}</ul>
```

**Legacy classes** (`fade-in-up`, `stagger-1`-`6`) are valid for mount-time animations only.

> [!WARNING]
> **Don't animate:** buttons, navigation, modals, or components with custom IntersectionObserver.

## Key Guidelines

1. **Styling Priority**: Component-scoped → Utility classes → Glass utilities → CSS variables
2. **Accessibility**: ARIA labels, semantic HTML, keyboard nav, `prefers-reduced-motion`
3. **TypeScript**: Strict mode, proper types, `import type` for type-only imports
4. **File Paths**: Use `$lib` alias for imports

## File Organization

| Type       | Location                                           |
| ---------- | -------------------------------------------------- |
| Components | `src/lib/components/` (atoms, molecules, organisms) |
| Styles     | `src/styles/` (base, components, layout, utilities) |
| Pages      | `src/routes/`                                      |
| Data       | `src/lib/data/`                                    |

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run check    # TypeScript and Svelte validation
npm run lint     # ESLint
npm run format   # Prettier formatting
```