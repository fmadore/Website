---
trigger: always_on
---

# Frederick Madore Academic Website - Agent Guidelines

## Project Overview

SvelteKit academic website using **Svelte 5** with runes, TypeScript, and the **Ink + Signal** design language: a flat print register — no glass, no shadows, no gradients, square corners, near-zero motion. Uses modular CSS architecture with design tokens.

> **Source of truth**: [CLAUDE.md](../../CLAUDE.md) (conventions, commands, architecture) and [DESIGN.md](../../DESIGN.md) (the design system). Where this file and they disagree, they win.

> **📘 Full CSS Documentation**: See [CSS-README.md](../../src/styles/CSS-README.md) for comprehensive details.

## Critical: Svelte MCP Usage

When writing Svelte code, you MUST use the Svelte MCP server tools:

### Available MCP Tools

| Tool                | Purpose                             | When to Use                                    |
| ------------------- | ----------------------------------- | ---------------------------------------------- |
| `list-sections`     | Discover documentation sections     | **FIRST** - at start of any Svelte task        |
| `get-documentation` | Fetch full documentation content    | After list-sections, get ALL relevant sections |
| `svelte-autofixer`  | Analyze code for issues/suggestions | **ALWAYS** before finalizing Svelte code       |
| `playground-link`   | Generate Svelte Playground link     | Only after user confirmation                   |

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
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		children
	}: {
		variant?: 'default' | 'compact';
		children: Snippet;
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

| Category   | Examples                                                               |
| ---------- | ---------------------------------------------------------------------- |
| Colors     | `--color-primary`, `--color-accent`, `--color-text`, `--color-surface` |
| Spacing    | `--space-sm` through `--space-xl`, or `--space-4` (numeric)            |
| Typography | `--font-size-sm`, `--font-family-serif`, `--font-weight-bold`          |
| Effects    | `--border-width-thin`, `--duration-fast` (no shadow or radius tokens)  |

### Breakpoints (PostCSS Custom Media)

```css
@media (--sm) {
} /* 640px */
@media (--md) {
} /* 768px */
@media (--lg) {
} /* 1024px */
```

> [!CAUTION]
> **NEVER** use `var()` in media queries - it's invalid CSS.

### Transparent Colors (color-mix)

Use `color-mix()` instead of `rgba(var(--*-rgb), opacity)` for transparent colors:

```css
/* ✅ Preferred - uses color directly */
background: color-mix(in srgb, var(--color-primary) 10%, transparent);

/* ❌ Deprecated - requires separate -rgb variable */
background: rgba(var(--color-primary-rgb), 0.1);
```

## Ink + Signal Idioms

Depth comes from ink density and rule weight, never from effects. The idiom
classes live in `src/styles/components/ink-signal.css` and are demonstrated on
`/style-guide`.

| Idiom                   | Use For                                                |
| ----------------------- | ------------------------------------------------------ |
| Rules (5px / 3px / 1px) | Masthead, section, and hairline separators — hierarchy |
| Ruled section           | The standard module: 3px ink rule + Archivo head       |
| Ledger row              | Every dated or keyed record (not a card)               |
| Flat chip               | Facets and tags: 1px border, mono caps, count appended |
| Plate                   | Photographs, covers, scans: 1px border, caption below  |

**Never add** `backdrop-filter`, `box-shadow`, `border-radius`, gradients, or new
`.glass-*` usages (the few legacy `.glass-*` names left render flat).

## Motion

Near-zero by design. There is no animation utility sheet and no entrance or
scroll-reveal class: page navigation is one short opacity transition in the
root layout, and component transitions animate colour and border only, at
150ms, each with its own `prefers-reduced-motion` rule. Transforms on hover are
violations.

## Key Guidelines

1. **Styling Priority**: Component-scoped → Ink + Signal idioms → Utility classes → CSS variables
2. **Accessibility**: ARIA labels, semantic HTML, keyboard nav, `prefers-reduced-motion`
3. **TypeScript**: Strict mode, proper types, `import type` for type-only imports
4. **File Paths**: Use `$lib` alias for imports

## File Organization

| Type       | Location                                            |
| ---------- | --------------------------------------------------- |
| Components | `src/lib/components/` (atoms, molecules, organisms) |
| Styles     | `src/styles/` (base, components, layout, utilities) |
| Pages      | `src/routes/`                                       |
| Data       | `src/lib/data/`                                     |

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run check    # TypeScript and Svelte validation
npm run lint     # Prettier + ESLint
npm run format   # Prettier formatting
npm run test     # Vitest unit tests
npm run verify   # the deterministic CI sequence, locally (one build)
```
