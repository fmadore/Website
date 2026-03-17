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
- **Status:** Pending
- **Issue:** `TeachingExperience.year` is `string` (should be `number`), `Publication.dateISO` is YYYY-only, `DigitalHumanities` has no numeric year, `Fieldwork` has no `dateISO`
- **Impact:** Low — mostly cosmetic inconsistency, no runtime bugs

### 5.2 Decompose Large Components
- **Status:** Pending
- **Files:** `MediaPlayer.svelte` (~1492 lines), `PdfGenerator.svelte` (~882 lines), `CareerTimeline.svelte` (~836 lines), `HeroImageDisplay.svelte` (~826 lines), `ReferencePreviewCard.svelte` (~879 lines)
- **Impact:** Maintainability — these work correctly but are hard to reason about

### 5.3 Guard Console Statements Behind `import.meta.env.DEV`
- **Status:** Pending
- **Files:** `RangeSlider.svelte`, `CookieConsent.svelte`, `PWAUpdatePrompt.svelte`, `PdfGenerator.svelte`, `MediaPlayer.svelte`, `EChartsWordCloud.svelte`, `MapVisualization.svelte`, `PublisherLocationMap.svelte`
- **Impact:** Low — console noise in production

### 5.4 Remove Unused CSS Classes
- **Status:** Pending
- **Issue:** `.skeleton*`, `.parallax-*`, `.image-loading`, `.animate-in/out`, `.slide-in-*`, `.type-filters-section` defined but never applied
- **Impact:** Minor CSS bloat

### 5.5 Convert Static Research Pages to Dynamic Routes
- **Status:** Deferred
- **Issue:** 5 static research project pages could use a dynamic `[id]` route
- **Blocker:** Inline Svelte components in page content prevent pure data-driven approach

### 5.6 Extract Shared Filter Logic
- **Status:** Pending
- **Issue:** 5 `FilterSection*.svelte` variants share toggle, count display, search, and active state logic
- **Impact:** Maintainability
