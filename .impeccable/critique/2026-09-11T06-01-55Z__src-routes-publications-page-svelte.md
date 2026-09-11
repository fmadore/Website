---
target: entity-index apparatus + record rails (4.1 distill)
p0_count: 0
p1_count: 5
timestamp: 2026-09-11T06-01-55Z
slug: src-routes-publications-page-svelte
---

# B — `/impeccable distill` — the index apparatus and the record rails (roadmap 4.1)

Method: six Playwright probes against the served build (scratchpad/B/): control-and-repetition census of the four index pages at 1440/375; a sweep of all 174 records from the sitemap counting rail blocks, ledger rows, sections, related items; a section census of 124 publication+communication records; 375 fold measurements; a computed-style comparison of every "clear the narrowing" control under touch emulation; four captures read back.

## Evidence

E1 facets: `.facet-more` ("All N ↓") is used by exactly one facet (Countries) on two pages — on `/publications` it hides one value (9 vs 8 printed); on `/conference-activity` it unfolds 11 rows in place. Every other long facet uses `FacetCombobox`. No facet fails the discrimination test (worst dominant value: `Islam` 35/44 on publications tags).
E2 clear controls: `.facet-clear` (entity-index.css:558) 16px tall, no `:focus-visible` rule; `.filter-note-clear` (activity-list.css:178) 44px; DH page-local `.filter-note-clear` (+page.svelte:515) an `<a>`, 16px, muted not pine; `.chip-more` (ink-signal.css:676) 44px with focus ring — used only by the style guide. `.facet-more` 16×50 at 375 with 8px clearance = WCAG 2.5.8 failure.
E3 repetition: the record's Type is printed 3× (breadcrumb current node + eyebrow + rail `Type`) on 157/157 records; Date 2× on 157/157; activity rails add a `Year 2025 →` row = 3×.
E4 rails: publications 4–11 ledger rows (median 10), communications 6–8, activities always 3 (`Type · Date · Year`), DH 1–3 `Addresses` rows; related items 0 on all 34 activities and all 16 DH records. Six DH rails are a one-row Addresses ledger duplicating the `.rail-cta` below it.
E5 sections: `Location` (a 498px single-marker MapLibre canvas) on all 79 talks; **11 talks whose only reading-column section is the map** beside an 854–926px rail restating `Location`/`Country`.
E6 `/conference-activity`: 5 forthcoming talks as `.entity-card` tiles (mean 428px at 1440, 703 at 375) vs 74 past as `.bib-row` (147 / 350) — the Upcoming block is 3764px (≈4.6 screens) at 375 before the first list record.
E7 the same total printed four times on one index screen; on `/conference-activity` the pager says 74 where the summary says 79.
E8 375 folds: `/publications` first record at y=958; `/activities` filter apparatus (`.activities-aside`) at y=5588 after the entire log.

## Findings

- [P1] `UpcomingCommunications.svelte:22` calls `CommunicationItem` without `bibliography` → card branch (`CommunicationItem.svelte:156–276`). Fix: pass `bibliography` (+ `yearLabel`) so the block renders `BibliographyRow`s.
- [P1] Four implementations of "state the narrowing / clear it"; `.facet-more` fails 2.5.8 at 375. Fix: promote `.chip-more` to the one mono text-action primitive; `.facet-clear`, both `.filter-note-clear`s compose it; delete the DH page-local copy.
- [P1] Type ×3 / Date ×2 on every record; `breadcrumbCurrent={typeLabel}` (`RecordLayout.svelte:143`; set at `publications/[id]:179`, `communications/[id]:333`, `activities/[id]:246`) is the printing that earns its place least (a type is not a place). Activity rail `Type · Date · Year →` restates the eyebrow.
- [P1] `/activities` filter apparatus at y=5588 on a phone (`activities/+page.svelte:236`); roadmap 2.5 deferred it as "belongs with the entity-index family". Fix: hoist the aside above the log below `--lg` with the sibling indexes' `facetsOpen` disclosure.
- [P1] `PUBLICATION_TYPE_BADGE_LABELS` (`publicationTypeLabels.ts:23–35`) lacks `conference-proceedings` → raw key printed in breadcrumb, eyebrow and rail on `/publications/salafism-cote-ivoire-mande-2017`.
- [P2] Two long-facet idioms; the guide § 5 already states the rule for one. Fix: `visibleFacetOptions` (`facetSearch.ts`) prints the whole list when `total ≤ LIMIT + 1`, else `LIMIT` + combobox; delete `showAllCountries`, `COUNTRY_LIMIT`, `.facet-more` (`EntityFacetGrid.svelte:180–194`).
- [P2] `PublicationItem.svelte:315–467` card branch unreachable (single call site always passes `bibliography`) and imports `entity-cards.css` (434 lines) onto `/publications`. With finding 1, `entity-cards.css` and `CommunicationItem`'s card branch have no consumer.
- [P2] Home: the only `.btn` CTA is `View all activities →`; `/publications` is reached only through the word "published" in the eighth paragraph (y≈3019). Fix (a): a trailing `View all publications →` on the publications section.
- [P2] 11 talks whose whole reading column is a venue map restating two rail rows (E5). Options: map into `railSecondary` under Location on every talk; or withhold the section when it would be the only one.
- [P2] `PublicationToc`'s gate duplicated at `publications/[id]/+page.svelte:101–104`. Fix: export `hasToc()` from the component's `<script module>`.
- [P3] Guide § 5 documents `.chip-more` (nothing ships it) and misses `.facet-more`; says "All three indexes" where there are four.
- [P3] `Theses 1` / `Dissertations 1` chips lose the distinguishing word (`publicationTypeLabels.ts:110–111`). Fix: `Master's theses` / `PhD dissertations` (+ e2e).
- [P3] Four totals on one index screen; on `/conference-activity` 79 vs 74. `year-bars-legend` reprints `2013 … 2026` under an eyebrow saying `2013–2026` (`publications/+page.svelte:210–214`).
- [P3] Rail vocabulary differs by family (report only); six DH rails: one-row `Addresses` = the `.rail-cta` URL.
- [P3] `cards.css` (38 lines, global) serves `.card-accent-border` for `RelevantItemCard` only; `CSS-README.md:206` stale; `ink-signal.css:675` comment names a non-existent `.featured-action`.

## Fine as is

Bibliography-row actions (1 title + 1–2 actions, no third link); index header actions; facet discrimination (keep the 12 type chips); `Tags` vs `Key terms`; the publication rail's three-button stack (one pine fill); the 11 label registers; `.facet-summary` outside the grid; no dead CSS beyond the two named.

## Declined by the brief

One font / fewer borders / more whitespace / no sidebars; collapsing rail ledgers or hiding citation data; "fewer filter controls" (no facet fails to discriminate); removing the year-bar strip, key-terms cloud or corpus counts; the ruled-out items.

## Open questions

1. Primary control on a publication record: `Open publication ↗` or `Copy reference`? 2. Breadcrumb: record title as current node, or drop it? 3. Venue map: rail everywhere, or withhold only on the 11? 4. Is the home route-to-the-record in scope?
