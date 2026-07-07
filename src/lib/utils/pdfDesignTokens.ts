/**
 * PDF Design Tokens — Ink + Signal
 *
 * Centralised design constants for PDF CV generation, kept in sync with the
 * site's `src/styles/base/variables.css` design tokens. The PDF is a printed
 * "daylight" sheet, so it uses the light-mode anchors: ink on warm paper with a
 * single pine (warm teal) accent.
 *
 * THREE VOICES, STRICTLY CAST. The generator embeds the real web faces (Archivo /
 * Newsreader / Spline Sans Mono) into jsPDF at render time (see PdfGenerator's
 * registerCvFonts). These `FONTS` values are the FALLBACK — the closest of the 14
 * standard PDF fonts, used only when the TTF fetch fails:
 *   - DISPLAY  (Archivo)           → helvetica  — name, section heads, big numerals
 *   - SERIF    (Newsreader)        → times      — all prose / body / italics
 *   - MONO     (Spline Sans Mono)  → courier    — the DATA voice: dates, keys,
 *                                                  labels, counts, eyebrows
 * Never blur the voices: no mono headlines, no serif metadata.
 */

/** Voice → fallback standard-PDF-font mapping. The generator prefers the embedded
 * real faces and drops to these only if the fonts can't be fetched. */
export const FONTS = {
	DISPLAY: 'helvetica', // Archivo — document display voice (name, section heads)
	SERIF: 'times', // Newsreader — prose / body voice
	MONO: 'courier' // Spline Sans Mono — the data voice (dates, labels, counts)
} as const;

/** Enhanced typography constants — refined for the typeset-CV register. */
export const FONT_SIZE = {
	NAME: 24, // Nameplate — Archivo/helvetica display headline
	EYEBROW: 8, // "CURRICULUM VITAE" data-voice eyebrow (mono, letterspaced)
	TITLE: 11, // Legacy alias (retained for compatibility)
	DATE: 8.5, // "As of …" dateline — data voice
	CONTACT_LABEL: 7.5, // Contact labels (mono small-caps eyebrow)
	CONTACT_VALUE: 8.5, // Contact values
	SECTION_HEADING: 13, // Section headers — Archivo/helvetica, clear hierarchy
	SUBSECTION: 8, // Subsection labels (BOOKS, ARTICLES…) — mono uppercase
	BODY: 9.5, // Body text — serif, comfortable reading
	BODY_SMALL: 9, // Secondary body text (reviews, amounts…)
	YEAR: 8.5, // Year / date keys — data voice (mono)
	PAGE_NUMBER: 8, // Page numbers
	FOOTER: 7.5 // Footer text
} as const;

/** Letter-spacing values (mm) for jsPDF setCharSpace — used on the mono data-voice
 * runs (eyebrows, labels, section marks) to echo the on-screen letterspaced
 * tracking. Mono/uppercase metadata is letterspaced; prose never is. */
export const LETTER_SPACING = {
	EYEBROW: 0.6, // "CURRICULUM VITAE" + contact labels
	LABEL: 0.4, // Subsection labels, section number marker
	NONE: 0 // Reset after a letterspaced run
} as const;

/** Rule weights (mm line width) — hierarchy is drawn in rules, not boxes.
 * Mirrors `--rule-section` (3px) and `--rule-hairline` (1px) on screen. At A4
 * mm scale, 3px ≈ 0.8mm reads as the heavy masthead/section rule and 1px ≈
 * 0.25mm as the hairline entry separator. */
export const RULE = {
	SECTION: 0.8, // Heavy ink rule opening each section (≈ --rule-section 3px)
	HAIRLINE: 0.25, // Hairline separating entries (≈ --rule-hairline 1px)
	FOOTER: 0.2 // Faint footer rule
} as const;

/** Refined spacing system — a tight, typeset ledger rhythm. */
export const SPACING = {
	HEADER_BOTTOM: 6, // Space after header block
	SECTION_TOP: 7, // Space before new section (room for the heavy rule)
	SECTION_RULE_GAP: 3.2, // Gap between the section rule and the heading text
	SECTION_BOTTOM: 4, // Space after section heading
	SUBSECTION_TOP: 4, // Space before subsection label
	SUBSECTION_BOTTOM: 3.5, // Space after subsection label
	ENTRY_GAP: 1, // Gap between entries (tight ledger rows)
	ENTRY_PAD_TOP: 1.4, // Space above an entry's hairline separator
	LINE_HEIGHT: 4.5, // Standard line height
	LINE_HEIGHT_TIGHT: 3.8, // Tight line height for multi-line
	CONTACT_LINE: 4.5, // Contact info line spacing
	PARAGRAPH_GAP: 1 // Gap between paragraphs in same entry
} as const;

/** Ink + Signal palette — ink on warm paper, pine (warm teal) accent. RGB triples
 * mirror the daylight anchors in `variables.css` (`--sys-color-*`). */
export const COLORS = {
	PRIMARY: [25, 21, 9] as [number, number, number], // #191509 — Ink (rules, heads, fills)
	PRIMARY_DARK: [14, 11, 4] as [number, number, number], // #0e0b04 — Deepest ink
	ACCENT: [30, 106, 86] as [number, number, number], // #1e6a56 — Pine (sole accent)
	TEXT_EMPHASIS: [25, 21, 9] as [number, number, number], // #191509 — Ink (headings, name)
	TEXT: [58, 53, 42] as [number, number, number], // #3a352a — Soft ink (prose body)
	TEXT_LIGHT: [92, 84, 66] as [number, number, number], // #5c5442 — Muted ink (secondary prose)
	TEXT_MUTED: [147, 137, 111] as [number, number, number], // #93896f — Faint ink (labels, keys)
	BORDER: [201, 192, 170] as [number, number, number], // #c9c0aa — Default border / section-adjacent
	HAIRLINE: [220, 212, 190] as [number, number, number], // #dcd4be — Row hairline separators
	BACKGROUND_LIGHT: [250, 247, 239] as [number, number, number] // #faf7ef — Warm paper
} as const;

/** Year column width for two-column layout entries */
export const yearColumnWidth = 18 as const; // Compact year column
