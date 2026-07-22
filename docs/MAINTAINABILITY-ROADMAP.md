# Maintainability & Efficiency Roadmap — July 2026

Follow-up to the June–July 2026 refactoring wave (runes migration, component
splits, entity-index filter convergence). This roadmap consolidates a
five-track audit of the repository (code health, data layer, build/bundle,
CSS architecture, testing/CI) into phased, verifiable work. Each phase is
independently shippable; phases are ordered by risk-adjusted value.

Status legend: ☐ pending · ☑ done · ◪ partial / deferred (see notes)

> **Status as of 2026-07-22:** every non-deferred item below has landed on
> `claude/repo-maintainability-review-oc7fdh`. Remaining work is the four
> deferred items (fonts, responsive images, audio re-encoding, ESLint
> ratchet) plus the home-page Person JSON-LD duplication noted in Phase 7.

---

## Phase 1 — Bugs & safety fixes (zero-risk, immediate)

- ☑ **Service worker: JSON never revalidated.** `shouldUseCacheFirst()` runs
  before the stale-while-revalidate check and matches by substring;
  `CACHE_FIRST_ROUTES` contains `'.js'`, and `'.json'.includes('.js')` is
  `true`, so every `.json` request is served cache-first and the entire
  `STALE_WHILE_REVALIDATE_ROUTES` branch is dead code. Returning visitors can
  see stale data until a redeploy. Fix: extension-aware matching and/or check
  order. (`src/service-worker.js`)
- ☑ **Register the four icons that silently hit `api.iconify.design`.**
  `lucide:maximize`, `lucide:arrow-up-right`, `lucide:play` (SlideDeck
  components) and `mdi:arrow-up` (`Footer.svelte` — every page) are not in
  `src/lib/icons.ts`, so they fall back to a runtime third-party fetch,
  breaking offline and adding a request per page.
- ☑ **Guard bare console statements** per the CLAUDE.md rule:
  `src/routes/+layout.svelte:52`, `src/lib/utils/gtm.svelte.ts` (4×),
  `src/lib/utils/networkMonitor.svelte.ts` (2×), and make
  `src/lib/utils/dataLoader.ts` internally consistent (lines 76/117/127/139
  unguarded vs. 151 guarded).
- ☑ **Remove duplicate font preconnects** in
  `src/routes/activities/[id]/+page.svelte` (already global in `app.html`).

## Phase 2 — Data integrity validation (highest safety value)

- ☑ **Add a data-validation Vitest suite** that globs all ~268 content files
  in `src/lib/data/` and asserts, per category: required fields present,
  `id` uniqueness (within each dataset and globally for
  publications + communications, which share the reference index), parseable
  `date`/`dateISO`/`year` values, and template exclusion. Today
  `dataLoader.ts` silently drops malformed items in production builds and no
  CI step would notice.
- ☑ **Unit-test `dataLoader.ts`** (load-bearing for all 17 categories,
  currently untested): extraction precedence, template filtering, sorting,
  malformed-module handling.

## Phase 3 — Dead code removal (~1,900 lines, verified unreferenced)

- ☑ **Delete the orphaned legacy filter island** (~1,470 lines, zero
  importers outside itself): `organisms/UniversalFiltersSidebar.svelte`,
  `organisms/ActiveFiltersBar.svelte`, all five
  `molecules/filters/FilterSection*.svelte`, `utils/filterHelpers.ts`,
  `types/filters.ts`; scrub the stale references in `src/app.css` and
  `src/styles/CSS-README.md`. The live path is `entityFilterSystem.svelte.ts`
  - `EntityFilterBar`/`EntityFacetGrid`.
- ☑ **Purge dead design tokens** in `src/styles/base/variables.css`
  (~100 of 384 unreferenced), starting with the fully retired clusters: all
  `--shadow-*` (all resolve to `none`; the sole remaining reference at
  `utilities/images.css:97` is a no-op), dead `--border-radius-*` aliases,
  `--breakpoint-*` (duplicated as literals in `media.css`), dead
  `--font-weight-*`, `--container-query-*`, `--transform-lift-*`,
  `--ease-bounce/smooth/spring`, retired color tokens. Verify each with a
  repo-wide grep before deletion.
- ☑ **Purge unused utility classes** (~200 across `src/styles/utilities/`;
  `transforms.css` ~89 % unused, `colors.css` ~81 %, `flex.css` ~74 %).
  Grep-verify every class name before removal.
- ☑ **De-duplicate `components/cards.css` vs `Card.svelte`** — the component
  is the only consumer of the `.card*` family and re-defines every rule in
  its scoped styles; collapse to one owner and drop the seven never-used
  `.card-*` variants.
- ☑ **Fix `src/styles/CSS-README.md`** — the `.glass-*` classes it documents
  as live no longer exist (renamed `.surface-*`).
- ☑ **Remove `mdsvex`** — wired into `svelte.config.js` but zero `.svx`
  files exist.
- ☑ **Move `@types/d3` to `devDependencies`.**
- ☑ **Drop stale npm scripts** (`build:pwa`, `pwa:validate`) and archive the
  root `DESIGN-REVIEW-2026-06.md` (self-labelled historical document).
- ☑ **Fix dead links in `docs/components/README.md`** (three linked
  subdirectories don't exist; documents a deleted `ItemCard`).

## Phase 4 — Duplication consolidation (the next `BibliographyRow`s)

- ☑ **One canonical publication-type→label map.** Today duplicated in
  `cvFormatters.getPublicationTypeDisplayName`, `citationFormatter`
  (`PUBLICATION_TYPE_CITATION_LABELS`), and two hand-rolled maps inside
  `publications/MetaTags.svelte` (`getCitationGenre`, `getDcType`).
- ☑ **Consolidate author-list formatting** on `nameUtils.ts`:
  `citationFormatter.formatAuthorList`, `cvFormatters.formatCVAuthorList`,
  and `nameUtils.formatAuthorsCompact` are three drifting variants (they
  already disagree on separators).
- ☑ **Config-driven SEO builders.** ~300 of `seoUtils.ts`'s 401 lines are
  three near-identical description builders + three keyword builders
  differing only in field names; replace with one parameterised builder.
- ☑ **Shared head-tag builder for the four `MetaTags.svelte` components.**
  They share a byte-identical `resolveUrl`, the same COinS scaffold, and
  near-verbatim DC/OG/Twitter blocks; extract a `buildHeadTags(config)`
  helper so each component only declares its field mapping.
- ☑ **Split `jsonLdSchemas.ts` (720 lines)** into base schema factories vs.
  per-entity builders; stop re-exporting `createSectionBreadcrumbs` through
  `seoUtils`.
- ☑ **Shared `EntityDetailLayout`** for the `communications/[id]`,
  `activities/[id]`, `digital-humanities/[id]` shells (identical
  Breadcrumb → PageHeader → Hero → DetailsGrid → Tags → Links → Abstract →
  Related → MetaTags sequence, 330–450 lines each). `publications/[id]`
  (723 lines) splits separately (carries CitedBy/Reviews).

## Phase 5 — Bundle & asset efficiency

- ☑ **Fix the d3 chunk split defeating itself.** `CareerTimeline.svelte`
  statically imports `d3-scale`, but `vite.config.ts` merges all `d3-*` into
  one chunk, so `/cv/timeline` eagerly downloads force/zoom/selection meant
  to lazy-load only for `D3BubbleChart`. Split the manual chunk (scales vs.
  the rest) or dynamic-import the timeline's scales. Also narrow the broad
  `id.includes('d3-')` matcher.
- ◪ **Self-host and subset the three font families** (Archivo, Newsreader,
  Spline Sans Mono). Currently loaded from Google Fonts with full variable
  axes — two third-party origins on every page's critical path. _Deferred to
  a dedicated PR: visual-critical, needs subsetting tooling and careful axis
  selection._
- ◪ **Responsive images.** No `srcset` anywhere;
  `HeroImageDisplay.svelte` sets `sizes` without `srcset` (inert). Five hero
  images are 1–2.2 MB; three files still raw JPEG. _Deferred: needs an image
  pipeline (e.g. `@sveltejs/enhanced-img` or a resize script) and a decision
  on generated-variant storage._
- ◪ **Audio weight.** `static/notebooklm/` ships 44 MB of MP3 (more than all
  images combined). Re-encoding at a speech-appropriate bitrate (~64 kb/s
  mono) would roughly halve the deploy artifact. _Deferred: content decision
  for the author._
- ☑ **Cap the service-worker runtime cache** (currently unbounded until the
  next deploy).

## Phase 6 — Testing & CI

- ☑ **Unit-test the filter system** (double blind spot — core UX, zero
  coverage): `entityFilterSystem.svelte.ts` and the URL⇄state serialization
  in `urlFilterSync.svelte.ts`.
- ☑ **Extend E2E smoke coverage**: filter interaction on a list page,
  dark-mode toggle, RSS + sitemap well-formedness, 404 route.
- ☑ **CI: cache Playwright browsers** (currently re-downloaded every run —
  the slowest step) and reuse the quality-job build in the e2e job instead
  of building twice per PR.
- ☑ **CI: run e2e on the deploy path** (today only PR CI runs it).
- ◪ **Ratchet the grandfathered ESLint warnings** (`no-explicit-any`,
  `no-unused-vars`, `svelte/no-at-html-tags` are `warn`, so lint passes
  despite them). Track counts; flip to `error` per rule as they reach zero.
  _Deferred: policy decision — flipping now would fail CI on ~76 grandfathered
  `any`s; ratchet as they are burned down._

## Phase 7 — Data-layer hardening

- ☑ **Unify template/index exclusion across the 17 categories.** Four
  idioms coexist (glob negation, no exclusion at all, post-hoc filtering,
  `delete` on the module map); seven categories import their own `index.ts`
  and exclude templates only "accidentally" (bodies commented out). Adopt
  one idiom: glob negation + explicit `templateIds`.
- ☑ **Harden `scripts/generate-reference-index.mjs`**: it re-implements
  module extraction and template filtering with logic that differs from
  `loadData()`, its committed output can go silently stale, and its header
  claims Node ≥ 24 semantics it doesn't need. Add a CI freshness check
  (regenerate + `git diff --exit-code`) and align the filtering rules with
  the runtime loader.
- ☑ **Converge stragglers**: `analysis` is the only category not using
  `loadData()`; `teaching/guest-lectures.ts` defines its type inline (moves
  to `$lib/types`); `affiliations` imports its type via `./template` instead
  of `$lib/types`; `organisedWorkshops.ts` hardcodes institution strings
  that exist in `siteConfig.address`; `+page.ts` (home) hand-maintains a
  second `Person` JSON-LD duplicating `createPersonSchema()` and the
  education/affiliations/languages datasets. _All landed except the home-page
  Person JSON-LD consolidation, which changes emitted structured data and is
  left as an editorial follow-up. The `analysis` deviation from `loadData()`
  is deliberate (keyed record, named export) and now documented in place;
  `organisedWorkshops` keeps its English institution name intentionally
  (siteConfig carries the German form) but takes the URL from siteConfig._

---

## Verification gate (every phase)

```bash
npm run check   # 0 errors
npm run lint    # prettier + eslint clean
npm test        # all unit tests pass
npm run build   # static build succeeds
npm run test:e2e  # smoke suite green (phases touching routes/UI)
```
