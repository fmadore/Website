<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { base } from '$app/paths';
	import { allPublications, publicationsByType } from '$lib/data/publications';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import EChartsBarChart from '$lib/components/visualisations/EChartsBarChart.svelte';
	import EChartsHorizontalBarChart from '$lib/components/visualisations/EChartsHorizontalBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';
	import EChartsDoughnutChart from '$lib/components/visualisations/EChartsDoughnutChart.svelte';
	import EChartsNetworkGraph from '$lib/components/visualisations/EChartsNetworkGraph.svelte';
	import EChartsTreemap from '$lib/components/visualisations/EChartsTreemap.svelte';
	import EChartsGanttChart from '$lib/components/visualisations/EChartsGanttChart.svelte';
	import D3BubbleChart from '$lib/components/visualisations/D3BubbleChart.svelte';
	import LocationMap from '$lib/components/visualisations/LocationMap.svelte';
	import VizChartCard from '$lib/components/visualisations/VizChartCard.svelte';
	import LanguageToggle from '$lib/components/visualisations/LanguageToggle.svelte';
	import {
		buildLocationData,
		tallyBy,
		groupByKey,
		buildProjectTimeline
	} from '$lib/utils/vizAggregation';
	import { buildPublicationCollaborationNetwork } from '$lib/utils/networkAggregation';
	import type { NetworkEdgeKind } from '$lib/utils/networkAggregation';
	import NetworkControls from '$lib/components/visualisations/NetworkControls.svelte';
	import type { TreemapNode } from '$lib/utils/vizAggregation';
	import { author } from '$lib/data/siteConfig';
	import type { LocationDatum } from '$lib/data/geo';
	import EChartsWordCloud from '$lib/components/visualisations/EChartsWordCloud.svelte';
	import { corpusAnalysis, getCombinedWordCloudData, getCombinedBigrams } from '$lib/data/analysis';
	import type { NgramFrequency } from '$lib/types';

	type CitationYearData = { year: number; count: number };
	type CitedAuthorData = { author: string; count: number };
	type LanguageData = { language: string; count: number };
	type KeywordData = { keyword: string; count: number };

	// Calculate data reactively using $derived - optimized for performance
	const citationsPerYearData = $derived<CitationYearData[]>(
		tallyBy(
			allPublications,
			(pub) =>
				pub.citedBy
					?.filter((citation) => typeof citation.year === 'number')
					.map((citation) => String(citation.year)),
			{ sort: 'key-asc' }
		).map(({ key, count }) => ({ year: parseInt(key), count }))
	);

	const citedAuthorsData = $derived<CitedAuthorData[]>(
		tallyBy(allPublications, (pub) =>
			pub.citedBy?.flatMap((citation) => (Array.isArray(citation.authors) ? citation.authors : []))
		).map(({ key, count }) => ({ author: key, count }))
	);

	// Calculate maximum citation count for consistent x-axis scale across pagination
	const maxCitationCount = $derived(
		citedAuthorsData.length > 0 ? Math.max(...citedAuthorsData.map((d) => d.count)) : 0
	);

	// Split comma-separated languages and count each one
	const languageData = $derived<LanguageData[]>(
		tallyBy(allPublications, (pub) => pub.language?.split(',')).map(({ key, count }) => ({
			language: key,
			count
		}))
	);

	// Calculate keyword frequency data
	const keywordData = $derived<KeywordData[]>(
		tallyBy(allPublications, (pub) => pub.tags).map(({ key, count }) => ({
			keyword: key,
			count
		}))
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
		publicationTypesForStack.map((type) => formatTypeLabel(type))
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
					const yearData: Record<string, number> = { year: parseInt(yearStr) };

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

	// Author collaboration network (nodes + weighted edges), built by the shared
	// tested aggregator. `collaborators` counts the non-centre nodes for the heading.
	const collaborationNetwork = $derived(
		buildPublicationCollaborationNetwork(allPublications, author.name)
	);
	const collaboratorCount = $derived(
		collaborationNetwork.nodes.filter((n) => n.kind !== 'center').length
	);
	// Toggleable edge layers (peer + contributor) with live counts for the chips.
	const collaborationEdgeOptions = $derived(
		(
			[
				{ kind: 'peer', label: 'Co-author' },
				{ kind: 'contributor', label: 'Contributor' }
			] as const
		)
			.map((o) => ({
				...o,
				count: collaborationNetwork.edges.filter((e) => e.kind === o.kind).length
			}))
			.filter((o) => o.count > 0)
	);
	const collaborationSuggestions = $derived(
		collaborationNetwork.nodes.filter((n) => n.kind !== 'center').map((n) => n.id)
	);

	// Network control state (Author Collaboration Network).
	let collabTopN = $state(20);
	let collabVisibleKinds = $state<NetworkEdgeKind[]>(['peer', 'contributor']);
	let collabSearch = $state('');

	// Calculate publication venue treemap data
	const venueTreemapData = $derived(
		(() => {
			// Group publications by venue type and venue name
			const journals: Record<string, { count: number; publications: string[] }> = {};
			const publishers: Record<string, { count: number; publications: string[] }> = {};

			allPublications.forEach((pub) => {
				// Journal articles, special issues, and reports (bulletin-like venues)
				if (
					pub.journal &&
					(pub.type === 'article' ||
						pub.type === 'special-issue' ||
						pub.type === 'bulletin-article')
				) {
					if (!journals[pub.journal]) {
						journals[pub.journal] = { count: 0, publications: [] };
					}
					journals[pub.journal].count++;
					journals[pub.journal].publications.push(pub.title);
				}

				// Reports - use publisher as journal-like venue
				if (pub.publisher && pub.type === 'report') {
					if (!journals[pub.publisher]) {
						journals[pub.publisher] = { count: 0, publications: [] };
					}
					journals[pub.publisher].count++;
					journals[pub.publisher].publications.push(pub.title);
				}

				// Books, chapters, and encyclopedias - group by publisher
				if (
					pub.publisher &&
					(pub.type === 'book' || pub.type === 'chapter' || pub.type === 'encyclopedia')
				) {
					if (!publishers[pub.publisher]) {
						publishers[pub.publisher] = { count: 0, publications: [] };
					}
					publishers[pub.publisher].count++;
					publishers[pub.publisher].publications.push(pub.title);
				}
			});

			// Build treemap structure
			const treemapData: TreemapNode[] = [];

			// Add journals category
			if (Object.keys(journals).length > 0) {
				treemapData.push({
					name: 'Journals',
					children: Object.entries(journals)
						.map(([name, data]) => ({
							name,
							value: data.count,
							publications: data.publications
						}))
						.sort((a, b) => b.value - a.value)
				});
			}

			// Add publishers category (for books and chapters)
			if (Object.keys(publishers).length > 0) {
				treemapData.push({
					name: 'Book Publishers',
					children: Object.entries(publishers)
						.map(([name, data]) => ({
							name,
							value: data.count,
							publications: data.publications
						}))
						.sort((a, b) => b.value - a.value)
				});
			}

			return treemapData;
		})()
	);

	// Calculate total venues for display
	const totalVenues = $derived(
		venueTreemapData.reduce((sum, category) => sum + category.children.length, 0)
	);

	// Calculate research projects timeline data (group by project, then build spans)
	const projectTimelineData = $derived(
		buildProjectTimeline(
			groupByKey(allPublications, (pub) => pub.project),
			(pub) => ({ title: pub.title, year: pub.year, type: pub.type })
		)
	);

	// Calculate publisher location data for map visualization
	const publisherLocationData: LocationDatum[] = $derived(
		buildLocationData(
			allPublications,
			(pub) => pub.publisherLocation,
			(pub) => ({ id: pub.id, title: pub.title, subtitle: pub.publisher, type: pub.type })
		)
	);

	// Calculate total publications with publisher location
	const totalWithLocation = $derived(
		publisherLocationData.reduce((sum, loc) => sum + loc.count, 0)
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

	// Accessor functions for keyword bubble chart
	const getKeywordName = (d: KeywordData) => d.keyword;
	const getKeywordCount = (d: KeywordData) => d.count;

	// Pagination state
	let currentPage = $state(0);

	// Word cloud language filter
	type WordCloudLanguage = 'all' | 'en' | 'fr';
	let wordCloudLanguage = $state<WordCloudLanguage>('all');

	// Get publication IDs for the selected language
	const wordCloudPublicationIds = $derived(() => {
		if (wordCloudLanguage === 'en') {
			return corpusAnalysis.byLanguage.en;
		} else if (wordCloudLanguage === 'fr') {
			return corpusAnalysis.byLanguage.fr;
		}
		return [...corpusAnalysis.byLanguage.en, ...corpusAnalysis.byLanguage.fr];
	});

	// Get word cloud data for selected language
	const wordCloudData = $derived(() => {
		const ids = wordCloudPublicationIds();
		if (ids.length === 0) return [];
		return getCombinedWordCloudData(ids, { maxWords: 100 });
	});

	// Count of publications with text analysis
	const wordCloudStats = $derived(() => {
		const ids = wordCloudPublicationIds();
		const data = wordCloudData();
		return {
			publicationCount: ids.length,
			wordCount: data.reduce((sum, w) => sum + w.count, 0),
			uniqueTerms: data.length
		};
	});

	// Get bigrams data for selected language
	const bigramsData = $derived(() => {
		const ids = wordCloudPublicationIds();
		if (ids.length === 0) return [];
		return getCombinedBigrams(ids, 30);
	});

	// Accessor functions for bigrams chart
	const getBigramName = (d: NgramFrequency) => d.ngram;
	const getBigramCount = (d: NgramFrequency) => d.count;

	// Define breadcrumb items
	const breadcrumbItems = [
		{ label: 'Publications', href: `${base}/publications` },
		{ label: 'Visualisations', href: `${base}/publications/visualisations` }
	];

	// JSON-LD for Breadcrumbs - uses reusable utility
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-pub-viz');
</script>

<SEO
	title="Publication Visualisations | Frédérick Madore"
	description="Visualisations of publication data, including citation trends and cited authors."
	keywords="publications, visualisations, citations, research analytics, Frédérick Madore"
/>

<div class="page-container page-enter">
	<Breadcrumb items={breadcrumbItems} />
	<div class="scroll-reveal">
		<PageHeader title="Publication Visualisations" />
	</div>

	<div class="scroll-reveal">
		<PageIntro>
			This page presents various visualisations of my publication data, offering insights into
			citation trends, authorship patterns, and more.
		</PageIntro>
	</div>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Publications per year by type</h2>
		<VizChartCard
			variant="stacked"
			height="450px"
			hasData={publicationsPerYearStackedData.length > 0 && publicationTypesForStack.length > 0}
		>
			<EChartsStackedBarChart
				data={publicationsPerYearStackedData}
				keys={formattedPublicationTypes}
				xAxisLabel="Year"
				yAxisLabel="Number of Publications"
			/>
			{#snippet placeholder()}
				<p class="text-light">No publication data available to display for this visualization.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Number of pages per year</h2>
		<VizChartCard height="400px" hasData={pagesPerYearData.length > 0}>
			<EChartsBarChart
				data={pagesPerYearData}
				xAccessor={getPagesYear}
				yAccessor={getPagesCount}
				xAxisLabel="Year"
				yAxisLabel="Total pages published"
				barColor="var(--color-accent)"
			/>
			{#snippet placeholder()}
				<p class="text-light">No page count data available to display for this visualization.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Publication Languages</h2>
		<VizChartCard height="480px" hasData={languageData.length > 0}>
			<EChartsDoughnutChart
				data={languageData}
				nameAccessor={getLanguageName}
				valueAccessor={getLanguageCount}
				title="Distribution of Publications by Language"
			/>
			{#snippet placeholder()}
				<p class="text-light">No language data available to display for this visualization.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Keyword Frequency
			{#if keywordData.length > 0}
				({keywordData.length} unique keywords)
			{/if}
		</h2>
		<VizChartCard variant="bubble" height="550px" hasData={keywordData.length > 0}>
			<D3BubbleChart
				data={keywordData}
				nameAccessor={getKeywordName}
				valueAccessor={getKeywordCount}
			/>
			{#snippet placeholder()}
				<p class="text-light">No keyword data available to display for this visualization.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Text Analysis Word Cloud
			{#if wordCloudStats().publicationCount > 0}
				({wordCloudStats().publicationCount} publications analyzed)
			{/if}
		</h2>
		<p class="section-description">
			Most frequent terms extracted from full-text publications using lemmatization.
		</p>

		{#if corpusAnalysis.publicationCount > 0}
			<LanguageToggle
				bind:current={wordCloudLanguage}
				enCount={corpusAnalysis.byLanguage.en.length}
				frCount={corpusAnalysis.byLanguage.fr.length}
			/>

			<VizChartCard placeholderHeight="500px" hasData={wordCloudData().length > 0}>
				<EChartsWordCloud
					words={wordCloudData()}
					maxWords={100}
					shape="circle"
					minFontSize={12}
					maxFontSize={60}
				/>
				{#snippet placeholder()}
					<p class="text-light">
						No text analysis data available for {wordCloudLanguage === 'all'
							? 'any'
							: wordCloudLanguage === 'en'
								? 'English'
								: 'French'} publications.
					</p>
				{/snippet}
			</VizChartCard>
		{:else}
			<VizChartCard placeholderHeight="500px" hasData={false}>
				{#snippet placeholder()}
					<p class="text-light">
						No text analysis data available to display for this visualization.
					</p>
				{/snippet}
			</VizChartCard>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Common Phrases (Bigrams)
			{#if bigramsData().length > 0}
				({bigramsData().length} phrases)
			{/if}
		</h2>
		<p class="section-description">
			Most frequent two-word phrases extracted from full-text publications.
		</p>

		{#if corpusAnalysis.publicationCount > 0}
			<LanguageToggle
				bind:current={wordCloudLanguage}
				enCount={corpusAnalysis.byLanguage.en.length}
				frCount={corpusAnalysis.byLanguage.fr.length}
			/>

			<VizChartCard
				variant="bigrams"
				height="{Math.max(400, bigramsData().length * 28 + 70)}px"
				placeholderHeight="400px"
				hasData={bigramsData().length > 0}
			>
				<EChartsHorizontalBarChart
					data={bigramsData()}
					xAccessor={getBigramCount}
					yAccessor={getBigramName}
					xAxisLabel="Frequency"
					barColor="var(--color-accent)"
				/>
				{#snippet placeholder()}
					<p class="text-light">
						No bigram data available for {wordCloudLanguage === 'all'
							? 'any'
							: wordCloudLanguage === 'en'
								? 'English'
								: 'French'} publications.
					</p>
				{/snippet}
			</VizChartCard>
		{:else}
			<VizChartCard placeholderHeight="400px" hasData={false}>
				{#snippet placeholder()}
					<p class="text-light">
						No text analysis data available to display for this visualization.
					</p>
				{/snippet}
			</VizChartCard>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Author Collaboration Network
			{#if collaboratorCount > 0}
				({collaboratorCount} collaborators)
			{/if}
		</h2>
		{#if collaboratorCount > 0}
			<NetworkControls
				bind:topN={collabTopN}
				bind:visibleKinds={collabVisibleKinds}
				bind:searchQuery={collabSearch}
				maxN={collaboratorCount}
				edgeKindOptions={collaborationEdgeOptions}
				searchLabel="Search collaborators"
				suggestions={collaborationSuggestions}
			/>
		{/if}
		<VizChartCard variant="network" height="500px" hasData={collaboratorCount > 0}>
			<EChartsNetworkGraph
				nodes={collaborationNetwork.nodes}
				edges={collaborationNetwork.edges}
				centerId={author.name}
				maxNodes={collabTopN}
				visibleEdgeKinds={collabVisibleKinds}
				highlightQuery={collabSearch}
				filename="collaboration-network"
			/>
			{#snippet placeholder()}
				<p class="text-light">No collaboration data available to display for this visualization.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Publication Venues
			{#if totalVenues > 0}
				({totalVenues} venues)
			{/if}
		</h2>
		<p class="section-description">
			Where publications appear: journals, book publishers, and edited volumes. Click to zoom into
			categories.
		</p>
		<VizChartCard variant="treemap" placeholderHeight="500px" hasData={venueTreemapData.length > 0}>
			<EChartsTreemap data={venueTreemapData} title="Publication Venues" />
			{#snippet placeholder()}
				<p class="text-light">No venue data available to display for this visualization.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Research Projects Timeline
			{#if projectTimelineData.length > 0}
				({projectTimelineData.length} projects)
			{/if}
		</h2>
		<p class="section-description">
			Project durations with publication output markers. Bars show project spans; circles mark
			individual publications.
		</p>
		<VizChartCard variant="gantt" height="450px" hasData={projectTimelineData.length > 0}>
			<EChartsGanttChart data={projectTimelineData} />
			{#snippet placeholder()}
				<p class="text-light">No project data available to display for this visualization.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Publisher Locations
			{#if publisherLocationData.length > 0}
				({publisherLocationData.length} countries, {totalWithLocation} publications)
			{/if}
		</h2>
		<p class="section-description">
			Geographic distribution of publication venues. Marker size indicates publication count.
		</p>
		<VizChartCard
			variant="map"
			height="500px"
			placeholderHeight="400px"
			hasData={publisherLocationData.length > 0}
		>
			<LocationMap data={publisherLocationData} basePath="/publications" itemLabel="publication" />
			{#snippet placeholder()}
				<p class="text-light">
					No publisher location data available to display for this visualization.
				</p>
			{/snippet}
		</VizChartCard>
	</section>

	<div class="section-divider scroll-reveal">
		<h2 class="divider-heading">Citation statistics</h2>
	</div>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Citations per year
			{#if citationsPerYearData.length > 0 && totalCitations > 0}
				(Total: {totalCitations})
			{/if}
		</h2>
		<VizChartCard height="400px" hasData={citationsPerYearData.length > 0}>
			<EChartsBarChart
				data={citationsPerYearData}
				xAccessor={getYear}
				yAccessor={getCitationCount}
				xAxisLabel="Year"
				yAxisLabel="Number of citations"
				barColor="var(--color-accent)"
			/>
			{#snippet placeholder()}
				<p class="text-light">
					No citation data available to display for this visualization, or data is still loading.
				</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal">
		<h2 class="section-heading">
			Authors citing my work most frequently
			{#if citedAuthorsData.length > 0}
				(Total: {citedAuthorsData.length} authors)
			{/if}
		</h2>
		{#if citedAuthorsData.length > 0}
			{#snippet authorChart(authorsToShow: CitedAuthorData[])}
				<VizChartCard height="{Math.max(350, authorsToShow.length * 35 + 70)}px">
					<EChartsHorizontalBarChart
						data={authorsToShow}
						xAccessor={getAuthorCitationCount}
						yAccessor={getAuthorName}
						xAxisLabel="Number of citations"
						barColor="var(--color-highlight)"
						maxValue={maxCitationCount}
					/>
				</VizChartCard>
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
			<VizChartCard hasData={false}>
				{#snippet placeholder()}
					<p class="text-light">
						No cited author data available to display for this visualization.
					</p>
				{/snippet}
			</VizChartCard>
		{/if}
	</section>
</div>

<style>
	.page-container {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md);
	}

	/*
	 * Section heading — sans by default (serif discipline applied globally).
	 * The display-tier h2 still feels editorial because of the major-third
	 * type scale; removing the serif also aligns it with the rest of the
	 * site's section chrome.
	 */
	.section-heading {
		font-size: var(--font-size-heading-3);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-heading);
	}

	/* Section divider - for "Citation statistics" heading */
	.section-divider {
		margin: var(--space-reading-loose) 0;
		padding-top: var(--space-lg);
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
	}

	.divider-heading {
		font-size: var(--font-size-heading-2);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0;
		line-height: var(--line-height-heading);
	}

	/* Chart-card surface, hover, dark-mode and chart-size responsive rules
	 * now live in VizChartCard.svelte. */

	/* Section description text — editorial serif (Newsreader). */
	.section-description {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		color: var(--color-text-soft);
		margin-top: calc(-1 * var(--space-sm));
		margin-bottom: var(--space-md);
		line-height: var(--line-height-relaxed);
	}

	:global(html.dark) .section-divider {
		border-top-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
	}

	/* Mobile responsiveness using PostCSS custom media */
	@media (--md-down) {
		.page-container {
			padding: var(--space-md) var(--space-sm);
		}

		.section-heading {
			font-size: var(--font-size-heading-4);
			margin-bottom: var(--space-md);
		}

		.divider-heading {
			font-size: var(--font-size-heading-3);
		}
	}

	@media (--sm-down) {
		.section-heading {
			font-size: var(--font-size-heading-5);
		}

		.divider-heading {
			font-size: var(--font-size-heading-4);
		}
	}

	/* Pagination controls */
	.pagination-controls {
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
		padding-top: var(--space-md);
	}

	.pagination-btn {
		padding: var(--space-xs) var(--space-sm);
		border: var(--border-width-thin) solid var(--color-border);
		background-color: var(--color-surface-elevated);
		color: var(--color-text-soft);
		border-radius: 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--letter-spacing-wide);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
		min-width: calc(var(--space-xl) + var(--space-xs));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pagination-btn:hover:not(:disabled) {
		background-color: var(--color-surface);
		border-color: var(--color-accent);
		color: var(--color-text-emphasis);
	}

	.pagination-btn.active {
		background-color: var(--color-accent);
		color: var(--color-text-inverted);
		border-color: var(--color-accent);
	}

	.pagination-btn:disabled {
		opacity: var(--opacity-30);
		cursor: not-allowed;
	}

	.pagination-ellipsis {
		padding: var(--space-xs) var(--space-2xs);
		color: var(--color-text-light);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		display: flex;
		align-items: center;
	}

	.pagination-info {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--letter-spacing-wide);
		color: var(--color-text-light);
	}

	@media (--sm-down) {
		.pagination-buttons {
			flex-wrap: wrap;
			justify-content: center;
		}

		.pagination-btn {
			font-size: var(--font-size-xs);
			padding: var(--space-2xs) var(--space-xs);
			min-width: var(--space-xl);
		}
	}
</style>
