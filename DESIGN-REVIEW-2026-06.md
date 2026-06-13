# Design Review — June 2026

Expert review of the design philosophy (`.impeccable.md`), how faithfully the
codebase applies it, and a phased roadmap. Phase A was implemented and
verified in the browser (light + dark) as part of this review; see
"Phase A — landed" below.

---

## 1. Verdict on the design philosophy

**The philosophy is genuinely good, and unusually well-specified.** Most
personal-site "design systems" are a palette and a font pair; this one has an
audience model (peer scholars who scan, not read), an emotional register
(considered, humane, rigorous), anti-references (AI-slop tells, templated
academic CMS), and seven testable principles. The ink-on-cream / slate-at-
midnight dual-theme metaphor is coherent and distinctive. The brief's
strongest feature is that it is _falsifiable_: "no tinted box where type can
do the work" is a rule you can audit against, and this review did.

Three places where the philosophy itself (not its application) deserves
attention:

1. **The Fraunces contradiction.** Principle 6 rejects the Impeccable reflex
   font list "(Inter, Plex, Fraunces, Playfair, DM Sans, etc.)", yet Fraunces
   is the site's display face for h1–h3. Two honest resolutions: (a) amend
   the brief to record Fraunces as a _knowing_ exception, chosen after
   examination rather than as a first reflex (the spirit of the ban is
   unexamined defaults), or (b) trial a less-travelled warm display serif.
   Candidates that fit "letterpress warmth, full Latin Extended for French +
   West African diacritics": **Vollkorn** (old-style, bready, designed for
   body-to-display warmth), **Alegreya** (literary, award-winning, humanist
   energy), **Petrona** or **Faustina** (quieter). My recommendation: (a).
   Fraunces is doing real work here, it harmonises with Spectral, and the
   site's distinctiveness now lives in composition and restraint more than in
   the display face. But the brief should say so explicitly, otherwise every
   future audit trips over the same contradiction.

2. **The brief is silent on data visualisation.** For a digital humanist,
   charts and maps _are_ brand surface, arguably more identity-bearing than
   buttons. The brief should state how a chart feels: paper-toned canvas
   (chart backgrounds inherit the page, never white panels in dark mode),
   ink plus amber plus teal as the categorical family, JetBrains Mono only
   for axis chrome, no neon. Today's chart palette is reasonable in
   practice; the principle just isn't written down.

3. **The brief is silent on imagery.** Book covers, fieldwork photographs and
   hero images currently receive generic card treatment (rounded corners +
   shadow). An editorial register would treat photographs like _plates_ in a
   book: subtler radius, hairline border, caption set in serif italic with a
   figure-number convention. One sentence in the brief would drive this.

## 2. Is the philosophy applied correctly?

**Mostly, and impressively.** A full-code audit (automated sweep + live
review of home, publications, CV, detail pages, footer, both themes) found
the big-ticket items already compliant: no gradient text, no accent-stripe
borders, glass confined to chrome, bounce easing retired, dark mode is a
true second design (cool slate + warm cream text, exactly as specified),
heading hierarchy is serif-led and confident.

What the audit _did_ find, in descending order of impact:

| #   | Finding                                                                                                                                                                               | Brief principle violated                                                  | Status                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------ |
| 1   | Light-mode page ground was **pure white** (`#ffffff`), while the brief promises "warm cream off-whites" and Impeccable bans pure white outright                                       | Warm paper / no pure white                                                | **Fixed (Phase A)**      |
| 2   | Every list page opened with **title-in-a-box + intro-in-a-box** (PageHeader tile + tinted PageIntro tile); detail pages stacked breadcrumb-box + header-box + image-box               | "Quiet the glass / content-on-paper", "typography does the heavy lifting" | **Fixed (Phase A)**      |
| 3   | **Footer** was nested rounded boxes with centered all-caps headings and pill links — the most templated element on the site                                                           | Asymmetry over centring; no cards-in-cards                                | **Fixed (Phase A)**      |
| 4   | Breadcrumb carried a leftover **primary→accent gradient "connection line"** bar                                                                                                       | No decorative gradients                                                   | **Fixed (Phase A)**      |
| 5   | Home masthead h1 used Spectral while every other h1 is Fraunces — the loudest typographic moment spoke in the wrong voice                                                             | Consistent display hierarchy                                              | **Fixed (Phase A)**      |
| 6   | `--card-shadow-color` still held the **retired terracotta** RGB triplet; ~11 comments described current code as "terracotta"; four dead `--gradient-*` brand-gradient tokens survived | Token hygiene / single confident primary                                  | **Fixed (Phase A)**      |
| 7   | No `::selection` styling, no `text-wrap: balance/pretty` — small editorial finishing the brief implies but didn't get                                                                 | Typography does the heavy lifting                                         | **Fixed (Phase A)**      |
| 8   | CV header block was a fully centered composition (home banner stays centered on narrow viewports only — acceptable mobile pattern)                                                    | Asymmetry over centring                                                   | **Fixed (Phase B)**      |
| 9   | `REFACTORING-ROADMAP.md` "Design Evolution" section still narrates the terracotta era as current                                                                                      | Doc accuracy                                                              | **Fixed (Phase B)**      |
| 10  | Minor: MediaPlayer spinner uses 4px left/right borders (spinner, not a callout — technically exempt); one hardcoded `blur(8px)` in an ECharts tooltip string                          | Letter of the law only                                                    | Open (Phase C, optional) |

The deeper observation: the previous design passes were _subtractive_
(remove gradients, remove glass, remove bars), which was correct, but
subtraction alone trends toward blandness. What was missing is the
_additive_ editorial layer — the standfirst, the eyebrow dateline, the
colophon — gestures that make restraint read as intent rather than absence.
Phase A added the first of these; Phase C lists the rest.

## 3. Phase A — landed (this review)

All verified live at desktop and narrow widths, light and dark, with
`npm run format && npm run lint && npm run check` green and unit tests
passing.

1. **Warm paper ground.** New `--sys-color-paper: #fcf9f3` token;
   `--color-background` now points at it. Pure white is reserved for
   elevated "sheet" tiles (`--color-surface-elevated`), which now read as
   brighter paper lifted off the desk — the correct letterpress metaphor.
   (`src/styles/base/variables.css`)

2. **Editorial page headers.** `PageHeader` is no longer a tile: the title
   sits directly on paper in the display serif, capped at 25ch, over a
   hairline rule. Type + date became a letterspaced **eyebrow dateline**
   ("BOOK · 2025") replacing the navy pill + bordered date chip; authors
   became a Spectral **byline**; the back-link became a plain ink link with
   the site-standard grow-from-left underline.
   (`src/lib/components/common/PageHeader.svelte`)

3. **Standfirst intros.** `PageIntro` dropped its primary-tinted rounded box
   and is now a magazine standfirst: Spectral at lead size, softer ink,
   65ch measure. Variants differ by scale, not by box.
   (`src/lib/components/common/PageIntro.svelte`)

4. **Plain breadcrumb.** Tile background, border, shadow and the gradient
   connector bar removed; it is a quiet orientation line above the headline.
   (`src/lib/components/molecules/Breadcrumb.svelte`)

5. **Colophon footer.** Asymmetric grid (brand column left, link columns
   right), all boxes and pill-links removed, small-caps group labels over
   hairlines, quiet ink links that brighten on hover, and a serif-italic
   type-credit line: _"Set in Fraunces, Spectral & Commissioner."_
   (`src/lib/components/common/Footer.svelte`)

6. **Masthead voice.** `ProfileBanner`'s name now uses the display face like
   every other h1. (`src/lib/components/common/ProfileBanner.svelte`)

7. **Finishing + hygiene.** `::selection` is a translucent ink wash that
   works in both themes; `text-wrap: balance` on h1–h4 (this alone fixed the
   masthead's orphaned "Ph.D." line) and `text-wrap: pretty` on prose; dead
   `--gradient-*` tokens deleted; `--card-shadow-color` re-pointed to
   ink-600; ~11 stale "terracotta" comments corrected across styles and
   components (historical references kept).

## 4. Roadmap

### Phase B — landed (same review, second pass)

After a full route walk (home, research + all five project pages,
publications + detail + visualisations, conference-activity + detail +
visualisations, activities + detail + year, digital-humanities, teaching +
guest-lectures, CV + timeline, static 404/offline), the remaining
discrepancies were fixed and verified live in both themes:

- **CV header asymmetry.** The centered title block is now an editorial
  letterhead: small-caps ink-blue "CURRICULUM VITAE" eyebrow, the name in
  Fraunces as the visual headline, date below, contact block closed with a
  hairline rule; Timeline/PDF buttons tucked top-right as document chrome.
  Heading semantics (h1 → h2 → h3) unchanged for assistive tech.
  (`CVHeader.svelte`, `cv/+page.svelte`)
- **Career Timeline intro** migrated from a plain sans paragraph to the
  shared `PageIntro` standfirst. (`cv/timeline/+page.svelte`)
- **Research project headers**: the "Project Period" badge pill below the
  title was retired; years now ride the header eyebrow as
  "RESEARCH PROJECT · 2026–2027", matching every other detail page. The
  orphaned `ProjectYears` component was deleted.
  (`ResearchProjectLayout.svelte`)
- **Roadmap doc truth pass.** `REFACTORING-ROADMAP.md` now frames the
  terracotta entries as historical and links this review.
- **Brief amendments.** `.impeccable.md` records the Fraunces exception
  (principle 6 + typography path) and gains the data-visualisation and
  imagery clauses; `CLAUDE.md` design summary synced.
- Verified clean elsewhere: research list, teaching, guest-lectures, DH
  list, activities year pages, both visualisation pages, and the static
  404/offline pages (already warm-paper + Fraunces + voice-y copy).

### Phase B″ — landed (third pass: detail-page interiors, CV interior, list rhythm)

- **`.glass-section-panel` retired.** The tri-colour gradient glass tile
  (primary→highlight→accent, backdrop blur, hover lift) that wrapped every
  publication/DH detail-page section — Abstract, details grid, table of
  contents, word cloud, actions, Reviews, Cited By, related items — is now
  a chrome-free editorial section: content directly on the page ground,
  serif titles with hairline rules carrying the hierarchy. Consumer tile
  paddings zeroed so content aligns flush with the page column.
  (`glassmorphism.css` + 8 consumer files)
- **`.glass-sub-card` quieted.** Inner entity cards (individual reviews,
  citing works) keep card chrome per the brief but as solid warm paper
  tiles, no gradient wash, no hover lift.
- **Plate treatment for imagery.** `HeroImageDisplay` figures (covers, hero
  images) lost their gradient tile wrapper; the image now carries a
  hairline frame, restrained radius, modest shadow, plain serif-italic
  caption. Dark mode uses the dark border token.
- **Button hierarchy on publication detail**: "Export BibTeX" demoted to
  the outline variant so "Access Publication" is the page's one primary
  button; the action row sits above a hairline rule instead of in a tile.
- **DH detail back-link**: centered glass `btn-primary` pill at page bottom
  replaced with a left-aligned quiet text link matching the back-link
  convention.
- **CV interior flattened.** The per-section tinted hover-reactive tiles
  inside the CV sheet (cards-in-cards) became flat sections separated by
  the Spectral h3 hairlines — a printed CV, not a widget stack.
- **List-item rhythm.** The main lists on `/publications` (42 items) and
  `/conference-activity` (74 items) now render as a typeset bibliography:
  new `row` prop on `PublicationItem`/`CommunicationItem` →
  `.entity-card--row` (no card chrome, hairline separator, serif titles,
  letterspaced eyebrow meta, marginalia-scale thumbnails). Card chrome is
  now reserved for featured/curated blocks, giving the editorial lead real
  contrast. Empty state rewritten from a gradient-tinted box to a quiet
  serif note between hairlines.
- **Main menu reviewed**: header/dropdowns/mobile overlay are legitimate
  chrome and already consistent; no changes needed.

### Phase C′ — landed (fourth pass: data-viz palette, mobile menu, code health)

- **Ink-first chart palette.** New `CHART_CATEGORICAL_COLORS` export in
  `chartColorUtils.ts` is the single editorial series palette (ink →
  gold → teal → mauve → sage → steel → bronze → warm gray → pale ink →
  aqua → pale gold → sepia). All chart defaults now draw from it:
  stacked bar (journal articles carry the brand ink; book family reads
  gold/bronze), doughnut, treemap, Gantt, bubble. Purple/pink/neon
  retired everywhere — the `--sys-color-purple/pink-*` tokens were
  deleted; `ResolvedChartColors` gained `teal/mauve/sage/slateBlue` in
  their place. Map markers remapped (conference teal, workshop mauve,
  event sage); co-presenter network ramps gold → teal → sage → ink.
  Career-timeline positions now use `--color-primary` (so they brighten
  correctly in dark mode); awards moved to bronze for separation from
  gold grants. ECharts tooltip blur tokenized to `--glass-blur-sm`.
- **Mobile menu, type-led.** The overlay's boxed link tiles and nested
  dropdown panels became a typeset table of contents: Spectral semibold
  top-level entries over hairline rules, plain indented sans sub-links.
  Verified both themes.
- **Code health (sweep findings).** `.fade-in-up` and `.stagger-1..6`
  were referenced by the CV's lazy sections but had lost their CSS
  definitions in an earlier animation refactor — now defined in
  `animations.css` (aliasing the shared `fadeSlideUp` keyframe, with
  reduced-motion handling). Dead `.glass-shimmer` (an off-brief ambient
  sweep) and `.glass-animate-fast/-slow` deleted; `glass-light/medium/
heavy/frosted` retained — the sweep confirmed they are live IframeRenderer/
  ProjectImageBanner variants. New `.editorial-section-title` utility in
  `typography.css` deduplicates the serif-over-hairline section heading
  that Reviews / CitedBy / PublicationWordCloud each declared locally.
  `CSS-README.md` synced.

### Still open (small, next session)

- **Map verification click-through**: marker recolors (teal/mauve/sage)
  are type-checked but the MapLibre canvas wasn't visually exercised —
  toggle "Show Map" on /conference-activity once after deploy.
- Optional delight gestures from Phase C (drop cap, oldstyle figures,
  margin notes) remain available when wanted.

### Phase C — distinctiveness layer (delight pass, small targeted gestures)

The site is now professionally restrained; these are the additive gestures
that make it memorable without violating the brief. Pick a few, not all:

- **Drop cap** (Fraunces, two-line) on the first paragraph of the home bio
  and of long-form detail pages. The single highest-leverage letterpress
  signal available; trivially scoped with `::first-letter`.
- **Oldstyle figures for dates.** Spectral ships `onum`; applying
  `font-variant-numeric: oldstyle-nums` to bylines, eyebrows and CV year
  columns gives the text-figure look of fine book work (keep `tabular-nums`
  in counts and data tables).
- **Folio rules between home sections.** A short centered hairline with a
  small fleuron/asterisk (✳ or ❧) instead of full-width dividers, used at
  most twice per page.
- **Margin notes at `--xl`.** The brief explicitly invites them; publication
  metadata (ISBN, publisher, series) could sit in the right margin beside
  the abstract on wide screens, like a scholarly edition.
- **404 / empty states with voice.** "This page seems to have been
  misfiled" beats a generic empty-state; one sentence each, serif.
- Optional micro-fixes carried from the audit: tokenize the ECharts tooltip
  blur; restyle the MediaPlayer spinner without thick borders.

### Decision points for the owner

1. Keep Fraunces and amend the brief (recommended), or trial Vollkorn /
   Alegreya as display?
2. Is the colophon line ("Set in Fraunces, Spectral & Commissioner.")
   welcome? It's one `<p>` in `Footer.svelte` if not.
3. Phase C scope: which two or three gestures feel most "you"?

---

_Method note: findings came from a full-repo automated sweep (gradients,
stripes, backdrop-filter, hardcoded colors, retired-palette remnants,
easing) plus a live dev-server walk of home, /publications,
/publications/[id], /cv, /activities, /conference-activity,
/communications/[id] in both themes at desktop and narrow widths._
