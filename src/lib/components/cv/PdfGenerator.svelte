<script lang="ts">
	/**
	 * PDF Generator for CV - Enhanced Design v2.0
	 *
	 * This component generates a professionally designed PDF CV with:
	 * - Modern typography with clear hierarchy
	 * - Elegant header with decorative elements
	 * - Consistent spacing based on design system
	 * - Subtle visual accents and dividers
	 * - Proper page numbering with header/footer
	 * - Clickable links for contact info
	 *
	 * Design improvements:
	 * - Refined color palette matching website's academic blue theme
	 * - Better visual hierarchy with improved font sizes
	 * - Professional header design with name prominence
	 * - Decorative accent lines and section dividers
	 * - Improved contact section with icons simulation
	 * - Better spacing rhythm throughout
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

	let isGenerating = $state(false);
	let jsPDF: any = $state(null);

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

			// Enhanced typography constants - refined for better readability
			const FONT_SIZE = {
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
			};

			// Refined spacing system - better visual rhythm
			const SPACING = {
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
			};

			// Refined color palette - matching website's academic theme
			const COLORS = {
				PRIMARY: [29, 78, 216] as [number, number, number], // #1d4ed8 - Academic blue
				PRIMARY_DARK: [30, 58, 138] as [number, number, number], // #1e3a8a - Darker blue
				ACCENT: [20, 184, 166] as [number, number, number], // #14b8a6 - Teal accent
				TEXT: [30, 41, 59] as [number, number, number], // #1e293b - Main text
				TEXT_LIGHT: [100, 116, 139] as [number, number, number], // #64748b - Secondary text
				TEXT_MUTED: [148, 163, 184] as [number, number, number], // #94a3b8 - Muted text
				BORDER: [226, 232, 240] as [number, number, number], // #e2e8f0 - Subtle borders
				BACKGROUND_LIGHT: [248, 250, 252] as [number, number, number] // #f8fafc - Light bg
			};

			// Layout constants
			const yearColumnWidth = 24; // Slightly narrower year column
			let currentPage = 1;

			// Helper function for page breaks
			const newPage = () => {
				addPageNumber();
				pdf.addPage();
				currentPage++;
				yPosition = margin;
			};

			// Check if we need a new page
			const checkPageBreak = (requiredSpace: number = 15) => {
				if (yPosition > pageHeight - margin - requiredSpace) {
					newPage();
				}
			};

			// Helper to add text with word wrap
			const addText = (
				text: string,
				fontSize: number,
				isBold: boolean = false,
				font: 'helvetica' | 'times' = 'helvetica'
			) => {
				pdf.setFontSize(fontSize);
				pdf.setFont(font, isBold ? 'bold' : 'normal');
				const lines = pdf.splitTextToSize(text, contentWidth);

				lines.forEach((line: string) => {
					checkPageBreak(10);
					pdf.text(line, margin, yPosition);
					yPosition += fontSize * 0.5;
				});
				yPosition += SPACING.ENTRY_GAP;
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
				pdf.text('Frédérick Madore — CV', margin, pageHeight - 9);

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

			// Enhanced section heading with better styling
			const addSection = (title: string) => {
				// Check if we need a new page (need space for heading + some content)
				// Increased to 60 to prevent headers from appearing alone at the bottom of the page
				// This ensures space for: section top spacing + header + decorative lines + section bottom spacing + at least one content item
				checkPageBreak(60);
				yPosition += SPACING.SECTION_TOP;

				// Section heading with uppercase styling
				pdf.setFontSize(FONT_SIZE.SECTION_HEADING);
				pdf.setFont('helvetica', 'bold');
				pdf.setTextColor(...COLORS.PRIMARY);
				pdf.text(title.toUpperCase(), margin, yPosition);
				yPosition += 2;

				// Gradient-style accent line (thick accent color)
				pdf.setDrawColor(...COLORS.ACCENT);
				pdf.setLineWidth(0.8);
				pdf.line(margin, yPosition, margin + 20, yPosition);
				// Fade out with thinner line
				pdf.setLineWidth(0.3);
				pdf.setDrawColor(...COLORS.BORDER);
				pdf.line(margin + 20, yPosition, margin + 45, yPosition);

				pdf.setTextColor(...COLORS.TEXT); // Reset text color
				yPosition += SPACING.SECTION_BOTTOM;
			};

			// Extract header information from CVHeader component
			const cvDateElement = element.querySelector('.cv-date');
			const cvContactSection = element.querySelector('.cv-contact-section');

			// ============================================
			// HEADER DESIGN - Modern, professional layout
			// ============================================

			// Name - Large, prominent, the focal point (starts first, line comes after)
			pdf.setFontSize(FONT_SIZE.NAME);
			pdf.setFont('times', 'bold');
			pdf.setTextColor(...COLORS.PRIMARY_DARK);
			pdf.text('Frédérick Madore, PhD', pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 7;

			// Subtitle - "Curriculum Vitae"
			pdf.setFontSize(FONT_SIZE.TITLE);
			pdf.setFont('helvetica', 'normal');
			pdf.setTextColor(...COLORS.TEXT_LIGHT);
			pdf.text('Curriculum Vitae', pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 5;

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
			pdf.text(dateText, pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 6;

			// Decorative divider line under header
			pdf.setDrawColor(...COLORS.ACCENT);
			pdf.setLineWidth(0.6);
			const dividerWidth = 50;
			pdf.line(
				pageWidth / 2 - dividerWidth / 2,
				yPosition,
				pageWidth / 2 + dividerWidth / 2,
				yPosition
			);
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
			// Address label
			pdf.setFont('helvetica', 'bold');
			pdf.setFontSize(FONT_SIZE.CONTACT_LABEL);
			pdf.setTextColor(...COLORS.PRIMARY);
			pdf.text('Address', leftColumn, yPosition);
			yPosition += SPACING.CONTACT_LINE;

			// Address lines - hardcoded for reliable multi-line display
			pdf.setFont('helvetica', 'normal');
			pdf.setFontSize(FONT_SIZE.CONTACT_VALUE);
			pdf.setTextColor(...COLORS.TEXT);
			const addressLines = [
				'Leibniz-Zentrum Moderner Orient',
				'Kirchweg 33',
				'14129 Berlin',
				'Germany'
			];
			addressLines.forEach((line) => {
				pdf.text(line, leftColumn, yPosition);
				yPosition += SPACING.CONTACT_LINE;
			});

			// Right side - Contact links
			let rightY = startY;
			const linkItems = cvContactSection?.querySelectorAll('.cv-link-item');

			// Contact links header
			pdf.setFont('helvetica', 'bold');
			pdf.setFontSize(FONT_SIZE.CONTACT_LABEL);
			pdf.setTextColor(...COLORS.PRIMARY);
			pdf.text('Contact', rightColumn, rightY);
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

						// Clickable link value
						pdf.setTextColor(...COLORS.ACCENT);
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

						// Subsection heading - italicized for hierarchy
						pdf.setFontSize(FONT_SIZE.SUBSECTION);
						pdf.setFont('helvetica', 'bolditalic');
						pdf.setTextColor(...COLORS.PRIMARY_DARK);
						pdf.text(h4.textContent || '', margin + 2, yPosition);
						yPosition += SPACING.SUBSECTION_BOTTOM;

						// Get the next sibling div with space-y-3 class (flex layout entries)
						let nextElement = h4.nextElementSibling;
						while (nextElement) {
							if (nextElement.tagName === 'DIV' && nextElement.classList.contains('space-y-3')) {
								// Handle flex layout entries
								const entries = nextElement.querySelectorAll('.flex.gap-4');

								// If no flex entries, check for simple div children (e.g., Fieldwork section)
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
												SPACING.LINE_HEIGHT_TIGHT
											);
											yPosition += SPACING.LINE_HEIGHT;
										}
									});
									break;
								}

								entries.forEach((entry) => {
									const yearDiv = entry.querySelector('div:first-child');
									const contentDiv = entry.querySelector('div.flex-1');

									if (yearDiv && contentDiv) {
										const year = yearDiv.textContent?.trim() || '';

										// Get main text and nested paragraphs separately
										const clone = contentDiv.cloneNode(true) as HTMLElement;
										const nestedParagraphs = clone.querySelectorAll('p');

										// Store paragraph fragments
										const paragraphFragments: any[] = [];
										nestedParagraphs.forEach((p) => {
											const fragments = trimFragments(extractRichText(p));
											if (fragments.length > 0) paragraphFragments.push(fragments);
											p.remove();
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

										// Year column
										pdf.setFontSize(FONT_SIZE.BODY);
										pdf.setFont('helvetica', 'bold');
										pdf.setTextColor(...COLORS.PRIMARY);
										pdf.text(year, margin + 2, yPosition);
										pdf.setTextColor(...COLORS.TEXT);

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

											const spacingAfter =
												paragraphFragments.length > 0
													? SPACING.LINE_HEIGHT_TIGHT
													: SPACING.LINE_HEIGHT;
											yPosition += spacingAfter;
										}

										// Render nested paragraphs (reviews, etc) - Force Italic/Gray style
										paragraphFragments.forEach((frags) => {
											pdf.setTextColor(...COLORS.TEXT_LIGHT);
											// Force italic for "Review in..." style paragraphs
											frags.forEach((f: any) => {
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
											yPosition += SPACING.LINE_HEIGHT_TIGHT;
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

					// First check for flex layout entries
					const flexEntries = section.querySelectorAll('.flex.gap-4');
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

							// Check for year column (first div with text-nowrap or w-20 class)
							const firstDiv = entry.querySelector('div:first-child');
							const contentDiv = entry.querySelector('div.flex-1, div:last-child');

							if (firstDiv && contentDiv) {
								const hasYearColumn =
									firstDiv.classList.contains('text-nowrap') ||
									firstDiv.classList.contains('w-20') ||
									firstDiv.classList.contains('font-semibold');

								if (hasYearColumn) {
									// Layout with year column
									const year = firstDiv.textContent?.trim() || '';

									// Check if it's a wide column (e.g. Computer Skills w-60)
									const isWideColumn = firstDiv.classList.contains('w-60');
									const currentColumnWidth = isWideColumn ? 65 : yearColumnWidth;

									// Get main text and nested paragraphs separately
									const clone = contentDiv.cloneNode(true) as HTMLElement;
									const nestedParagraphs = clone.querySelectorAll('p');

									// Store paragraph fragments
									const paragraphFragments: any[] = [];
									nestedParagraphs.forEach((p) => {
										const fragments = trimFragments(extractRichText(p));
										if (fragments.length > 0) paragraphFragments.push(fragments);
										p.remove();
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

									// Year/Category column
									pdf.setFontSize(FONT_SIZE.BODY);
									pdf.setFont('helvetica', 'bold');
									pdf.setTextColor(...COLORS.PRIMARY);
									pdf.text(year, margin + 2, yPosition);
									pdf.setTextColor(...COLORS.TEXT);

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
										yPosition += SPACING.LINE_HEIGHT;
									}

									// Render nested paragraphs
									paragraphFragments.forEach((frags) => {
										pdf.setTextColor(...COLORS.TEXT_LIGHT);
										// Force italic for "Review in..." style paragraphs
										frags.forEach((f: any) => {
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
										yPosition += SPACING.LINE_HEIGHT_TIGHT;
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
						const divs = section.querySelectorAll('div:not(.space-y-3):not(.flex)');

						const contentElements = paragraphs.length > 0 ? paragraphs : divs;
						contentElements.forEach((elem) => {
							const fragments = trimFragments(extractRichText(elem));
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
									SPACING.LINE_HEIGHT
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
			console.error('PDF generation failed:', err);
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
		animation: spin var(--anim-duration-base) linear infinite;
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
