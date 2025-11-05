<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { allPublications, publicationsByType } from '$lib/data/publications'; // Import publicationsByType
	import EChartsBarChart from '$lib/components/visualisations/EChartsBarChart.svelte';
	import EChartsHorizontalBarChart from '$lib/components/visualisations/EChartsHorizontalBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';
	import EChartsDoughnutChart from '$lib/components/visualisations/EChartsDoughnutChart.svelte';
	import EChartsNetworkGraph from '$lib/components/visualisations/EChartsNetworkGraph.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	type CitationYearData = { year: number; count: number };
	type CitedAuthorData = { author: string; count: number };
	type LanguageData = { language: string; count: number };

	// Calculate data reactively using $derived - optimized for performance
	const citationsPerYearData = $derived(
		(() => {
			// Process allPublications to derive data for visualizations
			const citationsReceivedInYear: Record<number, number> = {};

			// Use for loop for better performance than forEach
			for (let i = 0; i < allPublications.length; i++) {
				const pub = allPublications[i];
				if (pub.citedBy && Array.isArray(pub.citedBy)) {
					for (let j = 0; j < pub.citedBy.length; j++) {
						const citation = pub.citedBy[j];
						// Assuming each 'citation' object has a 'year' property indicating the year of the citation
						if (citation && typeof citation.year === 'number') {
							citationsReceivedInYear[citation.year] =
								(citationsReceivedInYear[citation.year] || 0) + 1;
						}
					}
				}
			}

			return Object.entries(citationsReceivedInYear)
				.map(([year, count]) => ({ year: parseInt(year), count }))
				.sort((a, b) => a.year - b.year);
		})()
	);

	const citedAuthorsData = $derived(
		(() => {
			const authorCounts: Record<string, number> = {};
			allPublications.forEach((pub) => {
				if (pub.citedBy) {
					pub.citedBy.forEach((citation: any) => {
						if (citation.authors && Array.isArray(citation.authors)) {
							citation.authors.forEach((author: string) => {
								authorCounts[author] = (authorCounts[author] || 0) + 1;
							});
						}
					});
				}
			});
			return Object.entries(authorCounts)
				.map(([author, count]) => ({ author, count }))
				.sort((a, b) => b.count - a.count);
		})()
	);

	// Calculate maximum citation count for consistent x-axis scale across pagination
	const maxCitationCount = $derived(
		citedAuthorsData.length > 0 ? Math.max(...citedAuthorsData.map((d) => d.count)) : 0
	);

	const languageData = $derived(
		(() => {
			const languageCounts: Record<string, number> = {};
			allPublications.forEach((pub) => {
				if (pub.language) {
					// Split comma-separated languages and count each one
					const languages = pub.language.split(',').map((lang: string) => lang.trim());
					languages.forEach((language: string) => {
						if (language) {
							// Only count non-empty languages
							languageCounts[language] = (languageCounts[language] || 0) + 1;
						}
					});
				}
			});
			return Object.entries(languageCounts)
				.map(([language, count]) => ({ language, count }))
				.sort((a, b) => b.count - a.count);
		})()
	);

	// Helper function to format type labels for display
	const formatTypeLabel = (type: string): string => {
		const typeLabels: Record<string, string> = {
			article: 'Journal article',
			'bulletin-article': 'Bulletin article',
			book: 'Book',
			chapter: 'Book chapter',
			'conference-proceedings': 'Conference proceedings',
			'special-issue': 'Special issue',
			report: 'Research report',
			encyclopedia: 'Encyclopedia entry',
			blogpost: 'Blog post',
			'masters-thesis': "Master's thesis",
			'phd-dissertation': 'PhD dissertation'
		};
		return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
	};

	const publicationTypesForStack = $derived(Object.keys(publicationsByType).sort());
	
	// Formatted labels for display in the chart
	const formattedPublicationTypes = $derived(
		publicationTypesForStack.map(type => formatTypeLabel(type))
	);

	const publicationsPerYearStackedData = $derived(
		(() => {
			// Prepare data for stacked bar chart (Publications per Year by Type)
			const types = publicationTypesForStack;
			const yearlyPublicationCounts: Record<number, { [type: string]: number; total: number }> = {};

			allPublications.forEach((pub) => {
				if (!yearlyPublicationCounts[pub.year]) {
					yearlyPublicationCounts[pub.year] = { total: 0 };
					types.forEach((type: string) => (yearlyPublicationCounts[pub.year][type] = 0)); // Initialize all types with 0
				}
				yearlyPublicationCounts[pub.year][pub.type] =
					(yearlyPublicationCounts[pub.year][pub.type] || 0) + 1;
				yearlyPublicationCounts[pub.year].total++;
			});

			// Transform the data to use formatted labels as keys
			return Object.entries(yearlyPublicationCounts)
				.map(([yearStr, counts]) => {
					const yearData: any = { year: parseInt(yearStr) };
					
					// Map original type keys to formatted labels
					types.forEach((originalType, index) => {
						const formattedType = formattedPublicationTypes[index];
						yearData[formattedType] = counts[originalType] || 0;
					});
					
					return yearData;
				})
				.sort((a, b) => a.year - b.year);
		})()
	);

	// Calculate pages per year data
	type PagesPerYearData = { year: number; pages: number };
	
	const pagesPerYearData = $derived(
		(() => {
			const yearlyPageCounts: Record<number, number> = {};

			allPublications.forEach((pub) => {
				// Only include publications that have a pageCount value
				if (pub.pageCount && pub.pageCount > 0) {
					yearlyPageCounts[pub.year] = (yearlyPageCounts[pub.year] || 0) + pub.pageCount;
				}
			});

			return Object.entries(yearlyPageCounts)
				.map(([year, pages]) => ({ year: parseInt(year), pages }))
				.sort((a, b) => a.year - b.year);
		})()
	);

	// Calculate total citations reactively
	const totalCitations = $derived(
		citationsPerYearData.reduce((sum: number, item: CitationYearData) => sum + item.count, 0)
	);

	// Calculate collaboration data for network graph
	const collaborationData = $derived(
		(() => {
			const collaborations: Record<string, { publications: Set<string> }> = {};

			allPublications.forEach((pub) => {
				// Get all authors except Frédérick Madore
				const coAuthors = (pub.authors || []).filter((author) => author !== 'Frédérick Madore');

				// Add editors for non-chapter/encyclopedia publications
				if (pub.editors && pub.type !== 'chapter' && pub.type !== 'encyclopedia') {
					const editors =
						typeof pub.editors === 'string'
							? pub.editors.split(/\s*(?:,|and)\s*/).map((name) => name.trim())
							: pub.editors;
					coAuthors.push(...editors.filter((editor) => editor !== 'Frédérick Madore'));
				}

				// Add preface author if exists
				if (pub.prefacedBy && pub.prefacedBy !== 'Frédérick Madore') {
					coAuthors.push(pub.prefacedBy);
				}

				// Count collaborations
				coAuthors.forEach((author) => {
					if (!collaborations[author]) {
						collaborations[author] = { publications: new Set<string>() };
					}
					// Use Set to automatically deduplicate publication titles
					collaborations[author].publications.add(pub.title);
				});
			});

			// Convert to array format expected by the network graph
			return Object.entries(collaborations).map(([author, data]) => ({
				author,
				collaborationCount: data.publications.size, // Count unique publications
				publications: Array.from(data.publications) // Convert Set back to Array
			}));
		})()
	);

	// Accessor functions for the D3BarChart
	const getYear = (d: CitationYearData) => d.year;
	const getCitationCount = (d: CitationYearData) => d.count;

	// Accessor functions for pages per year
	const getPagesYear = (d: PagesPerYearData) => d.year;
	const getPagesCount = (d: PagesPerYearData) => d.pages;

	// Accessor functions for D3HorizontalBarChart
	const getAuthorName = (d: CitedAuthorData) => d.author;
	const getAuthorCitationCount = (d: CitedAuthorData) => d.count;

	// Accessor functions for language doughnut chart
	const getLanguageName = (d: LanguageData) => d.language;
	const getLanguageCount = (d: LanguageData) => d.count;

	// Pagination state
	let currentPage = $state(0);

	// Define breadcrumb items
	const breadcrumbItems = [
		{ label: 'Publications', href: `${base}/publications` },
		{ label: 'Visualisations', href: `${base}/publications/visualisations` }
	];

	// Generate Breadcrumb JSON-LD
	const breadcrumbJsonLdString = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				item: `${$page.url.origin}${item.href}`
			}))
		})
	);

	// Manage JSON-LD script injection
	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

	// Handle JSON-LD script injection with $effect - optimized to run only when needed
	$effect(() => {
		if (browser && breadcrumbJsonLdString) {
			const scriptId = breadcrumbJsonLdScriptId;
			let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

			if (scriptElement) {
				scriptElement.textContent = breadcrumbJsonLdString;
			} else {
				scriptElement = document.createElement('script');
				scriptElement.id = scriptId;
				scriptElement.type = 'application/ld+json';
				scriptElement.textContent = breadcrumbJsonLdString;
				document.head.appendChild(scriptElement);
			}

			return () => {
				// Cleanup: remove script if it exists
				const scriptToRemove = document.getElementById(scriptId);
				if (scriptToRemove && scriptToRemove.parentElement === document.head) {
					document.head.removeChild(scriptToRemove);
				}
			};
		}
	});
</script>

<SEO
	title="Publication Visualisations | Frédérick Madore"
	description="Visualisations of publication data, including citation trends and cited authors."
	keywords="publications, visualisations, citations, research analytics, Frédérick Madore"
/>

<div class="page-container">
	<Breadcrumb items={breadcrumbItems} />
	<div
		use:scrollAnimate={{
			delay: 100,
			animationClass: 'fade-in-up',
			rootMargin: '100px',
			threshold: 0.05
		}}
	>
		<PageHeader title="Publication Visualisations" />
	</div>

	<div
		use:scrollAnimate={{
			delay: 150,
			animationClass: 'fade-in-up',
			rootMargin: '100px',
			threshold: 0.05
		}}
	>
		<PageIntro>
			This page presents various visualisations of my publication data, offering insights into
			citation trends, authorship patterns, and more.
		</PageIntro>
	</div>

	<section
		class="visualization-section mb-12"
		use:scrollAnimate={{
			delay: 200,
			animationClass: 'fade-in-up',
			rootMargin: '150px',
			threshold: 0.05
		}}
	>
		<h2 class="text-2xl font-semibold mb-6">Publications per year by type</h2>
		{#if publicationsPerYearStackedData.length > 0 && publicationTypesForStack.length > 0}
			<div class="chart-wrapper stacked-chart" style="height: 450px;">
				<EChartsStackedBarChart
					data={publicationsPerYearStackedData}
					keys={formattedPublicationTypes}
					xAxisLabel="Year"
					yAxisLabel="Number of Publications"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 450px;">
				<p class="text-light">No publication data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<section
		class="visualization-section mb-12"
		use:scrollAnimate={{
			delay: 225,
			animationClass: 'fade-in-up',
			rootMargin: '150px',
			threshold: 0.05
		}}
	>
		<h2 class="text-2xl font-semibold mb-6">Number of pages per year</h2>
		{#if pagesPerYearData.length > 0}
			<div class="chart-wrapper" style="height: 400px;">
				<EChartsBarChart
					data={pagesPerYearData}
					xAccessor={getPagesYear}
					yAccessor={getPagesCount}
					xAxisLabel="Year"
					yAxisLabel="Total pages published"
					barColor="var(--color-primary)"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">No page count data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<section
		class="visualization-section mb-12"
		use:scrollAnimate={{
			delay: 250,
			animationClass: 'fade-in-up',
			rootMargin: '150px',
			threshold: 0.05
		}}
	>
		<h2 class="text-2xl font-semibold mb-6">Publication Languages</h2>
		{#if languageData.length > 0}
			<div class="chart-wrapper" style="height: 480px;">
				<EChartsDoughnutChart
					data={languageData}
					nameAccessor={getLanguageName}
					valueAccessor={getLanguageCount}
					title="Distribution of Publications by Language"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 480px;">
				<p class="text-light">No language data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<section
		class="visualization-section mb-12"
		use:scrollAnimate={{
			delay: 300,
			animationClass: 'fade-in-up',
			rootMargin: '150px',
			threshold: 0.05
		}}
	>
		<h2 class="text-2xl font-semibold mb-6">
			Author Collaboration Network
			{#if collaborationData.length > 0}
				({collaborationData.length} collaborators)
			{/if}
		</h2>
		{#if collaborationData.length > 0}
			<div class="chart-wrapper network-chart" style="height: 500px;">
				<EChartsNetworkGraph
					data={collaborationData}
					centerAuthor="Frédérick Madore"
					maxConnections={25}
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No collaboration data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<div
		use:scrollAnimate={{
			delay: 350,
			animationClass: 'fade-in-up',
			rootMargin: '100px',
			threshold: 0.05
		}}
	>
		<h2 class="text-3xl font-bold my-8 pt-4 border-t border-default">Citation statistics</h2>
	</div>

	<section
		class="visualization-section mb-12"
		use:scrollAnimate={{
			delay: 400,
			animationClass: 'fade-in-up',
			rootMargin: '150px',
			threshold: 0.05
		}}
	>
		<h2 class="text-2xl font-semibold mb-6">
			Citations per year
			{#if citationsPerYearData.length > 0 && totalCitations > 0}
				(Total: {totalCitations})
			{/if}
		</h2>
		{#if citationsPerYearData.length > 0}
			<div class="chart-wrapper" style="height: 400px;">
				<EChartsBarChart
					data={citationsPerYearData}
					xAccessor={getYear}
					yAccessor={getCitationCount}
					xAxisLabel="Year"
					yAxisLabel="Number of citations"
					barColor="var(--color-accent)"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">
					No citation data available to display for this visualization, or data is still loading.
				</p>
			</div>
		{/if}
	</section>

	<section
		class="visualization-section"
		use:scrollAnimate={{
			delay: 450,
			animationClass: 'fade-in-up',
			rootMargin: '150px',
			threshold: 0.05
		}}
	>
		<h2 class="text-2xl font-semibold mb-6">
			Authors citing my work most frequently
			{#if citedAuthorsData.length > 0}
				(Total: {citedAuthorsData.length} authors)
			{/if}
		</h2>
		{#if citedAuthorsData.length > 0}
			{#snippet authorChart(authorsToShow: CitedAuthorData[])}
				<div
					class="chart-wrapper"
					style="height: {Math.max(350, authorsToShow.length * 35 + 70)}px;"
				>
					<EChartsHorizontalBarChart
						data={authorsToShow}
						xAccessor={getAuthorCitationCount}
						yAccessor={getAuthorName}
						xAxisLabel="Number of citations"
						barColor="var(--color-highlight)"
						maxValue={maxCitationCount}
					/>
				</div>
			{/snippet}

			{@const itemsPerPage = 15}
			{@const totalPages = Math.ceil(citedAuthorsData.length / itemsPerPage)}
			{@const startIndex = currentPage * itemsPerPage}
			{@const endIndex = Math.min(startIndex + itemsPerPage, citedAuthorsData.length)}
			{@const currentAuthors = citedAuthorsData.slice(startIndex, endIndex)}

			{#key currentPage}
				{@render authorChart(currentAuthors)}
			{/key}

			{#if totalPages > 1}
				<div
					class="pagination-controls mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
				>
					<div class="pagination-info text-sm text-light">
						Showing {startIndex + 1}-{endIndex} of {citedAuthorsData.length} authors
					</div>
					<div class="pagination-buttons flex gap-2">
						<button
							class="pagination-btn"
							onclick={() => (currentPage = Math.max(0, currentPage - 1))}
							disabled={currentPage === 0}
						>
							← Previous
						</button>

						{#if totalPages <= 7}
							{#each Array(totalPages) as _unused, i (i)}
								<button
									class="pagination-btn {currentPage === i ? 'active' : ''}"
									onclick={() => (currentPage = i)}
								>
									{i + 1}
								</button>
							{/each}
						{:else}
							{@const maxMiddlePages = 3}
							{@const halfRange = Math.floor(maxMiddlePages / 2)}

							<!-- Calculate the range of middle pages to show -->
							{@const idealStart = Math.max(1, currentPage - halfRange)}
							{@const idealEnd = Math.min(totalPages - 2, currentPage + halfRange)}

							<!-- Adjust if we're too close to the beginning or end -->
							{@const actualStart = Math.max(
								1,
								Math.min(idealStart, totalPages - maxMiddlePages - 1)
							)}
							{@const actualEnd = Math.min(totalPages - 2, Math.max(idealEnd, maxMiddlePages))}

							{@const showStartEllipsis = actualStart > 1}
							{@const showEndEllipsis = actualEnd < totalPages - 2}

							<!-- Show first page -->
							<button
								class="pagination-btn {currentPage === 0 ? 'active' : ''}"
								onclick={() => (currentPage = 0)}
							>
								1
							</button>

							{#if showStartEllipsis}
								<span class="pagination-ellipsis">…</span>
							{/if}

							<!-- Show pages around current page -->
							{#each Array(actualEnd - actualStart + 1) as _unused, i (actualStart + i)}
								{@const pageIndex = actualStart + i}
								<button
									class="pagination-btn {currentPage === pageIndex ? 'active' : ''}"
									onclick={() => (currentPage = pageIndex)}
								>
									{pageIndex + 1}
								</button>
							{/each}
							{#if showEndEllipsis}
								<span class="pagination-ellipsis">…</span>
							{/if}

							<!-- Show last page -->
							<button
								class="pagination-btn {currentPage === totalPages - 1 ? 'active' : ''}"
								onclick={() => (currentPage = totalPages - 1)}
							>
								{totalPages}
							</button>
						{/if}

						<button
							class="pagination-btn"
							onclick={() => (currentPage = Math.min(totalPages - 1, currentPage + 1))}
							disabled={currentPage === totalPages - 1}
						>
							Next →
						</button>
					</div>
				</div>
			{/if}
		{:else}
			<div class="placeholder-message">
				<p class="text-light">No cited author data available to display for this visualization.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.page-container {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: 0 var(--spacing-4);
	}

	.chart-wrapper,
	.placeholder-message {
		background-color: var(--color-surface);
		color: var(--color-text);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-slow) var(--anim-ease-base);
	}

	.chart-wrapper {
		padding: var(--spacing-6);
		position: relative;
		/* Optimize rendering performance */
		contain: layout style paint;
		will-change: transform;
		/* Ensure proper height reservation */
		min-height: var(--iframe-height-xs);
	}

	.stacked-chart {
		height: var(--iframe-height-sm);
		/* Explicit height prevents layout shifts */
		contain: strict;
	}

	.network-chart {
		height: var(--iframe-height-md);
		/* Explicit height prevents layout shifts */
		contain: strict;
	}

	.placeholder-message {
		padding: var(--spacing-6);
		min-height: var(--iframe-height-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		/* Prevent layout shifts */
		contain: layout style;
	}

	/* Initial state for scroll animations - prevent layout shifts */
	.visualization-section,
	.page-container > div {
		opacity: 0;
		transform: translateY(var(--transform-distance-md));
		transition: all var(--anim-duration-slow) var(--anim-ease-base);
		/* Reserve space to prevent layout shifts */
		min-height: 1px;
		contain: layout style;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.visualization-section,
		.page-container > div,
		.chart-wrapper {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}
	}

	/* Mobile responsiveness using breakpoint variables */
	@media (max-width: var(--breakpoint-md)) {
		.page-container {
			padding: 0 var(--spacing-3);
		}

		.chart-wrapper {
			padding: var(--spacing-4);
		}

		.stacked-chart {
			height: calc(var(--iframe-height-sm) - var(--spacing-16));
		}

		.network-chart {
			height: var(--iframe-height-sm);
		}

		.visualization-section h2 {
			font-size: var(--font-size-xl);
			margin-bottom: var(--spacing-4);
		}
	}

	@media (max-width: var(--breakpoint-sm)) {
		.chart-wrapper {
			padding: var(--spacing-3);
		}

		.stacked-chart {
			height: calc(var(--iframe-height-xs) + var(--spacing-12));
		}

		.network-chart {
			height: calc(var(--iframe-height-xs) + var(--spacing-12));
		}

		.visualization-section h2 {
			font-size: var(--font-size-lg);
		}
	}

	.pagination-controls {
		border-top: var(--border-width-thin) solid var(--color-border);
		padding-top: var(--spacing-4);
	}

	.pagination-btn {
		padding: var(--spacing-2) var(--spacing-3);
		border: var(--border-width-thin) solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--border-radius);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--anim-duration-fast) var(--anim-ease-out);
		min-width: calc(var(--spacing-8) + var(--spacing-2));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pagination-btn:hover:not(:disabled) {
		background-color: var(--color-surface-border);
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
	}

	.pagination-btn.active {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		box-shadow: var(--shadow);
	}

	.pagination-btn:disabled {
		opacity: var(--opacity-medium-high);
		cursor: not-allowed;
	}

	.pagination-ellipsis {
		padding: var(--spacing-2) var(--spacing-1);
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		display: flex;
		align-items: center;
	}

	.pagination-info {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	@media (max-width: var(--breakpoint-sm)) {
		.pagination-buttons {
			flex-wrap: wrap;
			justify-content: center;
		}

		.pagination-btn {
			font-size: var(--font-size-xs);
			padding: var(--spacing-1) var(--spacing-2);
			min-width: var(--spacing-8);
		}
	}
</style>
