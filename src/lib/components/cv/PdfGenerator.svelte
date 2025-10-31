<script lang="ts">
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

			// Helper to add text with word wrap
			const addText = (text: string, fontSize: number, isBold: boolean = false) => {
				pdf.setFontSize(fontSize);
				pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
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
				yPosition += 3;
			};

			const addPageNumber = () => {
				const pageCount = pdf.internal.pages.length - 1;
				pdf.setFontSize(9);
				pdf.setFont('helvetica', 'normal');
				pdf.setTextColor(128, 128, 128);
				pdf.text(
					`Page ${pageCount}`,
					pageWidth / 2,
					pageHeight - 10,
					{ align: 'center' }
				);
				pdf.setTextColor(0, 0, 0);
			};

			const yearColumnWidth = 35; // Consistent width for year column

			const addSection = (title: string) => {
				yPosition += 5;
				pdf.setFontSize(14);
				pdf.setFont('helvetica', 'bold');
				pdf.text(title, margin, yPosition);
				yPosition += 7;
				pdf.setDrawColor(200, 200, 200);
				pdf.line(margin, yPosition, pageWidth - margin, yPosition);
				yPosition += 5;
			};

			// Title
			pdf.setFontSize(20);
			pdf.setFont('helvetica', 'bold');
			pdf.text('Curriculum Vitae', pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 10;
			
			pdf.setFontSize(16);
			pdf.text('Frédérick Madore', pageWidth / 2, yPosition, { align: 'center' });
			yPosition += 15;

			// Contact Info
			pdf.setFontSize(10);
			pdf.setFont('helvetica', 'normal');
			pdf.text('Leibniz-Zentrum Moderner Orient', margin, yPosition);
			yPosition += 5;
			pdf.text('Kirchweg 33, 14129 Berlin, Germany', margin, yPosition);
			yPosition += 5;
			pdf.text('frederick.madore@zmo.de', margin, yPosition);
			yPosition += 10;

			// Get CV content from the page
			const element = document.getElementById('cv-content');
			if (!element) throw new Error('CV content not found');

			// Extract sections
			const sections = element.querySelectorAll('section');
			sections.forEach((section) => {
				const heading = section.querySelector('h3');
				if (heading) {
					addSection(heading.textContent || '');
				}

				// Handle subsection headings (h4)
				const subsections = section.querySelectorAll('h4');
				if (subsections.length > 0) {
					subsections.forEach((h4) => {
						yPosition += 3;
						pdf.setFontSize(12);
						pdf.setFont('helvetica', 'bold');
						pdf.text(h4.textContent || '', margin + 5, yPosition);
						yPosition += 6;

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
										const content = contentDiv.textContent?.trim() || '';
										if (content) {
											if (yPosition > pageHeight - margin - 10) {
												addPageNumber();
												pdf.addPage();
												yPosition = margin;
											}
											
											pdf.setFontSize(10);
											pdf.setFont('helvetica', 'bold');
											pdf.text(year, margin + 3, yPosition);
											
											pdf.setFont('helvetica', 'normal');
											const contentLines = pdf.splitTextToSize(content, contentWidth - yearColumnWidth);
											contentLines.forEach((line: string, index: number) => {
												if (index > 0 && yPosition > pageHeight - margin - 10) {
													addPageNumber();
													pdf.addPage();
													yPosition = margin;
												}
												pdf.text(line, margin + yearColumnWidth, yPosition);
												if (index < contentLines.length - 1) {
													yPosition += 5;
												}
											});
											yPosition += 7;
										}
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
							const yearDiv = entry.querySelector('div:first-child');
							const contentDiv = entry.querySelector('div.flex-1');
							
							if (yearDiv && contentDiv) {
								const year = yearDiv.textContent?.trim() || '';
								const content = contentDiv.textContent?.trim() || '';
								if (content) {
									if (yPosition > pageHeight - margin - 10) {
										addPageNumber();
										pdf.addPage();
										yPosition = margin;
									}
									
									pdf.setFontSize(10);
									pdf.setFont('helvetica', 'bold');
									pdf.text(year, margin + 3, yPosition);
									
									pdf.setFont('helvetica', 'normal');
									const contentLines = pdf.splitTextToSize(content, contentWidth - yearColumnWidth);
									contentLines.forEach((line: string, index: number) => {
										if (index > 0 && yPosition > pageHeight - margin - 10) {
											addPageNumber();
											pdf.addPage();
											yPosition = margin;
										}
										pdf.text(line, margin + yearColumnWidth, yPosition);
										if (index < contentLines.length - 1) {
											yPosition += 5;
										}
									});
									yPosition += 7;
								}
							}
						});
					} else {
						// Fallback to list items for sections that still use them
						const items = section.querySelectorAll('li');
						items.forEach((item) => {
							const text = item.textContent?.trim() || '';
							if (text) {
								pdf.setFontSize(10);
								pdf.setFont('helvetica', 'normal');
								const lines = pdf.splitTextToSize('• ' + text, contentWidth - 5);
								lines.forEach((line: string) => {
									if (yPosition > pageHeight - margin - 10) {
										addPageNumber();
										pdf.addPage();
										yPosition = margin;
									}
									pdf.text(line, margin + 3, yPosition);
									yPosition += 5;
								});
								yPosition += 2;
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
