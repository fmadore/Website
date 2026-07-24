/**
 * Layout primitives for the CV PDF (see pdfCvGenerator.ts for the design
 * brief). This module owns the typeset mechanics — page cursor, page breaks,
 * running foot, section heads, year gutter, ledger entries — plus the pure
 * helpers (font embedding, contact-link classification). The generator keeps
 * only the DOM reading and document orchestration.
 */
import { base } from '$app/paths';
import {
	extractRichText,
	renderRichText,
	measureRichTextHeight,
	trimFragments,
	type TextFragment
} from '$lib/utils/pdfRichText';
import { FONT_SIZE, SPACING, RULE, COLORS, LETTER_SPACING } from '$lib/utils/pdfDesignTokens';

type JsPdf = import('jspdf').jsPDF;

/** The three Ink + Signal voices resolved to registered jsPDF family names. */
export interface CvPdfVoices {
	DISPLAY: string;
	SERIF: string;
	MONO: string;
}

/**
 * CV PDF web fonts — the three Ink + Signal voices as static TTFs served from
 * /static/fonts/pdf. Registered into jsPDF's virtual file system at generation
 * time so the PDF renders in the real faces (Archivo / Newsreader / Spline Sans
 * Mono) instead of the Helvetica/Times/Courier stand-ins. Fetched on demand, so
 * they never touch the page's critical path.
 */
const CV_FONTS: { file: string; family: string; style: string }[] = [
	{ file: 'Archivo-Regular.ttf', family: 'Archivo', style: 'normal' },
	{ file: 'Archivo-Bold.ttf', family: 'Archivo', style: 'bold' },
	{ file: 'Newsreader-Regular.ttf', family: 'Newsreader', style: 'normal' },
	{ file: 'Newsreader-SemiBold.ttf', family: 'Newsreader', style: 'bold' },
	{ file: 'Newsreader-Italic.ttf', family: 'Newsreader', style: 'italic' },
	{ file: 'Newsreader-MediumItalic.ttf', family: 'Newsreader', style: 'bolditalic' },
	{ file: 'SplineSansMono-Regular.ttf', family: 'SplineSansMono', style: 'normal' },
	{ file: 'SplineSansMono-Bold.ttf', family: 'SplineSansMono', style: 'bold' }
];

/** Encode a font's bytes as base64 for jsPDF's VFS. Chunked so a large TTF
 * doesn't overflow the call stack via String.fromCharCode(...spread). */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	const chunkSize = 0x8000;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	}
	return btoa(binary);
}

/**
 * Fetch and register the three CV voices into the jsPDF instance. Returns true
 * when every face loaded, false on any failure — the caller then falls back to
 * the standard PDF fonts so a font hiccup never blocks the download.
 */
export async function registerCvFonts(pdf: JsPdf): Promise<boolean> {
	try {
		await Promise.all(
			CV_FONTS.map(async ({ file, family, style }) => {
				const res = await fetch(`${base}/fonts/pdf/${file}`);
				if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
				const b64 = arrayBufferToBase64(await res.arrayBuffer());
				pdf.addFileToVFS(file, b64);
				pdf.addFont(file, family, style);
			})
		);
		return true;
	} catch (err) {
		if (import.meta.env.DEV) console.error('CV font embedding failed; using standard fonts:', err);
		return false;
	}
}

/** Wait for the lazily-loaded CV sections to be present in #cv-content. */
export async function waitForCvSections(cvContent: HTMLElement): Promise<void> {
	// The CV page loads components in batches with delays up to 400ms.
	// The full CV has 15+ sections; wait until we see at least 12.
	const maxWaitTime = 3000;
	const checkInterval = 100;
	let waited = 0;

	while (waited < maxWaitTime) {
		if (cvContent.querySelectorAll('section').length >= 12) break;
		await new Promise((resolve) => setTimeout(resolve, checkInterval));
		waited += checkInterval;
	}

	// Additional small delay to ensure DOM is fully rendered
	await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Classify a contact link by its actual hostname (not a substring match,
 * which would also accept e.g. "evil.com/github.com"). Returns null for
 * unrecognized links, which are then skipped.
 */
export function classifyContactLink(
	href: string,
	label: string
): { displayLabel: string; displayValue: string } | null {
	if (href.startsWith('mailto:')) return { displayLabel: 'Email:', displayValue: label };
	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return null;
	}
	const host = url.hostname.toLowerCase();
	const isHost = (domain: string) => host === domain || host.endsWith(`.${domain}`);
	const pathValue = url.pathname.replace(/^\//, '').replace(/\/$/, '');
	if (isHost('frederickmadore.com')) return { displayLabel: 'Web:', displayValue: label };
	if (isHost('linkedin.com'))
		return {
			displayLabel: 'LinkedIn:',
			displayValue: url.pathname.split('/in/')[1]?.replace('/', '') || label
		};
	if (isHost('github.com')) return { displayLabel: 'GitHub:', displayValue: pathValue || label };
	if (isHost('orcid.org')) return { displayLabel: 'ORCID:', displayValue: pathValue || label };
	return null;
}

/**
 * The typeset sheet: owns the y cursor, page geometry, and the rule-drawn
 * layout idioms (running foot, section heads, year gutter, ledger rows).
 */
export class CvPdfLayout {
	readonly pageWidth: number;
	readonly pageHeight: number;
	readonly contentWidth: number;
	y: number;

	constructor(
		private readonly pdf: JsPdf,
		private readonly voices: CvPdfVoices,
		readonly margin: number
	) {
		this.pageWidth = pdf.internal.pageSize.getWidth();
		this.pageHeight = pdf.internal.pageSize.getHeight();
		this.contentWidth = this.pageWidth - 2 * margin;
		this.y = margin;
	}

	/** Close the current page (running foot) and start a fresh one. */
	newPage(): void {
		this.addPageNumber();
		this.pdf.addPage();
		this.y = this.margin;
	}

	/** Start a new page when fewer than `requiredSpace` mm remain. */
	checkPageBreak(requiredSpace: number = 15): void {
		if (this.y > this.pageHeight - this.margin - requiredSpace) {
			this.newPage();
		}
	}

	/**
	 * Page footer — running-foot metadata in the DATA voice (mono), closed
	 * by a faint hairline. Name/document label left, page number right.
	 */
	addPageNumber(): void {
		const { pdf } = this;
		const pageNum = pdf.internal.pages.length - 1;

		// Footer hairline
		pdf.setDrawColor(...COLORS.HAIRLINE);
		pdf.setLineWidth(RULE.FOOTER);
		pdf.line(this.margin, this.pageHeight - 14, this.pageWidth - this.margin, this.pageHeight - 14);

		// Name / document label on left — mono data voice
		pdf.setFontSize(FONT_SIZE.FOOTER);
		pdf.setFont(this.voices.MONO, 'normal');
		pdf.setTextColor(...COLORS.TEXT_MUTED);
		pdf.text('Frédérick Madore, PhD — Curriculum Vitae', this.margin, this.pageHeight - 9);

		// Page number on right — mono data voice
		pdf.text(`Page ${pageNum}`, this.pageWidth - this.margin, this.pageHeight - 9, {
			align: 'right'
		});

		pdf.setTextColor(...COLORS.TEXT);
	}

	/**
	 * Section heading — serif title-case over a full-width hairline,
	 * mirroring the on-screen CV's serif h3 headings (e.g.
	 * "Professional Appointments"). Title case (not uppercase) keeps the
	 * editorial, fine-book register rather than a templated CMS label.
	 */
	addSection(title: string): void {
		const { pdf } = this;
		// Check if we need a new page (need space for heading + some content).
		// 60 prevents headers from appearing alone at the bottom of the page:
		// section top spacing + header + hairline rule + section bottom spacing
		// + at least one content item.
		this.checkPageBreak(60);
		this.y += SPACING.SECTION_TOP;

		// Section heading — serif, deep ink, title case
		pdf.setFontSize(FONT_SIZE.SECTION_HEADING);
		pdf.setFont(this.voices.DISPLAY, 'bold');
		pdf.setTextColor(...COLORS.TEXT_EMPHASIS);
		pdf.text(title, this.margin, this.y);
		this.y += 2.5;

		// Hairline rule under section heading — full content width
		pdf.setDrawColor(...COLORS.BORDER);
		pdf.setLineWidth(0.2);
		pdf.line(this.margin, this.y, this.pageWidth - this.margin, this.y);

		pdf.setTextColor(...COLORS.TEXT); // Reset text color
		this.y += SPACING.SECTION_BOTTOM;
	}

	/**
	 * Subsection label — the DATA voice: mono, uppercase and letterspaced
	 * (e.g. "DEGREES", "BOOKS"). A grouping key, not a heading, so it never
	 * competes with the Archivo section head above it.
	 */
	addSubsectionLabel(label: string): void {
		const { pdf } = this;
		// 50 prevents subheaders from appearing alone at the bottom.
		this.checkPageBreak(50);
		this.y += SPACING.SUBSECTION_TOP;

		pdf.setFontSize(FONT_SIZE.SUBSECTION);
		pdf.setFont(this.voices.MONO, 'bold');
		pdf.setTextColor(...COLORS.TEXT_LIGHT);
		pdf.setCharSpace(LETTER_SPACING.LABEL);
		pdf.text(label.toUpperCase(), this.margin + 2, this.y);
		pdf.setCharSpace(LETTER_SPACING.NONE);
		this.y += SPACING.SUBSECTION_BOTTOM;
		pdf.setTextColor(...COLORS.TEXT);
	}

	/*
	 * Year/gutter label — primary ink, bold. Numeric years ("2026") sit at
	 * FONT_SIZE.BODY; long word labels ("Forthcoming", "à paraître")
	 * would overrun the fixed gutter and collide with the entry text, so
	 * they auto-shrink to fit the column instead of widening it. This
	 * keeps every entry's content indentation identical.
	 */
	drawYearLabel(label: string, x: number, y: number, columnWidth: number): void {
		const { pdf } = this;
		pdf.setFont(this.voices.DISPLAY, 'bold');
		pdf.setFontSize(FONT_SIZE.BODY);
		// Available width = column minus the x inset minus a ~1mm gutter
		// before the content column.
		const maxWidth = columnWidth - (x - this.margin) - 1;
		const width = pdf.getTextWidth(label);
		if (width > maxWidth && maxWidth > 0) {
			pdf.setFontSize(Math.max(6.5, (FONT_SIZE.BODY * maxWidth) / width));
		}
		pdf.setTextColor(...COLORS.PRIMARY);
		pdf.text(label, x, y);
		pdf.setTextColor(...COLORS.TEXT);
		pdf.setFontSize(FONT_SIZE.BODY); // reset for following body text
	}

	/**
	 * Render a ledger entry (year column + rich-text content with optional
	 * italicised detail lines) — the shared shape between subsection entries
	 * and top-level entries.
	 */
	renderLedgerEntry(year: string, contentDiv: Element, currentColumnWidth: number): void {
		const { pdf, contentWidth } = this;
		// Get main text and nested detail lines separately
		const clone = contentDiv.cloneNode(true) as HTMLElement;
		// Extract <p> and direct child <div> as detail lines
		const nestedParagraphs = clone.querySelectorAll('p');
		const nestedDivs = clone.querySelectorAll(':scope > div');

		// Store detail line fragments
		const paragraphFragments: TextFragment[][] = [];
		nestedParagraphs.forEach((p) => {
			const fragments = trimFragments(extractRichText(p));
			if (fragments.length > 0) paragraphFragments.push(fragments);
			p.remove();
		});
		nestedDivs.forEach((div) => {
			const fragments = trimFragments(extractRichText(div));
			if (fragments.length > 0) paragraphFragments.push(fragments);
			div.remove();
		});

		// Get main fragments
		const mainFragments = trimFragments(extractRichText(clone));

		// Calculate height
		let estimatedHeight = 0;
		if (mainFragments.length > 0) {
			estimatedHeight +=
				measureRichTextHeight(
					pdf,
					mainFragments,
					contentWidth - currentColumnWidth,
					FONT_SIZE.BODY,
					SPACING.LINE_HEIGHT_TIGHT
				) + SPACING.LINE_HEIGHT;
		}

		// Add height for nested paragraphs
		paragraphFragments.forEach((frags) => {
			estimatedHeight +=
				measureRichTextHeight(
					pdf,
					frags,
					contentWidth - currentColumnWidth,
					FONT_SIZE.BODY_SMALL,
					SPACING.LINE_HEIGHT_TIGHT
				) + SPACING.LINE_HEIGHT_TIGHT;
		});

		estimatedHeight += SPACING.ENTRY_GAP;
		this.checkPageBreak(estimatedHeight);

		// Year/Category column (auto-shrinks long labels like "Forthcoming")
		this.drawYearLabel(year, this.margin + 2, this.y, currentColumnWidth);

		// Render main text
		if (mainFragments.length > 0) {
			this.y = renderRichText(
				pdf,
				mainFragments,
				this.margin + currentColumnWidth,
				this.y,
				contentWidth - currentColumnWidth,
				FONT_SIZE.BODY,
				SPACING.LINE_HEIGHT_TIGHT
			);
			// Tighter gap when detail lines follow
			this.y += paragraphFragments.length > 0 ? SPACING.PARAGRAPH_GAP : SPACING.LINE_HEIGHT;
		}

		// Render detail lines (reviews, amounts, co-applicants, etc.)
		paragraphFragments.forEach((frags, idx) => {
			pdf.setTextColor(...COLORS.TEXT_LIGHT);
			frags.forEach((f: TextFragment) => {
				if (f.style === 'normal') f.style = 'italic';
				else if (f.style === 'bold') f.style = 'bolditalic';
			});

			this.y = renderRichText(
				pdf,
				frags,
				this.margin + currentColumnWidth,
				this.y,
				contentWidth - currentColumnWidth,
				FONT_SIZE.BODY_SMALL,
				SPACING.LINE_HEIGHT_TIGHT
			);

			pdf.setTextColor(...COLORS.TEXT);
			// Tight gap between detail lines, larger after last one
			this.y +=
				idx < paragraphFragments.length - 1 ? SPACING.PARAGRAPH_GAP : SPACING.LINE_HEIGHT_TIGHT;
		});

		this.y += SPACING.ENTRY_GAP;
	}
}
