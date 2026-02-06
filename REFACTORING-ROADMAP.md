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

- [x] **Add `window.gtag` existence check** - Made `gtag` and `dataLayer` optional in `gtag.d.ts`, added `typeof window.gtag === 'function'` checks in `performanceMonitor.ts`, and non-null assertions in `+layout.svelte` and `CookieConsent.svelte` where initialization is guaranteed.

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

- [x] **Create `dataAggregation.ts` utility** - Created `$lib/utils/dataAggregation.ts` with `sortByDate()`, `sortByYear()`, `groupByYear()`, `groupByField()`, `extractUnique()`, `extractUniqueTags()`, and `extractUniqueDelimited()`. Applied to `communications/index.ts`, `publications/index.ts`, `fieldworks/index.ts`, and `activities/index.ts`.

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

- [x] **Extract shared MetaTags logic** - Created `$lib/utils/metaTags.ts` with shared `MetaTag` interface, `createConditionalTag()`, `getFullUrl()`, `toLastFirstFormat()`, `splitNames()`, `createAuthorTags()`, `deduplicateAndFilterTags()`, and `parseAuthorName()`. Updated all 3 MetaTags components to import from shared utility. Removed ~200 lines of duplicated code.

- [x] **Create shared filter CSS** - Extracted ~470 lines of duplicated CSS (section structure, chip system, action buttons, dark mode, mobile cards, responsive) into `src/styles/components/filters.css`. Updated FilterSectionButtons, FilterSectionCheckbox, FilterSectionChips, FilterSectionDropdown, and FilterSectionRangeSlider to use the shared stylesheet.

### Routing & SEO

- [x] **Add JSON-LD structured data to communications and DH detail pages** - Added `Event` schema to `communications/[id]/+page.ts` with location, organizer, and performer data. Added `CreativeWork`/`WebSite` schema to `digital-humanities/[id]/+page.ts`. Both inject via `useJsonLdScript()`.

- [x] **Extract JSON-LD interfaces to shared types** - Created `$lib/types/jsonld.ts` with all shared interfaces (`BaseJsonLd`, `JsonLdPerson`, `JsonLdOrganization`, `JsonLdPlace`, `PersonPageJsonLd`, etc.) plus utility functions (`formatAuthor`, `formatAuthors`, `formatPlaces`, `formatJsonLdDate`, `formatOrganization`). Updated `publications/[id]/+page.ts`, `activities/[id]/+page.ts`, and root `+page.ts` to use shared types.

### CSS Remaining Issues

- [x] **Replace hardcoded spacing values** - Replaced raw pixel/em values with design tokens across 7 files: `TagCloud.svelte` (`0.35em 0.75em` → `--space-1 --space-2`), `NetworkStatusIndicator.svelte` (`320px` → `--content-width-xs`), `MediaPlayer.svelte` (`44px`/`48px` → `--space-11`/`--space-12`), `FilterSectionRangeSlider.svelte` (`40px` → `--space-10`), `entity-cards.css` (`200px`/`150px` → `--space-48`/`--space-36`).

### Visualization Colors

- [x] **Replace hardcoded hex colors in visualization components** - Extended `CHART_COLOR_FALLBACKS` in `chartColorUtils.ts` with `white`, `purple`, `pink` colors and updated `ResolvedChartColors` interface. Updated `MapVisualization.svelte` to use `CHART_COLOR_FALLBACKS` constants instead of raw hex. Updated `EChartsTreemap.svelte`, `EChartsGanttChart.svelte`, and `EChartsDoughnutChart.svelte` to use `resolvedColors.white` instead of `'#fff'`/`'#ffffff'`.

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

- [x] **Consolidate dual global state API** - Removed `animationsEnabledStore` from `globalState.svelte.ts`. Migrated `UniversalFiltersSidebar.svelte` to use `getGlobalState()` instead. Single rune-based API via `getGlobalState()` is now the only pattern.

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
