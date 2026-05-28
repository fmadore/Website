<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { base } from '$app/paths';
	import {
		allCommunications,
		communicationsByType,
		communicationsByProject
	} from '$lib/data/communications';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import EChartsHorizontalBarChart from '$lib/components/visualisations/EChartsHorizontalBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';
	import EChartsDoughnutChart from '$lib/components/visualisations/EChartsDoughnutChart.svelte';
	import EChartsNetworkGraph from '$lib/components/visualisations/EChartsNetworkGraph.svelte';
	import EChartsTreemap from '$lib/components/visualisations/EChartsTreemap.svelte';
	import EChartsGanttChart from '$lib/components/visualisations/EChartsGanttChart.svelte';
	import EChartsWordCloud from '$lib/components/visualisations/EChartsWordCloud.svelte';
	import D3BubbleChart from '$lib/components/visualisations/D3BubbleChart.svelte';
	import LocationMap from '$lib/components/visualisations/LocationMap.svelte';
	import VizChartCard from '$lib/components/visualisations/VizChartCard.svelte';
	import {
		buildLocationData,
		tallyBy,
		buildGroupedTreemap,
		buildProjectTimeline
	} from '$lib/utils/vizAggregation';
	import type { LocationDatum } from '$lib/data/geo';
	import type { Communication } from '$lib/types/communication';
	import type { WordFrequency } from '$lib/types';

	// ---------- Shared types for derived data ----------

	type LanguageCount = { language: string; count: number };
	type TypeCount = { type: string; count: number };
	type CountryCount = { country: string; count: number };
	type TagCount = { tag: string; count: number };

	// ---------- Helpers ----------

	const TYPE_LABELS: Record<string, string> = {
		conference: 'Conference paper',
		workshop: 'Workshop',
		seminar: 'Seminar',
		lecture: 'Lecture',
		panel: 'Panel organised',
		event: 'Academic event organised',
		podcast: 'Podcast'
	};
	const formatTypeLabel = (type: string): string =>
		TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);

	function normaliseLanguages(value: Communication['language']): string[] {
		if (!value) return [];
		if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
		return value
			.split(',')
			.map((v) => v.trim())
			.filter(Boolean);
	}

	// Every unique presenter across papers[] and participants[] plus the top-level
	// `authors` array. Used by the co-presenter network. Uses a plain record for
	// deduplication so the linter doesn't flag the Set as mutable reactive state.
	function extractCoPresenters(comm: Communication): string[] {
		const seen: Record<string, true> = {};

		(comm.authors ?? []).forEach((a) => {
			if (a) seen[a] = true;
		});
		(comm.participants ?? []).forEach((p) => {
			if (p.name) seen[p.name] = true;
		});
		(comm.papers ?? []).forEach((paper) => {
			(paper.authors ?? []).forEach((a) => {
				if (a.name) seen[a.name] = true;
			});
		});

		return Object.keys(seen);
	}

	// ---------- Derived data for each visualisation ----------

	const communicationTypes = $derived(Object.keys(communicationsByType).sort());
	const formattedTypes = $derived(communicationTypes.map(formatTypeLabel));

	// 1. Communications per year by type (stacked bar).
	const perYearStackedData = $derived(
		(() => {
			const yearly: Record<number, Record<string, number>> = {};

			allCommunications.forEach((comm) => {
				const year = comm.year;
				const type = comm.type ?? 'other';

				if (!yearly[year]) {
					yearly[year] = {};
					communicationTypes.forEach((t) => (yearly[year][t] = 0));
				}
				yearly[year][type] = (yearly[year][type] || 0) + 1;
			});

			return Object.entries(yearly)
				.map(([yearStr, counts]) => {
					const row: Record<string, number> = { year: parseInt(yearStr) };
					communicationTypes.forEach((rawType, i) => {
						row[formattedTypes[i]] = counts[rawType] || 0;
					});
					return row;
				})
				.sort((a, b) => (a.year as number) - (b.year as number));
		})()
	);

	// 2. Communications by type (doughnut).
	const typeDistribution = $derived<TypeCount[]>(
		communicationTypes
			.map((type) => ({
				type: formatTypeLabel(type),
				count: communicationsByType[type]?.length ?? 0
			}))
			.sort((a, b) => b.count - a.count)
	);
	const getTypeName = (d: TypeCount) => d.type;
	const getTypeCount = (d: TypeCount) => d.count;

	// 3. Language distribution (doughnut). Communications may declare a single
	// language, a comma-separated string, or an array — normaliseLanguages flattens
	// all three before the shared tally.
	const languageData = $derived<LanguageCount[]>(
		tallyBy(allCommunications, (comm) => normaliseLanguages(comm.language)).map(
			({ key, count }) => ({ language: key, count })
		)
	);
	const getLanguageName = (d: LanguageCount) => d.language;
	const getLanguageCount = (d: LanguageCount) => d.count;

	// 4. Communications by country (horizontal bar).
	const countryData = $derived<CountryCount[]>(
		tallyBy(allCommunications, (comm) => comm.country).map(({ key, count }) => ({
			country: key,
			count
		}))
	);
	const getCountryName = (d: CountryCount) => d.country;
	const getCountryCount = (d: CountryCount) => d.count;

	// 5. & 6. Tag frequencies — shared by bubble chart and word cloud.
	const tagFrequencyList = $derived<TagCount[]>(
		tallyBy(allCommunications, (comm) => comm.tags).map(({ key, count }) => ({
			tag: key,
			count
		}))
	);
	const getTagName = (d: TagCount) => d.tag;
	const getTagCount = (d: TagCount) => d.count;

	const tagWordCloudData = $derived<WordFrequency[]>(
		tagFrequencyList.map((t) => ({ word: t.tag, count: t.count }))
	);

	// 7. Co-presenter network — anchored on Frédérick Madore, radiating out to
	// every co-author, panel participant, and paper author.
	const CENTER_AUTHOR = 'Frédérick Madore';

	const copresenterNetworkData = $derived(
		(() => {
			// For each non-centre presenter, track which communication titles they
			// share with the centre.
			const collabMap: Record<string, Set<string>> = {};
			// Edges between non-centre presenters (they co-presented together in the
			// same communication as the centre).
			const pairs: Record<string, { source: string; target: string; publications: Set<string> }> =
				{};

			allCommunications.forEach((comm) => {
				const presenters = extractCoPresenters(comm).filter((name) => name !== CENTER_AUTHOR);
				if (presenters.length === 0) return;

				presenters.forEach((name) => {
					if (!collabMap[name]) collabMap[name] = new Set();
					collabMap[name].add(comm.title);
				});

				// Pairwise edges between non-centre presenters on this communication.
				for (let i = 0; i < presenters.length; i++) {
					for (let j = i + 1; j < presenters.length; j++) {
						const [a, b] = [presenters[i], presenters[j]].sort();
						const key = `${a}|${b}`;
						if (!pairs[key]) {
							pairs[key] = { source: a, target: b, publications: new Set() };
						}
						pairs[key].publications.add(comm.title);
					}
				}
			});

			const collaborators = Object.entries(collabMap)
				.map(([author, titles]) => ({
					author,
					collaborationCount: titles.size,
					publications: Array.from(titles)
				}))
				.sort((a, b) => b.collaborationCount - a.collaborationCount);

			const connections = Object.values(pairs).map((p) => ({
				source: p.source,
				target: p.target,
				publicationCount: p.publications.size,
				publications: Array.from(p.publications)
			}));

			return { collaborators, connections };
		})()
	);

	// 8. Projects treemap — outer cells are research projects, inner cells are
	// communication types, sized by the number of communications.
	const projectTreemapData = $derived(
		buildGroupedTreemap(
			communicationsByProject,
			(comm) => formatTypeLabel(comm.type ?? 'other'),
			(comm) => comm.title
		)
	);
	const totalProjects = $derived(projectTreemapData.length);

	// 9. Locations map — aggregate communications by country and list the
	// individual titles (with their city as the subtitle) in the popup.
	const locationMapData: LocationDatum[] = $derived(
		buildLocationData(
			allCommunications,
			(comm) => comm.country,
			(comm) => ({ id: comm.id, title: comm.title, subtitle: comm.location, type: comm.type })
		)
	);
	const totalMapped = $derived(locationMapData.reduce((sum, loc) => sum + loc.count, 0));

	// 10. Research project timeline — project spans with communication markers.
	const projectTimelineData = $derived(
		buildProjectTimeline(communicationsByProject, (comm) => ({
			title: comm.title,
			year: comm.year,
			type: comm.type ?? 'other'
		}))
	);

	// ---------- Breadcrumbs + SEO ----------

	const breadcrumbItems = [
		{ label: 'Conference Activity', href: `${base}/conference-activity` },
		{ label: 'Visualisations', href: `${base}/conference-activity/visualisations` }
	];
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-conf-activity-viz');
</script>

<SEO
	title="Conference Activity Visualisations | Frédérick Madore"
	description="Visualisations of academic conference activity: presentations per year, types, languages, countries, tag networks, research projects, and a geographic map of venues."
	keywords="conferences, presentations, visualisations, co-presenters, research projects, map, Frédérick Madore"
/>

<div class="page-container page-enter">
	<Breadcrumb items={breadcrumbItems} />
	<div class="scroll-reveal">
		<PageHeader title="Conference Activity Visualisations" />
	</div>

	<div class="scroll-reveal">
		<PageIntro>
			This page presents visualisations of my academic conference activity: conference papers,
			workshops, seminars, lectures, panels organised, events organised, and podcasts.
		</PageIntro>
	</div>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Conference activities per year by type</h2>
		<VizChartCard
			variant="stacked"
			height="450px"
			hasData={perYearStackedData.length > 0 && communicationTypes.length > 0}
		>
			<EChartsStackedBarChart
				data={perYearStackedData}
				keys={formattedTypes}
				xAxisLabel="Year"
				yAxisLabel="Number of activities"
			/>
			{#snippet placeholder()}
				<p class="text-light">No activity data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Activities by type
			{#if typeDistribution.length > 0}
				({typeDistribution.length} types)
			{/if}
		</h2>
		<VizChartCard height="480px" hasData={typeDistribution.length > 0}>
			<EChartsDoughnutChart
				data={typeDistribution}
				nameAccessor={getTypeName}
				valueAccessor={getTypeCount}
				title="Distribution of activities by type"
			/>
			{#snippet placeholder()}
				<p class="text-light">No type data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Languages
			{#if languageData.length > 0}
				({languageData.length} languages)
			{/if}
		</h2>
		<VizChartCard height="480px" hasData={languageData.length > 0}>
			<EChartsDoughnutChart
				data={languageData}
				nameAccessor={getLanguageName}
				valueAccessor={getLanguageCount}
				title="Distribution of activities by language"
			/>
			{#snippet placeholder()}
				<p class="text-light">No language data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Activities by country
			{#if countryData.length > 0}
				({countryData.length} countries)
			{/if}
		</h2>
		<VizChartCard
			height="{Math.max(350, countryData.length * 32 + 70)}px"
			placeholderHeight="400px"
			hasData={countryData.length > 0}
		>
			<EChartsHorizontalBarChart
				data={countryData}
				xAccessor={getCountryCount}
				yAccessor={getCountryName}
				xAxisLabel="Number of activities"
				barColor="var(--color-accent)"
			/>
			{#snippet placeholder()}
				<p class="text-light">No country data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Tag frequency
			{#if tagFrequencyList.length > 0}
				({tagFrequencyList.length} unique tags)
			{/if}
		</h2>
		<VizChartCard variant="bubble" height="550px" hasData={tagFrequencyList.length > 0}>
			<D3BubbleChart
				data={tagFrequencyList}
				nameAccessor={getTagName}
				valueAccessor={getTagCount}
			/>
			{#snippet placeholder()}
				<p class="text-light">No tag data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Tag cloud</h2>
		<p class="section-description">
			Tags scaled by the number of conference activities they appear in.
		</p>
		<VizChartCard placeholderHeight="500px" hasData={tagWordCloudData.length > 0}>
			<EChartsWordCloud
				words={tagWordCloudData}
				maxWords={100}
				shape="circle"
				minFontSize={12}
				maxFontSize={60}
			/>
			{#snippet placeholder()}
				<p class="text-light">No tag data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Co-presenter network
			{#if copresenterNetworkData.collaborators.length > 0}
				({copresenterNetworkData.collaborators.length} collaborators)
			{/if}
		</h2>
		<p class="section-description">
			People who have co-presented, co-organised panels, or contributed papers alongside me. Edges
			between non-centre nodes show pairs who appeared together in the same communication.
		</p>
		<VizChartCard
			variant="network"
			height="500px"
			hasData={copresenterNetworkData.collaborators.length > 0}
		>
			<EChartsNetworkGraph
				data={copresenterNetworkData.collaborators}
				coAuthorConnections={copresenterNetworkData.connections}
				contributorConnections={[]}
				centerAuthor={CENTER_AUTHOR}
				maxConnections={copresenterNetworkData.collaborators.length}
				labels={{
					itemSingular: 'communication',
					itemPlural: 'Communications',
					coAuthorEdge: 'Co-presenter connection',
					coAuthorShared: 'Shared communications'
				}}
			/>
			{#snippet placeholder()}
				<p class="text-light">No co-presenter data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Activities by research project
			{#if totalProjects > 0}
				({totalProjects} projects)
			{/if}
		</h2>
		<p class="section-description">
			Each outer block is a research project; inner cells are the types of activity produced within
			that project, sized by count. Click to zoom into categories.
		</p>
		<VizChartCard
			variant="treemap"
			placeholderHeight="500px"
			hasData={projectTreemapData.length > 0}
		>
			<EChartsTreemap data={projectTreemapData} title="Activities by research project" />
			{#snippet placeholder()}
				<p class="text-light">No project data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Conference venue locations
			{#if locationMapData.length > 0}
				({locationMapData.length} countries, {totalMapped} activities)
			{/if}
		</h2>
		<p class="section-description">
			Geographic distribution of conference venues. Marker size indicates the number of activities
			per country; click a marker to see individual titles and cities.
		</p>
		<VizChartCard
			variant="map"
			height="500px"
			placeholderHeight="400px"
			hasData={locationMapData.length > 0}
		>
			<LocationMap data={locationMapData} basePath="/communications" itemLabel="activity" />
			{#snippet placeholder()}
				<p class="text-light">No location data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>

	<section class="visualization-section scroll-reveal">
		<h2 class="section-heading">
			Research projects timeline
			{#if projectTimelineData.length > 0}
				({projectTimelineData.length} projects)
			{/if}
		</h2>
		<p class="section-description">
			Project durations with conference-activity markers. Bars show project spans; circles mark
			individual activities.
		</p>
		<VizChartCard variant="gantt" height="450px" hasData={projectTimelineData.length > 0}>
			<EChartsGanttChart data={projectTimelineData} />
			{#snippet placeholder()}
				<p class="text-light">No project data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</section>
</div>

<style>
	/* Chart-card surface, hover, dark-mode and chart-size responsive rules
	 * now live in VizChartCard.svelte. Only page-level layout remains here. */

	.page-container {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md);
	}

	.section-heading {
		font-size: var(--font-size-heading-3);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-heading);
	}

	.section-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		margin-top: calc(-1 * var(--space-sm));
		margin-bottom: var(--space-md);
		line-height: var(--line-height-relaxed);
	}

	@media (--md-down) {
		.page-container {
			padding: var(--space-md) var(--space-sm);
		}

		.section-heading {
			font-size: var(--font-size-heading-4);
			margin-bottom: var(--space-md);
		}
	}

	@media (--sm-down) {
		.section-heading {
			font-size: var(--font-size-heading-5);
		}
	}
</style>
