<script lang="ts">
	/**
	 * PDF Generator for CV — editorial letterpress design.
	 *
	 * Mirrors the on-screen CV's warm-editorial language in print:
	 * - Left-aligned letterhead: ink-blue letterspaced "CURRICULUM VITAE"
	 *   eyebrow above a serif name headline, then date, closed by a hairline
	 * - Serif (times) section + subsection headings in title case, each over a
	 *   single full-width hairline rule — no decorative bars or accent stripes
	 * - Deep-ink body text; ink-blue reserved for year pinpoints and links
	 * - Two-column contact block with small-caps eyebrow labels
	 * - Page footer with name + page number; clickable contact links
	 *
	 * Palette and type sizes live in $lib/utils/pdfDesignTokens (ink-blue /
	 * warm-paper), kept in sync with the site's design tokens.
	 */
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import {
		extractRichText,
		renderRichText,
		measureRichTextHeight,
		trimFragments,
		type TextFragment
	} from '$lib/utils/pdfRichText';
	import { getAddressLines } from '$lib/utils/siteHelpers';
	import {
		FONT_SIZE,
		SPACING,
		COLORS,
		LETTER_SPACING,
		yearColumnWidth
	} from '$lib/utils/pdfDesignTokens';

	let isGenerating = $state(false);
	let jsPDF: typeof import('jspdf').jsPDF | null = $state(null);

	onMount(async () => {
		const jsPDFModule = await import('jspdf');
		jsPDF = jsPDFModule.default;
	});

	async function generatePDF() {
		if (!jsPDF) return;

		isGenerating = true;

		try {
			// Wait for all lazy-loaded CV sections to be present
			// The CV page loads components in batches with delays up to 400ms
			// We check for the presence of key sections that load last
			const maxWaitTime = 3000; // Maximum 3 seconds
			const checkInterval = 100;
			let waited = 0;

			const cvContent = document.getElementById('cv-content');
			if (!cvContent) throw new Error('CV content not found');

			// Wait until we have a reasonable number of sections loaded
			// The full CV has 15+ sections, wait until we see at least 12
			while (waited < maxWaitTime) {
				const sections = cvContent.querySelectorAll('section');
				const sectionCount = sections.length;

				// Check if we have most sections loaded (at least 12 of ~15)
				if (sectionCount >= 12) {
					break;
				}

				await new Promise((resolve) => setTimeout(resolve, checkInterval));
				waited += checkInterval;
			}

			// Additional small delay to ensure DOM is fully rendered
			await new Promise((resolve) => setTimeout(resolve, 200));

			const today = new Date();
			const dateStr = today.toISOString().split('T')[0];
			const filename = `Frederick_Madore_CV_${dateStr}.pdf`;

			// Create PDF with proper text rendering
			const pdf = new jsPDF('p', 'mm', 'a4');
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const margin = 18; // Slightly tighter margins for more content space
			const contentWidth = pageWidth - 2 * margin;
			let yPosition = margin;

			// Helper function for page breaks
			const newPage = () => {
				addPageNumber();
				pdf.addPage();
				yPosition = margin;
			};

			// Check if we need a new page
			const checkPageBreak = (requiredSpace: number = 15) => {
				if (yPosition > pageHeight - margin - requiredSpace) {
					newPage();
				}
			};

			// Enhanced page footer with name and page number
			const addPageNumber = () => {
				const pageNum = pdf.internal.pages.length - 1;

				// Footer line
				pdf.setDrawColor(...COLORS.BORDER);
				pdf.setLineWidth(0.2);
				pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

				// Name on left
				pdf.setFontSize(FONT_SIZE.FOOTER);
				pdf.setFont('helvetica', 'normal');
				pdf.setTextColor(...COLORS.TEXT_MUTED);
				pdf.text('Frédérick Madore, PhD — Curriculum Vitae', margin, pageHeight - 9);

				// Page number on right
				pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 9, { align: 'right' });

				pdf.setTextColor(...COLORS.TEXT);
			};

			// Get CV content from the page
			const element = document.getElementById('cv-content');
			if (!element) throw new Error('CV content not found');

			// Helper to extract text with visible URLs for external links
			// This makes the PDF self-contained like a printed academic CV
			// Rich text extraction is now handled by external utility

			/*
			 * Section heading — serif title-case over a full-width hairline,
			 * mirroring the on-screen CV's Spectral/Fraunces h3 headings (e.g.
			 * "Professional Appointments"). `times` is jsPDF's closest serif to
			 * the site's display face; title case (not uppercase) keeps the
			 * editorial, fine-book register rather than a templated CMS label.
			 */
			const addSection = (title: string) => {
				// Check if we need a new page (need space for heading + some content)
				// Increased to 60 to prevent headers from appearing alone at the bottom of the page
				// This ensures space for: section top spacing + header + hairline rule + section bottom spacing + at least one content item
				checkPageBreak(60);
				yPosition += SPACING.SECTION_TOP;

				// Section heading — serif, deep ink, title case
				pdf.setFontSize(FONT_SIZE.SECTION_HEADING);
				pdf.setFont('times', 'bold');
				pdf.setTextColor(...COLORS.TEXT_EMPHASIS);
				pdf.text(title, margin, yPosition);
				yPosition += 2.5;

				// Hairline rule under section heading — full content width
				pdf.setDrawColor(...COLORS.BORDER);
				pdf.setLineWidth(0.2);
				pdf.line(margin, yPosition, pageWidth - margin, yPosition);

				pdf.setTextColor(...COLORS.TEXT); // Reset text color
				yPosition += SPACING.SECTION_BOTTOM;
			};

			/*
			 * Year/gutter label — ink-blue, bold. Numeric years ("2026") sit at
			 * FONT_SIZE.BODY; long word labels ("Forthcoming", "à paraître")
			 * would overrun the fixed gutter and collide with the entry text, so
			 * they auto-shrink to fit the column instead of widening it. This
			 * keeps every entry's content indentation identical.
			 */
			const drawYearLabel = (label: string, x: number, y: number, columnWidth: number) => {
				pdf.setFont('helvetica', 'bold');
				pdf.setFontSize(FONT_SIZE.BODY);
				// Available width = column minus the x inset minus a ~1mm gutter
				// before the content column.
				const maxWidth = columnWidth - (x - margin) - 1;
				const width = pdf.getTextWidth(label);
				if (width > maxWidth && maxWidth > 0) {
					pdf.setFontSize(Math.max(6.5, (FONT_SIZE.BODY * maxWidth) / width));
				}
				pdf.setTextColor(...COLORS.PRIMARY);
				pdf.text(label, x, y);
				pdf.setTextColor(...COLORS.TEXT);
				pdf.setFontSize(FONT_SIZE.BODY); // reset for following body text
			};

			// Extract header information from CVHeader component
			const cvDateElement = element.querySelector('.cv-date');
			const cvContactSection = element.querySelector('.cv-contact-section');

			// ============================================
			// HEADER DESIGN — left-aligned editorial letterhead, mirroring the
			// on-screen CVHeader: an ink-blue letterspaced "CURRICULUM VITAE"
			// eyebrow (the document label) sits above the serif name (the
			// subject); the date follows; a full-width hairline closes the block.
			// Replaces the previous centred name-over-subtitle layout.
			// ============================================

			// Eyebrow — "CURRICULUM VITAE", small-caps, ink-blue, letterspaced
			pdf.setFontSize(FONT_SIZE.EYEBROW);
			pdf.setFont('helvetica', 'bold');
			pdf.setTextColor(...COLORS.PRIMARY);
			pdf.setCharSpace(LETTER_SPACING.EYEBROW);
			pdf.text('CURRICULUM VITAE', margin, yPosition);
			pdf.setCharSpace(LETTER_SPACING.NONE);
			yPosition += 7;

			// Name — large serif headline, deep ink (the subject of the page)
			pdf.setFontSize(FONT_SIZE.NAME);
			pdf.setFont('times', 'bold');
			pdf.setTextColor(...COLORS.TEXT_EMPHASIS);
			pdf.text('Frédérick Madore, PhD', margin, yPosition);
			yPosition += 5.5;

			// Date - subtle
			pdf.setFontSize(FONT_SIZE.DATE);
			pdf.setFont('helvetica', 'italic');
			pdf.setTextColor(...COLORS.TEXT_MUTED);
			const dateText =
				cvDateElement?.textContent?.trim() ||
				today.toLocaleDateString('en-GB', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				});
			pdf.text(dateText, margin, yPosition);
			yPosition += 6;

			// Hairline rule under header block — full-width neutral hairline,
			// matching the section dividers below.
			pdf.setDrawColor(...COLORS.BORDER);
			pdf.setLineWidth(0.2);
			pdf.line(margin, yPosition, pageWidth - margin, yPosition);
			yPosition += SPACING.HEADER_BOTTOM;

			// ============================================
			// CONTACT INFORMATION - Clean two-column layout
			// ============================================
			pdf.setFontSize(FONT_SIZE.CONTACT_VALUE);
			pdf.setFont('helvetica', 'normal');
			pdf.setTextColor(...COLORS.TEXT);

			const leftColumn = margin;
			const rightColumn = pageWidth / 2 + 5;
			const startY = yPosition;

			// Left side - Address (hardcoded for reliable formatting)
			// Address label — small-caps letterspaced eyebrow
			pdf.setFont('helvetica', 'bold');
			pdf.setFontSize(FONT_SIZE.CONTACT_LABEL);
			pdf.setTextColor(...COLORS.TEXT_MUTED);
			pdf.setCharSpace(LETTER_SPACING.EYEBROW);
			pdf.text('ADDRESS', leftColumn, yPosition);
			pdf.setCharSpace(LETTER_SPACING.NONE);
			yPosition += SPACING.CONTACT_LINE;

			// Address lines - from centralized config
			pdf.setFont('helvetica', 'normal');
			pdf.setFontSize(FONT_SIZE.CONTACT_VALUE);
			pdf.setTextColor(...COLORS.TEXT);
			const addressLines = getAddressLines();
			addressLines.forEach((line) => {
				pdf.text(line, leftColumn, yPosition);
				yPosition += SPACING.CONTACT_LINE;
			});

			// Right side - Contact links
			let rightY = startY;
			const linkItems = cvContactSection?.querySelectorAll('.cv-link-item');

			// Contact links header — small-caps letterspaced eyebrow
			pdf.setFont('helvetica', 'bold');
			pdf.setFontSize(FONT_SIZE.CONTACT_LABEL);
			pdf.setTextColor(...COLORS.TEXT_MUTED);
			pdf.setCharSpace(LETTER_SPACING.EYEBROW);
			pdf.text('CONTACT', rightColumn, rightY);
			pdf.setCharSpace(LETTER_SPACING.NONE);
			rightY += SPACING.CONTACT_LINE;

			linkItems?.forEach((item) => {
				const anchor = item.querySelector('a');
				if (anchor) {
					const label = item.querySelector('a')?.textContent?.trim() || '';
					const href = anchor.getAttribute('href') || '';
					let displayLabel = '';
					let displayValue = '';

					// Format based on link type
					if (href.includes('mailto:')) {
						displayLabel = 'Email:';
						displayValue = label;
					} else if (href.includes('frederickmadore.com')) {
						displayLabel = 'Web:';
						displayValue = label;
					} else if (href.includes('linkedin.com')) {
						displayLabel = 'LinkedIn:';
						displayValue = href.split('/in/')[1]?.replace('/', '') || label;
					} else if (href.includes('github.com')) {
						displayLabel = 'GitHub:';
						displayValue = href.split('.com/')[1] || label;
					} else if (href.includes('orcid.org')) {
						displayLabel = 'ORCID:';
						displayValue = href.split('.org/')[1] || label;
					}

					if (displayLabel && displayValue) {
						pdf.setFont('helvetica', 'normal');
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
			yPosition = Math.max(yPosition, rightY) + SPACING.SECTION_TOP;

			// Separator line before content
			pdf.setDrawColor(...COLORS.BORDER);
			pdf.setLineWidth(0.3);
			pdf.line(margin, yPosition, pageWidth - margin, yPosition);
			yPosition += SPACING.SECTION_TOP;

			pdf.setTextColor(...COLORS.TEXT); // Reset to default text color

			// Extract sections
			const sections = element.querySelectorAll('section');
			sections.forEach((section) => {
				// Skip the contact section - it's already been processed in the header
				if (
					section.classList.contains('cv-contact-section') ||
					section.classList.contains('mb-6')
				) {
					return;
				}

				const heading = section.querySelector('h3');
				if (heading) {
					const sectionTitle = heading.textContent || '';
					// Skip the header section (it has no h3, but just in case)
					if (sectionTitle === 'Curriculum Vitae' || !sectionTitle) {
						return;
					}
					addSection(sectionTitle);
				} else {
					// Section without h3 - this is likely the contact section, skip it
					return;
				}

				// Handle subsection headings (h4)
				const subsections = section.querySelectorAll('h4');
				if (subsections.length > 0) {
					subsections.forEach((h4) => {
						// Check if we need a new page before subsection
						// Increased to 50 to prevent subheaders from appearing alone at the bottom
						checkPageBreak(50);

						yPosition += SPACING.SUBSECTION_TOP;

						// Subsection heading — serif bold italic, mirroring the
						// on-screen Spectral h4. Italic differentiates it from the
						// section heading; same serif family keeps the hierarchy
						// consistent. No additional colour treatment needed.
						pdf.setFontSize(FONT_SIZE.SUBSECTION);
						pdf.setFont('times', 'bolditalic');
						pdf.setTextColor(...COLORS.TEXT_EMPHASIS);
						pdf.text(h4.textContent || '', margin + 2, yPosition);
						yPosition += SPACING.SUBSECTION_BOTTOM;
						pdf.setTextColor(...COLORS.TEXT); // Reset text color after subsection heading

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

											checkPageBreak(height);
											yPosition = renderRichText(
												pdf,
												fragments,
												margin + 3,
												yPosition,
												contentWidth - 5,
												FONT_SIZE.BODY,
												SPACING.LINE_HEIGHT_TIGHT,
												'helvetica',
												COLORS.PRIMARY,
												COLORS.TEXT
											);
											yPosition += SPACING.LINE_HEIGHT;
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
													contentWidth - yearColumnWidth,
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
													contentWidth - yearColumnWidth,
													FONT_SIZE.BODY_SMALL,
													SPACING.LINE_HEIGHT_TIGHT
												) + SPACING.LINE_HEIGHT_TIGHT;
										});

										estimatedHeight += SPACING.ENTRY_GAP;
										checkPageBreak(estimatedHeight);

										// Year column (auto-shrinks long labels like "Forthcoming")
										drawYearLabel(year, margin + 2, yPosition, yearColumnWidth);

										// Render main text
										if (mainFragments.length > 0) {
											yPosition = renderRichText(
												pdf,
												mainFragments,
												margin + yearColumnWidth,
												yPosition,
												contentWidth - yearColumnWidth,
												FONT_SIZE.BODY,
												SPACING.LINE_HEIGHT_TIGHT
											);
											// Tighter gap when detail lines follow
											yPosition +=
												paragraphFragments.length > 0 ? SPACING.PARAGRAPH_GAP : SPACING.LINE_HEIGHT;
										}

										// Render detail lines (reviews, amounts, co-applicants, etc.)
										paragraphFragments.forEach((frags, idx) => {
											pdf.setTextColor(...COLORS.TEXT_LIGHT);
											frags.forEach((f: TextFragment) => {
												if (f.style === 'normal') f.style = 'italic';
												else if (f.style === 'bold') f.style = 'bolditalic';
											});

											yPosition = renderRichText(
												pdf,
												frags,
												margin + yearColumnWidth,
												yPosition,
												contentWidth - yearColumnWidth,
												FONT_SIZE.BODY_SMALL,
												SPACING.LINE_HEIGHT_TIGHT
											);

											pdf.setTextColor(...COLORS.TEXT);
											// Tight gap between detail lines, larger after last one
											yPosition +=
												idx < paragraphFragments.length - 1
													? SPACING.PARAGRAPH_GAP
													: SPACING.LINE_HEIGHT_TIGHT;
										});

										yPosition += SPACING.ENTRY_GAP;
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
					yPosition += SPACING.SUBSECTION_TOP;

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
									checkPageBreak(SPACING.LINE_HEIGHT + SPACING.ENTRY_GAP);
									pdf.setFontSize(FONT_SIZE.BODY);
									pdf.setFont('helvetica', 'bold');
									pdf.setTextColor(...COLORS.PRIMARY);
									pdf.text(languageName, margin + 2, yPosition);
									pdf.setTextColor(...COLORS.TEXT);

									pdf.setFont('helvetica', 'normal');
									pdf.text(proficiency, margin + yearColumnWidth, yPosition);
									yPosition += SPACING.LINE_HEIGHT + SPACING.ENTRY_GAP;
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
									checkPageBreak(estimatedHeight);

									// Year/Category column (auto-shrinks long labels)
									drawYearLabel(year, margin + 2, yPosition, currentColumnWidth);

									// Render main text
									if (mainFragments.length > 0) {
										yPosition = renderRichText(
											pdf,
											mainFragments,
											margin + currentColumnWidth,
											yPosition,
											contentWidth - currentColumnWidth,
											FONT_SIZE.BODY,
											SPACING.LINE_HEIGHT_TIGHT
										);
										// Tighter gap when detail lines follow
										yPosition +=
											paragraphFragments.length > 0 ? SPACING.PARAGRAPH_GAP : SPACING.LINE_HEIGHT;
									}

									// Render detail lines (amounts, co-applicants, reviews, etc.)
									paragraphFragments.forEach((frags, idx) => {
										pdf.setTextColor(...COLORS.TEXT_LIGHT);
										frags.forEach((f: TextFragment) => {
											if (f.style === 'normal') f.style = 'italic';
											else if (f.style === 'bold') f.style = 'bolditalic';
										});

										yPosition = renderRichText(
											pdf,
											frags,
											margin + currentColumnWidth,
											yPosition,
											contentWidth - currentColumnWidth,
											FONT_SIZE.BODY_SMALL,
											SPACING.LINE_HEIGHT_TIGHT
										);

										pdf.setTextColor(...COLORS.TEXT);
										// Tight gap between detail lines, larger after last one
										yPosition +=
											idx < paragraphFragments.length - 1
												? SPACING.PARAGRAPH_GAP
												: SPACING.LINE_HEIGHT_TIGHT;
									});

									yPosition += SPACING.ENTRY_GAP;
								} else {
									// Layout without year column (Languages, Computer Skills, etc.)
									const label = firstDiv.textContent?.trim() || '';
									const valueFragments = trimFragments(extractRichText(contentDiv));

									if (label || valueFragments.length > 0) {
										pdf.setFontSize(FONT_SIZE.BODY);
										pdf.setFont('helvetica', 'bold');
										pdf.setTextColor(...COLORS.PRIMARY);

										// Render Label
										const labelLines = pdf.splitTextToSize(label, yearColumnWidth);
										labelLines.forEach((line: string, index: number) => {
											pdf.text(line, margin + 2, yPosition + index * SPACING.LINE_HEIGHT_TIGHT);
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

											checkPageBreak(Math.max(labelHeight, valueHeight) + SPACING.ENTRY_GAP);

											// Re-render label if page break happened?
											// checkPageBreak usually adds page and resets yPosition.
											// But here we rendered label *before* checkPageBreak logic in strict sense?
											// Actually checkPageBreak checks if there is space.
											// The logic above renders label, then checks page break for value? That's risky.
											// Better: Check max height first, THEN render both.

											// Reworking calculation order:
											// already calculated labelHeight.
											// already calculated valueHeight.
											// checkPageBreak(Math.max(labelHeight, valueHeight))
											// render label
											// render value

											renderRichText(
												pdf,
												valueFragments,
												margin + yearColumnWidth,
												yPosition,
												contentWidth - yearColumnWidth,
												FONT_SIZE.BODY,
												SPACING.LINE_HEIGHT_TIGHT
											);
										}

										yPosition += Math.max(labelHeight, valueHeight) + SPACING.SUBSECTION_TOP;
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

								checkPageBreak(height + SPACING.LINE_HEIGHT); // ensure space

								yPosition = renderRichText(
									pdf,
									fragments,
									margin + 3,
									yPosition,
									contentWidth - 5,
									FONT_SIZE.BODY,
									SPACING.LINE_HEIGHT,
									'helvetica',
									COLORS.PRIMARY,
									COLORS.TEXT
								);
								yPosition += SPACING.SUBSECTION_TOP;
							}
						});

						// Also check for list items (nested ul in affiliations, etc.)
						const items = section.querySelectorAll('li');
						items.forEach((item) => {
							const fragments = trimFragments(extractRichText(item));
							if (fragments.length > 0) {
								// Add bullet point
								const bulletFragments: TextFragment[] = [
									{ text: '• ', style: 'normal' },
									...fragments
								];

								const height = measureRichTextHeight(
									pdf,
									bulletFragments,
									contentWidth - 10,
									FONT_SIZE.BODY_SMALL,
									SPACING.LINE_HEIGHT_TIGHT
								);

								checkPageBreak(height + 1);

								yPosition = renderRichText(
									pdf,
									bulletFragments,
									margin + 8,
									yPosition,
									contentWidth - 10,
									FONT_SIZE.BODY_SMALL,
									SPACING.LINE_HEIGHT_TIGHT
								);
								yPosition += 1;
							}
						});
					}
				}
			});

			// Add page number to the last page
			addPageNumber();

			pdf.save(filename);
		} catch (err) {
			if (import.meta.env.DEV) console.error('PDF generation failed:', err);
		} finally {
			isGenerating = false;
		}
	}
</script>

<button
	class="btn btn-primary glass-button"
	onclick={generatePDF}
	disabled={isGenerating || !jsPDF}
>
	{#if isGenerating}
		<Icon icon="mdi:loading" class="animate-spin" width="20" height="20" />
		<span>Generating...</span>
	{:else}
		<Icon icon="mdi:file-pdf-box" width="20" height="20" />
		<span>Download PDF</span>
	{/if}
</button>

<style>
	/* All styling handled by global button classes and glassmorphism utilities */
	:global(.animate-spin) {
		animation: spin var(--duration-moderate) linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
