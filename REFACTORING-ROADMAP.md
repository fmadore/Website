# Refactoring & Feature Roadmap

This document tracks larger refactoring opportunities and forward-looking
feature work that doesn't fit cleanly inside a single PR. It supersedes the
previous "all actionable items completed" snapshot of `REFACTORING-ROADMAP.md`
(removed in commit `fa7d0b3`).

Each section can be picked up independently — phases inside a section are
roughly ordered by polish-per-effort but are self-contained.

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
- Reading-progress bar on publication and communication detail pages
  (`ReadingProgress.svelte`), using `animation-timeline: scroll()` with a
  rAF-throttled JS fallback.
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
  and re-walk the same flows. Confirm reading progress still tracks position,
  the header still hides/shows but without the slide, and filter reordering
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
3. **`RelatedItemsList`** — when navigating between related items on a detail
   page, the list re-renders. A short `in:fade` between item sets would feel
   more cohesive. No flip needed.
4. **Featured publications carousel/grid** — if filters ever hide it, the
   disappearance is abrupt. Wrap `<FeaturedPublications>` in an `{#if shouldShowFeatured}`
   with `transition:fade={{duration: 200}}`.
5. **Sorter feedback** — when the user changes sort order, the list does its
   flip dance, but the active sort button itself doesn't acknowledge the
   click. A 100ms scale pulse mirroring the filter chip pattern would close
   the loop.
6. **Tag click in `TagCloud`** — same pulse pattern. The TagCloud is one of
   the most-clicked elements; a tactile micro-response makes it feel alive.

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
3. **Breadcrumb hover affordance**. Subtle underline expansion on each
   breadcrumb segment, matching the `NavLink` pattern. Three lines of CSS.
4. **Theme toggle micro-animation**. The sun/moon icon swap is currently
   instantaneous — a 200ms cross-fade or rotate would be charming without
   being gimmicky. Keep it under 250ms.
5. **Page anchor scroll smoothing**. `CVTableOfContents` uses
   `scrollIntoView({ behavior: 'smooth' })` — verify it respects
   `prefers-reduced-motion` (Svelte doesn't, you need to feature-detect and
   use `'auto'` instead).
6. **Keyboard focus ring transitions**. Most components have `:focus-visible`
   outlines that snap on. A 120ms `outline-color` / `box-shadow` transition
   makes keyboard navigation feel less brittle.

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
   the abstract / content word count. Static text, no animation, but it pairs
   naturally with the reading progress bar.
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

1. **Active-filter chip row above the list**. Show all currently active
   filters as removable chips (`× Tag: islam`, `× Year: 2020-2024`). Each
   removable with the same flip+fade pattern as the main list. Already 80%
   supported by the existing filter store. _Highest-value remaining list-page
   gap._
2. **Filter count badges with animated transitions**. Right now the result
   count "Showing 47 publications" snaps to new values. Use a `tweened` store
   from `svelte/motion` to count up / down (300–500ms duration). Subtle but
   feels really polished.
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
- **Audit `will-change`**. The current PR adds it to `.site-header` and
  `.reading-progress__bar`. Long-term, prefer toggling it on / off via JS
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

If you only do one more thing after the current PR: **Phase 4 item 1**
(active filter chip row). It's the single largest UX gap remaining on the
list pages, and it composes naturally with the flip pattern that just
landed.
