---
target: style guide as a page (2.10)
total_score: 20
max_score: 36
na_heuristics: 9
p0_count: 1
p1_count: 2
timestamp: 2026-09-09T10-25-23Z
slug: src-routes-style-guide-page-svelte
---

Method: dual-agent (A: isolated Opus design review with `npm run shot` captures at 1280/2× and 375/3× in both themes · B: isolated Opus detector + Playwright console/axe/overflow/anatomy pass, live-server overlay injected inline after the site's CSP blocked the script URL). B's evidence reached the orchestrator after A1, so this synthesis is unanchored for 2.10. Target: `/style-guide` as a page (roadmap 2.10). Mode: Read.

## Design Health Score (as found)

| #         | Heuristic                       | Score     | Key issue                                                                                                                                                                                                    |
| --------- | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1         | Visibility of system status     | 2         | Live token values and theme-reactive specimens are real status; 15,000px (1280) / 21,700px (375) with no position cue                                                                                        |
| 2         | Match system / real world       | 4         | § sections, ledgers, plates, "Fig. 1 —": the archive's own language                                                                                                                                          |
| 3         | User control and freedom        | 1         | Zero `id`s, zero `a[href^="#"]`, no contents: `/style-guide#…` cannot exist; the roadmap's six § citations are unlinkable                                                                                    |
| 4         | Consistency and standards       | 2         | 24 `h3.eyebrow` subheads unique to this page vs `.rail-label` in 13 files; `code` fill vs `.data-voice`; token names uppercased by `.ledger-meta` (`--TRACKING-CAPS`) and set in serif in the measure ledger |
| 5         | Error prevention                | 3         | Specimens drawn from their own declarations; docked for the uncopyable uppercase names                                                                                                                       |
| 6         | Recognition rather than recall  | 1         | No contents, no anchors, eight identical 3px rules over 15 screens; all 8 `<section>`s are unnamed landmarks                                                                                                 |
| 7         | Flexibility and efficiency      | 1         | No deep link, no copy affordance, no index of class names                                                                                                                                                    |
| 8         | Aesthetic and minimalist design | 4         | Nothing decorative that is not data; both themes composed                                                                                                                                                    |
| 9         | Error recovery                  | n/a       | Static reference with four focusable controls                                                                                                                                                                |
| 10        | Help and documentation          | 2         | Never names `ink-signal.css`, `variables.css`, DESIGN.md or how to add an idiom; stops rather than closes                                                                                                    |
| **Total** |                                 | **20/36** | Needs work (≈ 18/32 on the Phase 2 scale)                                                                                                                                                                    |

## Design specificity verdict

Authored, not generic — on the specimen layer. The tracking ledger sets each role in its own face with the token supplying the tracking; the weight ledger carries no literal weight so it repaints on the theme flip; the reading-measure block measures characters in the live serif against a real French/English corpus line; the stat ledger counts the page's own tokens. No generic guide does any of that. The document around the specimens fails: 1457 lines laid end to end with no contents, no anchors, no specimen frame, and its own subheads cast in a treatment that exists nowhere else on the site.

Deterministic scan: `detect.mjs` → 0 findings (detector verified healthy on the known `broken-image` control). Greps: 0 shadow/gradient/radius/rgba/hex/raw tracking/pixel media/`transition: all`/`!important`/console. Browser: 0 console errors, 0 axe violations, 0 overflow at 1280 and 375 in both themes; 21 `.swatch-value`s populated in both themes. Overlay: `tiny-text` on the 11.1px 2xs specimens (declined — the label tier is pinned), `em-dash-overuse` ×158 (declined — house punctuation), `hero-eyebrow-chip`/`cream-palette`/`ai-color-palette` on pine (declined — pinned brief), `gradient-text` on `body` (false positive: no `background-clip: text` in `src/`).

## Priority issues

- **[P0] Incomplete in a way that makes it an actively wrong source of truth.** DESIGN.md tells readers to check its claims against this page; five shipped idioms are undocumented (`.key-terms` — a named signature component, logged as a gap in roadmap 0.3 on 2026-08-16 — plus `.apparatus-line`, `.rail-plate`, `.meta-link`, `.section--flush`); 11 of 15 button variants and both sizes missing; focus ring, inputs, validation, prose links, the Upright Heading and Drawn Depth rules never rendered; `h4`/`h5`/`h6` never appear as real elements; § 5's caption promises an accent button the row does not contain. → extract + document
- **[P1] Not navigable.** No ids, no contents ledger, § markers at 11px outside the heading's accessible name; `VizContents` and `CVTableOfContents` already ship and 2.9 nominated the contents link for promotion on exactly this occasion. → layout
- **[P1] Specimens read as chrome and pollute the outline.** The `.record-prose` demo raises a full-width 3px rule and a section-scale `h2` between § 2 and § 3; "Guest lectures" repeats it. No specimen-frame idiom exists. → clarify
- **[P2] Not set in its own idioms.** 24 `h3.eyebrow` subheads where `.rail-label` is the house mono heading; tinted `code` beside plain `.data-voice`; uppercase and serif token names. DESIGN.md's "h6 is the one heading element in the data voice" is false — `.rail-label` is, and `h6` is used nowhere. → typeset
- **[P3] Every control specimen is inert** — four focusable elements in `main`; the documented focus ring is unreachable on the page that specifies it. → harden

## Persona red flags

- Designer maintaining the system: cannot link to a spec, scrolls 12 screens, finds `.key-terms` missing, copies `--TRACKING-CAPS`.
- Site owner checking a token: served correctly by § 1/§ 2/§ 8; meets the `#252017 / #252017` midnight swatch pair with no explanation (`--color-background-muted` and `--color-surface-elevated` both resolve to film-200 in `dark.css`).
- Peer who followed the footer's type credit: promised a type credit, meets a grid of hexes, no foundry, no licence, no reason the site has a style guide.

## Minor observations

Caption says the tight ledger is "beside" the default; it is below. The 6% floor bars read as detached dashes with no legend note. § 7's only plate is a headshot where DESIGN.md prefers a press-corpus scan. Swatch grid leaves 3–4 empty columns above 1024. `.rail-label`'s bottom hairline meets the first `.meta-row`'s top hairline 44px apart on every rail site-wide — one boundary, two marks. `font-weight: 750` literal ×2 (house literal, as 830 is).

## Questions to consider

- Coverage drifted for three weeks and nothing failed: what would a `styleGuideCoverage.test.ts` that fails on an `ink-signal.css` class absent from the page cost?
- Should the contents ledger mark the section being read in pine, so the page's navigation demonstrates the Scarcity Rule?
- Is the § numbering an address or an ornament? Make it one or stop citing it.
