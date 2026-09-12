# Impeccable Design Review Roadmap

> **Historical document.** This roadmap ran from 2026-08-16 to 2026-09-12 and is closed: all
> phases 0–6 landed, the last as the ship gate (audit in `../audits/2026-09-audit.md`). Its
> rulings live in `DESIGN.md`, `CLAUDE.md` and the guard tests; the reusable method and the
> backlog that outlived it are in `../DESIGN-REVIEW.md`. Kept for the reasoning in its outcome
> log. Nothing below is a plan.

A phased plan for running the `/impeccable` commands across the site to sharpen design
quality and consistency under **Ink + Signal**. Written 2026-08-16, after the
`/style-guide` page shipped, against **impeccable plugin v4.1.1** (one skill, invoked as
`/impeccable <command> [target]` — the v2-era `/impeccable:<command>` skills no longer
exist).

**How to use this file.** Each numbered item is one working session: it names the exact
skill invocation, the target, and a "done when" test. Work top to bottom inside a phase;
phases 2–5 can interleave. After a session, tick the box and append a dated outcome line
(including the score, if the skill produced one). This file is the log as well as the plan.

**Grounding documents** (every session starts from these):

- `PRODUCT.md` + `DESIGN.md` — the context files impeccable v4 actually reads (created in
  item 0.0 below; until then `.impeccable.md` remains the brief of record and must be
  handed to the skills manually)
- `/style-guide` — the living reference rendering of every token and idiom
- `CLAUDE.md` — conventions (CSS variables, custom media, runes, voices)

---

## Standing rules for every session

1. **Both themes, always.** Midnight is a designed microfilm negative, not an inversion —
   verify it as its own pass. Read computed styles after swapping the `html` class and
   disabling transitions (the body has a 300ms background transition that causes stale
   reads). Screenshots from the in-app browser pane come back blank on this machine, so
   for anything optical use the repo's own capture recipe against a served build
   (`npx serve build --listen 4174`, then `npm run shot -- --url http://localhost:4174/<route>
--selector <css> --element --dark --out <png>`; `--scale 3` for the mobile density) and
   read the PNGs back. Computed styles prove a token resolved; only a render shows weight.
2. **Breakpoints:** 375 (mobile), 768 (`--md`), 1024 (`--lg`), 1440. Touch targets and
   the filter UI matter most at the small end.
3. **Guardrails override skill suggestions.** If a skill proposes gradients, glass,
   shadows, radii, motion beyond a page-enter fade, a second accent, mono headlines, or
   serif metadata — decline it and note the decline in the outcome line. The brief wins.
4. **Pine scarcity is a testable rule.** If the accent appears more than a handful of
   times per screen, that is a finding, whatever skill you are running.
5. **Extract as you go.** When a fix produces a reusable pattern, move it into
   `src/styles/components/ink-signal.css` (or the right idiom file) and document it on
   `/style-guide` in the same session — never leave a new idiom as a one-off. For bigger
   consolidations, run `/impeccable extract`.
6. **Ship gate per session:** `npm run format`, `npm run lint`, `npm run check`;
   `npm run test` when markup or copy changed; one session = one reviewable commit.

**Commands deliberately excluded** — do not reach for these here:

- `animate`, `delight`, `overdrive` — the register is print; motion is near zero by
  design. The one permitted motion (short page-enter fade) already exists.
- `colorize`, `bolder` (as general tools) — the palette is two inks + one accent by
  design; "more colour" and "more impact" are answered by rule weight and ink density,
  not new hues. `bolder` appears once below (4.3) with tight constraints.
- `onboard` — first-run flows and activation don't apply to a reference archive; the
  closest need (empty states) is covered by `harden` in 3.2.
- `shape` — for designing _new_ features, not reviewing existing ones. Use it when a new
  page or feature is planned, before code. (`craft` is a deprecated alias in v4; don't
  use it.)
- `live` — the browser variant-picking mode; optional as an iteration aid during Phase 2
  fixes, never as a phase of its own.

---

## Page inventory, grouped by template family

One critique per family representative covers the family; spot-check the siblings.

| Family             | Routes                                                                                               | Shared chrome                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Home               | `/`                                                                                                  | ProfileBanner, ruled sections                                  |
| Entity index       | `/publications`, `/conference-activity`, `/activities`                                               | entity-index.css, EntityFilterBar/FacetGrid, activity-list.css |
| Entity detail      | `/publications/[id]`, `/communications/[id]`, `/activities/[id]`, `/digital-humanities/[id]`         | EntityDetailLayout, DetailsGrid, RelatedItemsList              |
| Research           | `/research` + 6 static project pages                                                                 | PageHeader, PageIntro, inline components                       |
| Digital humanities | `/digital-humanities`                                                                                | card grid                                                      |
| CV                 | `/cv`, `/cv/timeline`                                                                                | cv/ components, PDF export                                     |
| Teaching           | `/teaching`, `/teaching/guest-lectures`                                                              | ledgers                                                        |
| Visualisations     | `/publications/visualisations`, `/conference-activity/visualisations`, `/conference-activity/slides` | ECharts/MapLibre/network SVG plates                            |
| Archive            | `/activities/year/[year]`                                                                            | ledger                                                         |
| Reference          | `/style-guide`                                                                                       | the guide itself                                               |
| System             | `+error.svelte` (404), footer, header/nav                                                            | global chrome                                                  |

---

## Phase 0 — Instrumentation & baseline (no design changes)

- [x] **0.0 Migrate design context to the v4 format.** Impeccable v4 no longer reads
      `.impeccable.md`; it loads `PRODUCT.md` (durable product context) and `DESIGN.md`
      (the design system as built) via its context script. Run `/impeccable init` seeded
      from `.impeccable.md` (users, brand personality, job-to-be-done), then
      `/impeccable document` to generate `DESIGN.md` from the shipped code — checking it
      states the brief's non-negotiables (two voices, pine scarcity, rule hierarchy, square
      corners/no shadows, print-register motion) as rules, not observations. Verify with
      `/impeccable doctor`. Keep `.impeccable.md` (CLAUDE.md points to it) but add a header
      note that PRODUCT.md/DESIGN.md are what the skills read. _Done when:_ doctor reports
      no drift and a dry-run command cites the brief's constraints unprompted.
- [x] **0.1 Retool the `design-philosophy-auditor` agent.** It still audits for the
      Warm Earth Tones terracotta/gold system — two redesigns stale. Rewrite
      `.claude/agents/design-philosophy-auditor.md` for Ink + Signal: legacy palettes to flag
      (terracotta `#9a4419`/gold `#c4a35a`, ink-blue, amber, press-vermillion), forbidden
      properties (`border-radius` beyond `-full`, `box-shadow`, `backdrop-filter`, gradients
      outside `.hbar`), voice-blurring (mono in headlines/prose, serif in metadata),
      `rgba()` instead of `color-mix()`, hardcoded breakpoints, retired fonts
      (Fraunces/Spectral/Commissioner/JetBrains Mono). _Done when:_ the agent runs clean
      against `src/` or every finding it reports is a real violation.
- [x] **0.2 Baseline audit.** `/impeccable audit` on the whole site — accessibility,
      performance, theming, responsive, anti-patterns. Save the scored report to
      `../audits/2026-08-audit.md`. Fix P0s immediately; assign P1–P3 items to the phases
      below. _Done when:_ report committed, P0 count is zero.
- [x] **0.3 Wire the style guide into the context files.** Add a pointer to
      `/style-guide` in `DESIGN.md` (and `.impeccable.md`) so every future command run knows
      the live reference exists. Confirm the guide documents every idiom class in
      `ink-signal.css`; list gaps as backlog items here.
- [x] **0.4 Enable the design detector hook.** Run `/impeccable hooks on` so the
      detector audits UI file edits automatically from Phase 1 onward — every fix session
      gets anti-pattern checking for free. Tune with `ignore-rule`/`ignore-value` if it
      false-positives on deliberate Ink + Signal choices (e.g. the `.hbar` gradient); log
      any ignores in the outcome log.

## Phase 1 — Foundations (system-wide leverage before per-page work)

- [x] **1.1 Typography.** `/impeccable typeset` on the global type system, using
      `/style-guide` as the bench: two-voice casting sweep (hunt any string in the wrong
      voice), body/display scale ratios, Newsreader measure (45–75 **characters**) on prose
      pages, Archivo `wdth`/weight at masthead vs section tiers, French diacritics rendering
      in all three families, mono letterspacing at small sizes in both themes. _Done when:_ no
      voice-blurring remains and the guide's type section matches shipped reality.
- [x] **1.2 Layout rhythm.** `/impeccable layout` on the three shared templates —
      EntityListPageLayout, EntityDetailLayout, and the ledger idiom itself: hanging-column
      alignment, hairline consistency, rule-weight hierarchy (5px/3px/1px used correctly),
      spacing scale adherence, density (peer-respecting, not padded). A fix here propagates
      to ~20 routes. _Done when:_ templates pass at all four breakpoints in both themes.
- [x] **1.4 Tracking scale.** Raised by 1.1, deliberately deferred to keep that commit
      reviewable. The data voice carries **125 hardcoded `em` letter-spacing values across
      eleven distinct steps** (0.02, 0.04, 0.06, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14,
      0.16) while the three tracking tokens (`--tracking-heading/-eyebrow/-caps`) are
      vestigial — none of them matches the values actually in use, and 0.09/0.11/0.13 are
      near-certainly unintended neighbours of 0.1/0.12/0.14. Define a role scale keyed to
      size (mono tracks looser as it gets smaller), migrate the idiom layer first
      (`ink-signal.css`, `entity-index.css`, `activity-list.css`, `bibliography.css`), then
      the components. Pair with `/impeccable extract`. _Done when:_ no component sets a raw
      `em` tracking value and the guide documents the scale.
- [x] **1.5 Midnight type compensation.** Also raised by 1.1: `dark.css` makes **no
      typographic adjustment whatsoever** — not tracking, weight, nor smoothing. Light type
      on a dark ground optically bolds and tightens, so midnight currently renders the same
      metrics daylight does and the small mono caps are the likely casualty. The brief calls
      midnight its own designed pass, so this is a gap, not a simplification. Needs visual
      judgement rather than a computed-style read, so it wants a session where rendering can
      actually be seen. _Done when:_ midnight either carries a deliberate compensation or
      documents, with evidence, why none is warranted.
- [x] **1.3 Responsive sweep.** `/impeccable adapt` on the same templates plus header/nav:
      filter bar and facet grid on touch, ledger collapse behaviour under 640px, touch
      targets ≥44px, mobile menu. _Done when:_ the entity index pages are fully usable on a
      375px viewport with touch emulation.

## Phase 2 — Page-family critique loop

Per family: `/impeccable critique` → targeted fixes (`layout` / `typeset` / `distill` /
`clarify` as the findings dictate) → `/impeccable polish` → both-themes verification.
Re-critique if the score is below target (set the target from the 2.1 result). Ordered by
the job-to-be-done: find and cite the work.

- [x] **2.1 Home** (`/`) — the masthead page; the assert/reassure balance lives here.
      _(Done 2026-09-08 at 25/32 against a proposed Phase 2 target of 28/32; the gap is
      named in the log — the corpus counts module and the prose-link pine density, 4.2.)_
- [x] **2.2 Publications index + detail** — the citation path, the single most important
      flow. Include the bibliography row, BibTeX action, and DOI rendering in scope.
      _(Index done 2026-09-08 — facet apparatus; the detail page was refactored onto the
      shared record shell in 2.3; the citation path itself — row, cite action, BibTeX,
      DOI — critiqued and fixed later the same day.)_
- [x] **2.3 Conference activity index + communications detail** — includes the slides
      embed on detail pages. _(Detail done 2026-09-08; the index shares 2.2's facet fix.)_
- [x] **2.4 CV + timeline** — the scan-heavy page; ledger discipline and the PDF export
      (whose colours must match the current palette — verify, it has drifted before).
      _(Done 2026-09-08, 19/36 → 28/36 on a 36-point scale; the PDF `TEXT` orphan retired.)_
- [x] **2.5 Research index + the 6 project pages** — the static pages drift most easily;
      check them against each other for internal consistency. _(Done 2026-09-08, 17/32 →
      25/32; the project pages now compose `RecordLayout`. Seven routes, not six.)_
- [x] **2.6 Digital humanities index + detail** — card grid vs ledger tension; plates.
      _(Done 2026-09-08, 16/32 → 26/32; plate-carrying ledger, detail on `RecordLayout`.)_
- [x] **2.7 Activities index + year archive + detail.** _(Done 2026-09-08, 17/32 → 26/32;
      the last `EntityDetailLayout` consumer moved to `RecordLayout`, the shell deleted.)_
- [x] **2.8 Teaching + guest lectures.** _(Done 2026-09-08, 16/32 → 28/32; both pages now
      derive from the dataset instead of a drifted hardcoded copy.)_
- [x] **2.9 Visualisation pages** — critique the plate chrome, legends, and tooltips
      against the brief ("data as ornament" means the viz itself must be exemplary). Pair
      with the `dataviz` skill for chart-internal review (palette from `--sys-viz-*`,
      axis/legend/tooltip discipline, both themes).
- [x] **2.10 Style guide itself** — critique the guide as a page: is it navigable,
      complete, and set in its own idioms? _(Done 2026-09-09, 20/36 → about 30/36 by the
      same rubric; nine anchored sections behind a contents ledger, twelve missing
      specimens added, a coverage test that fails the build on an undocumented idiom.)_
- [x] **2.11 System chrome** — header/nav, footer, 404/error page. The error page is
      part of the archive's voice too. _(Done 2026-09-09, 23/40 → about 32/40; skip link,
      the nav's keyboard contract, one 404 voice, the footer as the record's colophon.)_

## Phase 3 — Language & edge cases

- [x] **3.1 Microcopy.** `/impeccable clarify` across the interface strings: filter and
      facet labels, empty states ("no results" under active filters), pagination, 404 copy,
      aria-labels, footer legal, RSS link text. Register: academic, precise, British
      English, no marketing voice. _Done when:_ every user-facing string reads as the
      archive's voice and e2e tests still pass (they locate by accessible name).
      _(Done 2026-09-10: ~760 strings read across three page families, 93 findings, 88 acted
      on; one glossary now binding in DESIGN.md § Voice & Copy; e2e 35 passed.)_
- [x] **3.2 Harden.** `/impeccable harden` (new in v4) on the entity index and detail
      templates: error and empty states, offline behaviour (NetworkStatusIndicator, PWA),
      French titles and West African diacritics in every voice, and content edge cases —
      very long titles, items with thin metadata, zero-result filter combinations, the
      year-range slider at its extremes. _Done when:_ each edge case has a designed state,
      not an accidental one.
      _(Done 2026-09-10: 43 findings, 42 acted on; the service worker had never cached a
      visited page; four new idioms — `.state-note`, `.chart-table`, `.viz-empty`,
      `.plate--missing` — on the sheet and the guide.)_

## Phase 4 — Character calibration (constrained, evidence-led)

- [x] **4.1 Distill.** `/impeccable distill` on any page Phase 2 flagged as cluttered —
      candidates usually: detail pages with thin metadata, over-faceted filter bars.
      _(Done 2026-09-11: no facet failed to discriminate; the clutter was idiom duplication —
      forthcoming talks as cards beside ledger rows, five copies of the clear control, two
      long-facet idioms, the type printed three times per record. −691 lines.)_
- [x] **4.2 Quieter.** `/impeccable quieter` wherever the pine-scarcity count (standing
      rule 4) failed — demote accent uses until pine again means "the current thing."
      _(Done 2026-09-11: the prose-link rule's bare `p a` / `li a` arms had put 209 of the
      site's 246 pine underlines on data-voice anchors; now opt-in by container. Home 54 → 19
      marks, one of them pine text.)_
- [x] **4.3 Bolder — narrow scope only.** If any page reads as "templated academic site"
      (the brief's named failure), apply `/impeccable bolder` with hard constraints:
      amplitude comes from Archivo scale, rule weight, and information density — never new
      colour, motion, or effects. Expected candidates: none until Phase 2 says otherwise.
      _(Done 2026-09-11: two candidates survived the gate — the deck gallery, the one route
      with no rule above 1px, and the `/research` / `/teaching` mastheads a tier below their
      siblings. One index-masthead idiom extracted; the gallery is a plate-carrying ledger.)_

## Phase 5 — Performance

- [x] **5.1 Optimize.** `/impeccable optimize` on the visualisation routes (ECharts,
      MapLibre, D3 chunks — confirm dynamic imports still hold) and the home page (hero
      image variants, LCP). Cross-check against `npm run check:bundle` budgets; font loading
      for the three families (subsetting, `font-display`). _Done when:_ budgets pass with
      headroom and no regression in the audit's performance score.
      _(Done 2026-09-11: the visualisation pages 51 → 93 and 69 → 90 (the map plate loaded
      eagerly 14 viewports below the fold); the app stylesheet had silently outgrown the inline
      threshold and render-blocked every route; index thumbnails and fonts trimmed; heaviest
      route 724 → 516 KiB. One ruled exception: `/cv` prerenders its whole record at 83 → 81.)_

## Phase 6 — Ship gate

- [x] **6.1 Final polish.** `/impeccable polish` sweep over home, publications, and CV —
      alignment, spacing, micro-detail.
- [x] **6.2 Re-audit.** `/impeccable audit` again; compare scores against
      `../audits/2026-08-audit.md`. All P0/P1 resolved, P2s triaged.
- [x] **6.3 Regression check.** Run the retooled `design-philosophy-auditor` agent; it
      should pass clean.
- [x] **6.4 Full test suite.** `npm run lint && npm run check && npm run test`, then
      `npm run build && npm run check:build`, then `npm run test:e2e`.

---

## Outcome log

Append one line per completed session: date, item, skill, score (if any), key changes,
declined suggestions (with reason).

**2026-08-16 — 0.0 context migration — done.** Plugin updated 2.1.1 → 4.1.1 first (the
v2-era per-command skills no longer exist; all invocations are now `/impeccable <command>`).
Ran `/impeccable init` (one interview round) → `PRODUCT.md`, then `/impeccable document`
(scan mode, one interview round) → `DESIGN.md` + `.impeccable/design.json` sidecar.
`/impeccable doctor` reports no drift.

Decisions recorded: positioning is **the authoritative record**, with the computational
apparatus (structured data, citation sweeps, machine-readable metadata, MCP server) named as
the _mechanism_ that makes the claim defensible rather than merely asserted. Success = "a peer
cites the right work in under a minute and leaves corroborated." Accessibility target set at
**WCAG 2.2 AA**. Four hard constraints recorded (static/no-backend, citation exports, MCP
parity, machine-readable metadata) — the last three promoted from "capability" to "constraint"
on my recommendation, since each is either the primary job-to-be-done or shared code with a
second shipped product. North Star: **"The Press Archive, Read Computationally"**. Component
character: **"typeset, not manufactured"**. Legacy `.glass-*` names recorded as debt to rename
on next touch, with new usage banned outright in the Don'ts.

Note: `doctor` flags that the `mcp` workspace inherits the root `PRODUCT.md`. Accepted
deliberately — `mcp/` is a headless server, never a design target, so it needs no child
record. Re-flagging is expected on every doctor run.

**2026-08-16 — 0.3 style-guide wiring — done.** `DESIGN.md` now points at `/style-guide` as
the living reference and at `ink-signal.css` as the idiom source. Coverage check against the
idiom file: 22 of 25 idioms are documented on the guide. **Three gaps to close** (backlog,
fold into 2.10): `.hbar` (the horizontal proportion meter — notable because it is the system's
only sanctioned gradient and therefore the one most likely to be misread as a violation),
`.key-terms` (frequency-scaled term cloud), and `.drop-cap` (the accent Archivo initial).

**2026-08-16 — 0.1 auditor agent — rewritten.** `.claude/agents/design-philosophy-auditor.md`
retargeted from the retired Warm Earth Tones palette to Ink + Signal. Its first run found **zero**
retired colours or fonts and zero live shadows/glass/`rgba()` across three migrations, and
usefully corrected three stale premises in its own brief (the referenced `audit.mjs` no longer
exists; `.glass-*` is fully migrated to `.surface-*`, so the "debt to rename" recorded in 0.0 was
based on a false premise and has been removed from `DESIGN.md`; the PDF generator has moved to
`pdfCvGenerator.ts` + `pdfDesignTokens.ts`). Agent file updated so the next run starts from truth.

**2026-08-16 — 0.2 baseline audit — 15/20 as found → 17/20 after fixes.** Full report at
[docs/audits/2026-08-audit.md](../audits/2026-08-audit.md). 0 P0, 3 P1 (all fixed), 4 P2, 3 P3.

The headline finding was a chain, not a point defect: `.btn-accent` set its label to raw
`--sys-color-paper`, which does not flip with the theme, so the "Access publication" CTA on every
publication detail page rendered at **2.20:1** in midnight — a clear WCAG AA failure on the
site's primary action. It survived because `a11y.spec.ts` asserted WCAG 2.1 tags (not 2.2, the
newly recorded target) and scanned dark mode on the home page only, where that button does not
appear. Separately, the downloadable PDF CV shipped a **3.24:1** label colour because
`pdfDesignTokens.ts` and `chartColorUtils.ts` hand-copy palette hexes and both fell behind a
contrast fix to `--sys-color-ink-faint`.

Fixed: all four raw-token instances → `--color-text-inverted`; a11y suite widened to `wcag22aa`
with a detail page and three dark-mode scans (8 passing); both stale hexes corrected; dead
`@supports not (backdrop-filter)` block removed from `DropdownMenu.svelte`; map white fallback
warmed; two `border-radius: 50%` moved onto the token. New guard
`src/lib/utils/designTokenParity.test.ts` parses `variables.css`, resolves `var()` chains, and
asserts both the derived constants and the palette's stated contrast promises — verified to fail
when the stale value is reintroduced.

Resolved as documentation, not code: `h6` is cast mono, which contradicted the brief's "h4–h6
serif". The code is deliberate (the smallest heading tier is a metadata label) and `CSS-README.md`
already agreed with it, so `DESIGN.md`, `CLAUDE.md` and the sidecar were corrected instead.
Likewise "the **only** gradient" was falsifiable by grep — three data-encoding gradients exist and
are now all named as sanctioned.

Assigned onward: touch targets and the thin responsive verification → **1.3**; voice-casting sweep
→ **1.1**; ledger rhythm → **1.2**; the PDF `TEXT` orphan value (`#3a352a`, traces to no token) is
a deliberate design decision to make in **2.4**, pinned by a test meanwhile.

**Method caveat for future audits:** the bundled detector runs **degraded** unless `htmlparser2`,
`css-select`, `css-tree` and `domutils` are installed in the plugin's skill directory — and
degraded means it reports an undercount, not a clean bill. It was installed for this run; **a
plugin update will wipe it**. Always confirm the detector is not degraded before trusting silence.

**2026-08-16 — 1.3 responsive sweep (`/impeccable adapt`) — done.** Taken out of order, ahead of
1.1/1.2, because the audit scored responsive the weakest dimension (2/4) and the only one with a
concrete defect list. Two systemic findings, both fixed at the system level rather than per page.

**(a) The ledger broke on a narrow measure — the flagship idiom, on the page that documents it.**
`.ledger-row` carried no responsive rule at all. The three-column variant computed to
`144px 0px 192px` at 375px: the fixed key and meta tracks held their widths and the _content_
column — the record itself — collapsed to **0px**, clipping the title. Four pages had each
re-implemented the collapse locally under their own class name (`.course-row`, `.lecture-row`,
`.ledger-entry`, …), and the two consumers that had not — `CitedBy` and the style guide's own demo
rows — were simply broken. The collapse now lives on `.ledger-row` / `.ledger-row--meta` in
`ink-signal.css`, so every consumer inherits it; `.ledger-meta` also drops its right alignment once
stacked, which otherwise reads as a stray fragment. Note the block sits _after_ the element rules
deliberately — same specificity, so it only wins by source order (it silently lost when placed
above).

**(b) Touch targets: 15 controls under the 44px guideline at 375px, 6 of them under 24px.**
The worst were the filter controls, which are baseline-aligned text affordances with `padding: 0`
and so measured **16–20px tall**: `.facet-toggle` (130×16), `.sort-opt` (42×16), `.bib-action`
(28×16), `.language-opt` (21×20). Fixed by keying the sizing to **input method rather than
viewport width** — `@media (--touch)`, a custom-media query the system had _defined but never
used in a single file_. A touchscreen laptop needs the room; a narrow desktop window does not.
Verified: desktop is byte-for-byte unchanged (chips still 31px at 6px/8px padding, ledger still
`144px 984px`, `pointer: coarse` false), while the coarse-pointer pass now reports **15 → 1**
control under 44px.

The one remaining is `.footer-typecredit` (287×23), a credit link inside a sentence — the
SC 2.5.8 _inline_ exception, correctly exempt. Left alone deliberately.

Also raised unconditionally to 44px (these only ever render on touch surfaces or are primary
navigation): the hamburger (was 40px — `responsive.spec.ts` pinned that value, so its assertion
moved to 44), the mobile panel's close button and site title, and mobile dropdown links.

Nothing here is a WCAG failure — SC 2.5.8 AA requires only 24×24, and the spacing exception likely
covered several. This is the roadmap's own 44px standing rule, which is above the legal floor.

**2026-08-16 — 0.4 detector hook — enabled.** `.impeccable/config.json` written, local consent
recorded. UI edits from here on are auto-scanned for anti-patterns. No ignores configured yet;
if it trips on `.hbar`'s gradient, that is the expected first false positive — add an
`ignore-value` for it rather than changing the bar.

**2026-08-17 — 1.1 typography (`/impeccable typeset`) — done.** Three findings, two fixed here
and two deferred as 1.4/1.5. The mechanical scan (`--scope type`) was clean before and after;
everything below came from the design assessment, which is the point the reference makes about
a clean scan being a floor rather than proof.

**(a) The reading measure was uncalibrated across the whole site — and the error was conceptual,
not sloppy.** `ch` is the advance width of the digit **zero**, not of one character. Newsreader's
average character measures **0.68–0.73ch** (it narrows against the lining figures as the `opsz`
axis opens at display sizes), so every `ch` cap in the codebase was setting roughly 40% more
characters than its number implied. `--text-max-width-reading: 65ch` was rendering **87–95
characters**. The method was validated with a monospace control that returned a ratio of exactly
1.000, so this is measurement, not estimate. A Playwright sweep over twelve routes, restricted to
true text leaves, found **24 of 33 prose blocks over 75 characters**; CV entry descriptions ran to
**147**. Below that sat ~25 hand-tuned values spanning eleven different numbers (40/48/52/55/60/62/
64/65/66/68/74ch) — a collection of arbitrary values rather than a scale, and several prose blocks
(`.project-prose`, CV descriptions, `.entity-abstract`, `.featured-desc`) had no cap at all.

Replaced with three calibrated role tokens — `--measure-prose` 50ch (~69 chars), `--measure-standfirst`
42ch (~61), `--measure-note` 40ch (~55) — applied by role across 24 files, with the ch↔character ratio
documented at the token. `.standfirst` now carries the measure once in `ink-signal.css`, so
`.index-standfirst` (52ch) and `.dh-hero-standfirst` (74ch), which existed only to fight the idiom,
were deleted along with their markup classes. Result: **24 → 0** genuine prose blocks over 75; every
one now lands between 52 and 71. `/style-guide` gained a "Reading measure — counted, not assumed"
block that measures all three roles live in the browser rather than restating the token, matching how
the guide already documents colour.

**Deliberately left uncapped** (recorded in `DESIGN.md` as part of the new rule): bylines, and the
citation/venue lines in `.entity-details` and CV Education/Publications entries. Those are scanned
metadata, wrap to 1–2 lines, and capping them would add lines to a reference list for no reading gain.
The sweep still reports them, correctly, as over 75.

**(b) A fourth voice was wired into the system.** `--font-family-sans` — a system stack the brief says
does not exist — was set in **9 places**: the `body` reset and, more consequentially, all seven ECharts
containers plus `.viz-plate`. It was inert today only because every SVG `<text>` and every ECharts
`textStyle` happens to name its own family; anything added without one would have silently left the
system. The token's stated justification ("fallback for form controls") was false — the reset already
gives controls `font: inherit`. Retired the token outright and pointed the viz containers at the data
voice, which is what chart chrome is.

**(c) Glyph coverage, measured rather than assumed.** All three families carry the full French set, so
the roadmap's original question resolves clean. Widening it to the actual corpus found a real gap:
**Spline Sans Mono lacks the Yoruba underdots `ẹ` and `ọ`**, which occur in author names in the data
(`Kọ́lá Túbọ̀sún`, `Adéjọkẹ Rafiat Adétòrò`), and co-author labels render in the mono data voice.
Newsreader is now spliced into the mono stack ahead of the system fallbacks, so a hole in the primary
face is filled by a font the site already ships rather than by Courier New. Digits and Latin are fully
covered by Spline, so the tabular grid is untouched. (The U+0300/U+0301 "misses" my first probe reported
were an artifact — combining marks are zero-width, so a width test cannot see them.)

**One regression, caught by the suite and worth recording.** Capping `.cv-entry-content` — the whole
ledger column — made the mono `.dh-links` address rows wrap, which stacked 15px link targets closer than
24px and failed **WCAG 2.5.8** on `/cv`. `npm run test:e2e` caught it. The fix is the general lesson:
the measure belongs on what is _read_, not on the column that contains it. Retargeted to
`.cv-entry-content :global(.text-sm)`, leaving scanned metadata full width; all 8 a11y tests pass.

**Also noted:** `<h6>` is used **nowhere** in the codebase. The 0.2 audit spent real effort resolving an
h6 contradiction "as documentation, not code" across `DESIGN.md`, `CLAUDE.md` and the sidecar — the
element it documents is dead CSS. Left as is (the rule is still correct if h6 is ever used), but the
next doc pass should say so.

**Corrected in `DESIGN.md`:** the Headline tier claimed `h2` was `clamp(1.875rem…2.109rem)`; that is
`h3`'s size — `h2` is `--font-size-3xl` (`clamp(2.344rem…2.637rem)`). Both steps are now recorded, along
with a new **Measured Line Rule** and a Don't against raw `ch` caps.

**Method note:** the bundled detector's parser dependencies were **gone** — the v4 plugin update wiped
them exactly as the 0.2 caveat predicted. Reinstalled (`npm install --no-save --omit=dev --omit=optional`
in the plugin root) before trusting any scan. Also worth knowing: the degraded path only triggers for
HTML/URL scans, so a silent CSS/Svelte scan is not evidence the deps are present — check directly.

**Ship gate:** `format`, `lint`, `check` (1101 files, 0 errors), `test` (701 unit), `build`,
`check:build` (bundle 102.8/140 KiB, 196 sitemap URLs resolve), `test:e2e` (32 passed) — all green.
Detector clean across all 35 changed files.

**2026-08-17 — 1.2 layout rhythm (`/impeccable layout`) — done.** Note first that two of the three
named targets do not exist: `EntityListPageLayout` and `FilteredListDisplay` were dissolved at some
point and the index pages now compose `entity-index.css` + `EntityFilterBar`/`EntityFacetGrid`
directly. CLAUDE.md still lists both under "Component Organization" and should be corrected on the
next doc pass. `EntityDetailLayout` and `.ledger-row` are real. The mechanical scan (`--scope layout`)
was clean before and after; all three findings came from the design pass.

**(a) The 1px rule tier was drawn in two different colours, split by page family — and the flagship
idiom was in the wrong one.** 39 rule-tier declarations used `--color-border`; 25 used
`--color-border-light`. `.ledger-row` — the universal record idiom — was in the first group, so
`/teaching` and `/cv`, two adjacent record listings, drew the same structural mark in visibly
different colours, and the style guide's own `.scale-row` demonstrated a third position. Both values
were introduced in the **same commit** (777c13e5), so this was never a two-tier decision that drifted;
it was inconsistency baked in at the redesign.

Three independent sources say separators are the lighter value: the token comment
(`/* 1px row separators (hairlines) */`), DESIGN.md's colour list, and — decisively — the **PDF CV
generator**, a hand-maintained shipped artifact that defines `BORDER: #c9c0aa` and
`HAIRLINE: #dcd4be — Row hairline separators` as separate constants. The web CV already matched the
PDF; the ledger did not. Resolved on that evidence, not on the 39-vs-25 majority: a rule separates and
is the lightest mark on the page, a plate edge defines an object and sits a step darker, which is also
what print typography does.

The cause was the token's **name**: `--color-border-light` reads as "a lighter border," so reaching for
`--color-border` on a rule never felt wrong. Renamed to **`--color-hairline`**, which pairs by name with
`--rule-hairline` and makes the correct declaration self-evident. 64 declarations now follow one rule:
`--rule-hairline` + `--color-hairline` for a rule, `--border-width-thin` + `--color-border` for a box
edge. Fixed both directions of the crossing — four separators that used the box-edge width token, and
three box edges (`.cv-container`, `VizChartCard`, `AudioVisualization`) drawn in the rule colour or
using `--rule-*` in a `border:` shorthand. One sanctioned exception recorded: `.bib-item--lead`, which
marks the featured entry with a deliberately heavier `--color-border-dark` rule.

**(b) The filter bar was the one unruled module on the index pages.** Every other region pairs a rule
with its top padding — hero 4px, facet grid 1px, bibliography 3px, filter-bar-bottom 1px — while
`.filter-bar` carried `padding-top: 16px` with `border-top: 0` at **all four breakpoints**, leaving the
page's primary interactive region undrawn and 16px of orphan space above it. In a system whose stated
hierarchy is drawn in rules, that is the one region you cannot find by weight. Given a 3px rule, so the
stack now reads **4px masthead → 3px controls → 1px facet subdivision → 3px record**: rule weight alone
now says there are two major modules under the masthead, with the facet grid subordinate to the first.

**(c) The rule → content interval had four values for one role.** The `.section` idiom and DESIGN.md
both specify 12px, and six modules obeyed; `.index-hero` and `.bibliography` used 16px, `.facet-grid`
and `+error.svelte` used 24px. Extracted as **`--rule-gap`** and applied to all eight ruled modules, so
hierarchy is carried by the rule's weight and never by the interval. Verified 4px/3px/1px/3px with a
constant 12px gap at 375 / 768 / 1024 / 1440, both themes, no overflow.

**Guard added.** `src/styles/hairlinePairing.test.ts` parses every authored CSS and Svelte `<style>`
source and asserts the pairing in both directions plus the `--rule-gap` interval. This is the piece
that was missing: crossing the pair fails _silently_ — a separator in the edge colour just looks like a
plate — which is how 39 declarations sat one step off for three months with lint, check and the browser
all green. Each of the three assertions was **verified to fail** by reintroducing the real defect, and
the suite guards its own glob so it cannot pass vacuously.

**Also removed:** a dead `prefers-reduced-motion` block in `VizChartCard` cancelling a
`transform` that no longer exists anywhere in the file (the lift was removed in c74df27b), and a dead
`:global(html.dark)` border-colour override in the same file that restated the light value — the tokens
already flip. Fixing the latter surfaced that the card's rest→hover darkening had collapsed; restored
as `--color-border` → `--color-border-dark`.

**Declined:** nothing proposed by the skill conflicted with the brief this session.

**Ship gate:** `format`, `lint`, `check` (1102 files, 0 errors), `test` (708 unit, +7), `build`,
`check:build` (bundle 102.8/140 KiB, 196 sitemap URLs resolve), `test:e2e` (32 passed) — all green.
Detector clean across all 46 changed files; parser deps confirmed present before trusting it.

**Method note:** screenshots time out on this renderer, so every claim above rests on computed-style
reads taken after swapping the `html` class and disabling transitions. That is sufficient for rule
weights, colours and intervals — all discrete values — but it is why 1.5 (midnight type compensation),
which needs optical judgement, still cannot be done in this kind of session.

**2026-09-08 — 2.2 publications index, facet apparatus (`/impeccable critique` → fix) — done.**
Session run with the orchestrator/agent split (Fable directing, one Opus agent per item; the
2.3 agent ran concurrently). Eight findings scored; five fixed here. The finding-aid's two open
facets were laid out as if they were closed ones: "All 95 tags ↓" expanded twelve chips into the
whole vocabulary (117 on current data) and "All 60 co-authors ↓" an eight-row ledger into sixty,
growing the page by a screen and a half while the three neighbouring columns ended at ~200px and
left three quarters of the apparatus as empty paper — the opposite of the density the brief asks
for. Worse, a value the cut hid was _unremovable_: a `?tag=` deep link from a detail page, or a
pick at rank 60, filtered the bibliography while rendering no control at all. Replaced both toggles
with **`FacetCombobox`** — the WAI-ARIA editable combobox with list autocomplete
(`aria-activedescendant` over a `role="listbox"`, arrow/Home/End/Enter/Escape/Tab, click-outside
close, no blur on pick because multi-select is the norm here). Cast strictly: the field is
machine-facing so it is the data voice and mirrors `.pub-search`; each row is a ledger line (9px
marker, serif value, mono count, hairline between) so the overlay reads as the same apparatus as
the columns it hangs under. The listbox is a **plate, not a card** — paper ground, 1px border,
square corners, no shadow, top edge collapsed onto the field's — capped at eight rows and
scrolled, and `position: absolute` deliberately: overlaying what follows is precisely what kills
the empty space. The printed head of each facet stays frequency-ranked (real data as ornament);
only the tail moved behind typing, and any selected value the cut would hide is merged back into
the visible chips/rows (`visibleFacetOptions`) so a deep link is always switchable off in place.
Matching folds case, diacritics and curly apostrophes (`cote` → Côte d'Ivoire) and ranks by the
live disjunctive count, extracted to `facetSearch.ts` with 18 unit tests. Orchestrator's one
refinement after the browser pass: Enter with a typed query and no active option commits the top
match — the APG-strict version silently did nothing on `cote ⏎`. Also moved the **"N filters
active · M matches / Clear all ✕"** summary out of the tags column and out of the grid: it is a
statement about the whole narrowing, and living inside a module that is `display: none` below
`--lg` meant phones with facets closed had neither a match count nor a way to clear. Midnight
caught by token reasoning: the first draft grounded the plate in `--color-surface-elevated` and
its hover row in `--color-background-muted`, which both resolve to `--sys-color-film-200` — the
plate would have swallowed its own selection; regrounded on `--color-surface`. Idiom extracted to
`ink-signal.css` (with `--touch` 44px targets) and documented live on `/style-guide` § 5.
**Browser-verified** (dev server, computed reads + screenshots): typed match, Enter, arrow
toggle, URL sync (`?tag=Data+Sovereignty&tag=Digital+Sovereignty`), rank-60 deep link rendering
its chip, 44px input at 375px with the summary visible while the grid is collapsed, both themes.
**Declined:** the craft floor's glyph-as-icon ban — the brief casts `↓ ↑ ✕` as mono stamps.
**Left for later:** the countries facet still truncates nine values at eight; the five facet
`<h2>`s sit at section level in the document outline (a document-outline pass).

**2026-09-08 — 2.3 communications detail (`/impeccable critique` → extract → rebuild) — done.**
Eight findings, all fixed. The headline one is that `/communications/[id]` was not a weaker
version of the publication record but a _different template_: metadata inside the reading column
as a `DetailsGrid`, panel papers and participants as bordered cards, and the access links six
screens down under the tags in ink rather than accent; pine appeared ~10 times per screen (every
participant role was an accent stamp). The fix was extraction, not a second implementation.
**`RecordLayout`** (`components/common/`) now owns what is true of any record — editorial
breadcrumb, mono-eyebrow/Archivo/serif-italic masthead, the `minmax(0,1fr) 380px` grid with the
sticky rail, the `--lg-down` `display: contents` order choreography, and both JSON-LD injections —
exposing `main` / `railPrimary` / `railSecondary` / `related` snippets. The rail is split in two
because that ordering is the design: block one identifies and opens the record and belongs beside
the title, block two indexes it and belongs after the document it indexes. `pub-*` classes renamed
`record-*`; `PublicationAside` split into `PublicationRecordRail` + `PublicationIndexRail`, and
`CommunicationRecordRail` mirrors the first. One real bug surfaced in the move: the rail's base
`display: flex` and the breakpoint's `display: contents` carry equal specificity, so the base
declaration only survives by preceding it — commented at the site. **The metadata ledger is now a
named idiom:** `.meta-ledger` moved into `ink-signal.css` alongside `.rail-label` / `.rail-plate`
/ `.rail-cta`, rendered by `<RecordLedger rows label>` and documented on `/style-guide` § 4 as
_not_ a `.ledger` variant — the ledger sets a record (mono key against serif content, because the
content is authored), the meta-ledger sets a record's catalogue entry, where both columns are
strings a database could hold, so both are the data voice over a 5.5rem key. **Papers and
participants became ledger rows**, keyed by programme order (`01`, `02`) and by role (`CHAIR`,
`SPEAKER`, `—`), retiring the last cards-in-the-reading-column on the site and the two-up
participants grid that gave the text-heaviest records the least measure. Pine is down to four
countable occurrences per screen: the role stamps became ledger keys in faint ink, and the buried
ink `btn-primary` became the rail's single `btn-accent`, with a "View slides ↓" jump to the
embedded deck (previously an anchor nothing linked to). Also consolidated: `formatByline`
(`utils/byline.ts`, 6 tests) replaces three copies of the same name-joiner — deliberately not in
`nameUtils`, which the MCP server bundles; `AbstractSection` and `PublicationAside` deleted as
dead; `getCommunicationTypeBadge('podcast')` no longer falls through to the raw lowercase type;
`SlideDeckEmbed`'s poster slot corrected from 1150px to 580px now that the deck sits in the
reading column. **Browser-verified** on a plain paper, a panel with papers, an event with
participants, the deck+map talk and the podcast (Episode row), plus `/publications/[id]` parity,
daylight and midnight, 800/1440px. **Declined:** a "Slides" eyebrow token (a deck is an action,
not a fact about the record); and three `craft-floor.md` defaults the brief overrides — its ban on
eyebrows, its ban on `01/02/03` keys (here programme order is real information the Ledger Default
Rule wants hung), and its 65–75ch floor, superseded by the Measured Line Rule. **Deferred:**
`ResearchProjectLayout` is already the same page structurally and should adopt `RecordLayout`
once four differences are absorbed (no breadcrumb, a standfirst where a record has a byline, an
undivided rail, its own gap values); `EntityDetailLayout` is down to two consumers, for 2.6/2.7.

**Ship gate for both (one commit):** `format`, `lint`, `check` (1090 files, 0 errors), `test`
(744 unit, +24), `build`, `check:build` (shared JS 106.2/140 KiB; 197 sitemap URLs resolve),
`test:e2e` (32 passed, 1 skipped). Detector clean on every changed file; the detector's parser
deps were absent again after the plugin update and the Svelte/CSS scan path was confirmed to run.

**2026-09-08 — 2.2 publications citation path (`/impeccable critique` → fix → polish) — done.**
Eight findings; all fixed bar one held back by file scope. The headline is that the flow the
site exists to serve ended in a promise: the index row's trailing action was labelled **`CITE`**
and was an `<a>` to the record page, which then printed no citation either — a `Record` ledger
of atomised fields and an `Export BibTeX` download you must open to read. Meanwhile
`mcp/src/citations.ts` had assembled a plain-text display reference for assistants since it
shipped, so the one consumer of this record that could not get a reference out of it was the
site. Resolved by moving that assembly into **`formatReferenceText`** in `citationFormatter.ts` —
where CLAUDE.md and the MCP file's own comment both said it belonged — and having `citationFor`
delegate to it, so page and server can never disagree about the same work. `generateBibtex()` is
untouched; the `reference` style changed in exactly one deliberate respect, **the title is now
typeset**, ending a mixed register where a straight apostrophe in the title sat against a curled
one in the journal name of the same line. `mcp` `tsc --noEmit` and `npm run build` both green.
`CITE` is now a real control — a `Button bare` so `.bib-action` styles it without `!important` —
that copies the reference and **reports its own result** (`Cite → Copied ✓ → Cite`, or
`Copy failed`, because a control must not claim a copy a denied clipboard never made);
`clipboard.ts` is the async API with a selection-copy fallback and no dependency. The record page
gained the **`.cite-block`** idiom (rail label, the reference set as real serif text, then
`Copy reference` + `Export BibTeX`), which also separates the two errands the rail was conflating
— `rail-cta` opens the record, `cite-block` cites it — and setting the text rather than hiding it
behind the button is the fallback when the clipboard is refused. One rule resolved three findings
at once: **facts belong in the kind eyebrow, destinations in the action column.** `Open Access`
was an action _label_, reachable only in the `else` branch after `publication.doi`, so it was
withheld from **21 of the 27** open-access records — precisely those a peer most wants it for —
while the detail masthead printed it for all of them; it is now an eyebrow note in soft ink,
matching the masthead, and the action column keeps one entry naming where the address goes
(`DOI ↗` / `Full Text ↗` / `Publisher ↗`). The row's third link to its own page went with it
(plate, title and `Cite` all resolved to the same URL under three different accessible names).
**Pine scarcity failed on the detail page by repetition rather than by any single wrong
decision:** an edited volume with twelve chapters and three reviews carried ~23 accent marks,
twelve of them ToC numerals. Entry numbers are ledger keys and take faint ink (the same move 2.3
made for participant roles), a review's DOI is somebody else's identifier and takes emphasis ink
— leaving exactly one accented DOI per page, meaning "this work's" — and the hanging review
quotation mark is a printer's mark, not a signal. ~23 → ~8. Also fixed: three records carrying a
DOI with no `url` printed **no access control at all** (the rail now falls back to the resolver,
as the index row already did), and the CTA stack is printed only when it holds one.
**Browser-verified** (computed reads, midnight): every row's action is a `<button>`, DOI-carrying
OA records print `· OPEN ACCESS` in the eyebrow, a real click flips the label to `COPIED ✓`
inside an `aria-live="polite"` control, the cite block's reference wraps inside the 380px rail.
**Declined:** the craft floor's eyebrow ban and glyph-as-icon ban (the brief casts both), its
65–75ch measure (Measured Line Rule), and `--color-danger` for the failed copy — DESIGN
restricts danger to form validation, so the failure is carried by words. **Left for later:** the
empty-results state does not state the corpus size once cleared (fold into 3.1).

**2026-09-08 — 2.1 home (`/impeccable critique` → fix → polish) — 22/32 as found → 25/32.**
Scale: Nielsen's ten, heuristics 7 and 10 marked `n/a` (a static reading page has no
accelerator or help surface), so the applicable maximum is 32. **Proposed Phase 2 target:
28/32** — no dimension below 3, three at 4. 2.1 deliberately does not reach it, and the gap is
named rather than papered over. Ten findings, eight fixed. The headline is the item's own
subject: **the masthead asserted twice and the apparatus never answered.** The site holds 56
publications, 84 communications, 35 activities and a tracked citation graph, and the home page
rendered none of it as data — the record's scale appeared only as English words inside sentences
("more than 17,500 items"), precisely the claim PRODUCT.md says must be demonstrated rather than
asserted. The one machine-voiced block, "Latest Activities", rendered dated records as
`.card-accent-border` tiles with a pine hover border — a **Ledger Default Rule** violation that
also made the home page disagree with `/activities`, which draws the same records as
hairline-separated ledger rows. Rebuilt as five `.ledger-row`s on a 4.5rem key (`08 SEP` over
`2026`), one type step below the reading column because a rail points at a record rather than
being one; the label gained the log's own tally (`35 IN THE LOG`) and the three year buttons
became the **year meter** — mono year, `.hbar` proportion bar, tabular count, newest row in pine.
Three real data marks where there were none, at zero bundle cost from a dataset the page already
loaded, and the rail is now built purely from the global idiom layer so the home page **stopped
downloading `activity-list.css`**. The meter moved to `ink-signal.css` with a `--touch` 44px row
and is documented on `/style-guide` § 6, which also closes one of 0.3's three gaps: `.hbar`, the
system's most misreadable element because it is its one sanctioned gradient, is now explained on
the guide as a hard stop whose position _is_ the value. **The measure was the worst on the site
and 1.1 never saw it:** the sweep capped `.prose`, but this page uses `.content-body`, which
carried no measure — so at 1440 an 832px track held 1,100 words at `--font-size-lg`, the
**Standfirst** tier, with a lead paragraph at `--font-size-xl`, the **Title** tier: about 98
characters a line, with ~380px of empty paper beside every section and the 3px rules overhanging
their own text by half. Type returned to its documented tiers, `--measure-prose` applied, and the
shell narrowed from `max-w-7xl` (an index width borrowed by a reading page) to 58rem — measure,
gutter, rail — so the surplus goes back into the masthead. The grid now steps twice (18rem rail
at `--md`, 22rem at `--lg`), fixing a band where it **inverted**: at a 768px container it computed
to a 320px reading column against a 352px sidebar. **Pine, counted:** ~28 static accent marks
down the page, ~8 on the first screen. The kicker was demoted to ink — a standing description of
a person is the opposite of "the current thing" — the activity-type stamp and three card hover
borders went, and one accent was added on the newest year, leaving **one** chrome accent on the
first screen. The ~26 prose links remain and are the honest remaining failure: that is the
site-wide `typography.css`/`ContentBody` idiom, **assigned to 4.2** rather than changed from a
single page. Also fixed: `.panel-title` rose to `--font-size-xl` under `--sm-down`, a mono
headline on a phone; `.hero-kicker` was `display: none` at `--sm-down`, taking the one line that
says what this person _is_ off the exact viewport where the standfirst runs to five lines; and
`ContentBody`'s inset started every section rule 32px inside the nameplate rule above it. **The
1.2 guard was widened and immediately earned it.** Two ruled modules sat at 16px instead of
`--rule-gap`, both invisible to `hairlinePairing.test.ts` for structural reasons — the home page
declares its padding _above_ the border and the guard only scanned forward; `.panel--ruled` used
the `padding` shorthand and the guard only matched `padding-top`. Now ±4 lines and both
spellings, each blind spot **verified to fail** when reintroduced. It found four more:
`.activities-layout` (24px), `.aside-footer` (16px) and `UpcomingCommunications` (right value,
wrong token) are fixed, and `.site-footer` is a named single-declaration exception — its 4px rule
_closes_ the page rather than opening a module, so the interval beneath it is the colophon's
page-end margin and 2.11 owns it. **Browser-verified** (computed reads; screenshots timed out
on this renderer again): nameplate wraps to two lines at 1440 inside the 58rem shell — the one
visible change the owner should judge by eye; grid `480px 352px` at 1440 and `369px 288px` at
768; kicker in ink and visible at 375; panel title mono at 12px; meter rows 44px on touch; no
horizontal overflow. **Declined:** the corpus stat ledger that would properly answer the
reassure half — every honest count costs bundle weight on the LCP-critical landing page, and the
free candidate (`referenceIndex.generated`, already loaded) is a render-only projection with
collision-keyed entries reporting 44/79 against 46/80 source files, so it would print a number
disagreeing with `/publications`. The right fix is a **fifth build-time generator emitting a
counts constant** under a `--check` gate; likewise a masthead edition stamp, since
`profile.dateModified` is hand-maintained and already reads 2026-08-12. Also declined: a
portrait `plate-caption` (the photograph's provenance is not recorded and inventing it is out of
the question), and four `craft-floor.md` defaults the brief overrides — its ban on eyebrows, its
refusal of the "hero-metric template" against DESIGN.md's named **Stat Ledger**, its 65–75ch
measure floor, and its glyph-as-icon ban. **Left for later:** the mid-task peer still has no
route from the page body to the publication record (the only one is a prose link in the eighth
paragraph); `RelevantItemsList`, `RelevantItemCard` and `cards.css`'s `.card-accent-border` are
now unreachable from any route and should be deleted; the home portrait ships a single raw
`<img>` with no srcset into a 288–352px slot (5.1).

**Correction to the 2.1 entry (orchestrator, same day):** `RelevantItemsList` and
`RelevantItemCard` are _not_ dead — `ResearchProjectLayout` still reaches them through
`RelevantPublications` / `RelevantCommunications`, so only the `cards.css` comment naming
`LatestActivities` as a consumer is stale. Nothing deleted.

**2026-09-08 — 2.5 research index + project pages (`/impeccable critique` → adopt → polish) —
17/32 as found → 25/32.** Same scale as 2.1 (heuristics 7 and 10 `n/a`). Nine findings; seven
fixed, two declined to data that is authored rather than laid out. The headline is the one 2.3
predicted: `ResearchProjectLayout` was not a variant of the record shell but a **second copy of
it**, agreeing with `RecordLayout` on every structural decision that mattered —
`minmax(0,1fr) 380px`, sticky rail, `display: contents` order choreography below `--lg` — and
disagreeing only where neither had a reason: a row gap of 24 against 48, a column gap written
`--space-16` in one file and `--space-3xl` in the other (**the same 64px**), an h1 at weight 800
against 820, and a deck whose `.standfirst` + two overrides computes to exactly `.record-byline`.
Three of 2.3's four blocking differences dissolved on inspection — the "no breadcrumb" difference
was a _different_ breadcrumb, and the record's editorial back-link is the one the system settled
on; the undivided rail is `railPrimary` with `railSecondary` omitted, which the shell already
supported — so the layout is now a **composition** over `RecordLayout`, and the only extension
that took is an optional **`deck` snippet**: a snippet rather than a string because the caller owns
the idiom class, which is why the change adds no CSS to the shell and leaves `/publications/[id]`
and `/communications/[id]` byte-identical but for an empty render anchor. **2.3's fifth claim was
wrong and is reversed:** the rail's `.stat-ledger` was that class in name only — it overrode the
flex row into a grid, added hairlines, padding and its own key width, keeping nothing but the font
stack — and what it actually sets (Period / Co-director / Funder / Programme / Grant / Regions) is
six strings a database could hold in a 380px rail, which is `.meta-ledger` by the idiom's own
stated test. It is now `<RecordLedger label="Project">`, and the rail's plate, label, chips and
buttons likewise moved onto `.rail-plate` / `.rail-label` / `.chip-row` / `.rail-cta` + `.btn`,
retiring ~150 lines of `aside-*` reimplementation. Three defects surfaced in the move. **The
Funding panel had been drawing two stacked 3px rules on five of six pages:**
`.project-prose :global(h2)` at (0,2,1) beat `.panel-title` at (0,1,0), so `<RelevantGrants>`
printed a second section rule 12px under its own and swapped its mono label for an Archivo
headline — the descendant selectors are now direct-child selectors, which also stops the panel's
grant rows inheriting the prose measure and a stray margin inside a flex column that already sets
its gap. **The same project read as two different periods depending on the page:** the index
formatted `2026-` as "Since 2026" while the masthead and the rail printed it raw with the hyphen
dangling; `formatProjectPeriod` (`utils/projectPeriod.ts`, 6 tests, one of which asserts no
project on the site can print a trailing hyphen) is now shared by both. And **the funder had to
leave the masthead**: an eyebrow token is `white-space: nowrap`, which is right for "Journal
Article" and fatal for "Social Sciences and Humanities Research Council of Canada (SSHRC)" — it
now prints in the rail's Funder row, where a catalogue entry belongs, and on the index entry's
credit line, which wraps. **The index now does what its own comment had said for months** and the
code had abandoned: one broadsheet dossier for the flagship and ruled ledger rows for every other
project, current and concluded, from one shared snippet, so the Ledger Default Rule holds and the
section head is the only thing distinguishing running work from finished. Each row closes with
what funds or hosts the project — real apparatus from the record at no bundle cost — and
`Read more →`, five pine stamps nested inside five links, is gone because the row _is_ the link.
Each dossier had also shipped **three links to one URL under three accessible names** (plate alt,
title, action), the defect 2.2 fixed on the bibliography row; the plate stays clickable for the
mouse and leaves the tab order and the accessibility tree. Pine on the index: **12 → 5**
(browser-verified: three period bars, one dateline, one `Explore project →`). In the narrative,
deleting `.project-prose :global(a)` — dead but for `color: accent`, since the site-wide rule at
(0,3,2) already won every underline property — returns ~15 citations from solid pine text to the
ink-plus-pine-underline idiom every other prose page uses. Also: all six research plates had been
shipping their 1280px source (the index entry plates into a 96px box), though 400/800 variants
were generated and committed; both sizes now carry `srcset` and a truthful `sizes`. **Orchestrator
follow-up after the browser pass:** the two authored captions carried their own `Fig. 1 —` stamp
in the data, so the DRE page printed `Fig. 1 — Fig. 1 — AMIRA…`; the stamp is stripped from both
records and the `figCaption` type now says the rail adds it. **Declined:** per-project output
counts on the index — the best remaining apparatus and the item's own question — because they
mean importing two datasets into a route that loads none, and `check:bundle` reads a build the
agent could not produce; the four vacuous plate captions and the four alt texts that repeat the
title, both in authored records — the code no longer fabricates a caption, so those four plates
now print none; and three `craft-floor.md` defaults the brief overrides (its eyebrow ban, its
glyph-as-icon ban, its 65–75ch measure). **Left for later:** `PageHeader` draws a page-level
separator with the box-edge token at 1px where the Rule Hierarchy implies a 4px masthead rule — a
~15-route change, for 2.11; four of six records carry no `subtitle` and no `figCaption` and four
narratives are unsectioned paragraph runs, which is authoring, not layout, and is the whole of the
gap to the 28/32 target; per-project output counts want the first session with a build.

**2026-09-08 — 2.4 CV + timeline (`/impeccable critique` → fix → polish) — 19/36 as found →
28/36.** Scale note: heuristic 10 is `n/a` (a reference document has no help surface) but **7 is
scored**, unlike 2.1 — `/cv` has real accelerators — so the applicable max is 36 and the 28/32
target reads as 31.5/36. The session does not reach it and the gap is named. **The headline is
that the page with the most links on the site painted every one of them pine.**
`#cv-content a { color: var(--color-accent) }` inverted the site's own link language — ink text
with a pine underline in prose — across 42 DOI stamps, the `[Link]`/`[Listen]` actions, review
journals, award and grant titles, project addresses and five contact handles: ten to fifteen
accent marks per screen, one per row down the publications run, on a document where nothing is
"the current thing" except one post. The id selector was also why two components' quiet colours
were dead — `.doi-link` (soft ink) and `.verification-badge` (muted ink) are `0-1-0` and lost to
a `1-0-1` page rule — so both rendered accent instead of what their author wrote. Replaced by
`:where()` at `0-0-1`, with **nothing substituted**: the base `a` and the global prose underline
now apply as everywhere else, and pine on the sheet is the dateline plus the one standing
appointment (browser-verified: exactly two accent strings on `#cv-content`, DOI stamps in soft
ink). Deliberately not extended to the three open-ended affiliations: an accent marking half a
section marks nothing. **Ledger discipline was the item's other half, and 1.3's finding was still
standing here:** the CV wrapped rows in the shared `.ledger` container but drew the row itself
**five** ways — `.cv-entry` plus four bespoke classes with their own padding, hairline and
last-child rule — and four of them hung **no key at all**. `CVEntry` is now the shared
`.ledger-row` in a new **`.ledger--tight`** density variant extracted to `ink-signal.css` and
documented on `/style-guide` § 4 (justified, not merely smaller: ~250 rows across seventeen
sections, where the default padding costs a screen and a half of blank paper). Languages key on
proficiency with the language as serif content — it was drawn inverted, the mono stamp pushed to
the right margin; Affiliations hang the membership period that used to sit indented **inside**
the row; Fieldwork hangs its years; Computer Skills takes a wide classification key.
`yearWidth="auto"|"fixed"` was a 0.5rem distinction nothing needed and is gone, so one key
column runs down the whole sheet (browser-verified: 219 ledger rows on two key widths, 6.5rem and
the wide 15rem; every row stacks at 375 with no overflow). **The sheet's own title was the
least-ruled thing on it** — seventeen 3px section rules and no masthead — and the contact block
closed with the box-edge pair where a separator belongs, the silent crossing 1.2's guard exists to
catch; `CVHeader` now opens on `--rule-masthead` and closes on the hairline pair, and its contact
block moved from **serif to the data voice** (an institutional address is the plainest database
column on the site, and `.dh-links` already casts addresses mono further down the same page).
**The PDF export's tokens described an Ink + Signal sheet the generator never drew.** By grep:
`COLORS.ACCENT`, `RULE.SECTION`, `RULE.HAIRLINE`, `SPACING.SECTION_RULE_GAP`,
`SPACING.ENTRY_PAD_TOP` and `FONT_SIZE.YEAR` had **zero uses**, while the module docstring
claimed a pine eyebrow, heavy ink section rules and "ledger rows separated by ink hairlines,
exactly like the web CVEntry". What shipped was four rules all at 0.2–0.3mm in one colour, the
section rule _underlining_ its head instead of opening it, no row separators at all, no pine
anywhere, and — the only place on the site this survived — **the hanging key cast in the display
voice**, bold Archivo at body size in full ink where the page hangs a faint mono stamp, with
Languages exactly inverted against the screen. All corrected against the tokens that already
existed; the trailing line that closed a row moved above the next row's hairline, so adding a
separator to every row costs under one page. The export embeds the real faces (eight TTFs, all
three voices) and no font files or import shapes changed, so jsPDF's lazy chunk boundary is
untouched. **The `TEXT` orphan (0.2's deferred decision) is retired:** `#3a352a` traced to no
token and existed only in the exporter; the system owns three ink steps, the printed CV is the
same document as the web CV, and the web CV sets its body in `--color-text` — a softened body
ink is a screen habit and softening in print is the wrong direction anyway. Mapped to
`--color-text` (11.4:1 → 17.1:1 on paper), and `designTokenParity.test.ts` now has **no
exceptions**, its pin replaced by an assertion that the mapping covers every entry in `COLORS`.
The browser print sheet was forcing pure black on `body`, so the two exports of one document were
set in two palettes; it takes ink now. **New guard `pdfCvLayout.test.ts` (12 tests):** the export
is a shipped design artifact no browser check ever sees, and prose in a docstring is not a guard
— that docstring was wrong on four counts for months. `CvPdfLayout` takes its jsPDF by injection,
so a recording stand-in pins the voice of every string, the rule tiers as three distinct
descending weights, that the section rule precedes its head, and that pine appears on an ongoing
key and only there; **verified to fail** by reinstating the display-voice key. Also found and
fixed: `measureRichTextHeight` defaulted to Helvetica metrics while `renderRichText` rendered in
Newsreader, so every page-break line count was taken against the wrong font; and `renderRichText`'s
text colour defaulted to pure black. **Elsewhere:** the PDF button swallowed failures into a
DEV-only console line — indistinguishable from a blocked download — and now reports "Export
failed — retry" in an `aria-live` control, carried by words because DESIGN restricts
`--color-danger` to form validation; the table of contents gained per-section row counts read off
the DOM, lost a 300ms slide-up and a `scaleY` tick transform, and got 44px touch rows — it was
~20px and 1.3's sweep missed it; `/cv/timeline` dropped a `resize` listener that padded a ~380px
chart to 70% of viewport height, and its standfirst stopped saying "hover" for marks that are
`tabindex="0"`. **Orchestrator follow-up after the browser pass:** the ongoing appointment's key
printed `2026-` with a dangling hyphen while `formatAffiliationPeriod` prints an en dash, so the
key column mixed two dashes — `formatCVYearRange` now emits the en dash too (`2021–25`, `2026–`;
zero hyphenated keys on the sheet), which the agent had flagged but left as out of scope. **The
PDF itself was not opened in a browser this session** — its design is pinned by the new
recording test, not by eyes; the owner should download it once. **Declined:** the craft floor's
eyebrow ban, its 65–75ch measure floor (Measured Line Rule), its "mono as costume" default (the
data voice is the brief's, and an address _is_ metadata), `--color-danger` for the failed export,
and replacing the ToC's inline SVGs with mono `§`/`✕` stamps — defensible under the brief but
needing eyes, so flagged rather than shipped. **Left for later:** the ToC's labels differ from the
headings they jump to (3.1); the staged lazy load populates the ToC over 400ms with no
indication; linked award and grant titles are now bold ink with no underline, weaker as an
affordance than pine text — the honest fix is the site-wide link idiom in 4.2; and
`CareerTimeline.svelte` (2.9) has a fixed 900px width inside two nested scroll containers, the
inner one hiding its own scrollbar, a `role="img"` wrapper around `role="button"` marks, and no
Space-key handling.

**2026-09-08 — orchestrator notes between sessions.** Two owner reports landed mid-batch and
were fixed directly (commit `c3c42987`): the research index drew its period strip on a
hardcoded 2013–2027 axis while a project runs to 2028, so its bar overshot the axis — the axis
now spans the records; and in the PDF export jsPDF seats text on its baseline, so the 13pt
section head rose above the 3.2mm rule gap and **the rule struck through every section title**
— heads are now seated by their top edge — while a multi-year fieldwork key shrank under the
content column; keys wrap at spaces, only an unbreakable word shrinks, and the fieldwork rows
take the wide key so `2024, 2015, 2014` sits on one line. Both checked on the generated PDF
(17 pages, downloaded with a Playwright script against the dev server — the method 2.4 lacked).
The same commit accidentally carried the 2.6 agent's staged deletion of `FeaturedDHProjects.svelte`
without the page edit that stops importing it, so **HEAD was broken for one commit**; the
next commit repairs it. Lesson: `git add <paths>` still commits whatever is already staged —
check `git diff --cached` first. All three agents of the 2.6/2.7/2.8 batch were then cut off by
an API rate limit mid-edit and resumed as fresh agents told to read the partial diff first.

**2026-09-08 — 2.8 teaching + guest lectures (`/impeccable critique` → fix → polish) — 16/32
as found → 28/32.** Same scale as 2.1 (heuristics 7 and 10 `n/a`). **The headline is that both
pages held a hardcoded second copy of a dataset `/cv` and `/api/cv.json` already read, and
both copies had drifted** — `/teaching/guest-lectures` printed **eight rows against the
dataset's nine** (the January 2017 and February 2016 deliveries of one lecture merged into a
single date string), dropped the country from every host institution while the courses ledger
one click away kept it, and `/teaching` lower-cased the terms and conflated two facts into one
key (`8 sections; fall 2013-winter 2018`). Nothing could catch it, because nothing connected the
two. Both routes now derive from `$lib/data/teaching`; the three course descriptions moved from
the route's inline copy onto the records verbatim (checked against `git show HEAD:`), where
`/api/cv.json` publishes them and the CV's citation-style line does not. **1.3's finding was
still standing on exactly these two pages:** `.course-row` and `.lecture-row` each carried a
private copy of the ledger's narrow collapse at `--md-down`, written before 1.3 moved it onto
`.ledger-row` at `--sm-down`, so these two stacked between 640 and 767px while every other
ledger on the site did not; `.lecture-date` restated `.ledger-key`'s font at a different
tracking, and `.institution-section` gave a `.section` a 48px bottom margin on top of the 48px
it already sets. All four classes are gone. **The apparatus was absent on a page whose whole job
is to be counted**: two surfaces holding three courses and nine lectures told you neither
figure, and the index's route to the sub-page was a fake record row reading "Guest Lecturer ·
Various Institutions". `/teaching` is now two ruled sections — `Courses taught · 3 courses ·
2013–2020` and `Guest lectures · 9 lectures · 2016–2022` — the second indexed **by host
institution** (who hosted, over which years, how many times), every figure counted off the same
array the full list renders, so a tenth lecture changes six printed figures with no edit. Two
idioms extracted: **`.ledger-action`** (the meta column's destination stamp, quiet ink at rest
and pine only under the pointer — a syllabus from 2020 is not "the current thing" — with the
24px/44px floors and a convergence note on `.bib-action`) and **`.section-note`** (the one
line of prose a two-word head cannot carry, which earns extraction because `VizSection` had
already written the same rule under a second name). Both on `/style-guide`, § 4 and § 3. Pine
at rest on both pages is **zero**, which is the right answer: nothing here is current. Also
fixed: the guest-lecture note described the lectures where the rows are hosts; the courses
dateline restated three visible rows and now carries the span; two syllabus links shared the
accessible name `Syllabus PDF` and are now named for their course with the visible label
leading (Label in Name). **Declined:** a year meter on the lectures (nine records over seven
years with a hole at 2021 encode nothing); a closing return link (2.3 settled the breadcrumb as
the back affordance); the craft floor's eyebrow ban, glyph-as-icon ban and 65–75ch measure.
**Left for later:** neither page has a designed empty state (3.2); `CVTeaching.svelte` sorts
both shared arrays in place, a latent cross-page mutation; `Footer.svelte`'s comment naming
`/teaching` as a page with no `h2` is stale.

**2026-09-08 — 2.7 activities index + year archive + detail (`/impeccable critique` → fix →
polish) — 17/32 as found → 26/32.** Same scale as 2.1. Resumed from a predecessor cut off
mid-edit; its idea was right and half-landed, and the index it left **did not compile**
(`typesetQuotes` called with no import). **The headline is that one section was drawn as four
templates.** The index set a bespoke masthead (`--font-size-5xl`/800/0.98 on the wide display
axis) against `.index-title`'s (`--font-size-display`/830/0.95 on the narrow one) and opened on
no rule at all; the year archive was a fourth template — a `PageHeader` with nothing above it,
every year as a horizontally scrolling `.pager` strip reporting no counts, entries in a bare
`<div>` drawing no separator; and `/activities/[id]` was the last `EntityDetailLayout` consumer
on the site. The index and the record even disagreed about what a record _is_: the row read
`type` through the shared label map ("Podcast") while the masthead badge read `panelType`
through `formatPanelType` ("Media") — the map is now the one source and `formatPanelType` is
retired. **The row is now the shared finding-aid ledger entry** the two sibling indexes already
draw: `ActivityItem` renders `<BibliographyRow>` with three additions the log's record earns —
a day + month hanging key (the year is carried by the group `<h2>`), a `summary` deck on every
row, and the keyword run as a mono `.apparatus-line`; the old local grid dropped the plate track
on rows without a photograph, so titles stepped left and right down the list. `BibliographyRow`
gained `summary`, `apparatus`, `headingLevel` and `plateSizes` props, every default the former
literal, so `/publications` and `/conference-activity` render byte-identical DOM. **The year
archive is now the index scoped to one year** — same masthead, same ledger, same browse meter in
the same ruled aside, with the accent on the year being read rather than the newest, and the
`.year-step` closing the log on a 3px rule (`← 2024 · All activities · 2026 →`). **The record is
a record:** `RecordLayout` with a new `ActivityRecordRail` mirroring `CommunicationRecordRail` —
event plate, a `RecordLedger` of Type / Date / **Year →** (the one ledger value that goes
somewhere, and what finally makes the archive reachable from a record) and the single
`btn-accent`; it also stopped dropping the record's own one-sentence summary, which the log
printed and the record page never did. Retired in the move: a dead `[data-animate]` `$effect`,
the `ContentBody` inset that started the prose a rule short of the masthead, the `.pdf-section`
box around `IframeRenderer`'s own plate, and the whole-log RSS chip trailing off a single
record; the PDF section gained the `#document` anchor the rail's "View document ↓" jumps to.
Also fixed: both empty states are designed states; the filter note states what survived
(`3 of 33`); and **both index pages shipped a nested `<main>`** inside the shell's own. **Declined:**
hero year-bars on the index (the aside meter already draws the distribution with counts and
links); a wider plate under `--sm-down` without eyes; the craft floor's four overridden defaults.
The detector's one finding (`broken-image` on a guarded dynamic `src`) is a false positive left
standing. **Left for later:** below `--lg` the aside still falls past the log, so a phone reaches
the year meter and the facets only after the whole page where `/publications` collapses its facets
behind a toggle at the top — structural, belongs with the entity-index family.

**2026-09-08 — 2.6 digital humanities index + detail (`/impeccable critique` → rebuild →
polish) — 16/32 as found → 26/32.** Same scale as 2.1 and 2.5. Resumed from a predecessor
whose index rework was kept nearly whole. **Two headline findings.** First, `/digital-humanities/[id]`
was the last full-page detail route not built as a record: no rail, a 60vh hero where every
sibling sets a rail plate, addresses and methods interleaved inside the document, a
`DetailsGrid` fed a permanently empty array since it was written, a bottom back-link duplicating
the breadcrumb, and the raw `2023-` printed as a dateline. Second, and worse, **the narrative had
no reading measure at all** — inside a 1152px `max-w-6xl` column the longest prose on the site
ran at roughly **150 characters a line**; 1.1's sweep never reached this template. Rebuilt on
`RecordLayout` from the route side, `SEO`/`MetaTags`/JSON-LD/`IframeRenderer` unchanged. **A
digital project's catalogue entry is its addresses**: a bibliographic record has a journal, a
publisher, an ISBN, a DOI, and a project has none of them — what it has is a period, now in the
masthead eyebrow as on a research project, and a set of public addresses, which pass the
meta-ledger's stated test and are now set as one in the rail (`Site` / `Code` / `Data` hanging in
the mono column, addresses stacked beside them), retiring the bespoke `.link-ledger`. **The
accent marks the live project once:** a single `site` link becomes the rail's one `btn-accent`;
with two or three no one of them is the front door, so the button is withheld and the Site row
takes the accent; the four records that are a pipeline, a dataset or an Omeka module carry no
pine at all. Chrome pine per record page: **3**. Methods moved to `railSecondary` as chips;
embeds became figures stamped `Fig. 1 — … Fig. 8 —` from their authored titles, with
`IframeRenderer`'s own 32px bottom margin zeroed three classes deep because its rule is also
(0,2,0); reviews became a keyless ledger with the quotation mark demoted from pine to muted ink.
**New idiom `.record-prose`** in `ink-signal.css`, documented on `/style-guide` § 2: the reading
column of a record whose body is authored markup — measure on paragraphs and list items, a lead
one size and one ink up, `<h2>` drawn as a ruled section head, `<h3>` a quiet serif subhead,
direct children only. `.project-prose` in `ResearchProjectLayout` is the older copy, named as
needing to converge. **The narratives were promoted a heading level** (`h3`→`h2`, `h4`→`h3`
across fifteen records, verified to live only inside `description`), closing an h1→h3 skip on
all sixteen pages. **On the index**, the predecessor's rework stands: one broadsheet dossier,
ruled ledger entries from a shared snippet, `FacetCombobox` over the sixty-method tail, `srcset`
at both plate scales, and the external/internal link branch deleted because **no record sets
`linkUrl`** — it had offered `Visit site ↗` as dead code since it was written, and every entry
now addresses its own record page (which is what the IWAC entry-point note requires). Card grid
vs ledger, decided on the records: all sixteen carry `years`, `links`, `skills`, `order` and an
image, so dated + keyed + uniformly shaped is the Ledger Default Rule exactly — a plate-carrying
ledger, the plate sharing the content column rather than becoming a card around it. **The
deleted featured component is worth recording:** it carried a hardcoded `STATS` map ("14,700+
items", "4,600+ index entries") hand-copied out of each project's prose — a second uncheckable
copy of the corpus figures on the site whose whole position is that the record is
machine-maintained. Four fixes on top: `1 projects` on any single-method filter, a hero eyebrow
printing `2018 —` beside entries printing `Since 2018`, a dead `.dh-page` class. **Declined:** a
masthead deck from `shortDescription` (it restates the authored lead); a plate caption and a
descriptive `alt` (no record authors either); extending `RecordLedger` for multi-address rows; the
`sizes` off-by-one at exactly 768px, shared byte-for-byte with the research index; the craft
floor's three overridden defaults. **Left for later:** the prose-link pine density on the longest
narrative (4.2); the interface says "methods" while the data key and URL parameter say `skills`;
no per-project scale figure survives the deleted map — the honest fix is a field on the record.

**Sweep after 2.6/2.7 (orchestrator):** `EntityDetailLayout`, `DetailsGrid`, `HeroImageDisplay`
and `ActionLinks` reached zero importers between the two items and are deleted, along with
`formatPanelType`. Every detail route on the site is now a `RecordLayout` record with its own
rail; CLAUDE.md's component map says so.

**Method note on the detector, correcting 0.2/1.1 and one of today's agents.** v4.1.1's engines
import no external parser, so the "install the deps or it runs degraded" caveat is obsolete. What
_does_ silently produce `[]` is scanning a file **outside the project root** (the scratchpad):
an in-project probe carrying `border-radius`, `box-shadow`, `rgba()` and a decorative gradient
returned a radius finding and four colour findings, as `.svelte` and as `.css`. It flagged
neither the shadow nor the gradient — so the CLI is a floor for radius and off-palette colour,
`hairlinePairing.test.ts` and the design-philosophy auditor remain the real guards for the rest,
and the 0.4 hook is the better per-edit signal.

**Ship gate for both (one commit):** `format`, `lint`, `check` (1091 files, 0 errors), `test`
(752 unit, +8), `build`, `check:build`, plus `mcp` `check` and `build`. **`test:e2e` caught a
regression the agents' gates could not:** the new cite button reserves the width of its
"Copied ✓" state, so its box came to abut the DOI link's and axe flagged **target-size** on
`/publications` in both themes (2 of 33) — the row actions are 16px mono caps that had only ever
passed on the spacing exception. Fixed in a follow-up commit by giving `.bib-action` the 24px
WCAG 2.5.8 floor on every pointer (the chips already do this), 12/12 a11y + filter specs green
after a rebuild. Lesson for the orchestrator: read the e2e count before pushing, not after.

**2026-09-09 — 1.4 tracking scale (`/impeccable extract`, orchestrated: Fable directing three
Opus agents on disjoint file sets) — done.** The premise held exactly: **125 raw `em` values across
eleven steps, and three aliases (`--tracking-heading/-eyebrow/-caps`) whose values matched nothing
in use** — the shipped eyebrow was 0.16em while its token said 0.05em, and the same nameplate
tracked -0.015em in the idiom and -0.02em on the home page that actually renders it. Inventory was
taken with a block parser that read each declaration beside its own `font-size`, `font-family`,
`text-transform` and weight, which is what let the scale be keyed to size rather than to the
number.

**The scale is eight roles in three voices, keyed to the size the string is set at.** Display
(Archivo) tightens as it grows: `--tracking-display-lg` -0.02em (nameplate, `--font-size-display`),
`--tracking-display` -0.015em (h1–h2), `--tracking-display-sm` -0.01em (h3 and below). Serif
(Newsreader) prose never sets tracking; every serif title takes `--tracking-title` -0.01em. The data
voice loosens as it shrinks: `--tracking-eyebrow` 0.16em (the kicker, one per module),
`--tracking-label` 0.12em (the 2xs caps default), `--tracking-caps` 0.06em (the compact tier — caps at
xs–sm, and 2xs caps set in runs: chips, badges, author runs, apparatus lines, chart chrome) and
`--tracking-figures` 0.03em (mixed-case mono: DOIs, tokens, counts, years). The floor is -0.02em. The
six `--letter-spacing-*` primitives are deleted, not aliased.

**Migrated 58 style sources, about 160 declarations; zero raw values remain** (`normal`/`inherit` stay legal).
Shipped changes a reader could notice, all deliberate: the mobile nav drops from 0.13em to 0.06em
because it is set at `sm`, not `2xs`, and had copied the desktop nav's tracking without adjusting
for size; `h4`/`h5` and `.bib-title` relax from -0.025em to -0.01em while `.ledger-title` gains the
same, so the universal record title and the bibliography row title finally agree; the nameplate idiom
moves to -0.02em to match the page that ships it; `.ledger-key` and `.btn` settle at 0.06em; the
viz legends open from 0.025em to 0.06em; `.section-no` and `.facet-label` join the eyebrow at
0.16em; the year-bars legend closes from 0.1em to 0.03em because it is figures. `.apparatus-line-sep`'s
margin, which had restated the run's tracking arithmetically, is now `calc(0.6em + var(--tracking-caps))`
so it follows the token. **Guard:** `src/styles/trackingScale.test.ts` reads every stylesheet and
`<style>` block and fails on any `letter-spacing` outside the eight roles, on a reference to an
undeclared token, and — the failure that let the aliases survive — on a declared token nothing uses;
it also pins the role count at eight so a ninth is a documented decision. **Documented:** `/style-guide`
§ 2 gained "Tracking — keyed to size", a ledger where each specimen is set in the token's own face and
size with the token supplying the tracking inline, the live value printed beside it through the same
`:root` reader as the colour swatches; `DESIGN.md` gained **The Tracked Size Rule** and the matching
Don't, with the front matter and the sidecar corrected to shipped truth (label 0.12em, title -0.01em,
nameplate -0.02em, buttons 0.06em). Verified on the production build in both themes by computed-style
read: all eight tokens resolve identically on daylight and midnight and every specimen measures the
value printed next to it. **Declined:** the craft floor's eyebrow ban and its 65–75ch measure (brief
wins, as before). **Left for later:** `static/404.html` and `offline.html` carry their own inline
mini-token set and already sit on the scale's values (0.12 / -0.01 / 0.06em) but cannot consume
`variables.css`, so a future move of the scale would need a hand edit there; the PDF's `LETTER_SPACING`
(mm) mirrors only eyebrow and label, which is all the document uses. **Ship gate:** `format`, `lint`,
`check` (1092 files, 0 errors), `test` (774, +3), `build`, `check:build`; the detector's single finding
is the known false positive from 2.7.

**2026-09-09 — 1.5 midnight type compensation (visual pass, orchestrated: Fable judging captures,
two Opus agents implementing on disjoint files) — done: midnight now carries a deliberate weight
compensation, with the evidence recorded here.** The roadmap said this item "wants a session where
rendering can actually be seen", and the reason previous sessions could not see it turns out to be
the in-app browser pane, not the site: the repo's own `npm run shot` (Playwright + sharp, already in
the tree for project cards) captures a served build at 2× and 3× in either theme — `--dark
--selector .bib-row --element` — and those PNGs can be read back. **That is the recipe for every
remaining item; retire "screenshots time out" as a standing caveat.**

**Evidence, before deciding anything.** Side-by-side captures of the same components in daylight
and midnight at 1440/2× and 375/3× — header nav, a bibliography row, the meta-ledger, a CV ledger
row, a standfirst, a record title. Light type on the film ground does optically bold (irradiation:
the bright glyph spreads into the ground), and the spread is a fixed optical quantity, so it costs
the most where strokes are thinnest and closest: **the data voice at 10–14px** — nav links, ledger
keys, meta values like `De Gruyter` — rendered a clear step heavier than daylight. It was mild on the
24px serif title, and **negligible on the Archivo display heads**: the record title and the nameplate
were at parity in both themes without any help. Two constraints were established as facts rather
than assumed: the served Newsreader and Spline Sans Mono woff2 subsets carry a `wght` axis instanced
to **400–700** (read with fontTools), so body prose at 400 cannot be lightened at all — a lower value
clamps — and Archivo's axis runs 400–900.

**An A/B settled the step.** Injecting `html.dark { --font-weight-medium/-semibold/-bold }` at −30,
−40 and −50 into the served build without rebuilding: −50 returned the small mono exactly to its
daylight weight but **over-corrected the 24px serif title**, which fell visibly below its own daylight
weight; −30 left the mono still a touch heavy; **−40** brought the mono back and held the serif at
parity. So midnight remaps the three shared weight tokens down by forty — 500→460, 600→560,
700→660 — in `dark.css`, and nothing else: `--font-weight-normal` stays 400 (the floor), the display
heads' hand-set 750–850 are untouched (parity already), and the tracking scale from 1.4 stays
theme-independent — the weight step answers the same optical spread without forking a size-keyed
scale per theme. Smoothing was already `antialiased` globally, so the roadmap's "nor smoothing" was
a false premise. The change reaches 169 declarations through the tokens and touches no component.
**Guard:** `src/styles/midnightWeight.test.ts` asserts the daylight values, that midnight sits exactly
forty below on the three tokens and does not redeclare `normal`, and — reading the `@font-face`
descriptor ranges out of `app.html` — that every compensated value lies inside the served axis, so
regenerating the subsets with a narrower range or pushing the step past the floor fails red rather
than clamping silently. **Documented:** `DESIGN.md` gains **The Microfilm Weight Rule** and a Do
("verify small mono caps in midnight by capture, not computed style — the compensation is optical");
`/style-guide` § 2 gains "Midnight weight — compensated, not inverted", four ledger rows whose mono
and serif specimens carry no literal weight and so repaint on the theme toggle beside the live value.
**Verified on the rebuilt production build** by fresh captures in midnight with no injection: the
meta-ledger, nav and bibliography row now read at their daylight weight. **Declined:** per-theme
tracking (would fork the 1.4 scale for no gain the weight step does not already give); lightening
body prose (impossible without regenerating the fonts — recorded as the one thing a future font
regeneration could unlock, by widening the subset to 300–700); compensating Archivo (no evidence).
**Left for later:** nothing from this item.

**2026-09-09 — 2.9 visualisation pages (`/impeccable critique` → fix → polish, dual-agent
critique plus a third isolated pass on the `dataviz` method; Fable judging captures, seven Opus
agents on disjoint files) — 23/40 as found → about 33/40 by the same rubric (26/32 on the Phase 2 scale), re-scored by the orchestrator from the rebuilt pages rather than by a fresh dual-agent run.** Scored on all ten heuristics (18/32 on
the Phase 2 scale); the snapshot is the first entry in `.impeccable/critique/`, now committed.
Three routes: `/publications/visualisations`, `/conference-activity/visualisations`, `/cv/timeline`.

**The verdict split down the middle.** The seriated co-occurrence matrix, the arc diagram's
collaborator ledger and their standfirsts are unmistakably authored for this archive; everything
else was a generic analytics page wearing the site's fonts — fourteen unruled heads over fourteen
bordered rectangles, a rainbow bubble pack, a rotated word cloud that **rendered two of a hundred
terms**, doughnuts for seven near-equal slices and for two-slice language splits, and a standfirst
("offering insights into…") that PRODUCT.md forbids. The page that exists to demonstrate the
computational method used none of the system's signature data components. **Pine scarcity was
broken by an order of magnitude:** four charts passed `barColor="var(--color-accent)"` (12 + 30 +
13 + 15 pine bars), the language toggle filled pine, and in midnight — where `--color-accent`
brightens but the viz palette did not — those plates were the brightest objects on the page.
**Midnight was an inversion for the data:** `--sys-viz-1..7` were declared only in `:root`. The
dataviz validator, run rather than reasoned about, failed the seven in both modes: plum ↔ mauve
at ΔE 5.0 (CVD) and 5.9 (normal vision, floor 15), plum ↔ slate collapsing to ΔE 1.0 under
deutan, two slots under 3:1 on the film ground. The mechanical pass added what the design eye
could not see: 20 console errors per page from a `<rect width="-78">` in the arc diagram's first
paint, and axe on the timeline — `aria-command-name` ×166, `nested-interactive` ×1 (166 unnamed
buttons inside `role="img"`), a 4.08:1 badge.

**Fixed, by system rather than by page.** (1) **The palette is re-stepped and validated in both
modes**: six daylight slots moved on an alternating lightness ladder (ochre's L is capped by the
3:1 floor on warm paper, so plum went _up_ to a light lilac rather than down), and `dark.css` now
carries a midnight step for all seven with viz-1 bound to `--sys-color-pine-bright`; adjacent-pair
CVD ΔE ≥ 11.7, normal-vision floor ≥ 16.6, every slot ≥ 3:1, both surfaces. The chroma floor
fails deliberately — muted earthy hues are the identity, saturated ones the anti-reference — and
is documented as such. `chartColorUtils` gained the midnight fallback record (and a third
hand-copied set in `getTimelinePalette()`, still on pre-2026-07 hexes, was found and retired);
`designTokenParity.test.ts` now converts the OKLCH tokens in both files and binds both hex sets.
The choropleth ramp's light end passes 2:1. Every ECharts gridline is solid. (2) **Bars are ink;
pine marks the newest year and nothing else** — `accentKey` on the two bar charts, the Year-Bar
Strip idiom; the language toggle is a house chip (solid ink when selected); the toolbar lost its
0.6 opacity and its pine hover. (3) **The decorative charts are gone**: `D3BubbleChart`,
`EChartsWordCloud` and `EChartsDoughnutChart` deleted, `echarts-wordcloud` removed from
dependencies and overrides, `PieChart`/`LabelLayout` dropped from the ECharts registry. Keywords,
tags and full-text terms are the brief's **Key-Terms Cloud** (`scaleKeyTerms`, sqrt-scaled,
unit-tested; keywords link into the filtered index); activity types are a ranked horizontal bar;
language shares are a **proportion ledger** of `.hbar` rows — no chart library for a two-figure
split. (4) **Both pages are composed on the system**: a stat ledger ("The corpus, in numbers",
the total in pine) and a **contents ledger** of `§`-numbered anchors under the masthead, every
section through `VizSection` on the 3px section rule with its count in the data voice, sentence
case throughout, a one-sentence apparatus line under every plate saying what it counts and from
what, the bespoke 10%-opacity divider deleted. The stacked bars take an entity-keyed `colorMap`
per page (the publication-type map had been applied to communication types), fold past seven
into "Other", and cut a 2px paper gap between segments. (5) **The timeline is a record**: a
hanging mono lane-key column with counts, hairlines between lanes, 166 marks named for AT inside
a `role="group"`, Enter _and_ Space, a roving tabindex with arrow keys across lanes and Home/End,
24px hit areas, a 2px surface ring, hover as a colour change, a single scroller, the badge text in
ink beside a square swatch, no fly-in, British spelling. **The `-78` rect is guarded.**

**Verified on the rebuilt production build** by capture in both themes at 1280/2× and 375/3×
and by re-running the browser pass: console errors 20 → 0 per page (the four survivors are
MapLibre WebGL driver notices), axe 0 violations on all three routes in both themes, no overflow,
budgets with more headroom (heaviest route 728 → 723 KiB). **The one thing the agents could not
see:** the rebuilt timeline threw `each_key_duplicate` at mount and blanked the page — ids repeat
across the seven source datasets and the marks were keyed on `item.id` alone. Caught by the probe
before the commit; keyed on category, id and index. **Polish round:** the horizontal bar now measures its longest label on a canvas in the resolved
mono face (fonts-ready aware) instead of estimating it, so `association islamique` and
`Academic event organised` print whole; the stacked chart moves its legend above the plot on a
narrow plate, wrapped rather than scrolled, kept left of the toolbar's gutter, with the grid sized
from the real legend and tick heights; every axis name that repeated its section title is gone
(a `measure` prop keeps the tooltip series name and the PNG filename honest); `.proportion-ledger`
is promoted into `ink-signal.css` beside the year meter and documented on `/style-guide` with a
live three-row example from the publication languages; `useECharts` no longer cites a dependency
that does not exist. Two regressions the agents' gates could not see, both caught by the e2e run
and the mobile probe before the commit: the sentence-case section titles broke three smoke specs
filtering on `Author Collaboration Network`, and the nowrap section count pushed two titles 26px
past a phone's viewport — it now drops under the title below `--sm`.

**Declined:** the validator's chroma floor (identity); the dataviz rounded data-ends (square
corners); per-theme tracking; a table twin for every ECharts plate (the three SVG plates ship
sr-only alternates; the ten canvas plates carry `aria` summaries — a `VizChartCard` table snippet
is the honest follow-up, 3.2); URL sync for chart sliders and filters (3.2/4.1); a skeleton for
the heavy plates (5.1). **Reported, not acted on:** `PRODUCT.md` still says 56 publications and
84 communications where the datasets hold 44 works and 79 communications (33 activities against 35) — a `CONTEXT_STALE` fact for the next
`init`, not this session's to repair. **Left for later:** `forced-colors` has no block anywhere in
`src/styles/` (texture is the skill's backup channel; the ECharts decal toggle covers canvas
charts manually); the all-pairs validator failures inherent to seven muted slots are reported for
the treemap and map, which would need direct labels; `.viz-contents-link` is the candidate to
promote if a third page grows a contents ledger.

**2026-09-09 — 2.10 the style guide as a page (`/impeccable critique` → fix → polish; Fable
orchestrating, three isolated Opus critique agents, then Opus fix agents on disjoint files) —
20/36 as found (heuristic 9 n/a) → about 30/36 by the same rubric, re-scored by the orchestrator
from the rebuilt page.** Snapshot in `.impeccable/critique/`, first run for the slug.

**The verdict split by layer.** On the specimen layer the page was the best-authored work on the
site — the tracking ledger sets each role in its own face with the token supplying the tracking,
the weight ledger carries no literal weight so it repaints on the theme flip, the reading-measure
block counts characters in the live serif against a real French/English corpus line. On the
document layer it failed: 1457 lines laid end to end with **zero `id`s, zero in-page anchors, no
contents** (14,948px at 1280, 21,694px at 375 — § 5 began twenty screens down on a phone, and the
roadmap's own six `§` citations of the guide were unlinkable); all eight `<section>`s unnamed
landmarks; the `§` markers 11px, outside the heading's accessible name. **Incomplete in a way that
made it an actively wrong source of truth:** DESIGN.md tells readers to check its claims against
this page, and five shipped idioms were undocumented — `.key-terms` (a named signature component,
logged as a gap in 0.3 on 2026-08-16, built out in 2.9, still absent), `.apparatus-line`,
`.rail-plate`, `.meta-link`, `.section--flush` — plus 11 of 15 button skins and both sizes, the
focus ring, inputs, validation, prose links, the Upright Heading and Drawn Depth rules; `h4`–`h6`
never appeared as real elements; § 5's caption promised an accent button the row did not contain.
**Not set in its own idioms:** 24 `h3.eyebrow` subheads that existed on no other page where
`.rail-label` is the house mono heading in 13 files (and DESIGN.md's "h6 is the one heading element
in the data voice" was false — `h6` is used nowhere); tinted `code` beside plain `.data-voice` in
adjacent paragraphs; token names uppercased by `.ledger-meta` (`--TRACKING-CAPS` — custom
properties are case-sensitive, so the page's most-copied strings could not be copied) and set in
serif in the measure ledger; the `.record-prose` demo raising a full-width 3px rule and a
section-scale `h2` that read as a phantom § between 2 and 3. Four focusable elements in `main`, so
the documented focus ring was unreachable on the page that specifies it. The mechanical pass was
clean throughout — detector 0 (verified healthy on the known false-positive control), 0 console
errors, 0 axe, 0 overflow in both themes — which is the point: nothing of substance here was
something a gate checks.

**Fixed, by system rather than by page.** (1) **Navigable:** `VizContents` promoted to
`common/ContentsLedger.svelte` with its CSS in `ink-signal.css` as `.contents-ledger` /
`.contents-link` (the two visualisation pages re-pointed, the old names gone); the guide opens
with it under the intro, nine rows with counts derived from the page's own arrays (`21 tokens`,
`8 tracking roles · 4 weights`, `9 skins · 3 sizes` …); every section carries a stable `id`
(`colour` … `colophon`) and `aria-labelledby`; the `§` number is folded into each heading's
accessible name with the visual marker `aria-hidden`, render pixel-identical. (2) **Complete:**
real `h4`/`h5` and the `.rail-label`/`h6` specimen stated honestly; the Upright Heading specimen;
prose links with the `.no-underline` opt-out; the Drawn Depth surface ramp with the midnight
collapse of `--color-background-muted` and `--color-surface-elevated` recorded in words (three film
steps for four paper roles — documented, not retuned); `.apparatus-line` on real tag links; the
meta-ledger demo is `RecordLedger` itself so the DOI is a real `.meta-link`; § 5 rebuilt as
**Controls** — all nine skins and `bare` as a ledger of real controls, three sizes, a states row
with a static focus-ring specimen, `disabled`, `loading`, `icon-only`, chips and the pager as real
buttons, the `.pub-search` field as `EntityFilterBar` ships it, validation stated honestly (no form
on the site); the **Key-Terms Cloud** on forty real keywords; the headshot replaced by two
publication covers as plates plus the **rail plate** at its 380px width; and a new **§ 9
Colophon** — the three families with foundry and licence, a ledger of where the system lives, and
how to add an idiom — so the page closes instead of stopping. (3) **Set in its own idioms:** every
subhead is `h3.rail-label`; `code` survives only for the two copyable declarations; token names
print case-intact through the new **`.ledger-meta--figures`**; the measure ledger's token moved to
the mono cell; the two chrome-scale demos sit in the new **specimen frame** (`.specimen`,
`.specimen-label`, `--flush`) — a plate, never a card. (4) **Two system defects the render
surfaced, fixed at the source:** `.rail-label`'s bottom hairline met the first `.meta-row`'s top
hairline 44px apart on every record rail site-wide — one boundary now takes one mark (and the same
rule scoped to the contents ledger); `.pager-item` was not button-ready (a native `<button>` kept
the UA face) and now carries the same reset as `.chip`. Two more found by the rebuilt page:
`.btn-loading` blanked its own spinner (`color: transparent !important` cascaded into the
`currentColor` strokes) and `--sys-color-danger-bright` sat at 4.46:1 on the film ground — the
loading rule is gone (the label is already `visibility: hidden`) and midnight danger is re-stepped
to `#d65c41` (4.81:1). (5) **The coverage guard:** `styleGuideCoverage.test.ts` parses every class
`ink-signal.css` declares and fails when one appears neither on the guide nor in a component the
guide imports; the allowlist is empty, and it earned its keep on the first run by catching
`.eyebrow--ink` after the subhead sweep removed it. **Documented:** DESIGN.md's Label tier now
names `.rail-label` as the mono heading idiom (the h6 sentence corrected), the Signature
components gain the Contents Ledger, the Specimen Frame and `.ledger-meta--figures`, the Hairline
Pairing Rule gains "one boundary takes one mark", the Negative Rule records the shared film step,
and the overview names the coverage test; `CSS-README.md` gains the four idioms.

**Verified on the rebuilt production build** in both themes at 1280 and 375: 9 `section[id]`, 9
anchors that all resolve, **85 focusable elements in `main`** (was 4), 0 uppercase token names, 21
swatch values populated, 0 console errors, 0 axe (wcag2a→22aa), 0 overflow; captures read back for
the contents ledger, controls, key terms, plates and colophon. Page height is now 26,405px at 1280
— what a complete guide costs, and why it opens with its contents. **Declined:** a sticky or
scroll-spy contents panel (a glass or floating panel is banned; the static ledger under the intro is
the print answer), copy-to-clipboard chips, reveal motion, a second accent for specimen framing;
the detector's `tiny-text` on the 11px 2xs specimens (the label tier is pinned) and
`em-dash-overuse` ×158 (house punctuation). **Left for later:** the film ramp's three steps for
four roles is recorded, not resolved; `Button.svelte`'s `variant` union lacks `accent`,
`outline-accent` and `surface`, so those skins render as raw `<button class="btn btn-…">`.

**2026-09-09 — 2.11 system chrome: header/nav, footer, error pages (`/impeccable critique` →
harden / distill / clarify / layout → polish; same orchestration) — 23/40 as found → about 32/40 by
the same rubric, re-scored by the orchestrator from the rebuilt build.** Snapshot in
`.impeccable/critique/`, first run for the slug.

**The masthead was a masthead; the colophon was half a colophon; there were two 404s and they
disagreed.** The header passed outright — measured `backdrop-filter: none`, `opacity: 1`, the
ground exactly `--color-background` in both scroll states and both themes, one pine mark for the
current section. Everything around it broke the consistency rule: **21 pine underlines in the
mobile menu** (21 of 22 links, both themes — `typography.css` exempted `.nav-link` and
`.dropdown-item` by name and never learned the mobile classes, so the prose-link idiom outranked
the components' own `text-decoration: none`); the same six research-project titles set in Archivo
sentence case on desktop and 10px uppercase mono on mobile; **no skip link anywhere and 15–23 tab
stops to content on every page**; Space on a nav trigger scrolling the page 787px (no
`preventDefault`); Escape inert once focus entered a dropdown; `role="menu"`/`menuitem` promising
arrow-key semantics that did not exist while stripping the link role from fourteen links;
`aria-expanded="false"` on three links that expand nothing; no `aria-controls`; a `header-scrolled`
class whose declarations were identical to the resting ones, maintained by a rAF listener; a
dropdown with a 200ms reveal, a per-item stagger to ~440ms, a `translateX` nudge and an accent
wash; a hamburger→X transform that could never run. The footer: a scroll-to-top button painted
`--color-primary` on a `--color-primary` ground (invisible in daylight), sliding in over 300ms,
**focusable at tab position 165 of 165 while `opacity: 0`**, and appearing only once the scrolling
was done; the midnight ground at 1.06:1 against the page — neither an inverted block nor the page;
40% of the width empty; three link groups ragging into a two-column grid; "Google Scholar" and
"ORCID" in Archivo (document voice) for database-column strings; the postal address as one six-line
anchor whose `aria-label` was the whole address; the only component consuming a `--sys-*` primitive
directly; and the record's only exits pointing at the aggregators PRODUCT.md positions it against.
The error page: `static/404.html` (what a mistyped URL gets — the app never boots) in the archive's
voice with five flat chips but no site identity, no path echo and OS-only theming; `+error.svelte`
(reached by client-side navigation into a matched route with a missing record) saying "Sorry, we
couldn't find…", echoing the path, offering one pine button home, and printing a raw framework
string as the lede on the non-404 branch. Detector 0, axe 0 in 28 runs, 0 overflow, 0 sub-44px
targets on a coarse pointer — again, nothing above was something a gate could see.

**Fixed.** (1) **Header/nav** (`menu/*`, `+layout.svelte`, `typography.css`): a skip link as the
first focusable element on every page, styled as a square ink stamp in the data voice, with
`id="main"`; the prose-link exemption now excludes the masthead **by ancestry**
(`:not(.site-header *)`) so a panel built later cannot fall behind it — verified harmless across
nine routes (0 underlines lost, 0 gained in `main`); Space toggles the disclosure and prevents
default, Escape closes from anywhere inside and returns focus to the trigger, ArrowDown/ArrowUp
walk trigger → items → wrap, Home/End inside the sheet; the menu roles retired for a plain labelled
list; `aria-haspopup`/`aria-expanded` only on real triggers, `aria-controls` on each; externals
marked `↗` with a hidden "(Opens in new tab)" — the footer's own string; **a record title inside
chrome keeps the document voice** — the mobile sub-entries are Archivo at the text tier, sentence
case, matching the desktop sheet, and a sub-entry is current only on an exact match; motion
distilled to the brief's ceiling (the dropdown appears, the panel takes a `--duration-fast` fade,
the underline holds without a sweep, the stagger scale and the transform/animation distance tokens
deleted with it); the dead `header-scrolled` state and the unreachable X transform gone; a hovered
label no longer draws a second "current" rule. **The 1280 cliff stays, on measurement:** the seven
labels, wordmark and toggle first fit at 1180px (105px over at 1024), recorded in `DesktopNav`'s
comment. **The retracting masthead is a deliberate keep:** the sticky record rail relies on the
reclaimed space, and it never retracts with a menu open or focus inside. (2) **Footer:** the
scroll-to-top button deleted whole, with its observer, slide-in and smooth scroll; in midnight the
footer takes the page ground and the 4px cream rule carries the boundary (the negative of an
inverted block would be a cream slab); the link list recast in the data voice (mono, xs, mixed
case on the figures tracking) with the family on the right selector; the address an `<address>`
block with the map link on the institution alone; a fourth group, **"The record"** — RSS, sitemap,
`llms.txt`, the MCP server, the style guide — fills the empty quadrant and moves RSS out of
"Social"; four groups on a real grid; `--color-footer-accent` replaces the four direct
`--sys-color-pine-bright` uses and `--color-footer-text-muted` is a `color-mix()` of the footer's
own text and ground (7.33:1 daylight, 7.39:1 midnight — was 4.73/4.80); the wordmark prints the
header's name; the type credit now opens the guide's colophon. (3) **One 404 voice, the static
page's:** both pages say "This page couldn't be found." with the "pick up the thread" lede, five
flat chips **with the index the URL was already inside marked current** (solid ink,
`aria-current`) — a missing `/publications/<id>` is a search of `/publications`, not a trip home —
the requested path as a mono diagnostic line, the home link quiet below; the static page gains a
wordmark above its 5px rule, the app's theme bootstrap (stored choice, then OS) with the media
query kept as the no-JS fallback, a three-line inline script for the path and the chip, the
Display cast on its `h1` (`wdth` 116 — the declared axis was never used), top alignment instead of
vertical centring; `offline.html` brought into the same family; `+error.svelte` loses its second
wordmark (the header already prints it) and its non-404 branch gets a designed sentence with the
message as a `Reported` diagnostic, never the lede. **Documented:** DESIGN.md § Navigation
rewritten (the rest colour corrected to `--color-text-soft`, the record-title rule, externals, the
skip link, the retract as a decision), the Colophon added to Signature components, the midnight
footer under the Negative Rule; `CSS-README.md` gains the footer tokens and loses the stagger line;
three smoke specs (the static 404's identity, path and current chip; the stored theme; the
four-group footer with no controls).

**Verified on the rebuilt production build** in both themes at 1280 and 375 with the menu open:
tab order `skip link → wordmark → Research ▾ → items…`; Space/Escape/ArrowDown on the trigger with
`scrollY` unchanged; **mobile menu 0 underlined links, 2–4 pine marks** (the current entry and its
marker), 0 sub-44px targets, 0 overflow; header pine = the active item only, footer pine 0; the
static 404 and the in-app error page both titled `Page not found · Frédérick Madore`, the in-app
one marking Publications current for `/publications/no-such-record` with the header and footer in
place; 0 console errors and 0 axe on every route; e2e 35 passed; bundle 723 → 721 KiB. **Reported,
not acted on:** `/cv` fails `target-size` on 25 inline digital-humanities links under the WCAG 2.2
tags — reproduced on the untouched build, so it belongs to the CV page, filed as its own task.
**Declined:** collapsing the mobile sub-lists (an index prints everything; the print answer is
voice and density, not an accordion); a global search (the 404's signposting carries that weight
for now); `:not(nav a)` as the underline exemption (the masthead is the true boundary, and other
navs — breadcrumbs, the contents ledger — opt out themselves). **Left for later:** a shorter
label set would bring the desktop nav to 1024; the footer's `h2` group titles still sit in every
page's outline (the inline comment explains why).

**2026-09-10 — 3.1 microcopy (`/impeccable clarify` across the interface, three page families in
parallel; Fable orchestrating, Opus critique agents then Opus fix agents on disjoint file sets, each
on its own dev server) — ~760 strings read, 93 findings, 88 acted on.** No heuristic score: `clarify`
produces findings, not a scale. The critique read every visible string, accessible name, `title`,
`placeholder`, `alt`, `<title>`, live-region payload, empty and error state in source, then extracted
what the browser actually announces (Playwright `ariaSnapshot`, live-region text, count readouts,
canvas `aria-label`s) in the default, filtered, zero-result, paginated and error states. The headline
was not register but **truth**: the apparatus contradicted itself on the pages whose purpose is to be
countable (`/activities` printed `All 9` and `All 64`, the number of facet _values_, beside
`34 entries`; `/conference-activity` printed 79 entries, 74 past and `OF 74 TALKS` with no
reconciliation; `/digital-humanities` printed `All 16` over `14 projects`), the shared chart
components said `publications` on the talks page in a legend, two tooltips and a screen-reader summary,
and four of five canvas chart types handed screen readers ECharts' auto-generated dump (2,400
characters, `NaN` included). **Fixed:** (1) **one glossary**, now DESIGN.md § Voice & Copy with seven
named rules and a one-paragraph Interface Copy convention in CLAUDE.md — sentence case outside nav and
breadcrumbs; the code's nouns never reaching the reader (`communication` → `talk`, `node` → the entity,
`choropleth` → `country shading`, `decal` → `pattern fill`; on the talks visualisation page the
counted noun is `talks`, since `Activities` is the separate log); one count noun (`entry` /
`entries`, singular-guarded, with the corpus stated in every empty result); the verb pair `Open …`
external / `View …` internal; `Cite` → `Copied` → `Copy failed` in the row and `Copy reference` →
`Reference copied` → `Copy failed. Select the text above.` in the rail; `Download BibTeX` /
`Download PDF` / `Download failed. Try again.`; `Clear all` / `Clear years` / `Clear search` with
exactly one clear control in any empty state; `More filters` for the panel and its toggle; `n.d.`
for a missing date; `…`, closed-up en-dash ranges, `|` as the one `<title>` separator, no em dashes.
(2) **The index family:** the `All` chips count records; `Index · 79 entries · 2012–2026` with
`74 past · 5 upcoming` on the record head; one live readout on all three indexes
(`1 filter active · 3 of 44 entries`) with the clear button moved outside the live region; empty
states that say `No publications match.` and `The index holds 44 entries, 2013–2026.`; the map's
missing error branch; `Previous` / `Next` and a `role="status"` pager readout; the year thumbs named
`Earliest year` / `Latest year`; `aria-pressed` on every facet button; the two `All` chips named
`All types` / `All languages`; the combobox listbox named `Matching tags` with a live `No tags match
“…”.`; three type-label maps collapsed into `COMMUNICATION_TYPE_LIST_LABELS`; the aside heads
`Years` / `Types` / `Tags`; the search-result descriptions `Conference insights` / `Workshop
highlights` / `Seminar takeaways` and the `Read insights →` / `Discover details →` calls to action
retired from `seoUtils`; `Date ↓`; `Entries by year`; `PhD` without points. (3) **Records and
chrome:** ~20 `[Link]` anchors on `/cv` named `Link to {title}`; the CV table of contents now names
its seventeen headings verbatim (with `Awards & Honours` and `Organisation of Academic Events`
respelt); `View all →` → `All work in this project`; `Access Publication` / `Visit Activity` /
`Explore project` → `Open publication` / `Open the source` / `View project`; `Fig. 1. Caption`;
`1 works` guarded; `offline.html`'s `Try again` that navigated home and `Go to the homepage` that
reloaded replaced by one `Reload the site`; `Back online! Content updated.` → `Back online.`;
`Email - Opens in new tab` on a `mailto:` removed with its `target`; the hamburger named for its
outcome (`Open` / `Close navigation menu`); `Item Preview` → `Preview: {title}`; the podcast heading
disclosing `(AI-generated)`; the truncated `<title>`s' `...` → `…` with the stray space before a
French colon trimmed; the home kicker moved into `siteConfig` as `author.kicker`. (4)
**Visualisations and media:** computed one-sentence summaries for every canvas chart (`Talks per
year by type, 2012 to 2026, in 7 types. Busiest year: 2025, 15 talks.`) from a pure, unit-tested
`chartDescriptions.ts`; the item noun as a prop on the Gantt, treemap and stacked bar; `Co-presenters`
on the talks page; the seek bar announcing `0:00 of 14:33` and the volume `70%`; the top-N slider
named for its entity with `12 of 77 institutions` as value text (a new `ariaValueText` prop on
`RangeSlider`); a live `No institutions match “…”.` under the network search; `Country shading` with
an honest failure (`The marker view still works.`); twenty empty states cut to the fact (`No page
counts recorded.`); the timeline's `Previous record` / `Next record` / `Close record details`, its
selected record in a labelled region with the paper title demoted from the page's only `h2`;
`2018 –2020` from split template lines healed. (5) **New-tab notice everywhere:** every
`target="_blank"` link on the site now carries one hidden ` (opens in new tab)` (rails, CV, prose on
the home and research pages, reviews, cited-by), the arrow glyph `aria-hidden`; the PDF CV extractors
learnt to drop `.sr-only` and `aria-hidden` text so the notice never prints. **Tests:**
`filters.spec.ts` asserts `N of` instead of `N matches`, `responsive.spec.ts` matches `/navigation
menu/i`, `seoUtils.test.ts` pins the `…` and the CTA-free leads, `citationFormatter.test.ts` pins
`PhD`, `chartDescriptions.test.ts` is new (10). **Declined:** the theme toggle keeps `Switch to dark
theme` (a visitor has no product knowledge of "midnight"; the tooltip now matches the name); the
`Mobile navigation` landmark name (spec cost over an invisible gain); `Encyclopedia` →
`Encyclopaedia` (modern British usage, MCP consumer, pinned test); the owner's first-person
standfirst on `/digital-humanities`; American spellings and Title Case `urlLabel`s inside data files
(`Explore AMIRA`, `Conference Website`, `Analyzing`, `Data Visualization`) — content, reported here for
the owner; the `?skill=` URL key (link-rot cost). **Left for 3.2:** twelve permanent polite live
regions per index (one per `Cite` button) and SvelteKit's assertive route announcer firing on every
filter click because `urlFilterSync` replaces the URL; `Fig. 1` hardcoded on pages carrying a second
plate; the year-strip tallies reachable only by hover; the CV's staged load (a `Loading remaining
sections…` dateline now covers it); the timeline's auto-selected record; `position` /
`positionShort` / `tagline` / `kicker` as four variants of the role string; the `/cv` SEO description
still naming ZMO as the current post. **Verified on the rebuilt production build:** in both themes at 1280 across 21 routes (every index, a record of each kind, research,
teaching, CV, the three visualisation pages and the in-app 404), a Playwright probe reading every
control's accessible name: **0 console errors** (the 404's own missing asset excepted), **0
horizontal overflow**, **0 accessible names carrying a glyph**, 0 reader-facing "communication"
(the remaining hits are real titles — _Communication Technologies_), the live readout
`1 filter active · 3 of 44 entries`, every canvas chart's summary computed; **0 axe violations
under the WCAG 2.2 AA tags except seven pre-existing `target-size` failures on the IWAC project
rail's `.meta-link`s** (the CV's fix in 3d7be108 is the model; filed for 3.2). Unit 832 passed
(49 files); e2e 35 passed, 1 skipped — a theme-toggle click timed out once while the 42-page axe
probe ran on the same machine and passed alone in 17s; bundle 24.3 KiB of 850, prerender 196 of 196. The two `...` and the `Ph.D.` the probe still finds are inside the owner's records (a workshop
abstract, a degree title, four citing dissertations), not interface copy.

**2026-09-10 — 3.2 harden (`/impeccable harden` on the index, record and visualisation
templates plus the offline layer; three Opus critique agents then three Opus fix agents on
disjoint file sets, Fable orchestrating) — 43 findings, 42 acted on.** No heuristic score:
`harden` produces designed states, not a scale. Each critique drove its own dev server with
Playwright through hostile URL state (`?type=zzz`, `?year_min=2030&year_max=2050`, `?page=-1`, a
500-character `q`), the year slider at both ends and collapsed, zero results three ways, the
longest real titles (201 characters, French, with `:`) and a synthetic 300-character one, the
thinnest record of each kind (three publications with no document at all), diacritics in every
voice at 3–5×, aborted images / deck host / audio / MapLibre chunk / boundary request,
`setOffline`, the clipboard removed, reduced motion, 320–1440 and the 200% reflow case, and axe
under WCAG 2.2 AA; agent B swept all 183 record URLs; agent A served the committed build to read
the service worker's caches from inside the worker. **The headline was the offline layer:**
`handleNetworkFirst` returned the navigation-preload response _before_ the runtime-cache write,
so after browsing the site no runtime cache existed and the worker's own header and
`offline.html` both promised visited pages the site could not serve; offline, an unvisited record
became a 500 that said `Something went wrong … Reload` and never said _offline_; and the offline
notice itself was the clearest guardrail breach of the whole roadmap — translucent (glass),
Newsreader (wrong voice), `--color-danger` (a retired second accent over a full-width bar),
animated in, fixed over the masthead, auto-hiding after 3 s while still offline, with
`Back online.` unreachable once that timer had fired. **Fixed:** (1) **offline** — the preload
response cached on the same terms as a network response, precached assets stored un-redirected
(a host that 301s `/offline.html` had been voiding the fallback), an `Error · Offline` branch in
`+error.svelte` (`This record is not in the offline cache.` with the six index chips and a
reload on reconnect), `offline.html` reduced to a two-row ledger of what a reader can do from
there, the notice recast as an opaque in-flow ink strip in the data voice that persists while
offline with `Back online.` as a 2 s pine transient, and the update prompt given `Escape`, a
`Later` that re-offers on the next route, and `A new version is ready. Reloading will lose the
filters you have set.` with `Reload` / `Later`. (2) **Indexes** — filter clicks are shallow
`replaceState` (SvelteKit's assertive announcer no longer barks the page title over the polite
result count); one page-level `role="status"` per index replaces twelve per-row live regions; the
year facet prints the years it selected (`2018–2020`, a collapsed range as one year) with the
same text as both thumbs' value text, the collapsed range is no longer a pointer trap
(`targetHandle` lifted into a pure helper with the tie broken outward, tested), and an
out-of-corpus deep link no longer draws the handles 191 px past the track with invalid ARIA
(clamped in `entityFilterCore`, tested); the facet summary names the active raw values so
`?type=zzz` explains its empty index; zero-count controls read as unavailable; `No entries
match “…”.` quotes the search; the search term travels as `q` (the page number deliberately does
not); a forthcoming chapter prints `FORTHCOMING` instead of posing as the newest published
record; `Seminar Series Website ↗` no longer overflows 375; the pager's scroll defers to CSS under
reduced motion; `aria-controls` and `aria-pressed` on the language row; `No forthcoming talks are
scheduled.` when nothing is upcoming. (3) **Records** — `main` is optional on `RecordLayout`, so
the three documentless publications read as masthead + rail instead of a blank column beside an
857 px rail; every plate has a failure state (`use:plateFallback` → `.plate--missing`,
`Image unavailable.`, the `Fig. N` caption withheld because an absent figure has no number); the
deck embed fails honestly after a 6 s watchdog with the poster recoverable; the record page's map
import gets the index page's honest state; the 404 chips light for `/communications/*` and
`/activities/*` and the path echo is decoded (`/publications/émancipation`, not `%C3%A9`); the DH
rail's stacked addresses clear 24 px (the CV's `3d7be108` idiom); 32 participants keyed by a bare
em dash are keyed `Participant`; the teaching templates guard `0 courses · undefined–undefined`
and `1 courses`; an unresolved inline reference is plain prose instead of `[Ref: id?]` in red
mono, and `gen:refs --check` now fails the build on one; `…` never `...` in meta descriptions,
RSS and the baked abstract excerpts (summaries regenerated), and JSON-LD names take the
untruncated, unsuffixed title; `CVTeaching` stops sorting shared arrays in place; the home log's
empty state is `The log is empty.`; `overflow-wrap: anywhere` on chips, related-card titles and
the breadcrumb (synthetic only: the longest real unbroken token is 23 characters); the talk rail
gains a `Cite` block composed from the same venue formatter the index row prints; JSON-LD
`WebPage.name` takes the untruncated title through a new `schemaName` prop on `SEO`. (4) **Visualisations and media** — one `.state-note` honest-state idiom
(mono label, serif sentence, `--color-surface`, `role="status"`) replaces the site's only two
danger-coloured blocks (the map had been printing `Failed to fetch dynamically imported module:
…/maplibre-gl.js?v=…` at the reader); a fast audio 404 reaches the designed state (`el.error`
checked on attach); the player's keys work anywhere inside its region; every section that draws a canvas or map
plate (eight on publications, six on talks) offers its rows as a `Data table` `<details>` set as a `.ledger` (the SVG plates keep
their sr-only tables, since a closed details is outside the accessibility tree); one `.viz-empty`
replaces two page-local idioms and the 400 px centred box; the timeline no longer auto-selects
its 166th record, its card walks the plate's own sequence and counts `of 166 records`; the CV
prints `Loading remaining sections… n of 17 shown.` inside the sheet so an early print says it is
partial; treemap tiles truncate with `…`; the bigrams axis draws four ticks at 375 instead of a
smear of eleven; the toolbar and the map's mode panel leave the plate below `--sm`; the boundary
retry keeps focus on the status; the marker hover scale is gone; a sparse network prints
`Showing all n` instead of a slider; a one-language corpus hides the toggle. **Documented:**
`.state-note`, `.chart-table`, `.viz-empty`, `.plate--missing` in `ink-signal.css` and on
`/style-guide`; DESIGN.md gains them under Signature components. **Declined / deferred:** URL sync
for chart controls (a feature: `shape` first, then 4.1); the `?page=` parameter (a shared link
carries the search, not the position); the non-404 branch's `Reported` diagnostic (designed in
2.11); the two long-facet idioms side by side (4.x). **Verified on the rebuilt production
build:** in both themes at 1280 and 375 across 23 routes (every index, a record of each kind including
the 201-character French title, research, teaching, CV, the three visualisation pages and the
in-app 404), a Playwright probe reading every control's accessible name: **0 console errors**
(the 404's own missing asset excepted), **0 horizontal overflow at 375**, **0 axe violations under
the WCAG 2.2 AA tags** (the IWAC rail's seven `target-size` failures are gone), 0 accessible names
carrying a glyph, 0 glass or shadow surfaces, 0 stray tokens; live regions per index page 5,
down from 15. Agent A additionally served the rebuilt worker and read its caches from inside it:
the runtime cache holds `/publications` after one visit, an offline reload returns the page, an
offline hard navigation to an unvisited route returns `offline.html` (not `ERR_FAILED`), and an
offline client-side navigation into an unvisited record shows `Error · Offline` and reloads onto
the record on reconnect. Unit 863 passed (51 files, three new); e2e 35 passed, 1 skipped, 52 s;
bundle 729 of 850 KiB on the heaviest route, prerender 196 of 196.

**2026-09-10 — follow-up to 3.1 (owner's ruling, no skill).** The owner ruled British English for
the data files too, abstracts excepted: project descriptions, tags (`Religious Organisation`,
`Radicalisation`, `Data Visualisation`), skills, keywords, translated course and award titles,
participant roles and degree names now read analyse / organisation / visualisation / Honour Roll /
PhD; abstracts, published titles, citing works, reviewers' quotes, proper nouns (Center for African
Studies, ADHO) and schema.org vocabulary stay verbatim, URLs and ids untouched, the reference index
and summaries regenerated. `siteConfig`'s four role strings are three with distinct jobs
(`position`, `positionShort` = the masthead epithet, `jobTitle`; `tagline` is a standfirst, not a
role) and the CV's SEO description is composed from `author.position` instead of naming ZMO.

**2026-09-11 — Phase 4 in one session: 4.2 quieter, 4.1 distill, 4.3 bolder-narrow (three
Opus critique agents → three Opus fix agents on disjoint file sets, Fable orchestrating; no
heuristic score — all three commands produce findings, not a scale).** Snapshots in
`.impeccable/critique/2026-09-11T06-01-5*`. The three critiques were run as instruments rather
than opinions: a scripted pine census over 15 routes × both themes × 1440/375 recording every
element whose computed colour, background, border, underline, outline, fill or stroke resolves to
pine; a sweep of all 174 records for rail thickness, section count and repeated values plus a
control census of the four indexes at 375 under touch; a masthead sweep of 37 routes and a
60-run axe/overflow/console baseline. **4.2 — the failure was one selector, not many
decisions.** No first screen on any route overspent pine; every first-screen mark was a sanctioned
one. Below the fold, `typography.css`'s prose-link rule carried bare `p a` / `li a` arms at
0,4,1, so **209 of the site's 246 pine underlines landed on data-voice anchors** — chips,
bibliography titles, cover-plate wrappers, breadcrumbs, the home log's mono date key, related-item
cards, review links — every one of whose components had written `text-decoration: none` and
silently lost. Meanwhile `ContentBody` won the colour fight and lost the decoration fight, so the
home page's 26 prose links were pine text under a full-strength pine rule, a hybrid neither author
wrote, while the same sentence on a DH record rendered ink + hairline. The rule is now **opt-in by
container** (`.prose`, `.content-body`, `.page-intro`, `.record-prose`, `.project-prose`,
`.abstract`, `.apparatus-text`, `.audio-description`, `.embed-desc`, `.guide-note` — the list
derived from a 196-route sweep, not guessed), `ContentBody` and `PageIntro` lost their copies,
and the inline citation is ruled a prose link with a softer rule rather than a pine word (recorded
in DESIGN.md). Static stamps demoted: `.section-no`, the related-item type and `View record`
action, `Awarded`, the RSS link, the audio icon, `More filters`; the selected facet marker is now
solid ink like a selected chip. Outside-prose pine underlines **209 → 0**; home **54 → 19** marks,
exactly one of them pine text (the newest year); `/research/<longest>` 79 → 5;
`/conference-activity` 87 → 14. Every prose link still carries its underline (verified: one
unruled anchor site-wide, the guide's own opt-out specimen). **4.1 — the clutter was duplication,
not facets.** No facet on any page fails to discriminate, so the anticipated "over-faceted"
verdict was declined on measurement. What earned its place least: five forthcoming talks as retired
`.entity-card` tiles above 74 ledger rows (2.9× the height for the same fields; 3764px before the
first list record at 375) — now `BibliographyRow`s, and with them `PublicationItem`'s
unreachable card branch, `CommunicationItem`'s live one and the 434-line `entity-cards.css` are
gone; **five** implementations of "state the narrowing, clear it", one a 16px `<a>` failing
2.5.8 at 375 — now one `.mono-action` primitive (was the guide-only `.chip-more`); two long-facet
idioms — now one rule, `total ≤ LIMIT + 1` prints the whole list, else the combobox, unit-tested;
the record type printed three times and the date twice on 157 of 157 records — the breadcrumb
node (a type is not a place) is gone and the activity rail's `Year →` row became a `View the 2025
log` action; the `/activities` apparatus at y=5588 on a phone, after the entire log — now first in
source behind the shared `More filters` disclosure (y=310); a raw `conference-proceedings` key
printed in all three places because one of eleven label registers lacked it — filled, with a test
that every corpus type is in every register; the 11 talks whose only reading-column section was a
venue map restating two rail rows — the map now lives in the rail under the rows it illustrates,
on every talk, and those records are honestly masthead + rail; `hasToc()` exported once; a
`View all publications →` on the home page, which had reached the record only through the word
"published" in the eighth paragraph; `Master's theses` / `PhD dissertations` chips; the
`/conference-activity` head now says `74 of 79 entries · 5 forthcoming above` where the pager and
the summary had disagreed. **4.3 — two candidates survived the gate, both opting out of the
system's own moves.** The 37-route masthead sweep found the seven research projects and sixteen
DH records byte-identical (no drift) and the 404 at full strength; but `/conference-activity/
slides` was the only route on the site with **no rule above 1px** — six equal tiles with ragged
bottoms, a `01 02 03` stamp encoding list position, and six mirrored cover posters the page never
showed — and `/research` and `/teaching` opened on `PageHeader` at 52.7px with no masthead rule
while their five siblings opened at 72px under 4px. One `.index-masthead` + `.index-title` idiom
extracted from four copies (entity-index, activities, DH, PageHeader's new opt-in `tier="index"`)
and documented on the guide; the gallery is a plate-carrying ledger (`.ledger-row` with the
talk's date as the hanging key, the poster as the plate, `Open deck ↗` as the action; poster
resolution shared with the embed via `slidePoster.ts`); the period strip extracted from the
research route into the idiom sheet and drawn beside the standfirst on `/research` and over the
sixteen DH records' years; the eight `target="_blank"` links without ` (opens in new tab)` fixed,
two of them MapLibre's own attribution anchors, annotated after `styledata`; the CV title's
mid-word break at 375 fixed with a mobile step. `cards.css` folded into its one consumer.
**Declined:** the three playbooks' generic moves — one font, thinner rules, more whitespace,
desaturation, lighter weights, no sidebar, fewer facets, a muted-pine token, larger poster
imagery as a hero grid, enlarging every h1; `Open publication ↗` stays the publication rail's
primary over `Copy reference` (access to the work is the record's purpose; the reference is one
click either way); the drop cap keeps its pine in midnight (a signature component, one per
record, marking the start); the JSON-LD `BreadcrumbList` keeps the full record title as its last
node (a machine trail ends at the page it describes; only the visible back-pointer lost the type).
**Left for later:** the CV title still breaks mid-word at **320** (the gutter — 96px of a 320px
viewport — not the type; needs a `--2xs-down` custom media or a phone step on the CV container
padding); `RelevantItemsList` on the research project pages is the last card grid of dated
records on the site (Ledger Default Rule; a `shape`-sized change, 6.1); `.guide-note` is a
route-local class named in a base sheet (the alternative was a class on another agent's
paragraphs — swap for `.prose` on the guide in 6.1); `--color-citation` is declared but no
longer what a citation is set in (retire in 6.1). **Ship gate on the rebuilt production build:**
format, lint, check 0/0 over 1055 files; unit 893 passed (52 files, 34 new tests); bundle 724 of
850 KiB on the heaviest route, 108.9 of 140 KiB shared entry, prerender 196 of 196; e2e 35 passed,
1 skipped; a Playwright probe across 15 routes × 1440/375 × both themes: **0 console errors**
(the 404's own missing asset excepted), **0 horizontal overflow**, **0 axe violations under WCAG
2.2 AA**, **0 new-tab links without the hidden label** (was 8). 60 files, +2,129 / −1,994 including
this entry and the guide's three new specimens; the source itself shed the 434-line card sheet,
two card branches and four masthead copies.

**2026-09-11 — 5.1 optimize (two Opus critique agents → three Opus fix agents; the orchestrator
finished one agent's remainder by hand).** Snapshots in `.impeccable/critique/2026-09-11T09-08-1*`.
The critiques were run as instruments: 24 Lighthouse runs over eight routes with the LCP element,
CLS sources and coverage read per page; counterfactual Lighthouse on the visualisation pages with
the MapLibre chunk, the CARTO tiles and the ECharts chunk blocked in turn, so each plate was priced
against the page's own score; a network waterfall in first-view and scrolled phases; a fontTools
analysis of the sixteen subsets against every character the 199-page build actually contains.
**The visualisation pages were losing 35 of 49 points to a plate nobody could see.** Both mounted
`LocationMap` on load — 966 KiB of MapLibre (3.8 s of main-thread bootup, two long tasks) and
1.7 MB of CARTO vector tiles — for a map 11,827 px, 14.6 viewport-heights, below the fold at 375;
the seven ECharts plates mounted eagerly too, the first of them 2.8 viewports down. One `inView`
action (`src/lib/actions/inView.ts`, 400 px `rootMargin`, fires once) now gates every heavy plate
inside its already-reserved box behind a flat `.state-note` (`Loading chart…` / `Loading map…`,
`role="status"`) — the 3.2 idiom, no shimmer, no spinner; the talk record's hand-rolled observer
took the same action. **`/publications/visualisations` 51 → 93** (TBT 1386 → 34 ms, 2483 → 523
KiB), **`/conference-activity/visualisations` 69 → 90**; CLS 0.000 in both phases at both widths.
**The site-wide finding was one config line.** `kit.inlineStyleThreshold` was 72 KiB and the app
stylesheet had grown to 79.6 KB, so every route fetched it render-blocking for 153 ms while the
Lighthouse config still asserted the opposite — raised to 96 KiB with the rule stated, and the
stylesheet budget tightened from 2 to 1 so the next silent overrun fails CI. **Bytes were the LCP
lever** (simulated LCP is 89–90 % render delay and tracks total transfer linearly): the thumbnail
ladder had no step below 400 px, so 56–80 CSS-px cover boxes fetched 400w files — 160 and 240
added (`/publications` images 187 → 45 KB, `/conference-activity` 99 → 28); the latin-ext and
vietnamese subsets carried 329 / 153 glyphs for the 13 such characters the build contains —
re-subset to fixed blocks by `scripts/subset-fonts.py` (x64 Python fontTools; `npm run check:fonts`
in CI proves the files and the `unicode-range` declarations still match), −58 KB on disk, −15 KB
on the two pages that load them; metric-matched `local()` fallback faces (`size-adjust`,
`ascent-`/`descent-override` measured per family) so a slow-connection font swap no longer moves
the home page's first paragraph 36 px and the CV 2,174 px; the 306 KiB text-analysis corpus was
statically imported by every publication record for 28 key terms and by the visualisations page
for three fixed reductions — two committed projections (`keyTerms.generated`,
`corpusSummary.generated`, `gen:analysis` with a fidelity test) take `/publications/[id]` 694 →
~400 KiB; a `communications/summaries` projection without abstracts (41 % of that dataset) mirrors
the publications one on the nine routes that listed talks; `d3-color` had been captured into the
interactive d3 group so `/cv/timeline` still downloaded d3-force — a leaf group fixes it and
`check:bundle` now reads chunk sourcemaps to assert the timeline's graph excludes it. The portrait
was a 300×300 source stretched 3.1× into the home page's LCP element; replaced from the owner's
original (854×742, EXIF stripped, 160/240/400/800 variants, `srcset` + `sizes` for the three slot
widths). **The CV is the one ruled regression.** It prerendered 3 of 17 sections and loaded the
other 14 in four `setTimeout` waves — the static HTML held no Grants, Awards or Invited Talks and
the contents ledger pointed at anchors the document did not contain. All seventeen are static
imports now (55 → 32 requests, the record complete for crawlers and no-JS readers), which puts the
section components on the hydration path: lab LCP 4.41 → 4.68 s, performance 83 → 81. **Owner's
ruling: the complete record outranks the lab number**; `lighthouserc.yml` became an `assertMatrix`
with LCP 5.0 s for `/cv$` alone and 4.5 s everywhere else. **Measured before → after (mobile,
best of three):** `/` 85 → 86, LCP 4.11 → 4.04 s; `/publications` 84 → 87, 4.28 → 3.91 s, 702 →
544 KB; record 88 → 90; `/conference-activity` 86 → 90, 4.06 → 3.61 s, 610 → 505 KB; `/cv`
83 → 81 (ruled); render-blocking 153 ms → 0 on every route; CLS 0 everywhere; heaviest route
724 → 516 KiB, entry 108.8 of 140. **Declined:** pinning Newsreader's `opsz`, dropping the italic
preload, content-exact font subsetting (corpus-coupled), label-free basemaps (a locator map that
names nothing), `preconnect` to the tile CDN (optimises what should not happen), canvas for the
SVG networks, any shimmer or spinner, `content-visibility` on the CV (deferred to 6.1: −83 % on
theme recalcs but it collapsed the document height and the ToC anchors with it). **Method
lesson:** two of the three fix agents stalled silently mid-work and never reported; their
transcripts' modification times were the only signal. Poll them. **Ship gate on the rebuilt
build:** lint, check 0/0 over 1064 files; unit 915 passed (55 files, 22 new); bundle and
prerender checks pass; e2e 35 passed, 1 skipped; a Playwright probe over 15 routes × 1440/375 ×
both themes: 0 console errors (the 404's own excepted), 0 overflow, 0 axe violations under WCAG
2.2 AA, 0 unlabelled new-tab links.

**2026-09-12 — Phase 6 ship gate in one session: 6.1 polish, 6.2 re-audit, 6.3 auditor, 6.4 full
suite (three Opus critique agents → three Opus fix agents on disjoint file sets, the auditor run
twice as baseline and gate, one Opus audit agent; Fable orchestrating and applying every
cross-agent handoff by hand).** Snapshots in `.impeccable/critique/2026-09-12T06-*`; the audit in
`docs/audits/2026-09-audit.md`. The three critiques were instruments again: a rail sweep of
masthead / page / footer inner edges at 768–1600; the in-app error branch measured element for
element against the static `404.html`; print emulation with `page.pdf()` page counts; a 60-stop
keyboard walk with every ring read; hover-state contrast on 18 control classes × both themes with
`CSS.getMatchedStylesForNode` to find the winning rule; a same-role typography census over all 17
CV sections, 24 sub-heads and 49 sampled rows; a character-level `Range` sweep for mid-word `h1`
breaks on 14 routes at 320; a per-section `content-visibility` experiment at 4× CPU. **6.1 — the
home page was finished; the chrome it shares with 195 other pages was not.** Three left rails
(header 24 / page 16 / footer 240 at 1440; at 1600 the wordmark at 184 against content at 48) —
now one: every surface takes the global `.container`, and the home shell hangs on the masthead's
edge instead of centring 168 px inside it (**The One Rail Rule**, DESIGN.md). The record's
`Open publication ↗` hovered at **1.48:1** daylight / 2.74 midnight because `typography.css`'s
bare `a:hover` (0,1,1) outranked `.btn-accent` (0,1,0) — now `a:hover:not(:where(.btn))`, the
buttons restate their label colour, and `--color-accent-dark` on midnight is itself lighter than
the accent (a negative deepens by getting lighter), which also lifted `.mono-action:hover` off
2.89:1: **8.9 / 9.2:1** measured. `theme-color` was the midnight ground on all 196 pages in
daylight — two media-scoped metas plus a runtime repaint from the computed `--color-background`,
so a stored choice beats the OS; `color-scheme` narrowed to the chosen theme so scrollbars and form
controls follow it. The print sheet had never met the inverted footer (cream on white at ~1.6:1,
a blank colophon), the masthead with its hamburger, or the fixed skip link stamped on **all 38
pages** of the printed CV — the chrome's print rules now live with each component, no
`!important`, and the CV breaks at the entry instead of the section: **38 → 33 pages** (**The
Paper Rule**). The mobile panel's last row sat 0.4 px from the viewport edge (`height: 100%` on a
1177 px nav) — `min-height`, 24 px clear. The facet ledger was the one control family the touch
pass missed: 18 of 21 rows at **23.06 px** on a 23.06 px pitch under WCAG 2.2 SC 2.5.8 — 44 px;
`.btn`, the record breadcrumb (16 px) and the offline dismiss (24 px) join the 44 px roster. The
year slider was the only keyboard-operable control with no focus indicator (hover and focus both
"turned pine") — a ring; its midnight track was **1.13:1**, now 3.30. The `All` type chip printed
`44` beside siblings summing to `10` — it prints the match count with the dimension alone cleared
(`EntityFilterSystem.totals`; the sum of sibling counts was declined on measurement: 45 over a
44-entry corpus, one bilingual record). The empty result had no control inside it — `Clear search ✕`
/ `Clear all ✕` repeated in the block. `Master's theses` (U+0027) beside `Côte d’Ivoire` (U+2019) —
`typesetQuotes` on the chip. The CV: Escape dropped focus to `<body>` 23 masthead stops from
where the reader was; the contents control was tab stop **128 of 142**, after every link in the
document it exists to skip — now 9; `Publications 42entries` (Svelte trimming a leading space in an
`sr-only` span). **The five left-for-later items closed:** the CV title at 320 was the gutter
(96 px of 320), fixed with `--2xs-down` on the sheet's padding (widened to 374 px when the home
nameplate proved to split at 360 too; `.index-title`, `.page-title` and the nameplate each took one
step under it — 0 mid-word `h1` breaks at 320 on 14 routes); `RelevantItemsList` on the seven
research projects was the last card grid of dated records — a `.ledger` per `LatestActivities`,
one link per row, **2,606 → 1,789 px** at 1440, `RelevantItemCard` deleted with `View record →`
(×9, 16 px), a sixth hand-rolled type register missing `podcast`, and a `'...'` cut at a bare 120;
`.guide-note` left the base sheet (2 of 52 notes carried a link); `--color-citation` retired;
`content-visibility` on the CV **measured and declined** — −48 % on a theme swap at 4× CPU, but
17 hard-coded intrinsic heights that are half the truth at 375, for 38 ms once per session. The
auditor baseline's 17 token bypasses, 4 crossed hairline pairs and 4 motion hits are all fixed
(an undefined `--color-focus` meant the map's focus ring had never rendered); `hairlinePairing.test.ts`
gained the fourth direction (a one-sided box edge used as a separator) and `designTokenParity.test.ts`
now binds the hand-copied hexes in `app.html` and the PWA icon script. **Declined:** the playbook's
eyebrow ban (a signature element), a true print running head (`position: running()` unimplemented),
`.rail-label` convergence for the PWA `h3` and CV `h4` (3 and 5 declarations apart, not a class
swap), squaring the circular legend swatches (added to the sanctioned list instead), the masthead
type on the 201-character title, chip border contrast (1.69:1, recorded), the DOI printed twice on
the record. **Documentation falsified by grep, corrected:** CLAUDE.md's animation section named an
`animations.css` and four classes that do not exist; the rules table offered `--shadow-md` and
`--border-radius-lg`; the auditor's own brief denied `PdfGenerator.svelte` exists. **6.2 — 17/20 (Good), the same total as August with a different composition** (`docs/audits/2026-09-audit.md`): accessibility 3, performance 4, theming 4, responsive 2 → **3** (0 overflow over 133 page loads at six widths, 0 mid-word `h1` breaks at 320), implementation integrity 4 → 3 for a dimension the baseline never looked at (a Tailwind-shaped utility layer: 5 undefined and 22 dead classes, 11 of 22 CV components authored in it). The audit's two P1s were both in states no scanner enters — the current pager item hovering to **1.00:1** (`.pager-item:hover` at 0,2,0 over `.pager-item--current` at 0,1,0; the same rule shape 6.1 had just fixed on `.btn-accent`), and the new `All 44` chip whose `aria-label` no longer contained its visible text (SC 2.5.3) — and were fixed in the same session with the cheap P2/P3s (arc-diagram focus ring, `--color-danger-dark` lifting on midnight, `color-scheme` on the two static pages); the audit report carries the disposition. 76 axe scans, 0 violations; Lighthouse accessibility 100 on every gated page; heaviest route 711 → 536 KiB; `/cv` 81 → 87. **6.3 — the auditor PASSED twice**, as a baseline before the fixes (17 token bypasses, 4 crossed hairline pairs, 4 motion hits, 4 documentation claims a grep falsifies — all folded into the batch) and as the gate after them (16 of 16 baseline sub-items resolved or declined by measurement; three new warnings it raised on the batch itself — the 404's 22 unguarded hexes, `white`/`black` in the new print blocks, a comment denying a `box-shadow` focus ring that still existed — fixed by the orchestrator: `designTokenParity.test.ts` now binds `static/404.html`, print ink is `--color-print-ink` on `--color-print-ground` (theme-stable, so a page printed from midnight is not cream on white), and `--focus-ring` is retired with its last consumer). **6.4 — ship gate on the rebuilt production
build:** format, lint, check 0/0 over 1064 files; unit 932 passed (55 files); bundle 536 of 850 KiB
on the heaviest route, 108.8 of 140 KiB entry, prerender 196 of 196; e2e 35 passed, 1 skipped.
**Outlive the gate, recorded here and in the audit:** the second tier of touch targets (visualisation
toolbars at 36 px, `.doi-link` at 16 px ×30 on the CV, the slider handle at 12×24) and the CV's
utility-class vocabulary — both sweeps, neither a defect a reader meets on the index pages. **The
roadmap is closed.**

<!-- e.g. 2026-08-17 — 0.2 audit — score 82/100, 0 P0, 4 P1 (assigned: 1.3 ×2, 2.2, 5.1) -->
