# Refactoring Roadmap

Prioritized improvements for codebase quality, maintainability, and design system compliance.

## Status Legend

- [x] Completed
- [ ] Pending

---

## Phase 1: Quick Wins (< 1 hour each)

### Build & Cleanup

- [x] **Remove unused `date-fns` dependency** - Zero imports across codebase, ~13KB wasted
- [x] **Delete `tmpclaude-*` temp files** - 4 stale temp files in `src/lib/` and `.github/`
- [x] **Remove redundant `date-formatter.d.ts`** - Manual `.d.ts` unnecessary for `.ts` source

### CSS Design System Compliance

- [x] **Replace hardcoded `#ffffff` in PageIntro.svelte** - Use `var(--color-white)` instead
- [x] **Replace hardcoded blur values** - `blur(8px)` / `blur(6px)` replaced with `var(--glass-blur-sm)` in ProjectYears, CareerTimeline, communications detail page
- [x] **Replace `rgba()` with `color-mix()`** - Dark mode gradients in communications detail page now use `color-mix(in srgb, var(--sys-color-neutral-900) N%, transparent)`

### Utilities

- [ ] **Add `window.gtag` existence check** - `performanceMonitor.ts` calls `window.gtag()` without checking if it exists, which can throw if GTM hasn't loaded yet.

### Code Deduplication

- [x] **Consolidate date formatters** - Removed duplicate `formatFullDate()` from `citationFormatter.ts`, now imports shared `formatDisplayDate()` from `date-formatter.ts`

### Media Query Standardization

- [x] **Replace all hardcoded pixel breakpoints with PostCSS custom media** - Fixed 15+ instances across:
  - Filter components (5 files): `max-width: 1024px` -> `--lg-down`
  - `UniversalFiltersSidebar.svelte`: `min-width: 1025px` -> `--lg`
  - `MediaPlayer.svelte`: `640px` -> `--sm-down`, `768px` -> `--md`, `1024px` -> `--lg`
  - `Footer.svelte`: `480px` -> `--xs-down`
  - `RelatedItemCard.svelte`: `640px` -> `--sm-down`
  - `HeroImageDisplay.svelte`: `639px` -> `--sm-down`
  - `publications/+page.svelte`: `1024px` -> `--lg-down`
  - `cards.css`: `640px` -> `--sm`, `768px` -> `--md`, `1024px` -> `--lg`
  - `animations.css`: `767px` -> `--md-down`

---

## Phase 2: High Value (2-4 hours each)

### Data Layer

- [ ] **Create `dataAggregation.ts` utility** - Extract duplicated sorting/grouping logic (~140 lines across index files) into reusable functions:
  ```typescript
  export function sortByDate<T extends { dateISO: string }>(items: T[]): T[]
  export function groupByYear<T extends { year: number }>(items: T[]): Record<number, T[]>
  export function groupByField<T>(items: T[], field: keyof T): Record<string, T[]>
  export function extractUnique<T, K extends keyof T>(items: T[], field: K): T[K][]
  ```

- [ ] **Migrate all `index.ts` to `loadData()` utility** - 11 of 20 data index files use manual aggregation patterns instead of the shared `loadData()` utility in `dataLoader.ts`. Consolidating would eliminate ~300 lines of boilerplate.
  - Files to migrate: `activities/`, `communications/events/`, `communications/panels/`, `publications/`, `research-roles/`, `affiliations/`, `digital-humanities/`, `teaching/`
  - Consider adding optional `transform` callback to `loadData()` for publications' `sourceDirType` logic

- [ ] **Migrate teaching and research-roles to scalable data patterns** - `teaching/index.ts` uses a hardcoded array with inline type definition (only data category not using glob). `research-roles/index.ts` uses manual array of imports — adding items requires code changes. Migrate both to individual files + `loadData()`.

- [ ] **Standardize type inconsistencies** - 11 identified issues:
  - `date` fields: Some use `string`, others `Date`, others ISO format strings
  - `ongoing` field: Represented as `null` vs `undefined` vs `'present'` string
  - `language` type: `string` in Publication vs `string | string[]` in Communication
  - `Fieldwork` type: Missing `dateISO` field (year-only sorting)
  - `Communication` has both `authors` and `coAuthors` (unclear semantics)
  - `TeachingExperience` type defined inline in `teaching/index.ts`, not in `src/lib/types/`

### Component Deduplication

- [ ] **Extract shared MetaTags logic** - 3 MetaTags components (`publications/`, `communications/`, `activities/`) share 85% identical code (~784 lines total). Extract shared `createConditionalTag()`, `getFullUrl()`, COinS generation, and `MetaTag` interface into a `$lib/utils/metaTags.ts` utility.

- [ ] **Create shared filter CSS mixin** - 7 filter components each duplicate ~80-100 lines of identical card/section CSS. Extract into a shared stylesheet imported by each filter component.

### Routing & SEO

- [ ] **Add JSON-LD structured data to communications and DH detail pages** - Currently missing entity schemas (only publications and activities have them).

- [ ] **Extract JSON-LD interfaces to shared types** - 7 JSON-LD interfaces duplicated across `publications/[id]/+page.ts`, `activities/[id]/+page.ts`, and root `+page.ts` (~150 lines). Move to `$lib/types/jsonld.ts`.

### CSS Remaining Issues

- [ ] **Replace hardcoded spacing values** - Some components use raw pixel/em values (`max-width: 320px`, `padding: 0.35em 0.75em`) instead of design tokens (`var(--space-*)`, `var(--font-size-*)`).

### Visualization Colors

- [ ] **Replace hardcoded hex colors in visualization components** - ECharts and MapVisualization components use raw hex colors (`#9a4419`, `#c4a35a`, `#fff`, etc.) instead of CSS variables. Note: Some of these are in JS config objects passed to ECharts/MapLibre, where CSS variables can't be used directly - consider a shared color constants file that mirrors the design tokens.

---

## Phase 3: Structural (1-2 days each)

### Component Architecture

- [ ] **Split `Header.svelte` (347 lines)** - Currently handles 6+ concerns: nav data, dropdown state, mobile menu, keyboard navigation, click-outside handling, resize observation. Extract nav data to `src/lib/data/navigation.ts`, extract dropdown and mobile menu managers to separate components or composables.

- [ ] **Move CV components from routes to lib** - 14 components in `src/routes/cv/components/` should live in `src/lib/components/cv/`. CV formatter utility in `src/routes/cv/utils/` should move to `src/lib/utils/`.

- [ ] **Fix atomic design misplacements** - Several components are in wrong categories:
  | Component | Current | Should Be |
  |-----------|---------|-----------|
  | `ToggleButton.svelte` | `common/` | `atoms/` |
  | `Breadcrumb.svelte` | `common/` | `atoms/` |
  | `NetworkStatusIndicator.svelte` | `common/` | `atoms/` |
  | 7 `FilterSection*` components | `filters/` | `molecules/filters/` |

- [ ] **Type `RelatedItemsList` properly** - Replace `any[]` typing for `allItems` and `any` for `filterValue` with proper generic types or a discriminated union.

### Layout & Routing

- [ ] **Refactor root layout (`+layout.svelte`, 266 lines)** - Mixes 4+ concerns: GTM initialization (~70 lines), network monitoring, animation state, JSON-LD injection. Extract GTM into a utility, network monitoring into a component, and simplify.

- [ ] **Consolidate JSON-LD injection methods** - 3 different approaches used inconsistently: `<script>` tag in layout, `<svelte:head>`, and manual injection. Standardize on one pattern.

- [ ] **Convert 5 static research project pages to dynamic route** - Currently individual page files that could be data-driven like other content types.

### State Management

- [ ] **Consolidate dual global state API** - `globalState.svelte.ts` exports both `animationsEnabledStore` (Svelte store) and `getGlobalState()` (rune-based). Migrate to a single rune-based API.

---

## Phase 4: Foundational (when time permits)

- [ ] **Add Playwright E2E tests** - Full Playwright config exists with empty `tests/` directory. Add smoke tests for key pages and filter interactions.

- [ ] **Consolidate icon libraries** - Currently uses `@iconify/svelte`, `svelte-fa`, and `@fortawesome/free-solid-svg-icons`. Could consolidate to just `@iconify/svelte` which covers all icon sets.

---

## Conventions Enforced

These conventions should be followed for all future code:

| Rule | Example |
|------|---------|
| Use CSS variables | `var(--color-primary)` not `#9a4419` |
| Use `color-mix()` for transparency | `color-mix(in srgb, var(--color-primary) 50%, transparent)` not `rgba()` |
| Use PostCSS custom media | `@media (--md)` not `@media (min-width: 768px)` |
| Include webkit backdrop-filter | `-webkit-backdrop-filter` alongside `backdrop-filter` |
| Use glass blur tokens | `var(--glass-blur-sm)` not `blur(8px)` |
| Svelte 5 runes only | `$props()`, `$state()`, `$derived()`, `$effect()` |
| `$lib` alias for imports | `import { x } from '$lib/utils/...'` |
