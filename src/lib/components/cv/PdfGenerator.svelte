<script lang="ts">
	/**
	 * PDF Generator for CV
	 * 
	 * This component generates a PDF version of the CV that closely matches the web styling.
	 * All typography and spacing values are aligned with the CSS design system defined in:
	 * - src/styles/base/variables.css (CSS custom properties)
	 * - Typography scale: font sizes, line heights, weights
	 * - Spacing scale: margins, padding, gaps
	 * - Color system: text colors, borders
	 * 
	 * Typography mapping (CSS → PDF):
	 * - Title (h1): text-3xl → 18pt
	 * - Name (h2): text-xl → 14pt
	 * - Section headings (h3): text-2xl → 13pt
	 * - Subsection headings (h4): text-lg → 11pt
	 * - Body text: text-base → 9.5pt
	 * - Small text: text-sm/text-xs → 8.5-9pt
	 * 
	 * Spacing mapping (CSS → PDF mm):
	 * - Section gaps: var(--spacing-6) → 6mm
	 * - Entry gaps: var(--spacing-3) → 3.5mm
	 * - Line height: varies by context (4-5mm)
	 * 
	 * Colors (matching CSS variables):
	 * - Text: #1e293b (var(--color-text))
	 * - Light text: #475569 (var(--color-text-light))
	 * - Borders: #e2e8f0 (var(--color-border))
	 */
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

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
			const today = new Date();
			const dateStr = today.toISOString().split('T')[0];
			const filename = `Frederick_Madore_CV_${dateStr}.pdf`;

			// Create PDF with proper text rendering
			const pdf = new jsPDF('p', 'mm', 'a4');
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const margin = 20;
			const contentWidth = pageWidth - 2 * margin;
			let yPosition = margin;

			// Typography constants matching CSS design system
			// Based on variables.css font sizes and spacing
			const FONT_SIZE = {
				TITLE: 18,           // ~var(--font-size-3xl) for "Curriculum Vitae"
				NAME: 14,            // ~var(--font-size-xl) for name
				DATE: 9,             // ~var(--font-size-xs) for date
				CONTACT: 8.5,        // ~var(--font-size-xs) for contact info
				SECTION_HEADING: 13, // ~var(--font-size-2xl) for h3
				SUBSECTION: 11,      // ~var(--font-size-lg) for h4
				BODY: 9.5,           // ~var(--font-size-base) for body text
				PAGE_NUMBER: 8.5     // ~var(--font-size-xs) for page numbers
			};

			// Spacing constants matching CSS design system
			// Based on variables.css spacing scale (1rem = ~3.5mm in PDF)
			const SPACING = {
				SECTION_TOP: 6,      // ~var(--spacing-6) = 1.5rem = 24px
				SECTION_BOTTOM: 5,   // ~var(--spacing-4) = 1rem = 16px
				SUBSECTION_TOP: 4,   // ~var(--spacing-3) = 0.75rem = 12px - space before subheader
				SUBSECTION_BOTTOM: 5,// ~var(--spacing-4) = 1rem = 16px - increased: space after subheader
				ENTRY_GAP: 3.5,      // ~var(--spacing-3) for space-y-3
				LINE_HEIGHT_BODY: 5, // Standard line height for body text
				LINE_HEIGHT_TIGHT: 4,// Tighter line height for multi-line entries
				CONTACT_GAP: 4       // Gap between contact items
			};

			// Colors matching variables.css
			const COLORS = {
				PRIMARY: [30, 58, 95],    // #1e3a5f
				ACCENT: [8, 145, 178],    // #0891b2
				TEXT: [30, 41, 59],       // #1e293b
				TEXT_LIGHT: [71, 85, 105],// #475569
				BORDER: [226, 232, 240]   // #e2e8f0
			};

			// Layout constants
			const yearColumnWidth = 35; // Width for year column in mm

			// Helper to add text with word wrap
			const addText = (text: string, fontSize: number, isBold: boolean = false, font: 'helvetica' | 'times' = 'helvetica') => {
				pdf.setFontSize(fontSize);
				pdf.setFont(font, isBold ? 'bold' : 'normal');
				const lines = pdf.splitTextToSize(text, contentWidth);
				
				lines.forEach((line: string) => {
					if (yPosition > pageHeight - margin - 10) {
						addPageNumber();
						pdf.addPage();
						yPosition = margin;
					}
					pdf.text(line, margin, yPosition);
					yPosition += fontSize * 0.5;
				});
				yPosition += SPACING.ENTRY_GAP;
			};

			const addPageNumber = () => {
				const pageCount = pdf.internal.pages.length - 1;
				pdf.setFontSize(FONT_SIZE.PAGE_NUMBER);
				pdf.setFont('helvetica', 'normal');
				pdf.setTextColor(...COLORS.TEXT_LIGHT);
				pdf.text(
					`Page ${pageCount}`,
					pageWidth / 2,
					pageHeight - 10,
					{ align: 'center' }
				);
				pdf.setTextColor(...COLORS.TEXT);
			};

			// Get CV content from the page
			const element = document.getElementById('cv-content');
			if (!element) throw new Error('CV content not found');

			const addSection = (title: string) => {
				// Check if we need a new page
				if (yPosition > pageHeight - margin - 30) {
					addPageNumber();
					pdf.addPage();
					yPosition = margin;
				}
				yPosition += SPACING.SECTION_TOP;
				pdf.setFontSize(FONT_SIZE.SECTION_HEADING);
				pdf.setFont('times', 'bold');
				pdf.setTextColor(...COLORS.PRIMARY);
				pdf.text(title, margin, yPosition);
				yPosition += 3;
				
				// Accent line under section heading (matching web style)
				pdf.setDrawColor(...COLORS.ACCENT);
				pdf.setLineWidth(0.5);
				// Draw a short line (approx 13mm / 3rem)
				pdf.line(margin, yPosition, margin + 13, yPosition);
				
				pdf.setTextColor(...COLORS.TEXT); // Reset text color
				yPosition += SPACING.SECTION_BOTTOM;
			};

			// Extract header information from CVHeader component
			const cvDateElement = element.querySelector('.cv-date');
			const cvContactSection = element.querySelector('.cv-contact-section');

			// Title - matches text-3xl font-bold
			pdf.setFontSize(FONT_SIZE.TITLE);
			pdf.setFont('times', 'bold');
			pdf.setTextColor(...COLORS.PRIMARY);
			pdf.text('Curriculum Vitae', pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 8;
			
			// Name - matches text-xl font-semibold
			pdf.setFontSize(FONT_SIZE.NAME);
			pdf.setFont('times', 'bold');
			pdf.text('Frédérick Madore', pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 6;

			// Date from CVHeader - matches text-sm text-light
			pdf.setFontSize(FONT_SIZE.DATE);
			pdf.setFont('helvetica', 'normal');
			pdf.setTextColor(...COLORS.TEXT_LIGHT);
			const dateText = cvDateElement?.textContent?.trim() || today.toLocaleDateString('en-GB', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			pdf.text(dateText, pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 10;

			// Contact Info - matches text-sm text-light
			// Two-column layout: Left (Address) | Right (Contact links)
			pdf.setFontSize(FONT_SIZE.CONTACT);
			pdf.setFont('helvetica', 'normal');
			pdf.setTextColor(...COLORS.TEXT_LIGHT);
			
			const leftColumn = margin;
			const rightColumn = pageWidth / 2 + 10;
			const startY = yPosition;
			
			// Left side - Address (extract from DOM)
			const addressDiv = cvContactSection?.querySelector('.cv-contact-group div:last-child');
			if (addressDiv) {
				const addressLines = addressDiv.innerHTML.split('<br>').map(line => 
					line.trim().replace(/<[^>]*>/g, '')
				);
				addressLines.forEach((line) => {
					if (line) {
						pdf.text(line, leftColumn, yPosition);
						yPosition += SPACING.CONTACT_GAP;
					}
				});
			}
			
			// Right side - Contact links (extract from DOM)
			let rightY = startY;
			const linkItems = cvContactSection?.querySelectorAll('.cv-link-item');
			linkItems?.forEach((item) => {
				const anchor = item.querySelector('a');
				if (anchor) {
					const label = item.querySelector('a')?.textContent?.trim() || '';
					const href = anchor.getAttribute('href') || '';
					let displayText = '';
					
					// Format based on link type
					if (href.includes('mailto:')) {
						displayText = `Email: ${label}`;
					} else if (href.includes('frederickmadore.com')) {
						displayText = `Web: ${label}`;
					} else if (href.includes('linkedin.com')) {
						displayText = `LinkedIn: ${href.split('/in/')[1]?.replace('/', '') || label}`;
					} else if (href.includes('github.com')) {
						displayText = `GitHub: ${href.split('.com/')[1] || label}`;
					} else if (href.includes('orcid.org')) {
						displayText = `ORCID: ${href.split('.org/')[1] || label}`;
					}
					
					if (displayText) {
						// Add clickable link
						pdf.setTextColor(...COLORS.ACCENT);
						pdf.textWithLink(displayText, rightColumn, rightY, { url: href });
						pdf.setTextColor(...COLORS.TEXT_LIGHT);
						rightY += SPACING.CONTACT_GAP;
					}
				}
			});
			
			// Move y position to the max of left and right columns + section gap
			yPosition = Math.max(yPosition, rightY) + SPACING.SECTION_TOP;
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
					addSection(sectionTitle);
				} else {
					// Section without h3 - this is likely the contact section, skip it
					return;
				}

				// Handle subsection headings (h4)
				const subsections = section.querySelectorAll('h4');
				if (subsections.length > 0) {
					subsections.forEach((h4) => {
						yPosition += SPACING.SUBSECTION_TOP;
						pdf.setFontSize(FONT_SIZE.SUBSECTION);
						pdf.setFont('times', 'bold');
						pdf.setTextColor(...COLORS.TEXT);
						pdf.text(h4.textContent || '', margin + 3, yPosition);
						yPosition += SPACING.SUBSECTION_BOTTOM;

						// Get the next sibling div with space-y-3 class (flex layout entries)
						let nextElement = h4.nextElementSibling;
						while (nextElement) {
							if (nextElement.tagName === 'DIV' && nextElement.classList.contains('space-y-3')) {
								// Handle flex layout entries
								const entries = nextElement.querySelectorAll('.flex.gap-4');
								entries.forEach((entry) => {
									const yearDiv = entry.querySelector('div:first-child');
									const contentDiv = entry.querySelector('div.flex-1');
									
									if (yearDiv && contentDiv) {
										const year = yearDiv.textContent?.trim() || '';
										
										if (yPosition > pageHeight - margin - 10) {
											addPageNumber();
											pdf.addPage();
											yPosition = margin;
										}
										
										// Year column - matches font-semibold
										pdf.setFontSize(FONT_SIZE.BODY);
										pdf.setFont('helvetica', 'bold');
										pdf.setTextColor(...COLORS.PRIMARY);
										pdf.text(year, margin + 3, yPosition);
										pdf.setTextColor(...COLORS.TEXT);
										
										// Get main text and nested paragraphs separately
										const clone = contentDiv.cloneNode(true) as HTMLElement;
										const nestedParagraphs = clone.querySelectorAll('p');
										
										// Store paragraph texts before removing them
										const paragraphTexts: string[] = [];
										nestedParagraphs.forEach(p => {
											const text = p.textContent?.trim();
											if (text) {
												paragraphTexts.push(text);
											}
											p.remove();
										});
										
										// Get ALL remaining text as one continuous string
										const mainText = clone.textContent?.replace(/\s+/g, ' ').trim() || '';
										
										if (mainText) {
											pdf.setFontSize(FONT_SIZE.BODY);
											pdf.setFont('helvetica', 'normal');
											const lines = pdf.splitTextToSize(mainText, contentWidth - yearColumnWidth);
											lines.forEach((line: string, index: number) => {
												if (index > 0 && yPosition > pageHeight - margin - 10) {
													addPageNumber();
													pdf.addPage();
													yPosition = margin;
												}
												pdf.text(line, margin + yearColumnWidth, yPosition);
												if (index < lines.length - 1) {
													yPosition += SPACING.LINE_HEIGHT_TIGHT;
												}
											});
											yPosition += SPACING.LINE_HEIGHT_BODY;
										}
										
										// Add nested paragraphs (dissertation, details) on separate lines
										paragraphTexts.forEach((text, idx) => {
											pdf.setFontSize(FONT_SIZE.BODY - 0.5);
											pdf.setFont('helvetica', 'normal');
											const lines = pdf.splitTextToSize(text, contentWidth - yearColumnWidth);
											lines.forEach((line: string, index: number) => {
												if (yPosition > pageHeight - margin - 10) {
													addPageNumber();
													pdf.addPage();
													yPosition = margin;
												}
												pdf.text(line, margin + yearColumnWidth, yPosition);
												if (index < lines.length - 1) {
													yPosition += SPACING.LINE_HEIGHT_TIGHT;
												}
											});
											// Add spacing after each paragraph
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
					// First check for flex layout entries
					const flexEntries = section.querySelectorAll('.flex.gap-4');
					if (flexEntries.length > 0) {
						flexEntries.forEach((entry) => {
							// Check for year column (first div with text-nowrap or w-20 class)
							const firstDiv = entry.querySelector('div:first-child');
							const contentDiv = entry.querySelector('div.flex-1, div:last-child');
							
							if (firstDiv && contentDiv) {
								const hasYearColumn = firstDiv.classList.contains('text-nowrap') || 
								                      firstDiv.classList.contains('w-20') ||
								                      firstDiv.classList.contains('font-semibold');
								
								if (yPosition > pageHeight - margin - 15) {
									addPageNumber();
									pdf.addPage();
									yPosition = margin;
								}
								
								if (hasYearColumn) {
									// Layout with year column
									const year = firstDiv.textContent?.trim() || '';
									
									// Check if it's a wide column (e.g. Computer Skills w-60)
									const isWideColumn = firstDiv.classList.contains('w-60');
									const currentColumnWidth = isWideColumn ? 65 : yearColumnWidth;
									
									if (yPosition > pageHeight - margin - 15) {
										addPageNumber();
										pdf.addPage();
										yPosition = margin;
									}
									
									// Year column (or Category label)
									pdf.setFontSize(FONT_SIZE.BODY);
									pdf.setFont('helvetica', 'bold');
									pdf.setTextColor(...COLORS.PRIMARY);
									pdf.text(year, margin + 3, yPosition);
									pdf.setTextColor(...COLORS.TEXT);
									
									// Get main text and nested paragraphs separately
									const clone = contentDiv.cloneNode(true) as HTMLElement;
									const nestedParagraphs = clone.querySelectorAll('p');
									
									// Store paragraph texts before removing them
									const paragraphTexts: string[] = [];
									nestedParagraphs.forEach(p => {
										const text = p.textContent?.trim();
										if (text) {
											paragraphTexts.push(text);
										}
										p.remove();
									});
									
									// Get ALL remaining text as one continuous string
									const mainText = clone.textContent?.replace(/\s+/g, ' ').trim() || '';
									
									if (mainText) {
										pdf.setFontSize(FONT_SIZE.BODY);
										pdf.setFont('helvetica', 'normal');
										const lines = pdf.splitTextToSize(mainText, contentWidth - currentColumnWidth);
										lines.forEach((line: string, index: number) => {
											if (index > 0 && yPosition > pageHeight - margin - 10) {
												addPageNumber();
												pdf.addPage();
												yPosition = margin;
											}
											pdf.text(line, margin + currentColumnWidth, yPosition);
											if (index < lines.length - 1) {
												yPosition += SPACING.LINE_HEIGHT_TIGHT;
											}
										});
										yPosition += SPACING.LINE_HEIGHT_BODY;
									}
									
									// Add nested paragraphs (dissertation, details) on separate lines
									paragraphTexts.forEach((text, idx) => {
										pdf.setFontSize(FONT_SIZE.BODY - 0.5);
										pdf.setFont('helvetica', 'normal');
										const lines = pdf.splitTextToSize(text, contentWidth - currentColumnWidth);
										lines.forEach((line: string, index: number) => {
											if (yPosition > pageHeight - margin - 10) {
												addPageNumber();
												pdf.addPage();
												yPosition = margin;
											}
											pdf.text(line, margin + currentColumnWidth, yPosition);
											if (index < lines.length - 1) {
												yPosition += SPACING.LINE_HEIGHT_TIGHT;
											}
										});
										// Add spacing after each paragraph
										yPosition += SPACING.LINE_HEIGHT_TIGHT;
									});
									
									yPosition += SPACING.ENTRY_GAP;
								} else {
									// Layout without year column (Languages, Computer Skills, etc.)
									const label = firstDiv.textContent?.trim() || '';
									const value = contentDiv.textContent?.trim() || '';
									
									if (label || value) {
										pdf.setFontSize(FONT_SIZE.BODY);
										pdf.setFont('helvetica', 'bold');
										pdf.setTextColor(...COLORS.PRIMARY);
										const labelLines = pdf.splitTextToSize(label, yearColumnWidth);
										labelLines.forEach((line: string, index: number) => {
											pdf.text(line, margin + 3, yPosition + (index * SPACING.LINE_HEIGHT_TIGHT));
										});
										pdf.setTextColor(...COLORS.TEXT);
										
										pdf.setFont('helvetica', 'normal');
										const valueLines = pdf.splitTextToSize(value, contentWidth - yearColumnWidth);
										valueLines.forEach((line: string, index: number) => {
											if (index > 0 && yPosition > pageHeight - margin - 10) {
												addPageNumber();
												pdf.addPage();
												yPosition = margin;
											}
											pdf.text(line, margin + yearColumnWidth, yPosition + (index * SPACING.LINE_HEIGHT_TIGHT));
										});
										yPosition += Math.max(labelLines.length, valueLines.length) * SPACING.LINE_HEIGHT_TIGHT + SPACING.SUBSECTION_TOP;
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
							const text = elem.textContent?.trim() || '';
							if (text && !text.includes('No ') && text.length > 5) {
								pdf.setFontSize(FONT_SIZE.BODY);
								pdf.setFont('helvetica', 'normal');
								const lines = pdf.splitTextToSize(text, contentWidth - 5);
								lines.forEach((line: string) => {
									if (yPosition > pageHeight - margin - 10) {
										addPageNumber();
										pdf.addPage();
										yPosition = margin;
									}
									pdf.text(line, margin + 3, yPosition);
									yPosition += SPACING.LINE_HEIGHT_BODY;
								});
								yPosition += SPACING.SUBSECTION_TOP;
							}
						});
						
						// Also check for list items (nested ul in affiliations, etc.)
						const items = section.querySelectorAll('li');
						items.forEach((item) => {
							const text = item.textContent?.trim() || '';
							if (text) {
								pdf.setFontSize(FONT_SIZE.BODY - 0.5); // Slightly smaller for list items
								pdf.setFont('helvetica', 'normal');
								const lines = pdf.splitTextToSize('• ' + text, contentWidth - 10);
								lines.forEach((line: string) => {
									if (yPosition > pageHeight - margin - 10) {
										addPageNumber();
										pdf.addPage();
										yPosition = margin;
									}
									pdf.text(line, margin + 8, yPosition);
									yPosition += SPACING.LINE_HEIGHT_TIGHT;
								});
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

<button class="btn btn-primary glass-button" onclick={generatePDF} disabled={isGenerating || !jsPDF}>
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
