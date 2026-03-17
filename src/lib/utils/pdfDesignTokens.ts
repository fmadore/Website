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

/** Refined color palette - matching website's teal/amber design system */
export const COLORS = {
	PRIMARY: [15, 118, 110] as [number, number, number], // #0f766e - Teal 700
	PRIMARY_DARK: [17, 94, 89] as [number, number, number], // #115e59 - Teal 800
	ACCENT: [245, 158, 11] as [number, number, number], // #f59e0b - Amber 500
	TEXT: [31, 41, 55] as [number, number, number], // #1f2937 - Neutral 800
	TEXT_LIGHT: [107, 114, 128] as [number, number, number], // #6b7280 - Neutral 500
	TEXT_MUTED: [156, 163, 175] as [number, number, number], // #9ca3af - Neutral 400
	BORDER: [229, 231, 235] as [number, number, number], // #e5e7eb - Neutral 200
	BACKGROUND_LIGHT: [249, 250, 251] as [number, number, number] // #f9fafb - Neutral 50
} as const;

/** Year column width for two-column layout entries */
export const yearColumnWidth = 18 as const; // Compact year column
