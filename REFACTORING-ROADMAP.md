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

## Priority 2: Glassmorphism CSS Extraction

**Scope**: 113 `backdrop-filter` occurrences across 32 `.svelte` component files
**Estimated savings**: 300-500 lines of CSS

- [ ] Create `.glass-section` base class with hover/dark-mode/reduced-motion variants in `src/styles/`
- [ ] Create modifier classes (`.glass-section-compact`, `.glass-section-elevated`)
- [ ] Migrate detail page inline glassmorphism styles to utility classes
- [ ] Migrate component-level glassmorphism styles to utility classes

**Why**: The same glassmorphism pattern (gradient background + backdrop-filter + border + box-shadow + hover transform + dark mode override) is copy-pasted across dozens of components. The existing `.glass-card`, `.glass-panel`, `.glass-button` classes in `glassmorphism.css` don't cover all the variants being used inline.

---

## Priority 3: CV Component Consolidation

**Files**: 19 `CV*.svelte` files in `src/lib/components/cv/` (1,156 lines total)
**Estimated savings**: ~600 lines

- [ ] Create generic `CVSection.svelte` with subsection support and snippet-based item rendering
- [ ] Refactor smaller CV components (CVAwards, CVEvents, CVInvitedTalks, etc.) to use CVSection
- [ ] Refactor larger CV components (CVPublications, CVEducation, CVResearchExperience) to use CVSection

**Why**: Most CV components follow an identical pattern: import data, filter by type/subtype, render groups with `CVEntry`. A generic section component accepting data config and render snippets would eliminate the repetition while keeping type safety.

---

## Priority 4: Detail Page Loader + JSON-LD Builder

**Files**: 4 `[id]/+page.ts` files (429 lines total)
**Estimated savings**: ~200 lines

- [ ] Create `buildJsonLd<T>()` utility in `src/lib/utils/jsonLdBuilder.ts`
- [ ] Create `createDetailPageLoader()` factory
- [ ] Refactor `publications/[id]/+page.ts` (234 lines -- largest, with type-switch for 8 publication types)
- [ ] Refactor `communications/[id]/+page.ts` (85 lines)
- [ ] Refactor `activities/[id]/+page.ts` (61 lines)
- [ ] Refactor `digital-humanities/[id]/+page.ts` (49 lines)

**Why**: All four loaders follow the same sequence: find by ID, throw 404, build JSON-LD, return data. The publication loader's 150-line type-switch is the most complex piece but can be extracted into a config-driven JSON-LD builder.

---

## Low Priority: Minor Improvements

- [ ] **Standardize data aggregation** -- Some `index.ts` files in `src/lib/data/` use custom inline `reduce()` for grouping-by-year instead of the shared `groupByYear()` utility in `dataAggregation.ts`. Align for consistency.

---

## Not Needed

The following areas were audited and found to be in good shape:

- **Svelte 5 compliance**: Zero legacy syntax (`$:`, `export let`, `createEventDispatcher`, `$$props`)
- **CSS conventions**: `color-mix()` used properly, no hardcoded colors, no `var()` in media queries, all `!important` justified
- **Dependencies**: All 29 packages actively used, strategic code-splitting configured
- **Type definitions**: All 24 type files actively referenced
- **Utility functions**: All exports used (after removing `animationConstants.ts`)
- **Store files**: All 4 stores actively imported
