---
name: Ink + Signal
description: The press archive, read computationally — warm paper struck by ink, one pine accent, hierarchy drawn in rules.
colors:
  ink: '#191509'
  ink-deep: '#0e0b04'
  ink-muted: '#5c5442'
  ink-faint: '#6b634e'
  paper: '#faf7ef'
  paper-raised: '#fffdf7'
  paper-surface: '#f3eee0'
  paper-sunken: '#ece4d1'
  hairline: '#dcd4be'
  border: '#c9c0aa'
  border-strong: '#a39b86'
  pine: '#1e6a56'
  pine-deep: '#154e40'
  pine-bright: '#4fbb99'
  film-ground: '#171310'
  film-raised: '#1f1a14'
  film-sunken: '#252017'
  film-hairline: '#383126'
  film-border: '#453d2f'
  film-border-strong: '#5a5140'
  cream: '#efe7d6'
  cream-soft: '#cbc0a6'
  cream-muted: '#b3a88d'
  cream-faint: '#948a73'
  danger: '#a3341c'
  danger-bright: '#d65c41'
  success: '#5c6b3a'
  viz-pine: '#1e6a56'
  viz-slate: 'oklch(0.6 0.09 250)'
  viz-olive: 'oklch(0.5 0.08 128)'
  viz-ochre: 'oklch(0.65 0.09 72)'
  viz-mauve: 'oklch(0.49 0.08 350)'
  viz-plum: 'oklch(0.65 0.09 305)'
  viz-umber: 'oklch(0.45 0.055 30)'
typography:
  nameplate:
    fontFamily: 'Archivo, system-ui, Segoe UI, Helvetica Neue, Arial, sans-serif'
    fontSize: 'clamp(2.5rem, 1.6rem + 4.2vw, 5rem)'
    fontWeight: 850
    lineHeight: 0.9
    letterSpacing: '-0.02em'
    fontVariation: "'wdth' 123"
  display:
    fontFamily: 'Archivo, system-ui, Segoe UI, Helvetica Neue, Arial, sans-serif'
    fontSize: 'clamp(2.93rem, 2.784rem + 0.732vw, 3.296rem)'
    fontWeight: 830
    lineHeight: 1
    letterSpacing: '-0.015em'
    fontVariation: "'wdth' 116"
  headline:
    fontFamily: 'Archivo, system-ui, Segoe UI, Helvetica Neue, Arial, sans-serif'
    fontSize: 'clamp(1.875rem, 1.781rem + 0.469vw, 2.109rem)'
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: '-0.01em'
    fontVariation: "'wdth' 112"
  title:
    fontFamily: 'Newsreader, Georgia, Cambria, Times New Roman, Times, serif'
    fontSize: 'clamp(1.5rem, 1.425rem + 0.375vw, 1.6875rem)'
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'Newsreader, Georgia, Cambria, Times New Roman, Times, serif'
    fontSize: 'clamp(1.0625rem, 1.009rem + 0.268vw, 1.125rem)'
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 'normal'
  standfirst:
    fontFamily: 'Newsreader, Georgia, Cambria, Times New Roman, Times, serif'
    fontSize: 'clamp(1.225rem, 1.164rem + 0.305vw, 1.35rem)'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  label:
    fontFamily: 'Spline Sans Mono, SF Mono, Consolas, Monaco, Courier New, monospace'
    fontSize: 'clamp(0.625rem, 0.595rem + 0.15vw, 0.6944rem)'
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: '0.12em'
    fontFeature: "'tnum' 1"
  eyebrow:
    fontFamily: 'Spline Sans Mono, SF Mono, Consolas, Monaco, Courier New, monospace'
    fontSize: 'clamp(0.625rem, 0.595rem + 0.15vw, 0.6944rem)'
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: '0.16em'
rounded:
  sm: '0'
  base: '0'
  full: '9999px'
spacing:
  3xs: '2px'
  2xs: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  xl: '32px'
  2xl: '48px'
  3xl: '64px'
  4xl: '96px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.base}'
    padding: '12px 20px'
  button-primary-hover:
    backgroundColor: '{colors.ink-deep}'
    textColor: '{colors.paper}'
  button-accent:
    backgroundColor: '{colors.pine}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.base}'
    padding: '12px 20px'
  button-accent-hover:
    backgroundColor: '{colors.pine-deep}'
    textColor: '{colors.paper}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.base}'
    padding: '12px 20px'
  chip:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-muted}'
    typography: '{typography.label}'
    rounded: '{rounded.base}'
    padding: '6px 8px'
  chip-selected:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.base}'
    padding: '6px 8px'
  pager-item:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-muted}'
    typography: '{typography.label}'
    rounded: '{rounded.base}'
    padding: '6px 10px'
  pager-item-current:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.base}'
    padding: '6px 10px'
---

# Design System: Ink + Signal

## Overview

**Creative North Star: "The Press Archive, Read Computationally"**

The system comes from a collision between two real source materials: the West African press corpus this scholar studies — nameplates, section rules, typeset bibliographies, dated columns — and the computational layer he builds on top of it, all structured metadata and machine-readable records. Neither half decorates the other. The page demonstrates the method: primary sources set with editorial gravity, apparatus set in a machine voice. A visitor should feel they have opened a working archive, not landed on a personal-brand page.

The register is print, not app. Depth is drawn rather than floated: a 5px rule opens a masthead, a 3px rule opens a section, a 1px hairline separates entries, and that weight hierarchy alone should make the page navigable if every string were set at the same size. Surfaces stay close in value and corners are square, so structure has to come from ink density and rule weight instead of elevation. Motion is nearly absent — state changes are instant, and the most a page does on arrival is a short fade.

Both themes are first-class and both are warm. Daylight is warm paper struck by ink; midnight is the same printed page photographed as a microfilm negative, with grounds swapped to warm near-black, type to cream, and the pine accent brightened. It is not slate, not blue, and never an inversion filter. The browser's own surfaces take the chosen theme, not the OS: `html` narrows `color-scheme` to `light` or `dark` (never `light dark`), so scrollbars, form controls and the overscroll canvas follow the theme the reader picked; `src/app.html` ships two media-scoped `theme-color` metas for the reader with no JavaScript, and both the bootstrap and `toggleTheme` overwrite both metas with the resolved `--color-background`, so a stored choice that contradicts the OS wins in the address bar too. `static/404.html` mirrors all of it. The confirmed anti-references are specific: templated academic CMS and faculty-directory defaults; the AI-slop tells (gradients, glassmorphism, glow, `border-left` accent stripes, rounded cards with soft shadows); code-editor and terminal aesthetics, since mono here is metadata and never a page theme; and soft-launch minimalism with acres of whitespace and hero photos under overlay text.

The system renders itself: the `/style-guide` route is a living reference that reads the live token values off `:root` and re-documents itself when a token changes. Check a claim in this file against that page before trusting it, and when you add a reusable idiom, document it there in the same change — `src/styles/styleGuideCoverage.test.ts` fails the build when a class in `ink-signal.css` appears neither on `/style-guide` nor in a component that page renders. The idiom classes themselves live in `src/styles/components/ink-signal.css`.

**Key Characteristics:**

- Two typographic voices, strictly cast — document (Archivo + Newsreader) versus data (Spline Sans Mono)
- Hierarchy drawn in ink-coloured rules at four weights, never in gray
- The ledger — hanging mono key, serif content, hairline between rows — as the universal record idiom
- One accent (pine), applied by scarcity to mark only the current thing
- Square corners, zero shadows, no glass; gradients only where they encode data
- Data as the only permitted ornament: year-bars, counts, frequency-scaled term lists
- Warm grounds and warm type in both themes; the accent is the single cooler note

## Colors

Two inks on two grounds with one accent, applied by weight: ground ≫ ink ≫ accent. Nothing is pure white or pure black in either theme.

### Primary

- **Ink** (`#191509`): The dominant structural colour and the daylight reading default — body emphasis, every rule and hairline, solid fills, selected chips, the nameplate. In midnight this role is taken by **Cream** (`#efe7d6`); the structure is identical, the value inverted.
- **Deep Ink** (`#0e0b04`): Hover and pressed state on solid ink fills only. Never a text colour.
- **Muted Ink** (`#5c5442`) / **Faint Ink** (`#6b634e`): Secondary prose and quiet metadata respectively. Both clear 4.5:1 on every paper surface; faint ink is the floor, not a suggestion.

### Secondary

The single accent. There is no third colour role in the UI.

- **Pine** (`#1e6a56` daylight, `#4fbb99` midnight): A warm teal that means _current, active, newest, primary_ — active navigation, eyebrows, key numbers, link underlines, the newest year-bar, and the one hero call to action per screen. The brightened midnight cut exists because the same value would sink into the film ground.
- **Deep Pine** (`#154e40`): Hover and pressed on accent fills.

### Tertiary

- **The visualisation palette** (`viz-slate`, `viz-olive`, `viz-ochre`, `viz-mauve`, `viz-plum`, `viz-umber`, anchored by pine): Seven muted, earthy hues derived in OKLCH from the ink and pine anchors, each holding up on both grounds. The seven carry a separate midnight step in `dark.css` and were re-stepped on 2026-09-09 into an alternating lightness ladder that clears adjacent-pair CVD separation on the dataviz validator, with chroma deliberately held below that validator's floor because saturated series colour is this brief's anti-reference. **Category encoding only.** These are data colours; they never become UI chrome, backgrounds, borders, or decoration.

### Neutral

- **Warm Paper** (`#faf7ef`): The daylight page ground. **Raised Paper** (`#fffdf7`) for elevated sheet tiles, **Paper Surface** (`#f3eee0`) and **Sunken Paper** (`#ece4d1`) for muted and recessed surfaces.
- **Film Ground** (`#171310`): The midnight page ground — warm near-black, never slate. **Raised Film** (`#1f1a14`) and **Sunken Film** (`#252017`) sit deliberately close in value to it.
- **Cream** (`#efe7d6`) with **Soft** (`#cbc0a6`), **Muted** (`#b3a88d`) and **Faint** (`#948a73`) steps: the midnight type ramp, mirroring the ink ramp exactly.
- **Hairline** (`--color-hairline`, `#dcd4be` / `#383126`) / **Border** (`--color-border`, `#c9c0aa` / `#453d2f`) / **Strong Border** (`--color-border-dark`, `#a39b86` / `#5a5140`): row separators, plate edges, and outlined controls respectively — one token per job, in that order of weight. See The Hairline Pairing Rule under Layout.
- **Deep Warm Red** (`#a3341c`) and **Muted Olive** (`#5c6b3a`): errors and confirmations only. Warm-tinted so they read as ink annotations rather than web toast, and used only in form validation.

### Named Rules

**The Scarcity Rule.** Pine marks the current thing. If it appears more than a handful of times on a screen it has stopped meaning anything — demote occurrences until it is scarce again. This is a countable test, not a matter of taste.

**The Warm Ground Rule.** Grounds and type stay warm in both themes; the accent is the only cooler note in the system. Pure white, pure black, and any cool gray are outside the palette.

**The Negative Rule.** Midnight is the same page photographed as a negative, designed as its own pass. Never ship a component specified in only one theme, and never reach for an inversion filter or a slate-blue dark palette. That pass carries exactly one typographic adjustment alongside the colour remap — the Microfilm Weight Rule below. **The midnight footer is the page:** daylight's footer is an inverted ink block, and the negative of an inverted block would be a bright cream slab, which the microfilm register refuses — so in midnight the footer takes the page ground itself (`--color-footer-bg: var(--color-background)`) and the 4px cream masthead rule plus the hairlines carry the boundary. Likewise the film ramp holds three steps for four paper roles, so `--color-background-muted` and `--color-surface-elevated` share the lightest step in midnight by design; the style guide records it rather than hiding it.

## Typography

**Display Font:** Archivo (variable, with `system-ui` fallback)
**Body Font:** Newsreader (with Georgia, Cambria, Times fallbacks)
**Label/Mono Font:** Spline Sans Mono (with Newsreader, then SF Mono/Consolas, as fallbacks)

There are three families and no fourth. A `--font-family-sans` system stack was removed once measurement showed nothing needed it — form controls take `font: inherit` from the reset — while it was silently supplying the default inside chart containers and the network plate, where any mark that forgot to name its own family left the system. Newsreader sits inside the mono stack deliberately: Spline Sans Mono lacks the Yoruba underdots (`ẹ`, `ọ`) that occur in author names in the data, and a hole in the primary face should be filled by a font this site already ships rather than by Courier New. All three families carry the full French set.

**Character:** A grotesque cut for headlines against a serif designed for news text, with a mono reserved strictly for machine-indexed strings. Archivo is set wide and heavy on its width axis for a compressed-broadsheet feel; Newsreader carries the reading with its optical-size axis live and genuine italics for subtitles and captions. All three ship full Latin Extended, which is a requirement rather than a bonus — French and West African diacritics appear in titles, names, and quotations throughout.

The scale is deliberately forked. Body and UI steps follow a minor third (1.2) to keep dense reading tightly rhythmic; display steps follow a major third (1.25) so detail-page titles carry real weight at wide viewports without sprawling.

### Hierarchy

- **Nameplate** (Archivo, 850, `clamp(2.5rem, 1.6rem + 4.2vw, 5rem)`, line-height 0.9, `wdth` 123, uppercase): The home masthead wordmark. One per site.
- **Display** (Archivo, 830, `clamp(2.93rem, …, 3.296rem)`, line-height 1, `wdth` 116): `h1` — page and index hero titles.
- **Headline** (Archivo, `wdth` 112): two steps — `h2` at 780, `clamp(2.344rem, …, 2.637rem)`, line-height 1.02, the section head that follows a 3px rule; `h3` at 750, `clamp(1.875rem, …, 2.109rem)`, line-height 1.05.
- **Title** (Newsreader, 500, `clamp(1.5rem, …, 1.6875rem)`, line-height 1.35): The record title inside a ledger row, and `h4`–`h5`.
- **Body** (Newsreader, 400, `clamp(1.0625rem, …, 1.125rem)`, line-height 1.6): All prose, capped by the measure roles below.
- **Standfirst** (Newsreader italic, `clamp(1.225rem, …, 1.35rem)`, line-height 1.5): The serif-italic deck under a page title, and plate captions at the small step.
- **Label** (Spline Sans Mono, 500–700, `clamp(0.625rem, …, 0.6944rem)`, three tracking roles keyed to size — the eyebrow at 0.16em, the 2xs label default at 0.12em, and the compact caps tier at 0.06em, with 0.03em for mixed-case figures — uppercase, tabular numerals): Every machine-indexed string — eyebrows, datelines, counts, navigation, filters, chips, DOIs, pagination, ledger keys, button text. **A module label is a heading in this tier.** The one heading idiom in the data voice is `.rail-label` — an `h2` or `h3` cast mono, uppercase and letterspaced over a hairline, which opens the catalogue entry of every record rail, the contents ledger and the style guide's own sub-sections. `typography.css` casts `h6` the same way so the smallest heading level can never fall into the serif, but no page uses one; the exception is the label role, not an element, and it is deliberate rather than a violation of the Two Voices Rule.

### Named Rules

**The Measured Line Rule.** Reading measure is stated in characters, never in `ch`. A `ch` is the advance width of the digit zero; Newsreader's average character is only ~0.68–0.73 of that, so a cap written as `65ch` sets 87–95 characters — half again the intended line. Three calibrated roles own every prose cap: `--measure-prose` (50ch → ~69 characters) for body copy, ledger descriptions, abstracts and CV entries; `--measure-standfirst` (42ch → ~61) for the italic deck under a title; `--measure-note` (40ch → ~55) for captions and fine print. Never write a raw `ch` value into a component, and verify a change by counting characters in the rendered line — `/style-guide` measures all three live. Monospace is the exception: 1ch is exactly one character there, so ledger key columns may be sized in `ch` literally. Metadata that is scanned rather than read — bylines, citation and venue lines — is deliberately left uncapped. **The display-face exception.** A title is not read line after line, it is taken in at a glance, so its cap is set for the shape of the headline — how many lines it breaks into — not for the reading measure. That cap is a named role, `--measure-title` (20ch), never a bare `ch` written into a component: an Archivo `ch` is not a Newsreader `ch`, and the next page title that wants the same shape must get the same number. Consumer: `PageHeader.svelte` (`.page-title`).

**The Tracked Size Rule.** Tracking is a role scale keyed to size, not a free numeric field. The display face tightens as it grows (-0.01em at h3 and below, -0.015em at h1–h2, -0.02em at the nameplate, which is the floor); the mono data voice loosens as it shrinks (0.06em for the compact caps tier at xs–sm, 0.12em for the 2xs label default), with the eyebrow at 0.16em as the one deliberate exception and 0.03em for mixed-case figures such as DOIs, counts and years. Serif prose sets no tracking at all, and a serif title takes -0.01em. Never write a raw `em` value: reach for one of the eight `--tracking-*` roles, and let a ninth step be a documented design decision rather than a patch — `trackingScale.test.ts` fails the build otherwise.

**The Two Voices Rule.** Every string on every page belongs to exactly one voice. The document voice (Archivo, Newsreader) carries what the scholar writes; the data voice (Spline Sans Mono) carries what the machine indexes. If a string could plausibly be a database column, it is mono. No mono headlines, no serif metadata. Blurring the two is this system's only unforgivable error.

**The Tabular Figures Rule.** The data voice is monospaced, so its figures already share an advance; `font-variant-numeric: tabular-nums` is declared once, on `.data-voice`, as the stated opt-in, and on the Archivo data numbers (`.stat-value`), where it is load-bearing. It is not restated per class on the mono face.

**The Mono-Is-Not-A-Theme Rule.** The mono face is metadata, never body copy and never a page-wide treatment. A terminal or code-editor aesthetic is an anti-reference, not an adjacent style.

**The Microfilm Weight Rule.** Light type on the film ground optically bolds, and the spread costs most where the strokes are thinnest, so midnight sets the three shared weight tokens 40 lighter — `--font-weight-medium` 500 → 460, `--font-weight-semibold` 600 → 560, `--font-weight-bold` 700 → 660. That step returns the data voice at its small sizes to its daylight weight while leaving serif titles at parity; a step of 50 was tested and over-corrected, dropping the 24px title below its daylight weight. Body weight stays 400 in both themes because the served font subsets are instanced to wght 400–700 and floor there, and neither the display face's hand-set heavy weights nor the tracking scale is compensated: at those sizes the effect is negligible, and tracking is keyed to size rather than to theme. A component that needs a theme-stable weight must set a literal instead of a token, and must say why — `midnightWeight.test.ts` guards the step and the axis range.

**The Upright Heading Rule.** Inline `<em>` inside `h1`–`h3` stays upright in the display face; a Newsreader italic inside an Archivo head is a voice collision. Genuine serif italics belong in prose, standfirsts, and captions.

## Layout

The spatial model is an 8-point grid built on a 4px baseline, exposed as both a numeric scale (`space-1` … `space-48`) and a semantic one (`3xs` 2px through `4xl` 96px). Two half-steps on the numeric ladder are live by design and are not drift: `--space-2-5` (10px) is the `.ledger--tight` row padding, the most repeated interval on the CV, and `--space-1-5` (6px) is the gap under a label rule. Containers step at 640 / 768 / 1024 / 1280 / 1536px, and breakpoints are addressed exclusively through PostCSS custom media (`@media (--md)`), never hardcoded pixel queries.

**The ledger** is the standard record layout: a CSS grid of a hanging mono key column (default 7rem, tunable per instance) and a serif content column, with a 1px hairline on every row and baseline alignment between the columns. A three-column variant adds a right-aligned mono meta column (default 12rem). **The section** is the standard content module: a 3px ink rule, 12px of padding, then an Archivo head, with 48px separating one section from the next.

Density is a deliberate value. Scholars scan, and dense, well-set information reads faster than sparse pages — do not pad with whitespace where structured information would serve the reader better. Reading measure is the one place the system refuses density: prose holds ~69 characters a line however wide the column gets (see The Measured Line Rule).

### Named Rules

**The Rule Hierarchy.** Four weights: 5px opens the nameplate, 4px a masthead, 3px a section, 1px separates entries. The three heavy weights are ink-coloured (cream on midnight) and never gray; the 1px tier takes `--color-hairline` (see the pairing rule below). Reach for rule weight before size or colour when establishing hierarchy. Every ruled module puts the same `--rule-gap` (12px) between the rule and the content it opens, so hierarchy is carried by the rule's weight alone and never by the interval — vary the weight, never the gap.

**The Hairline Pairing Rule.** A rule and a box edge share a 1px width and nothing else, and they take different tokens:

- a **rule** separates, and is the lightest mark on the page: `var(--rule-hairline) solid var(--color-hairline)`
- a **box edge** encloses an object, and sits one step darker: `var(--border-width-thin) solid var(--color-border)`

Never cross the pair. The failure is silent — a separator drawn in the edge colour simply reads as a plate and flattens the ramp, with nothing to catch it — which is exactly how the ledger, the bibliography and the facet rules spent three months one step too dark while the CV and the panels drew the same role correctly. `--rule-*` inside a `border:` shorthand is the tell that a box edge has borrowed the rule tier. The one sanctioned exception is `.bib-item--lead`, which marks the featured entry with a deliberately heavier `--color-border-dark` rule. And one boundary takes one mark: where a `.meta-ledger` or a contents ledger follows a `.rail-label`, the label's hairline is the boundary and the first row gives up its own. A **one-sided** `--border-width-thin` + `--color-border` is a separator too, and takes the rule pair like any other; the exception is an edge that continues the box edge it meets — the division between two segments of a segmented control is the enclosing border carried inward, and stays in the same ink. `src/styles/hairlinePairing.test.ts` guards all four directions with a named allowlist.

**The Ledger Default Rule.** Anything dated or keyed — a publication, appointment, activity, metadata field, facet — renders as a ledger row, not a card. A card is the exception and needs a reason.

**The One Rail Rule.** The masthead, the reading column and the endpaper all take the global `.container` — the same cap ladder, the same `--space-4` gutter, no component copies. Measured inner-left edge on `/publications` (header / page / footer / colophon): 768 → 16 / 16 / 16 / 16; 1024 → 16; 1440 → 96; 1600 → 48. A page that needs a narrower measure caps itself with `max-width` and stays left-aligned in the rail; it never nests a second `.container`, which doubles the gutter and re-centres what is left. The home shell is the worked example: 58rem wide, hung on the masthead's edge.

**The Paper Rule.** Paper is the third ground, and what prints is what a reader can act on there: the wordmark as a masthead over its 4px rule, the document, and the imprint. Controls do not print — the skip link (`position: fixed`, and therefore stamped on every page), the navigation, the theme toggle, the hamburger, the mobile panel and the connection strip are all `display: none` under `@media print`. Print ink is named, not written: `--color-print-ink` (the warm system ink, theme-stable, so a page printed from midnight never comes out cream) on `--color-print-ground`; `black` and `white` never appear in a print block. The footer re-points its `--color-footer-*` tokens at the print ground rather than restating every rule, because with background graphics off — the browser default — cream on an ink slab prints as cream on white at ~1.6:1, a blank colophon. A component's print rules live with the component, in its own `<style>`: a global override sits at equal specificity to the screen rule beside it and would win or lose on bundle order. `base/typography.css` keeps only the document-level rules and an index of where the rest lives. The CV, whose printed sheet is a product, breaks at the entry (`.cv-entry { break-inside: avoid }`), never at the section.

## Elevation & Depth

**This system has no shadows.** There are no `--shadow-*` tokens to reach for, and `box-shadow` must never be added to a style. Glass does not exist either: no `backdrop-filter`, no translucent chrome. Depth is drawn instead of floated, and it comes from exactly two sources — the weight of the rule separating two regions, and the density of ink within them. Surfaces are layered (`paper` → `paper-surface` → `paper-raised`, and their film equivalents) but stay deliberately close in value, so a surface change alone never carries hierarchy; the rule above it does.

Focus is the one place a ring appears, and it is a flat accent outline (2px solid pine with a 2px offset), never a glow; the translucent `--focus-ring` token was retired on 2026-09-12 with its last consumer.

### Named Rules

**The Drawn Depth Rule.** If a design needs to separate two regions, draw a rule or change ink density. Reaching for a shadow, a glow, a blur, or a translucent panel means the hierarchy has not been solved.

## Shapes

Corners are square. Every radius token resolves to `0` — cards, chips, buttons, panels, inputs, and image plates are all sharp-cornered by design. `--border-radius-full` (9999px) survives for genuinely circular micro-controls that opt in explicitly: slider thumbs, loading spinners, status dots, and a legend swatch that mirrors a genuinely circular map or network mark. Nothing else may use it.

The recurring silhouette is the rectangle with a 1px border: the flat chip, the pager item, the image plate. **Plates** are the imagery treatment — a photograph, cover, or archival scan gets a 1px border, square corners, a muted ground behind it, and a serif-italic caption below (`Fig. 1 — …`). Scans from the press corpus are first-class imagery and are preferred to stock photography of any kind.

Borders come in three weights (1px, 2px, 4px) and take their colour from the hairline/border/strong-border ramp, which is warm rather than neutral gray.

### Named Rules

**The Square Corner Rule.** No `border-radius` on any new style, with the single documented exception of a circular micro-control opting into `--border-radius-full`.

## Components

Components are **typeset, not manufactured**: they read as set type and printer's rules — a stamped mono label inside a hairline box — never as app widgets. No lift, no ripple, no bevel, no transform on press. Transitions animate colour and border only, at 150ms.

### Buttons

- **Shape:** Square (0 radius), 1px border, inline-flex, uppercase mono text at the compact caps tracking (0.06em).
- **Primary:** Solid ink fill with paper text (`12px 20px`); on midnight the fill becomes cream with film-ground text. The standard primary action.
- **Accent:** Solid pine with paper text — the **single hero call to action per screen**, governed by the Scarcity Rule.
- **Hover / Focus:** Hover deepens the fill (ink → deep ink, pine → deep pine) with no movement whatsoever, and always restates its label colour, because the bare `a:hover` prose rule is written `a:hover:not(:where(.btn))` and must stay out of the button family. **Midnight reverses the direction a fill deepens in:** `--color-accent-dark` is itself lighter than the accent on the film ground (pine-bright mixed 25% toward the cream), so the accent fill hovers lighter under its dark label and pine hover text on the ground stays above 4.5:1. Every link and button on the site must also read at 4.5:1 in its hover state; the record's `Open publication ↗` once hovered at 1.48:1 because of the prose rule above. Focus-visible draws a 2px pine outline at a 2px offset; on a touch pointer every `.btn` is at least 44px tall.
- **Secondary / Outline / Ghost:** Secondary is a transparent control with a strong-border edge that fills with the alt surface on hover. Outline variants (`primary`, `secondary`, `accent`) invert to a solid fill on hover. Ghost carries faint-ink text and no border.
- **Sizes:** `sm` (8px 16px), default (12px 20px), `lg` (16px 28px). Icon-only variants are padded to stay square.
- **Danger:** Warm red, reserved for a destructive action; no control on the site consumes it today. Its midnight fill was re-stepped to `#d65c41` on 2026-09-09 so the skin clears 4.5:1 on the film ground — `/style-guide` § 5 renders it and prints the measurement.
- **Bare:** A zero-specificity `:where(.btn-bare)` primitive exists for controls that are semantically buttons but must not look like one (transport controls, close crosses). It carries only hit behaviour, a focus ring, and the native reset, so a consumer's own class styles it without `!important`.

### Chips

- **Style:** Transparent ground, 1px border, square, mono uppercase at 0.06em tracking, with the count appended in a heavier weight and quieter ink (`ISLAM 33`).
- **State:** Unselected hovers to a stronger border and emphasis ink. **Selected is a solid ink fill** with paper text, and its appended count drops to 72% of the inverted colour.
- **The All option prints the narrowed total.** An `All` in a facet row prints the match count with that dimension alone cleared — exactly what clicking it produces (`EntityFilterSystem.totals`) — never the corpus total and never the sum of the sibling counts: a multi-valued dimension double-counts in that sum (24 + 20 + 1 = 45 over a 44-entry corpus) and a dimension whose value can be absent under-counts. It carries `aria-pressed` and `data-count` like every other chip.
- **One active idiom for an option row.** The language and sort rows are both single-select option groups on the same baseline, and both draw the current option the same way: pine text over a 2px pine underline, with the same touch padding. A second way of saying "current" in the same bar is a defect.
- **Three states, three inks on a copy control.** The index row's `Cite` and the rail's `Copy reference` are idle in `--color-text-soft`, confirmed in pine (success is the current thing), and failed in `--color-text-emphasis` — not `--color-danger`, since a denied clipboard is not the reader's mistake (the honest-state rule). The reservation (`min-width: 8em`) is sized on `Copy failed`, the longest label, so no state reflows the row.
- **Sizing:** Vertical padding is set so the chip clears 24px in both dimensions, satisfying WCAG 2.5.8 target size.
- **`mono-action`:** The one text action beside a chip row or under a facet — "All N tags ↓", "Clear all ✕", "Clear years ✕". A reset native button rendered as accent mono text, not a chip; pine at rest because its job is always the current narrowing and the way out of it. `.facet-toggle` is the same control for the "More filters" disclosure, inked rather than pine: opening the apparatus is not a state.

### Cards / Containers

- **Corner Style:** Square (0).
- **Background:** A paper surface step; on midnight, a film step.
- **Shadow Strategy:** None — see Elevation & Depth. Separation comes from the border and the rule above.
- **Border:** 1px in the warm border ramp.
- **Note:** Cards are the exception to the Ledger Default Rule and need a reason to exist.

### Inputs / Fields

- **Style:** Square, 1px border from the warm ramp, transparent or surface ground, mono for machine-facing fields and serif for free text.
- **Focus:** A flat accent outline — never a glow, never a shadow.

### Navigation

- **Style:** Mono data voice, uppercase, letterspaced. The active item takes pine and a 2px pine rule beneath; the rest are set in `--color-text-soft`, one step quieter than body ink (6.85:1 on paper), so the current section reads as the only lit label.
- **States:** Colour change only, instantly. A hovered label answers with ink, never with a second rule beside the current one. No underline sweep, no sliding indicator, no scale; a submenu appears and disappears without reveal, stagger or nudge.
- **A record title inside chrome keeps the document voice.** Submenu entries — research projects, collections, workshops — are set in Archivo at the text tier, sentence case, on the desktop dropdown and the mobile panel alike; only the section labels above them are mono. The desktop nav shows from 1280px because the seven labels, the wordmark and the toggle first fit on one line at 1180px; below that the masthead opens a full-bleed panel that prints the whole index, expanded.
- **Externals are marked** with an `aria-hidden` `↗` and a hidden " (opens in new tab)", the same markup the footer and every record rail use. Every page opens with a skip link to `#main`.
- **The masthead retracts on scroll-down and returns on scroll-up.** A deliberate app gesture in a print system: the sticky record rail relies on the reclaimed space, and the masthead never retracts while a menu is open or focus is inside it.

### Signature components

- **The Nameplate:** Archivo at weight 850 on a `wdth` 123 cut, uppercase, line-height 0.9, sitting above a 5px ink rule. The single loudest element in the system.
- **The Ledger Row:** The universal record — hanging mono key (with an optional uppercase status stamp beneath it), a serif title and description, an optional right-aligned mono meta column, and a hairline above each row.
- **The Year-Bar Strip:** Publication distribution drawn as flush ink bars with the newest year in pine, and a mono legend beneath. Real data used as the page's ornament.
- **The Key-Terms Cloud:** A frequency-scaled serif term list where size encodes actual corpus frequency.
- **The Drop Cap:** An Archivo initial at 4.4em, weight 850, in pine, floated into an abstract or standfirst.
- **The Prose Link and the Inline Citation:** A link in running prose takes ink text and a 1px pine underline at a 3px offset, warming to pine text and 2px on hover or focus — and the idiom is opt-in by _container_ (`.prose`, `.content-body`, `.page-intro`, `.record-prose`, `.project-prose`, `.abstract`, `.apparatus-text`, `.audio-description`, `.embed-desc`, `.guide-note`), never by `p a` / `li a`, which used to put 209 of the site's 246 pine underlines on chips, plate links, breadcrumbs and ledger rows that had each written `text-decoration: none` and lost. An **inline citation** is that prose link with a softer rule — ink text, the pine underline held at 55% and set at a 0.18em offset, pine on hover — not a pine word; it carries `.no-underline` because it always sits inside a prose container and draws its own rule.
- **The Stat Ledger:** "The corpus, in numbers" — mono rows with tabular figures, the key figure in pine.
- **The Contents Ledger** (`.contents-ledger`, `.contents-link`, rendered by `ContentsLedger.svelte`): what any document long enough to need one opens with — a `§`-keyed ledger of anchors with the machine's count per section in the meta column, quiet ink at rest and pine only under the pointer. The visualisation pages and the style guide open with it.
- **The Specimen Frame** (`.specimen`, `.specimen-label`, `.specimen--flush`): frames a live demo of an idiom that is itself page chrome, so a documentation page can show a ruled section head without the reader mistaking the exhibit for the room — a plate, never a card: 1px box edge on `--color-surface`, square, no shadow, a data-voice caption as its first child closed by a hairline; the flush variant drops the inner padding so a demo's own full-width rules reach the frame's edge.
- **`.ledger-meta--figures`:** a meta cell whose content is machine text rather than a stamp — a token name, a DOI, a count with a unit — printed case-intact on the figures tracking, because a custom-property name uppercased cannot be copied.
- **The Colophon:** the footer is the record's endpaper — an inverted ink block in daylight closed by the 4px rule, a wordmark and serif-italic tagline, four mono link groups (contact, academic, social, and _the record_: RSS, sitemap, `llms.txt`, the MCP server, the style guide), an `<address>` set as text, and the signature strip of © and type credit over a hairline. No floating control of any kind.
- **The State Note** (`.state-note`): the one shape every honest state takes — a flat panel on `--color-surface` (its film step on midnight) with no border of its own, a mono `.dateline` label (`Map unavailable`, `Recording unavailable`, `Offline`) over one serif sentence that says what happened and what still works, carrying `role="status"`. It replaced the site's only two danger-coloured blocks in 3.2: `--color-danger` is for form validation, and a map that failed to load is not a destructive action. Internal error text never reaches it.
- **The Data Table** (`.chart-table`): every chart plate offers its own rows as a `<details>` under the plate, summary `Data table` in the data voice, the rows set as a `.ledger` (hanging mono key, figures in the meta column, hairline per row). The chart is the picture; the table is the apparatus. The SVG plates keep their `sr-only` tables as well, because a closed `<details>` is outside the accessibility tree.
- **The Empty Plate** (`.viz-empty`): a section with nothing to plot prints a mono label and one serif sentence at the plate's top edge, left-aligned, never a sentence centred in an empty box.
- **The Missing Plate** (`.plate--missing`): an image that fails to load keeps its box edge on `--color-surface`, prints `Image unavailable.` in the data voice, and withholds its `Fig. N` caption, because an absent figure has no number. Applied by the `plateFallback` action on every plate.

## Voice & Copy

Interface copy is set in the archive's own register: **academic, precise, British English** (visualisation, catalogue, organisation, honours), understated, never promotional. The reader is a peer scanning for a record, so every string states a fact, names an action, or names a state — and says it once. Established in the 3.1 `clarify` pass (2026-09-10); the glossary below is binding for every string a reader sees.

### Named Rules

**The Sentence-Case Rule.** Navigation items and breadcrumbs are section names and keep Title Case (`Talks & Events`, `Digital Humanities`, `All Publications`). Everything else — headings, labels, buttons, empty states, captions — is sentence case with proper nouns intact (`Cited by`, `Key terms`, `More in this project`, `Talks & events`). The CV's own section headings are the one document-level exception: they are the owner's document and the PDF prints them.

**The Reader's Noun Rule.** The code's nouns never reach the reader. `communication` is always `talk` / `talks & events`; a chart's `node` is always the entity it stands for (keywords, tags, co-presenters, institutions); a `choropleth` is `country shading`; a `decal` is a `pattern fill`. On the talks visualisation page the counted noun is `talks`; `Activities` belongs to the separate `/activities` log.

**The Count Rule.** Every count readout uses one noun, `entry` / `entries`, singular-guarded (`Showing 1–12 of 44 entries`, `3 of 34 entries`, `1 filter active · 1 of 79 entries`), and an empty result still states the corpus (`The index holds 44 entries, 2013–2026.`). Chart summaries and tooltips take their noun from a prop, so the same component says `publications` on one page and `talks` on the other.

**The Verb Pair.** `Open …` leads to an external destination (a new tab); `View …` leads to an internal page. `Explore`, `Visit`, `Access`, `Discover` and `Read` do not label links. Citation controls are `Cite` → `Copied` → `Copy failed` in the index row and `Copy reference` → `Reference copied` → `Copy failed. Select the text above.` in the record rail, under a heading `Cite`. Files are `Download BibTeX` and `Download PDF`; a failed download says `Download failed. Try again.`

**The Clearing Rule.** `Clear all` clears the whole filter state; `Clear years` resets the range alone; `Clear search` empties the search box. The panel of additional facets and the button that opens it are both named `More filters`. Exactly one clear control exists in any empty state.

**The Glyph Rule.** `↗ → ← ↓ ▾ ▴ ✕ ✓ ×` are decoration and sit inside `aria-hidden` spans; an accessible name never contains one. A visible label begins its accessible name (WCAG 2.5.3): `Open deck: {title} (opens in new tab)`, `Link to {title}`, `Previous record`. Every `target="_blank"` link carries one visually hidden ` (opens in new tab)`; a `mailto:` link opens no tab and says so nowhere.

**The Punctuation Rule.** `…` never `...`; year ranges are an en dash closed up (`2013–2026`); no em dashes in interface copy (a full stop or a colon does the work); a quoted value takes typographic quotes (`No tags match “zzz”.`); a missing date is `n.d.` and a missing author is omitted, never `N/A`. The `<title>` separator is `|` on every page.

**The Honest-State Rule.** A state names what happened and what still works: `The map could not be loaded. The talks below are the same records.`; `Country shading could not be loaded. The marker view still works.`; `Offline. Cached pages remain available.`; `Loading map…`. Internal error text stays in the console. A canvas chart hands the screen reader a computed one-sentence summary (`Publications per year by type, 2013 to 2026, in 8 types. Busiest year: 2016, 6 publications.`), never the renderer's auto-generated dump.

## Do's and Don'ts

### Do:

- **Do** cast every string into exactly one voice — Archivo/Newsreader for what the scholar writes, Spline Sans Mono for what the machine indexes.
- **Do** reach for rule weight (5px / 4px / 3px / 1px, always ink-coloured) before size or colour when you need hierarchy.
- **Do** render dated or keyed records as ledger rows with a hanging mono key.
- **Do** keep pine countable — a handful of occurrences per screen, marking only what is current, active, newest, or primary.
- **Do** design midnight as its own pass, verifying every component in both themes before shipping it.
- **Do** verify small mono caps in midnight against daylight by capture, not by computed style — the compensation is optical and only a render shows it.
- **Do** use real data as the only ornament: year-bars, counts, frequency-scaled terms, corpus figures.
- **Do** set imagery as plates — 1px border, square corners, serif-italic caption below — and prefer corpus scans to stock imagery.
- **Do** address breakpoints through PostCSS custom media (`@media (--md)`) and colours through `color-mix()` with design tokens.
- **Do** write interface copy in the archive's voice — British English, sentence case, one noun per concept, the reader's noun rather than the code's — and check a new string against the Voice & Copy glossary before shipping it.

### Don't:

- **Don't** add `border-radius` to any new style; every radius token is `0` and `--border-radius-full` is reserved for circular micro-controls.
- **Don't** add `box-shadow`, `backdrop-filter`, glass, or glow. There are no shadow tokens, and depth is drawn in rules and ink density.
- **Don't** use a gradient for decoration. Three sanctioned exceptions exist, all of them data encodings: `.hbar` (hard-stop proportion meter, where the stop position _is_ the value), the volume-control track in `VolumeControl.svelte` (the same technique inline), and the density-scale legend in `NetworkMatrix.svelte` (a genuinely continuous ramp encoding a data scale). A gradient that encodes nothing is still banned.
- **Don't** set a headline in mono or metadata in serif, and don't let the mono face become a page-wide theme.
- **Don't** introduce a second accent, or spend pine on large filled areas beyond the single hero button.
- **Don't** use `rgba()` for transparency, hardcode a hex or spacing value, or write a pixel media query — use tokens, `color-mix()`, and custom media.
- **Don't** write a raw `em` letter-spacing value anywhere outside the token block. Tracking is eight roles keyed to size; reach for the matching `--tracking-*` role, and treat a value that fits none of them as a design question rather than a new step.
- **Don't** write a raw `ch` cap on prose, and don't read a `ch` number as a character count. Reach for `--measure-prose`, `--measure-standfirst`, or `--measure-note`, and check the result by counting characters in the rendered line.
- **Don't** add a `border-left` accent stripe, a rounded card with a soft shadow, or any of the templated-academic-CMS patterns this system was built against.
- **Don't** animate beyond an instant colour or border change; the register is print, and the most a page may do on arrival is a short fade.
- **Don't** reintroduce glassmorphism in any form. The former `.glass-*` classes were neutralised and then renamed to `.surface-*`; that migration is complete, and the only remaining mentions are historical comments in `surfaces.css` and `CSS-README.md`. Use `.surface-*`, and never add a `backdrop-filter`.
