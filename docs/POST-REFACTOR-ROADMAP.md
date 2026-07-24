# Post-Refactor Improvement Roadmap — July 2026

Second improvement wave, following `docs/MAINTAINABILITY-ROADMAP.md` (all of
whose non-deferred items landed on `claude/repo-maintainability-review-oc7fdh`
and successors). This roadmap consolidates a fresh four-track audit
(code health, build/bundle/assets, testing/CI, docs/SEO/content) run on
2026-07-24 against `main` at `bd073bf`. Work lands on
`claude/post-refactor-improvements-dgzjd0`.

Audit context worth recording: the runes migration is fully clean (zero
legacy syntax, zero Svelte stores, 6 justified `any`s), all five heavy
runtime dependencies are used, tree-shaken, and lazy-loaded correctly, and
`heroImage.alt` coverage is complete. The items below are what remains.

Status legend: ☐ pending · ☑ done · ◪ partial / deferred · ⊘ blocked here

---

## Phase A — Quick wins & regressions

- ☑ **A1. `preload` on the audio player.** `MediaPlayer.svelte`
  renders `<audio>` with no `preload` attribute below the fold on research
  pages; browsers may prefetch the 17–28 MB MP3s. Landed as `preload="metadata"` — duration still displays, media bytes stay unfetched until play.
- ☑ **A2. Fix `$derived(() => …)` memoization loss (4 files).** These store
  an uncached function recomputed on every template read. Convert to
  `$derived.by(…)` and drop call parentheses:
  `publications/visualisations/+page.svelte` (wordCloudPublicationIds /
  wordCloudData / wordCloudStats / bigramsData), `EChartsGanttChart.svelte`
  (yearRange, read twice per render), `EChartsHorizontalBarChart.svelte`
  (xAxisInterval), `EChartsWordCloud.svelte` (chartData).
- ☑ **A3. Sitemap correctness.** `/research/mining-the-islam-west-africa-collection`,
  `/communications`, and `/cv/timeline` are missing; derive the research
  paths from the route tree (`import.meta.glob`) so they can't drift again.
  Emit real `lastmod` from `dateISO` for publications/communications and
  omit `lastmod` where no true value exists (every URL currently claims
  "modified today" on each build).
- ☑ **A4. Restyle `static/404.html` and `static/offline.html` to
  Ink + Signal.** Both still load the retired Fraunces/Commissioner from
  Google Fonts (origins that were removed from CSP when fonts were
  self-hosted) and use the retired ink-blue accent and wrong paper value.
  Move to self-hosted Archivo/Newsreader with pine/warm-paper tokens.
- ☑ **A5. Fix `static/manifest.webmanifest`.** Description names the wrong
  institution (ZMO; siteConfig says University of Bayreuth), `theme_color`/
  `background_color` are `#000000`/`#ffffff` instead of ink/paper, the only
  icon is declared 32×32 (the file is actually 64×64), and there are no
  192/512 or maskable icons, so installability fails. Add a
  `scripts/generate-pwa-icons.mjs` (sharp) emitting an Ink + Signal
  geometric mark at 192/512/512-maskable.
- ☑ **A6. Deploy-path parity: reference-index freshness.** `deploy.yml`
  omits the `generate-reference-index.mjs --check` step that PR CI runs, so
  a stale committed index merged to main deploys unguarded.

## Phase B — Documentation accuracy

- ☑ **B1. CLAUDE.md catch-up.** The atoms/molecules/organisms lists name
  deleted components (`ItemCard`, `UniversalFiltersSidebar`, the
  `molecules/filters/` island) and miss real ones; the State
  Management / Filter Implementation sections document the deleted
  store-based API (`toggleTypeFilter` etc.) instead of the live
  `entityFilterSystem.svelte.ts`. Since CLAUDE.md steers future agent
  sessions, staleness here actively causes wrong work.
- ☑ **B2. Rewrite `src/routes/cv/README.md`.** Describes
  `src/routes/cv/components/` and `src/routes/cv/utils/` which no longer
  exist (components live in `src/lib/components/cv/`, formatter in
  `src/lib/utils/cvFormatters.ts`); lists a non-existent `CVFieldwork` and
  omits ~10 real components.
- ☑ **B3. Correct `docs/MAINTAINABILITY-ROADMAP.md` status header.** Fonts,
  the ESLint ratchet, and the home-page Person JSON-LD have all since
  landed; only responsive images and the audio re-encode remain open (both
  addressed by this roadmap: D1 landed, D4 blocked in sandbox).
- ☑ **B4. Component-docs drift.** `docs/components/atoms/Button.md` omits
  the current `surface`, `loading`, and `label` props. Update it and state
  in `docs/components/README.md` that the typed `Props` interfaces are the
  source of truth and the docs are a curated subset.

## Phase C — Code health

- ☑ **C1. De-duplicate the two visualisation pages.**
  `publications/visualisations/+page.svelte` (1,021 lines) hand-rolls
  pagination that duplicates `molecules/Pagination.svelte` (~90 lines of
  markup + ~70 lines of duplicate CSS) and shares ~11 near-identical
  ruled-section scaffolds with `conference-activity/visualisations`
  (614 lines). Add a `VizSection` wrapper (title, count, description,
  chart/placeholder snippets), lift the shared page CSS, and extract a
  `buildStackedByYear()` aggregation into `vizAggregation.ts` (both pages
  hand-build the same year→type matrix).
- ☑ **C2. Communication type labels into `typeUtils.ts`.** Two routes
  (`conference-activity/+page.svelte`, its `visualisations` sibling) inline
  their own label maps despite `typeUtils.ts` being documented as the
  single source of truth. Add chip/chart registers mirroring
  `publicationTypeLabels.ts`.
- ☑ **C3. `formatDayMonth()` in `date-formatter.ts`.** The day-month
  variant of `toLocaleDateString('en-GB', …)` is hand-inlined 6× across
  `CVConferences`, `CVInvitedTalks`, `CVEvents`, `CVMedia`; and
  `activities/+page.svelte` hand-rolls a `MONTHS[]` array for its
  "Updated 3 JUN 2025" label.
- ☑ **C4. `createSubsectionBreadcrumbs()` helper.** Four sub-pages
  hand-build breadcrumb arrays (`publications/visualisations`,
  `conference-activity/visualisations`, `conference-activity/slides`,
  `teaching/guest-lectures`) while section pages use
  `createSectionBreadcrumbs()`.
- ◪ **C5. Migrate hand-rolled CV sections to `CVSection`.** Audited all of
  them: only `CVConsulting` fit the single-list shape (migrated). The rest
  are hand-rolled for structural reasons — multiple `h4` subsections
  (Education, Teaching, Conferences, Service, Media, ResearchExperience) or
  a non-ledger idiom (Affiliations) — not gratuitous drift; left as is.
- ☑ **C6. Split `pdfCvGenerator.ts` (776 lines).** Extract the layout
  primitives (`newPage`, `checkPageBreak`, `addSection`, `drawYearLabel`,
  `renderLedgerEntry`, …) into a `pdfLayout` module and
  `classifyContactLink` into a pure function.

## Phase D — Assets & delivery

- ☑ **D1. Responsive-image `srcset` pipeline.** `HeroImageDisplay` already
  declares `sizes` but has no `srcset` (browsers ignore `sizes` alone), and
  `Card` serves full-resolution webp into 300×200 slots on every list page.
  Add a sharp-based generator (`scripts/generate-image-variants.mjs`,
  wired into `predev`/`prebuild`, output gitignored) emitting 400w/800w
  variants, plus a `srcset.ts` util consumed by `Card`, `HeroImageDisplay`,
  and `ProjectImageBanner`.
- ☑ **D2. Stop shipping production source maps.** `vite.config.ts` sets
  `sourcemap: true` and everything in `build/` deploys to Pages, so every
  chunk ships a `.map` (multi-MB for echarts/maplibre) plus `.gz`/`.br`
  copies. Switch to `sourcemap: 'hidden'` and strip `*.map` before the
  Pages upload.
- ☑ **D3. Mark audio as binary in `.gitattributes`** (`*.mp3 binary`); the
  repo pack is already ~88 MB largely from `static/notebooklm/`. Consider
  Git LFS or external hosting before the next audio update (decision, not
  taken here — LFS migration rewrites history).
- ⊘ **D4. Re-encode `static/notebooklm/` audio (~17 MB saving).** BLOCKED
  in this sandbox (no ffmpeg; a prior pure-WASM attempt was unreliable).
  `religious_activism_campus.mp3` is 28.1 MB at 160 kbps _stereo_ for
  spoken word. Locally run
  `ffmpeg -i religious_activism_campus.mp3 -ac 1 -b:a 64k out.mp3`
  (matches the other file's 64 kbps encoding, → ~11 MB), listen, replace.

## Phase E — Testing, CI & rigor

- ☑ **E1. Unit-test the untested load-bearing pure utils:**
  `bibtexGenerator.ts`, `rss.ts` (incl. the new publications feed),
  `date-formatter.ts`, `entityJsonLd.ts`, plus `languageUtils.ts` (new).
  Unit suite: 364 → 416 tests.
- ☑ **E2. Automated accessibility checks.** `@axe-core/playwright` asserts
  zero WCAG 2 A/AA violations on home, the publications list, and the CV
  (`tests-e2e/a11y.spec.ts`) — which surfaced and fixed a real
  nested-interactive defect (an `<a>` inside a `role="button"` citation, see
  below). _The `svelte/a11y-*` eslint ratchet does not apply: eslint-plugin-
  svelte v3 removed those rules; a11y now lives in the Svelte compiler, so
  `npm run check` runs `svelte-check --fail-on-warnings` and the axe E2E
  guards rendered output._
- ☑ **E3. Coverage tooling.** `@vitest/coverage-v8` + `test:coverage`
  (scoped to the pure `utils`/`data` modules).
- ☑ **E4. `npm audit` gate in CI.** `npm audit --audit-level=high` in the PR
  workflow (kept out of deploy so a fresh CVE can't block an urgent content
  push).
- ☑ **E5. Enable `noUncheckedIndexedAccess`.** Enabled; all 93 resulting
  errors fixed (restructure > `?? fallback` > guard > `!` only behind a
  proven invariant).
- ☑ **E6. Publications RSS feed.** `/publications/rss.xml` added, advertised
  via `<link rel="alternate">`, robots.txt, and the sitemap.
- ☑ **E7. `lang` markup for French titles.** `titleLangAttr()` derives a
  BCP-47 code from the `language` field; `BibliographyRow` emits `lang` on
  the title for single-language non-English works.
- ☑ **E8. Tooling odds and ends.** `test:all` aggregate script; README
  "Development & Quality Gates" section; `concurrency` group on
  `codeql.yml`.

### Accessibility defect fixed under E2

- ☑ **Nested interactive control in inline citations.**
  `reference/ItemReference.svelte` wrapped the `<a>` from `ReferenceLink` in
  a `role="button"` span (a button containing a link — WCAG 4.1.2 failure
  flagged by axe as `nested-interactive`). Restructured so the `<a>` is the
  single interactive control (it now carries the popup role, ARIA state, and
  all interaction handlers) and the span is a plain positioning wrapper.

---

## Verification gate (every phase)

```bash
npm run check     # 0 errors
npm run lint      # prettier + eslint clean
npm test          # all unit tests pass
npm run build     # static build succeeds
npm run test:e2e  # smoke suite green (phases touching routes/UI)
```
