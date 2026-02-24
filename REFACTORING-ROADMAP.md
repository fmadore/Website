# Refactoring Roadmap

Prioritized list of refactoring opportunities identified during codebase review (2026-02-24).

## Status Legend

- [ ] Not started
- [x] Completed

---

## Dead Code Removed

- [x] **`src/lib/utils/animationConstants.ts`** -- Unused `DELAY_STEP` export (leftover from deprecated JS animation system)
- [x] **`src/lib/components/common/OptimizedImage.svelte`** -- 228-line component never imported anywhere

---

## Priority 1: Filter Store Factory ✅

**Files**: `src/lib/data/publications/filters.svelte.ts` (595→181 lines), `src/lib/data/communications/filters.svelte.ts` (265→148 lines), `src/lib/data/fieldworks/filters.svelte.ts` (101→deleted)
**New**: `src/lib/utils/filterStoreFactory.ts` (120 lines)
**Before**: 961 lines | **After**: 449 lines | **Saved**: 512 lines

- [x] Create `createFilterSystem<T>()` factory in `src/lib/utils/filterStoreFactory.ts`
- [x] Refactor publications filter to use factory (also removed 264 lines of dead `displayed*` stores)
- [x] Refactor communications filter to use factory (also replaced try/catch import.meta.glob with direct import)
- [x] Delete unused fieldworks filter (never imported anywhere)

---

## Priority 2: Glassmorphism CSS Extraction (Deferred)

**Scope**: 113 `backdrop-filter` occurrences across 32 `.svelte` component files
**Estimated savings**: 300-500 lines of CSS
**Status**: Analyzed, deferred due to visual regression risk

- [ ] Create `.glass-section-panel` class for the "tri-color section panel" pattern (highest-ROI target, 10+ identical instances across 8 files: AbstractSection, DetailsGrid, RelatedItemsList, CitedBy, PublicationWordCloud, Reviews, TOC sections, digital-humanities pages)
- [ ] Create modifier classes (`.glass-section-compact`, `.glass-section-elevated`)
- [ ] Migrate detail page inline glassmorphism styles to utility classes
- [ ] Migrate component-level glassmorphism styles to utility classes

**Why**: The same glassmorphism pattern (gradient background + backdrop-filter + border + box-shadow + hover transform + dark mode override) is copy-pasted across dozens of components. The existing `.glass-card`, `.glass-panel`, `.glass-button` classes in `glassmorphism.css` don't cover all the variants being used inline.

**Risk note**: These changes require careful visual regression testing across all affected components, dark mode, and reduced-motion preferences. Best done with a visual diff tool or side-by-side comparison.

---

## Priority 3: CV Component Consolidation ✅

**New**: `src/lib/components/cv/CVSection.svelte` (40 lines, generic with Svelte 5 snippets)
**Shared utility**: `formatCVYearRange()` added to `src/lib/utils/cvFormatters.ts` (replaces 5 duplicate implementations)

- [x] Create generic `CVSection.svelte` with Svelte 5 generics and snippet-based item rendering
- [x] Refactor 6 CV components to use CVSection (CVAwards, CVAppointments, CVGrants, CVDigitalHumanities, CVEvents, CVInvitedTalks)
- [x] Extract shared `formatCVYearRange()` with TypeScript overloads (numeric + string variants) — used by CVResearchExperience, CVTeaching
- [ ] Refactor remaining larger CV components (CVPublications, CVEducation) to use CVSection — these have more complex sub-grouping logic that would need additional CVSection features

---

## Priority 4: Detail Page Loader + JSON-LD Builder (Evaluated — Skipped)

**Files**: 4 `[id]/+page.ts` files (429 lines total)
**Original estimate**: ~200 lines savings
**Conclusion**: Savings are marginal. The shared pattern (find by ID + throw 404) is only 3-4 lines. JSON-LD building is unique per entity type. A factory would add indirection without meaningful reduction.

- [x] Evaluated all 4 loaders — shared pattern too small for abstraction
- The `publications/[id]/+page.ts` type-switch (8 publication types → different JSON-LD schemas) is inherently complex and wouldn't simplify with a factory

---

## Low Priority: Minor Improvements ✅

- [x] **Standardize data aggregation** -- Replaced inline `reduce()`/`sort()` with shared `sortByDate()` and `groupByYear()` from `dataAggregation.ts` in 4 files: `education/index.ts`, `peer-reviews/index.ts`, `awards/index.ts`, `media-appearances/index.ts`

---

## Not Needed

The following areas were audited and found to be in good shape:

- **Svelte 5 compliance**: Zero legacy syntax (`$:`, `export let`, `createEventDispatcher`, `$$props`)
- **CSS conventions**: `color-mix()` used properly, no hardcoded colors, no `var()` in media queries, all `!important` justified
- **Dependencies**: All 29 packages actively used, strategic code-splitting configured
- **Type definitions**: All 24 type files actively referenced
- **Utility functions**: All exports used (after removing `animationConstants.ts`)
- **Store files**: All 4 stores actively imported
