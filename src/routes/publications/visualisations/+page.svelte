<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import { allPublications, publicationsByType } from '$lib/data/publications'; // Import publicationsByType
	import EChartsBarChart from '$lib/components/visualisations/EChartsBarChart.svelte';
	import EChartsHorizontalBarChart from '$lib/components/visualisations/EChartsHorizontalBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';

	type CitationYearData = { year: number; count: number };
	type CitedAuthorData = { author: string; count: number };
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
</script>

<SEO
	title="Publication Visualisations | Frédérick Madore"
	description="Visualisations of publication data, including citation trends and cited authors."
	keywords="publications, visualisations, citations, research analytics, Frédérick Madore"
/>

<div class="page-container max-w-7xl">
	<PageHeader title="Publication Visualisations" />

	<p class="text-xl mb-10">
		This page presents various visualisations of my publication data, offering insights into
		citation trends, authorship patterns, and more.
	</p>

	<section class="visualization-section mb-12">
		<h2 class="text-2xl font-semibold mb-6">Publications per year by type</h2>
		{#if publicationsPerYearStackedData.length > 0 && publicationTypesForStack.length > 0}
			<div class="chart-wrapper p-6 rounded-lg shadow-md" style="height: 450px;">
				<EChartsStackedBarChart
					data={publicationsPerYearStackedData}
					keys={publicationTypesForStack}
					xAxisLabel="Year"
					yAxisLabel="Number of Publications"
				/>
			</div>
		{:else}
			<div class="placeholder-message p-6 rounded-lg shadow-md text-center">
				<p class="text-light">No publication data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<h2 class="text-3xl font-bold my-8 pt-4 border-t border-gray-300 dark:border-gray-700">
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
			<div class="chart-wrapper p-6 rounded-lg shadow-md">
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
			<div class="placeholder-message p-6 rounded-lg shadow-md text-center">
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
				class="chart-wrapper p-6 rounded-lg shadow-md"
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
			<div class="placeholder-message p-6 rounded-lg shadow-md text-center">
				<p class="text-light">No cited author data available to display for this visualization.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.page-container {
		/* max-width is handled by the .max-w-7xl utility class */
		margin: 0 auto;
		padding: var(--spacing-8) var(--spacing-4);
	}

	.chart-wrapper,
	.placeholder-message {
		background-color: var(--color-sidebar-bg); /* Adapts to dark mode */
		color: var(--color-text); /* Ensures text is readable in both modes */
	}

	.chart-wrapper {
		border: 1px solid var(--color-border); /* Uses theme border color */
		/* min-height is handled by inline style for horizontal chart, or D3 component for vertical */
		position: relative;
	}

	/* .list-display rules can be removed if no longer used after replacing with chart */
	/* .list-display ul {
        list-style-type: disc;
        padding-left: var(--spacing-5); 
    }

    .list-display li {
        margin-bottom: var(--spacing-2); 
    } */

	.placeholder-message {
		min-height: 150px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
