<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { base } from '$app/paths';
	import {
		allActivities,
		activitiesByType,
		activityTypes,
		activityTagCounts,
		activitiesBySeries
	} from '$lib/data/activities';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { getYearFromISODate } from '$lib/utils/date-formatter';
	import EChartsBarChart from '$lib/components/visualisations/EChartsBarChart.svelte';
	import EChartsStackedBarChart from '$lib/components/visualisations/EChartsStackedBarChart.svelte';
	import EChartsDoughnutChart from '$lib/components/visualisations/EChartsDoughnutChart.svelte';
	import EChartsNetworkGraph from '$lib/components/visualisations/EChartsNetworkGraph.svelte';
	import EChartsTreemap from '$lib/components/visualisations/EChartsTreemap.svelte';
	import EChartsGanttChart from '$lib/components/visualisations/EChartsGanttChart.svelte';
	import EChartsWordCloud from '$lib/components/visualisations/EChartsWordCloud.svelte';
	import D3BubbleChart from '$lib/components/visualisations/D3BubbleChart.svelte';
	import LocationMap from '$lib/components/visualisations/LocationMap.svelte';
	import type { LocationDatum } from '$lib/data/geo';
	import type { WordFrequency } from '$lib/types';

	// ---------- Shared types for derived data ----------

	type TypeCount = { type: string; count: number };
	type TagCount = { tag: string; count: number };
	type MonthCount = { month: string; count: number };

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

	// Display-friendly activity type label. Unknown types are title-cased.
	const TYPE_LABELS: Record<string, string> = {
		conference: 'Conference',
		workshop: 'Workshop',
		lecture: 'Lecture',
		seminar: 'Seminar',
		talk: 'Talk',
		panel: 'Panel',
		roundtable: 'Roundtable',
		review: 'Review',
		blogpost: 'Blog post',
		podcast: 'Podcast',
		grant: 'Grant',
		other: 'Other'
	};
	const formatTypeLabel = (type: string): string =>
		TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);

	const MONTH_NAMES = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	// ---------- Derived data for each visualisation ----------

	// 1. Activities per year, stacked by type.
	const formattedActivityTypes = $derived(activityTypes.map(formatTypeLabel));

	const activitiesPerYearStackedData = $derived(
		(() => {
			const yearly: Record<number, Record<string, number>> = {};

			allActivities.forEach((activity) => {
				const year = activity.dateISO ? getYearFromISODate(activity.dateISO) : activity.year;
				const type = activity.type?.trim() || 'other';

				if (!yearly[year]) {
					yearly[year] = {};
					activityTypes.forEach((t) => (yearly[year][t] = 0));
				}
				yearly[year][type] = (yearly[year][type] || 0) + 1;
			});

			return Object.entries(yearly)
				.map(([yearStr, counts]) => {
					const row: Record<string, number> = { year: parseInt(yearStr) };
					activityTypes.forEach((rawType, i) => {
						row[formattedActivityTypes[i]] = counts[rawType] || 0;
					});
					return row;
				})
				.sort((a, b) => (a.year as number) - (b.year as number));
		})()
	);

	// 2. Activities by type (doughnut).
	const typeDistribution = $derived<TypeCount[]>(
		activityTypes
			.map((type) => ({
				type: formatTypeLabel(type),
				count: activitiesByType[type]?.length ?? 0
			}))
			.sort((a, b) => b.count - a.count)
	);
	const getTypeName = (d: TypeCount) => d.type;
	const getTypeCount = (d: TypeCount) => d.count;

	// 3. Activities by month of year (seasonality).
	const monthDistribution = $derived<MonthCount[]>(
		(() => {
			const buckets = new Array(12).fill(0);
			allActivities.forEach((activity) => {
				if (!activity.dateISO) return;
				const monthIndex = new Date(activity.dateISO).getUTCMonth();
				if (!Number.isNaN(monthIndex)) buckets[monthIndex]++;
			});
			return buckets.map((count, i) => ({ month: MONTH_NAMES[i], count }));
		})()
	);
	const getMonthName = (d: MonthCount) => d.month;
	const getMonthCount = (d: MonthCount) => d.count;

	// 4. & 5. Tag frequencies — shared by bubble chart and word cloud.
	const tagFrequencyList = $derived<TagCount[]>(
		Object.entries(activityTagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count)
	);
	const getTagName = (d: TagCount) => d.tag;
	const getTagCount = (d: TagCount) => d.count;

	const tagWordCloudData = $derived<WordFrequency[]>(
		tagFrequencyList.map((t) => ({ word: t.tag, count: t.count }))
	);

	// 6. Tag co-occurrence network. The EChartsNetworkGraph is a hub-and-spoke
	// layout, so we anchor on the most-frequent tag and show other tags that
	// appear alongside it. Edges between non-hub nodes appear when two tags
	// co-occur in the same activity.
	const tagNetworkData = $derived(
		(() => {
			if (tagFrequencyList.length === 0) {
				return {
					centerTag: '',
					collaborators: [] as Array<{
						author: string;
						collaborationCount: number;
						publications: string[];
					}>,
					connections: [] as Array<{
						source: string;
						target: string;
						publicationCount: number;
						publications: string[];
					}>
				};
			}

			const centerTag = tagFrequencyList[0].tag;

			// Activities tagged with the centre tag, for the hub collaborators list.
			const activitiesWithCenter = allActivities.filter((a) =>
				a.tags?.some((t) => t === centerTag)
			);

			// Other tags that appear alongside the centre, with the activity titles they share.
			const neighbours: Record<string, Set<string>> = {};
			activitiesWithCenter.forEach((activity) => {
				activity.tags?.forEach((tag) => {
					if (tag === centerTag) return;
					if (!neighbours[tag]) neighbours[tag] = new Set();
					neighbours[tag].add(activity.title);
				});
			});

			// Keep only tags that appear with the centre at least twice — keeps the
			// graph readable for small activity sets.
			const collaborators = Object.entries(neighbours)
				.filter(([, titles]) => titles.size >= 1)
				.map(([author, titles]) => ({
					author,
					collaborationCount: titles.size,
					publications: Array.from(titles)
				}))
				.sort((a, b) => b.collaborationCount - a.collaborationCount)
				.slice(0, 20);

			// Pairwise co-occurrence edges among the neighbours (not involving the centre).
			// Use a plain record keyed by a sorted pair — this is scratch data inside a
			// $derived block, not reactive state, so no SvelteMap is needed.
			const neighbourSet = new Set(collaborators.map((c) => c.author));
			const pairs: Record<string, { source: string; target: string; publications: Set<string> }> =
				{};
			allActivities.forEach((activity) => {
				const present = (activity.tags ?? []).filter((t) => neighbourSet.has(t));
				for (let i = 0; i < present.length; i++) {
					for (let j = i + 1; j < present.length; j++) {
						const [a, b] = [present[i], present[j]].sort();
						const key = `${a}|${b}`;
						if (!pairs[key]) {
							pairs[key] = { source: a, target: b, publications: new Set() };
						}
						pairs[key].publications.add(activity.title);
					}
				}
			});

			const connections = Object.values(pairs).map((p) => ({
				source: p.source,
				target: p.target,
				publicationCount: p.publications.size,
				publications: Array.from(p.publications)
			}));

			return { centerTag, collaborators, connections };
		})()
	);

	// 7. Type → tag treemap.
	const typeTagTreemap = $derived<TreemapNode[]>(
		(() => {
			const nodes: TreemapNode[] = [];

			activityTypes.forEach((rawType) => {
				const activities = activitiesByType[rawType] ?? [];
				if (activities.length === 0) return;

				const tagCounts: Record<string, { count: number; titles: string[] }> = {};
				activities.forEach((activity) => {
					activity.tags?.forEach((tag) => {
						const trimmed = tag.trim();
						if (!trimmed) return;
						if (!tagCounts[trimmed]) tagCounts[trimmed] = { count: 0, titles: [] };
						tagCounts[trimmed].count++;
						tagCounts[trimmed].titles.push(activity.title);
					});
				});

				const children: TreemapChild[] = Object.entries(tagCounts)
					.map(([name, data]) => ({
						name,
						value: data.count,
						publications: data.titles
					}))
					.sort((a, b) => b.value - a.value);

				// Drop type buckets that have no tagged activities — they'd show as empty cells.
				if (children.length === 0) return;

				nodes.push({ name: formatTypeLabel(rawType), children });
			});

			return nodes;
		})()
	);

	// 8. Locations map.
	const locationMapData = $derived<LocationDatum[]>(
		(() => {
			const byCountry: Record<
				string,
				{
					count: number;
					items: Array<{ id: string; title: string; subtitle?: string; type?: string }>;
				}
			> = {};

			allActivities.forEach((activity) => {
				const country = activity.location?.country?.trim();
				if (!country) return;
				if (!byCountry[country]) byCountry[country] = { count: 0, items: [] };
				byCountry[country].count++;
				byCountry[country].items.push({
					id: activity.id,
					title: activity.title,
					subtitle: activity.location?.city || activity.location?.venue,
					type: activity.type
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
	const totalMappedActivities = $derived(locationMapData.reduce((sum, loc) => sum + loc.count, 0));

	// 9. Series timeline (Gantt). Uses the optional `series` field; if no series
	// are set, the section renders a helpful placeholder.
	const seriesTimelineData = $derived<TimelineEntry[]>(
		(() => {
			const entries: TimelineEntry[] = [];

			Object.entries(activitiesBySeries).forEach(([name, activities]) => {
				if (activities.length === 0) return;
				const years = activities
					.map((a) => (a.dateISO ? getYearFromISODate(a.dateISO) : a.year))
					.filter((y): y is number => typeof y === 'number' && !Number.isNaN(y));
				if (years.length === 0) return;

				entries.push({
					name,
					startYear: Math.min(...years),
					endYear: Math.max(...years),
					publications: activities
						.map((a) => ({
							title: a.title,
							year: a.dateISO ? getYearFromISODate(a.dateISO) : a.year,
							type: a.type ?? 'other'
						}))
						.sort((a, b) => a.year - b.year)
				});
			});

			return entries.sort((a, b) => a.startYear - b.startYear);
		})()
	);

	// ---------- Breadcrumbs + SEO ----------

	const breadcrumbItems = [
		{ label: 'Activities', href: `${base}/activities` },
		{ label: 'Visualisations', href: `${base}/activities/visualisations` }
	];
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-activities-viz');
</script>

<SEO
	title="Activity Visualisations | Frédérick Madore"
	description="Visualisations of academic activities: conferences, lectures, workshops, and other engagements, including type distribution, tag networks, and a map of presentation locations."
	keywords="activities, visualisations, conferences, workshops, lectures, academic engagements, Frédérick Madore"
/>

<div class="page-container page-enter">
	<Breadcrumb items={breadcrumbItems} />
	<div class="scroll-reveal">
		<PageHeader title="Activity Visualisations" />
	</div>

	<div class="scroll-reveal">
		<PageIntro>
			This page presents various visualisations of my academic activities, including conferences,
			workshops, lectures, and other engagements.
		</PageIntro>
	</div>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">Activities per year by type</h2>
		{#if activitiesPerYearStackedData.length > 0 && activityTypes.length > 0}
			<div class="chart-wrapper stacked-chart" style="height: 450px;">
				<EChartsStackedBarChart
					data={activitiesPerYearStackedData}
					keys={formattedActivityTypes}
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
		<h2 class="section-heading">Seasonality — activities by month of year</h2>
		<p class="section-description">
			All activities aggregated by month of year, regardless of year. Reveals when in the calendar
			activity tends to cluster.
		</p>
		{#if monthDistribution.some((m) => m.count > 0)}
			<div class="chart-wrapper" style="height: 400px;">
				<EChartsBarChart
					data={monthDistribution}
					xAccessor={getMonthName}
					yAccessor={getMonthCount}
					xAxisLabel="Month"
					yAxisLabel="Number of activities"
					barColor="var(--color-primary)"
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">No dated activities to display for this visualisation.</p>
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
		<p class="section-description">Tags scaled by the number of activities they appear in.</p>
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
			Tag co-occurrence network
			{#if tagNetworkData.centerTag}
				(centred on "{tagNetworkData.centerTag}")
			{/if}
		</h2>
		<p class="section-description">
			Tags that appear alongside the most-used tag, with edges showing pairs of tags that co-occur
			in the same activities.
		</p>
		{#if tagNetworkData.collaborators.length > 0}
			<div class="chart-wrapper network-chart" style="height: 500px;">
				<EChartsNetworkGraph
					data={tagNetworkData.collaborators}
					coAuthorConnections={tagNetworkData.connections}
					contributorConnections={[]}
					centerAuthor={tagNetworkData.centerTag}
					maxConnections={20}
				/>
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">Not enough tagged activities to display a co-occurrence network.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Activity types and their tags
			{#if typeTagTreemap.length > 0}
				({typeTagTreemap.length} types)
			{/if}
		</h2>
		<p class="section-description">
			Each outer block is an activity type; inner cells are the tags used within that type, sized by
			frequency. Click to zoom into categories.
		</p>
		{#if typeTagTreemap.length > 0}
			<div class="chart-wrapper treemap-chart">
				<EChartsTreemap data={typeTagTreemap} title="Activity types and tags" />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 500px;">
				<p class="text-light">No type/tag data available to display for this visualisation.</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal mb-12">
		<h2 class="section-heading">
			Activity locations
			{#if locationMapData.length > 0}
				({locationMapData.length} countries, {totalMappedActivities} activities)
			{/if}
		</h2>
		<p class="section-description">
			Geographic distribution of activities. Marker size indicates the number of activities.
		</p>
		{#if locationMapData.length > 0}
			<div class="chart-wrapper map-chart" style="height: 500px;">
				<LocationMap data={locationMapData} basePath="/activities" itemLabel="activity" />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 400px;">
				<p class="text-light">
					No location data available yet. Add <code>location: &#123; country: '…' &#125;</code> to activity
					files to populate this map.
				</p>
			</div>
		{/if}
	</section>

	<section class="visualization-section scroll-reveal">
		<h2 class="section-heading">
			Activity series timeline
			{#if seriesTimelineData.length > 0}
				({seriesTimelineData.length} series)
			{/if}
		</h2>
		<p class="section-description">
			Spans of related activities grouped by the <code>series</code> field. Bars show the duration of
			each series; circles mark individual activities.
		</p>
		{#if seriesTimelineData.length > 0}
			<div class="chart-wrapper gantt-chart" style="height: 450px;">
				<EChartsGanttChart data={seriesTimelineData} />
			</div>
		{:else}
			<div class="placeholder-message" style="height: 450px;">
				<p class="text-light">
					No series defined yet. Add an optional <code>series: 'Series name'</code> field to related activity
					files to group them on a timeline.
				</p>
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
		font-family: var(--font-family-serif);
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

	.section-description code,
	.placeholder-message code {
		font-size: 0.9em;
		padding: 0 var(--space-2xs);
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
		border-radius: var(--border-radius-sm);
	}

	.chart-wrapper,
	.placeholder-message {
		position: relative;
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-md);
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
		contain: layout style paint;
		will-change: transform;
		min-height: var(--iframe-height-xs);
	}

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
