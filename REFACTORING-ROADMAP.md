# Refactoring Roadmap

Last updated: 2026-03-17

## Priority 1: Critical (Incorrect Data / Dead Code)

### 1.1 Fix Activity JSON-LD — Outdated Author Info

- **Status:** Done
- **File:** `src/routes/activities/[id]/+page.ts:34-43`
- **Issue:** Hardcodes "Research Fellow" at "ZMO" instead of current position (Data Curator, University of Bayreuth)
- **Fix:** Import from `siteConfig.ts` like other routes

### 1.2 Remove Dead Code — Unused File `src/lib/utils.ts`

- **Status:** Done
- **File:** `src/lib/utils.ts`
- **Issue:** `cn()` utility function never imported anywhere

### 1.3 Remove Dead Code — Unused Exports in `performanceMonitor.ts`

- **Status:** Done
- **File:** `src/lib/utils/performanceMonitor.ts`
- **Issue:** `measureResourceLoading()` (line 125) and `monitorMemoryUsage()` (line 180) exported but never called

### 1.4 Remove Dead Code — Unused Exports in `analysis/index.ts`

- **Status:** Done
- **File:** `src/lib/data/analysis/index.ts`
- **Issue:** `getCorpusStats()` and `getBigrams()` exported but never imported (note: `getCombinedBigrams` is used by the visualizations page and was kept)

### 1.5 Remove Dead Code — Unused Export in `activeItemReferenceStore.svelte.ts`

- **Status:** Done
- **File:** `src/lib/stores/activeItemReferenceStore.svelte.ts`
- **Issue:** `updateActiveReferenceId()` exported but never imported

### 1.6 Remove Unused npm Dependency — `html2canvas`

- **Status:** Done
- **Files:** `package.json:63`, `vite.config.ts:34-36`
- **Issue:** Installed and chunked but never imported in source code

### 1.7 Clean Up Commented-Out Imports

- **Status:** Done
- **Files:** `src/lib/components/panels/RelevantPublications.svelte:2,4`, `src/lib/components/panels/RelevantCommunications.svelte:2,4`
- **Issue:** `// import { onMount }` and `// import type { ... }` dead comments

## Priority 2: Data Consistency

### 2.1 Add Missing Barrel Exports in `src/lib/types/index.ts`

- **Status:** Done
- **Issue:** `DigitalHumanitiesProject` and `ResearchRole` not re-exported from barrel

### 2.2 Add Missing `allResearchRoles` Export

- **Status:** Done
- **File:** `src/lib/data/research-roles/index.ts`
- **Issue:** Only exports `researchRolesByDate`, not the unsorted `allResearchRoles` (inconsistent with all other categories)

## Priority 3: CSS Fixes

### 3.1 Fix Hardcoded `blur(6px)` in Glassmorphism

- **Status:** Done
- **File:** `src/styles/utilities/glassmorphism.css:115`
- **Issue:** `.glass-blur-sm` uses hardcoded `blur(6px)` instead of `var(--glass-blur-sm)`

## Priority 4: CI/CD

### 4.1 Re-enable Linting in CI

- **Status:** Done
- **File:** `.github/workflows/deploy.yml:47-48`
- **Issue:** Lint step commented out

### 4.2 Remove Debug Build Step

- **Status:** Done
- **File:** `.github/workflows/deploy.yml:53-54`
- **Issue:** `find build -type f | sort` clutters CI logs

## Priority 5: Future Work (Not Yet Implemented)

### 5.1 Normalize Date Types Across Data Models

- **Status:** Done (partial — only safe changes applied)
- **Fixed:** Updated `Publication.dateISO` type comment to reflect actual usage (YYYY, YYYY-MM, or YYYY-MM-DD)
- **Kept as-is (intentional):**
  - `TeachingExperience.year: string` — must support ranges like "2013-2018"
  - `DigitalHumanities.years: string` — must support open-ended ranges like "2023-"
  - `Fieldwork` without `dateISO` — `year: number` is sufficient, adding dateISO would require month/day data that doesn't exist

### 5.2 Decompose Large Components

- **Status:** Done (major components)
- **Completed:**
  - `MediaPlayer.svelte`: 1493 → 667 lines (55% reduction) — Extracted `AudioVisualization.svelte`, `ProgressBar.svelte`, `VolumeControl.svelte`
  - `PdfGenerator.svelte`: Extracted `pdfDesignTokens.ts` (FONT_SIZE, SPACING, COLORS constants)
  - `ReferencePreviewCard.svelte`: 879 → 814 lines — Extracted `cardPositioning.ts` (positioning algorithm + getItemYear)
- **Remaining (lower priority):**
  - `CareerTimeline.svelte` (~836 lines): Could extract timeline utilities and tooltip/legend sub-components
  - `HeroImageDisplay.svelte` (~826 lines): Portal+event action pattern makes extraction risky — utility-only extraction recommended
  - `PdfGenerator.svelte`: Further extraction of entry renderers possible but high complexity

### 5.3 Guard Console Statements Behind `import.meta.env.DEV`

- **Status:** Done
- **Files:** `RangeSlider.svelte`, `CookieConsent.svelte`, `PWAUpdatePrompt.svelte`, `PdfGenerator.svelte`, `MediaPlayer.svelte`, `EChartsWordCloud.svelte`, `MapVisualization.svelte`, `PublisherLocationMap.svelte`, `performanceMonitor.ts`
- **Approach:** DEV guards for error logging, empty catch for non-critical failures (analytics, PWA, fullscreen)

### 5.4 Remove Unused CSS Classes

- **Status:** Done
- **File:** `src/styles/components/animations.css`
- **Removed:** Entire legacy animation section (`.skeleton*`, `.parallax-*`, `.animate-in/out`, `.fade-in-*`, `.slide-in-*`, `.scale-in*`, `.bounce-in`, `.stagger-*`, `.reading-progress`, `.animation-complete`) plus their keyframes. Cleaned up reduced-motion and will-change selectors.

### 5.5 Convert Static Research Pages to Dynamic Routes

- **Status:** Deferred
- **Issue:** 5 static research project pages could use a dynamic `[id]` route
- **Blocker:** Inline Svelte components in page content prevent pure data-driven approach

### 5.7 Fix ESLint Errors: Migrate to resolve() from $app/paths

- **Status:** Done
- **Migrated:** All 66 violations resolved — internal links use `resolve()` from `$app/paths`, external links and prop passthroughs have eslint-disable comments
- **Rule:** `svelte/no-navigation-without-resolve` now enforced as `error`

### 5.8 Fix SEO JSON-LD in Pre-existing MetaTags Components

- **Status:** Pending
- **Issue:** `publications/MetaTags.svelte` and `communications/MetaTags.svelte` still use `{@html <script>}` for COinS/JSON-LD. Should migrate to `useJsonLdScript()` like SEO.svelte
- **Impact:** Low — works correctly, only an ESLint parse concern

### 5.6 Extract Shared Filter Logic

- **Status:** Done
- **File:** `src/lib/utils/filterHelpers.ts`
- **Extracted:** `getFilterCount()`, `getFilterLabel()`, `clearFilterSelection()` shared across Checkbox, Buttons, Chips, and Dropdown filter components. Removed duplicate inline helpers from all 4 components.
- **Not extracted:** RangeSlider stays independent (fundamentally different interaction model)
