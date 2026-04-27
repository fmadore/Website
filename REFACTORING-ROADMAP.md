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
glassmorphism aesthetic to a warm terracotta + humanist-serif editorial
direction. Driven by the Impeccable skill brief in [`.impeccable.md`](./.impeccable.md);
design principles are captured there and mirrored in [`CLAUDE.md`](./CLAUDE.md).

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

- **Dark-mode pass on detail pages**: visually walk `/publications/[id]`,
  `/communications/[id]`, and the CV timeline in dark mode. Spot any
  token that reverted to a cool-gray assumption in a component I didn't
  touch. The automated auditor already reported "largely clean" but a human
  eye over every detail route would close the loop.
- **Publications / Communications / Activities list pages**: still use a
  vertical stack of uniform `entity-card` tiles. The brief calls for editorial
  composition breaks (featured item at the top, pull-quote breakouts,
  varied rhythm). Low priority — the uniform list is already readable and
  on-palette; this is a "delight" pass, not a correctness pass.
- **Heading hierarchy audit**: type sizes are set via a modular scale, but
  I haven't hand-checked whether section headings on dense pages (CV,
  publications list, activity index) read with the right visual weight
  against Spectral. Likely needs a pass after user eyeballs more pages.
- **Filter sidebar styling** (`UniversalFiltersSidebar`): still uses
  older glass-tinted treatments for filter sections. Not visually wrong,
  but could be simplified to match the paper surfaces elsewhere.
- **Button variants**: `.glass-button` (primary/secondary/outline variants
  in `glassmorphism.css`) is legitimate chrome glass, but the hover
  treatments have inset white highlights that clash with warm paper. A
  dedicated button polish pass is worth doing once buttons are exercised
  across the site.
- **Remaining `color-mix(var(--color-white) ...)` audit**: several places
  still use `var(--color-white)` as a base for semi-transparent overlays.
  In warm palette these read as slightly-cool. Worth a sweep to migrate
  toward `var(--color-surface-elevated)` / warm surface tokens as a
  separate cleanup PR.
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
