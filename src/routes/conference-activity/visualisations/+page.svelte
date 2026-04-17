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
	import type { LocationDatum } from '$lib/data/geo';
	import type { Communication } from '$lib/types/communication';
	import type { WordFrequency } from '$lib/types';

	// ---------- Shared types for derived data ----------

	type LanguageCount = { language: string; count: number };
	type TypeCount = { type: string; count: number };
	type CountryCount = { country: string; count: number };
	type TagCount = { tag: string; count: number };

	interface TreemapChild {
		name: string;
		value: number;
		publications: string[]; // component prop name — list of titles shown in tooltip
	}

	interface TreemapNode {
		name: string;
		children: TreemapChild[];
	}

	interface TimelineItem {
		title: string;
		year: number;
		type: string;
	}

	interface TimelineEntry {
		name: string;
		startYear: number;
		endYear: number;
		publications: TimelineItem[]; // component prop name
	}

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
	// language, a comma-separated string, or an array — we flatten all three.
	const languageData = $derived<LanguageCount[]>(
		(() => {
			const counts: Record<string, number> = {};
			allCommunications.forEach((comm) => {
				normaliseLanguages(comm.language).forEach((lang) => {
					counts[lang] = (counts[lang] || 0) + 1;
				});
			});
			return Object.entries(counts)
				.map(([language, count]) => ({ language, count }))
				.sort((a, b) => b.count - a.count);
		})()
	);
	const getLanguageName = (d: LanguageCount) => d.language;
	const getLanguageCount = (d: LanguageCount) => d.count;

	// 4. Communications by country (horizontal bar).
	const countryData = $derived<CountryCount[]>(
		(() => {
			const counts: Record<string, number> = {};
			allCommunications.forEach((comm) => {
				const country = comm.country?.trim();
				if (!country) return;
				counts[country] = (counts[country] || 0) + 1;
			});
			return Object.entries(counts)
				.map(([country, count]) => ({ country, count }))
				.sort((a, b) => b.count - a.count);
		})()
	);
	const getCountryName = (d: CountryCount) => d.country;
	const getCountryCount = (d: CountryCount) => d.count;

	// 5. & 6. Tag frequencies — shared by bubble chart and word cloud.
	const tagFrequencyList = $derived<TagCount[]>(
		(() => {
			const counts: Record<string, number> = {};
			allCommunications.forEach((comm) => {
				comm.tags?.forEach((tag) => {
					const trimmed = tag.trim();
					if (!trimmed) return;
					counts[trimmed] = (counts[trimmed] || 0) + 1;
				});
			});
			return Object.entries(counts)
				.map(([tag, count]) => ({ tag, count }))
				.sort((a, b) => b.count - a.count);
		})()
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
	const projectTreemapData = $derived<TreemapNode[]>(
		(() => {
			return Object.entries(communicationsByProject)
				.map(([projectName, items]) => {
					const byType: Record<string, { count: number; titles: string[] }> = {};
					items.forEach((comm) => {
						const typeLabel = formatTypeLabel(comm.type ?? 'other');
						if (!byType[typeLabel]) byType[typeLabel] = { count: 0, titles: [] };
						byType[typeLabel].count++;
						byType[typeLabel].titles.push(comm.title);
					});

					const children: TreemapChild[] = Object.entries(byType)
						.map(([name, data]) => ({
							name,
							value: data.count,
							publications: data.titles
						}))
						.sort((a, b) => b.value - a.value);

					return { name: projectName, children };
				})
				.filter((node) => node.children.length > 0)
				.sort(
					(a, b) =>
						b.children.reduce((s, c) => s + c.value, 0) -
						a.children.reduce((s, c) => s + c.value, 0)
				);
		})()
	);
	const totalProjects = $derived(projectTreemapData.length);

	// 9. Locations map — aggregate communications by country and list the
	// individual titles (with their city as the subtitle) in the popup.
	const locationMapData = $derived<LocationDatum[]>(
		(() => {
			const byCountry: Record<
				string,
				{
					count: number;
					items: Array<{ id: string; title: string; subtitle?: string; type?: string }>;
				}
			> = {};

			allCommunications.forEach((comm) => {
				const country = comm.country?.trim();
				if (!country) return;
				if (!byCountry[country]) byCountry[country] = { count: 0, items: [] };
				byCountry[country].count++;
				byCountry[country].items.push({
					id: comm.id,
					title: comm.title,
					subtitle: comm.location,
					type: comm.type
				});
			});

			return Object.entries(byCountry)
				.map(([country, data]) => ({
					country,
					count: data.count,
					items: data.items
				}))
				.sort((a, b) => b.count - a.count);
		})()
	);
	const totalMapped = $derived(locationMapData.reduce((sum, loc) => sum + loc.count, 0));

	// 10. Research project timeline — project spans with communication markers.
	const projectTimelineData = $derived<TimelineEntry[]>(
		(() => {
			return Object.entries(communicationsByProject)
				.map(([name, items]) => {
					const years = items.map((c) => c.year);
					return {
						name,
						startYear: Math.min(...years),
						endYear: Math.max(...years),
						publications: items
							.map((c) => ({
								title: c.title,
								year: c.year,
								type: c.type ?? 'other'
							}))
							.sort((a, b) => a.year - b.year)
					};
				})
				.sort((a, b) => a.startYear - b.startYear);
		})()
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
		{#if perYearStackedData.length > 0 && communicationTypes.length > 0}
			<div class="chart-wrapper stacked-chart" style="height: 450px;">
				<EChartsStackedBarChart
					data={perYearStackedData}
					keys={formattedTypes}
					xAxisLabel="Year"
					yAxisLabel="Number of activities"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 450px;">
				<p class="text-light">No activity data available to display for this visualisation.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Activities by type
			{#if typeDistribution.length > 0}
				({typeDistribution.length} types)
			{/if}
		</h2>
		{#if typeDistribution.length > 0}
			<div class="chart-wrapper" style="height: 480px;">
				<EChartsDoughnutChart
					data={typeDistribution}
					nameAccessor={getTypeName}
					valueAccessor={getTypeCount}
					title="Distribution of activities by type"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 480px;">
				<p class="text-light">No type data available to display for this visualisation.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Languages
			{#if languageData.length > 0}
				({languageData.length} languages)
			{/if}
		</h2>
		{#if languageData.length > 0}
			<div class="chart-wrapper" style="height: 480px;">
				<EChartsDoughnutChart
					data={languageData}
					nameAccessor={getLanguageName}
					valueAccessor={getLanguageCount}
					title="Distribution of activities by language"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 480px;">
				<p class="text-light">No language data available to display for this visualisation.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Activities by country
			{#if countryData.length > 0}
				({countryData.length} countries)
			{/if}
		</h2>
		{#if countryData.length > 0}
			<div class="chart-wrapper" style="height: {Math.max(350, countryData.length * 32 + 70)}px;">
				<EChartsHorizontalBarChart
					data={countryData}
					xAccessor={getCountryCount}
					yAccessor={getCountryName}
					xAxisLabel="Number of activities"
					barColor="var(--color-accent)"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">No country data available to display for this visualisation.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Tag frequency
			{#if tagFrequencyList.length > 0}
				({tagFrequencyList.length} unique tags)
			{/if}
		</h2>
		{#if tagFrequencyList.length > 0}
			<div class="chart-wrapper bubble-chart" style="height: 550px;">
				<D3BubbleChart
					data={tagFrequencyList}
					nameAccessor={getTagName}
					valueAccessor={getTagCount}
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 550px;">
				<p class="text-light">No tag data available to display for this visualisation.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Tag cloud</h2>
		<p class="section-description">
			Tags scaled by the number of conference activities they appear in.
		</p>
		{#if tagWordCloudData.length > 0}
			<div class="chart-wrapper wordcloud-chart" style="height: 500px;">
				<EChartsWordCloud
					words={tagWordCloudData}
					maxWords={100}
					shape="circle"
					minFontSize={12}
					maxFontSize={60}
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No tag data available to display for this visualisation.</p>
			</div>
		{/if}
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
		{#if copresenterNetworkData.collaborators.length > 0}
			<div class="chart-wrapper network-chart" style="height: 500px;">
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
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No co-presenter data available to display for this visualisation.</p>
			</div>
		{/if}
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
		{#if projectTreemapData.length > 0}
			<div class="chart-wrapper treemap-chart">
				<EChartsTreemap data={projectTreemapData} title="Activities by research project" />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No project data available to display for this visualisation.</p>
			</div>
		{/if}
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
		{#if locationMapData.length > 0}
			<div class="chart-wrapper map-chart" style="height: 500px;">
				<LocationMap data={locationMapData} basePath="/communications" itemLabel="activity" />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">No location data available to display for this visualisation.</p>
			</div>
		{/if}
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
		{#if projectTimelineData.length > 0}
			<div class="chart-wrapper gantt-chart" style="height: 450px;">
				<EChartsGanttChart data={projectTimelineData} />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 450px;">
				<p class="text-light">No project data available to display for this visualisation.</p>
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

	.chart-wrapper,
	.placeholder-message {
		position: relative;
		border-radius: var(--border-radius-lg);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-moderate) var(--ease-spring),
			box-shadow var(--duration-moderate) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.chart-wrapper {
		padding: var(--space-lg);
		contain: layout style paint;
		will-change: transform;
		min-height: var(--iframe-height-xs);
	}

	.chart-wrapper:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 20%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 6%, transparent);
	}

	.stacked-chart {
		height: var(--iframe-height-sm);
		contain: strict;
	}

	.network-chart {
		height: var(--iframe-height-md);
		contain: strict;
	}

	.bubble-chart {
		height: 850px;
		contain: strict;
		overflow: visible;
	}

	.treemap-chart {
		height: 500px;
		contain: strict;
	}

	.gantt-chart {
		height: 450px;
		contain: strict;
	}

	.map-chart {
		height: 500px;
		contain: layout style;
	}

	.wordcloud-chart {
		height: 500px;
		contain: strict;
	}

	.placeholder-message {
		padding: var(--space-lg);
		min-height: var(--iframe-height-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		contain: layout style;
	}

	@media (prefers-reduced-motion: reduce) {
		.chart-wrapper:hover {
			transform: none;
		}
	}

	:global(html.dark) .chart-wrapper,
	:global(html.dark) .placeholder-message {
		background: var(--color-surface);
		border-color: var(--color-border);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .chart-wrapper:hover {
		border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 35%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 40%, transparent);
	}

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

		.section-heading {
			font-size: var(--font-size-heading-5);
		}
	}
</style>
