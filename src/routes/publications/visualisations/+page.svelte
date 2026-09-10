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
	import NetworkMatrix from '$lib/components/visualisations/NetworkMatrix.svelte';
	import NetworkArcDiagram from '$lib/components/visualisations/NetworkArcDiagram.svelte';
	import EChartsTreemap from '$lib/components/visualisations/EChartsTreemap.svelte';
	import EChartsGanttChart from '$lib/components/visualisations/EChartsGanttChart.svelte';
	import LocationMap from '$lib/components/visualisations/LocationMap.svelte';
	import VizChartCard from '$lib/components/visualisations/VizChartCard.svelte';
	import VizSection from '$lib/components/visualisations/VizSection.svelte';
	import ContentsLedger from '$lib/components/common/ContentsLedger.svelte';
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
	import { scaleKeyTerms } from '$lib/utils/keyTerms';
	import { corpusAnalysis, getCombinedWordCloudData, getCombinedBigrams } from '$lib/data/analysis';
	import type { NgramFrequency } from '$lib/types';

	type CitationYearData = { year: number; count: number };
	type CitedAuthorData = { author: string; count: number };
	type LanguageData = { language: string; count: number };

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

	/**
	 * Language shares as `.hbar` proportion rows. A two-value split is a
	 * proportion, not a distribution: the sanctioned meter states it in one line
	 * per language where a doughnut spent a whole plate on two arcs. The
	 * denominator is the language tally rather than the work count, because a
	 * bilingual work is counted once in each language.
	 */
	const languageShares = $derived.by(() => {
		const total = languageData.reduce((sum, d) => sum + d.count, 0);
		if (total === 0) return [];
		return [...languageData]
			.sort((a, b) => b.count - a.count || a.language.localeCompare(b.language))
			.map((d) => ({
				language: d.language,
				count: d.count,
				pct: (d.count / total) * 100
			}));
	});

	// Keyword frequencies, scaled for the key-terms cloud. Each term links to the
	// bibliography filtered to it — the cloud is an index, not an ornament.
	const keywordCounts = $derived(
		tallyBy(allPublications, (pub) => pub.tags).map(({ key, count }) => ({ word: key, count }))
	);
	const keywordTerms = $derived(scaleKeyTerms(keywordCounts));
	const uniqueKeywordCount = $derived(keywordCounts.length);

	// Helper function to format type labels for display
	const formatTypeLabel = (type: string): string =>
		PUBLICATION_TYPE_CHART_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1);

	const publicationTypesForStack = $derived(Object.keys(publicationsByType).sort());

	// Formatted labels for display in the chart
	const formattedPublicationTypes = $derived(
		publicationTypesForStack.map((type) => formatTypeLabel(type))
	);

	/**
	 * Categorical colours for the publication stack, keyed by the same label the
	 * rows carry. The order is corpus size descending (journal article, book
	 * chapter, bulletin article, book, blog post, special issue, working paper at
	 * the time of writing), ties broken on the raw type key so a rebuild never
	 * reshuffles the plate. Seven is the palette's length; every remaining type
	 * folds into "Other" inside the chart. Deriving the order from the data keeps
	 * the largest series on `--sys-viz-1` (pine) as the corpus grows.
	 */
	const publicationTypeColors = $derived(
		Object.fromEntries(
			Object.entries(publicationsByType)
				.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
				.slice(0, 7)
				.map(([type], i) => [formatTypeLabel(type), `var(--sys-viz-${i + 1})`])
		)
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

	const totalPages = $derived(pagesPerYearData.reduce((sum, d) => sum + d.pages, 0));

	// Calculate total citations reactively
	const totalCitations = $derived(
		citationsPerYearData.reduce((sum: number, item: CitationYearData) => sum + item.count, 0)
	);

	// The newest bar on a year axis takes pine — the Year-Bar Strip idiom. Every
	// other bar on the page is ink.
	const latestPagesYear = $derived(pagesPerYearData.at(-1)?.year);
	const latestCitationYear = $derived(citationsPerYearData.at(-1)?.year);

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

	// Accessor functions for the year-axis bar charts
	const getYear = (d: CitationYearData) => d.year;
	const getCitationCount = (d: CitationYearData) => d.count;
	const getPagesYear = (d: PagesPerYearData) => d.year;
	const getPagesCount = (d: PagesPerYearData) => d.pages;

	// Accessor functions for the horizontal bar charts
	const getAuthorName = (d: CitedAuthorData) => d.author;
	const getAuthorCitationCount = (d: CitedAuthorData) => d.count;

	// Pagination state for the cited-authors chart (1-based, Pagination component)
	const AUTHORS_PER_PAGE = 15;
	let currentPage = $state(1);
	const pagedAuthors = $derived(
		citedAuthorsData.slice((currentPage - 1) * AUTHORS_PER_PAGE, currentPage * AUTHORS_PER_PAGE)
	);

	// Full-text language filter, shared by the term cloud and the bigrams chart.
	type CorpusLanguage = 'all' | 'en' | 'fr';
	let corpusLanguage = $state<CorpusLanguage>('all');

	/** Reader-facing name of the current filter, for the empty-state messages. */
	const languageLabel = (lang: CorpusLanguage) =>
		lang === 'all' ? 'any' : lang === 'en' ? 'English' : 'French';

	// Get publication IDs for the selected language
	const analysedPublicationIds = $derived.by(() => {
		if (corpusLanguage === 'en') {
			return corpusAnalysis.byLanguage.en;
		} else if (corpusLanguage === 'fr') {
			return corpusAnalysis.byLanguage.fr;
		}
		return [...corpusAnalysis.byLanguage.en, ...corpusAnalysis.byLanguage.fr];
	});

	// Lemmatised full-text terms, scaled for the key-terms cloud.
	const fullTextTerms = $derived.by(() => {
		if (analysedPublicationIds.length === 0) return [];
		return scaleKeyTerms(getCombinedWordCloudData(analysedPublicationIds, { maxWords: 100 }));
	});

	// Get bigrams data for selected language
	const bigramsData = $derived.by(() => {
		if (analysedPublicationIds.length === 0) return [];
		return getCombinedBigrams(analysedPublicationIds, 30);
	});

	// Accessor functions for bigrams chart
	const getBigramName = (d: NgramFrequency) => d.ngram;
	const getBigramCount = (d: NgramFrequency) => d.count;

	// ---------- The corpus, in numbers ----------

	const publicationYears = $derived(allPublications.map((pub) => pub.year));
	const firstYear = $derived(Math.min(...publicationYears));
	const lastYear = $derived(Math.max(...publicationYears));
	const yearSpan = $derived(lastYear - firstYear + 1);

	type CorpusStat = { label: string; value: string; accent?: boolean };

	const corpusStats = $derived<CorpusStat[]>([
		{ label: 'Works', value: String(allPublications.length), accent: true },
		{ label: 'Years covered', value: `${firstYear}–${lastYear}` },
		{ label: 'Languages', value: String(languageData.length) },
		{ label: 'Keywords', value: String(uniqueKeywordCount) },
		{ label: 'Co-authors and contributors', value: String(collaboratorCount) },
		{ label: 'Citations recorded', value: String(totalCitations) },
		{ label: 'Citing authors', value: String(citedAuthorsData.length) }
	]);

	// ---------- Section register ----------

	/** `12 works`, or an empty string when there is nothing to count. */
	const countOf = (n: number, singular: string, plural = `${singular}s`) =>
		n > 0 ? `${n} ${n === 1 ? singular : plural}` : '';

	/**
	 * One entry per section, in page order. `ContentsLedger` renders it as the
	 * contents ledger and each entry is spread into its own `VizSection`, so the
	 * ledger and the section heads can never drift apart.
	 */
	const sections = $derived({
		perYear: {
			id: 'per-year',
			no: '§ 1',
			title: 'Publications per year, by type',
			count: countOf(allPublications.length, 'publication')
		},
		pages: {
			id: 'pages-per-year',
			no: '§ 2',
			title: 'Pages published per year',
			count: countOf(totalPages, 'page')
		},
		languages: {
			id: 'languages',
			no: '§ 3',
			title: 'Publications by language',
			count: countOf(languageData.length, 'language')
		},
		keywords: {
			id: 'keywords',
			no: '§ 4',
			title: 'Keywords, by frequency',
			count: countOf(uniqueKeywordCount, 'keyword')
		},
		keywordMatrix: {
			id: 'keyword-matrix',
			no: '§ 5',
			title: 'Keyword co-occurrence matrix',
			count: countOf(keywordNetwork.nodes.length, 'keyword')
		},
		fullText: {
			id: 'full-text-terms',
			no: '§ 6',
			title: 'Full-text terms, by frequency',
			count: countOf(analysedPublicationIds.length, 'publication analysed', 'publications analysed')
		},
		bigrams: {
			id: 'bigrams',
			no: '§ 7',
			title: 'Two-word phrases, by frequency',
			count: countOf(bigramsData.length, 'phrase')
		},
		collaborators: {
			id: 'collaborators',
			no: '§ 8',
			title: 'Author collaboration network',
			count: countOf(collaboratorCount, 'collaborator')
		},
		venues: {
			id: 'venues',
			no: '§ 9',
			title: 'Publication venues',
			count: countOf(totalVenues, 'venue')
		},
		projects: {
			id: 'project-timeline',
			no: '§ 10',
			title: 'Research projects, over time',
			count: countOf(projectTimelineData.length, 'project')
		},
		locations: {
			id: 'publisher-locations',
			no: '§ 11',
			title: 'Publisher locations',
			count:
				publisherLocationData.length > 0
					? `${publisherLocationData.length} countries, ${totalWithLocation} publications`
					: ''
		},
		citationsPerYear: {
			id: 'citations-per-year',
			no: '§ 12',
			title: 'Citations per year',
			count: countOf(totalCitations, 'citation')
		},
		citingAuthors: {
			id: 'citing-authors',
			no: '§ 13',
			title: 'Authors citing the work most often',
			count: countOf(citedAuthorsData.length, 'author')
		}
	});

	const contentsItems = $derived(Object.values(sections));

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
	description="The publication record counted: works per year and type, languages, keywords, venues, collaborators and recorded citations."
	keywords="publications, visualisations, citations, research analytics, Frédérick Madore"
/>

<JsonLd id="breadcrumb-json-ld-pub-viz" json={breadcrumbJsonLd} />
<div class="viz-page-container">
	<Breadcrumb items={breadcrumbItems} />
	<PageHeader title="Publication Visualisations" />

	<div class="viz-masthead">
		<PageIntro>
			The publication record, counted: {allPublications.length} works over {yearSpan} years, read by year,
			language, keyword, venue and citation. Every figure below is computed from the same data files that
			set the bibliography.
		</PageIntro>

		<aside class="corpus-aside" aria-labelledby="corpus-in-numbers">
			<h2 class="rail-label" id="corpus-in-numbers">The corpus, in numbers</h2>
			<div class="stat-ledger">
				{#each corpusStats as stat (stat.label)}
					<div class="stat-row">
						<span>{stat.label}</span>
						<span class="stat-value" class:stat-value--accent={stat.accent}>{stat.value}</span>
					</div>
				{/each}
			</div>
		</aside>
	</div>

	<ContentsLedger items={contentsItems} />

	<VizSection
		{...sections.perYear}
		description="Every publication counted in the year it appeared and stacked by type, from the year and type recorded on each work."
		variant="stacked"
		height="450px"
		hasData={publicationsPerYearStackedData.length > 0 && publicationTypesForStack.length > 0}
		empty="No publication years recorded."
	>
		<EChartsStackedBarChart
			data={publicationsPerYearStackedData}
			keys={formattedPublicationTypes}
			colorMap={publicationTypeColors}
			measure="Publications per year by type"
			itemSingular="publication"
			itemPlural="publications"
		/>
	</VizSection>

	<VizSection
		{...sections.pages}
		description="Pages published each year, counting only the works whose record carries a page count; the newest year is marked."
		height="400px"
		hasData={pagesPerYearData.length > 0}
		empty="No page counts recorded."
	>
		<EChartsBarChart
			data={pagesPerYearData}
			xAccessor={getPagesYear}
			yAccessor={getPagesCount}
			accentKey={latestPagesYear}
			measure="Pages published per year"
			itemSingular="page"
			itemPlural="pages"
		/>
	</VizSection>

	<VizSection
		{...sections.languages}
		description="The share of the record written in each language. A work declaring two languages is counted once in each, so the bars are shares of the language tally rather than of the work count."
	>
		{#if languageShares.length > 0}
			<ul class="proportion-ledger">
				{#each languageShares as row (row.language)}
					<li>
						<div class="proportion-row">
							<span class="proportion-key">{row.language}</span>
							<span class="hbar" style="--pct: {row.pct.toFixed(1)}%" aria-hidden="true"></span>
							<span class="proportion-meta">{row.count} · {Math.round(row.pct)}%</span>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="viz-empty">No languages recorded.</p>
		{/if}
	</VizSection>

	<VizSection
		{...sections.keywords}
		description="The keywords assigned to the publications, the sixty most frequent set at a size proportional to the number of works carrying each. Select a term to open the bibliography filtered to it."
	>
		{#if keywordTerms.length > 0}
			<div class="key-terms">
				<!-- eslint-disable svelte/no-navigation-without-resolve -- tag filter URLs -->
				{#each keywordTerms as term (term.word)}
					<a
						href="{base}/publications?tag={encodeURIComponent(term.word)}"
						rel="nofollow"
						style="font-size: {term.size}px;"
						title={countOf(term.count, 'publication')}>{term.word}</a
					>
				{/each}
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		{:else}
			<p class="viz-empty">No keywords recorded.</p>
		{/if}
	</VizSection>

	<VizSection
		{...sections.keywordMatrix}
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
					searchPlaceholder="Type a keyword…"
					entityLabel="keywords"
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
		{...sections.fullText}
		description="The sixty most frequent terms in the full text of the publications that have been analysed, lemmatised so that inflected forms are counted together."
	>
		{#snippet controls()}
			{#if corpusAnalysis.publicationCount > 0}
				<LanguageToggle
					bind:current={corpusLanguage}
					enCount={corpusAnalysis.byLanguage.en.length}
					frCount={corpusAnalysis.byLanguage.fr.length}
				/>
			{/if}
		{/snippet}
		{#if fullTextTerms.length > 0}
			<div class="key-terms">
				{#each fullTextTerms as term (term.word)}
					<span style="font-size: {term.size}px;" title={countOf(term.count, 'occurrence')}
						>{term.word}</span
					>
				{/each}
			</div>
		{:else}
			<p class="viz-empty">
				{#if corpusAnalysis.publicationCount === 0}
					No full-text analysis is available for this visualisation.
				{:else}
					No full-text analysis is available for {languageLabel(corpusLanguage)} publications.
				{/if}
			</p>
		{/if}
	</VizSection>

	<VizSection
		{...sections.bigrams}
		description="The most frequent two-word phrases in the same full-text corpus, counted after lemmatisation."
		variant="bigrams"
		height="{Math.max(400, bigramsData.length * 28 + 70)}px"
		placeholderHeight="400px"
		hasData={corpusAnalysis.publicationCount > 0 && bigramsData.length > 0}
	>
		{#snippet controls()}
			{#if corpusAnalysis.publicationCount > 0}
				<LanguageToggle
					bind:current={corpusLanguage}
					enCount={corpusAnalysis.byLanguage.en.length}
					frCount={corpusAnalysis.byLanguage.fr.length}
				/>
			{/if}
		{/snippet}
		{#snippet placeholder()}
			<p class="viz-empty">
				{#if corpusAnalysis.publicationCount === 0}
					No full-text analysis is available for this visualisation.
				{:else}
					No phrase data is available for {languageLabel(corpusLanguage)} publications.
				{/if}
			</p>
		{/snippet}
		<EChartsHorizontalBarChart
			data={bigramsData}
			xAccessor={getBigramCount}
			yAccessor={getBigramName}
			measure="Two-word phrases by frequency"
			itemSingular="phrase"
			itemPlural="phrases"
		/>
	</VizSection>

	<VizSection
		{...sections.collaborators}
		description="Collaborators ranked by how many publications we share. The arcs on the left join people who have worked with each other. My own link to each of them is a given, so it is not drawn."
		variant="arc"
		height="{collabArcHeight}px"
		placeholderHeight="400px"
		hasData={collaboratorCount > 0}
		empty="No collaborators recorded."
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
					searchPlaceholder="Type a name…"
					entityLabel="collaborators"
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
		{...sections.venues}
		description="Where the work appears: journals and report series in one block, book publishers in the other, each venue sized by the number of works it carries. Select a block to zoom into it."
		variant="treemap"
		placeholderHeight="500px"
		hasData={venueTreemapData.length > 0}
		empty="No venues recorded."
	>
		<EChartsTreemap data={venueTreemapData} title="Publication venues" />
	</VizSection>

	<VizSection
		{...sections.projects}
		description="Each research project drawn across the years it ran, with a marker for every publication produced within it."
		variant="gantt"
		height="450px"
		hasData={projectTimelineData.length > 0}
		empty="No project data recorded."
	>
		<EChartsGanttChart data={projectTimelineData} />
	</VizSection>

	<VizSection
		{...sections.locations}
		description="The countries of the publishers and journals, taken from the place of publication recorded on each work. Switch between proportional markers and country shading; select a country to list its publications."
		variant="map"
		height="500px"
		placeholderHeight="400px"
		hasData={publisherLocationData.length > 0}
		empty="No publisher locations recorded."
	>
		<LocationMap data={publisherLocationData} basePath="/publications" itemLabel="publication" />
	</VizSection>

	<VizSection
		{...sections.citationsPerYear}
		description="Citations counted in the year the citing work appeared. They are swept from OpenAlex and from full-text searches of Google Books, HAL and Wikipedia, then recorded against the work cited, so this counts what the record holds rather than what an index estimates."
		height="400px"
		hasData={citationsPerYearData.length > 0}
		empty="No citations recorded."
	>
		<EChartsBarChart
			data={citationsPerYearData}
			xAccessor={getYear}
			yAccessor={getCitationCount}
			accentKey={latestCitationYear}
			measure="Citations per year"
			itemSingular="citation"
			itemPlural="citations"
		/>
	</VizSection>

	<!-- Paginated: the chart is re-keyed per page and followed by the pager, so
	     this section composes VizChartCard itself rather than delegating. -->
	<VizSection
		{...sections.citingAuthors}
		description="The authors who cite the work most often, from the same recorded citations. The scale is fixed across pages so bars stay comparable."
	>
		{#if citedAuthorsData.length > 0}
			{#snippet authorChart(authorsToShow: CitedAuthorData[])}
				<VizChartCard height="{Math.max(350, authorsToShow.length * 35 + 70)}px">
					<EChartsHorizontalBarChart
						data={authorsToShow}
						xAccessor={getAuthorCitationCount}
						yAccessor={getAuthorName}
						measure="Citations per author"
						maxValue={maxCitationCount}
						itemSingular="author"
						itemPlural="authors"
						descriptionLead="Most citations"
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
					<p class="viz-empty">No citing authors recorded.</p>
				{/snippet}
			</VizChartCard>
		{/if}
	</VizSection>
</div>

<style>
	/*
	 * Page container comes from viz-page.css; section chrome from VizSection;
	 * the chart plate from VizChartCard. What is local here is the masthead
	 * apparatus (standfirst beside the stat ledger) and the two typeset views
	 * that replaced chart libraries: the key-terms clouds and the language
	 * proportion ledger.
	 */

	/* Standfirst left, "the corpus, in numbers" right — the masthead asserts,
	   the apparatus reassures. Stacks below --lg. */
	.viz-masthead {
		display: grid;
		gap: var(--space-lg);
		margin-bottom: var(--space-2xl);
	}

	@media (--lg) {
		.viz-masthead {
			grid-template-columns: 1fr minmax(16rem, 22rem);
			gap: var(--space-2xl);
			align-items: start;
		}
	}

	.corpus-aside {
		border-top: var(--rule-hairline) solid var(--color-hairline);
		padding-top: var(--rule-gap);
	}

	/* Key-terms clouds. `.key-terms` (ink-signal.css) sets the flow and the
	   serif; the terms that link to a filtered index need the resting colour of
	   the rest of the cloud rather than the link ink. */
	.key-terms a {
		color: var(--color-text-soft);
		text-decoration: none;
	}

	.key-terms a:hover,
	.key-terms a:focus-visible {
		color: var(--color-accent);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	/* Empty state for the sections that are typeset rather than plated. */
	.viz-empty {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		color: var(--color-text-light);
		max-width: var(--measure-prose);
		margin: 0;
	}
</style>
