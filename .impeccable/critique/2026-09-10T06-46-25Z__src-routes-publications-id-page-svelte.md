---
target: records, chrome, static, CV/teaching/research/home (3.1 clarify)
p0_count: 1
p1_count: 2
timestamp: 2026-09-10T06-46-25Z
slug: src-routes-publications-id-page-svelte
---

Method: three isolated Opus critique agents (`/impeccable clarify`, roadmap 3.1), one per page family, each reading every user-facing string in source and then extracting the live accessible names with Playwright against its own dev server. This snapshot: the record pages, the chrome, the static pages and the CV / teaching / research / home pages (~340 strings). Orchestrator: Fable. No heuristic score — `clarify` produces findings, not a scale.

## Glossary divergences found

`Relevant Communications` / `View all communications →` / `No communications found` / `view communication` / badge `Communication` — the code noun reaching the reader; `Access Publication` / `Access Presentation` / `Read Publication` / `Visit Activity` / `Visit the project` / `Explore project` / `View full details` for one errand; `Export BibTeX` vs `Download PDF` vs `Export failed — retry`; Title Case vs sentence case section heads (`Cited By`, `Table of Contents`, `Key Terms`, `More in this Project` against `Related publication`, `Courses taught`); `Switch to dark theme` vs tooltip `Midnight`; three forms of the new-tab notice and none at all on the rails; `Honors`, `Organization`; four person descriptors; `N/D` / `N/A`.

## Priority issues (as found)

- **[P0] Links that mean nothing out of context.** ~20 `[Link]` anchors on `/cv`; `View all →` on record pages; a CV table of contents whose labels differ from ten of the seventeen headings they jump to. → fixed (B1, B2, B17).
- **[P1] Labels that contradict behaviour or claim the unknowable.** `offline.html`'s `Try again` navigating home and `Go to the homepage` reloading; `Back online! Content updated.`; `Email - Opens in new tab` on a `mailto:`; the hamburger named for the gesture (`Toggle`); `1 works`. → fixed (B5, B6, B11, B21, B22; `responsive.spec.ts` updated).
- **[P1] Accessible-name hygiene.** `View slides` not leading its own name; `Item Preview` as a dialog name; `Fig. 1 — …` with a spoken dash; bare `Close` / `Previous` / `Next`; `Button` and `Link button` fallback names masking unlabelled controls. → fixed (B3, B16, B24, B26).
- **[P2] Register and typography.** `Ph.D.`, `Honors`, `Organization`, `Export failed — retry`, `...` in generated `<title>`s (with a stray space before the ellipsis on French titles), `-` and `·` as title separators, a hardcoded self-descriptor outside `siteConfig`. → fixed (B9, B10, B13, B14, B19).

## Declined / deferred

The theme toggle keeps `Switch to dark theme` (a visitor has no product knowledge of "midnight"; the tooltip now matches the name); the `Mobile navigation` landmark name stays (spec cost over an invisible gain); `Encyclopedia` stays (modern British usage; MCP consumer; pinned test); American spellings inside data files are the owner's copy; plate numbering beyond `Fig. 1` and the CV's staged load are 3.2.
