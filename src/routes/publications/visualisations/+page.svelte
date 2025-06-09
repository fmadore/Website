<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { allPublications, publicationsByType } from '$lib/data/publications'; // Import publicationsByType
	import EChartsBarChart from '$lib/components/visualisations/EChartsBarChart.svelte';
	import EChartsHorizontalBarChart from '$lib/components/visualisations/EChartsHorizontalBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';
	import EChartsDoughnutChart from '$lib/components/visualisations/EChartsDoughnutChart.svelte';

	type CitationYearData = { year: number; count: number };
	type CitedAuthorData = { author: string; count: number };
	type LanguageData = { language: string; count: number };
	type PublicationsPerYearStackedData = {
		year: number;
		total: number;
		[type: string]: number; // Counts for each publication type
	};

	// Calculate data reactively using $derived
	const citationsPerYearData = $derived((() => {
		// Process allPublications to derive data for visualizations
		const citationsReceivedInYear: Record<number, number> = {};
		allPublications.forEach((pub) => {
			if (pub.citedBy && Array.isArray(pub.citedBy)) {
				pub.citedBy.forEach((citation: any) => {
					// Assuming each 'citation' object has a 'year' property indicating the year of the citation
					if (citation && typeof citation.year === 'number') {
						citationsReceivedInYear[citation.year] =
							(citationsReceivedInYear[citation.year] || 0) + 1;
					}
				});
			}
		});
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

	// Accessor functions for the D3BarChart
	const getYear = (d: CitationYearData) => d.year;
	const getCitationCount = (d: CitationYearData) => d.count;

	// Accessor functions for D3HorizontalBarChart
	const getAuthorName = (d: CitedAuthorData) => d.author;
	const getAuthorCitationCount = (d: CitedAuthorData) => d.count;

	// Accessor functions for language doughnut chart
	const getLanguageName = (d: LanguageData) => d.language;
	const getLanguageCount = (d: LanguageData) => d.count;

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

	// Handle JSON-LD script injection with $effect
	$effect(() => {
		if (browser) {
			const scriptId = breadcrumbJsonLdScriptId;
			let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

			if (breadcrumbJsonLdString) {
				if (scriptElement) {
					scriptElement.textContent = breadcrumbJsonLdString;
				} else {
					scriptElement = document.createElement('script');
					scriptElement.id = scriptId;
					scriptElement.type = 'application/ld+json';
					scriptElement.textContent = breadcrumbJsonLdString;
					document.head.appendChild(scriptElement);
				}
			} else {
				if (scriptElement) {
					document.head.removeChild(scriptElement);
				}
			}

			return () => {
				// Cleanup: remove script if it exists
				if (browser) {
					const scriptToRemove = document.getElementById(scriptId);
					if (scriptToRemove && scriptToRemove.parentElement === document.head) {
						document.head.removeChild(scriptToRemove);
					}
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
	<PageHeader title="Publication Visualisations" />

	<p class="text-xl mb-10">
		This page presents various visualisations of my publication data, offering insights into
		citation trends, authorship patterns, and more.
	</p>

	<section class="visualization-section mb-12">
		<h2 class="text-2xl font-semibold mb-6">Publications per year by type</h2>
		{#if publicationsPerYearStackedData.length > 0 && publicationTypesForStack.length > 0}
			<div class="chart-wrapper stacked-chart">
				<EChartsStackedBarChart
					data={publicationsPerYearStackedData}
					keys={publicationTypesForStack}
					xAxisLabel="Year"
					yAxisLabel="Number of Publications"
				/>
			</div>
		{:else}
			<div class="placeholder-message">
				<p class="text-light">No publication data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section mb-12">
		<h2 class="text-2xl font-semibold mb-6">Publication Languages</h2>
		{#if languageData.length > 0}
			<div class="chart-wrapper">
				<EChartsDoughnutChart
					data={languageData}
					nameAccessor={getLanguageName}
					valueAccessor={getLanguageCount}
					title="Distribution of Publications by Language"
				/>
			</div>
		{:else}
			<div class="placeholder-message">
				<p class="text-light">No language data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<h2 class="text-3xl font-bold my-8 pt-4 border-t border-default">
		Citation statistics
	</h2>

	<section class="visualization-section mb-12">
		<h2 class="text-2xl font-semibold mb-6">
			Citations per year
			{#if citationsPerYearData.length > 0 && totalCitations > 0}
				(Total: {totalCitations})
			{/if}
		</h2>
		{#if citationsPerYearData.length > 0}
			<div class="chart-wrapper">
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
			<div class="placeholder-message">
				<p class="text-light">
					No citation data available to display for this visualization, or data is still loading.
				</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section">
		<h2 class="text-2xl font-semibold mb-6">Authors citing my work most frequently</h2>
		{#if citedAuthorsData.length > 0}
			<div
				class="chart-wrapper"
				style="height: {Math.max(350, citedAuthorsData.slice(0, 15).length * 35 + 70)}px;"
			>
				<EChartsHorizontalBarChart
					data={citedAuthorsData.slice(0, 15)}
					xAccessor={getAuthorCitationCount}
					yAccessor={getAuthorName}
					xAxisLabel="Number of citations"
					barColor="var(--color-highlight)"
				/>
			</div>
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
	}

	.chart-wrapper {
		padding: var(--spacing-6);
		position: relative;
	}
	
	.stacked-chart {
		height: 450px;
	}

	.placeholder-message {
		padding: var(--spacing-6);
		min-height: 150px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
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
		
		.visualization-section h2 {
			font-size: 1.25rem; /* Smaller headings on mobile */
			margin-bottom: var(--spacing-4);
		}
		
		.text-xl {
			font-size: 1.125rem; /* Smaller intro text on mobile */
		}
	}
	
	@media (max-width: 480px) {
		.chart-wrapper {
			padding: var(--spacing-3);
		}
		
		.stacked-chart {
			height: 350px; /* Even smaller on very small screens */
		}
		
		.visualization-section h2 {
			font-size: 1.125rem;
		}
		
		.text-xl {
			font-size: 1rem;
		}
	}
</style>
