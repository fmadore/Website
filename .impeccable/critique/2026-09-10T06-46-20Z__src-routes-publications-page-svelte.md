---
target: entity-index family (3.1 clarify)
p0_count: 2
p1_count: 2
timestamp: 2026-09-10T06-46-20Z
slug: src-routes-publications-page-svelte
---

Method: three isolated Opus critique agents (`/impeccable clarify`, roadmap 3.1), one per page family, each reading every user-facing string in source and then extracting the live accessible names, live-region text and count readouts with Playwright against its own dev server (default, filtered, zero-result, paginated and error states). This snapshot: the entity-index family (`/publications`, `/conference-activity`, `/conference-activity/slides`, `/activities`, `/activities/year/[year]`, `/digital-humanities`; ~190 strings). Orchestrator: Fable. No heuristic score — `clarify` produces findings, not a scale.

## Glossary divergences found

entries / matches / publications / talks / projects / past for one concept (the index row); `Advanced filters` / `Facets` / `Filter by type` / `Explore by tag` for one apparatus; `Clear all ✕` / `Clear ✕` / `Reset years ✕`; `Talks & Events` / `talks` / `Talks and Events` / `Communication`; `Conferences` / `Conference paper` / `Conference` for one type across three components; `skill` (URL) vs `method` (UI); `Year ↓` for a date sort; `Ph.D.` / `PhD`.

## Priority issues (as found)

- **[P0] The apparatus contradicts itself on the pages whose purpose is to be countable.** `/activities` prints `All 9` / `All 64` (facet-value counts) beside `34 entries`; `/conference-activity` prints 79 entries, 74 past and `OF 74 TALKS` with no reconciliation; `/digital-humanities` prints `All 16` over `14 projects`. → fixed (A1, A2, A7).
- **[P0] Empty states lie or fall silent.** `No publications match the current filters.` when only the search box is set; two `Clear all` buttons in the DOM at once; `No projects use this method.` for a value that does not exist; the map's load failure renders nothing. → fixed (A3, A8, A16).
- **[P1] Accessible names carry glyphs, wrong words or nothing.** `Clear all ✕` read as "multiplication x", `← Prev` failing Label in Name, the year thumbs named `Minimum value`, the two `All` chips indistinguishable, facet selection silent to AT on two of three indexes, the combobox listbox named `tags`. → fixed (A4, A5, A10, A26, A27, A28).
- **[P1] Three live readouts for one concept** (`Filtered by … 7 of 34 Clear ✕` vs `1 filter active · 3 matches`), with the clear button inside the live region. → fixed (A15; `filters.spec.ts` updated).
- **[P2] Register.** `Conference insights` / `Workshop highlights` / `Seminar takeaways` as search-result descriptions; `Explore project →`; em-dashed year ranges; `RSS Feed ↗` on a same-origin link. → fixed (A13, A14, A25, A29–A31).

## Declined / deferred

The authored first-person standfirst on `/digital-humanities` (owner's prose, reported); the `?skill=` URL key (link-rot cost); the per-row `aria-live` on twelve Cite buttons and the route announcer firing on every filter click (3.2 harden); the year-strip `title` tallies unreachable by keyboard (3.2).
