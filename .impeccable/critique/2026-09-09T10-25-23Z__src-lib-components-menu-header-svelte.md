---
target: 'system chrome: header/nav, footer, error pages (2.11)'
total_score: 23
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 3
timestamp: 2026-09-09T10-25-23Z
slug: src-lib-components-menu-header-svelte
---

Method: dual-agent (A: isolated Opus design review with `npm run shot` captures + Playwright interaction captures at 1280–1440 and 375 in both themes · B: isolated Opus detector + Playwright console/axe/overflow/keyboard/touch-target pass). B's evidence reached the orchestrator before A2 finished; A2's verdict was formed in isolation and is reported as delivered. Target: system chrome — header/nav, footer, error pages (roadmap 2.11). Mode: Operate (chrome), Read (404).

## Design Health Score (as found)

| #         | Heuristic                   | Score     | Key issue                                                                                                                                                                                                       |
| --------- | --------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of system status | 3         | `aria-current` + pine on both navs; hover paints a second "current" underline; `header-scrolled` is a dead class                                                                                                |
| 2         | Match system / real world   | 3         | Masthead, colophon, "pick up the thread" land; external dropdown items unmarked while the footer marks them                                                                                                     |
| 3         | User control and freedom    | 2         | Space on a nav trigger scrolls 787px; Escape inert inside a dropdown; the masthead retracts while you read                                                                                                      |
| 4         | Consistency and standards   | 1         | Same six project titles in Archivo sentence case (desktop) and 10px mono caps (mobile); 21 pine underlines the desktop nav is exempt from by name; `role="menu"` without menu semantics; two 404s that disagree |
| 5         | Error prevention            | 3         | `strict` prerendering means no dead internal links; unannounced new tabs                                                                                                                                        |
| 6         | Recognition over recall     | 2         | 22-entry mobile menu in caps mono, 1136px, nothing collapsible                                                                                                                                                  |
| 7         | Flexibility and efficiency  | 1         | No skip link, 15–23 tab stops to content on every page; desktop nav withheld below 1280                                                                                                                         |
| 8         | Aesthetic / minimalist      | 3         | Header and static 404 are the best-composed chrome; 40% of the footer empty; a 530px dropdown sheet                                                                                                             |
| 9         | Diagnose and recover        | 2         | Static 404: five ways forward, no identity, no path; SPA error: path but only "Go to homepage", raw framework string on the non-404 branch                                                                      |
| 10        | Help and documentation      | 3         | The type credit into `/style-guide` is the right help for this audience                                                                                                                                         |
| **Total** |                             | **23/40** | Needs work (≈ 18/32 on the Phase 2 scale)                                                                                                                                                                       |

## Design specificity verdict

The masthead is a masthead: Archivo 830 wordmark on the wide cut, mono nav at the label tier, one pine mark for the current section, a 4px ink rule, and — measured — `backdrop-filter: none`, `opacity: 1`, the ground exactly `--color-background` in both scroll states and both themes. The colophon strip (mono © left, serif-italic type credit right, over a hairline) is genuine; above it sits a generic three-column link footer whose only exits are Google Scholar, ORCID and ResearchGate — the aggregators PRODUCT.md positions the record against. The 404 splits in two: `static/404.html` (what a mistyped URL gets) is in the archive's voice with five flat chips but no site identity and no path echo; `+error.svelte` (reached by client-side navigation into a matched route with a missing record) says "Sorry, we couldn't find…", echoes the path, and offers one pine button home. Different headline, lede, rule weight, title and affordance count.

Deterministic scan: `detect.mjs` → 0 findings on `menu/`, `Footer.svelte`, `+error.svelte`, `+layout.svelte`. Greps: every `box-shadow` is `none`, every `border-radius` is `0`, every `!important` is inside `prefers-reduced-motion`; 0 hex/rgba/gradient/glass/raw tracking/pixel media. Browser: 0 console errors on `/`, `/publications`, `/cv` (the 404's one error is the document reporting its own status), 0 axe violations in 28 runs including with the mobile menu open, 0 overflow, 0 sub-44px targets on a coarse pointer. Pine at rest: header 0–2 (the active item only), footer 0, static 404 2, mobile menu **21–23**. Overlay: `all-caps-body` ×7 on the mobile dropdown links (real); `text-overflow` on `/publications` `.bib-year` by 17px (real, out of scope); the rest declined as pinned brief.

## Priority issues

- **[P1] Two 404s that disagree; neither is complete.** One voice, one composition; a wordmark under the static page's rule; echo the path; the primary action is the index the URL was already inside; the non-404 branch gets a designed sentence with the message as a diagnostic line. → clarify
- **[P1] 21 pine underlines in the mobile menu.** `typography.css:169/186` exempt `.nav-link` and `.dropdown-item` by name and never learned `.mobile-nav-link` / `.mobile-dropdown-link`. A 4× Scarcity failure the components cannot see. → polish
- **[P1] No skip link; 15–23 tab stops to content on every page.** `main` has no id. → harden
- **[P2] The nav's keyboard and ARIA contract.** Space scrolls the page; ArrowDown inert; Escape inert inside a dropdown; `role="menu"`/`menuitem` strips the link role from 14 links; `aria-expanded="false"` on three links that expand nothing; no `aria-controls`. → harden
- **[P2] The footer is half a colophon and its one control is theme-broken.** Scroll-to-top is `--color-primary` on a `--color-primary` ground (invisible in daylight), slides in over 300ms, is focusable at tab position 165/165 while `opacity: 0`, and appears only after the scrolling is done; midnight footer ground at 1.06:1 against the page; 40% of the width empty; three groups in a two-column grid; link names in Archivo (document voice) for database-column strings; the address as a six-line link; `--sys-color-pine-bright` consumed directly (the only component that bypasses the semantic layer). → layout
- **[P3] Motion above the brief's ceiling.** Dropdown 200ms reveal + per-item stagger to ~440ms + `translateX` nudge + accent wash; mobile panel stagger to ~540ms; nav underline `scaleX` sweep; the same six titles in two voices by viewport. → distill

## Persona red flags

- Alex (keyboard): 23 stops to content; Space jumps the page; Escape dies inside the dropdown; "menu, 6 items" announced, arrows do nothing.
- Jordan (phone): 1136px of menu, six two-line ALL-CAPS mono project titles before Publications, every entry underlined in pine.
- Peer who mistyped a DOI-style URL: nothing on screen says whose archive this is; the path is not shown; Publications — whose filter would find the record — is chip one of five.

## Minor observations

`header-scrolled` is a no-op maintained by a rAF listener. `HamburgerButton`'s X transform is unreachable (`opacity: 0` first). `--color-footer-text-muted` is a literal outside the warm ramp. Wordmark "FRÉDÉRICK MADORE" vs colophon "FRÉDÉRICK MADORE, PH.D.". Static 404 declares `font-stretch: 100% 125%` and never sets a width axis; its h1 is 700/-0.01em against the system's 830/wdth 116/-0.015em. Desktop nav withheld below 1280 — a 13" laptop gets the phone panel. Record rail sticks at `top: 32px` under a 76px masthead. No global search exists, so the 404's signposting carries more weight.

## Questions to consider

- If the register is print, why does the masthead retract?
- Which voice owns a record title inside chrome? The system currently answers "depends on your viewport."
- Should the colophon of the authoritative record link to the places it claims to beat, or be the record itself — RSS, sitemap, `llms.txt`, the MCP server?
- Is the scroll-to-top button earning its keep?
