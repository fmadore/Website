# Refactoring & Feature Roadmap

This document tracks larger refactoring opportunities and forward-looking
feature work that doesn't fit cleanly inside a single PR. It supersedes the
previous "all actionable items completed" snapshot of `REFACTORING-ROADMAP.md`
(removed in commit `fa7d0b3`).

Each section can be picked up independently — phases inside a section are
roughly ordered by polish-per-effort but are self-contained.

> **Historical note (July 2026).** The "Animation & Reactivity Roadmap" and
> "Design Evolution — Warm Editorial Direction" sections below predate the
> **Ink + Signal** redesign (see `.impeccable.md` and the Design Context in
> `CLAUDE.md`). They narrate the retired warm-editorial era
> (Fraunces/Spectral/Commissioner, glass-for-chrome) and are kept as a
> record of landed work, not as guidance. Current forward-looking work
> lives in the section directly below.

---

## Code Architecture & Consistency Roadmap — July 2026 review

Findings from a full-repo audit (data layer, components/routes, CSS/design
compliance, and the ECharts/D3/MapLibre visualization layer). Baseline at
audit time: `svelte-check` 0 errors, lint clean, 64/64 unit tests passing,
zero legacy Svelte syntax (`export let`, `$:`, `on:` directives),
`loadData()` adopted by 16/17 data categories, and the Ink + Signal token
layer fully landed. The items below are the debt that remained, ordered by
phase; each phase is a self-contained PR-sized unit.

> **Status (July 2026, branch `claude/repo-website-review-u1jjxf`):
> Phases 1–7 landed** — see the commit series `docs(roadmap)` →
> `refactor(css): retire the glass vocabulary`. Along the way the ECharts
> chunk shrank 1,141,754 → 682,289 bytes (tree-shaken `echarts/core`), the
> two list pages dropped ~550 duplicated style lines each into
> `entity-index.css`, and unit tests grew 64 → 160. Still open from this
> review (deliberately deferred, see "Explicitly deferred" below plus):
> a generic `BibliographyRow` for PublicationItem/CommunicationItem; the
> known `formatCitation` trailing-space and "Published in in <book>" SEO
> quirks (asserted as current behavior in the new tests); DH detail-page
> `MetaTags` intent check; and full facet-grid/filter-bar _markup_
> extraction into shared components (only the CSS is shared so far).

### Phase 1 — Correctness & brief-compliance quick wins

- **Hardcoded author name** (violates the CLAUDE.md siteConfig rule): the
  literal `'Frédérick Madore'` appears in `jsonLdSchemas.ts` (6 sites,
  incl. `alternateName`), `cvFormatters.ts` (2), and `webmcp.svelte.ts`
  (4). Replace with `author.name` from `$lib/data/siteConfig`.
- **Reactive-state mutation**: `urlFilterSync.svelte.ts:126` calls
  `.sort()` in place on the live filter array inside an `$effect`. Sort a
  copy. Also document the deliberate `replaceState: true` trade-off
  (Back/Forward does not step through filter states).
- **`AudioVisualization.svelte`**: gradient wave bars, two
  radial-gradient glow backdrops, and an infinite pulse loop — the one
  rendered violation of "no gradients / no glow / near-zero motion".
  Replace with flat ink/accent fills, delete the glows and the loop.
- **Chart glows**: `D3BubbleChart` hardcoded white labels + `text-shadow`
  (use the existing `getContrastLabelStyle()` like the treemap);
  `EChartsWordCloud` emphasis `textShadowBlur: 10`;
  `EChartsDoughnutChart` mobile-label `textShadowBlur: 3`. Remove all.
- **Dead code**: unused `.map-marker` CSS block with `drop-shadow` in
  `MapVisualization.svelte`; `createSortHandler` in `filterUtils.ts`;
  `setActivities`/`addActivity`/`getActivitiesByYear` in
  `stores/activities.svelte.ts`; corrupted JSDoc header in
  `filterUtils.ts:1-17`.
- **Dead tokens**: the glass/blur/header-opacity block
  (`variables.css:628-670`) and the retired ink-blue
  `--card-shadow-color` triplet — nothing consumes them.

### Phase 2 — Documentation truth pass

- **CLAUDE.md contradicts itself**: line 7 ("glassmorphism-based custom
  CSS framework") and the Styling Rules bullets instructing `.glass-card`
  / glass-blur-token usage directly contradict the Design Context ("glass
  does not exist"). Rewrite to the Ink + Signal idioms.
- **CSS-README.md**: body still documents glass gradients, `--ease-bounce`,
  "ink-blue" buttons, gradient link underlines, and the deleted
  `scrollAnimations.ts`. Reconcile with shipped reality.
- **Stale era comments**: "Spectral"/"amber"/"ink-blue" comments in
  `panels.css`, `PdfGenerator.svelte`, `ProjectImageBanner.svelte`,
  `Card.svelte`, `PublicationItem.svelte`, `CommunicationItem.svelte`,
  `AudioVisualization.svelte`.
- Mark `DESIGN-REVIEW-2026-06.md` as a historical document of the
  superseded direction.

### Phase 3 — Visualization layer

- **Extract `useMapLibre.svelte.ts`**: `LocationMap` and
  `MapVisualization` duplicate ~120 lines of lifecycle each (dynamic
  import → container-layout wait → controls → theme-driven style swap →
  data-change effect → cleanup). Mirror the existing `useECharts` hook;
  this also gives `LocationMap` the `hasWebGLSupport()` guard it is
  missing today, and stops its double marker rebuild on theme toggle.
- **Tree-shake ECharts**: `useECharts.svelte.ts` imports the full
  `echarts` package (~1 MB chunk). Move to `echarts/core` +
  `use([...])` registering only the series/components actually used
  (bar, pie, scatter, custom, treemap, graph + grid/tooltip/legend/aria
  - canvas renderer; wordcloud via `echarts-wordcloud`). Largest byte
    win in the repo. Verify with a before/after build-size comparison.
- **`D3BubbleChart` perf**: the resize/theme `$effect` tears down the SVG
  and reruns a synchronous 300-tick force simulation. Debounce resize,
  and split "recompute layout" (data/size) from "recolor" (theme).
  Import `d3-*` sub-packages instead of the whole of `d3`.
- **Chart consistency**: WordCloud re-implements `resolveColor` and
  hand-rolls its tooltip (use `chartColorUtils` shared helpers); Gantt is
  the last consumer of deprecated `getAnimationConfig` (migrate to
  `getChartMotion`, delete the shim) and lacks a data-derived aria
  description; `CareerTimeline` category icons are hardcoded white on
  category-colored tiles (use contrast-aware color); the
  `MapVisualization` legend `colorKey: 'teal'` actually maps to plum —
  rename.

### Phase 4 — Data-layer dedupe

- **`withAuthorUrl(authors)` helper**: author-URL attachment is
  triplicated across publication/communication/DH JSON-LD builders.
- **`buildActivityJsonLd`**: `activities/[id]/+page.ts` builds its
  BlogPosting JSON-LD inline (~35 lines) because the builder is missing
  from `jsonLdSchemas.ts`.
- **Generic `loadEntityById(finder, buildJsonLd, notFound)`**: the four
  `[id]/+page.ts` loaders repeat find-by-id → 404 → JSON-LD → return.
- **`seoUtils.ts`**: the publication/communication/activity SEO
  description builders are ~70% the same algorithm — extract a
  parameterized `buildSeoDescription()`.
- **`citationFormatter.ts`**: the "place: publisher" imprint block is
  copy-pasted 4×; `formatAuthorList`/`formatEditors` duplicate the
  join-with-and logic. Extract `formatImprint()` + `joinNames()`.
- **`dataAggregation.ts`**: add a year-field sort variant so
  `appointments/index.ts` stops hand-rolling ongoing-first ordering.

### Phase 5 — Route & component consolidation

- **The big one**: `src/routes/publications/+page.svelte` (1,138 lines)
  and `src/routes/conference-activity/+page.svelte` (1,288 lines) are
  ~85% copy-paste twins (~950 duplicated lines: hero, filter bar,
  byte-identical facet grid, ~550 lines of duplicated scoped CSS each).
  Both already consume the same `createFilterSystem` contract, so
  extract shared building blocks (an entity-index component family +
  `src/styles/components/entity-index.css`) parameterized by filter
  module, type labels, hero copy, item component, and optional slots for
  the map toggle / upcoming block.
- **`PublicationItem` ↔ `CommunicationItem`**: parallel bib-row and
  entity-card markup (~140 near-duplicate lines) — extract a generic
  `BibliographyRow` with per-entity adapters when touching these next.
- **Detail-page shell**: `publications/[id]/+page.svelte` (719 lines) is
  a bespoke rewrite (own breadcrumb + header markup) while the other
  three detail routes compose `Breadcrumb`/`PageHeader`. Minimum: use
  the shared `Breadcrumb`. Decide whether to promote its editorial
  treatment into `PageHeader` or document the divergence.
- **A11y**: `/activities` year-group labels are `<span>`s, producing an
  h1→h3 skip (make them `<h2>`); add `aria-live="polite"` to the
  "Showing N" match-count line on list pages; DH detail page omits
  `MetaTags` (confirm intent or add).
- `/activities` remains a third list architecture (URL-`?tag=` only, no
  `createFilterSystem`) — converging it is a follow-on, not part of this
  pass.

### Phase 6 — Test coverage for pure utils

In value order: `citationFormatter.ts` (per-type formatting switch, most
regression-prone), `chartColorUtils.ts` (`colorWithOpacity`,
`resolveColor` incl. the `rgba(var())` branch, `getContrastLabelStyle`,
`getBoundedTooltipPosition`, `getChartMotion`), `dataAggregation.ts`
(NaN-date total-order guard), `seoUtils.ts` (160-char budget math).

### Phase 7 — Retire the glass vocabulary

The `.glass-*` classes are fully neutralized (flat paper tiles, no
`backdrop-filter` anywhere) but the names survive in
`utilities/glassmorphism.css` and 49 usages across 11 components — a
misleading vocabulary for contributors. Rename to surface/plate idiom
names, and drop the no-op `shadows.css` / `border-radius.css` utility
files from the import chain (every value resolves to `none`/`0`).

### Explicitly deferred

- Migrating `createFilterSystem` from Svelte stores to a runed class
  (would remove the `as unknown as` casts on the list pages) — larger
  reactivity-model change, do standalone.
- Converging `/activities` onto the shared entity-index architecture.
- Splitting oversized components (`PdfGenerator` 927, `CareerTimeline`
  858, `ResearchProjectLayout` 683, `MobileMenu` 609 lines) — mostly
  mechanical, low risk of rot, pick up opportunistically.

---

## Animation & Reactivity Roadmap

A phased plan for evolving the site's motion system beyond what landed in
`feat(animations): add tasteful Svelte reactivity and motion polish` (commit
`47b0f11`, branch `claude/enhance-svelte-animations-F0gvY`).

The current baseline includes:

- CSS-only scroll-driven animations (`scroll-reveal`, `scroll-reveal-scale`,
  `grid-stagger`, `page-enter`, `hero-entrance`, hero sequence classes).
- Motion design tokens in `src/styles/base/variables.css` (`--duration-*`,
  `--ease-*`, `--stagger-*`, `--anim-distance-*`).
- Svelte `animate:flip` + `in:fade` / `out:fade` on filterable lists
  (`FilteredListDisplay`, `activities/+page.svelte`).
- Route-level cross-fade in `+layout.svelte` keyed on pathname.
- Scroll-direction-aware header that hides on scroll-down and reveals on
  scroll-up.
- Active-page underline on `NavLink` with `currentPath` propagation through
  `Header` → `DesktopNav` → `NavItemWithDropdown`.
- Animated active-section indicator bar on `CVTableOfContents`.
- Tactile press feedback on filter chips.
- Shared motion utilities in `src/lib/utils/motion.ts`
  (`prefersReducedMotion`, `motionDuration`).

All the items below assume that baseline and respect `prefers-reduced-motion`.

---

### Phase 0 — Validation & instrumentation

Run before adding more, regardless of which later phase you pick up.

- **Visual regression sweep**: walk through `/`, `/publications`,
  `/publications/[id]`, `/communications`, `/activities`, `/cv`, then exercise
  filters + sort + clear-all on each list page. Watch for layout shift,
  dropped frames during flip, or transitions firing on initial mount (they
  shouldn't).
- **Reduced-motion audit**: toggle `prefers-reduced-motion: reduce` in DevTools
  and re-walk the same flows. Confirm the header still hides/shows but without
  the slide, and filter reordering
  becomes instantaneous.
- **Lighthouse CLS check**, especially on `/publications` after a filter
  toggle. Target: zero unexpected CLS from the flip wrappers.
- **Manual test plan**: keep a short checklist (e.g. `docs/animation-test-plan.md`)
  of golden-path motion flows. Future motion work tends to silently break old
  motion work; a 20-line list catches it.
- **Optional**: wire up `web-vitals` to log INP under filter interactions in
  dev. Flip happens on the main thread and INP will surface budget issues on
  slower devices.

---

### Phase 1 — Tighten what just landed

Small follow-ups that complement the current PR without new concepts.

1. **`/conference-activity`** uses `FilteredListDisplay` so it inherited the
   flip animation automatically — confirm it feels right; if reordering on big
   lists feels slow, drop `FLIP_DURATION` from 350 → 280ms in
   `FilteredListDisplay.svelte`.
2. **Activity year subpages** (`/activities/year/[year]`) currently don't have
   flip — add the same wrapper pattern for consistency.
3. ~~**`RelatedItemsList`**~~ ✅ _Landed._ Each related item now wraps in a
   `<div in:fade>` (220 ms, `cubicOut`) so the new set fades in cohesively
   when the user navigates between detail pages. Keyed by `item.id`, so
   identical items don't re-fade. Respects `prefers-reduced-motion` via
   `motionDuration()`.
4. ~~**Featured publications carousel/grid**~~ ✅ _Landed._ Both the
   `<FeaturedPublications>` block and the "All Publications" header are
   wrapped in `transition:fade={{ duration: 220, easing: cubicOut }}` on the
   publications list page, so they don't snap in/out as the user starts /
   clears filters.
5. ~~**Sorter feedback**~~ ✅ _Landed._ `Sorter.svelte` now triggers a
   220 ms scale pulse (1 → 0.94 → 1, `cubicOut`) on every sort change via a
   transient `.sorter-button--pulse` class managed in JS. The pulse runs
   alongside the list's flip so the button visibly acknowledges the click.
   Respects `prefers-reduced-motion`.
6. ~~**Tag click in `TagCloud`**~~ ✅ _Landed._ `TagCloud.svelte` adds a
   `:active { transform: scale(0.96) }` press feedback at instant duration,
   matching the filter-chip pattern. Pure CSS, automatically suppressed
   under `prefers-reduced-motion`.

---

### Phase 2 — Navigation system polish

Bigger UX wins around getting around the site.

1. **Mobile menu open/close transition**. The current `MobileMenu` likely just
   toggles `display`. A `transition:slide` from the right (or `fly` with
   `x: 300`) plus a backdrop fade would give it the same level of polish as
   the desktop dropdowns.
2. **Active-state propagation through dropdown items**. The current PR
   highlights the top-level nav link for the current page; extend the same
   `currentPath`-matching to highlight the active item _inside_ an open
   dropdown menu (e.g., when on `/publications/visualisations`, the
   "Visualisations" item in the Publications dropdown should be marked).
3. ~~**Breadcrumb hover affordance**~~ ✅ _Landed._ `Breadcrumb.svelte`
   migrated from a button-tile hover (background + border + ::before
   gradient) to the editorial NavLink pattern: a thin terracotta underline
   that expands from `width: 0` to `100%` on hover (`var(--duration-normal)`,
   `cubicOut`). The active/current segment loses its chip background too —
   primary text only — so the page heading immediately below stays the
   dominant title. Touch and reduced-motion handled.
4. ~~**Theme toggle micro-animation**~~ ✅ _Landed._ `ThemeToggle.svelte`
   stacks both icons in a single `inline-grid` cell and cross-fades them
   (200 ms, `cubicOut`) when `currentTheme` flips, instead of swapping
   instantly. Respects `prefers-reduced-motion` via `motionDuration()`.
5. ~~**Page anchor scroll smoothing**~~ ✅ _Landed._ `CVTableOfContents`
   and `CareerTimeline` both feature-detect `prefers-reduced-motion` and
   pass `behavior: 'auto'` to `scrollIntoView()` when reduced motion is
   requested. Native `scrollIntoView({ behavior: 'smooth' })` is one of the
   few APIs that ignores the OS preference, so this had to be done by hand.
6. ~~**Keyboard focus ring transitions**~~ ✅ _Landed._ The global
   `:focus-visible` rule in `src/styles/base/reset.css` now transitions
   `outline-color`, `outline-offset`, and `box-shadow` over 120 ms with
   `ease-out`, so the ring feels less brittle as keyboard focus moves
   between elements. Outline width itself stays instant — width snap keeps
   the indicator unambiguous. The global reduced-motion `*` rule in the
   same file already drops the duration to ~0.

---

### Phase 3 — Reading & content depth

For people who actually stay and read the academic content.

1. **Article-section scroll-spy** on long publication detail pages. Same
   scroll-spy pattern as `CVTableOfContents` but for the publication
   abstract → details → related sections. Could live as a thin sidebar TOC on
   `>1024px` viewports, hidden on mobile.
2. **Footnote / citation hover preview**. Many publication pages have inline
   references. A small popover (`@floating-ui/dom` if you want to invest, or
   pure CSS `:hover` tooltip if not) showing the cited work title without
   leaving the page.
3. **Estimated reading time** in `PageHeader` for detail pages, computed from
   the abstract / content word count.
4. **Section dividers with scroll-driven reveal**. The `glass-section-panel`
   blocks already use `scroll-reveal` — consider adding a thin animated
   separator between major sections that draws itself as it enters the
   viewport (`width: 0 → 100%` on a `::before`).
5. **Copy-citation feedback**. The "Export BibTeX" button currently downloads
   a file; add a "Copy citation" button next to it with a checkmark + "Copied!"
   microstate (200ms fade-in/out).

---

### Phase 4 — Filter & list ergonomics

The list pages are the most-interacted parts of the site. Worth investing
here.

1. ~~**Active-filter chip row above the list**.~~ **Landed.** New
   `ActiveFiltersBar` (`src/lib/components/organisms/ActiveFiltersBar.svelte`)
   reads any `UniversalFilterConfig`, flattens the active filters across all
   sections (including `yearRange`), and renders one removable chip per active
   value above the list. Each chip is a warm primary-tinted pill (8% terracotta
   on light / 14% on dark) with the section name as quiet eyebrow text and the
   value in semibold; clicking the chip calls the section's `toggleItem` /
   `resetRange`. A `Clear all` text-link sits at the end of the row. Wired into
   `/publications` and `/conference-activity`. The `transition:fade` wrapper
   was intentionally omitted on the bar container — Svelte 5's outgoing
   transition kept the bar visible after the last chip was removed (DOM stayed
   at `inert` + `opacity:0` indefinitely); chip-level `in:fade` covers the
   "appearing" feel.
2. ~~**Filter count badges with animated transitions**.~~ **Landed.** New
   `TweenedCount` atom (`src/lib/components/atoms/TweenedCount.svelte`)
   eases between integer values whenever its `value` prop changes (350 ms,
   `cubicOut`, tabular-nums). Wired into the "Showing N …" status line on
   `/publications`, `/conference-activity`, and `/activities`. Respects
   `prefers-reduced-motion` via the existing `motionDuration()` helper.
   Implementation note: `svelte/motion`'s `Tween` and `tweened` both refused
   to advance their `current` value when retargeted from a store-derived
   prop in this codebase, so the component drives its own `requestAnimationFrame`
   loop with a `setTimeout` safety net for environments where rAF is
   throttled (background tabs, headless test runners). Watch for similar
   reactivity gotchas if `svelte/motion` is reused elsewhere.
3. **Skeleton loaders during initial filter computation**. For pages with
   `.filter()` over hundreds of items, the first paint can have a tiny
   stutter. A 1-frame skeleton wrapped in `transition:fade` would mask it.
4. **Empty-state illustration animation**. The `FilteredListDisplay` empty
   state is currently text-only. A simple SVG line-drawing animation on
   `stroke-dasharray` would be friendly without being childish.
5. **Filter sidebar collapse / expand on desktop**. Once a user has set their
   filters, give them a way to fold the sidebar and reclaim horizontal space.
   `transition:slide` on the sidebar, the grid template adjusts, the list
   reflows with `animate:flip`.

---

### Phase 5 — Visualization motion

ECharts, D3, MapLibre, jsPDF deserve their own motion language.

1. **`CareerTimeline`**: extend the existing `fade` / `fly` transitions to the
   timeline's axis labels and gridlines. D3 transitions integrate cleanly
   here.
2. **Map `flyTo` on click**: when clicking a fieldwork marker,
   `map.flyTo(coords, { duration: 1200, essential: true })` is far more
   spatial-meaningful than a snap-pan.
3. **ECharts entrance animations**: ECharts has built-in `animation: true` and
   `animationDuration` options. Confirm they're enabled and tuned (default
   1000ms is too slow; 500–600ms is right).
4. **Chart-to-data-table fade swap**: many viz components have a "show data"
   toggle. Cross-fade between chart and table instead of unmount / mount.
5. **Map cluster expansion**: if you cluster markers, MapLibre supports
   `cluster_expansion_zoom` for animated zoom-to-cluster. Pure UX win.

---

### Phase 6 — Larger architectural moves

Real investments. Only do them if motion becomes a deliberate design pillar.

1. **View Transitions API integration**. Chrome / Edge support is solid;
   SvelteKit has a stable pattern via `onNavigate`. This would replace the
   current cross-fade with same-element morphs (e.g., a publication card on
   `/publications` morphing into the hero image on `/publications/[id]`).
   Highest visual impact, highest care needed — easy to do badly.
2. **Shared element transitions** specifically for `HeroImageDisplay`. Even
   without the View Transitions API, you can fake it with FLIP techniques:
   measure the `ItemCard` image position on click, fly it to the detail page
   hero position. Real work, real reward.
3. **Layered motion design tokens**. Right now you have
   `--duration-fast / normal / slow`. Consider adding semantic layers like
   `--motion-snap` (75ms, micro-interactions), `--motion-feedback` (200ms,
   hover / click), `--motion-transition` (350ms, route / list),
   `--motion-emphasis` (500ms, hero entrances). Then refactor existing
   components to use the semantic tokens. Pays dividends every future motion
   change.
4. **Motion preset library** in `$lib/animations/` exporting reusable Svelte
   transitions: `pageTransition`, `listItemTransition`, `dropdownTransition`,
   `modalTransition`. Removes copy-paste of duration / easing constants.
5. **A "motion intensity" user preference** in `globalState.svelte.ts` — three
   levels (`reduced`, `default`, `expressive`). Wire it into the JS-driven
   transitions. Power users who like or dislike motion get a meaningful
   control beyond the binary OS setting.

---

### Phase 7 — Accessibility & performance hardening

Should be ongoing, not a phase, but bundled here for completeness.

- **Auto-pause animations when tab is hidden**. Use the Page Visibility API to
  pause any expensive animations (currently you have none, but if Phase 6
  lands, this matters).
- **Profile flip on mobile**. Test the `/publications` filter UX on a real
  low-end Android. If you see jank, lower `FLIP_DURATION` to 250ms
  specifically for `--md-down`, or disable flip entirely on mobile via a
  duration override.
- **`content-visibility: auto` on long lists**. Already a perf win for long
  lists; pairs especially well with scroll-driven animations because off-screen
  items don't paint.
- **Audit `will-change`**. The current PR adds it to `.site-header`. Long-term, prefer toggling it on / off via JS
  (`onmouseenter` / `onmouseleave`) rather than leaving it permanent — leaving
  it on creates GPU layers indefinitely.
- **Test with throttled CPU**. Chrome DevTools → Performance → CPU 6× slowdown.
  Run filter sequences and watch for dropped frames.

---

### What to deliberately _not_ do

These are tempting but would damage the academic tone:

- **No page-curl, ripple, or "fancy hover" libraries** (Vanta.js, tsParticles,
  etc.). The site is for serious readers.
- **No mouse-tracking gradients on cards**. Trendy in 2024 SaaS sites, totally
  wrong for scholarly content.
- **No magnetic buttons or 3D card tilt**. Same reasoning.
- **No character-by-character text reveals** outside of maybe the home page
  hero (and even there, sparingly).
- **No autoplay video backgrounds** under headers.
- **No `easeInOutBack` or `easeOutBounce` outside micro-interactions ≤150ms**.
  Stick to `cubicOut` / `--ease-out` / `--ease-smooth` for anything ≥200ms.
- **No transitions on `width`, `height`, `top`, `left`**. Always `transform` /
  `opacity`. The current code already follows this — keep it that way.
- **No animation triggered on every render**. If a transition fires when
  filter state changes but the items themselves don't change, it's noise.

---

### Decision framework

When considering any future motion addition, ask in order:

1. **Does it survive the "academic credibility" test?** Imagine a senior
   scholar visiting for the first time. Does it inform or distract them?
2. **Does it survive `prefers-reduced-motion`?** If the answer is "the user
   loses functionality," redesign it.
3. **Does it cost more than 1ms of main-thread work per frame on mobile?** If
   yes, push to GPU or drop it.
4. **Does it duplicate an existing CSS class?** If yes, use the class. The
   motion token system in `animations.css` is the source of truth.
5. **Would removing it after 30 days actually be missed?** If you'd quietly
   delete it, don't add it.

---

### Suggested ordering for a focused quarter

1. **Week 1**: Phase 0 (validation) + Phase 1 items 1–3 (low-risk follow-ups).
2. **Week 2**: Phase 4 items 1–2 (active filter chips + tweened counts) —
   biggest visible win on the most-used pages.
3. **Week 3**: Phase 2 item 1 (mobile menu transition) + Phase 6 item 3
   (semantic motion tokens refactor).
4. **Week 4**: Phase 5 items 1–3 (viz motion polish).
5. **Reserve**: Phase 6 items 1–2 (View Transitions / shared element) when
   you're ready to make motion a real design statement.

Phase 4 items 1 and 2 are both landed (active-filter chip row +
tweened count display). The next-highest leverage open piece on the list
pages is Phase 4 item 5 (collapsible sidebar on desktop) or Phase 6 item 1
(View Transitions API for card → detail morph).

---

## Design Evolution — Warm Editorial Direction

Multi-session refactor that migrated the site from a teal/amber + cool-gray
glassmorphism aesthetic to a warm editorial direction — first via a
terracotta primary (the era most entries below narrate), since superseded by
the current **deep ink-blue primary on warm paper / cool slate** palette
described in [`.impeccable.md`](./.impeccable.md). Where entries below say
"terracotta", read them as historical; the tokens now resolve to ink-blue.
Driven by the Impeccable skill brief in [`.impeccable.md`](./.impeccable.md);
design principles are captured there and mirrored in [`CLAUDE.md`](./CLAUDE.md).
**June 2026 expert review + Phase A implementation:** see
[`DESIGN-REVIEW-2026-06.md`](./DESIGN-REVIEW-2026-06.md) (warm paper ground,
de-boxed page headers/intros/breadcrumbs, colophon footer, masthead display
face, selection/text-wrap finishing, token hygiene).

### Landed

**Foundations**

- Typography: `IBM Plex Sans` + `Source Serif 4` → **Commissioner** (humanist
  variable sans, UI/body) + **Spectral** (editorial serif, headings +
  long-form prose). Full Spectral italic range (wght 300–700) loaded so
  heading `<em>` renders with real glyphs. `em`/`i`/`cite` globally route to
  Spectral italic because Commissioner has no italic axis.
- Colour: new **warm-tinted neutral scale** (paper → warm ink via warm-brown
  tint) and a **terracotta primary** (`--sys-color-terracotta-*`). Teal is
  preserved but demoted to data-viz-only (timeline categories). Amber kept
  as a warm gold secondary. Both light and dark themes rewritten for warmth
  (warm dusk dark, not corporate dark-blue).
- Design tokens: new tokens live in `src/styles/base/variables.css`. PDF
  palette (`src/lib/utils/pdfDesignTokens.ts`) and chart fallback palette
  (`src/lib/utils/chartColorUtils.ts`) updated to match. `CSS-README.md`
  updated to document the new direction.

**Visual scrub**

- Glassmorphism quieted: `.glass-card`, `.glass-panel`, `.glass-panel-light`,
  `.card`, `.card-accent-border` migrated from `backdrop-filter` blur to
  solid elevated paper tiles with a hairline border and a single-layer
  shadow. Legitimate glass retained for `.glass-nav` (sticky header),
  `.glass-button`, `MobileMenu` overlay, dropdowns, popovers (Sorter,
  ChartToolbar, MediaPlayer modal, PWAUpdatePrompt, iframe toolbar).
- Banned `border-left` accent stripes swept: `.abstract`, activity items,
  lecture items, `PageIntro` `--emphasized` / `--featured`, Reviews excerpt,
  digital-humanities review quote, global `blockquote`, ContentBody lead
  paragraph gradient border-image. Each got a context-appropriate rewrite
  (editorial indent, hairline bottom rule, leading quote glyph, warm
  callout).
- Motion overshoot removed: `--ease-bounce` and `--ease-spring` remapped to
  exponential-out curves (`--ease-out-quart` / `--ease-out-quint`). Token
  names kept for API stability.
- Link underlines: simplified from `primary→highlight` gradient to a solid
  terracotta 1 px line in both prose (`typography.css`) and nav (`NavLink`).

**Component rewrites**

- `ProfileBanner`: rebuilt editorial — serif H1 (the full name with "Ph.D."
  via `author.fullName`), quiet subtitle, understated round icon buttons,
  no gradient aura, no decorative accent bar.
- `ContentBody`: default `glassEffect` flipped from `'glass-card'` to
  `'none'` so prose sits directly on warm paper across home / activity
  detail / CV timeline / research / digital humanities detail pages. List
  items that ARE distinct entities (guest-lectures, related-items, PDF CTA
  boxes) keep their card treatment.
- `Footer`: removed the two floating/rotating `decoration-circle` elements,
  the pulsing `decoration-line`, the shimmer-animated 4-stop top border,
  the `.title-accent` gradient bar beside group titles, and the
  `.link-hover-effect` sliding shimmer on footer links. Single warm-dark
  surface with a hairline top rule; copyright now uses `author.fullName`.
- `Header`: 3-stop `primary→highlight` gradient replaced with a single
  warm `--color-surface-elevated` background at `--header-bg-opacity`,
  chrome blur retained. Dark mode uses `--color-surface-alt`.
- `DropdownMenu`: warm popover surface, removed `::before` sliding shimmer
  on items, removed `scale(1.02)` on hover (kept `translateX`), removed
  inset top/bottom glass-bezel highlights.
- `MobileMenu`: warm overlay, removed per-item `backdrop-filter` stacking,
  removed `::before` shimmers on both `.mobile-nav-link` and
  `.mobile-dropdown-link`, rewrote dark-mode block to use warm surface
  tokens instead of white color-mixes.
- `ThemeToggle`: switched from 10 % white-tinted glass tile to a 5 %
  primary-tinted paper chip; removed all inset white highlight shadows,
  simplified the `themeChangePulse` keyframe to a single shadow layer.
- `ReferencePreviewCard`: content popover is now a warm paper tile with a
  primary-tinted shadow; arrow simplified to match. `--ease-bounce`
  transitions swapped to `--ease-out`.
- `PageIntro`, `ProjectImageBanner`, `Breadcrumb`, `RangeSlider`,
  `NetworkStatusIndicator`: all migrated off decorative `backdrop-filter`
  to warm tinted surfaces.
- `LatestActivities` / `.panel`: panel padding bumped to
  `var(--space-2xl) var(--space-xl)` (48 px vertical / 32 px horizontal).
  `.card-accent-border` padding bumped from `var(--space-md)` to
  `var(--space-lg)` (24 px). `.activity-item` in `activity-list.css` no
  longer sets padding/border (those live on `.card-accent-border` when an
  activity item is a card).
- Filter sidebar accent migration: `.filter-chip`, `.dropdown-trigger`,
  `.filter-dropdown-item`, `.range-display`, and the year-range slider
  handle/track all migrated from `--color-accent` (amber) to
  `--color-primary` (terracotta) for active and hover states. Active
  state convention now matches `ActiveFiltersBar` and `NavLink` — every
  "this is the applied filter" UI in the page reads in the same
  terracotta primary instead of half terracotta / half amber. Hover
  treatment also restrained: chips no longer flash a coloured fill on
  hover, only the border picks up a hint of primary, so the brand colour
  earns its place by being used solely on selected state. Dark-mode
  active chips use `--color-text-inverted` for text (warm bark on
  terracotta-400), giving stronger contrast than the old white-on-amber.
  Files: `src/styles/components/filters.css`,
  `src/lib/components/molecules/filters/FilterSectionDropdown.svelte`,
  `src/lib/components/molecules/filters/FilterSectionRangeSlider.svelte`.
- Footer warm-paper sweep: the three white-tinted backgrounds in
  `Footer.svelte` (`.footer-branding`, `.footer-link-group`,
  `.footer-link`) migrated from `color-mix(var(--color-white), …)` to
  `color-mix(var(--color-footer-text), …)`. Footer-text is the warm
  paper foreground (`#f4efe7`), so the inset highlight now reads as
  warm-paper-on-bark instead of white-on-bark. No visual difference in
  saturation, but the cool sheen against the warm-bark footer surface
  is gone.
- Button polish pass: `.btn-primary` rewritten — gradient (terracotta
  → mix(terracotta, amber)) replaced with solid `var(--color-primary)`,
  white inset highlight removed, glossy `.btn::before` overlay (and its
  dead `html.dark` companion) deleted. The button now reads as solid ink
  on paper, not a Material/SaaS glassy pill. Hover swaps to
  `--color-primary-dark` straight, no gradient. Colored shadow
  (`--shadow-primary` / `--shadow-primary-lg`) ties the button to the
  warm palette without leaning on gloss. Text colour switched from
  `--color-white` to `--color-text-inverted` on every primary fill
  (`btn-primary`, `btn-outline-primary:hover`, glass-button primary
  variants in light + dark) so dark-mode terracotta-400 fills get warm
  bark text (~7:1 AAA) instead of white-on-light-terracotta (~3:1
  borderline). Dark-mode non-glass button variants (`btn-secondary`,
  `btn-outline-secondary`, `btn-ghost:hover`) migrated their white
  hover/background tints to `var(--color-text)`-tinted (warm paper on
  dark surface), matching the Footer treatment. Files:
  `src/styles/components/buttons.css`,
  `src/styles/utilities/glassmorphism.css`. Glass-button base remains
  white-tinted because it's chrome over arbitrary backgrounds (Hero
  image overlays, iframe toolbars, MediaPlayer) — that's legitimate
  per the brief.
- Heading hierarchy & decorative-bar sweep: across the CV, panels, and
  long-form publication detail pages, every `h2/h3/.section-title` had
  picked up the same templated CMS pattern — solid Spectral title plus a
  short coloured `::after` bar (gold→amber gradient or amber→border
  fade) that animated wider on hover. With 14+ section headings on the
  CV alone, the bar over-applied the brand colour and read as
  AI-CMS-templated rather than letterpress. Replaced the pseudo bars
  with a single hairline `border-bottom` in `--color-border-light` on
  each title; titles now in solid `--color-text-emphasis`. The CV page
  H3s lost their terracotta colour too (saving the accent for the year
  pinpoints inside entries and the `<h2>` person name). The CV header's
  H1 underline went from a 2 px primary rule to a hairline neutral one
  so the terracotta name below earns the page's lone accent. Activities
  page title border thinned from medium → thin. Guest-lectures level
  badge stripped of its 135° amber→highlight gradient (now solid 10 %
  amber tint with a single accent border). Files:
  `src/routes/cv/+page.svelte`,
  `src/lib/components/cv/CVHeader.svelte`,
  `src/routes/activities/+page.svelte`,
  `src/routes/teaching/guest-lectures/+page.svelte`,
  `src/routes/publications/[id]/+page.svelte`,
  `src/lib/components/molecules/AbstractSection.svelte`,
  `src/lib/components/publications/Reviews.svelte`,
  `src/lib/components/publications/CitedBy.svelte`,
  `src/lib/components/publications/PublicationWordCloud.svelte`.
- Panel system depatterning: `src/styles/components/panels.css` carried
  three-stop coloured-gradient backgrounds on `.panel`,
  `.panel-activities`, and `.panel-items` (plus parallel dark-mode
  rules), layered over `.glass-panel`'s already-warm-paper surface, plus
  a 40 px → 60 px-on-hover gold→amber `.panel-title::after` accent bar.
  Three different panel types each shouting in a different hue dilutes
  "warm neutrals, rare accents" the brief calls for. Variants now share
  the warm-paper surface from `.glass-panel`; differentiation comes
  from titles and content. The `::after` bar was retired,
  `.panel-title` recoloured from `--color-primary` to
  `--color-text-emphasis`, and `.panel-header`/`.panel-footer`/
  `.view-all-container` rules switched from `primary 10 %`-tinted to
  `--color-border-light`.
- Editorial featured-lead variant: the first item in
  `FeaturedPublications` now opts into an `editorial` prop on
  `PublicationItem` that strips the card chrome (background, border,
  shadow, lift-on-hover) and renders the publication as content-on-paper
  with Spectral display typography — title at `--font-size-3xl`,
  abstract in serif at `--font-size-lg` capped at 65ch, image enlarged to
  16 rem and pulled to the right column at `--md` and up. Mobile keeps
  the standard card stack so vertical heaviness doesn't compound on
  narrow viewports. The lead is separated from the rest of the featured
  block by a hairline `border-bottom` rule. This is the brief's "break
  the grid intentionally for emphasis (single large figures)" applied
  to the publications list — a deliberate asymmetric break in the
  uniform card rhythm. Files:
  `src/lib/components/publications/PublicationItem.svelte`,
  `src/lib/components/publications/FeaturedPublications.svelte`,
  `src/styles/components/entity-cards.css`.
- Editorial lead extended to `/conference-activity`: `CommunicationItem`
  inherits the same `entity-card` class structure as `PublicationItem`,
  so the existing `.entity-card--editorial` rules in `entity-cards.css`
  apply without modification. Added an `editorial?: boolean` prop to
  `CommunicationItem` and wired `UpcomingCommunications` to pass
  `editorial={index === 0}`. The first upcoming talk/event now reads as
  a content-on-paper editorial lead (transparent card, Spectral 30 px
  display title, uppercase eyebrow meta, hairline `border-bottom`
  separator) while the rest of the upcoming block stays as standard
  warm-paper cards. The main "All Conference Activities" list below is
  untouched — only the curated upcoming block gets the lead-story
  break. Mirrors the publications-list precedent so the same brief
  principle ("asymmetry over centre alignment", "single large figures")
  reads consistently across both list pages. Files:
  `src/lib/components/communications/CommunicationItem.svelte`,
  `src/lib/components/communications/UpcomingCommunications.svelte`.
- Audit cleanup — chrome consistency sweep: a fresh
  `design-philosophy-auditor` run after the buttons / headings / panels
  passes surfaced one ~~MEDIUM~~ HIGH-visibility regression and a long
  tail of stragglers. All landed in a single sweep:
  - **`PageHeader`** (every detail-page H1): retired the radial-gradient
    background mixing primary + accent tints, the 60 px gold→amber
    `.title-accent` decorative bar, and the terracotta H1 colour. The
    detail-page header now reads as a warm-paper tile with a hairline
    border, single-layer shadow, and a Spectral semibold ink-on-paper
    title — letting the type-badge / back-link carry the rare
    terracotta accents instead of duplicating the brand colour on every
    page heading. Dark mode dropped its parallel radial gradient too.
    Files: `src/lib/components/common/PageHeader.svelte`.
  - **`Card`** (used by `/teaching`, `/research`,
    `/digital-humanities`, `FeaturedDHProjects`, `ActivityItem`): same
    pattern of dark-mode `linear-gradient(primary 8%, accent 4%)`
    background that the panel system retired. Migrated to a solid
    `--color-surface` warm-dusk tile with a primary-tinted hover
    shadow. Card title colour also moved from `--color-primary` to
    `--color-text-emphasis`. Added a `card--editorial` variant
    mirroring `.entity-card--editorial` (transparent chrome, Spectral
    display title, serif description capped at 65 ch, uppercase
    eyebrow meta, hairline `border-bottom` separator). Files:
    `src/lib/components/common/Card.svelte`.
  - **`FeaturedDHProjects`**: opts the first card into
    `editorial={index === 0 && processedProjects.length > 1}` so
    /digital-humanities and /research/dh-ai-african-studies now show
    the lead project as a content-on-paper editorial figure when there
    are peers below; singletons keep the standard card chrome. Files:
    `src/lib/components/digital-humanities/FeaturedDHProjects.svelte`.
  - **`RangeSlider`**: track highlight, drag handle, value-tooltip
    pill, and arrow indicator all migrated from
    `--gradient-accent-highlight` (amber→gold) to solid
    `--color-primary`. Handle border switched from `--color-white` to
    `--color-surface` so it reads as paper-on-terracotta. Hover/focus
    glow ring tinted from `--color-accent` to `--color-primary`. Dark
    mode track + pip backgrounds rewritten from `--color-white` mixes
    to `--color-text` mixes (warm-on-warm-dusk instead of cool sheen).
    Closes the slider migration the earlier filter-chip pass had only
    partially done. Files:
    `src/lib/components/atoms/RangeSlider.svelte`.
  - **Activities `[id]/+page.svelte` `.pdf-section`**: the same
    three-stop primary→highlight→accent gradient retired from
    `panels.css` was still active here (plus its hover and dark-mode
    parallels). Replaced with a single warm `--color-surface` tile,
    hairline `--color-border-light` border, and shadow lift on hover.
    Files: `src/routes/activities/[id]/+page.svelte`.
  - **`color: var(--color-white)` on `--color-primary` fills**: every
    remaining instance migrated to `--color-text-inverted` for AAA
    contrast on dark-mode terracotta-400 backgrounds — `ChartToolbar`
    button hover/active, `EChartsNetworkGraph` zoom-button hover,
    `CVPublications` DOI-badge fallback, `IframeRenderer` `.iframe-header`,
    `Footer` scroll-to-top button + its focus outline,
    `.active-count` badge in `filters.css` (which was still amber).
    Files: `src/lib/components/visualisations/ChartToolbar.svelte`,
    `src/lib/components/visualisations/EChartsNetworkGraph.svelte`,
    `src/lib/components/cv/CVPublications.svelte`,
    `src/lib/components/molecules/IframeRenderer.svelte`,
    `src/lib/components/common/Footer.svelte`,
    `src/styles/components/filters.css`.
  - **`color: var(--color-background)` on `--color-primary` active
    states**: same AAA-contrast issue on the activities page. Active
    filter-tag, year-tag hover/active in `activities/year/[year]`, and
    `.filter-button.active` in `panels.css` all migrated to
    `--color-text-inverted`. Files: `src/styles/components/activity-list.css`,
    `src/routes/activities/year/[year]/+page.svelte`,
    `src/styles/components/panels.css`.
  - **`ProjectYears` badge variant**: the
    `linear-gradient(135deg, --color-primary, --color-primary-light)`
    two-stop gradient on the pill background flattened to solid
    `--color-primary`. Same single-accent treatment as `.btn-primary`
    and the active filter chip. Files:
    `src/lib/components/common/ProjectYears.svelte`.
  - **DH detail `.award-section .section-title`**: was the only
    surviving `section-title { color: var(--color-accent); }` rule
    (gold heading inside the awards block). Migrated to
    `--color-text-emphasis` to match every other heading sweep. Files:
    `src/routes/digital-humanities/[id]/+page.svelte`.
  - **`RelevantItemCard` underline animation**: the
    `width: 0 → 100%` `::before` underline on the panel link was
    bound to `--color-accent` (amber) with a `--color-highlight`
    (gold) text colour on hover — the only remaining amber/gold
    "active" affordance after the chip migration. Both ported to
    `--color-primary` so panel-link affordances match nav-link
    affordances. Files:
    `src/lib/components/panels/RelevantItemCard.svelte`.
  - **Publications detail `:global(html.dark) .toc-item`**: lone
    cool-grey dark-mode rule binding the bottom border to
    `color-mix(--color-white, …)`. Migrated to
    `--color-border-light` so the warm-bark surface stops carrying
    cool sheens between TOC rows. Files:
    `src/routes/publications/[id]/+page.svelte`.
  - **`AudioVisualization`** dark-mode rules: the `.audio-description`
    paragraph and link were both bound to `--color-white` (with
    `--color-accent` link hover). Migrated to `--color-text-emphasis`
    body text and `--color-primary-light` link hover so the dark-mode
    audio embed stops reading as cool-white-on-warm. Files:
    `src/lib/components/media/AudioVisualization.svelte`.
  - **`accents.css` deleted**: the entire utility file
    (`.accent-line`, `.accent-dot`, `.section-divider`, `.title-underline`,
    `.border-accent-left`, `.border-accent-top`, `.text-gradient`,
    `.bg-accent-tint`, `.bg-warm-surface`) was a 213-line catalogue
    of brief violations — three-stop primary→accent→highlight
    gradients on every utility, a banned `border-left` accent stripe
    helper, a banned gradient-text helper. All but `section-divider`
    were unconsumed; the one `section-divider` consumer
    (`/publications/visualisations`) had its own scoped local
    redefinition that didn't depend on the global utility. Removed
    from `app.css`'s import chain. Files: `src/styles/utilities/accents.css`
    (deleted), `src/app.css`.
- PDF CV alignment: the CV's PDF generator (`PdfGenerator.svelte`)
  inherited the old on-screen aesthetic — terracotta-coloured uppercase
  section heads followed by a 20 mm thick amber + 25 mm thin border-fade
  two-tone "gradient accent line", a 50 mm centred amber bar under the
  header block, terracotta-italic subsection titles, and amber-coloured
  contact link values. Each followed the templated pattern that the
  on-screen CV had just shed. Section headings now use a new
  `COLORS.TEXT_EMPHASIS` token (warm neutral 900) followed by a single
  full-content-width hairline rule in `COLORS.BORDER`; the header
  divider matches the same hairline; H4 subsections render in
  `TEXT_EMPHASIS` italic; clickable contact link values switched from
  `ACCENT` to `PRIMARY` so the printed CV matches `#cv-content a` on
  screen. Year columns kept `PRIMARY` because they are the rare accent
  pinpoints by design. Files: `src/lib/components/cv/PdfGenerator.svelte`,
  `src/lib/utils/pdfDesignTokens.ts`.

**List-page UX (Phase 4 of the animation roadmap)**

- `ActiveFiltersBar` (`organisms/ActiveFiltersBar.svelte`): warm primary
  pills representing the currently-applied filters, sit above the list on
  `/publications` and `/conference-activity`. Each chip shows the section
  name as quiet eyebrow + the value semibold, with a small `lucide:x` glyph
  and a `Clear all` text-link at the end of the row. Reads any
  `UniversalFilterConfig` and dispatches the section's own
  `toggleItem` / `resetRange` on click — no new filter plumbing needed.
- `TweenedCount` (`atoms/TweenedCount.svelte`): wraps `tweened` from
  `svelte/motion` to count between integers (350 ms `cubicOut`, tabular
  nums). Replaces the snap-update `Showing N publications/activities` on
  `/publications`, `/conference-activity`, `/activities`. Respects
  `prefers-reduced-motion` via `motionDuration()`.

### Deferred / still open

Not blocking — pick up when convenient:

- **Dark-mode pass on detail pages**: closed in the audit cleanup
  sweep (see "Audit cleanup — chrome consistency sweep" above). The
  remaining cool-grey / `--color-white`-tinted dark-mode rules in
  `Card`, `RangeSlider`, `AudioVisualization`, `publications/[id]
.toc-item`, and `activities/[id] .pdf-section` were all migrated to
  warm tokens. If a visual smoke walk after a future dev session
  surfaces another straggler, it's a single-file fix, not a sweep.
- **Activities list-page composition / pull-quote breakout**:
  publications, `/conference-activity`, and `/digital-humanities`
  (via `FeaturedDHProjects`) now all carry an editorial-lead variant
  on their featured/curated block (see the three landed entries
  above; the DH projects variant uses a new `card--editorial` modifier
  on the shared `Card` component, mirroring `.entity-card--editorial`).
  Still open: `/activities` has a different architecture — flat
  `Card`-based grid grouped by year, no curated "featured" subset,
  descriptions instead of abstracts — so a direct port doesn't fit.
  A separate pass could either (a) add a "most recent" lead variant
  on the first activity in the year-flat list, or (b) surface the
  long-form `description` of the topmost activity into a
  content-on-paper treatment. Also open: a "pull-quote breakout"
  pass for items with abstract content worth surfacing. Low priority —
  the lead-story break on publications, conference-activity, and DH
  projects covers the bulk of the brief's "asymmetry over centre
  alignment" requirement; further composition variations are
  delight-pass territory.
- **Remaining `color-mix(var(--color-white) ...)` audit**: Footer
  surfaces and buttons.css/glassmorphism.css button variants migrated
  in earlier passes. Other legitimate uses still stand: glass overlays
  in `glassmorphism.css` (top inset highlights on dark surfaces are
  deliberately white-ish for "light from above" effect), media controls
  and hero overlays sitting atop images, and `MediaPlayer` /
  `IframeRenderer` chrome over arbitrary backgrounds. No further sweep
  needed unless a specific overlay surfaces a clear cool-sheen issue.
- **MEDIUM audit items fully landed in this evolution** — nothing from the
  design-philosophy-auditor's MEDIUM list is still open. LOW items (stale
  "overshoot" / "springs back" comments) all resolved.

### Design-brief source of truth

Future design work should start by reading [`.impeccable.md`](./.impeccable.md)
for the audience / personality / direction framing, then this roadmap for
what's already landed. The seven design principles in `.impeccable.md`
(typography does heavy lifting, warm neutrals + rare accents, quiet the
glass, asymmetry over center, both themes equal craft, no AI tells,
peer-respecting density) are the acceptance criteria for anything new.
