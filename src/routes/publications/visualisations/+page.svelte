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
	type PublicationsPerYearStackedData = {
		year: number;
		total: number;
		[type: string]: number; // Counts for each publication type
	};

	// Calculate data reactively using $derived - optimized for performance
	const citationsPerYearData = $derived((() => {
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
	})());

	const citedAuthorsData = $derived((() => {
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
	})());

	// Calculate maximum citation count for consistent x-axis scale across pagination
	const maxCitationCount = $derived(
		citedAuthorsData.length > 0 ? Math.max(...citedAuthorsData.map(d => d.count)) : 0
	);

	const languageData = $derived((() => {
		const languageCounts: Record<string, number> = {};
		allPublications.forEach((pub) => {
			if (pub.language) {
				// Split comma-separated languages and count each one
				const languages = pub.language.split(',').map((lang: string) => lang.trim());
				languages.forEach((language: string) => {
					if (language) { // Only count non-empty languages
						languageCounts[language] = (languageCounts[language] || 0) + 1;
					}
				});
			}
		});
		return Object.entries(languageCounts)
			.map(([language, count]) => ({ language, count }))
			.sort((a, b) => b.count - a.count);
	})());

	const publicationTypesForStack = $derived(Object.keys(publicationsByType).sort());

	const publicationsPerYearStackedData = $derived((() => {
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

		return Object.entries(yearlyPublicationCounts)
			.map(([yearStr, counts]) => ({
				year: parseInt(yearStr),
				...counts
			}))
			.sort((a, b) => a.year - b.year);
	})());

	// Calculate total citations reactively
	const totalCitations = $derived(citationsPerYearData.reduce((sum: number, item: CitationYearData) => sum + item.count, 0));

	// Calculate collaboration data for network graph
	const collaborationData = $derived((() => {
		const collaborations: Record<string, { publications: Set<string> }> = {};
		
		allPublications.forEach((pub) => {
			// Get all authors except Frédérick Madore
			const coAuthors = (pub.authors || []).filter(author => author !== 'Frédérick Madore');
			
			// Add editors for non-chapter/encyclopedia publications
			if (pub.editors && pub.type !== 'chapter' && pub.type !== 'encyclopedia') {
				const editors = typeof pub.editors === 'string' 
					? pub.editors.split(/\s*(?:,|and)\s*/).map(name => name.trim())
					: pub.editors;
				coAuthors.push(...editors.filter(editor => editor !== 'Frédérick Madore'));
			}
			
			// Add preface author if exists
			if (pub.prefacedBy && pub.prefacedBy !== 'Frédérick Madore') {
				coAuthors.push(pub.prefacedBy);
			}
			
			// Count collaborations
			coAuthors.forEach(author => {
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
	})());

	// Accessor functions for the D3BarChart
	const getYear = (d: CitationYearData) => d.year;
	const getCitationCount = (d: CitationYearData) => d.count;

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
	<div use:scrollAnimate={{ delay: 100, animationClass: 'fade-in-up', rootMargin: '100px', threshold: 0.05 }}>
		<PageHeader title="Publication Visualisations" />
	</div>

	<div use:scrollAnimate={{ delay: 150, animationClass: 'fade-in-up', rootMargin: '100px', threshold: 0.05 }}>
		<PageIntro>
			This page presents various visualisations of my publication data, offering insights into
			citation trends, authorship patterns, and more.
		</PageIntro>
	</div>

	<section class="visualization-section mb-12" use:scrollAnimate={{ delay: 200, animationClass: 'fade-in-up', rootMargin: '150px', threshold: 0.05 }}>
		<h2 class="text-2xl font-semibold mb-6">Publications per year by type</h2>
		{#if publicationsPerYearStackedData.length > 0 && publicationTypesForStack.length > 0}
			<div class="chart-wrapper stacked-chart" style="height: 450px;">
				<EChartsStackedBarChart
					data={publicationsPerYearStackedData}
					keys={publicationTypesForStack}
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

	<section class="visualization-section mb-12" use:scrollAnimate={{ delay: 250, animationClass: 'fade-in-up', rootMargin: '150px', threshold: 0.05 }}>
		<h2 class="text-2xl font-semibold mb-6">Publication Languages</h2>
		{#if languageData.length > 0}
			<div class="chart-wrapper" style="height: 400px;">
				<EChartsDoughnutChart
					data={languageData}
					nameAccessor={getLanguageName}
					valueAccessor={getLanguageCount}
					title="Distribution of Publications by Language"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">No language data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section mb-12" use:scrollAnimate={{ delay: 300, animationClass: 'fade-in-up', rootMargin: '150px', threshold: 0.05 }}>
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
					title="Author Collaboration Network"
					maxConnections={25}
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No collaboration data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<div use:scrollAnimate={{ delay: 350, animationClass: 'fade-in-up', rootMargin: '100px', threshold: 0.05 }}>
		<h2 class="text-3xl font-bold my-8 pt-4 border-t border-default">
			Citation statistics
		</h2>
	</div>

	<section class="visualization-section mb-12" use:scrollAnimate={{ delay: 400, animationClass: 'fade-in-up', rootMargin: '150px', threshold: 0.05 }}>
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

	<section class="visualization-section" use:scrollAnimate={{ delay: 450, animationClass: 'fade-in-up', rootMargin: '150px', threshold: 0.05 }}>
		<h2 class="text-2xl font-semibold mb-6">
			Authors citing my work most frequently
			{#if citedAuthorsData.length > 0}
				(Total: {citedAuthorsData.length} authors)
			{/if}
		</h2>
		{#if citedAuthorsData.length > 0}
			{#snippet authorChart(authorsToShow: CitedAuthorData[], pageIndex: number)}
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

			{@render authorChart(currentAuthors, currentPage)}

			{#if totalPages > 1}
				<div class="pagination-controls mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div class="pagination-info text-sm text-light">
						Showing {startIndex + 1}-{endIndex} of {citedAuthorsData.length} authors
					</div>
					<div class="pagination-buttons flex gap-2">
						<button
							class="pagination-btn"
							onclick={() => currentPage = Math.max(0, currentPage - 1)}
							disabled={currentPage === 0}
						>
							← Previous
						</button>
						
						{#if totalPages <= 7}
							{#each Array(totalPages) as _, i}
								<button
									class="pagination-btn {currentPage === i ? 'active' : ''}"
									onclick={() => currentPage = i}
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
							{@const actualStart = Math.max(1, Math.min(idealStart, totalPages - maxMiddlePages - 1))}
							{@const actualEnd = Math.min(totalPages - 2, Math.max(idealEnd, maxMiddlePages))}
							
							{@const showStartEllipsis = actualStart > 1}
							{@const showEndEllipsis = actualEnd < totalPages - 2}
							
							<!-- Show first page -->
							<button
								class="pagination-btn {currentPage === 0 ? 'active' : ''}"
								onclick={() => currentPage = 0}
							>
								1
							</button>
							
							{#if showStartEllipsis}
								<span class="pagination-ellipsis">…</span>
							{/if}
							
							<!-- Show pages around current page -->
							{#each Array(actualEnd - actualStart + 1) as _, i}
								{@const pageIndex = actualStart + i}
								<button
									class="pagination-btn {currentPage === pageIndex ? 'active' : ''}"
									onclick={() => currentPage = pageIndex}
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
								onclick={() => currentPage = totalPages - 1}
							>
								{totalPages}
							</button>
						{/if}
						
						<button
							class="pagination-btn"
							onclick={() => currentPage = Math.min(totalPages - 1, currentPage + 1)}
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
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-4);
	}

	.chart-wrapper,
	.placeholder-message {
		background-color: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.chart-wrapper {
		padding: var(--spacing-6);
		position: relative;
		/* Optimize rendering performance */
		contain: layout style paint;
		will-change: transform;
		/* Ensure proper height reservation */
		min-height: 300px;
	}
	
	.stacked-chart {
		height: 450px;
		/* Explicit height prevents layout shifts */
		contain: strict;
	}

	.network-chart {
		height: 500px;
		/* Explicit height prevents layout shifts */
		contain: strict;
	}

	.placeholder-message {
		padding: var(--spacing-6);
		min-height: 300px;
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
		transform: translateY(30px);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
	
	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.page-container {
			padding: 0 var(--spacing-3);
		}
		
		.chart-wrapper {
			padding: var(--spacing-4);
		}
		
		.stacked-chart {
			height: 380px; /* Reduce height on mobile */
		}

		.network-chart {
			height: 400px; /* Reduce height on mobile */
		}
		
		.visualization-section h2 {
			font-size: 1.25rem; /* Smaller headings on mobile */
			margin-bottom: var(--spacing-4);
		}
	}
	
	@media (max-width: 480px) {
		.chart-wrapper {
			padding: var(--spacing-3);
		}
		
		.stacked-chart {
			height: 350px; /* Even smaller on very small screens */
		}

		.network-chart {
			height: 350px; /* Even smaller on very small screens */
		}
		
		.visualization-section h2 {
			font-size: 1.125rem;
		}
	}
	
	.pagination-controls {
		border-top: 1px solid var(--color-border);
		padding-top: var(--spacing-4);
	}
	
	.pagination-btn {
		padding: var(--spacing-2) var(--spacing-3);
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--border-radius);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.pagination-btn:hover:not(:disabled) {
		background-color: var(--color-surface-border);
		border-color: var(--color-primary);
	}
	
	.pagination-btn.active {
		background-color: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}
	
	.pagination-btn:disabled {
		opacity: 0.5;
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
	
	@media (max-width: 640px) {
		.pagination-buttons {
			flex-wrap: wrap;
			justify-content: center;
		}
		
		.pagination-btn {
			font-size: var(--font-size-xs);
			padding: var(--spacing-1) var(--spacing-2);
			min-width: 32px;
		}
	}
</style>
