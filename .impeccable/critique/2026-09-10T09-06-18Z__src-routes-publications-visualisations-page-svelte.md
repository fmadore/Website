---
target: visualisation routes, charts, CV, media player (3.2 harden)
p0_count: 1
p1_count: 3
timestamp: 2026-09-10T09-06-18Z
slug: src-routes-publications-visualisations-page-svelte
---

Method: three isolated Opus critique agents (`/impeccable harden`, roadmap 3.2), one per page family; this one drove audio 404 (instant and delayed) and stalled metadata, the MapLibre chunk and the boundary request aborted plus retry, JS disabled, reduced motion, the network sliders at both ends, diacritic-folded and zero-match searches, every `LanguageToggle` state, the CV's staged load sampled at 100–5000 ms with a print at 180 ms, and the timeline's keyboard at both ends, at 375/640/768/1280. This snapshot: the visualisation routes, the charts, the CV and the media player. Orchestrator: Fable. No heuristic score — `harden` produces findings, not a scale.

## Priority issues (as found)

- **[P0] The map's failure state printed a raw module URL in danger red** (`Error loading map: Failed to fetch dynamically imported module: …/maplibre-gl.js?v=…`), with two more support-desk strings behind it; the media player's error panel was the site's only other danger-coloured block, and a fast audio 404 never reached it (the effect attached after the error had fired, so the spinner ran for ever). → fixed (one shared `.state-note` honest-state idiom, no danger colour; `el.error` checked on attach).
- **[P1] Canvas charts had no visible data alternative** (the SVG plates ship sr-only tables; the eight canvases only an aria summary), and two competing empty idioms centred one grey sentence in a 400 px box. → fixed (`<details class="chart-table">` under every plate with the rows as a `.ledger`; one `.viz-empty` promoted to the idiom sheet).
- **[P1] The timeline auto-selected the 166th record**, walked a different sequence from the plate (`48 of 166` from the first mark) and printed a bare count. → fixed (no auto-select; one sequence; `of 166 records`).
- **[P1] The CV's staged load was silent** outside the closed contents panel, and a print at 180 ms produced a plausible three-section CV. → fixed (a printed `Loading remaining sections… n of 17 shown.` dateline inside the sheet).
- **[P2]** Treemap tiles truncating with `...`; the bigrams axis smearing eleven ticks into 190 px at 375; the toolbar and the map's mode panel occluding marks at 375; the boundary retry dropping focus; a hover `scale(1.15)` on markers; `Showing top 10 / 3` on a sparse network; a one-language corpus rendering a dead `French 0` chip; the media player advertising keys that no focusable element received. → all fixed.

## Fine as is

Computed accessible summaries on all eight canvases; sr-only tables on the three SVG plates; slider extremes tracking the plate, caption and value text; diacritics in mono chart labels at 5× (`Émulations`, `Bourahima Diomandé`); width-aware label gutters on the horizontal bars; reduced motion honoured by every chart; the PDF export waiting for the sections; the contents panel with long headings; the country-shading error copy; no document-level overflow at 640 on any route; every `VizSection` empty string already in the archive's voice.

**Deferred:** URL sync for chart controls (a feature for a `shape` session, not a hardening state).
