<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
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
	import PublisherLocationMap, {
		type PublisherLocationData
	} from '$lib/components/visualisations/PublisherLocationMap.svelte';
	import EChartsWordCloud from '$lib/components/visualisations/EChartsWordCloud.svelte';
	import { corpusAnalysis, getCombinedWordCloudData, getCombinedBigrams } from '$lib/data/analysis';
	import type { NgramFrequency } from '$lib/types';

	type CitationYearData = { year: number; count: number };
	type CitedAuthorData = { author: string; count: number };
	type LanguageData = { language: string; count: number };
	type KeywordData = { keyword: string; count: number };

	// Types for venue treemap
	interface TreemapChild {
		name: string;
		value: number;
		publications: string[];
	}

	interface TreemapNode {
		name: string;
		children: TreemapChild[];
	}

	// Types for project timeline
	interface ProjectPublication {
		title: string;
		year: number;
		type: string;
	}

	interface ProjectData {
		name: string;
		startYear: number;
		endYear: number;
		publications: ProjectPublication[];
	}

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

	// Calculate keyword frequency data
	const keywordData = $derived(
		(() => {
			const keywordCounts: Record<string, number> = {};
			allPublications.forEach((pub) => {
				if (pub.tags && Array.isArray(pub.tags)) {
					pub.tags.forEach((tag: string) => {
						if (tag && tag.trim()) {
							keywordCounts[tag] = (keywordCounts[tag] || 0) + 1;
						}
					});
				}
			});
			return Object.entries(keywordCounts)
				.map(([keyword, count]) => ({ keyword, count }))
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
			const collaborations: Record<string, { publications: Set<string>; isContributor: boolean }> =
				{};
			const coAuthorConnections: Array<{
				source: string;
				target: string;
				publications: Set<string>;
			}> = [];
			const contributorConnections: Array<{
				source: string;
				target: string;
				publications: Set<string>;
			}> = [];

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

				// Count collaborations with Frédérick Madore
				coAuthors.forEach((author) => {
					if (!collaborations[author]) {
						collaborations[author] = { publications: new Set<string>(), isContributor: false };
					}
					// Use Set to automatically deduplicate publication titles
					collaborations[author].publications.add(pub.title);
				});

				// Track connections between co-authors (for publications with 3+ authors including Frédérick)
				if (coAuthors.length >= 2) {
					for (let i = 0; i < coAuthors.length; i++) {
						for (let j = i + 1; j < coAuthors.length; j++) {
							const author1 = coAuthors[i];
							const author2 = coAuthors[j];

							// Find or create connection (order-independent)
							let connection = coAuthorConnections.find(
								(c) =>
									(c.source === author1 && c.target === author2) ||
									(c.source === author2 && c.target === author1)
							);

							if (!connection) {
								connection = {
									source: author1,
									target: author2,
									publications: new Set<string>()
								};
								coAuthorConnections.push(connection);
							}

							connection.publications.add(pub.title);
						}
					}
				}

				// Extract TOC authors (contributors to edited volumes and special issues)
				if (pub.tableOfContents && (pub.type === 'book' || pub.type === 'special-issue')) {
					const tocAuthors: string[] = [];
					pub.tableOfContents.forEach((entry) => {
						if (typeof entry !== 'string' && entry.authors) {
							entry.authors.forEach((author) => {
								if (author !== 'Frédérick Madore') {
									tocAuthors.push(author);
									// Add to collaborations as contributor
									if (!collaborations[author]) {
										collaborations[author] = {
											publications: new Set<string>(),
											isContributor: true
										};
									}
									collaborations[author].publications.add(pub.title);
								}
							});
						}
					});

					// Track connections between TOC authors (contributors)
					if (tocAuthors.length >= 2) {
						for (let i = 0; i < tocAuthors.length; i++) {
							for (let j = i + 1; j < tocAuthors.length; j++) {
								const author1 = tocAuthors[i];
								const author2 = tocAuthors[j];

								// Find or create contributor connection (order-independent)
								let connection = contributorConnections.find(
									(c) =>
										(c.source === author1 && c.target === author2) ||
										(c.source === author2 && c.target === author1)
								);

								if (!connection) {
									connection = {
										source: author1,
										target: author2,
										publications: new Set<string>()
									};
									contributorConnections.push(connection);
								}

								connection.publications.add(pub.title);
							}
						}
					}
				}
			});

			// Convert to array format expected by the network graph
			const collaborators = Object.entries(collaborations).map(([author, data]) => ({
				author,
				collaborationCount: data.publications.size, // Count unique publications
				publications: Array.from(data.publications), // Convert Set back to Array
				isContributor: data.isContributor
			}));

			// Convert co-author connections to array format
			const connections = coAuthorConnections.map((conn) => ({
				source: conn.source,
				target: conn.target,
				publicationCount: conn.publications.size,
				publications: Array.from(conn.publications)
			}));

			// Convert contributor connections to array format
			const contribConnections = contributorConnections.map((conn) => ({
				source: conn.source,
				target: conn.target,
				publicationCount: conn.publications.size,
				publications: Array.from(conn.publications)
			}));

			return {
				collaborators,
				coAuthorConnections: connections,
				contributorConnections: contribConnections
			};
		})()
	);

	// Calculate publication venue treemap data
	const venueTreemapData = $derived(
		(() => {
			// Group publications by venue type and venue name
			const journals: Record<string, { count: number; publications: string[] }> = {};
			const publishers: Record<string, { count: number; publications: string[] }> = {};
			const books: Record<string, { count: number; publications: string[] }> = {};

			allPublications.forEach((pub) => {
				// Journal articles and special issues
				if (pub.journal && (pub.type === 'article' || pub.type === 'special-issue' || pub.type === 'bulletin-article')) {
					if (!journals[pub.journal]) {
						journals[pub.journal] = { count: 0, publications: [] };
					}
					journals[pub.journal].count++;
					journals[pub.journal].publications.push(pub.title);
				}

				// Books (monographs) by publisher
				if (pub.publisher && pub.type === 'book') {
					if (!publishers[pub.publisher]) {
						publishers[pub.publisher] = { count: 0, publications: [] };
					}
					publishers[pub.publisher].count++;
					publishers[pub.publisher].publications.push(pub.title);
				}

				// Book chapters - group by the book they appear in
				if (pub.type === 'chapter' && pub.book) {
					if (!books[pub.book]) {
						books[pub.book] = { count: 0, publications: [] };
					}
					books[pub.book].count++;
					books[pub.book].publications.push(pub.title);
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

			// Add publishers category (for books)
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

			// Add edited volumes category (books where chapters appear)
			if (Object.keys(books).length > 0) {
				treemapData.push({
					name: 'Edited Volumes',
					children: Object.entries(books)
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

	// Calculate research projects timeline data
	const projectTimelineData = $derived(
		(() => {
			// Group publications by project
			const projectMap: Record<
				string,
				{ publications: ProjectPublication[]; minYear: number; maxYear: number }
			> = {};

			allPublications.forEach((pub) => {
				if (pub.project && pub.project.trim()) {
					const projectName = pub.project.trim();
					if (!projectMap[projectName]) {
						projectMap[projectName] = {
							publications: [],
							minYear: pub.year,
							maxYear: pub.year
						};
					}
					projectMap[projectName].publications.push({
						title: pub.title,
						year: pub.year,
						type: pub.type
					});
					projectMap[projectName].minYear = Math.min(projectMap[projectName].minYear, pub.year);
					projectMap[projectName].maxYear = Math.max(projectMap[projectName].maxYear, pub.year);
				}
			});

			// Convert to array format and sort by start year
			const projectData: ProjectData[] = Object.entries(projectMap)
				.map(([name, data]) => ({
					name,
					startYear: data.minYear,
					endYear: data.maxYear,
					publications: data.publications.sort((a, b) => a.year - b.year)
				}))
				.sort((a, b) => a.startYear - b.startYear);

			return projectData;
		})()
	);

	// Calculate publisher location data for map visualization
	const publisherLocationData = $derived(
		(() => {
			const locationMap: Record<
				string,
				{ count: number; publications: Array<{ id: string; title: string; publisher?: string; type: string }> }
			> = {};

			allPublications.forEach((pub) => {
				if (pub.publisherLocation && pub.publisherLocation.trim()) {
					const location = pub.publisherLocation.trim();
					if (!locationMap[location]) {
						locationMap[location] = { count: 0, publications: [] };
					}
					locationMap[location].count++;
					locationMap[location].publications.push({
						id: pub.id,
						title: pub.title,
						publisher: pub.publisher,
						type: pub.type
					});
				}
			});

			// Convert to array and sort by count
			const locationData: PublisherLocationData[] = Object.entries(locationMap)
				.map(([country, data]) => ({
					country,
					count: data.count,
					publications: data.publications
				}))
				.sort((a, b) => b.count - a.count);

			return locationData;
		})()
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

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Number of pages per year</h2>
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

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Publication Languages</h2>
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

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Keyword Frequency
			{#if keywordData.length > 0}
				({keywordData.length} unique keywords)
			{/if}
		</h2>
		{#if keywordData.length > 0}
			<div class="chart-wrapper bubble-chart" style="height: 550px;">
				<D3BubbleChart
					data={keywordData}
					nameAccessor={getKeywordName}
					valueAccessor={getKeywordCount}
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 550px;">
				<p class="text-light">No keyword data available to display for this visualization.</p>
			</div>
		{/if}
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
			<div class="language-toggle">
				<span class="toggle-label">Filter by language:</span>
				<div class="toggle-buttons">
					<button
						class="toggle-btn {wordCloudLanguage === 'all' ? 'active' : ''}"
						onclick={() => (wordCloudLanguage = 'all')}
					>
						All ({corpusAnalysis.byLanguage.en.length + corpusAnalysis.byLanguage.fr.length})
					</button>
					<button
						class="toggle-btn {wordCloudLanguage === 'en' ? 'active' : ''}"
						onclick={() => (wordCloudLanguage = 'en')}
					>
						English ({corpusAnalysis.byLanguage.en.length})
					</button>
					<button
						class="toggle-btn {wordCloudLanguage === 'fr' ? 'active' : ''}"
						onclick={() => (wordCloudLanguage = 'fr')}
					>
						French ({corpusAnalysis.byLanguage.fr.length})
					</button>
				</div>
			</div>

			{#if wordCloudData().length > 0}
				<div class="chart-wrapper wordcloud-chart" style="height: 500px;">
					<EChartsWordCloud
						words={wordCloudData()}
						maxWords={100}
						shape="circle"
						minFontSize={12}
						maxFontSize={60}
					/>
				</div>
			{:else}
				<div class="placeholder-message" style="height: 500px;">
					<p class="text-light">
						No text analysis data available for {wordCloudLanguage === 'all'
							? 'any'
							: wordCloudLanguage === 'en'
								? 'English'
								: 'French'} publications.
					</p>
				</div>
			{/if}
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No text analysis data available to display for this visualization.</p>
			</div>
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
			<div class="language-toggle">
				<span class="toggle-label">Filter by language:</span>
				<div class="toggle-buttons">
					<button
						class="toggle-btn {wordCloudLanguage === 'all' ? 'active' : ''}"
						onclick={() => (wordCloudLanguage = 'all')}
					>
						All ({corpusAnalysis.byLanguage.en.length + corpusAnalysis.byLanguage.fr.length})
					</button>
					<button
						class="toggle-btn {wordCloudLanguage === 'en' ? 'active' : ''}"
						onclick={() => (wordCloudLanguage = 'en')}
					>
						English ({corpusAnalysis.byLanguage.en.length})
					</button>
					<button
						class="toggle-btn {wordCloudLanguage === 'fr' ? 'active' : ''}"
						onclick={() => (wordCloudLanguage = 'fr')}
					>
						French ({corpusAnalysis.byLanguage.fr.length})
					</button>
				</div>
			</div>

			{#if bigramsData().length > 0}
				<div
					class="chart-wrapper bigrams-chart"
					style="height: {Math.max(400, bigramsData().length * 28 + 70)}px;"
				>
					<EChartsHorizontalBarChart
						data={bigramsData()}
						xAccessor={getBigramCount}
						yAccessor={getBigramName}
						xAxisLabel="Frequency"
						barColor="var(--color-accent)"
					/>
				</div>
			{:else}
				<div class="placeholder-message" style="height: 400px;">
					<p class="text-light">
						No bigram data available for {wordCloudLanguage === 'all'
							? 'any'
							: wordCloudLanguage === 'en'
								? 'English'
								: 'French'} publications.
					</p>
				</div>
			{/if}
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">No text analysis data available to display for this visualization.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Author Collaboration Network
			{#if collaborationData.collaborators.length > 0}
				({collaborationData.collaborators.length} collaborators)
			{/if}
		</h2>
		{#if collaborationData.collaborators.length > 0}
			<div class="chart-wrapper network-chart" style="height: 500px;">
				<EChartsNetworkGraph
					data={collaborationData.collaborators}
					coAuthorConnections={collaborationData.coAuthorConnections}
					contributorConnections={collaborationData.contributorConnections}
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
		{#if venueTreemapData.length > 0}
			<div class="chart-wrapper treemap-chart" style="height: 500px;">
				<EChartsTreemap data={venueTreemapData} title="Publication Venues" />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No venue data available to display for this visualization.</p>
			</div>
		{/if}
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
		{#if projectTimelineData.length > 0}
			<div class="chart-wrapper gantt-chart" style="height: 450px;">
				<EChartsGanttChart data={projectTimelineData} />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 450px;">
				<p class="text-light">No project data available to display for this visualization.</p>
			</div>
		{/if}
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
		{#if publisherLocationData.length > 0}
			<div class="chart-wrapper map-chart" style="height: 500px;">
				<PublisherLocationMap data={publisherLocationData} />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">No publisher location data available to display for this visualization.</p>
			</div>
		{/if}
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

	<section class="visualization-section scroll-reveal">
		<h2 class="section-heading">
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
		padding: var(--space-xl) var(--space-md);
	}

	/* Section headings - consistent typography using design tokens */
	.section-heading {
		font-size: var(--font-size-heading-3);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-heading);
	}

	/* Section divider - for "Citation statistics" heading */
	.section-divider {
		margin: var(--space-xl) 0;
		padding-top: var(--space-lg);
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent);
	}

	.divider-heading {
		font-size: var(--font-size-heading-2);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0;
		line-height: var(--line-height-heading);
	}

	/* Chart wrapper with glassmorphism - consistent with iframe-section and pdf-section */
	.chart-wrapper,
	.placeholder-message {
		position: relative;
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-md);
		/* Enhanced glassmorphism with subtle gradient overlay */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	.chart-wrapper {
		padding: var(--space-lg);
		/* Optimize rendering performance */
		contain: layout style paint;
		will-change: transform;
		/* Ensure proper height reservation */
		min-height: var(--iframe-height-xs);
	}

	/* Hover effect matching iframe-section and pdf-section patterns */
	.chart-wrapper:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
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

	.bubble-chart {
		height: 850px;
		/* Explicit height for bubble chart */
		contain: strict;
		overflow: visible;
	}

	.treemap-chart {
		height: 500px;
		/* Explicit height for treemap */
		contain: strict;
	}

	.gantt-chart {
		height: 450px;
		/* Explicit height for Gantt chart */
		contain: strict;
	}

	.map-chart {
		height: 500px;
		/* Explicit height for map */
		contain: layout style;
	}

	.wordcloud-chart {
		height: 500px;
		/* Explicit height for word cloud */
		contain: strict;
	}

	.bigrams-chart {
		/* Height is dynamic based on data */
		contain: layout style;
	}

	/* Language toggle styles */
	.language-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		flex-wrap: wrap;
	}

	.toggle-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.toggle-buttons {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.toggle-btn {
		padding: var(--space-xs) var(--space-md);
		border: var(--border-width-thin) solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.toggle-btn:hover:not(.active) {
		background-color: var(--color-surface-alt);
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
	}

	.toggle-btn.active {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	/* Section description text */
	.section-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		margin-top: calc(-1 * var(--space-sm));
		margin-bottom: var(--space-md);
		line-height: var(--line-height-relaxed);
	}

	.placeholder-message {
		padding: var(--space-lg);
		min-height: var(--iframe-height-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		/* Prevent layout shifts */
		contain: layout style;
	}

	/* Scroll animations now use global .scroll-reveal class from animations.css */
	/* Chart wrapper hover effect still needs reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.chart-wrapper:hover {
			transform: none;
		}
	}

	/* Dark mode adjustments - consistent with iframe-section and pdf-section */
	:global(html.dark) .chart-wrapper,
	:global(html.dark) .placeholder-message {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 6%, transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	:global(html.dark) .section-divider {
		border-top-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	/* Mobile responsiveness using PostCSS custom media */
	@media (--md-down) {
		.page-container {
			padding: var(--space-md) var(--space-sm);
		}

		.chart-wrapper {
			padding: var(--space-md);
		}

		.stacked-chart {
			height: calc(var(--iframe-height-sm) - var(--space-4xl));
		}

		.network-chart {
			height: var(--iframe-height-sm);
		}

		.bubble-chart {
			height: 550px;
		}

		.treemap-chart {
			height: 450px;
		}

		.gantt-chart {
			height: 400px;
		}

		.map-chart {
			height: 400px;
		}

		.wordcloud-chart {
			height: 450px;
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
		.chart-wrapper {
			padding: var(--space-sm);
		}

		.stacked-chart {
			height: calc(var(--iframe-height-xs) + var(--space-3xl));
		}

		.network-chart {
			height: calc(var(--iframe-height-xs) + var(--space-3xl));
		}

		.bubble-chart {
			height: 450px;
		}

		.treemap-chart {
			height: 380px;
		}

		.gantt-chart {
			height: 350px;
		}

		.map-chart {
			height: 350px;
		}

		.wordcloud-chart {
			height: 380px;
		}

		.language-toggle {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.toggle-btn {
			padding: var(--space-2xs) var(--space-sm);
			font-size: var(--font-size-xs);
		}

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
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent);
		padding-top: var(--space-md);
	}

	.pagination-btn {
		padding: var(--space-xs) var(--space-sm);
		border: var(--border-width-thin) solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--border-radius);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
		min-width: calc(var(--space-xl) + var(--space-xs));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pagination-btn:hover:not(:disabled) {
		background-color: var(--color-surface-alt);
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
	}

	.pagination-btn.active {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.pagination-btn:disabled {
		opacity: var(--opacity-medium-high);
		cursor: not-allowed;
	}

	.pagination-ellipsis {
		padding: var(--space-xs) var(--space-2xs);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		display: flex;
		align-items: center;
	}

	.pagination-info {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
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
