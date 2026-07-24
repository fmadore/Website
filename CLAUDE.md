# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Academic personal website for Dr. Frédérick Madore (historian specializing in Islam in West Africa). Built with **SvelteKit 2** using **Svelte 5 runes**, TypeScript, and a custom token-driven CSS system implementing the **Ink + Signal** design language (flat print register — no glass, no shadows, square corners). Deployed as a static site to GitHub Pages.

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build (static prerendering)
npm run preview      # Preview production build
npm run check        # Type-check Svelte components
npm run check:tsgo   # Same check via the TypeScript 7 native compiler (~2x faster, experimental)
npm run check:watch  # Watch mode type-checking
npm run lint         # Run Prettier + ESLint checks
npm run format       # Auto-format with Prettier
npm run test         # Run Vitest unit tests (pure utils: aggregation, JSON-LD)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Run Playwright E2E smoke tests (builds + previews first)
npm run test:e2e:ui  # Playwright tests with UI
```

> **Testing layout**: Unit tests are co-located as `*.test.ts` next to the
> module they cover (e.g. `src/lib/utils/vizAggregation.test.ts`) and run in a
> plain Node environment via `vitest.config.ts`. E2E smoke tests live in
> `tests-e2e/` and run against the production build (`playwright.config.ts`).

## Architecture

### Data-Driven Content

All academic content is stored as TypeScript files in `src/lib/data/`. Each content type has:

- Individual item files (e.g., `publications/books/religious-activism-campuses.ts`)
- An `index.ts` that aggregates items using `import.meta.glob()` and exports precomputed collections (`publicationsByType`, `publicationsByYear`, `allTags`, etc.)
- **Use `loadData()` from `$lib/utils/dataLoader.ts`** for new data categories — it handles module extraction, template filtering, and validation

**Data categories** (17 total): publications, communications, activities, digital-humanities, appointments, awards, education, editorial-memberships, fieldworks, grants, languages, media-appearances, peer-reviews, research-roles, affiliations, teaching, analysis

**Navigation data**: `src/lib/data/navigation.ts` exports `navItems` used by the Header component.

**Adding new items**: Create a `.ts` file exporting a typed object in the appropriate `src/lib/data/<category>/` directory. The `import.meta.glob()` in `index.ts` auto-discovers it — no manual registration needed.

### Component Organization (Atomic Design)

Components in `src/lib/components/` follow atomic design:

- **atoms/**: Basic elements (Button, ToggleButton, NetworkStatusIndicator, RangeSlider, TweenedCount)
- **molecules/**: Simple compositions (BibliographyRow, Breadcrumb, HeroImageDisplay, Pagination, RelatedItemCard, TagList, DetailsGrid, …)
- **organisms/**: Complex UI (RelatedItemsList)
- **common/**: Shared layout (Footer, Card, PageHeader, PageIntro, ProfileBanner, EntityDetailLayout, EntityListPageLayout, FilteredListDisplay)
- **entity-index/**: The live filter UI (EntityFilterBar, EntityFacetGrid)
- **Feature-specific**: publications/, communications/, activities/, cv/, menu/ (Header, NavLink, …), panels/, media/, visualisations/, reference/, research/, digital-humanities/

### State Management

- **Global state**: `globalState.svelte.ts` - module-level `$state()` with getter/setter pattern
- **Filter state**: `entityFilterSystem.svelte.ts` - a runed `EntityFilterSystem` class per entity-index page (deep `$state` `activeFilters`, `$derived` `filteredItems`/`counts`), with URL sync via the `urlFilterSync` action. Pure logic (predicates, facet counts, toggle/range helpers) lives in `entityFilterCore.ts` for testability; `filterUtils.ts` retains only the `areFiltersActive()` helper.

### Routing Pattern

- List pages: `/publications/`, `/communications/`, `/activities/`
- Detail pages: `/publications/[id]/`, `/communications/[id]/`
- Data loading in `+page.ts`, prerendered with `entries: ['*']`

### CSS Architecture

Modular system in `src/styles/` with import order: Base → Layout → Components → Utilities

- **Design tokens**: `base/variables.css` (colors, spacing, typography, rules; all `--shadow-*` resolve to `none` and all `--border-radius-*` except `-full` resolve to `0` by design)
- **Breakpoints** (defined in `base/media.css`):
  - Min-width: `--sm` (640px), `--md` (768px), `--lg` (1024px), `--xl` (1280px), `--2xl` (1536px)
  - Max-width: `--xs-down`, `--sm-down`, `--md-down`, `--lg-down`, `--xl-down`, `--2xl-down`
  - Interaction: `--can-hover`, `--touch`
  - Accessibility: `--reduced-motion`, `--high-contrast`, `--dark-mode`
- **Ink + Signal idioms**: ruled sections, ledger rows, flat chips, plates — see `src/styles/components/ink-signal.css`. Legacy `.glass-*` class names survive in a few components but render as flat surfaces; do not add new usages.
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
	$effect(() => {
		/* ... */
	});
</script>

<!-- Render children -->
{@render children?.()}
```

## Key Conventions

### Styling Rules

- **Always use CSS variables** - never hardcode colors, spacing, or typography values
- **Transparency**: Use `color-mix(in srgb, var(--color-primary) 50%, transparent)` not `rgba()`
- **No glass, no shadows, no gradients, no rounded corners** — depth comes from ink density and rule weight (5px masthead / 3px section / 1px hairline). Never add `backdrop-filter`, `box-shadow`, or `border-radius` to new styles (the only gradient exception is a real data-proportion bar like `.hbar`)
- **Never use `var()` in media queries** - use PostCSS custom media syntax (e.g., `@media (--md)`)
- **Avoid `!important`** - only acceptable when overriding third-party library styles (ECharts, MapLibre) or in `prefers-reduced-motion` blocks
- **Dark mode**: Use `:global(html.dark) .my-class { ... }` selector pattern. Use CSS variables and `color-mix()` with design tokens for dark-mode-specific values

### Animation System (CSS-only)

Motion is near-zero by design (print register). When an entrance animation is warranted, use the CSS classes in `animations.css` (the old `scrollAnimations.ts` util was deleted):

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

### Console Logging

Never add bare `console.log/warn/error` in components or utilities. Guard with `import.meta.env.DEV`:

```ts
if (import.meta.env.DEV) console.error('debug info:', err);
```

For non-critical `catch` blocks (analytics, PWA, fullscreen), use empty catch with a comment instead.

### Author/Affiliation Data

Always import author info from `$lib/data/siteConfig` (`author`, `address`, `website`). Never hardcode name, position, or institution strings in JSON-LD or SEO metadata.

### Formatting

Run `npm run format` before committing. CI enforces Prettier + ESLint via `npm run lint`.

## Important Patterns

### Filter Implementation

Entity-index pages instantiate `new EntityFilterSystem(config)` from `$lib/utils/entityFilterSystem.svelte.ts` and read/mutate it directly (no store `$` prefix):

- Toggle facet values: `system.toggle('types' | 'tags' | …, value)`
- Range filters: `system.updateYearRange(min, max)`, `system.resetYearRange()`
- Clear all: `system.clearAllFilters()`
- Pass `system.activeFilters` to the `urlFilterSync` action for URL⇄state sync

### Citation/Bibliography

Multi-format support via `citationFormatter.ts`: BibTeX, APA, MLA, Chicago

### SEO

- `SEO.svelte` component for page metadata
- `seoUtils.ts` generates JSON-LD structured data
- `useJsonLdScript()` from `jsonLd.svelte.ts` for injecting JSON-LD scripts (used by layout and all detail pages)
- RSS at `/rss.xml`, sitemap at `/sitemap.xml`

### Heavy Libraries (Code Split)

ECharts, D3, MapLibre, and jsPDF are split into separate chunks via `build.rolldownOptions` in Vite config. Use dynamic imports for visualization components.

## Design Context

**Direction: Ink + Signal — the press archive, read computationally.** Source of truth: `.impeccable.md` (read that file for the full brief). Summary below for every session.

### Users

Primary: **academic peers** — fellow researchers in Islamic studies, African studies, digital humanities. Desk-based, short sessions, more scanning than reading, trust typographic rigor over flash. Job-to-be-done: find and cite Madore's work, or check on current projects, quickly — while having the site corroborate that he's a serious person. Visitors should feel they are inside a working archive, not on a personal-brand page.

### Brand Personality

**Ink + Signal.** Three-word distillation: _documentary, exacting, alive._ The identity comes from the collision of the two source materials: the West African press corpus the scholar studies (nameplates, section rules, typeset bibliographies) and the computational layer he builds (structured metadata, corpus counts, machine-readable everything). The page itself demonstrates the method — primary sources set with editorial gravity, apparatus set in a machine voice. The masthead asserts; the apparatus reassures.

### Aesthetic Direction

**Commit to the collision; retire tasteful restraint.** The previous "editorial evolution" (warm paper + ink-blue + Fraunces/Spectral/Commissioner + quiet glass) was a genre — recognisably "thoughtful academic site" — rather than an identity. Ink + Signal keeps the paper ground and editorial discipline but makes the two halves of the work visible and loud where it counts.

**Mood:** post-independence West African newspaper nameplates and press typesetting (heavy rules, capital mastheads, dated columns); critical editions and typeset bibliographies (apparatus as aesthetic); microfilm readers (dark mode is a negative, not a "dark mode"); editorial-brutalist web tempered by book-quality serif text.

**Avoid:** templated academic CMS defaults; AI-slop tells (gradients of any kind, glassmorphism, glow, `border-left` accent stripes, rounded cards with soft shadows); code-editor/terminal aesthetics (mono is _metadata_, never body copy, never a whole-page theme); soft-launch minimalism (acres of whitespace, single-column feature pages, hero photos with overlay text).

**Theme.** Daylight and midnight are both first-class and both _warm_. Daylight: warm paper `#FAF7EF`, ink `#191509`, one accent. Midnight is the same page photographed as a **microfilm negative** — grounds swap warm-black `#171310`, type swaps cream `#EFE7D6`, the pine accent brightens to `#4FBB99`. Not slate, not blue, not an inversion filter. Warmth lives in the grounds and type in both modes; the accent is the one cooler note.

**Typography — two voices, strictly cast.** **Archivo** (display grotesque: nameplate, h1–h3, section heads, big data numbers), **Newsreader** (news serif: all prose, h4–h6, subtitles, captions, italics), **Spline Sans Mono** (the _data voice_: eyebrows, datelines, counts, nav, filters, chips, DOIs, pagination — anything that could be a database column). Never blur the voices: no mono headlines, no serif metadata. Retired: Fraunces, Spectral, Commissioner, JetBrains Mono — and with them the "knowing exception" clause.

**Color — two inks on two grounds, one accent.** **Pine** — a warm teal (`--color-accent: #1E6A56` daylight / `#4FBB99` midnight) is the single accent; it marks _the current thing_ (active nav, eyebrows, key numbers, the one primary CTA, link underlines). **Ink** (`--color-primary`) is the dominant structural colour (rules, solid fills, selected chips, nameplate). Apply by weight: ground ≫ ink ≫ accent — the accent never fills large areas except the single primary button. Grounds and ink stay warm; the accent is the one cooler note. Retired: ink-blue, amber, and the earlier press-vermillion accent. New viz colours derive in OKLCH from the ink + pine anchors (`--sys-viz-1..7`).

**Structure — hierarchy is drawn in rules.** 5px/4px heavy rules open mastheads; 3px rules open sections; 1px hairlines separate entries (ink-coloured, never gray). **Ruled sections** (3px ink rule + Archivo head) are the standard module. **The ledger** (hanging mono key/date left, serif content right, hairline between rows) is the universal record idiom — publications, CV entries, activities, metadata, facets. **Flat chips** (1px border, sharp corners, mono caps, count appended; selected = solid ink fill). **Corners are square; shadows and glass do not exist.** Depth comes from ink density and rule weight. Idiom classes live in `src/styles/components/ink-signal.css`.

**Data as ornament.** The only decoration permitted is real data made visible: year-distribution bar strips, corpus counts, frequency-scaled key-term lists. If a flourish doesn't encode something true, it goes.

**Imagery.** Photographs, covers, scans are _plates_: square corners, 1px border, mono or serif-italic caption below (`Fig. 1 — …`). **Motion:** nearly none — instant state changes; at most a short fade on page enter. The register is print, not app.

### Design Principles

1. **Two voices, strictly cast.** Document voice (Archivo/Newsreader) for what the scholar writes; data voice (Spline Sans Mono) for what the machine indexes. Every string belongs to one. Blurring them is the system's only unforgivable error.
2. **Hierarchy is drawn in rules.** Reach for the rule system (5px masthead, 3px section, 1px hairline) before size or colour. The page should be navigable if all type were one size.
3. **The ledger is the default record.** Any dated/keyed record renders as a hanging-column ledger row, not a card.
4. **The accent marks the present.** Pine means "current, active, newest, primary." If it appears more than a handful of times per screen, demote occurrences until it's scarce.
5. **Data is the only ornament.** Year-bars, counts, term frequencies may decorate because they're true. Nothing else may.
6. **Print register, both themes.** Square corners, no shadows, no glass, no glow, near-zero motion — daylight _and_ midnight. Midnight is a microfilm negative designed as its own pass.
7. **Peer-respecting density.** Scholars scan; dense, well-typeset information signals seriousness. Don't pad with whitespace when structured information serves better.
