# Impeccable Design Review Roadmap

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
   reads); treat screenshots as secondary evidence.
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
      `docs/audits/2026-08-audit.md`. Fix P0s immediately; assign P1–P3 items to the phases
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
- [ ] **1.4 Tracking scale.** Raised by 1.1, deliberately deferred to keep that commit
      reviewable. The data voice carries **125 hardcoded `em` letter-spacing values across
      eleven distinct steps** (0.02, 0.04, 0.06, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14,
      0.16) while the three tracking tokens (`--tracking-heading/-eyebrow/-caps`) are
      vestigial — none of them matches the values actually in use, and 0.09/0.11/0.13 are
      near-certainly unintended neighbours of 0.1/0.12/0.14. Define a role scale keyed to
      size (mono tracks looser as it gets smaller), migrate the idiom layer first
      (`ink-signal.css`, `entity-index.css`, `activity-list.css`, `bibliography.css`), then
      the components. Pair with `/impeccable extract`. _Done when:_ no component sets a raw
      `em` tracking value and the guide documents the scale.
- [ ] **1.5 Midnight type compensation.** Also raised by 1.1: `dark.css` makes **no
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
- [ ] **2.4 CV + timeline** — the scan-heavy page; ledger discipline and the PDF export
      (whose colours must match the current palette — verify, it has drifted before).
- [ ] **2.5 Research index + the 6 project pages** — the static pages drift most easily;
      check them against each other for internal consistency.
- [ ] **2.6 Digital humanities index + detail** — card grid vs ledger tension; plates.
- [ ] **2.7 Activities index + year archive + detail.**
- [ ] **2.8 Teaching + guest lectures.**
- [ ] **2.9 Visualisation pages** — critique the plate chrome, legends, and tooltips
      against the brief ("data as ornament" means the viz itself must be exemplary). Pair
      with the `dataviz` skill for chart-internal review (palette from `--sys-viz-*`,
      axis/legend/tooltip discipline, both themes).
- [ ] **2.10 Style guide itself** — critique the guide as a page: is it navigable,
      complete, and set in its own idioms?
- [ ] **2.11 System chrome** — header/nav, footer, 404/error page. The error page is
      part of the archive's voice too.

## Phase 3 — Language & edge cases

- [ ] **3.1 Microcopy.** `/impeccable clarify` across the interface strings: filter and
      facet labels, empty states ("no results" under active filters), pagination, 404 copy,
      aria-labels, footer legal, RSS link text. Register: academic, precise, British
      English, no marketing voice. _Done when:_ every user-facing string reads as the
      archive's voice and e2e tests still pass (they locate by accessible name).
- [ ] **3.2 Harden.** `/impeccable harden` (new in v4) on the entity index and detail
      templates: error and empty states, offline behaviour (NetworkStatusIndicator, PWA),
      French titles and West African diacritics in every voice, and content edge cases —
      very long titles, items with thin metadata, zero-result filter combinations, the
      year-range slider at its extremes. _Done when:_ each edge case has a designed state,
      not an accidental one.

## Phase 4 — Character calibration (constrained, evidence-led)

- [ ] **4.1 Distill.** `/impeccable distill` on any page Phase 2 flagged as cluttered —
      candidates usually: detail pages with thin metadata, over-faceted filter bars.
- [ ] **4.2 Quieter.** `/impeccable quieter` wherever the pine-scarcity count (standing
      rule 4) failed — demote accent uses until pine again means "the current thing."
- [ ] **4.3 Bolder — narrow scope only.** If any page reads as "templated academic site"
      (the brief's named failure), apply `/impeccable bolder` with hard constraints:
      amplitude comes from Archivo scale, rule weight, and information density — never new
      colour, motion, or effects. Expected candidates: none until Phase 2 says otherwise.

## Phase 5 — Performance

- [ ] **5.1 Optimize.** `/impeccable optimize` on the visualisation routes (ECharts,
      MapLibre, D3 chunks — confirm dynamic imports still hold) and the home page (hero
      image variants, LCP). Cross-check against `npm run check:bundle` budgets; font loading
      for the three families (subsetting, `font-display`). _Done when:_ budgets pass with
      headroom and no regression in the audit's performance score.

## Phase 6 — Ship gate

- [ ] **6.1 Final polish.** `/impeccable polish` sweep over home, publications, and CV —
      alignment, spacing, micro-detail.
- [ ] **6.2 Re-audit.** `/impeccable audit` again; compare scores against
      `docs/audits/2026-08-audit.md`. All P0/P1 resolved, P2s triaged.
- [ ] **6.3 Regression check.** Run the retooled `design-philosophy-auditor` agent; it
      should pass clean.
- [ ] **6.4 Full test suite.** `npm run lint && npm run check && npm run test`, then
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
[docs/audits/2026-08-audit.md](audits/2026-08-audit.md). 0 P0, 3 P1 (all fixed), 4 P2, 3 P3.

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

**Method note on the detector, correcting 0.2/1.1 and one of today's agents.** v4.1.1's engines
import no external parser, so the "install the deps or it runs degraded" caveat is obsolete. What
_does_ silently produce `[]` is scanning a file **outside the project root** (the scratchpad):
an in-project probe carrying `border-radius`, `box-shadow`, `rgba()` and a decorative gradient
returned a radius finding and four colour findings, as `.svelte` and as `.css`. It flagged
neither the shadow nor the gradient — so the CLI is a floor for radius and off-palette colour,
`hairlinePairing.test.ts` and the design-philosophy auditor remain the real guards for the rest,
and the 0.4 hook is the better per-edit signal.

**Ship gate for both (one commit):** `format`, `lint`, `check` (1091 files, 0 errors), `test`
(752 unit, +8), `build`, `check:build`, `test:e2e`, plus `mcp` `check` and `build`.

<!-- e.g. 2026-08-17 — 0.2 audit — score 82/100, 0 P0, 4 P1 (assigned: 1.3 ×2, 2.2, 5.1) -->
