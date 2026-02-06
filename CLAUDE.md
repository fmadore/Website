# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Academic personal website for Dr. Frédérick Madore (historian specializing in Islam in West Africa). Built with **SvelteKit 2** using **Svelte 5 runes**, TypeScript, and a glassmorphism-based custom CSS framework. Deployed as a static site to GitHub Pages.

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build (static prerendering)
npm run preview      # Preview production build
npm run check        # Type-check Svelte components
npm run check:watch  # Watch mode type-checking
npm run lint         # Run Prettier + ESLint checks
npm run format       # Auto-format with Prettier
npm run test         # Run Playwright E2E tests
npm run test:ui      # Playwright tests with UI
```

## Architecture

### Data-Driven Content
All academic content is stored as TypeScript files in `src/lib/data/`. Each content type has:
- Individual item files (e.g., `publications/books/religious-activism-campuses.ts`)
- An `index.ts` that aggregates items using `import.meta.glob()` and exports precomputed collections (`publicationsByType`, `publicationsByYear`, `allTags`, etc.)
- **Use `loadData()` from `$lib/utils/dataLoader.ts`** for new data categories — it handles module extraction, template filtering, and validation

**Data categories** (17 total): publications, communications, activities, digital-humanities, appointments, awards, education, editorial-memberships, fieldworks, grants, languages, media-appearances, peer-reviews, research-roles, affiliations, teaching, analysis

**Adding new items**: Create a `.ts` file exporting a typed object in the appropriate `src/lib/data/<category>/` directory. The `import.meta.glob()` in `index.ts` auto-discovers it — no manual registration needed.

### Component Organization (Atomic Design)
Components in `src/lib/components/` follow atomic design:
- **atoms/**: Basic elements (Button, NavLink, Icon)
- **molecules/**: Simple compositions (ItemCard, HeroImageDisplay, RelatedItemCard)
- **organisms/**: Complex UI (RelevantItemsList, sidebars)
- **common/**: Shared layout (Header, Footer, Card, PageIntro, ProfileBanner)
- **Feature-specific**: publications/, communications/, activities/, cv/, filters/, menu/, panels/, media/, visualisations/, reference/

### State Management
- **Global state**: `globalState.svelte.ts` - module-level `$state()` with getter/setter pattern
- **Filter state**: `filterUtils.ts` - Svelte `writable`/`derived` stores with URL sync via `urlFilterSync` action
- **Filter stores expose counts** for UI (tagCounts, authorCounts, etc.)

### Routing Pattern
- List pages: `/publications/`, `/communications/`, `/activities/`
- Detail pages: `/publications/[id]/`, `/communications/[id]/`
- Data loading in `+page.ts`, prerendered with `entries: ['*']`

### CSS Architecture
Modular system in `src/styles/` with import order: Base → Layout → Components → Utilities
- **Design tokens**: `base/variables.css` (colors, spacing, typography, shadows, glass blur tokens)
- **Breakpoints** (defined in `base/media.css`):
  - Min-width: `--sm` (640px), `--md` (768px), `--lg` (1024px), `--xl` (1280px), `--2xl` (1536px)
  - Max-width: `--xs-down`, `--sm-down`, `--md-down`, `--lg-down`, `--xl-down`, `--2xl-down`
  - Interaction: `--can-hover`, `--touch`
  - Accessibility: `--reduced-motion`, `--high-contrast`, `--dark-mode`
- **Glassmorphism**: Use `.glass-card`, `.glass-panel`, `.glass-button` classes
- See `src/styles/CSS-README.md` for comprehensive documentation

## Svelte 5 Patterns (Required)

Always use runes - never legacy reactive syntax:

```svelte
<script lang="ts">
  // Props with $props()
  let { variant = 'default', children }: Props = $props();

  // Reactive state with $state()
  let isOpen = $state(false);

  // Computed values with $derived()
  const classes = $derived(`base ${variant}`.trim());

  // Side effects with $effect()
  $effect(() => { /* ... */ });
</script>

<!-- Render children -->
{@render children?.()}
```

## Key Conventions

### Styling Rules
- **Always use CSS variables** - never hardcode colors, spacing, or typography values
- **Transparency**: Use `color-mix(in srgb, var(--color-primary) 50%, transparent)` not `rgba()`
- **Glassmorphism**: Always include `-webkit-backdrop-filter` fallback
- **Glass blur tokens**: Use `var(--glass-blur-sm)` through `var(--glass-blur-xl)`, not raw `blur(8px)`
- **Never use `var()` in media queries** - use PostCSS custom media syntax (e.g., `@media (--md)`)
- **Avoid `!important`** - only acceptable when overriding third-party library styles (ECharts, MapLibre) or in `prefers-reduced-motion` blocks
- **Dark mode**: Use `:global(html.dark) .my-class { ... }` selector pattern. Use CSS variables and `color-mix()` with design tokens for dark-mode-specific values

### Animation System (CSS-only)
Use CSS classes, not the deprecated `scrollAnimations.ts`:
- `.scroll-reveal` - fade-up on viewport entry
- `.scroll-reveal-scale` - scale-in for cards/images
- `.grid-stagger` - staggered child animations
- `.page-enter` - page load animation

### File Organization
- Components: `src/lib/components/`
- Data files: `src/lib/data/`
- Types: `src/lib/types/`
- Utilities: `src/lib/utils/`
- Global styles: `src/styles/`
- Routes: `src/routes/`

### Import Paths
Use `$lib` alias for all imports from `src/lib/`.

## Important Patterns

### Filter Implementation
Filters use reactive stores with URL synchronization:
- Toggle filters: `toggleTypeFilter(value)`, `toggleTagFilter(value)`
- Range filters: `updateYearRange()`, `resetYearRange()`
- Clear all: `clearAllFilters()`

### Citation/Bibliography
Multi-format support via `citationFormatter.ts`: BibTeX, APA, MLA, Chicago

### SEO
- `SEO.svelte` component for page metadata
- `seoUtils.ts` generates JSON-LD structured data
- RSS at `/rss.xml`, sitemap at `/sitemap.xml`

### Heavy Libraries (Code Split)
ECharts, D3, MapLibre, jsPDF, and html2canvas are split into separate chunks via Vite config. Use dynamic imports for visualization components.

## CSS Design Audit

Run the audit tool to check design system compliance:
```bash
node .github/skills/css-design-audit/audit.mjs src/lib/components
```

## Technical Debt

See `REFACTORING-ROADMAP.md` for the prioritized list of refactoring opportunities with status tracking.
