---
target: entity-index family + offline layer (3.2 harden)
p0_count: 2
p1_count: 3
timestamp: 2026-09-10T09-06-18Z
slug: src-routes-publications-page-svelte
---

Method: three isolated Opus critique agents (`/impeccable harden`, roadmap 3.2), one per page family, each driving its own dev server with Playwright through hostile URL state, slider extremes, zero results, thin and over-long records, diacritics in every voice, 375 / 640 (the 200% reflow case) / 1280, `setOffline`, aborted requests and a served build for the service worker. This snapshot: the entity-index family and the offline/PWA layer. Orchestrator: Fable. No heuristic score — `harden` produces findings, not a scale.

## Priority issues (as found)

- **[P0] The offline layer caches no pages at all.** `handleNetworkFirst` returns the navigation-preload response before the runtime-cache write, so after browsing the site the runtime cache does not exist; the worker's own header and `offline.html` both promised visited pages. → fixed (preload response cached on the same terms as a network response).
- **[P0] Offline + an unvisited record reports a 500 and never says "offline".** The chunk fetch rejects, `+error.svelte` prints `Something went wrong on this page … Reload`, and nothing recovers on reconnect. → fixed (an `Error · Offline` branch keyed on `isOnline`, reloading once on reconnect).
- **[P1] The offline notice was the clearest guardrail breach found:** translucent (glass), serif (wrong voice), `--color-danger` (a retired second accent over a full-width bar), animated, fixed over the masthead, auto-hiding after 3 s while still offline, and `Back online.` unreachable in practice. → recast as an opaque in-flow ink strip in the data voice with the two lifetimes inverted.
- **[P1] Every filter click was a navigation** (`goto` with `replaceState`), so SvelteKit's assertive announcer barked the page title over the polite result count. → shallow `replaceState`.
- **[P1] The year facet never printed the years it had selected**, the collapsed range was a dead control for the pointer, and an out-of-corpus deep link drew the handles 191 px past the track with invalid ARIA. → live read-out + value text, outward tie-break (pure helper, tested), clamped geometry (tested).
- **[P2]** `/publications?type=zzz` emptied the index without naming the value; twelve permanent polite live regions per index; `/activities` overflowing at 375 on one long action label; a forthcoming chapter presented as the newest published record; smooth scroll under reduced motion; the update prompt with no `Escape`, a permanent `Later` and an unlabelled reload; `offline.html` promising routes it did not give; two ARIA gaps in the filter bar; the search term unshareable. → all fixed; the page number deliberately stays out of the URL.

## Fine as is

Diacritic folding in the combobox (`cote` → `Côte d'Ivoire`, no accent clipping in uppercase mono at 3×), long French titles and a synthetic 300-character title at 375, the thin record's ledger geometry, zero results all three ways, pagination boundaries, the clipboard fallbacks, offline filtering and paging, the year archive's empty state, the DH catalogue's unknown-method state, hostile year and query parameters (inert), overflow at 640/768/1024.
