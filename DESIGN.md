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
  danger-bright: '#d1553a'
  success: '#5c6b3a'
  viz-pine: '#1e6a56'
  viz-slate: 'oklch(0.52 0.06 250)'
  viz-olive: 'oklch(0.58 0.07 128)'
  viz-ochre: 'oklch(0.66 0.09 72)'
  viz-mauve: 'oklch(0.55 0.06 350)'
  viz-plum: 'oklch(0.53 0.078 305)'
  viz-umber: 'oklch(0.45 0.05 30)'
typography:
  nameplate:
    fontFamily: 'Archivo, system-ui, Segoe UI, Helvetica Neue, Arial, sans-serif'
    fontSize: 'clamp(2.5rem, 1.6rem + 4.2vw, 5rem)'
    fontWeight: 850
    lineHeight: 0.9
    letterSpacing: '-0.015em'
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
    letterSpacing: 'normal'
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
    letterSpacing: '0.1em'
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

Both themes are first-class and both are warm. Daylight is warm paper struck by ink; midnight is the same printed page photographed as a microfilm negative, with grounds swapped to warm near-black, type to cream, and the pine accent brightened. It is not slate, not blue, and never an inversion filter. The confirmed anti-references are specific: templated academic CMS and faculty-directory defaults; the AI-slop tells (gradients, glassmorphism, glow, `border-left` accent stripes, rounded cards with soft shadows); code-editor and terminal aesthetics, since mono here is metadata and never a page theme; and soft-launch minimalism with acres of whitespace and hero photos under overlay text.

The system renders itself: the `/style-guide` route is a living reference that reads the live token values off `:root` and re-documents itself when a token changes. Check a claim in this file against that page before trusting it, and when you add a reusable idiom, document it there in the same change. The idiom classes themselves live in `src/styles/components/ink-signal.css`.

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

- **The visualisation palette** (`viz-slate`, `viz-olive`, `viz-ochre`, `viz-mauve`, `viz-plum`, `viz-umber`, anchored by pine): Seven muted, earthy hues derived in OKLCH from the ink and pine anchors, each holding up on both grounds. **Category encoding only.** These are data colours; they never become UI chrome, backgrounds, borders, or decoration.

### Neutral

- **Warm Paper** (`#faf7ef`): The daylight page ground. **Raised Paper** (`#fffdf7`) for elevated sheet tiles, **Paper Surface** (`#f3eee0`) and **Sunken Paper** (`#ece4d1`) for muted and recessed surfaces.
- **Film Ground** (`#171310`): The midnight page ground — warm near-black, never slate. **Raised Film** (`#1f1a14`) and **Sunken Film** (`#252017`) sit deliberately close in value to it.
- **Cream** (`#efe7d6`) with **Soft** (`#cbc0a6`), **Muted** (`#b3a88d`) and **Faint** (`#948a73`) steps: the midnight type ramp, mirroring the ink ramp exactly.
- **Hairline** (`#dcd4be`) / **Border** (`#c9c0aa`) / **Strong Border** (`#a39b86`), and their film counterparts (`#383126` / `#453d2f` / `#5a5140`): row separators, plate edges, and outlined controls.
- **Deep Warm Red** (`#a3341c`) and **Muted Olive** (`#5c6b3a`): errors and confirmations only. Warm-tinted so they read as ink annotations rather than web toast, and used only in form validation.

### Named Rules

**The Scarcity Rule.** Pine marks the current thing. If it appears more than a handful of times on a screen it has stopped meaning anything — demote occurrences until it is scarce again. This is a countable test, not a matter of taste.

**The Warm Ground Rule.** Grounds and type stay warm in both themes; the accent is the only cooler note in the system. Pure white, pure black, and any cool gray are outside the palette.

**The Negative Rule.** Midnight is the same page photographed as a negative, designed as its own pass. Never ship a component specified in only one theme, and never reach for an inversion filter or a slate-blue dark palette.

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
- **Label** (Spline Sans Mono, 500–700, `clamp(0.625rem, …, 0.6944rem)`, letter-spacing 0.06–0.16em, uppercase, tabular numerals): Every machine-indexed string — eyebrows, datelines, counts, navigation, filters, chips, DOIs, pagination, ledger keys, button text. **`h6` belongs to this tier, not to Title:** the smallest heading level in this system is functionally a metadata label, and `typography.css` casts it mono, uppercase, and letterspaced by design. It is the one heading element in the data voice, and the exception is deliberate rather than a violation of the Two Voices Rule.

### Named Rules

**The Measured Line Rule.** Reading measure is stated in characters, never in `ch`. A `ch` is the advance width of the digit zero; Newsreader's average character is only ~0.68–0.73 of that, so a cap written as `65ch` sets 87–95 characters — half again the intended line. Three calibrated roles own every prose cap: `--measure-prose` (50ch → ~69 characters) for body copy, ledger descriptions, abstracts and CV entries; `--measure-standfirst` (42ch → ~61) for the italic deck under a title; `--measure-note` (40ch → ~55) for captions and fine print. Never write a raw `ch` value into a component, and verify a change by counting characters in the rendered line — `/style-guide` measures all three live. Monospace is the exception: 1ch is exactly one character there, so ledger key columns may be sized in `ch` literally. Metadata that is scanned rather than read — bylines, citation and venue lines — is deliberately left uncapped.

**The Two Voices Rule.** Every string on every page belongs to exactly one voice. The document voice (Archivo, Newsreader) carries what the scholar writes; the data voice (Spline Sans Mono) carries what the machine indexes. If a string could plausibly be a database column, it is mono. No mono headlines, no serif metadata. Blurring the two is this system's only unforgivable error.

**The Mono-Is-Not-A-Theme Rule.** The mono face is metadata, never body copy and never a page-wide treatment. A terminal or code-editor aesthetic is an anti-reference, not an adjacent style.

**The Upright Heading Rule.** Inline `<em>` inside `h1`–`h3` stays upright in the display face; a Newsreader italic inside an Archivo head is a voice collision. Genuine serif italics belong in prose, standfirsts, and captions.

## Layout

The spatial model is an 8-point grid built on a 4px baseline, exposed as both a numeric scale (`space-1` … `space-48`) and a semantic one (`3xs` 2px through `4xl` 96px). Containers step at 640 / 768 / 1024 / 1280 / 1536px, and breakpoints are addressed exclusively through PostCSS custom media (`@media (--md)`), never hardcoded pixel queries.

**The ledger** is the standard record layout: a CSS grid of a hanging mono key column (default 7rem, tunable per instance) and a serif content column, with a 1px hairline on every row and baseline alignment between the columns. A three-column variant adds a right-aligned mono meta column (default 12rem). **The section** is the standard content module: a 3px ink rule, 12px of padding, then an Archivo head, with 48px separating one section from the next.

Density is a deliberate value. Scholars scan, and dense, well-set information reads faster than sparse pages — do not pad with whitespace where structured information would serve the reader better. Reading measure is the one place the system refuses density: prose holds ~69 characters a line however wide the column gets (see The Measured Line Rule).

### Named Rules

**The Rule Hierarchy.** Four weights, all ink-coloured (cream on midnight) and never gray: 5px opens the nameplate, 4px a masthead, 3px a section, 1px separates entries. Reach for rule weight before size or colour when establishing hierarchy.

**The Ledger Default Rule.** Anything dated or keyed — a publication, appointment, activity, metadata field, facet — renders as a ledger row, not a card. A card is the exception and needs a reason.

## Elevation & Depth

**This system has no shadows.** There are no `--shadow-*` tokens to reach for, and `box-shadow` must never be added to a style. Glass does not exist either: no `backdrop-filter`, no translucent chrome. Depth is drawn instead of floated, and it comes from exactly two sources — the weight of the rule separating two regions, and the density of ink within them. Surfaces are layered (`paper` → `paper-surface` → `paper-raised`, and their film equivalents) but stay deliberately close in value, so a surface change alone never carries hierarchy; the rule above it does.

Focus is the one place a ring appears, and it is a flat accent outline (2px solid pine with a 2px offset on controls, or a 3px 45%-opacity accent ring via the `--focus-ring` token), never a glow.

### Named Rules

**The Drawn Depth Rule.** If a design needs to separate two regions, draw a rule or change ink density. Reaching for a shadow, a glow, a blur, or a translucent panel means the hierarchy has not been solved.

## Shapes

Corners are square. Every radius token resolves to `0` — cards, chips, buttons, panels, inputs, and image plates are all sharp-cornered by design. `--border-radius-full` (9999px) survives for genuinely circular micro-controls that opt in explicitly: slider thumbs, loading spinners, status dots. Nothing else may use it.

The recurring silhouette is the rectangle with a 1px border: the flat chip, the pager item, the image plate. **Plates** are the imagery treatment — a photograph, cover, or archival scan gets a 1px border, square corners, a muted ground behind it, and a serif-italic caption below (`Fig. 1 — …`). Scans from the press corpus are first-class imagery and are preferred to stock photography of any kind.

Borders come in three weights (1px, 2px, 4px) and take their colour from the hairline/border/strong-border ramp, which is warm rather than neutral gray.

### Named Rules

**The Square Corner Rule.** No `border-radius` on any new style, with the single documented exception of a circular micro-control opting into `--border-radius-full`.

## Components

Components are **typeset, not manufactured**: they read as set type and printer's rules — a stamped mono label inside a hairline box — never as app widgets. No lift, no ripple, no bevel, no transform on press. Transitions animate colour and border only, at 150ms.

### Buttons

- **Shape:** Square (0 radius), 1px border, inline-flex, uppercase mono text at the eyebrow tracking (0.05em).
- **Primary:** Solid ink fill with paper text (`12px 20px`); on midnight the fill becomes cream with film-ground text. The standard primary action.
- **Accent:** Solid pine with paper text — the **single hero call to action per screen**, governed by the Scarcity Rule.
- **Hover / Focus:** Hover deepens the fill (ink → deep ink, pine → deep pine) with no movement whatsoever. Focus-visible draws a 2px pine outline at a 2px offset.
- **Secondary / Outline / Ghost:** Secondary is a transparent control with a strong-border edge that fills with the alt surface on hover. Outline variants (`primary`, `secondary`, `accent`) invert to a solid fill on hover. Ghost carries faint-ink text and no border.
- **Sizes:** `sm` (8px 16px), default (12px 20px), `lg` (16px 28px). Icon-only variants are padded to stay square.
- **Bare:** A zero-specificity `:where(.btn-bare)` primitive exists for controls that are semantically buttons but must not look like one (transport controls, close crosses). It carries only hit behaviour, a focus ring, and the native reset, so a consumer's own class styles it without `!important`.

### Chips

- **Style:** Transparent ground, 1px border, square, mono uppercase at 0.06em tracking, with the count appended in a heavier weight and quieter ink (`ISLAM 33`).
- **State:** Unselected hovers to a stronger border and emphasis ink. **Selected is a solid ink fill** with paper text, and its appended count drops to 72% of the inverted colour.
- **Sizing:** Vertical padding is set so the chip clears 24px in both dimensions, satisfying WCAG 2.5.8 target size.
- **`chip-more`:** The "All N tags" affordance is a reset native button rendered as accent mono text, not a chip.

### Cards / Containers

- **Corner Style:** Square (0).
- **Background:** A paper surface step; on midnight, a film step.
- **Shadow Strategy:** None — see Elevation & Depth. Separation comes from the border and the rule above.
- **Border:** 1px in the warm border ramp.
- **Note:** Cards are the exception to the Ledger Default Rule and need a reason to exist.

### Inputs / Fields

- **Style:** Square, 1px border from the warm ramp, transparent or surface ground, mono for machine-facing fields and serif for free text.
- **Focus:** A flat accent outline or the `--focus-ring` accent ring — never a glow, never a shadow.

### Navigation

- **Style:** Mono data voice, uppercase, letterspaced. The active item takes pine; the rest are ink.
- **States:** Colour change only, instantly. No underline sweep, no sliding indicator, no scale.

### Signature components

- **The Nameplate:** Archivo at weight 850 on a `wdth` 123 cut, uppercase, line-height 0.9, sitting above a 5px ink rule. The single loudest element in the system.
- **The Ledger Row:** The universal record — hanging mono key (with an optional uppercase status stamp beneath it), a serif title and description, an optional right-aligned mono meta column, and a hairline above each row.
- **The Year-Bar Strip:** Publication distribution drawn as flush ink bars with the newest year in pine, and a mono legend beneath. Real data used as the page's ornament.
- **The Key-Terms Cloud:** A frequency-scaled serif term list where size encodes actual corpus frequency.
- **The Drop Cap:** An Archivo initial at 4.4em, weight 850, in pine, floated into an abstract or standfirst.
- **The Stat Ledger:** "The corpus, in numbers" — mono rows with tabular figures, the key figure in pine.

## Do's and Don'ts

### Do:

- **Do** cast every string into exactly one voice — Archivo/Newsreader for what the scholar writes, Spline Sans Mono for what the machine indexes.
- **Do** reach for rule weight (5px / 4px / 3px / 1px, always ink-coloured) before size or colour when you need hierarchy.
- **Do** render dated or keyed records as ledger rows with a hanging mono key.
- **Do** keep pine countable — a handful of occurrences per screen, marking only what is current, active, newest, or primary.
- **Do** design midnight as its own pass, verifying every component in both themes before shipping it.
- **Do** use real data as the only ornament: year-bars, counts, frequency-scaled terms, corpus figures.
- **Do** set imagery as plates — 1px border, square corners, serif-italic caption below — and prefer corpus scans to stock imagery.
- **Do** address breakpoints through PostCSS custom media (`@media (--md)`) and colours through `color-mix()` with design tokens.

### Don't:

- **Don't** add `border-radius` to any new style; every radius token is `0` and `--border-radius-full` is reserved for circular micro-controls.
- **Don't** add `box-shadow`, `backdrop-filter`, glass, or glow. There are no shadow tokens, and depth is drawn in rules and ink density.
- **Don't** use a gradient for decoration. Three sanctioned exceptions exist, all of them data encodings: `.hbar` (hard-stop proportion meter, where the stop position _is_ the value), the volume-control track in `VolumeControl.svelte` (the same technique inline), and the density-scale legend in `NetworkMatrix.svelte` (a genuinely continuous ramp encoding a data scale). A gradient that encodes nothing is still banned.
- **Don't** set a headline in mono or metadata in serif, and don't let the mono face become a page-wide theme.
- **Don't** introduce a second accent, or spend pine on large filled areas beyond the single hero button.
- **Don't** use `rgba()` for transparency, hardcode a hex or spacing value, or write a pixel media query — use tokens, `color-mix()`, and custom media.
- **Don't** write a raw `ch` cap on prose, and don't read a `ch` number as a character count. Reach for `--measure-prose`, `--measure-standfirst`, or `--measure-note`, and check the result by counting characters in the rendered line.
- **Don't** add a `border-left` accent stripe, a rounded card with a soft shadow, or any of the templated-academic-CMS patterns this system was built against.
- **Don't** animate beyond an instant colour or border change; the register is print, and the most a page may do on arrival is a short fade.
- **Don't** reintroduce glassmorphism in any form. The former `.glass-*` classes were neutralised and then renamed to `.surface-*`; that migration is complete, and the only remaining mentions are historical comments in `surfaces.css` and `CSS-README.md`. Use `.surface-*`, and never add a `backdrop-filter`.
