# Design review — how to run one on this site

The living method for design and maintenance passes. The phased roadmaps that
produced the current state (June 2026 to September 2026) are closed and live in
[`archive/`](archive/); their decisions are already in `DESIGN.md`, `CLAUDE.md`
and the guard tests, so nothing here repeats them. This file holds only what a
future session needs: where the truth lives, the rules a session must not
break, the pattern that worked, and the backlog that outlived the last gate.

## Sources of truth

| Question                             | Where                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Who is it for, what must never break | `PRODUCT.md`                                                                                                                       |
| Tokens, idioms, named rules, copy    | `DESIGN.md` (with the `.impeccable/design.json` sidecar); the narrative brief is `.impeccable.md`                                  |
| Every idiom, rendered live           | `/style-guide` (`src/routes/style-guide/+page.svelte`); `styleGuideCoverage.test.ts` fails the build when an idiom is undocumented |
| Idiom CSS                            | `src/styles/components/ink-signal.css`                                                                                             |
| Conventions for code                 | `CLAUDE.md`                                                                                                                        |
| Last technical audit                 | [`audits/2026-09-audit.md`](audits/2026-09-audit.md) (17/20; compares against the August baseline beside it)                       |

## Invocation

The Impeccable plugin is v4: one skill, `/impeccable <command> [target]`.
`context.mjs` with no target stops on a workspace prompt because `mcp/` is a
child workspace; pin the site with `--target src/routes/+page.svelte`. Critique
snapshots are persisted in `.impeccable/critique/` and read back by `polish`.

Commands that do not apply to this register, by decision: `animate`, `delight`,
`overdrive`, `colorize`, `onboard`. `bolder` only ever ran narrowly, with a
gate. `shape` is for a new feature, before code.

## Standing rules

1. **Both themes, always.** Midnight is a designed microfilm negative, not an
   inversion. Read computed styles after swapping the `html` class and after
   disabling transitions (the body carries a 300 ms background transition that
   produces stale reads). The in-app browser pane returns blank screenshots on
   this machine; for anything optical use `npm run shot` against a served
   build (`npx serve build --listen 4174`) and read the PNG.
2. **Breakpoints:** 320, 375, 768, 1024, 1440. `--2xs-down` (below 375) exists
   for the handful of steps that only a phone narrower than the sign-off width
   needs. Touch targets and the filter apparatus matter most at the small end.
3. **Guardrails beat playbook suggestions.** Gradients, glass, shadows, radii,
   motion beyond the page-enter fade, a second accent, mono headlines, serif
   metadata, "more whitespace", "thinner rules", "one font", and the craft
   floor's eyebrow ban are all declined on sight. The brief wins.
4. **Pine scarcity is testable.** More than a handful of accent marks on a
   screen is a finding, whatever command is running.
5. **Extract as you go.** A reusable pattern goes into `ink-signal.css` and
   onto `/style-guide` in the same session, never left as a one-off.
6. **Measure, do not opine.** The passes that found real defects ran
   instruments: a pine census over every route, hover-state contrast with the
   winning rule read through CDP, a character-level sweep for mid-word
   headline breaks, print emulation with page counts, a control census under
   touch emulation. Scanners miss whole states: axe evaluates no hover, and
   two WCAG failures shipped in hover and print until a probe entered them.

## Guards that fail the build

Design decisions that are executable live as tests, so drift fails CI rather
than waiting for a review:

- `src/styles/hairlinePairing.test.ts` — rule vs box-edge tokens, four
  directions, with a named allowlist
- `src/styles/trackingScale.test.ts` — only the `--tracking-*` roles
- `src/styles/midnightWeight.test.ts` — the 40-step midnight weight offset
- `src/styles/styleGuideCoverage.test.ts` — every idiom on the guide
- `src/lib/utils/designTokenParity.test.ts` — the hand-copied hexes in
  `pdfDesignTokens.ts`, the chart fallbacks, `src/app.html`, `static/404.html`
  and the PWA icon script all trace to the tokens
- `src/styles/customProperties.test.ts` — every bare `var(--x)` names a
  declared property (twice a dead token silently deleted a focus ring)
- `src/styles/utilityClasses.test.ts` — no utility without a consumer, and no
  utility-shaped class in markup that no stylesheet defines
- `tests-e2e/hover-contrast.spec.ts` — every control on `/style-guide` and
  `/publications`, hovered, in both themes, clears AA: the state axe never
  enters
- `tests-e2e/a11y.spec.ts` runs axe with Label in Name switched on, and
  `responsive.spec.ts` holds the visualisation chrome to the 44px touch floor
- `lighthouserc.yml` — score floors, Core Web Vitals and resource budgets;
  `npm run check:bundle` and `check:prerender` on the build output

## The pattern that worked

One session, one reviewable commit. An orchestrator takes the design
decisions; agents do the measuring and the editing:

1. Build once, serve read-only on one port.
2. Two or three critique agents, partitioned by page family, each told to run
   instruments and to write a snapshot with `file:line`, measured vs expected,
   and the fix. They do not edit.
3. Fix agents partitioned by **file ownership** (never two agents in one file;
   shared sheets are split by block). Documentation files stay with the
   orchestrator; agents hand off the sentences they want written.
4. The orchestrator applies handoffs, runs the gate (`format`, `lint`,
   `check`, `test`, `build`, `check:build`, `test:e2e`), then a probe on the
   rebuilt build for the specific findings, then commits.

Two harness notes: agent transcript files can be empty, so a stall watch must
read the agents' scratch directories and `git status` mtimes instead; and a
stalled agent never notifies.

## Backlog after the last gate

Recorded here so nothing is re-discovered. None blocks a reader on the index or
record pages.

**Design**

None open. The last four closed on 2026-09-25: short-label controls took the
touch floor across as well as down, and what stays below it is now a stated
decision (DESIGN.md, The Touch Floor Rule); vector plates carry their
intrinsic size from the image manifest; the `/cv/timeline` overflow note is
a plate caption rather than a sentence in the data voice; and the masthead's
scroll-hide is an instant state change rather than a 200ms slide. `/`, the
Lighthouse watch item, measured a median 92 over three mobile runs (TBT 21ms,
LCP 3.3s) against the 81 recorded here, after this round's bundle work cut
its static JavaScript from 427 to 239 KiB.

**Engineering**

- `static/notebooklm/` ships about 44 MB of MP3; a re-encode needs ffmpeg on
  a local machine.
- Rare `buttons.css` variants and the pagination, key-terms and year-bar
  sections of `ink-signal.css` are global but used on few routes; moving them
  needs per-variant usage tracing. Long-form prose rules in `typography.css`
  could ride with `ContentBody` instead of the critical path. Do not reach for
  an automated purger: Svelte already drops unused scoped styles, and
  `:global()` idioms make purgers unsafe here.
- GitHub Pages caps `Cache-Control` at ten minutes; the "efficient cache
  policy" flag is not fixable in-repo.
