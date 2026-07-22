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
- **Route-scoped CSS**: `components/entity-cards.css`, `components/activity-list.css`, and `components/bibliography.css` are **not** imported globally — they are imported by the components that own them, so they code-split per route and keep the render-blocking global stylesheet small.
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

1. **Foundation tokens** (`--sys-*`): Raw palette values shared by several semantic tokens or by the dark-theme overrides in `dark.css`
2. **Semantic tokens** (`--color-*`, `--space-*`, `--font-*`, etc.): Meaningful names for usage context — always prefer these in components. Single-consumer values are defined directly on the semantic token (no one-off `--sys-*` indirection)

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

Every `--border-radius-*` token (`--border-radius`, `-sm`) resolves to `0`. The only exception is `--border-radius-full` (9999px), retained for genuinely circular micro-controls (slider thumbs, spinners, status dots) that opt in explicitly.

#### Shadows — shadows do not exist

There are no `--shadow-*` tokens. Depth comes from ink density and rule weight, not elevation — never add `box-shadow` to new styles.

#### Spacing System (8-point grid)

- **Semantic scale**: `--space-3xs` through `--space-4xl`, plus `--space-7xl`
- **Numeric scale**: `--space-px` through `--space-48`
- **Tight variant**: `--space-xl-tight` (28px)
- **Reading rhythm**: `--space-reading`, `--space-reading-loose` for detail-page sections

#### Typography Tokens — two voices

- **Font families**: `--font-family-display` (Archivo — nameplate, h1–h3, section heads, big data numbers), `--font-family-serif` (Newsreader — all prose, h4–h5, captions, italics; the reading default), `--font-family-mono` (Spline Sans Mono — the data voice: eyebrows, datelines, counts, nav, chips, DOIs, pagination; **never body copy**). `--font-family-sans` is a neutral system stack kept only as a form-control fallback.
- **Archivo width axis**: `--font-variation-nameplate/-display/-display-md/-display-sm/-wordmark` presets for the wide, heavy display cut
- **Type scale**: Fluid `clamp()` steps with forked ratios — Minor Third (1.2) for body/UI, Major Third (1.25) for display; plus `--font-size-nameplate` and `--font-size-display` for mastheads and index heroes
- **Semantic sizes**: `--font-size-2xs` through `--font-size-5xl`, `--font-size-heading-1..6`
- **Line heights / tracking / weights**: `--line-height-*`, `--letter-spacing-*` and contextual aliases (`--tracking-eyebrow`, etc.)

#### Focus Ring (Accessibility)

- **`--focus-ring`**: Accent-coloured focus indicator (pine signals the keyboard target)

#### Animation & Transitions

- **Duration scale**: `--duration-instant` (75ms) through `--duration-slower` (700ms); decorative motion is essentially retired
- **Easing**: `--ease-out`, `--ease-in-out`, `--ease-out-quart` — smooth decelerations only, nothing overshoots
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
- `.btn-surface`: **Neutralised legacy variant** (formerly `.btn-glass`) — now a flat outlined control (no backdrop-filter)
- **Sizes**: `.btn-sm`, `.btn-lg`; **layout**: `.btn-block`, `.btn-icon-only`
- **States**: `.btn-loading`, disabled opacity; focus-visible uses an accent outline
- **Accessibility**: High-contrast border widening, reduced-motion support

### Cards (`components/cards.css`)

The bounded-tile `.card` primitive (flat warm-paper tile: 1px hairline border, square corners, no shadow, border-colour hover only) is **owned by `Card.svelte`** (`src/lib/components/common/`) as component-scoped CSS, including its `.card-image` / `.card-body` / `.card-title` / `.card-subtitle` elements, the `.card--editorial` lead variant, and dark-mode rules. Many former card grids have been reworked into ledger rows.

This sheet only carries the one shared card class used outside that component:

- **`.card-accent-border`**: Reading-surface tile whose border warms to pine on hover (used by `RelevantItemCard`, `LatestActivities`)

### Entity Cards (`components/entity-cards.css`) — route-scoped

Shared styles for list-based entities (Publications, Communications). `.entity-card` is a flat `--color-surface` tile with a 1px border and square corners; hover warms the border toward the accent and the title to pine — no lift, no zoom, no shadow. Core classes: `.entity-list-item`, `.entity-card`, `.entity-grid`, `.entity-image-container` / `.entity-cover-image`, `.entity-content`, `.entity-meta` / `.entity-type` / `.entity-language`, `.entity-title` / `.entity-title-link`, `.entity-details` / `.entity-abstract`, `.entity-tags` / `.entity-links` / `.entity-link-btn`.

### Bibliography (`components/bibliography.css`) — route-scoped

`.bib-row` — the finding-aid ledger entry shared by `/publications` and `/conference-activity`: a fixed `[year] [cover] [body] [actions]` grid with hairlines drawn by the parent list. Tunables: `--bib-year-w`, `--bib-cover-w`, `--bib-plate-aspect`.

### Panels (`components/panels.css`) — route-scoped

Flat ruled sidebar modules (pair with `.surface-panel`, which supplies a flat paper surface). Imported by `PanelBase` (and transitively by the other panel components) rather than bundled globally:

- `.panel`: Square, flat, border-colour transition only — the earlier gradient overlays and animated accent lines are gone
- `.panel-header` / `.panel-content` / `.panel-footer` separated by hairlines
- `.panel-title`: The data voice — mono, letterspaced caps
- **Content elements**: `.no-items`, `.item-list`, `.view-all-container`
- **Filter systems**: `.year-filters`, `.filter-button`, `.type-filters-container`

### Activity List (`components/activity-list.css`) — route-scoped

The `/activities` page as a dated press column: mono log eyebrow over an Archivo masthead, year-grouped entries as hairline-separated rows (mono date/kind column, optional image plate, serif title + summary, mono tag run), and a ruled browse-by-year/tag aside.

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

There is intentionally no `styles/pages/` directory. Page-level design lives alongside its Svelte component so styles ship only where they are used. Shared presentation is centralized in the route-scoped modules above (`entity-cards.css`, `bibliography.css`, `activity-list.css`). The `ContentBody` and `PageHeader` components (`src/lib/components/common/`) centralize common content-area and page-header styling with component-scoped CSS.

## Utilities

The utility sheets are intentionally lean: each class exists because markup actually uses it. Add new utilities only alongside real usage (and delete them again when the last usage goes).

### Spacing (`utilities/spacing.css`)

Margin (`.mx-auto`, `.mt-*`, `.mb-*`, `.ml-*`), padding (`.p-*`, `.px-4`, `.py-8`), gap (`.gap-2/-4/-6`), and `.space-y-3` utilities on the 8-point grid. Values map to the semantic tokens.

### Colors (`utilities/colors.css`)

Text colour utilities only: `.text-primary`, `.text-light`, `.text-muted`, `.text-emphasis`.

### Flexbox (`utilities/flex.css`)

`.flex`, `.flex-col`, `.flex-1`, `.justify-center`, `.justify-between`, `.items-center`, `.items-baseline`, plus the `sm:` variants in use (`.sm:flex-row`, `.sm:justify-between`, `.sm:items-center`).

### Layout (`utilities/layout.css`)

`.block`, `.inline-block`, and `.sveltekit-body-container`.

### Sizing (`utilities/sizing.css`)

`.w-full`, fixed CV-column widths (`.w-20`, `.w-60`), `.h-auto`, and the `.max-w-md/-6xl/-7xl` widths in use.

### Images (`utilities/images.css`)

`.responsive-image`, `.image-container` (with its hover zoom), and `.hero-image`. Prefer the `.plate` idiom for content imagery (scans, covers, photos).

### Surfaces (`utilities/surfaces.css`)

Flat surface utilities — formerly the glassmorphism classes, neutralised for Ink + Signal (no `backdrop-filter`, no blur, no translucency, no glow) and since renamed `.glass-*` → `.surface-*`. Every class renders a **flat surface**:

- `.surface`, `.surface-light/-medium/-heavy`, `.surface-frosted`, `.surface-primary`: Flat `--color-surface` tile with a 1px border
- `.surface-card`, `.surface-panel`, `.surface-panel-light`: The workhorse paper/film tiles — flat background, hairline border, square corners; `.surface-card` gets a border-colour hover only
- `.surface-button` (and its `.btn-*` combos): Square flat ink/paper control
- `.surface-animate`: Border-colour transition helper (IframeRenderer variants)

New code should prefer the idiom classes (`.ledger`, `.section`, `.chip`, `.plate`) or `.card` over the `.surface-*` names.

### Z-Index

There is no z-index utility sheet; layer with the `--z-*` tokens (`--z-dropdown`, `--z-modal`, `--z-tooltip`, …) in component styles.

## Class Naming Convention

- **Component**: `.component-name`; **element**: `.component-name-element`; **modifier**: `.component-name--modifier`
- **Utility**: `.utility-value` (e.g., `.text-center`, `.p-4`)
- **Responsive**: `.breakpoint:utility-value` (e.g., `.md:text-lg`)

## Responsive Approach

Mobile-first, using PostCSS Custom Media queries.

### Breakpoints

Defined in `src/styles/base/media.css`: `--sm` 640px, `--md` 768px, `--lg` 1024px, `--xl` 1280px, `--2xl` 1536px (plus the `-down` max-width set).

### Writing Media Queries

**IMPORTANT**: Do NOT use CSS variables inside media queries — browsers do not support this (there are deliberately no `--breakpoint-*` tokens). Use the PostCSS Custom Media syntax:

```css
/* Correct usage */
@media (--md) {
  .my-component {
    padding: var(--space-8);
  }
}

/* Invalid — DO NOT USE */
@media (min-width: var(--some-token)) { ... }
```

- **Base styles**: Designed for mobile first (no media query)
- **Progressive enhancement**: `@media (--breakpoint)` for larger screens
- **Utility responsiveness**: Some utilities have breakpoint-prefixed variants (e.g., `.sm:flex-row`); only variants with real usage are kept

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
