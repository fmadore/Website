# GitHub Copilot Instructions for Frederick Madore Website

## Project Overview

SvelteKit academic website using **Svelte 5** with runes, TypeScript, and glassmorphism design. Uses modular CSS architecture with design tokens.

> **📘 Full CSS Documentation**: See [CSS-README.md](../src/styles/CSS-README.md) for comprehensive details.
> **🎨 CSS Audit Skill**: Use the `css-design-audit` skill for design system compliance checks.
> **🔍 CSS Auditor Agent**: Switch to the `CSS Auditor` agent for comprehensive design audits.

## Critical: Svelte MCP Usage

**When writing Svelte code, you MUST use the Svelte MCP server tools:**

1. Call `list-sections` to discover relevant documentation
2. Fetch documentation using `get-documentation` for relevant sections
3. Write code following Svelte 5 best practices
4. **Validate with `svelte-autofixer`** - Fix any issues until no problems remain

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

**Rules:**
- `$props()` for component props with TypeScript types
- `$state()` for reactive local state
- `$derived()` for computed values (NOT `$:` labels)
- `$effect()` for side effects
- `{@render children()}` instead of `<slot>`

## State Management

| Pattern | Use For | Files |
|---------|---------|-------|
| Module `$state` + getters | Global singleton state | `globalState.svelte.ts` |
| Svelte `writable`/`derived` | Complex filter state | `filterUtils.ts` |

```typescript
// Global state pattern
let state = $state<T>(initial);
export function getState() { return state; }
export function setState(v: T) { state = v; }
```

## Design System

**Always use CSS variables from `src/styles/base/variables.css`** - never hardcode values.

| Category | Examples |
|----------|----------|
| Colors | `--color-primary`, `--color-accent`, `--color-text`, `--color-surface` |
| Spacing | `--space-sm` through `--space-xl`, or `--spacing-4` (numeric) |
| Typography | `--font-size-sm`, `--font-family-serif`, `--font-weight-bold` |
| Effects | `--shadow-md`, `--border-radius-lg`, `--duration-normal` |
| Focus | `--focus-ring`, `--focus-ring-offset`, `--focus-ring-color` |

**Breakpoints** (use PostCSS Custom Media):
```css
@media (--sm) { }  /* 640px */
@media (--md) { }  /* 768px */
@media (--lg) { }  /* 1024px */
```
⚠️ **NEVER** use `var()` in media queries - it's invalid CSS.

## Glassmorphism Classes

| Class | Use For |
|-------|---------|
| `.glass-card` | Cards with hover effects |
| `.glass-panel` | Panels/sidebars |
| `.glass-button` | Buttons |
| `.glass-light/medium/heavy` | Intensity variants |

## Animation System (CSS-Only)

**Use CSS classes, NOT the deprecated `scrollAnimations.ts`:**

| Class | Effect |
|-------|--------|
| `.scroll-reveal` | Fade-up on viewport entry |
| `.scroll-reveal-scale` | Scale-in for cards/images |
| `.grid-stagger` | Stagger children animations |
| `.page-enter` | Page load animation |

```svelte
<section class="scroll-reveal">...</section>
<div class="card scroll-reveal-scale">...</div>
<ul class="grid-stagger">{#each items}<li>...</li>{/each}</ul>
```

**Legacy classes** (`fade-in-up`, `stagger-1`-`6`) are valid for mount-time animations only.

**Don't animate:** buttons, navigation, modals, or components with custom IntersectionObserver.

## Key Guidelines

1. **Styling Priority**: Component-scoped → Utility classes → Glass utilities → CSS variables
2. **Accessibility**: ARIA labels, semantic HTML, keyboard nav, `prefers-reduced-motion`
3. **TypeScript**: Strict mode, proper types, `import type` for type-only imports
4. **File Paths**: Use `$lib` alias for imports

## File Organization

- Components: `src/lib/components/` (atoms, molecules, organisms)
- Styles: `src/styles/` (base, components, layout, utilities)
- Pages: `src/routes/`

## CSS Design Consistency

**When creating or reviewing components, ensure design system compliance:**

### Never Hardcode These Values

| Category | Hardcoded (❌) | Use Instead (✅) |
|----------|----------------|------------------|
| Colors | `#1d4ed8`, `rgb()` | `var(--color-primary)` |
| Spacing | `16px`, `1rem` | `var(--space-4)` |
| Typography | `14px` | `var(--font-size-sm)` |
| Duration | `200ms` | `var(--duration-normal)` |
| Shadows | `box-shadow: 0 4px...` | `var(--shadow-md)` |

### Transparency Pattern

```css
/* ❌ Don't use rgba() */
background: rgba(29, 78, 216, 0.5);

/* ✅ Use color-mix() */
background: color-mix(in srgb, var(--color-primary) 50%, transparent);
```

### Glassmorphism Requirements

```css
/* Always include Safari fallback */
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

### Running the CSS Audit

```bash
# Audit all components
node .github/skills/css-design-audit/audit.mjs src/lib/components

# Audit a specific file
node .github/skills/css-design-audit/audit.mjs src/lib/components/menu/Header.svelte
```

See [CHECKLIST.md](.github/skills/css-design-audit/CHECKLIST.md) for the full review checklist.


