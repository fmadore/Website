---
target: visualisation routes, charts, timeline, media player (3.1 clarify)
p0_count: 2
p1_count: 2
timestamp: 2026-09-10T06-46-26Z
slug: src-routes-publications-visualisations-page-svelte
---

Method: three isolated Opus critique agents (`/impeccable clarify`, roadmap 3.1), one per page family, each reading every user-facing string in source and then extracting the live accessible names, canvas `aria-label`s, tooltip literals and legends with Playwright against its own dev server (including the choropleth error state with the boundaries request aborted). This snapshot: `/publications/visualisations`, `/conference-activity/visualisations`, `/cv/timeline` and the media player (~230 strings). Orchestrator: Fable. No heuristic score — `clarify` produces findings, not a scale.

## Glossary divergences found

Five names for the talks entity on one page (`Activities`, `Talks & Events`, `communications`, `Publications` in shared tooltips, `/communications` in a path); `Collaborators` under a `Co-presenter network` heading; `records` / `items` / `entries`; `nodes` spoken to readers; `Choropleth` vs `country shading`; `Zoom In` / `Reset Zoom` vs MapLibre's `Zoom in`.

## Priority issues (as found)

- **[P0] Factual errors in shared components.** On the talks page the Gantt legend, the treemap tooltip, the stacked tooltip and the Gantt accessible summary all say `publications` where they count talks. → fixed (C2–C4, prop-driven noun).
- **[P0] Canvas charts hand screen readers ECharts' auto-generated dump** — 2,400 characters containing `NaN` and series indices — on four of five chart types; the Gantt was the only one with an authored summary. → fixed (C1: computed one-sentence descriptions).
- **[P1] Controls with no value text or the wrong name.** The seek bar announcing `0 of 873.047075`, the volume slider `1`, the top-N slider `Number of nodes to show` with no unit, `Reset Zoom` failing Label in Name, the timeline's `Close` / `Previous` / `Next` without an object. → fixed (C10, C14, C15, C20).
- **[P1] Missing states.** A network search that matches nothing changes nothing announced; the choropleth error exposes `Failed to fetch`; the media player's loading spinner and error name nothing. → fixed (C9, C16, C29).
- **[P2] Register and typography.** `1 publications`, `(1 years)`, `2018 –2020` from split template lines, `...`, `AI-powered` / `fed into`, `Interactive timeline … and more`, twenty empty states restating their container three times, `Show decal patterns for accessibility`. → fixed (C6, C7, C12, C17, C19, C23, C26, C30).

## Declined / deferred

First person kept in the two arc-diagram descriptions (site convention); the auto-selected timeline record making a paper title the page's only `h2` is answered structurally (labelled `Selected record` region, `h3`) with the auto-selection itself left for 3.2; the matrix legend ramp and the volume-track gradient are data encodings already sanctioned in DESIGN.md; MapLibre's own control strings are third-party.
