---
target: visualisation pages (publications, conference activity, CV timeline)
total_score: 23
max_score: 40
na_heuristics:
p0_count: 2
p1_count: 3
timestamp: 2026-09-09T06-54-25Z
slug: src-routes-publications-visualisations-page-svelte
---

Method: dual-agent (A: design review · B: detector + browser evidence), plus a third isolated chart-internal pass on the `dataviz` method (palette validator run in both modes). Target family: `/publications/visualisations`, `/conference-activity/visualisations`, `/cv/timeline`; production build served statically; captures at 1280/2× and 375/3× in both themes.

## Design Health Score (as found)

| #         | Heuristic                       | Score     | Key issue                                                                                                                                           |
| --------- | ------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of system status     | 2         | Heavy plates pop in with no skeleton; the word cloud renders 2 of 100 terms and never says it failed                                                |
| 2         | Match system / real world       | 3         | Matrix and arc apparatus excellent; "Text Analysis Word Cloud", "Bigrams" unglossed                                                                 |
| 3         | User control and freedom        | 3         | Sliders/chips/search exist; no reset, no URL sync — a filtered view is not linkable                                                                 |
| 4         | Consistency and standards       | 1         | Two selected-chip idioms on one page (pine vs ink fill); Title Case vs sentence case; no section rules on a site whose section module is a 3px rule |
| 5         | Error prevention                | 3         | Language filters can empty a chart; the placeholder handles it                                                                                      |
| 6         | Recognition rather than recall  | 1         | CareerTimeline lanes keyed by colour alone to a legend ~900px away; bubble/word-cloud labels clipped                                                |
| 7         | Flexibility and efficiency      | 2         | 166 SVG marks to tab through; no section index on a 10,600px page                                                                                   |
| 8         | Aesthetic and minimalist design | 2         | Rainbow bubble pack; redundant axis names; 11-entry legend on a stacked bar                                                                         |
| 9         | Error recovery                  | 3         | Empty states are plain honest sentences                                                                                                             |
| 10        | Help and documentation          | 3         | Three plates carry a real argument for their view; eight ECharts plates carry none                                                                  |
| **Total** |                                 | **23/40** | Needs work (18/32 on the Phase 2 scale with 7 and 10 n/a)                                                                                           |

## Design specificity verdict

Split down the middle. The seriated co-occurrence matrix, the arc diagram's collaborator ledger and their serif standfirsts are unmistakably authored for this archive. Everything else is a generic analytics page wearing the site's fonts: fourteen unruled heads over fourteen bordered rectangles, a rainbow bubble pack, a rotated word cloud, doughnuts, and a filler standfirst ("offering insights into…") that PRODUCT.md forbids. The page that exists to demonstrate the computational method uses none of the system's signature data components (Key-Terms Cloud, Year-Bar Strip, Stat Ledger).

Deterministic scan: `detect.mjs` over the four targets returned 0 findings (verified non-degraded: the same binary finds the known `broken-image` false positive elsewhere). Supplementary greps: no unsanctioned shadow, gradient, `rgba()`, off-system font, pixel media query, raw letter-spacing or unguarded console. Browser pass: 20 console errors per visualisation page (`<rect width="-78">` from `NetworkArcDiagram` on first paint); axe on `/cv/timeline`: `aria-command-name` ×166, `nested-interactive` ×1, `color-contrast` ×1 (4.08:1 badge); the two visualisation routes 0 axe violations; no horizontal overflow anywhere. Visual overlays not possible (no mutable in-app tab); full-page PNGs substituted.

## Priority issues

- **[P0] Pine scarcity broken by an order of magnitude.** Four charts pass `barColor="var(--color-accent)"` (12 + 30 + 13 + 15 pine bars) plus the pine-filled LanguageToggle and the pine viz-1 series; in midnight, `--color-accent` brightens to mint while the palette does not, so those plates are the brightest objects on the page. Fix: single-series bars in ink, pine only on the newest bar (Year-Bar Strip idiom); selected chips in ink. → quieter
- **[P0] The word cloud ships broken output** (2 of 100 words, rotated, overlapping, clipped; worse at 375px). Fix: retire `EChartsWordCloud`; render the brief's Key-Terms Cloud. → distill
- **[P1] Midnight is an inversion for the data.** `--sys-viz-1..7` are declared only in `:root`; the validator fails on the film ground (viz-1 and viz-7 outside the L band, under 3:1). The plum ↔ mauve pair fails CVD separation (ΔE 5.0) and the normal-vision floor (5.9 < 15) in both modes; plum ↔ slate collapses under deutan (ΔE 1.0). Fix: re-step, validate, add a midnight block. → audit
- **[P1] CareerTimeline: no lane labels, 166 unnamed buttons inside `role="img"`, no Space key, off-palette hover filter, zebra selector that never matches, 2005 tick clipped.** → layout / harden
- **[P1] Colour cycled where it encodes nothing.** D3BubbleChart (181 bubbles over 7 hues), word cloud, and the stacked bar's positional `index % length` with five duplicate hues and a publication-type map applied to communication types. → audit
- **[P2] Sections are not sections.** `VizSection` emits a bare `<h2>`; the only divider is a 10%-opacity hairline; counts set in Archivo inside the head; dashed gridlines on every ECharts plate; doughnuts for 7 near-equal slices and for 2-slice language splits; clipped labels on the horizontal bar (130px cap) and the treemap. → typeset / layout

## Persona red flags

- Alex (power user): Enter-only activation on 166 marks; no URL state for slider/filters; two nested horizontal scrollers, the inner one hiding its scrollbar.
- Jordan (first-timer): fourteen unlabelled plates behind a filler standfirst; the first eye-catcher is a broken word cloud.
- Peer scholar mid-task wanting one number: cannot get it — no index, no anchors, the totals buried in heads a third of the way down.

## Minor observations

Redundant axis names ("Frequency" under "Tag frequency"); legend swatches on `--border-radius-full`; `ChartToolbar` at 0.6 opacity, icon-only; American "visualization" in the timeline route's SEO strings; `TimelineDetailCard` `transition: all 0.2s ease` and a 300ms fly-in; choropleth light end at 1.59:1 against the surface.

## Questions to consider

- If pine marks "the current thing", what is current about the 30th most frequent bigram?
- The site owns the Key-Terms Cloud, the Year-Bar Strip and the Stat Ledger. Why does the page that demonstrates the method use none of them?
- Fourteen plates, two of which argue for their view. Would deleting the eight that argue nothing make the record more or less convincing?
