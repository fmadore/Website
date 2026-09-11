<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { base } from '$app/paths';
	// The charts and networks tally fields, never prose: the committed
	// projection (no abstracts) carries everything they read, `papers`
	// included — the co-presenter and institution networks are built from it.
	import {
		allCommunicationSummaries as allCommunications,
		communicationSummariesByType as communicationsByType,
		communicationSummariesByProject as communicationsByProject
	} from '$lib/data/communications/summaries';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import {
		buildBreadcrumbJsonLd,
		createSubsectionBreadcrumbs
	} from '$lib/utils/breadcrumbJsonLd.svelte';
	import EChartsHorizontalBarChart from '$lib/components/visualisations/EChartsHorizontalBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';
	import NetworkGraph from '$lib/components/visualisations/NetworkGraph.svelte';
	import NetworkMatrix from '$lib/components/visualisations/NetworkMatrix.svelte';
	import NetworkArcDiagram from '$lib/components/visualisations/NetworkArcDiagram.svelte';
	import EChartsTreemap from '$lib/components/visualisations/EChartsTreemap.svelte';
	import EChartsGanttChart from '$lib/components/visualisations/EChartsGanttChart.svelte';
	import VizSection from '$lib/components/visualisations/VizSection.svelte';
	import VizDataTable from '$lib/components/visualisations/VizDataTable.svelte';
	import { inView } from '$lib/actions/inView';
	import ContentsLedger from '$lib/components/common/ContentsLedger.svelte';
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
	import { author } from '$lib/data/siteConfig';
	import { scaleKeyTerms } from '$lib/utils/keyTerms';
	import { COMMUNICATION_TYPE_CHART_LABELS } from '$lib/utils/typeUtils';

	// ---------- Shared types for derived data ----------

	type LanguageCount = { language: string; count: number };
	type TypeCount = { type: string; count: number };
	type CountryCount = { country: string; count: number };

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

	/**
	 * Categorical colours for the activity stack, keyed by the same label the
	 * rows carry. The order is corpus size descending (conference paper, guest
	 * lecture, workshop, event organised, panel organised, poster, podcast at the
	 * time of writing), ties broken on the raw type key so a rebuild never
	 * reshuffles the plate. Seven is the palette's length; anything beyond it
	 * folds into "Other" inside the chart. This map is the communications' own —
	 * the publication types are a different entity with a different ranking, and
	 * sharing one map between them coloured neither honestly.
	 */
	const communicationTypeColors = $derived(
		Object.fromEntries(
			Object.entries(communicationsByType)
				.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
				.slice(0, 7)
				.map(([type], i) => [formatTypeLabel(type), `var(--sys-viz-${i + 1})`])
		)
	);

	// 1. Communications per year by type (stacked bar) via the shared aggregator.
	const perYearStackedData = $derived(
		buildStackedByYear(allCommunications, {
			getYear: (comm) => comm.year,
			getType: (comm) => comm.type ?? 'other',
			typeKeys: communicationTypes,
			labelFor: formatTypeLabel
		})
	);

	// 2. Communications by type, ranked. A ranked bar reads the near-ties a
	// doughnut hid: two slices at 31.65% and 31.64% are the same arc to the eye.
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

	// 3. Language shares. Communications may declare a single language, a
	// comma-separated string, or an array — normaliseLanguages flattens all three
	// before the shared tally.
	const languageData = $derived<LanguageCount[]>(
		tallyBy(allCommunications, (comm) => normaliseLanguages(comm.language)).map(
			({ key, count }) => ({ language: key, count })
		)
	);

	/**
	 * Language shares as `.hbar` proportion rows — the sanctioned proportion
	 * meter, replacing a two-slice doughnut. A bilingual activity is counted once
	 * in each language, so the denominator is the language tally rather than the
	 * activity count.
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

	// 4. Communications by country (horizontal bar).
	const countryData = $derived<CountryCount[]>(
		tallyBy(allCommunications, (comm) => comm.country).map(({ key, count }) => ({
			country: key,
			count
		}))
	);
	const getCountryName = (d: CountryCount) => d.country;
	const getCountryCount = (d: CountryCount) => d.count;

	// 5. Tag frequencies, scaled for the key-terms cloud. This replaces both the
	// bubble pack and the word-cloud canvas, which drew the same tally twice.
	const tagCounts = $derived(
		tallyBy(allCommunications, (comm) => comm.tags).map(({ key, count }) => ({
			word: key,
			count
		}))
	);
	const tagTerms = $derived(scaleKeyTerms(tagCounts));

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
	// A ledger is as tall as its rows; past ~30 the plate scrolls instead.
	const copresenterArcHeight = $derived(
		Math.round(Math.min(Math.min(copresenterTopN, copresenterCount) * 24 + 150, 940))
	);

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

	/*
	 * The figures behind each plate.
	 *
	 * A canvas chart gives a screen reader one sentence and a sighted reader a
	 * tooltip per mark; neither is the data. Each plate carries its own table
	 * under it, closed, built from the same array the chart is drawn from — so
	 * a reader who wants the number for 2019 reads it rather than hovering for
	 * it, and the two can never disagree.
	 */
	const perYearTableRows = $derived(
		perYearStackedData.map((row) => ({
			label: String(row.year ?? ''),
			value: Object.entries(row).reduce(
				(sum, [key, value]) => (key === 'year' ? sum : sum + value),
				0
			)
		}))
	);
	const typeTableRows = $derived(typeDistribution.map((d) => ({ label: d.type, value: d.count })));
	const countryTableRows = $derived(countryData.map((d) => ({ label: d.country, value: d.count })));
	const projectTreemapTableRows = $derived(
		projectTreemapData.map((node) => ({
			label: node.name,
			value: node.children.reduce((sum, child) => sum + child.value, 0)
		}))
	);
	const locationTableRows = $derived(
		locationMapData.map((d) => ({ label: d.country, value: d.count }))
	);
	const projectTimelineTableRows = $derived(
		projectTimelineData.map((entry) => ({ label: entry.name, value: entry.publications.length }))
	);

	/*
	 * The map plate, loaded when it is about to be read — the same gate the
	 * publications page and the talk record use. MapLibre is 966 KiB of
	 * JavaScript before a single vector tile, for a plate far below the fold.
	 */
	let VenueMap: typeof import('$lib/components/visualisations/LocationMap.svelte').default | null =
		$state(null);
	let mapRequested = false;
	let mapChunkFailed = $state(false);

	function loadVenueMap() {
		if (mapRequested) return;
		mapRequested = true;
		import('$lib/components/visualisations/LocationMap.svelte')
			.then((module) => {
				VenueMap = module.default;
			})
			.catch((error) => {
				// A cold offline load or a stale service-worker manifest can lose the
				// chunk. The countries are tabled under the plate either way.
				mapChunkFailed = true;
				if (import.meta.env.DEV) console.error('map chunk failed to load:', error);
			});
	}

	// When the map cannot load there are no view modes to switch between, so the
	// section's note must stop promising them.
	let venueMapFailed = $state(false);
	const locationDescription = $derived(
		venueMapFailed || mapChunkFailed
			? 'The countries of the venues, taken from the location recorded on each talk.'
			: 'The countries of the venues, taken from the location recorded on each talk. Switch between proportional markers and country shading; select a country to list its titles and cities.'
	);

	// ---------- The record, in numbers ----------

	const activityYears = $derived(allCommunications.map((comm) => comm.year));
	const firstYear = $derived(Math.min(...activityYears));
	const lastYear = $derived(Math.max(...activityYears));
	const yearSpan = $derived(lastYear - firstYear + 1);

	type CorpusStat = { label: string; value: string; accent?: boolean };

	const corpusStats = $derived<CorpusStat[]>([
		{ label: 'Talks', value: String(allCommunications.length), accent: true },
		{ label: 'Years covered', value: `${firstYear}–${lastYear}` },
		{ label: 'Countries', value: String(countryData.length) },
		{ label: 'Co-presenters', value: String(copresenterCount) },
		{ label: 'Institutions', value: String(institutionNetwork.nodes.length) },
		{ label: 'Research projects', value: String(totalProjects) }
	]);

	// ---------- Section register ----------

	/** `12 talks`, or an empty string when there is nothing to count. */
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
			title: 'Talks per year, by type',
			count: countOf(allCommunications.length, 'talk')
		},
		byType: {
			id: 'by-type',
			no: '§ 2',
			title: 'Talks by type',
			count: countOf(typeDistribution.length, 'type')
		},
		languages: {
			id: 'languages',
			no: '§ 3',
			title: 'Talks by language',
			count: countOf(languageData.length, 'language')
		},
		countries: {
			id: 'countries',
			no: '§ 4',
			title: 'Talks by country',
			count: countOf(countryData.length, 'country', 'countries')
		},
		tags: {
			id: 'tags',
			no: '§ 5',
			title: 'Tags, by frequency',
			count: countOf(tagCounts.length, 'tag')
		},
		tagMatrix: {
			id: 'tag-matrix',
			no: '§ 6',
			title: 'Tag co-occurrence matrix',
			count: countOf(tagNetwork.nodes.length, 'tag')
		},
		copresenters: {
			id: 'co-presenters',
			no: '§ 7',
			title: 'Co-presenter network',
			count: countOf(copresenterCount, 'co-presenter')
		},
		institutions: {
			id: 'institutions',
			no: '§ 8',
			title: 'Institution network',
			count: countOf(institutionNetwork.nodes.length, 'institution')
		},
		projects: {
			id: 'projects',
			no: '§ 9',
			title: 'Talks by research project',
			count: countOf(totalProjects, 'project')
		},
		locations: {
			id: 'venue-locations',
			no: '§ 10',
			title: 'Conference venue locations',
			count:
				locationMapData.length > 0
					? `${countOf(locationMapData.length, 'country', 'countries')}, ${countOf(totalMapped, 'talk')}`
					: ''
		},
		timeline: {
			id: 'project-timeline',
			no: '§ 11',
			title: 'Research projects, over time',
			count: countOf(projectTimelineData.length, 'project')
		}
	});

	const contentsItems = $derived(Object.values(sections));

	// ---------- Breadcrumbs + SEO ----------

	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Talks & Events',
		'/conference-activity',
		'Visualisations',
		'/conference-activity/visualisations'
	);
	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
</script>

<SEO
	title="Talks & Events Visualisations | Frédérick Madore"
	description="The record of talks and events counted: talks per year and type, languages, countries, tags, co-presenters, institutions and venues."
	keywords="conferences, presentations, visualisations, co-presenters, research projects, map, Frédérick Madore"
/>

<JsonLd id="breadcrumb-json-ld-conf-activity-viz" json={breadcrumbJsonLd} />
<div class="viz-page-container">
	<Breadcrumb items={breadcrumbItems} />
	<PageHeader title="Talks & Events Visualisations" />

	<div class="viz-masthead">
		<PageIntro>
			The record of talks and events, counted: {allCommunications.length} talks over {yearSpan} years,
			read by year, type, language, country and collaborator. Every figure below is computed from the
			same data files that set the index.
		</PageIntro>

		<aside class="corpus-aside" aria-labelledby="record-in-numbers">
			<h2 class="rail-label" id="record-in-numbers">The record, in numbers</h2>
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
		description="Every talk counted in the year it took place and stacked by type, from the date and type recorded on each entry."
		variant="stacked"
		height="450px"
		hasData={perYearStackedData.length > 0 && communicationTypes.length > 0}
		empty="No talks recorded."
	>
		<EChartsStackedBarChart
			data={perYearStackedData}
			keys={formattedTypes}
			colorMap={communicationTypeColors}
			measure="Talks per year by type"
			itemSingular="talk"
			itemPlural="talks"
		/>
		{#snippet table()}
			<VizDataTable
				rows={perYearTableRows}
				keyLabel="Year"
				valueLabel="Talks"
				caption="Talks per year, all types combined."
			/>
		{/snippet}
	</VizSection>

	<VizSection
		{...sections.byType}
		description="The whole record ranked by kind of talk, counted from the type recorded on each entry."
		height="{Math.max(350, typeDistribution.length * 40 + 70)}px"
		placeholderHeight="350px"
		hasData={typeDistribution.length > 0}
		empty="No talk types recorded."
	>
		<EChartsHorizontalBarChart
			data={typeDistribution}
			xAccessor={getTypeCount}
			yAccessor={getTypeName}
			measure="Talks by type"
			itemSingular="type"
			itemPlural="types"
			descriptionLead="Most talks"
		/>
		{#snippet table()}
			<VizDataTable
				rows={typeTableRows}
				keyLabel="Type"
				valueLabel="Talks"
				caption="The record ranked by kind of talk."
			/>
		{/snippet}
	</VizSection>

	<VizSection
		{...sections.languages}
		description="The share of the record delivered in each language. A talk given in two languages is counted once in each, so the bars are shares of the language tally rather than of the talk count."
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
			<div class="viz-empty">
				<span class="dateline">No data</span>
				<p>No languages recorded.</p>
			</div>
		{/if}
	</VizSection>

	<VizSection
		{...sections.countries}
		description="Where the talks took place, counted from the country recorded on each entry."
		height="{Math.max(350, countryData.length * 32 + 70)}px"
		placeholderHeight="400px"
		hasData={countryData.length > 0}
		empty="No countries recorded."
	>
		<EChartsHorizontalBarChart
			data={countryData}
			xAccessor={getCountryCount}
			yAccessor={getCountryName}
			measure="Talks by country"
			itemSingular="country"
			itemPlural="countries"
			descriptionLead="Most talks"
		/>
		{#snippet table()}
			<VizDataTable
				rows={countryTableRows}
				keyLabel="Country"
				valueLabel="Talks"
				caption="Talks by the country recorded on each entry."
			/>
		{/snippet}
	</VizSection>

	<VizSection
		{...sections.tags}
		description="The tags assigned to the talks, the sixty most frequent set at a size proportional to the number of talks carrying each. Select a term to open the index filtered to it."
	>
		{#if tagTerms.length > 0}
			<div class="key-terms">
				<!-- eslint-disable svelte/no-navigation-without-resolve -- tag filter URLs -->
				{#each tagTerms as term (term.word)}
					<a
						href="{base}/conference-activity?tag={encodeURIComponent(term.word)}"
						rel="nofollow"
						style="font-size: {term.size}px;"
						title={countOf(term.count, 'talk')}>{term.word}</a
					>
				{/each}
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		{:else}
			<div class="viz-empty">
				<span class="dateline">No data</span>
				<p>No tags recorded.</p>
			</div>
		{/if}
	</VizSection>

	<VizSection
		{...sections.tagMatrix}
		description="Each cell is a pair of tags that appear together on the same talk; the darker the cell, the more talks carry both. Rows are ordered so related tags sit next to each other, gathering the thematic blocks along the diagonal. Singletons and one-off pairings are omitted."
		variant="matrix"
		placeholderHeight="400px"
		hasData={tagNetwork.nodes.length > 0}
		empty="Not enough tag overlap to display a co-occurrence matrix."
	>
		{#snippet controls()}
			{#if tagNetwork.nodes.length > 0}
				<NetworkControls
					bind:topN={tagTopN}
					bind:searchQuery={tagSearch}
					maxN={tagNetwork.nodes.length}
					minN={10}
					searchLabel="Search tags"
					searchPlaceholder="Type a tag…"
					entityLabel="tags"
					suggestions={tagSuggestions}
				/>
			{/if}
		{/snippet}
		<NetworkMatrix
			nodes={tagNetwork.nodes}
			edges={tagNetwork.edges}
			maxNodes={tagTopN}
			highlightQuery={tagSearch}
			filename="tag-cooccurrence-matrix"
			labels={{
				itemSingular: 'talk',
				itemPlural: 'Talks',
				entityNode: 'Tags',
				sharedLabel: 'Talks sharing both'
			}}
		/>
	</VizSection>

	<VizSection
		{...sections.copresenters}
		description="People who have co-presented, co-organised panels, or contributed papers alongside me, ranked by how many talks we share. The arcs join pairs who appeared together in the same talk. My own link to each of them is a given, so it is not drawn."
		variant="arc"
		height="{copresenterArcHeight}px"
		placeholderHeight="400px"
		hasData={copresenterCount > 0}
		empty="No co-presenters recorded."
	>
		{#snippet controls()}
			{#if copresenterCount > 0}
				<NetworkControls
					bind:topN={copresenterTopN}
					bind:visibleKinds={copresenterVisibleKinds}
					bind:searchQuery={copresenterSearch}
					maxN={copresenterCount}
					edgeKindOptions={copresenterEdgeOptions}
					searchLabel="Search co-presenters"
					searchPlaceholder="Type a name…"
					entityLabel="co-presenters"
					suggestions={copresenterSuggestions}
				/>
			{/if}
		{/snippet}
		<NetworkArcDiagram
			nodes={copresenterNetwork.nodes}
			edges={copresenterNetwork.edges}
			centerId={author.name}
			maxNodes={copresenterTopN}
			visibleEdgeKinds={copresenterVisibleKinds}
			highlightQuery={copresenterSearch}
			filename="copresenter-arcs"
			labels={{
				itemSingular: 'talk',
				itemPlural: 'Talks',
				collaboratorNode: 'Co-presenters',
				peerEdge: 'Co-presenter connection',
				peerShared: 'Shared talks'
			}}
		/>
	</VizSection>

	<VizSection
		{...sections.institutions}
		description="Institutions are linked when their members appeared in the same panel, workshop, or event. Node size reflects how many talks each institution took part in. This one stays a map rather than a matrix: the question here is which institutions cluster together, and spatial grouping answers it more directly than a grid of pairs."
		variant="network"
		height="500px"
		hasData={institutionNetwork.nodes.length > 0}
		empty="No institutions recorded."
	>
		{#snippet controls()}
			{#if institutionNetwork.nodes.length > 0}
				<NetworkControls
					bind:topN={institutionTopN}
					bind:searchQuery={institutionSearch}
					maxN={institutionNetwork.nodes.length}
					searchLabel="Search institutions"
					searchPlaceholder="Type an institution…"
					entityLabel="institutions"
					suggestions={institutionSuggestions}
				/>
			{/if}
		{/snippet}
		<NetworkGraph
			nodes={institutionNetwork.nodes}
			edges={institutionNetwork.edges}
			entityColor="sage"
			maxNodes={institutionTopN}
			highlightQuery={institutionSearch}
			filename="institution-network"
			labels={{
				itemSingular: 'talk',
				itemPlural: 'Talks',
				entityNode: 'Institutions',
				cooccurrenceEdge: 'Shared event',
				cooccurrenceShared: 'Talks in common'
			}}
		/>
	</VizSection>

	<VizSection
		{...sections.projects}
		description="Each outer block is a research project; the inner cells are the kinds of talk it produced, sized by count. Select a block to zoom into it."
		variant="treemap"
		placeholderHeight="500px"
		hasData={projectTreemapData.length > 0}
		empty="No project data recorded."
	>
		<EChartsTreemap
			data={projectTreemapData}
			title="Talks by research project"
			itemSingular="talk"
			itemPlural="talks"
			entrySingular="type"
			entryPlural="types"
		/>
		{#snippet table()}
			<VizDataTable
				rows={projectTreemapTableRows}
				keyLabel="Project"
				valueLabel="Talks"
				caption="Talks delivered within each research project."
			/>
		{/snippet}
	</VizSection>

	<VizSection
		{...sections.locations}
		description={locationDescription}
		variant="map"
		height="500px"
		placeholderHeight="400px"
		hasData={locationMapData.length > 0}
		empty="No venue locations recorded."
	>
		{#if VenueMap}
			<VenueMap
				data={locationMapData}
				basePath="/communications"
				itemLabel="talk"
				bind:failed={venueMapFailed}
			/>
		{:else if mapChunkFailed}
			<div class="state-note map-plate-note" role="status">
				<span class="dateline">Map unavailable</span>
				<p>The map could not be loaded. The country table below holds the same records.</p>
			</div>
		{:else}
			<div class="state-note map-plate-note" role="status" use:inView={loadVenueMap}>
				<span class="dateline">Loading map…</span>
			</div>
		{/if}
		{#snippet table()}
			<VizDataTable
				rows={locationTableRows}
				keyLabel="Country"
				valueLabel="Talks"
				caption="Conference venue locations by country."
			/>
		{/snippet}
	</VizSection>

	<VizSection
		{...sections.timeline}
		description="Each research project drawn across the years it ran, with a marker for every talk delivered within it."
		variant="gantt"
		height="450px"
		hasData={projectTimelineData.length > 0}
		empty="No project data recorded."
	>
		<EChartsGanttChart data={projectTimelineData} itemSingular="talk" itemPlural="talks" />
		{#snippet table()}
			<VizDataTable
				rows={projectTimelineTableRows}
				keyLabel="Project"
				valueLabel="Talks"
				caption="Talks delivered within each research project, over its span."
			/>
		{/snippet}
	</VizSection>
</div>

<style>
	/*
	 * Page container comes from viz-page.css; section chrome from VizSection;
	 * the chart plate from VizChartCard. What is local here is the masthead
	 * apparatus (standfirst beside the stat ledger) and the two typeset views
	 * that replaced chart libraries: the key-terms cloud and the language
	 * proportion ledger. Both are kept in step with the publications page.
	 */

	/* Standfirst left, "the record, in numbers" right — the masthead asserts,
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

	/* Key-terms cloud. `.key-terms` (ink-signal.css) sets the flow and the
	   serif; the terms link to the filtered index and take the cloud's resting
	   ink rather than the link ink. */
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

	/* The map plate before its chunk arrives, and if it never does. The panel is
	   the shared `.state-note` idiom; this only makes it fill the 500px box the
	   section reserved, as `.map-state-note` does inside LocationMap. */
	.map-plate-note {
		width: 100%;
		height: 100%;
	}

	/* Empty state for the sections that are typeset rather than plated. */
</style>
