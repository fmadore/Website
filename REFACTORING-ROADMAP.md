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

- [x] **Migrate data `index.ts` files to `loadData()` utility** - Migrated all data categories to use the shared `loadData()` utility: `activities/`, `affiliations/`, `digital-humanities/`, `research-roles/`, `teaching/`, `communications/events/`, `communications/panels/`, and `publications/` (using transform callback for `sourceDirType`). Communications `index.ts` was already using `loadData()`.

- [x] **Migrate teaching and research-roles to scalable data patterns** - Split `teaching/index.ts` from hardcoded array into 3 individual files (`african-past.ts`, `francophone-west-africa.ts`, `dissertation-historique.ts`) with `loadData()` glob. Split `research-roles/researchRoles.ts` from 5 named exports into 5 individual files with `loadData()` glob. Both now follow the standard individual-file-per-item pattern.

- [x] **Move `ProfessionalAffiliation` and `TeachingExperience` types to `$lib/types/`** - Created `affiliation.ts` and `teachingExperience.ts` in `src/lib/types/`. Updated `affiliations/template.ts` to re-export from types. Added `id` field to `TeachingExperience` for `loadData()` compatibility.

- [ ] **Standardize type inconsistencies** - 10 identified issues:
  - `date` fields: Some use `string`, others `Date`, others ISO format strings
  - `ongoing` field: Represented as `null` vs `undefined` vs `'present'` string
  - `language` type: `string` in Publication vs `string | string[]` in Communication
  - `Fieldwork` type: Missing `dateISO` field (year-only sorting)
  - `Communication` has both `authors` and `coAuthors` (unclear semantics)

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

- [x] **Extract nav data from `Header.svelte`** - Moved nav items (47 lines) to `src/lib/data/navigation.ts`. Header now imports from the shared data file.

- [x] **Move CV components from routes to lib** - Moved 19 CV components from `src/routes/cv/components/` to `src/lib/components/cv/`. Moved `cvFormatters.ts` to `src/lib/utils/`. Updated all eager and lazy imports in `+page.svelte`.

- [x] **Fix atomic design misplacements** - Reorganized components to proper atomic design categories:
  | Component | From | To |
  |-----------|------|------|
  | `ToggleButton.svelte` | `common/` | `atoms/` |
  | `Breadcrumb.svelte` | `common/` | `molecules/` |
  | `NetworkStatusIndicator.svelte` | `common/` | `atoms/` |
  | 5 `FilterSection*` components | `filters/` | `molecules/filters/` |
  | `RangeSlider.svelte` | `filters/` | `atoms/` |
  | `UniversalFiltersSidebar.svelte` | `filters/` | `organisms/` |

- [x] **Type `RelatedItemsList` properly** - Replaced `any[]` with `RelatedListItem[]` interface (`{ id: string | number; [key: string]: unknown }`) and `any` filterValue with `string | number | undefined`.

### Layout & Routing

- [x] **Refactor root layout (`+layout.svelte`, 266→107 lines)** - Extracted GTM initialization to `$lib/utils/gtm.svelte.ts` (`useGtm()`) and network monitoring to `$lib/utils/networkMonitor.svelte.ts` (`useNetworkMonitor()`). Layout now delegates to utility hooks.

- [x] **Consolidate JSON-LD injection in layout** - Replaced manual `$effect()` DOM injection with `useJsonLdScript('global-json-ld', () => globalJsonLd)`, aligning with the pattern used by all detail pages.

- [ ] **Convert 5 static research project pages to dynamic route** - Deferred: research pages contain inline Svelte components (`<ItemReference>`, `<RelevantGrants>`) in template content, making data-driven rendering impractical without a fundamentally different content approach.

### State Management

- [x] **Consolidate dual global state API** - Removed `animationsEnabledStore` from `globalState.svelte.ts`. Migrated `UniversalFiltersSidebar.svelte` to use `getGlobalState()` instead. Single rune-based API via `getGlobalState()` is now the only pattern.

---

### Type Safety

- [x] **Remove unnecessary `as any` casts** - Removed 11 `as any` casts in `bibtexGenerator.ts` (7), `seoUtils.ts` (3), and `urlFilterSync.svelte.ts` (1) where the Publication type already declares the fields as optional.

- [x] **Type PDF utilities** - Added `jsPDF` type import to `pdfRichText.ts`, typed `pdf` parameter in `renderRichText()` and `measureRichTextHeight()`. Typed `PdfGenerator.svelte` jsPDF state, paragraph fragment arrays (`TextFragment[][]`), and forEach callbacks (`TextFragment`).

- [x] **Type CV lazy-loaded components** - Replaced 14 `$state<any>()` with `Component | undefined` in `cv/+page.svelte`.

- [x] **Add transform callback to `loadData()`** - Extended `loadData()` with optional `transform?: (item: T, path: string) => T` parameter. Used by `publications/index.ts` to add `sourceDirType` from path.

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
