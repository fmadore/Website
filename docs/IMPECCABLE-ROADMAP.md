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

- [ ] **2.1 Home** (`/`) — the masthead page; the assert/reassure balance lives here.
- [ ] **2.2 Publications index + detail** — the citation path, the single most important
      flow. Include the bibliography row, BibTeX action, and DOI rendering in scope.
- [ ] **2.3 Conference activity index + communications detail** — includes the slides
      embed on detail pages.
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

<!-- e.g. 2026-08-17 — 0.2 audit — score 82/100, 0 P0, 4 P1 (assigned: 1.3 ×2, 2.2, 5.1) -->
