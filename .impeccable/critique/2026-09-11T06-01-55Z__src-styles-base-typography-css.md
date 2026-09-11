---
target: site-wide prose-link idiom + pine census (4.2 quieter)
p0_count: 0
p1_count: 5
timestamp: 2026-09-11T06-01-55Z
slug: src-styles-base-typography-css
---

# A — `/impeccable quieter` — pine scarcity across the site (roadmap 4.2)

Method: scripted pine census (A/census.mjs, Playwright) over 15 routes × both themes × 1440/375 recording every element whose computed color/background/border/text-decoration/outline/fill/stroke resolves to pine; CDP matched-rules probe on 13 link targets; prose-container attribution pass (A/proselinks.mjs); static-vs-state scan of every `--color-accent`; mobile-menu-open census; optical checks via npm run shot.

## Evidence

Per-route marks daylight 1440 (viz excluded): `/` 53 (27 pine text, 26 of them underline+text); `/publications` 29 (6 text, 22 underline-only); `/conference-activity` 84 (72 underline-only); `/research/muslim-minorities…` 66 (32 text); `/style-guide` 37; `/conference-activity/slides` 22; the rest ≤ 18. Midnight counts identical element-for-element.
No route fails the first-screen threshold: every first-screen mark is sanctioned (active nav, index eyebrow, newest year-bar, active language/sort, `All N ↓`, one `.btn-accent`). The failure is below the fold and is one idiom: the prose-link underline leaking onto data-voice anchors.
Of 246 pine underlines: 37 in a prose container; **209 outside** — 40 `a.chip`, 35 `.bib-title-link`, 33 `.bib-plate-link`, 28 `.bib-action--primary`, 20 untyped, 12 `.citation-link`, 12 `.relevant-item-link`, 6 `.year-meter-row`, 5 `.ledger-row.log-row`, 5 `.entity-title-link`, 4 `.breadcrumb-link`, 9 `.review-*`.
Which rule wins: home prose = ContentBody (0,2,1) wins `color` (pine text) while typography.css (0,4,1) wins decoration → a hybrid neither author wrote; DH record = typography.css alone (ink + pine underline, the intended idiom); `a.chip`, `.relevant-item-link`, `.review-link`, breadcrumbs, plate links = typography's `li a` / `p a` beats the component's `text-decoration: none`.
Captures: chips carry a pine rule inside their box (midnight: brighter than the cream label); home first paragraph has three pine-text links, in midnight the brightest objects after the nameplate; the mono date key `09 / SEPT / 2026` in the home log is underlined in pine (the whole row is the anchor).

## Findings

- [P1] `typography.css:174–177` `p a` / `li a` arms capture every data-voice anchor; 209/246 pine underlines outside prose. Fix: replace the bare arms with explicit prose containers (`.prose`, `.content-body`, `.page-intro`, `.record-prose`, `.project-prose`); the only bare-`p a` prose is `p.audio-description a`. Document on the guide.
- [P1] `ContentBody.svelte:82–96` is the only place a prose link is pine text; double-marks 26 links on the home page. Fix: delete colour/decoration declarations, keep the focus outline.
- [P1] `PageIntro.svelte:77–92` a third redundant copy of the idiom. Fix: delete.
- [P1] `RelevantItemCard.svelte:78,138` three pine marks per card × 12 cards. Fix: `.relevant-item-type` → `--color-text-muted`; `.relevant-item-link` → emphasis at rest, pine on hover/focus.
- [P1] `TagList.svelte:30` `a.chip` lacks `.no-underline` (guide `+page.svelte:798` claims chips take it). Fix: subsumed by 1; add the class anyway.
- [P2] Ledger-row anchors (`LatestActivities.svelte:73,103`, `activities/+page.svelte:244`) underline the mono key. Subsumed by 1.
- [P2] `.section-no` (`ink-signal.css:106–113`) pine on every section head (13 on visualisations, 9 on the guide). Fix: `--color-text-muted`.
- [P2] Static stamps in pine: `RelevantGrants.svelte:161` `.status-awarded`; `SlideDeckCard.svelte:118,191`. Fix: muted / emphasis with pine on hover.
- [P2] `ReferenceLink.svelte:127–130` loses its designed 55% underline to typography's 100%/3px. After fix 1 the component wins.
- [P2] `Breadcrumb.svelte:26,38` and `BibliographyRow.svelte:231` `.bib-plate-link` underlined. Subsumed by 1.
- [P3] `.aside-rss` (`activity-list.css:344`) pine text. Fix: muted, pine hover.
- [P3] `.facet-toggle` (`entity-index.css:233`) pine at 375. Fix: emphasis at rest.
- [P3] `.audio-icon` (`AudioVisualization.svelte:76`) pine icon tint. Fix: muted.
- [P3] Midnight: pine brightest where it should not be on three surfaces (home first screen, chip rows, related-item panel) — all dissolved by 1, 2, 4.

## Fine as is

Every first screen both themes both viewports; mobile nav (one mark, `.current`); ~90 focus outlines; `/cv`, `/teaching`, `/research`, DH index, activity and talk records; documented pine idioms (`.eyebrow`, `.chip-more`/`.facet-more`, `.stat-value--accent`, `.meta-value--accent`, `.record-eyebrow-token`, `.btn-accent`, `.upcoming-*`, `.nav-link::after`, `.cv-toc-link::before`, `.cv-date`); `.bib-cite--confirmed`; viz palette, hbar, year-bar strip, `.period-bar--current`.

## Declined by the brief

Lighter weights / thinner rules / desaturation / whitespace; a muted-pine token; removing the prose underline (WCAG 1.4.1); removing type/status strings rather than recolouring.

## Open questions

1. Does pine keep the inline citation's text (`--color-citation` aliases accent)? 2. The drop cap in midnight is the largest pine area on a record page. 3. Selected facet markers fill pine (`entity-index.css:444`, `ink-signal.css:1432`) while DESIGN says selected chips = solid ink.
