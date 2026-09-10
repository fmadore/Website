---
target: record templates, teaching, home, static pages (3.2 harden)
p0_count: 0
p1_count: 4
timestamp: 2026-09-10T09-06-18Z
slug: src-routes-publications-id-page-svelte
---

Method: three isolated Opus critique agents (`/impeccable harden`, roadmap 3.2), one per page family; this one swept all 183 record URLs from the sitemap for empty reading columns, duplicate figure numbers, broken inline references and thin rails, then drove the longest and thinnest records, aborted images / deck host / audio, the clipboard removed, a 45-stop keyboard walk, axe under WCAG 2.2 AA, 320–1440 and the 200% reflow case. This snapshot: the record templates, research, teaching, home and the static error pages. Orchestrator: Fable. No heuristic score — `harden` produces findings, not a scale.

## Priority issues (as found)

- **[P1] Three publications render an empty reading column** (no abstract, contents, reviews or citations) beside an 857 px rail, and at 375 the empty grid row doubles the rail interval. → fixed (`main` optional on `RecordLayout`; the record reads as masthead + rail).
- **[P1] No plate has a failure state:** an aborted cover leaves a broken-image glyph under `Fig. 1. Cover.`, a figure number asserting a figure that is not there. → fixed (`use:plateFallback` → `.plate--missing`, caption withheld; documented on the guide).
- **[P1] The 404 page's chip list never lights for `/communications/*` or `/activities/*`**, and the path echo prints `/publications/%C3%A9mancipation` back to a francophone reader. → fixed by the orchestrator in `+error.svelte` and `static/404.html` together.
- **[P1] The slide-deck embed fails silently and permanently** when the host is unreachable; the record page's map import has no `.catch` and says `Loading map…` for ever. → fixed (6 s watchdog with a flat failure stage; the index page's honest map state mirrored).
- **[P2]** The DH rail's stacked addresses failing `target-size` (the CV fix's idiom applied); a participants ledger keyed by 32 bare em dashes; the teaching templates printing `0 courses · undefined–undefined` when empty and `1 courses`; a debug marker `[Ref: id?]` in red mono as the unresolved-reference fallback (now plain prose plus a `gen:refs --check` gate); `'...'` in meta descriptions, RSS and the baked abstract excerpts; JSON-LD names carrying the ellipsis and the site suffix; `CVTeaching` sorting shared arrays in place; the home log's `No recent activities found.`; a synthetic unbroken token overrunning chips, related cards and the breadcrumb. → all fixed. A `Cite` block added to the talk rail (a talk is citable; the formatter already handled it).

## Fine as is

Reflow at 320–640 on every long-title record; the 201-character French title in the masthead; `CÔTE D'IVOIRE` at 4× in both themes; every record section withholding its heading with its content across all 183 records; no duplicate `Fig. N`; `Copy reference` with no clipboard; 45 keyboard stops in document order with visible rings; inline reference previews positioned inside the viewport at both widths and closed by Escape with focus returned; axe 0 on every route but the DH rail.
