<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { base } from '$app/paths';
	import { allPublications, publicationsByType } from '$lib/data/publications';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import {
		buildBreadcrumbJsonLd,
		createSubsectionBreadcrumbs
	} from '$lib/utils/breadcrumbJsonLd.svelte';
	import EChartsBarChart from '$lib/components/visualisations/EChartsBarChart.svelte';
	import EChartsHorizontalBarChart from '$lib/components/visualisations/EChartsHorizontalBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';
	import EChartsDoughnutChart from '$lib/components/visualisations/EChartsDoughnutChart.svelte';
	import NetworkMatrix from '$lib/components/visualisations/NetworkMatrix.svelte';
	import NetworkArcDiagram from '$lib/components/visualisations/NetworkArcDiagram.svelte';
	import EChartsTreemap from '$lib/components/visualisations/EChartsTreemap.svelte';
	import EChartsGanttChart from '$lib/components/visualisations/EChartsGanttChart.svelte';
	import D3BubbleChart from '$lib/components/visualisations/D3BubbleChart.svelte';
	import LocationMap from '$lib/components/visualisations/LocationMap.svelte';
	import VizChartCard from '$lib/components/visualisations/VizChartCard.svelte';
	import VizSection from '$lib/components/visualisations/VizSection.svelte';
	import LanguageToggle from '$lib/components/visualisations/LanguageToggle.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import {
		buildLocationData,
		tallyBy,
		groupByKey,
		buildProjectTimeline,
		buildStackedByYear
	} from '$lib/utils/vizAggregation';
	// Shared page layout for the two visualisation routes.
	import '$styles/components/viz-page.css';
	import {
		buildPublicationCollaborationNetwork,
		buildCooccurrenceNetwork
	} from '$lib/utils/networkAggregation';
	import type { NetworkEdgeKind } from '$lib/utils/networkAggregation';
	import { PUBLICATION_TYPE_CHART_LABELS } from '$lib/utils/publicationTypeLabels';
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
	const formatTypeLabel = (type: string): string =>
		PUBLICATION_TYPE_CHART_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1);

	const publicationTypesForStack = $derived(Object.keys(publicationsByType).sort());

	// Formatted labels for display in the chart
	const formattedPublicationTypes = $derived(
		publicationTypesForStack.map((type) => formatTypeLabel(type))
	);

	// Stacked bar rows (Publications per Year by Type) via the shared aggregator.
	const publicationsPerYearStackedData = $derived(
		buildStackedByYear(allPublications, {
			getYear: (pub) => pub.year,
			getType: (pub) => pub.type,
			typeKeys: publicationTypesForStack,
			labelFor: formatTypeLabel
		})
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
	// A ledger is as tall as its rows; past ~30 the plate scrolls instead.
	const collabArcHeight = $derived(
		Math.round(Math.min(Math.min(collabTopN, collaboratorCount) * 24 + 150, 940))
	);

	// Keyword co-occurrence network: tags linked when they appear on the same
	// publication. Entity nodes, single edge kind (co-occurrence, always on).
	const keywordNetwork = $derived(
		buildCooccurrenceNetwork(allPublications, {
			getKeys: (pub) => pub.tags,
			getTitle: (pub) => pub.title
		})
	);
	const keywordSuggestions = $derived(keywordNetwork.nodes.map((n) => n.id));
	let keywordTopN = $state(25);
	let keywordSearch = $state('');

	// Calculate publication venue treemap data
	const venueTreemapData = $derived(
		(() => {
			// Group publications by venue type and venue name
			type VenueBucket = { count: number; publications: string[] };
			const journals: Record<string, VenueBucket> = {};
			const publishers: Record<string, VenueBucket> = {};
			// Get-or-create the venue bucket, returning a reference NUIA can trust.
			const bucket = (map: Record<string, VenueBucket>, key: string): VenueBucket =>
				(map[key] ??= { count: 0, publications: [] });

			allPublications.forEach((pub) => {
				// Journal articles, special issues, and reports (bulletin-like venues)
				if (
					pub.journal &&
					(pub.type === 'article' ||
						pub.type === 'special-issue' ||
						pub.type === 'bulletin-article')
				) {
					const b = bucket(journals, pub.journal);
					b.count++;
					b.publications.push(pub.title);
				}

				// Reports - use publisher as journal-like venue
				if (pub.publisher && pub.type === 'report') {
					const b = bucket(journals, pub.publisher);
					b.count++;
					b.publications.push(pub.title);
				}

				// Working papers - the numbered series is the venue
				if (pub.type === 'working-paper' && (pub.series || pub.journal || pub.publisher)) {
					const b = bucket(journals, (pub.series || pub.journal || pub.publisher)!);
					b.count++;
					b.publications.push(pub.title);
				}

				// Books, chapters, and encyclopedias - group by publisher
				if (
					pub.publisher &&
					(pub.type === 'book' || pub.type === 'chapter' || pub.type === 'encyclopedia')
				) {
					const b = bucket(publishers, pub.publisher);
					b.count++;
					b.publications.push(pub.title);
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

	// Pagination state for the cited-authors chart (1-based, Pagination component)
	const AUTHORS_PER_PAGE = 15;
	let currentPage = $state(1);
	const pagedAuthors = $derived(
		citedAuthorsData.slice((currentPage - 1) * AUTHORS_PER_PAGE, currentPage * AUTHORS_PER_PAGE)
	);

	// Word cloud language filter
	type WordCloudLanguage = 'all' | 'en' | 'fr';
	let wordCloudLanguage = $state<WordCloudLanguage>('all');

	/** Reader-facing name of the current filter, for the empty-state messages. */
	const languageLabel = (lang: WordCloudLanguage) =>
		lang === 'all' ? 'any' : lang === 'en' ? 'English' : 'French';

	// Get publication IDs for the selected language
	const wordCloudPublicationIds = $derived.by(() => {
		if (wordCloudLanguage === 'en') {
			return corpusAnalysis.byLanguage.en;
		} else if (wordCloudLanguage === 'fr') {
			return corpusAnalysis.byLanguage.fr;
		}
		return [...corpusAnalysis.byLanguage.en, ...corpusAnalysis.byLanguage.fr];
	});

	// Get word cloud data for selected language
	const wordCloudData = $derived.by(() => {
		if (wordCloudPublicationIds.length === 0) return [];
		return getCombinedWordCloudData(wordCloudPublicationIds, { maxWords: 100 });
	});

	// Count of publications with text analysis
	const wordCloudStats = $derived({
		publicationCount: wordCloudPublicationIds.length,
		wordCount: wordCloudData.reduce((sum, w) => sum + w.count, 0),
		uniqueTerms: wordCloudData.length
	});

	// Get bigrams data for selected language
	const bigramsData = $derived.by(() => {
		if (wordCloudPublicationIds.length === 0) return [];
		return getCombinedBigrams(wordCloudPublicationIds, 30);
	});

	// Accessor functions for bigrams chart
	const getBigramName = (d: NgramFrequency) => d.ngram;
	const getBigramCount = (d: NgramFrequency) => d.count;

	// Define breadcrumb items
	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Publications',
		'/publications',
		'Visualisations',
		'/publications/visualisations'
	);

	// JSON-LD for Breadcrumbs - uses reusable utility
	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
</script>

<SEO
	title="Publication Visualisations | Frédérick Madore"
	description="Visualisations of publication data, including citation trends and cited authors."
	keywords="publications, visualisations, citations, research analytics, Frédérick Madore"
/>

<JsonLd id="breadcrumb-json-ld-pub-viz" json={breadcrumbJsonLd} />
<div class="viz-page-container">
	<Breadcrumb items={breadcrumbItems} />
	<div class="">
		<PageHeader title="Publication Visualisations" />
	</div>

	<div class="">
		<PageIntro>
			This page presents various visualisations of my publication data, offering insights into
			citation trends, authorship patterns, and more.
		</PageIntro>
	</div>

	<VizSection
		title="Publications per year by type"
		variant="stacked"
		height="450px"
		hasData={publicationsPerYearStackedData.length > 0 && publicationTypesForStack.length > 0}
		empty="No publication data available to display for this visualisation."
	>
		<EChartsStackedBarChart
			data={publicationsPerYearStackedData}
			keys={formattedPublicationTypes}
			xAxisLabel="Year"
			yAxisLabel="Number of Publications"
		/>
	</VizSection>

	<VizSection
		title="Number of pages per year"
		height="400px"
		hasData={pagesPerYearData.length > 0}
		empty="No page count data available to display for this visualisation."
	>
		<EChartsBarChart
			data={pagesPerYearData}
			xAccessor={getPagesYear}
			yAccessor={getPagesCount}
			xAxisLabel="Year"
			yAxisLabel="Total pages published"
			barColor="var(--color-accent)"
		/>
	</VizSection>

	<VizSection
		title="Publication Languages"
		height="480px"
		hasData={languageData.length > 0}
		empty="No language data available to display for this visualisation."
	>
		<EChartsDoughnutChart
			data={languageData}
			nameAccessor={getLanguageName}
			valueAccessor={getLanguageCount}
			title="Distribution of Publications by Language"
		/>
	</VizSection>

	<VizSection
		title="Keyword Frequency"
		count={keywordData.length > 0 ? `${keywordData.length} unique keywords` : ''}
		variant="bubble"
		height="550px"
		hasData={keywordData.length > 0}
		empty="No keyword data available to display for this visualisation."
	>
		<D3BubbleChart
			data={keywordData}
			nameAccessor={getKeywordName}
			valueAccessor={getKeywordCount}
		/>
	</VizSection>

	<VizSection
		title="Keyword co-occurrence matrix"
		count={keywordNetwork.nodes.length > 0 ? `${keywordNetwork.nodes.length} keywords` : ''}
		description="Each cell is a pair of keywords that appear together on the same publication; the darker the cell, the more publications carry both. Rows are ordered so related keywords sit next to each other, which gathers the thematic blocks along the diagonal. Singletons and one-off pairings are omitted."
		variant="matrix"
		placeholderHeight="400px"
		hasData={keywordNetwork.nodes.length > 0}
		empty="Not enough keyword overlap to display a co-occurrence matrix."
	>
		{#snippet controls()}
			{#if keywordNetwork.nodes.length > 0}
				<NetworkControls
					bind:topN={keywordTopN}
					bind:searchQuery={keywordSearch}
					maxN={keywordNetwork.nodes.length}
					minN={10}
					searchLabel="Search keywords"
					suggestions={keywordSuggestions}
				/>
			{/if}
		{/snippet}
		<NetworkMatrix
			nodes={keywordNetwork.nodes}
			edges={keywordNetwork.edges}
			maxNodes={keywordTopN}
			highlightQuery={keywordSearch}
			filename="keyword-cooccurrence-matrix"
			labels={{
				itemSingular: 'publication',
				itemPlural: 'Publications',
				entityNode: 'Keywords',
				sharedLabel: 'Publications sharing both'
			}}
		/>
	</VizSection>

	<VizSection
		title="Text Analysis Word Cloud"
		count={wordCloudStats.publicationCount > 0
			? `${wordCloudStats.publicationCount} publications analysed`
			: ''}
		description="Most frequent terms extracted from full-text publications using lemmatisation."
		placeholderHeight="500px"
		hasData={corpusAnalysis.publicationCount > 0 && wordCloudData.length > 0}
	>
		{#snippet controls()}
			{#if corpusAnalysis.publicationCount > 0}
				<LanguageToggle
					bind:current={wordCloudLanguage}
					enCount={corpusAnalysis.byLanguage.en.length}
					frCount={corpusAnalysis.byLanguage.fr.length}
				/>
			{/if}
		{/snippet}
		{#snippet placeholder()}
			<p class="text-light">
				{#if corpusAnalysis.publicationCount === 0}
					No text analysis data available to display for this visualisation.
				{:else}
					No text analysis data available for {languageLabel(wordCloudLanguage)} publications.
				{/if}
			</p>
		{/snippet}
		<EChartsWordCloud
			words={wordCloudData}
			maxWords={100}
			shape="circle"
			minFontSize={12}
			maxFontSize={60}
		/>
	</VizSection>

	<VizSection
		title="Common Phrases (Bigrams)"
		count={bigramsData.length > 0 ? `${bigramsData.length} phrases` : ''}
		description="Most frequent two-word phrases extracted from full-text publications."
		variant="bigrams"
		height="{Math.max(400, bigramsData.length * 28 + 70)}px"
		placeholderHeight="400px"
		hasData={corpusAnalysis.publicationCount > 0 && bigramsData.length > 0}
	>
		{#snippet controls()}
			{#if corpusAnalysis.publicationCount > 0}
				<LanguageToggle
					bind:current={wordCloudLanguage}
					enCount={corpusAnalysis.byLanguage.en.length}
					frCount={corpusAnalysis.byLanguage.fr.length}
				/>
			{/if}
		{/snippet}
		{#snippet placeholder()}
			<p class="text-light">
				{#if corpusAnalysis.publicationCount === 0}
					No text analysis data available to display for this visualisation.
				{:else}
					No bigram data available for {languageLabel(wordCloudLanguage)} publications.
				{/if}
			</p>
		{/snippet}
		<EChartsHorizontalBarChart
			data={bigramsData}
			xAccessor={getBigramCount}
			yAccessor={getBigramName}
			xAxisLabel="Frequency"
			barColor="var(--color-accent)"
		/>
	</VizSection>

	<VizSection
		title="Author Collaboration Network"
		count={collaboratorCount > 0 ? `${collaboratorCount} collaborators` : ''}
		description="Collaborators ranked by how many publications we share. The arcs on the left join people who have worked with each other — my own link to each of them is a given, so it is not drawn."
		variant="arc"
		height="{collabArcHeight}px"
		placeholderHeight="400px"
		hasData={collaboratorCount > 0}
		empty="No collaboration data available to display for this visualisation."
	>
		{#snippet controls()}
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
		{/snippet}
		<NetworkArcDiagram
			nodes={collaborationNetwork.nodes}
			edges={collaborationNetwork.edges}
			centerId={author.name}
			maxNodes={collabTopN}
			visibleEdgeKinds={collabVisibleKinds}
			highlightQuery={collabSearch}
			filename="collaboration-arcs"
		/>
	</VizSection>

	<VizSection
		title="Publication Venues"
		count={totalVenues > 0 ? `${totalVenues} venues` : ''}
		description="Where publications appear: journals, book publishers, and edited volumes. Click to zoom into categories."
		variant="treemap"
		placeholderHeight="500px"
		hasData={venueTreemapData.length > 0}
		empty="No venue data available to display for this visualisation."
	>
		<EChartsTreemap data={venueTreemapData} title="Publication Venues" />
	</VizSection>

	<VizSection
		title="Research Projects Timeline"
		count={projectTimelineData.length > 0 ? `${projectTimelineData.length} projects` : ''}
		description="Project durations with publication output markers. Bars show project spans; circles mark individual publications."
		variant="gantt"
		height="450px"
		hasData={projectTimelineData.length > 0}
		empty="No project data available to display for this visualisation."
	>
		<EChartsGanttChart data={projectTimelineData} />
	</VizSection>

	<VizSection
		title="Publisher Locations"
		count={publisherLocationData.length > 0
			? `${publisherLocationData.length} countries, ${totalWithLocation} publications`
			: ''}
		description="Geographic distribution of publication venues. Marker size indicates publication count."
		variant="map"
		height="500px"
		placeholderHeight="400px"
		hasData={publisherLocationData.length > 0}
		empty="No publisher location data available to display for this visualisation."
	>
		<LocationMap data={publisherLocationData} basePath="/publications" itemLabel="publication" />
	</VizSection>

	<div class="section-divider">
		<h2 class="divider-heading">Citation statistics</h2>
	</div>

	<VizSection
		title="Citations per year"
		count={citationsPerYearData.length > 0 && totalCitations > 0 ? `Total: ${totalCitations}` : ''}
		height="400px"
		hasData={citationsPerYearData.length > 0}
		empty="No citation data available to display for this visualisation, or data is still loading."
	>
		<EChartsBarChart
			data={citationsPerYearData}
			xAccessor={getYear}
			yAccessor={getCitationCount}
			xAxisLabel="Year"
			yAxisLabel="Number of citations"
			barColor="var(--color-accent)"
		/>
	</VizSection>

	<!-- Paginated: the chart is re-keyed per page and followed by the pager, so
	     this section composes VizChartCard itself rather than delegating. -->
	<VizSection
		title="Authors citing my work most frequently"
		count={citedAuthorsData.length > 0 ? `Total: ${citedAuthorsData.length} authors` : ''}
		last
	>
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

			{#key currentPage}
				{@render authorChart(pagedAuthors)}
			{/key}

			<Pagination
				page={currentPage}
				perPage={AUTHORS_PER_PAGE}
				total={citedAuthorsData.length}
				label="authors"
				onchange={(p) => (currentPage = p)}
			/>
		{:else}
			<VizChartCard hasData={false}>
				{#snippet placeholder()}
					<p class="text-light">
						No cited author data available to display for this visualisation.
					</p>
				{/snippet}
			</VizChartCard>
		{/if}
	</VizSection>
</div>

<style>
	/* Page container comes from viz-page.css; section heading/description
	 * styles live in VizSection; chart-card surface rules in VizChartCard;
	 * pagination in the shared Pagination component. Only the "Citation
	 * statistics" divider is page-specific. */

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

	:global(html.dark) .section-divider {
		border-top-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
	}

	@media (--md-down) {
		.divider-heading {
			font-size: var(--font-size-heading-3);
		}
	}

	@media (--sm-down) {
		.divider-heading {
			font-size: var(--font-size-heading-4);
		}
	}
</style>
