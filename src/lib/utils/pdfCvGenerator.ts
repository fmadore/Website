/**
 * CV PDF generation — Ink + Signal, the press archive read as a typeset sheet.
 *
 * Extracted from `cv/PdfGenerator.svelte` so the component stays a thin
 * download button; this module reads the rendered #cv-content DOM and
 * orchestrates the document. The typeset mechanics (page cursor, page
 * breaks, running foot, section heads, year gutter, ledger entries) and the
 * pure helpers (font embedding, contact-link classification) live in
 * `pdfCvLayout.ts`.
 *
 * Mirrors the on-screen CV's two-voice, rule-drawn language in print:
 * - Nameplate letterhead: a pine mono "CURRICULUM VITAE" data-voice
 *   eyebrow above an Archivo/helvetica name headline, a mono dateline, closed
 *   by a full-width ink hairline
 * - Section heads in the DISPLAY voice (Archivo → helvetica bold), each opened
 *   by a heavy 3px-equivalent ink rule — no boxes, no shadows, no accent stripes
 * - Subsection labels (BOOKS, ARTICLES…) in the DATA voice (mono uppercase,
 *   letterspaced, quiet ink) over a hairline
 * - Prose body in the SERIF voice (Newsreader → times); year/date keys in the
 *   DATA voice (mono), the sole pine reserved for the current/ongoing key
 * - Ledger rows separated by ink hairlines, exactly like the web CVEntry
 * - Two-column contact block with mono small-caps labels; clickable links in ink
 *
 * Voice→font mapping, palette and type sizes live in $lib/utils/pdfDesignTokens,
 * kept in sync with the site's Ink + Signal design tokens.
 */
import {
	extractRichText,
	renderRichText,
	measureRichTextHeight,
	trimFragments,
	setPdfBaseFont,
	type TextFragment
} from '$lib/utils/pdfRichText';
import { getAddressLines } from '$lib/utils/siteHelpers';
import {
	FONTS,
	FONT_SIZE,
	SPACING,
	COLORS,
	LETTER_SPACING,
	yearColumnWidth
} from '$lib/utils/pdfDesignTokens';
import {
	CvPdfLayout,
	registerCvFonts,
	waitForCvSections,
	classifyContactLink
} from '$lib/utils/pdfCvLayout';

type JsPdfConstructor = typeof import('jspdf').jsPDF;

/**
 * Read the rendered #cv-content DOM and typeset it into a downloaded PDF.
 * Throws if the CV content is not present; the caller owns error reporting
 * and busy-state.
 */
export async function generateCvPdf(jsPDF: JsPdfConstructor): Promise<void> {
	const element = document.getElementById('cv-content');
	if (!element) throw new Error('CV content not found');

	await waitForCvSections(element);

	const today = new Date();
	const dateStr = today.toISOString().split('T')[0];
	const filename = `Frederick_Madore_CV_${dateStr}.pdf`;

	// Create PDF with proper text rendering
	const pdf = new jsPDF('p', 'mm', 'a4');

	// Embed the real Ink + Signal faces; fall back to the standard PDF fonts
	// if the fetch fails. Resolve each voice to its font-family id once so
	// every setFont call below names a voice, never a raw font string.
	const fontsReady = await registerCvFonts(pdf);
	const DISPLAY = fontsReady ? 'Archivo' : FONTS.DISPLAY;
	const SERIF = fontsReady ? 'Newsreader' : FONTS.SERIF;
	const MONO = fontsReady ? 'SplineSansMono' : FONTS.MONO;
	setPdfBaseFont(SERIF);

	const layout = new CvPdfLayout(pdf, { DISPLAY, SERIF, MONO }, 18);
	const { margin, pageWidth, contentWidth } = layout;

	// Extract header information from CVHeader component
	const cvDateElement = element.querySelector('.cv-date');
	const cvContactSection = element.querySelector('.cv-contact-section');

	// ============================================
	// HEADER DESIGN — left-aligned editorial letterhead, mirroring the
	// on-screen CVHeader: a primary-ink letterspaced "CURRICULUM VITAE"
	// eyebrow (the document label) sits above the serif name (the
	// subject); the date follows; a full-width hairline closes the block.
	// ============================================

	// Eyebrow — "CURRICULUM VITAE", small-caps, primary ink, letterspaced
	pdf.setFontSize(FONT_SIZE.EYEBROW);
	pdf.setFont(MONO, 'bold');
	pdf.setTextColor(...COLORS.PRIMARY);
	pdf.setCharSpace(LETTER_SPACING.EYEBROW);
	pdf.text('CURRICULUM VITAE', margin, layout.y);
	pdf.setCharSpace(LETTER_SPACING.NONE);
	layout.y += 7;

	// Name — large serif headline, deep ink (the subject of the page)
	pdf.setFontSize(FONT_SIZE.NAME);
	pdf.setFont(DISPLAY, 'bold');
	pdf.setTextColor(...COLORS.TEXT_EMPHASIS);
	pdf.text('Frédérick Madore, PhD', margin, layout.y);
	layout.y += 5.5;

	// Date — dateline in the data voice (mono)
	pdf.setFontSize(FONT_SIZE.DATE);
	pdf.setFont(MONO, 'normal');
	pdf.setTextColor(...COLORS.TEXT_MUTED);
	const dateText =
		cvDateElement?.textContent?.trim() ||
		today.toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	pdf.text(dateText, margin, layout.y);
	layout.y += 6;

	// Hairline rule under header block — full-width neutral hairline,
	// matching the section dividers below.
	pdf.setDrawColor(...COLORS.BORDER);
	pdf.setLineWidth(0.2);
	pdf.line(margin, layout.y, pageWidth - margin, layout.y);
	layout.y += SPACING.HEADER_BOTTOM;

	// ============================================
	// CONTACT INFORMATION - Clean two-column layout
	// ============================================
	pdf.setFontSize(FONT_SIZE.CONTACT_VALUE);
	pdf.setFont(SERIF, 'normal');
	pdf.setTextColor(...COLORS.TEXT);

	const leftColumn = margin;
	const rightColumn = pageWidth / 2 + 5;
	const startY = layout.y;

	// Left side - Address (from centralized config)
	// Address label — small-caps letterspaced eyebrow
	pdf.setFont(MONO, 'bold');
	pdf.setFontSize(FONT_SIZE.CONTACT_LABEL);
	pdf.setTextColor(...COLORS.TEXT_MUTED);
	pdf.setCharSpace(LETTER_SPACING.EYEBROW);
	pdf.text('ADDRESS', leftColumn, layout.y);
	pdf.setCharSpace(LETTER_SPACING.NONE);
	layout.y += SPACING.CONTACT_LINE;

	// Address lines - from centralized config
	pdf.setFont(SERIF, 'normal');
	pdf.setFontSize(FONT_SIZE.CONTACT_VALUE);
	pdf.setTextColor(...COLORS.TEXT);
	const addressLines = getAddressLines();
	addressLines.forEach((line) => {
		pdf.text(line, leftColumn, layout.y);
		layout.y += SPACING.CONTACT_LINE;
	});

	// Right side - Contact links
	let rightY = startY;
	const linkItems = cvContactSection?.querySelectorAll('.cv-link-item');

	// Contact links header — small-caps letterspaced eyebrow
	pdf.setFont(MONO, 'bold');
	pdf.setFontSize(FONT_SIZE.CONTACT_LABEL);
	pdf.setTextColor(...COLORS.TEXT_MUTED);
	pdf.setCharSpace(LETTER_SPACING.EYEBROW);
	pdf.text('CONTACT', rightColumn, rightY);
	pdf.setCharSpace(LETTER_SPACING.NONE);
	rightY += SPACING.CONTACT_LINE;

	linkItems?.forEach((item) => {
		const anchor = item.querySelector('a');
		if (anchor) {
			const label = anchor.textContent?.trim() || '';
			const href = anchor.getAttribute('href') || '';
			const contact = classifyContactLink(href, label);

			if (contact?.displayValue) {
				const { displayLabel, displayValue } = contact;
				pdf.setFont(SERIF, 'normal');
				pdf.setFontSize(FONT_SIZE.CONTACT_VALUE);
				pdf.setTextColor(...COLORS.TEXT_LIGHT);
				pdf.text(displayLabel, rightColumn, rightY);

				// Clickable link value — primary to match on-screen `#cv-content a`
				pdf.setTextColor(...COLORS.PRIMARY);
				pdf.textWithLink(displayValue, rightColumn + 15, rightY, { url: href });
				rightY += SPACING.CONTACT_LINE;
			}
		}
	});

	// Move y position to the max of left and right columns
	layout.y = Math.max(layout.y, rightY) + SPACING.SECTION_TOP;

	// Separator line before content
	pdf.setDrawColor(...COLORS.BORDER);
	pdf.setLineWidth(0.3);
	pdf.line(margin, layout.y, pageWidth - margin, layout.y);
	layout.y += SPACING.SECTION_TOP;

	pdf.setTextColor(...COLORS.TEXT); // Reset to default text color

	// Extract sections
	const sections = element.querySelectorAll('section');
	sections.forEach((section) => {
		// Skip the contact section - it's already been processed in the header
		if (section.classList.contains('cv-contact-section') || section.classList.contains('mb-6')) {
			return;
		}

		const heading = section.querySelector('h3');
		if (heading) {
			const sectionTitle = heading.textContent || '';
			// Skip the header section (it has no h3, but just in case)
			if (sectionTitle === 'Curriculum Vitae' || !sectionTitle) {
				return;
			}
			layout.addSection(sectionTitle);
		} else {
			// Section without h3 - this is likely the contact section, skip it
			return;
		}

		// Handle subsection headings (h4)
		const subsections = section.querySelectorAll('h4');
		if (subsections.length > 0) {
			subsections.forEach((h4) => {
				layout.addSubsectionLabel(h4.textContent || '');

				// Get the next sibling div with space-y-3 class (flex layout entries)
				let nextElement = h4.nextElementSibling;
				while (nextElement) {
					if (nextElement.tagName === 'DIV' && nextElement.classList.contains('space-y-3')) {
						// Handle flex layout entries
						const entries = nextElement.querySelectorAll('.cv-entry, .flex.gap-4');

						// If no entries, check for simple div children (e.g., Fieldwork section)
						if (entries.length === 0) {
							const simpleEntries = nextElement.querySelectorAll(':scope > div');
							simpleEntries.forEach((entry) => {
								const fragments = trimFragments(extractRichText(entry));
								if (fragments.length > 0) {
									const height =
										measureRichTextHeight(
											pdf,
											fragments,
											contentWidth - 5,
											FONT_SIZE.BODY,
											SPACING.LINE_HEIGHT_TIGHT
										) + SPACING.LINE_HEIGHT;

									layout.checkPageBreak(height);
									layout.y = renderRichText(
										pdf,
										fragments,
										margin + 3,
										layout.y,
										contentWidth - 5,
										FONT_SIZE.BODY,
										SPACING.LINE_HEIGHT_TIGHT,
										SERIF,
										COLORS.PRIMARY,
										COLORS.TEXT
									);
									layout.y += SPACING.LINE_HEIGHT;
								}
							});
							break;
						}

						entries.forEach((entry) => {
							const yearDiv =
								entry.querySelector('.cv-entry-year') || entry.querySelector('div:first-child');
							const contentDiv =
								entry.querySelector('.cv-entry-content') || entry.querySelector('div.flex-1');

							if (yearDiv && contentDiv) {
								const year = yearDiv.textContent?.trim() || '';
								layout.renderLedgerEntry(year, contentDiv, yearColumnWidth);
							}
						});
						break;
					}
					if (nextElement.tagName === 'H4') break; // Stop at next subsection
					nextElement = nextElement.nextElementSibling;
				}
			});
		} else {
			// No subsections - handle items directly
			// Add extra spacing to match sections with subsections
			layout.y += SPACING.SUBSECTION_TOP;

			// First check for flex layout entries - CVEntry uses .cv-entry, some use .flex.gap-4
			const flexEntries = section.querySelectorAll('.cv-entry, .flex.gap-4');
			if (flexEntries.length > 0) {
				flexEntries.forEach((entry) => {
					// Check for language badge layout (Languages section)
					const languageBadge = entry.querySelector('.language-badge');
					if (languageBadge) {
						const languageName = entry.querySelector('div.flex-1')?.textContent?.trim() || '';
						const proficiency = languageBadge.textContent?.trim() || '';

						if (languageName) {
							layout.checkPageBreak(SPACING.LINE_HEIGHT + SPACING.ENTRY_GAP);
							pdf.setFontSize(FONT_SIZE.BODY);
							pdf.setFont(DISPLAY, 'bold');
							pdf.setTextColor(...COLORS.PRIMARY);
							pdf.text(languageName, margin + 2, layout.y);
							pdf.setTextColor(...COLORS.TEXT);

							pdf.setFont(SERIF, 'normal');
							pdf.text(proficiency, margin + yearColumnWidth, layout.y);
							layout.y += SPACING.LINE_HEIGHT + SPACING.ENTRY_GAP;
						}
						return; // Skip to next entry
					}

					// Check for year column - CVEntry uses .cv-entry-year/.cv-entry-content
					const firstDiv =
						entry.querySelector('.cv-entry-year') || entry.querySelector('div:first-child');
					const contentDiv =
						entry.querySelector('.cv-entry-content') ||
						entry.querySelector('div.flex-1, div:last-child');

					if (firstDiv && contentDiv) {
						const hasYearColumn =
							firstDiv.classList.contains('cv-entry-year') ||
							firstDiv.classList.contains('text-nowrap') ||
							firstDiv.classList.contains('w-20') ||
							firstDiv.classList.contains('font-semibold');

						if (hasYearColumn) {
							// Layout with year column
							const year = firstDiv.textContent?.trim() || '';

							// Check if it's a wide column (e.g. Computer Skills w-60)
							const isWideColumn = firstDiv.classList.contains('w-60');
							const currentColumnWidth = isWideColumn ? 65 : yearColumnWidth;

							layout.renderLedgerEntry(year, contentDiv, currentColumnWidth);
						} else {
							// Layout without year column (Languages, Computer Skills, etc.)
							const label = firstDiv.textContent?.trim() || '';
							const valueFragments = trimFragments(extractRichText(contentDiv));

							if (label || valueFragments.length > 0) {
								pdf.setFontSize(FONT_SIZE.BODY);
								pdf.setFont(DISPLAY, 'bold');
								pdf.setTextColor(...COLORS.PRIMARY);

								// Render Label
								const labelLines = pdf.splitTextToSize(label, yearColumnWidth);
								labelLines.forEach((line: string, index: number) => {
									pdf.text(line, margin + 2, layout.y + index * SPACING.LINE_HEIGHT_TIGHT);
								});

								const labelHeight = labelLines.length * SPACING.LINE_HEIGHT_TIGHT;
								pdf.setTextColor(...COLORS.TEXT);

								// Render Value (Rich Text)
								let valueHeight = 0;
								if (valueFragments.length > 0) {
									valueHeight = measureRichTextHeight(
										pdf,
										valueFragments,
										contentWidth - yearColumnWidth,
										FONT_SIZE.BODY,
										SPACING.LINE_HEIGHT_TIGHT
									);

									layout.checkPageBreak(Math.max(labelHeight, valueHeight) + SPACING.ENTRY_GAP);

									renderRichText(
										pdf,
										valueFragments,
										margin + yearColumnWidth,
										layout.y,
										contentWidth - yearColumnWidth,
										FONT_SIZE.BODY,
										SPACING.LINE_HEIGHT_TIGHT
									);
								}

								layout.y += Math.max(labelHeight, valueHeight) + SPACING.SUBSECTION_TOP;
							}
						}
					}
				});
			} else {
				// Fallback: handle simple paragraph content (for sections like Fieldwork)
				const paragraphs = section.querySelectorAll('p:not(.text-light)');
				const divs = section.querySelectorAll('div:not(.space-y-3):not(.flex):not(.cv-entry)');

				const contentElements = paragraphs.length > 0 ? paragraphs : divs;
				pdf.setTextColor(...COLORS.TEXT); // Ensure text color is reset for fallback content
				contentElements.forEach((elem) => {
					// Clone and remove lists to avoid duplication (lists are handled separately below)
					const clone = elem.cloneNode(true) as HTMLElement;
					clone.querySelectorAll('ul, ol').forEach((list) => list.remove());
					const fragments = trimFragments(extractRichText(clone));
					const totalText = fragments.map((f) => f.text).join('');

					if (totalText && !totalText.includes('No ') && totalText.length > 5) {
						const height = measureRichTextHeight(
							pdf,
							fragments,
							contentWidth - 5,
							FONT_SIZE.BODY,
							SPACING.LINE_HEIGHT
						);

						layout.checkPageBreak(height + SPACING.LINE_HEIGHT); // ensure space

						layout.y = renderRichText(
							pdf,
							fragments,
							margin + 3,
							layout.y,
							contentWidth - 5,
							FONT_SIZE.BODY,
							SPACING.LINE_HEIGHT,
							SERIF,
							COLORS.PRIMARY,
							COLORS.TEXT
						);
						layout.y += SPACING.SUBSECTION_TOP;
					}
				});

				// Also check for list items (nested ul in affiliations, etc.)
				const items = section.querySelectorAll('li');
				items.forEach((item) => {
					const fragments = trimFragments(extractRichText(item));
					if (fragments.length > 0) {
						// Add bullet point
						const bulletFragments: TextFragment[] = [{ text: '• ', style: 'normal' }, ...fragments];

						const height = measureRichTextHeight(
							pdf,
							bulletFragments,
							contentWidth - 10,
							FONT_SIZE.BODY_SMALL,
							SPACING.LINE_HEIGHT_TIGHT
						);

						layout.checkPageBreak(height + 1);

						layout.y = renderRichText(
							pdf,
							bulletFragments,
							margin + 8,
							layout.y,
							contentWidth - 10,
							FONT_SIZE.BODY_SMALL,
							SPACING.LINE_HEIGHT_TIGHT
						);
						layout.y += 1;
					}
				});
			}
		}
	});

	// Add page number to the last page
	layout.addPageNumber();

	pdf.save(filename);
}
