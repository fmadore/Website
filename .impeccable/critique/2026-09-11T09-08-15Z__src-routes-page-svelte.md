---
target: home, CV and shared chrome (5.1 optimize)
p0_count: 0
p1_count: 4
timestamp: 2026-09-11T09-08-15Z
slug: src-routes-page-svelte
---

# P — `/impeccable optimize` — home, CV, shared chrome (roadmap 5.1)

Method: 24 Lighthouse runs (mobile, simulated, lighthouse@12.6.1) over 8 routes × 3 on :4174; Playwright probe 8 routes × 375/1440 × both themes (LCP element, CLS, DOM, per-resource bytes, image geometry); font-blocked vs loaded geometry; Chrome coverage; content-visibility and long-task experiments at 4× CPU; CDP hydration profile; fontTools analysis + two re-subsetting experiments; sharp re-encode of nine covers.

## Evidence

Baseline (best-of-3 perf / LCP / total / fonts / images / requests): `/` 85 / 4105 / 484K / 285K / 11K / 32; `/publications` 84 / 4284 / 702K / 345K / 187K / 42; record 88 / 3760 / 590K; `/conference-activity` 86 / 4060 (one run 4558) / 610K / 99K; `/cv` 83 / 4411 / 517K / 345K / 0 / **55**; `/activities` 83 / 4247; `/research` 86 / 4136 / 649K / 224K images; `/digital-humanities` 85 / 4160. CLS 0.0000 on 32/32 combinations and 24/24 runs. Simulated LCP is 89–90% render delay on every route and tracks total transfer linearly: **bytes are the LCP lever**. Headroom against LCP ≤ 4500: `/cv` 89 ms, `/publications` 216 ms; fonts 345 of 360 KB on two pages.
Every page: one render-blocking stylesheet `0.*.css` 79,623 B, 153–155 ms — `svelte.config.js` `inlineStyleThreshold` is 72 KiB; the sheet outgrew it; `lighthouserc.yml` still says the sheet is inlined.
Thumbnails: `VARIANT_WIDTHS = [400, 800, 1600]` has no step below 400, so 56–120 CSS-px boxes get 400w files: `/publications` 292K, `/conference-activity` 293K, `/activities` 135K, DH 148K at 1440. Nine covers re-encoded: 400w 268K → 240w 119K → 160w 62K.
Fonts: latin-ext (329 glyphs) and vietnamese (153) subsets vs 8 + 5 characters in the whole build; `/publications` and `/cv` download 61 KB newsreader-normal-latin-ext for one `ł` (Błoch). Block-safe re-subset −110 KB on disk / −23 KB per page; content-exact −322 KB / −55 KB per page. No `size-adjust`/`ascent-override`; swap deltas at 375: home first p +36 px, ledger −259 px, `/cv` −2174 px.
CSS coverage 30–32%; no JS hotspot in hydration (filter system never above 0.3%); long tasks at 4× CPU 1285 ms `/publications`, 1336 ms `/conference-activity`, 961+574 `/cv` — parse + DOM, not logic.
`/cv`: `build/cv.html` holds 3 of ~17 sections; 14 load in four `setTimeout` waves (100–400 ms) = 23 extra requests; DOM 1912, 49,146 px; theme swap ×5 at 4× CPU 1900 ms → 318 ms with `content-visibility: auto` (but `auto 800px` intrinsic size collapsed the document to 7,764 px, breaking the ToC anchors). Communications chunk 228 KB raw, 40% `abstract`, imported by four CV components and `/conference-activity`.
Portrait: 300×300 source blown up 3.1× into the 375 LCP element (now replaced by the orchestrator with an 854×742 source + srcset before the fix phase).

Bottleneck — home: 285 KB of protected fonts; the actionable one is the 79.6 KB stylesheet that fell out of the inline threshold (153 ms on every route). `/publications`: 268 KB of 400w covers in 56–80 px boxes.

## Findings

- [P1] Thumbnail ladder lacks 160/240 steps (`generate-image-variants.mjs:25`, `imageVariants.ts:8`). −150–200 KB on `/publications` and `/conference-activity`, ~−75 KB `/activities`; also fixes six sources with `widths: []`.
- [P1] latin-ext/vietnamese subsets oversized; re-subset (block-safe −23 KB/page; content-exact −55 KB/page but corpus-coupled).
- [P1] `inlineStyleThreshold` 72 KiB < 79.6 KB sheet → render-blocking on 8/8; raise with margin, tighten the stylesheet budget so it cannot recur silently.
- [P1] `/cv` prerenders 3 of 17 sections (`cv/+page.svelte:78–126`); make the 14 imports static: +14 KB gz document, −23 requests, complete static record.
- [P2] Portrait 3.1× upscale — resolved by the orchestrator with the owner's original.
- [P2] No `@font-face` metric overrides; measured: Newsreader/Georgia size-adjust 102.6% asc 71.6% desc 25.8%; Archivo/Segoe UI 99.0/88.7/21.2; Spline Sans Mono/Consolas 109.1/96.4/24.1; line-gap 0.
- [P2] Full communications dataset (228 KB, 40% abstract) on `/cv` and `/conference-activity` — a `communications/summaries.ts` projection like publications'.
- [P2] CV theme toggle ~380 ms on a phone; `content-visibility: auto` −83% but needs per-section `contain-intrinsic-size` + anchor e2e.
- [P3] One cover with no variants (fixed by the ladder); the error page's 1.1 KB CSS on every route; ~10 MB of source maps deployed.

## Fine as is

CLS everywhere; LCP discovery on the portrait; filter-system hydration; code splitting; the font build's axes/GPOS/display; service worker; header scroll handler; request counts on 7 of 8 routes; no third parties; CSS coverage at 30% for a global idiom layer.

## Declined by the brief

Pinning Newsreader `opsz`; dropping the italic preload; lazy portrait / system fonts / fewer families / skeletons; will-change / fade-in; new libraries / CDN / build tool; removing JSON-LD, RSS, sitemap, SW.

## Open questions

1. Font subsetting exact vs block-safe. 2. Portrait quality vs bytes. 3. CV content-visibility in 5.1 or 6.1. 4. Stylesheet budget 1 vs a render-blocking assertion.
