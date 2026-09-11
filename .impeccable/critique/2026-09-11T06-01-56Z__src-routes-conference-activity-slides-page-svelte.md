---
target: section mastheads + deck gallery, bolder gate (4.3)
p0_count: 0
p1_count: 2
timestamp: 2026-09-11T06-01-56Z
slug: src-routes-conference-activity-slides-page-svelte
---

# C — `/impeccable bolder` gate + mechanical baseline — roadmap 4.3

Method: 15 family representatives captured at 1440 daylight, 4 midnight, 4 at 375; 37 routes swept for masthead metrics (sweep.json); mechanical baseline 15 routes × 2 widths × 2 themes with axe WCAG 2.2 AA (baseline.json); detector over src/ (detect.json).

## Evidence

Masthead census at 1440: `/` 80px/850/wdth 123 + 5px rule; `/publications`, `/conference-activity`, `/activities` 72px/830/wdth 112 + 4px rule + eyebrow; `/digital-humanities` 72px/830/**wdth 116, no rule**; `/research`, `/teaching` **52.7px/820, no rule, no eyebrow**; `/cv` 52.7/830 + 4px + eyebrow; `/conference-activity/slides` 52.7/820, no rule, no eyebrow; 404 52.7/830 + 5px + eyebrow.
Cross-family drift: none — all 7 research projects and 16 DH records identical (52.736px/820/wdth 116, eyebrow, plate, ledger).
Heavy-rule census (≥2px inside main, 1440): `/conference-activity/slides` is the only route with **no rule above 1px at all**.
Baseline: axe 0 violations on every route/theme/width; overflow 0; console errors 0 (404 excepted); `target="_blank"` without hidden "(opens in new tab)": 8 (`/digital-humanities/iwac` 6, `/publications/visualisations` 2); detector 1 finding (known `broken-image` false positive); mid-word heading break at 375: `/cv` h1 `Curriculu / m Vitae`.

Verdict: 4.3 candidates: `/conference-activity/slides` — plate-carrying ledger under a 4px masthead; `/research` + `/teaching` — raise the shared PageHeader masthead to the section-index tier.

## Findings

- [P1] `/conference-activity/slides` reads as a templated card grid — `slides/+page.svelte:68` `.deck-grid` + `SlideDeckCard.svelte`; zero rules above 1px; ragged tile bottoms; `01 02 03` faux slide number = list position ornament (`SlideDeckCard.svelte:31`); six mirrored posters never shown on the page (only `SlideDeckEmbed` consumes them). Fix: the plate-carrying ledger 2.6 shipped for `/digital-humanities` — poster plate, hanging mono date key, Archivo title, serif venue, `Open deck ↗` `.ledger-action` — under `.rule-masthead` + `.index-eyebrow` (`Decks · 6 · …`). Keep e2e name `Open deck: {title}`.
- [P1] `/research` and `/teaching` open a tier below their five siblings with no masthead rule — `PageHeader.svelte:139–152` (`.page-title` 4xl/820), `:78–82` closes on `--color-border` (box-edge token as rule; roadmap l.766 "left for later"). Fix: opt-in index tier on `PageHeader` (prop/modifier) — `.rule-masthead` top rule at `--rule-gap`, `--font-size-display`/830/`--font-variation-display-sm`, retire the bottom border. Sub-pages (`/publications/visualisations`, `/cv/timeline`) stay at 4xl.
- [P2] `/digital-humanities` hero has no rule above and uses `--font-variation-display` (wdth 116) where `.index-title` uses `-sm` (112) — `digital-humanities/+page.svelte:377–393`. Fix: add the masthead rule + swap the token.
- [P2] 8 `target="_blank"` prose links without ` (opens in new tab)` — iwac ×6 (ZMO, Omeka S, Typesense, ECharts, MapLibre, Hugging Face), publications/visualisations ×2 (CARTO, OpenStreetMap).
- [P2] CV h1 breaks mid-word at 375 — `reset.css:73` `overflow-wrap: break-word` on h1–h6. Fix: restrict to prose elements / narrower mobile clamp on `.cv-title`; re-run the 375 probe.
- [P2] One role, four masthead implementations (`.index-hero`, `.activities-hero`, `.dh-hero`, `PageHeader.page-title`) — consolidate into one `ink-signal.css` idiom after the fixes land.
- [P3] `/research` and `/teaching` set an 8-line standfirst across half the page with the other half empty; `/research` has the `.periods` strip stacked below. Fix: adopt the `.index-hero` grid and move the strip into the right cell; `/teaching` caps the standfirst.
- [P3] `/digital-humanities` hero carries no data ornament; reuse `.periods` over the 16 records' `years`.
- [P3] `/conference-activity/slides` states no corpus figure; `communicationsWithSlides` already imported.

## Fine as is

Home, publications, conference-activity, activities, year archive, records of every kind, publications/visualisations, the 404 (full strength), `/teaching` is a page not a stub, `/digital-humanities` reads as the archive; midnight a designed negative everywhere; baseline green.

## Declined by the brief

Larger poster imagery as a hero grid; second accent / gradient / motion / hero photo; "more whitespace"; enlarging every h1 site-wide (record titles at 52.7px are correct); counts needing the fifth generator.

## Open questions

1. Index/sub-page masthead fork intentional? (recommend opt-in tier on PageHeader). 2. Does the slides page stay a gallery? 3. `.plate--missing` acceptable in the gallery for an unmirrored poster?
