/**
 * PDF Design Tokens
 *
 * Centralized design constants for PDF CV generation.
 * Extracted from PdfGenerator.svelte for reusability and maintainability.
 */

/** Enhanced typography constants - refined for better readability */
export const FONT_SIZE = {
	NAME: 22, // Prominent name - the star of the show
	TITLE: 11, // "Curriculum Vitae" subtitle
	DATE: 8.5, // Date - subtle
	CONTACT_LABEL: 8, // Contact labels
	CONTACT_VALUE: 8.5, // Contact values
	SECTION_HEADING: 12, // Section headers - clear hierarchy
	SUBSECTION: 10.5, // Subsection headers
	BODY: 9.5, // Body text - comfortable reading
	BODY_SMALL: 9, // Secondary body text
	PAGE_NUMBER: 8, // Page numbers
	FOOTER: 7.5 // Footer text
} as const;

/** Refined spacing system - better visual rhythm */
export const SPACING = {
	HEADER_BOTTOM: 6, // Space after header block
	SECTION_TOP: 6, // Space before new section (Increased)
	SECTION_BOTTOM: 5, // Space after section heading (Increased)
	SUBSECTION_TOP: 4, // Space before subsection (Increased)
	SUBSECTION_BOTTOM: 5, // Space after subsection heading (Increased)
	ENTRY_GAP: 1, // Gap between entries (Tightened)
	LINE_HEIGHT: 4.5, // Standard line height (Restored)
	LINE_HEIGHT_TIGHT: 3.8, // Tight line height for multi-line (Restored)
	CONTACT_LINE: 4.5, // Contact info line spacing (Restored)
	PARAGRAPH_GAP: 1 // Gap between paragraphs in same entry
} as const;

/** Refined color palette - matches website's warm terracotta/ochre design system */
export const COLORS = {
	PRIMARY: [158, 72, 51] as [number, number, number], // #9e4833 - Terracotta 600
	PRIMARY_DARK: [130, 64, 49] as [number, number, number], // #824031 - Terracotta 700
	ACCENT: [245, 158, 11] as [number, number, number], // #f59e0b - Amber 500 (gold secondary)
	TEXT: [42, 33, 26] as [number, number, number], // #2a211a - Warm Neutral 800 (ink)
	TEXT_LIGHT: [122, 107, 94] as [number, number, number], // #7a6b5e - Warm Neutral 500
	TEXT_MUTED: [163, 148, 135] as [number, number, number], // #a39487 - Warm Neutral 400
	BORDER: [233, 226, 213] as [number, number, number], // #e9e2d5 - Warm Neutral 200
	BACKGROUND_LIGHT: [250, 247, 242] as [number, number, number] // #faf7f2 - Warm Neutral 50 (paper)
} as const;

/** Year column width for two-column layout entries */
export const yearColumnWidth = 18 as const; // Compact year column
