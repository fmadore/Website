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
	import {
		useBreadcrumbJsonLd,
		createSubsectionBreadcrumbs
	} from '$lib/utils/breadcrumbJsonLd.svelte';
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
	import VizSection from '$lib/components/visualisations/VizSection.svelte';
	import {
		buildLocationData,
		tallyBy,
		buildGroupedTreemap,
		buildProjectTimeline,
		buildStackedByYear
	} from '$lib/utils/vizAggregation';
	// Shared page layout for the two visualisation routes.
	import '$styles/components/viz-page.css';
	import {
		buildCommunicationCoPresenterNetwork,
		buildCooccurrenceNetwork,
		buildInstitutionNetwork
	} from '$lib/utils/networkAggregation';
	import type { NetworkEdgeKind } from '$lib/utils/networkAggregation';
	import NetworkControls from '$lib/components/visualisations/NetworkControls.svelte';
	import type { LocationDatum } from '$lib/data/geo';
	import type { Communication } from '$lib/types/communication';
	import type { WordFrequency } from '$lib/types';
	import { author } from '$lib/data/siteConfig';
	import { COMMUNICATION_TYPE_CHART_LABELS } from '$lib/utils/typeUtils';

	// ---------- Shared types for derived data ----------

	type LanguageCount = { language: string; count: number };
	type TypeCount = { type: string; count: number };
	type CountryCount = { country: string; count: number };
	type TagCount = { tag: string; count: number };

	// ---------- Helpers ----------

	const formatTypeLabel = (type: string): string =>
		COMMUNICATION_TYPE_CHART_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);

	function normaliseLanguages(value: Communication['language']): string[] {
		if (!value) return [];
		if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
		return value
			.split(',')
			.map((v) => v.trim())
			.filter(Boolean);
	}

	// ---------- Derived data for each visualisation ----------

	const communicationTypes = $derived(Object.keys(communicationsByType).sort());
	const formattedTypes = $derived(communicationTypes.map(formatTypeLabel));

	// 1. Communications per year by type (stacked bar) via the shared aggregator.
	const perYearStackedData = $derived(
		buildStackedByYear(allCommunications, {
			getYear: (comm) => comm.year,
			getType: (comm) => comm.type ?? 'other',
			typeKeys: communicationTypes,
			labelFor: formatTypeLabel
		})
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
	const copresenterNetwork = $derived(
		buildCommunicationCoPresenterNetwork(allCommunications, author.name)
	);
	const copresenterCount = $derived(
		copresenterNetwork.nodes.filter((n) => n.kind !== 'center').length
	);
	const copresenterEdgeOptions = $derived(
		[{ kind: 'peer', label: 'Co-presenter' } as const]
			.map((o) => ({
				...o,
				count: copresenterNetwork.edges.filter((e) => e.kind === o.kind).length
			}))
			.filter((o) => o.count > 0)
	);
	const copresenterSuggestions = $derived(
		copresenterNetwork.nodes.filter((n) => n.kind !== 'center').map((n) => n.id)
	);

	let copresenterTopN = $state(20);
	let copresenterVisibleKinds = $state<NetworkEdgeKind[]>(['peer']);
	let copresenterSearch = $state('');

	// Institution network: institutions linked when their members appeared in the
	// same panel, workshop, or event. Small affiliation corpus, so thresholds stay
	// at 1/1 (see buildInstitutionNetwork). Olive entity nodes.
	const institutionNetwork = $derived(buildInstitutionNetwork(allCommunications));
	const institutionSuggestions = $derived(institutionNetwork.nodes.map((n) => n.id));
	let institutionTopN = $state(20);
	let institutionSearch = $state('');

	// Tag co-occurrence network: tags linked when they appear on the same
	// communication. Keeps the page symmetric with the publications one.
	const tagNetwork = $derived(
		buildCooccurrenceNetwork(allCommunications, {
			getKeys: (comm) => comm.tags,
			getTitle: (comm) => comm.title
		})
	);
	const tagSuggestions = $derived(tagNetwork.nodes.map((n) => n.id));
	let tagTopN = $state(25);
	let tagSearch = $state('');

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

	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Talks & Events',
		'/conference-activity',
		'Visualisations',
		'/conference-activity/visualisations'
	);
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-conf-activity-viz');
</script>

<SEO
	title="Talks & Events Visualisations | Frédérick Madore"
	description="Visualisations of academic conference activity: presentations per year, types, languages, countries, tag networks, research projects, and a geographic map of venues."
	keywords="conferences, presentations, visualisations, co-presenters, research projects, map, Frédérick Madore"
/>

<div class="viz-page-container page-enter">
	<Breadcrumb items={breadcrumbItems} />
	<div class="scroll-reveal">
		<PageHeader title="Talks & Events Visualisations" />
	</div>

	<div class="scroll-reveal">
		<PageIntro>
			This page presents visualisations of my academic conference activity: conference papers,
			workshops, seminars, lectures, panels organised, events organised, and podcasts.
		</PageIntro>
	</div>

	<VizSection title="Conference activities per year by type">
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
	</VizSection>

	<VizSection
		title="Activities by type"
		count={typeDistribution.length > 0 ? `${typeDistribution.length} types` : ''}
	>
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
	</VizSection>

	<VizSection
		title="Languages"
		count={languageData.length > 0 ? `${languageData.length} languages` : ''}
	>
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
	</VizSection>

	<VizSection
		title="Activities by country"
		count={countryData.length > 0 ? `${countryData.length} countries` : ''}
	>
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
	</VizSection>

	<VizSection
		title="Tag frequency"
		count={tagFrequencyList.length > 0 ? `${tagFrequencyList.length} unique tags` : ''}
	>
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
	</VizSection>

	<VizSection
		title="Tag cloud"
		description="Tags scaled by the number of conference activities they appear in."
	>
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
	</VizSection>

	<VizSection
		title="Tag co-occurrence network"
		count={tagNetwork.nodes.length > 0 ? `${tagNetwork.nodes.length} tags` : ''}
		description="Tags are linked when they appear together on the same conference activity; node size reflects how many activities carry each tag. Singletons and one-off pairings are omitted."
	>
		{#if tagNetwork.nodes.length > 0}
			<NetworkControls
				bind:topN={tagTopN}
				bind:searchQuery={tagSearch}
				maxN={tagNetwork.nodes.length}
				minN={10}
				searchLabel="Search tags"
				suggestions={tagSuggestions}
			/>
		{/if}
		<VizChartCard variant="network" height="500px" hasData={tagNetwork.nodes.length > 0}>
			<EChartsNetworkGraph
				nodes={tagNetwork.nodes}
				edges={tagNetwork.edges}
				maxNodes={tagTopN}
				highlightQuery={tagSearch}
				filename="tag-cooccurrence-network"
				labels={{
					itemSingular: 'activity',
					itemPlural: 'Activities',
					entityNode: 'Tags',
					cooccurrenceEdge: 'Tag co-occurrence',
					cooccurrenceShared: 'Activities sharing both tags'
				}}
			/>
			{#snippet placeholder()}
				<p class="text-light">Not enough tag overlap to display a co-occurrence network.</p>
			{/snippet}
		</VizChartCard>
	</VizSection>

	<VizSection
		title="Co-presenter network"
		count={copresenterCount > 0 ? `${copresenterCount} collaborators` : ''}
		description="People who have co-presented, co-organised panels, or contributed papers alongside me. Edges between non-centre nodes show pairs who appeared together in the same communication."
	>
		{#if copresenterCount > 0}
			<NetworkControls
				bind:topN={copresenterTopN}
				bind:visibleKinds={copresenterVisibleKinds}
				bind:searchQuery={copresenterSearch}
				maxN={copresenterCount}
				edgeKindOptions={copresenterEdgeOptions}
				searchLabel="Search co-presenters"
				suggestions={copresenterSuggestions}
			/>
		{/if}
		<VizChartCard variant="network" height="500px" hasData={copresenterCount > 0}>
			<EChartsNetworkGraph
				nodes={copresenterNetwork.nodes}
				edges={copresenterNetwork.edges}
				centerId={author.name}
				maxNodes={copresenterTopN}
				visibleEdgeKinds={copresenterVisibleKinds}
				highlightQuery={copresenterSearch}
				filename="copresenter-network"
				labels={{
					itemSingular: 'communication',
					itemPlural: 'Communications',
					peerEdge: 'Co-presenter connection',
					peerShared: 'Shared communications'
				}}
			/>
			{#snippet placeholder()}
				<p class="text-light">No co-presenter data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</VizSection>

	<VizSection
		title="Institution network"
		count={institutionNetwork.nodes.length > 0
			? `${institutionNetwork.nodes.length} institutions`
			: ''}
		description="Institutions are linked when their members appeared in the same panel, workshop, or event. Node size reflects how many activities each institution took part in."
	>
		{#if institutionNetwork.nodes.length > 0}
			<NetworkControls
				bind:topN={institutionTopN}
				bind:searchQuery={institutionSearch}
				maxN={institutionNetwork.nodes.length}
				searchLabel="Search institutions"
				suggestions={institutionSuggestions}
			/>
		{/if}
		<VizChartCard variant="network" height="500px" hasData={institutionNetwork.nodes.length > 0}>
			<EChartsNetworkGraph
				nodes={institutionNetwork.nodes}
				edges={institutionNetwork.edges}
				entityColor="sage"
				maxNodes={institutionTopN}
				highlightQuery={institutionSearch}
				filename="institution-network"
				labels={{
					itemSingular: 'activity',
					itemPlural: 'Activities',
					entityNode: 'Institutions',
					cooccurrenceEdge: 'Shared event',
					cooccurrenceShared: 'Activities in common'
				}}
			/>
			{#snippet placeholder()}
				<p class="text-light">No institution data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</VizSection>

	<VizSection
		title="Activities by research project"
		count={totalProjects > 0 ? `${totalProjects} projects` : ''}
		description="Each outer block is a research project; inner cells are the types of activity produced within that project, sized by count. Click to zoom into categories."
	>
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
	</VizSection>

	<VizSection
		title="Conference venue locations"
		count={locationMapData.length > 0
			? `${locationMapData.length} countries, ${totalMapped} activities`
			: ''}
		description="Geographic distribution of conference venues. Marker size indicates the number of activities per country; click a marker to see individual titles and cities."
	>
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
	</VizSection>

	<VizSection
		title="Research projects timeline"
		count={projectTimelineData.length > 0 ? `${projectTimelineData.length} projects` : ''}
		description="Project durations with conference-activity markers. Bars show project spans; circles mark individual activities."
		last
	>
		<VizChartCard variant="gantt" height="450px" hasData={projectTimelineData.length > 0}>
			<EChartsGanttChart data={projectTimelineData} />
			{#snippet placeholder()}
				<p class="text-light">No project data available to display for this visualisation.</p>
			{/snippet}
		</VizChartCard>
	</VizSection>
</div>
