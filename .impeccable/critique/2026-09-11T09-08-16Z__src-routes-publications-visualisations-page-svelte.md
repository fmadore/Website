---
target: visualisation routes and heavy plates (5.1 optimize)
p0_count: 0
p1_count: 2
timestamp: 2026-09-11T09-08-16Z
slug: src-routes-publications-visualisations-page-svelte
---

# V — `/impeccable optimize` — visualisation routes and heavy plates (roadmap 5.1)

Method: Lighthouse 12.6.1 mobile simulated ×3 on six routes at :4174, plus counterfactual runs blocking the MapLibre chunk, `*cartocdn*` and the ECharts chunk; four Playwright/CDP probes at 375/1440 in first-view and scrolled phases (network waterfall with encoded bytes, layout-shift census with reserved-box geometry, heap/dispose across navigations, interaction probe); chunk identities from sourcemaps.

## Evidence

Lighthouse (median): `/publications/visualisations` **51** (LCP 5.83 s, TBT 1386 ms, 2483 KiB); `/conference-activity/visualisations` **69** (836 ms, 2718 KiB); `/cv/timeline` 80; `/conference-activity` 86; talk record with map 86; slides 84. CLS 0.000 everywhere, both phases, both widths — every plate reserves its box.
Counterfactuals: pubviz with MapLibre + CARTO blocked → **86** (TBT 260, LCP 3.46, 790 KiB); with ECharts also blocked → **89** (TBT 145, 593 KiB). confviz map blocked → **82**.
Bootup on pubviz: maplibre chunk 966 KiB raw / 249 KiB transfer, **3844 ms** main thread (long tasks 578 + 329 ms); framework 1241 ms; echarts 585 KiB / 197 KiB, 255 ms. First view fetches 1702 KiB of CARTO vector tiles + glyphs (19 requests) for a map plate at **11,827 px (14.6 viewports) below the fold at 375**; the first ECharts plate sits at 2285 px; all 7 canvases + map paint before any can be seen. `/conference-activity` and the talk record load no map at first view (their gating works).
Chunks: maplibre 966; echarts+zrender 585 (echarts group, every registered series drawn); jspdf 390 (click-only, html2canvas/canvg/dompurify never fetched); **`src/lib/data/analysis` 306 KiB** on `/publications/[id]` (694 KiB static route) via `PublicationIndexRail.svelte:13,28` and on pubviz (`+page.svelte:49`); communications 223 KiB (41% abstracts) in nine routes' static graphs; d3-interactive 58 KiB captured `d3-color`, so `/cv/timeline` still downloads d3-force/zoom/drag.
Runtime: heap decelerates across navigations (no leak); ECharts and MapLibre dispose; seriation not re-run on search.

Bottleneck: the `LocationMap` plate mounts eagerly on both viz pages — 35 of pubviz's 49 lost points, 1126 of 1386 ms TBT, 2.37 s of LCP, 1693 of 2483 KiB.

## Findings

- [P1] Map plate eager on `publications/visualisations/+page.svelte:20` and the conference twin; `useMapLibre` starts on container mount. Fix: the talk record's IntersectionObserver + dynamic import pattern (`communications/[id]/+page.svelte:142`), `.state-note` `Loading map…` inside the reserved 500 px `.map-chart` box. pubviz 51 → 86, confviz 69 → 82.
- [P1] All seven ECharts plates mount eagerly (`VizChartCard` renders children immediately; `useECharts.svelte.ts:143`). Fix: a shared `inView` action gating `VizChartCard`'s children with `.state-note` `Loading chart…`; document on the guide. 86 → 89, TBT 260 → 145.
- [P2] `PublicationIndexRail` imports the whole 306 KiB analysis corpus to print 28 key terms; `analysis/index.ts:92` runs `computeCorpusAnalysis()` at module load. Fix: a generated per-record projection. 694 → 388 KiB static on ~60 record pages.
- [P2] pubviz imports the corpus for `corpusAnalysis`, `getCombinedWordCloudData`, `getCombinedBigrams` (three inputs: all/en/fr). Fix: `corpusSummary.generated.ts` (~15 KiB) behind a `gen:` script with `--check`. 724 → ~430 KiB.
- [P2] d3 grouping: `d3-color` lands in `d3-interactive` (priority 25 via `d3-transition`) so `d3-scale → d3-interpolate → d3-color` drags the interactive chunk onto `/cv/timeline`. Fix: a scale-side leaf group above it; assert in `check-bundle-budget.mjs` that node 11 excludes `d3-force`.
- [P2] No communications summaries projection; 223 KiB chunk in nine routes; `timelineData.ts:116` uses `location`, never abstract. Fix: mirror `publications/summaries`.
- [P3] Talk-record map spends ~585 KiB on CARTO labels/glyphs for one marker; `…-nolabels` styles would save ~400 KiB (a look decision).
- [P3] `communications/[id]/+page.svelte:216` `Loading map…` is a page-local `.comm-map-loading`, not `.state-note`, and lacks `role="status"`.

## Fine as is

CLS; ECharts registration (every series drawn — the lever is when, not what); jsPDF click-only; MapLibre packaging (v6 ESM, worker via `?worker&url`); pubviz cannot use summaries (needs `citedBy`, `pageCount`); disposal; interaction; fonts; analytics deferral; `/conference-activity`, slides, talk record.

## Declined by the brief

Skeleton/shimmer/spinner/fade; canvas/WebGL for SVG networks; CDN / lighter library / dropping a viz; `preconnect` to cartocdn (optimises what should not happen); scratch rebuild for ECharts.

## Open questions

1. Label-free basemap on the record map. 2. One `rootMargin` for map and charts (200 vs 400 px). 3. `/cv/timeline` on the summaries projections (publications' description would truncate).
