# CSS Architecture Documentation

This document outlines the CSS architecture used in this project. The CSS is organized using a modular approach with a focus on maintainability, scalability, and reusability.

> **🖋 Design system: Ink + Signal (2026-07).** The press archive, read computationally. Warm paper + ink with a single **pine (warm teal)** accent in daylight; a warm near-black **microfilm negative** with cream type at midnight. **Two type voices, strictly cast:** Archivo (display), Newsreader (prose serif), Spline Sans Mono (data voice). **Square corners, no shadows, no glass, no gradients** — hierarchy is drawn in rules (5px masthead, 3px section, 1px hairline) and ledger rows. Structural idioms live in [`components/ink-signal.css`](./components/ink-signal.css); the full brief is in [`.impeccable.md`](../../.impeccable.md). Source of truth for tokens: [`base/variables.css`](./base/variables.css) and [`base/dark.css`](./base/dark.css).

## Directory Structure

```
src/
├── app.css            # Main entry point that stitches the modules together
└── styles/
    ├── base/          # Custom media, design tokens, dark theme, reset, typography
    ├── components/    # Reusable UI components + Ink + Signal idioms
    ├── layout/        # Layout components and structures
    └── utilities/     # Utility classes
```

## Main CSS Entry Point

The `src/app.css` file imports the global stylesheet in a fixed order so tokens are available before anything depends on them:

- **Import order**: Base → Layout → Components → Utilities (mirrors the block comments inside `app.css`).
- **Route-scoped CSS**: `components/entity-cards.css`, `components/activity-list.css`, `components/bibliography.css`, and `components/filters.css` are **not** imported globally — they are imported by the components that own them, so they code-split per route and keep the render-blocking global stylesheet small.
- **Adding new modules**: Place new files under the appropriate directory, then add a matching `@import` in the same section of `app.css` (or import from the owning component if the styles are route-specific).
- **Component overrides**: Prefer Svelte component-scoped styles for one-off tweaks; reach for global imports only when multiple pages need the change.

## Extending the CSS System

1. **Check existing layers first**: Reuse the Ink + Signal idiom classes (`.ledger`, `.section`, `.chip`, `.plate`, `.eyebrow`) and the utilities before writing new CSS.
2. **Scope deliberately**: Component-specific visuals belong in the Svelte file's `<style>` block; shared UI patterns live under `styles/components/`; system-wide helpers go in `styles/utilities/`.
3. **Lean on design tokens**: Reference values from `base/variables.css` instead of hard-coded numbers or hex values. This keeps daylight/midnight theming consistent.
4. **Respect motion and accessibility**: Honor `prefers-reduced-motion`, `prefers-contrast`, and focus-visible treatments as `reset.css` and `animations.css` do. Motion is near-zero by design — the register is print, not app.
5. **Document the change**: Update this README so future contributors know the intent behind the new styles.

## Base Styles

### Variables (`base/variables.css`)

A design token system with foundation → semantic layering:

1. **Foundation tokens** (`--sys-*`): Raw values that rarely change
2. **Semantic tokens** (`--color-*`, `--space-*`, etc.): Meaningful names for usage context

#### Color System — two inks on two grounds, one accent

- **Primary**: INK (`#191509` daylight / cream `#efe7d6` midnight) — the dominant structural colour (rules, solid fills, selected chips, the nameplate)
- **Secondary**: Muted ink / muted cream for supporting text
- **Accent**: PINE — warm teal (`--color-accent: #1e6a56` daylight / `#4fbb99` midnight) — the single accent, applied by scarcity: eyebrows, active nav, key numbers, link underlines, the one primary CTA per screen
- **Highlight**: Aliases pine, so link/hover accents resolve to the accent
- **Viz palette**: Seven OKLCH-derived categorical hues (`--sys-viz-1..7`), pine-anchored, for data visualisation only — never UI chrome
- **Success**: Muted olive (`#5c6b3a`); **Danger**: deep warm red (`#a3341c`)
- **Grounds**: Warm paper scale (`--sys-color-paper*`, hairline/border steps) in daylight; warm film scale (`--sys-color-film-*`) at midnight — never pure white or pure black, never slate
- **Dynamic opacity**: Use `color-mix()` for transparency (e.g., `color-mix(in srgb, var(--color-primary) 25%, transparent)`), not `rgba()`

#### Rule Weights

Hierarchy is drawn in rules, ink-coloured (cream on midnight), never gray:

- `--rule-nameplate` (5px) → `--rule-masthead` (4px) → `--rule-section` (3px) → `--rule-hairline` (1px)

#### Border Radius — corners are square

Every `--border-radius-*` token resolves to `0`. The only exception is `--border-radius-full` (9999px), retained for genuinely circular micro-controls (slider thumbs, spinners, status dots) that opt in explicitly.

#### Shadows — shadows do not exist

Every `--shadow-*` token (including the colored and glass variants) resolves to `none`. The tokens are kept for API stability so the whole component layer flattens automatically. Depth comes from ink density and rule weight, not elevation.

#### Spacing System (8-point grid)

- **Semantic scale**: `--space-3xs` through `--space-7xl`
- **Numeric scale**: `--space-0` through `--space-48`
- **Tight variants**: `--space-md-tight` (14px), `--space-xl-tight` (28px)
- **Reading rhythm**: `--space-reading`, `--space-reading-loose` for detail-page sections

#### Typography Tokens — two voices

- **Font families**: `--font-family-display` (Archivo — nameplate, h1–h3, section heads, big data numbers), `--font-family-serif` (Newsreader — all prose, h4–h5, captions, italics; the reading default), `--font-family-mono` (Spline Sans Mono — the data voice: eyebrows, datelines, counts, nav, chips, DOIs, pagination; **never body copy**). `--font-family-sans` is a neutral system stack kept only as a form-control fallback.
- **Archivo width axis**: `--font-variation-nameplate/-display/-display-md/-display-sm/-wordmark` presets for the wide, heavy display cut
- **Type scale**: Fluid `clamp()` steps with forked ratios — Minor Third (1.2) for body/UI, Major Third (1.25) for display; plus `--font-size-nameplate` and `--font-size-display` for mastheads and index heroes
- **Semantic sizes**: `--font-size-2xs` through `--font-size-5xl`, `--font-size-heading-1..6`
- **Line heights / tracking / weights**: `--line-height-*`, `--letter-spacing-*` and contextual aliases (`--tracking-eyebrow`, etc.)

#### Focus Ring (Accessibility)

- **`--focus-ring`** / **`--focus-ring-color`** / **`--focus-ring-offset`**: Accent-coloured focus indicators (pine signals the keyboard target)

#### Container Queries

- **`--container-query-xs`** through **`--container-query-xl`**: Widths for `@container` queries

#### Animation & Transitions

- **Duration scale**: `--duration-instant` (75ms) through `--duration-slower` (700ms); ambient loop durations exist but decorative motion is essentially retired
- **Easing**: `--ease-in`, `--ease-out`, `--ease-in-out`, `--ease-smooth`, `--ease-out-quart`, `--ease-out-quint`. `--ease-bounce` and `--ease-spring` survive as **legacy aliases** of the quart/quint out-curves — nothing overshoots anymore; prefer `--ease-out-quart` / `--ease-out-quint` in new code
- **Stagger delays**: `--stagger-1` through `--stagger-6` (40ms step)

Example usage:

```css
.example {
	color: var(--color-primary);
	margin-bottom: var(--space-md);
	border-top: var(--rule-section) solid var(--color-primary);
	background: color-mix(in srgb, var(--color-primary) 10%, transparent);
	transition: border-color var(--duration-fast) var(--ease-out);
}
```

### Dark Theme (`base/dark.css`)

Midnight is **the microfilm negative** — the same printed page photographed as a negative, not a slate "dark mode" and not an inversion filter. `html.dark` only remaps colour tokens: grounds swap to warm near-black (`#171310` film scale), "ink" becomes cream (`#efe7d6` scale), and the pine accent brightens to `#4fbb99`. Because shadows and glass are gone globally, no other overrides are needed. Component dark-mode tweaks use the `:global(html.dark) .my-class` selector pattern with tokens and `color-mix()`.

### Typography (`base/typography.css`)

- **Reading default**: `body` is set in Newsreader (the prose voice); chrome opts into mono, headings into Archivo
- **Headings**: h1–h3 are the display voice (Archivo, wide/heavy via `font-variation-settings`); h4–h5 stay in Newsreader; **h6 is the data voice** (mono, letterspaced caps — an eyebrow/label)
- **Links**: Ink text with a **static pine underline** in prose contexts (`text-decoration-color: var(--color-accent)`, 1px, offset 3px). Hover warms the text to pine and thickens the rule to 2px — nothing grows or sweeps. Outside prose, `.link-animated` gives a quiet hover-to-accent response without the underline
- **Blockquotes**: Editorial indent — left margin, italic serif, softer colour. No background, no border stripe
- **Emphasis**: `em`/`i`/`cite` are genuine Newsreader italics; inside h1–h3 they stay upright in the display face to avoid a voice collision
- **Academic elements**: `.citation`, `.footnote`, `.abstract` (a serif-italic standfirst, no box), `.keywords`
- **`.editorial-section-title`**: Archivo section head over a hairline rule, shared by detail-page sections
- **Prose class**: `.prose` for long-form content (reading measure, relaxed leading, heading rhythm)
- **Utilities**: Font family/size/weight, alignment, leading, tracking, transforms, truncation
- **Selection**: Translucent pine `::selection`
- **Print optimizations** for CV and publication pages

### Custom Media (`base/media.css`)

PostCSS Custom Media definitions for responsive and capability-based queries:

- **Breakpoints (min-width)**: `--sm`, `--md`, `--lg`, `--xl`, `--2xl`
- **Breakpoints (max-width)**: `--xs-down`, `--sm-down`, `--md-down`, `--lg-down`, `--xl-down`, `--2xl-down`
- **Interaction**: `--can-hover` (desktop), `--touch` (touch devices)
- **Environment**: `--print`, `--retina`, `--landscape`, `--portrait`
- **Accessibility**: `--reduced-motion`, `--high-contrast`, `--dark-mode`

### Reset (`base/reset.css`)

Provides consistent styling across browsers: border-box sizing, margin/padding normalization, core body defaults, image normalization, form element improvements, and reduced-motion support.

## Layout Components

### Container (`layout/container.css`)

- `.container`: Responsive container with max-widths at breakpoints (640px, 768px, 1024px, 1280px)
- `.container-fluid`: Full-width container
- `.section-sm`, `.section-lg`: Section padding variations (note: the bare `.section` class is owned by `ink-signal.css` as the ruled-section idiom)

### Grid (`layout/grid.css`)

- `.grid`, `.grid-cols-*` (1–12), responsive `sm:`/`md:`/`lg:`/`xl:` variants, `.col-span-*`, row templates, auto-flow control, and a specialized content grid

## UI Components

### Ink + Signal Idioms (`components/ink-signal.css`)

The vocabulary of the design system, in one place. Every class belongs to exactly one voice — document (Archivo/Newsreader) or data (Spline Sans Mono):

- **Data voice**: `.data-voice`, `.eyebrow` (accent mono kicker; `--ink`, `--faint` variants), `.dateline` / `.dateline-kind`, `.figure-accent`
- **Rules**: `.rule-nameplate` (5px), `.rule-masthead` (4px), `.rule-section` (3px), `.rule-hairline` (1px) — ink-coloured border-tops
- **Nameplate**: `.nameplate` (the masthead wordmark, wide heavy Archivo caps), `.nameplate--sm` (inner-page masthead)
- **Section**: `.section` (3px ink rule + spacing — the standard content module), `.section-head`, `.section-no`, `.section-title`
- **Ledger** — the universal record idiom: `.ledger`, `.ledger-row` (hanging mono key column left, serif content right, hairline per row; `--meta` three-column variant), `.ledger-key` / `--current`, `.ledger-status`, `.ledger-content`, `.ledger-title`, `.ledger-desc`, `.ledger-meta`. Column widths tune via `--ledger-key-w` / `--ledger-meta-w`
- **Chips**: `.chip` (flat, square, 1px border, mono caps, `.chip-count` appended; `.chip--selected` = solid ink fill), `.chip-more` (accent mono text action), `.chip-row`
- **Data as ornament**: `.year-bars` / `.year-bar` / `.year-bar--current` (output distribution as ink bars, accent on the newest year), `.hbar` / `.hbar--current` (horizontal proportion meter — a hard-stop `linear-gradient` fill via `--pct`, the **only** gradient in the system), `.key-terms` (frequency-scaled term cloud), `.stat-ledger` / `.stat-row` / `.stat-value`
- **Editorial**: `.drop-cap` (accent Archivo initial), `.plate` / `.plate-caption` (images as plates: 1px border, square, serif-italic caption), `.standfirst` (serif-italic deck)
- **Pagination**: `.pager` / `.pager-item` (mono, square, ink fill on the current page)

### Buttons (`components/buttons.css`)

Buttons speak the **data voice**: Spline Sans Mono, uppercase, letterspaced, square corners, no shadow, no lift, no ripple. Transitions are colour-only:

- `.btn-primary`: Solid **ink** (cream on midnight) — the standard primary action
- `.btn-accent`: Solid **pine** — the single hero CTA per screen, used by scarcity
- `.btn-secondary`: Flat outlined control
- `.btn-outline-primary`, `.btn-outline-secondary`, `.btn-outline-accent`: Outlines that fill on hover
- `.btn-ghost`: Minimal tertiary; `.btn-danger`: destructive actions
- `.btn-glass`: **Neutralised legacy variant** — now a flat outlined control (no backdrop-filter)
- **Sizes**: `.btn-sm`, `.btn-lg`; **layout**: `.btn-block`, `.btn-icon-only`
- **States**: `.btn-loading`, disabled opacity; focus-visible uses an accent outline
- **Accessibility**: High-contrast border widening, reduced-motion support

### Cards (`components/cards.css`)

`.card` is a **flat warm-paper tile**: `--color-surface-elevated` background, 1px hairline border, square corners, no shadow. Hover darkens the border only — no lift. Many former card grids have been reworked into ledger rows; `.card` remains the bounded-tile primitive for genuinely distinct entities (featured items, project plates).

- **Elements**: `.card-image` (bordered), `.card-body`, `.card-title` (Newsreader), `.card-subtitle` (mono caps), `.card-text`, `.card-footer`
- **Variations**: `.card-compact`, `.card-horizontal`; `.card-shadow` / `.card-shadow-lg` survive as no-ops (`box-shadow: none`)
- **`.card-link`**: Mono arrow that slides in on hover
- **`.card-accent-border`**: Reading-surface tile whose border warms to pine on hover
- **Grid**: `.card-grid` with responsive columns

### Entity Cards (`components/entity-cards.css`) — route-scoped

Shared styles for list-based entities (Publications, Communications). `.entity-card` is a flat `--color-surface` tile with a 1px border and square corners; hover warms the border toward the accent and the title to pine — no lift, no zoom, no shadow. Core classes: `.entity-list-item`, `.entity-card`, `.entity-grid`, `.entity-image-container` / `.entity-cover-image`, `.entity-content`, `.entity-meta` / `.entity-type` / `.entity-language`, `.entity-title` / `.entity-title-link`, `.entity-details` / `.entity-abstract`, `.entity-tags` / `.entity-links` / `.entity-link-btn`.

### Bibliography (`components/bibliography.css`) — route-scoped

`.bib-row` — the finding-aid ledger entry shared by `/publications` and `/conference-activity`: a fixed `[year] [cover] [body] [actions]` grid with hairlines drawn by the parent list. Tunables: `--bib-year-w`, `--bib-cover-w`, `--bib-plate-aspect`.

### Panels (`components/panels.css`)

Flat ruled sidebar modules (pair with `.glass-panel`, which now supplies a flat paper surface):

- `.panel`: Square, flat, border-colour transition only — the earlier gradient overlays and animated accent lines are gone
- `.panel-header` / `.panel-content` / `.panel-footer` separated by hairlines
- `.panel-title`: The data voice — mono, letterspaced caps
- **Content elements**: `.no-items`, `.item-list`, `.view-all-container`
- **Filter systems**: `.year-filters`, `.filter-button`, `.type-filters-section`

### Activity List (`components/activity-list.css`) — route-scoped

The `/activities` page as a dated press column: mono log eyebrow over an Archivo masthead, year-grouped entries as hairline-separated rows (mono date/kind column, optional image plate, serif title + summary, mono tag run), and a ruled browse-by-year/tag aside.

### Filters (`components/filters.css`) — route-scoped

Shared `filter-*` classes for the filter sidebar components: mono caps section labels over hairlines, flat chip-style controls.

### Navigation Utilities (`components/navigation-utilities.css`)

Shared utilities used across navigation components: `.sr-only`, focus-visible styles, reduced-motion and high-contrast support. Navigation itself (Header, DesktopNav, NavLink, DropdownMenu, MobileMenu, ThemeToggle, etc.) is styled with component-scoped CSS in the Svelte files.

### Animations (`components/animations.css`)

CSS-only animation system. Motion is nearly none by design — instant state changes, at most a short fade on entry:

#### Mount-time entry

- **`.page-enter`** / **`.body-enter`**: Subtle fade-up on page load
- **`.heading-enter`**, **`.card-enter`**, **`.micro-enter`**: Same parametric keyframe with contextual distances/durations
- **`.fade-in-up`**: Mount-time entrance for lazily loaded sections (e.g. deferred CV batches)
- **`.stagger-1`** through **`.stagger-6`**: Sequential delay utilities (`backwards` fill keeps delayed elements hidden until they start)
- **`.hero-entrance`**, **`.hero-sequence-photo/-title/-subtitle/-actions`**: Detail-page and profile hero sequences

#### Scroll-driven entry (CSS-only)

- **`.scroll-reveal`**: Fade-up on viewport entry via `animation-timeline: view()`
- **`.scroll-reveal-scale`**: Subtle scale-in for cards and images
- **`.grid-stagger`**: Staggered reveal of grid children via `:nth-child()` delays
- **Browser support**: Chrome 115+, Firefox 110+; graceful fallback shows content immediately elsewhere

#### Accessibility & Performance

- All animations are disabled under `prefers-reduced-motion: reduce`
- GPU-friendly (`opacity`/`transform` only, `will-change` on scroll-driven classes); reduced distances on mobile

## Page-Specific Styles

There is intentionally no `styles/pages/` directory. Page-level design lives alongside its Svelte component so styles ship only where they are used. Shared presentation is centralized in the route-scoped modules above (`entity-cards.css`, `bibliography.css`, `activity-list.css`, `filters.css`). The `ContentBody` and `PageHeader` components (`src/lib/components/common/`) centralize common content-area and page-header styling with component-scoped CSS.

## Utilities

### Spacing (`utilities/spacing.css`)

Margin (`.m-*`, `.mx-*`, …), padding (`.p-*`, `.px-*`, …), gap (`.gap-*`), and `.space-y-*` utilities on the 8-point grid, with `sm:`/`md:`/`lg:` variants. Values map to the semantic tokens.

### Colors (`utilities/colors.css`)

- **Text**: `.text-primary`, `.text-secondary`, `.text-accent`, `.text-highlight`, `.text-success`, `.text-danger`, `.text-muted`, `.text-emphasis`, etc.
- **Backgrounds**: `.bg-*` including `.bg-surface`, `.bg-surface-alt`, and opacity variants (`.bg-primary-10`, …)
- **Borders**: `.border-*` colour and width/side utilities
- **Interactive states** and responsive variants throughout

### Flexbox (`utilities/flex.css`)

`.flex`/`.inline-flex`, direction, wrap, grow/shrink, justify/align/order utilities with responsive variants.

### Layout (`utilities/layout.css`)

Display (`.block`, `.hidden`, …) and overflow utilities, plus `.sveltekit-body-container`; responsive variants.

### Sizing (`utilities/sizing.css`)

Width/height (`.w-full`, `.h-screen`, …) and `.max-w-*` utilities (including `.max-w-prose`); responsive variants.

### Border Radius (`utilities/border-radius.css`)

`.rounded-*` classes still exist, but because every radius token is `0`, they all render square. `.rounded-full` is the only meaningful class — reserve it for genuinely circular micro-controls. Do not reach for these classes in new code.

### Shadows (`utilities/shadows.css`)

`.shadow-*` and `.hover:shadow-*` classes still exist for compatibility, but every shadow token resolves to `none`, so they are all no-ops. Do not use shadows for depth — draw a rule or strengthen a border instead.

### Transforms (`utilities/transforms.css`)

Scale, translate, rotate, skew, and origin utilities with hover/focus and responsive variants.

### Transitions (`utilities/transitions.css`)

`.transition-*` type, `.duration-*`, and `.ease-*` utilities with responsive variants.

### Images (`utilities/images.css`)

`.responsive-image`, aspect ratios (`.aspect-square`, `.aspect-book`, …), object-fit, image containers, loading states, and component-specific image classes. Prefer the `.plate` idiom for content imagery (scans, covers, photos).

### Glassmorphism (`utilities/glassmorphism.css`) — legacy naming, neutralised

Glass does not exist in Ink + Signal: no `backdrop-filter`, no blur, no translucency, no glow. This file survives because the `.glass-*` class names are still referenced throughout the codebase, but every class now renders a **flat surface** and the names are slated for renaming:

- `.glass`, `.glass-light/-medium/-heavy`, `.glass-frosted`, `.glass-primary`: Flat `--color-surface` tile with a 1px border
- `.glass-card`, `.glass-panel`, `.glass-panel-light`, `.glass-sub-card`: The workhorse paper/film tiles — flat background, hairline border, square corners; `.glass-card` gets a border-colour hover only
- `.glass-nav`: Solid page-ground masthead surface with a hairline base rule
- `.glass-button` (and its `.btn-*` combos): Square flat ink/paper control
- `.glass-blur-*`: Explicit no-ops (`backdrop-filter: none`)
- `.glass-section-panel`: Transparent — content sits directly on the page ground
- `.glass-animate`: Border-colour transition only

New code should prefer the idiom classes (`.ledger`, `.section`, `.chip`, `.plate`) or `.card` over any `.glass-*` name.

### Z-Index (`utilities/z-index.css`)

Numeric (`.z-0` … `.z-50`) and semantic (`.z-dropdown`, `.z-modal`, `.z-tooltip`, …) stacking utilities backed by the `--z-*` tokens.

## Class Naming Convention

- **Component**: `.component-name`; **element**: `.component-name-element`; **modifier**: `.component-name--modifier`
- **Utility**: `.utility-value` (e.g., `.text-center`, `.p-4`)
- **Responsive**: `.breakpoint:utility-value` (e.g., `.md:text-lg`)

## Responsive Approach

Mobile-first, using PostCSS Custom Media queries.

### Breakpoints

Defined in `src/styles/base/media.css`: `--sm` 640px, `--md` 768px, `--lg` 1024px, `--xl` 1280px, `--2xl` 1536px (plus the `-down` max-width set).

### Writing Media Queries

**IMPORTANT**: Do NOT use CSS variables (e.g., `var(--breakpoint-md)`) inside media queries — browsers do not support this. Use the PostCSS Custom Media syntax:

```css
/* Correct usage */
@media (--md) {
  .my-component {
    padding: var(--space-8);
  }
}

/* Invalid — DO NOT USE */
@media (min-width: var(--breakpoint-md)) { ... }
```

- **Base styles**: Designed for mobile first (no media query)
- **Progressive enhancement**: `@media (--breakpoint)` for larger screens
- **Utility responsiveness**: Most utilities take breakpoint prefixes (e.g., `.md:text-lg`)

## Best Practices

1. **Use existing idioms, components, and utilities** before writing new CSS — the ledger, section rules, and chips cover most record/list/label needs
2. **Keep the two voices strictly cast**: mono is metadata only, never body copy; serif is never used for machine-indexed strings
3. **Use CSS variables** for colors, spacing, and typography; use `color-mix()` for transparency
4. **Draw hierarchy in rules** (5px/3px/1px), not in shadows, radii, or size jumps
5. **Keep the accent scarce**: pine marks the current/active/primary thing — demote occurrences if it appears more than a handful of times per screen
6. **Avoid inline styles and `!important`** (exceptions: third-party overrides and `prefers-reduced-motion` blocks)
7. **Test both themes**: midnight is a first-class microfilm negative, not an afterthought
8. **Use motion sparingly** and respect `prefers-reduced-motion`
9. **For list-based content**, use the ledger idiom or `entity-cards.css` / `bibliography.css` rather than bespoke card CSS in components

## Performance Considerations

- **Modular imports**: The global stylesheet stays small; route-scoped CSS (`entity-cards`, `activity-list`, `bibliography`, `filters`) code-splits with its components
- **Utility-first approach**: Reduces CSS bloat through reusable classes
- **CSS variables**: Enable theming without duplicate rule sets (dark mode is a token remap)
- **Animation performance**: Entry animations use `transform`/`opacity` only; scroll effects are native CSS (`animation-timeline: view()`), no JavaScript observers
- **Print optimization**: Print-specific styles for academic content
- **Reduced motion support**: Respected globally
