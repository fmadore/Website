# CSS bundle roadmap — shrinking the global stylesheet

_Last updated: July 2026 (dead-token pruning + utility audit + panels.css
route-scoping pass; original numbers from the PageSpeed improvement pass)._

## Where things stand

The render-blocking global stylesheet (`0.<hash>.css`, built from `src/app.css`)
now weighs **~75 KB raw / ~12.6 KB gzipped** (was ~80 KB / ~13 KB before the
July 2026 pruning pass). Chrome CSS-coverage measurements against
the production build (pre-pass) showed:

| Route                  | Share of `0.css` actually used |
| ---------------------- | ------------------------------ |
| `/` (home)             | ~36%                           |
| `/publications`        | ~32%                           |
| `/conference-activity` | ~34%                           |
| `/activities`          | ~34%                           |
| `/cv`                  | ~32%                           |
| `/research`            | ~33%                           |
| **Union of all six**   | **~45%**                       |

So **more than half of the global bundle is not exercised by any major route**.
Because the file is render-blocking on every page, trimming it directly improves
FCP/LCP on all pages (PageSpeed's `render-blocking-insight` currently attributes
~150 ms simulated delay to it on mobile).

Source composition (raw bytes, biggest first):

| File                              | Bytes  | Notes                                             |
| --------------------------------- | ------ | ------------------------------------------------- |
| `base/variables.css`              | ~17.5K | design tokens (many likely unreferenced)          |
| `base/typography.css`             | ~16.7K | site-wide type system                             |
| `components/ink-signal.css`       | ~14.6K | structural idioms (rules, ledger, chips, plates…) |
| `components/animations.css`       | ~7.3K  | entry/scroll animations                           |
| `components/buttons.css`          | ~6.3K  | all button variants                               |
| `components/panels.css`           | ~5.2K  | panel module                                      |
| `utilities/surfaces.css`          | ~4.8K  | paper-tile surfaces                               |
| `layout/grid.css`                 | ~4.0K  | grid utilities                                    |
| `base/dark.css` + reset + media   | ~6.2K  | needed globally                                   |
| misc utilities (spacing, flex, …) | ~3.2K  | utility classes                                   |

Page-specific sheets (`entity-cards`, `activity-list`, `bibliography`,
`entity-index`) are already route-imported and code-split — the pattern to
extend.

## Roadmap (ordered by value/effort)

1. ✅ **Prune dead design tokens in `variables.css`.** _Done (July 2026)._
   The earlier `fdd3e3a` purge had already removed most legacy tokens; a full
   grep-verification pass found only `--border-radius-md` completely dead.
   The remaining fat was one-to-one indirection: `--sys-*` tokens whose sole
   consumer was a single semantic alias (`--sys-type-step-*` → `--font-size-*`,
   `--sys-font-family-*` → `--font-family-*`, and seven single-use sys colors)
   were collapsed into the semantic tokens directly. `--sys-*` tokens shared by
   several aliases or referenced by `dark.css` remain. Every token now has a
   grep-verified consumer (17.5K → 16.4K source; savings in the minified
   bundle are the deleted/collapsed declarations, comments never shipped).

2. **Route-scope the remaining page-flavored modules.** _Partially done
   (July 2026)._ ✅ `panels.css` no longer ships globally — `PanelBase.svelte`
   already imported it, so it now rides the per-route chunks for the home and
   research pages only. The two components that borrowed its declarations
   outside those routes (`LocationMap` popup `.item-list`,
   `RelatedItemsList` `.view-all-container`) now own local copies, and the
   dead `.type-filters-section` class was dropped. _Remaining:_ parts of
   `buttons.css` (rare variants: danger, loading spinner, block) and the
   pagination/key-terms/year-bar sections of `ink-signal.css` are only used on
   a few routes; they are addressed through dynamic variant props, so moving
   them needs per-variant usage tracing plus a coverage re-measure.

3. ✅ **Audit utility classes against actual usage.** _Done (July 2026)._
   Grep-verified every class in `utilities/*.css`, `layout/*.css`, `cards.css`
   and `navigation-utilities.css` against markup (including dynamically built
   class strings and prop defaults). `grid.css` shrank from the full
   Tailwind-style matrix to the five classes actually used (4.0K → 0.6K);
   `container-fluid`/`section-sm`/`section-lg` were dropped from
   `container.css`; three stale critical-CSS rules (`md:grid-cols-3`,
   `md:gap-8`, `md:col-span-2`) were removed from `app.html`. Everything else
   is in real use — the spacing/flex/color/sizing utilities are already lean.

4. **Split `typography.css` prose styles.** Long-form prose rules (blockquotes,
   lists, code blocks, footnote styling) only matter on content pages; the
   nameplate/heading system is global. A `prose.css` imported by `ContentBody`
   would move ~5K out of the critical path.

5. **Re-measure and consider full inlining.** Once the global sheet is under
   ~20 KB raw, it drops below `inlineStyleThreshold` (20480) and SvelteKit will
   inline it into every prerendered page — eliminating the render-blocking
   request entirely (the preloaded-then-disabled `<link>` pattern remains for
   caching). That is the end-state: **zero render-blocking stylesheets**.

## Guardrails

- After each step: `npm run build` and spot-check `/`, a list page, a detail
  page and `/cv` in both themes; then re-run the coverage script to confirm the
  used-share is rising, not the byte count merely moving between chunks.
- Don't reach for an automated purger (PurgeCSS etc.): Svelte's compiler
  already drops unused scoped styles, and global idioms addressed from
  `:global()` and generated class strings make purgers unsafe here. Manual,
  grep-verified deletion is cheap and predictable at this codebase's size.

## Coverage script

Used to produce the table above (adjust the preview port as needed):
run `npm run build && npm run preview`, then execute a Playwright script that
calls `page.coverage.startCSSCoverage()` per route, loads the page, scrolls to
the bottom, and reports covered byte ranges of the `assets/0.*.css` entry.

## Related follow-ups outside the CSS bundle

- **Responsive images (`srcset`).** Sources are now capped (800w covers /
  1280w heroes, WebP q80 — see `scripts/optimize-images.mjs`), but list views
  still download detail-page-sized files (e.g. covers shown at ~100–200 px).
  A sharp-based prebuild step emitting 480w/960w variants plus `srcset`/`sizes`
  in `BibliographyRow`, `ActivityItem`, entity cards and the research/DH cards
  would clear the remaining `image-delivery` flags (~100–350 KB per list page).
- **GitHub Pages cache TTL.** Pages caps `Cache-Control` at `max-age=600`;
  PageSpeed will keep flagging "efficient cache policy" for fonts/images until
  the site fronts Pages with a CDN that allows long-lived immutable caching
  (e.g. Cloudflare) or moves hosts. Not fixable in-repo.
- **Zenodo DOI badges on `/cv`** are now lazy-loaded and dimensioned, but they
  remain ~25 third-party requests; self-hosting the badge SVGs (or rendering
  the existing styled text fallback by default) would remove the dependency.
