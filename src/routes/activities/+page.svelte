<script lang="ts">
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base, resolve } from '$app/paths';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import { activityFilters } from '$lib/data/activities/filters.svelte';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import { areFiltersActive } from '$lib/utils/filterUtils';
	import { ACTIVITY_TYPE_BADGE_LABELS } from '$lib/utils/typeUtils';
	// Page-specific CSS relocated from the global app.css (this page renders the
	// activities log, the browse-by-year meter, and the tag facet).
	import '$styles/components/activity-list.css';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Activities', '/activities');

	const PER_PAGE = 8;
	const PRIMARY_TAGS = 8;

	// All activities, newest first (the store pre-sorts by date).
	let activities = $derived(getActivities());

	// The shared runed filter system (same architecture as /publications and
	// /conference-activity): tag and type filters ride in the URL via
	// urlFilterSync, so filtered views stay bookmarkable/shareable — including
	// the ?tag=… deep links from activity detail pages.
	const filters = activityFilters;
	const af = filters.activeFilters;

	// The filtered record set.
	let filtered = $derived(filters.filteredItems);
	const anyFiltering = $derived(areFiltersActive(af));

	// Human-readable list of the active filters for the log's filter note.
	const activeFilterLabels = $derived([
		...af.types.map((t) => ACTIVITY_TYPE_BADGE_LABELS[t] ?? t),
		...af.tags
	]);

	// --- Hero apparatus: total count + year span across ALL activities. ---
	const totalCount = $derived(activities.length);
	const allYears = $derived(
		[...new Set(activities.map((a: Activity) => a.year))].sort((a, b) => a - b)
	);
	const minYear = $derived(allYears[0]);
	const maxYear = $derived(allYears[allYears.length - 1]);

	// --- Browse-by-year meter (aside): counts over the FILTERED set so the
	// sidebar reflects the current view; newest year carries the lone accent. ---
	const yearsDesc = $derived(
		[...new Set(filtered.map((a: Activity) => a.year))].sort((a, b) => b - a)
	);
	function countForYear(year: number): number {
		return filtered.filter((a: Activity) => a.year === year).length;
	}
	const maxYearCount = $derived(Math.max(1, ...yearsDesc.map((y) => countForYear(y))));
	const newestYear = $derived(yearsDesc[0]);

	// --- Tag facet (aside): frequency across the filtered set, most used first.
	// The system's counts are computed over filteredItems, so this reflects the
	// current view; a selected tag always appears (its items all carry it). ---
	const tagCounts = $derived(
		Object.entries(filters.counts.tags).sort((a, b) =>
			b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]
		)
	);
	let showAllTags = $state(false);
	const visibleTags = $derived(showAllTags ? tagCounts : tagCounts.slice(0, PRIMARY_TAGS));
	const overflowTagCount = $derived(Math.max(0, tagCounts.length - PRIMARY_TAGS));

	// --- Type facet (aside): the activity kinds, labelled, with counts over the
	// filtered set — same convention as the entity-index facet grids. ---
	const typeOptions = filters.filterOptions.types;

	// --- Pagination over the flat filtered list; reset to page 1 on filter change. ---
	let currentPage = $state(1);
	$effect(() => {
		void filtered;
		currentPage = 1;
	});
	const pageStart = $derived((currentPage - 1) * PER_PAGE);
	const paged = $derived(filtered.slice(pageStart, pageStart + PER_PAGE));

	// Group the current page's entries by year, newest year first, preserving the
	// store's within-year date order. Each group also reports its total count in
	// the full filtered set (not just this page) as the year header tally.
	const pageGroups = $derived.by(() => {
		const order: number[] = [];
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local grouping, not reactive state
		const byYear = new Map<number, Activity[]>();
		for (const a of paged) {
			if (!byYear.has(a.year)) {
				byYear.set(a.year, []);
				order.push(a.year);
			}
			byYear.get(a.year)!.push(a);
		}
		return order.map((year) => ({
			year,
			items: byYear.get(year)!,
			total: countForYear(year)
		}));
	});

	// The "Updated" date in the aside footer — newest dated entry, mono form.
	const MONTHS = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC'
	];
	const updatedLabel = $derived.by(() => {
		const iso = activities.find((a: Activity) =>
			/^\d{4}-\d{2}-\d{2}$/.test(a.dateISO ?? '')
		)?.dateISO;
		if (!iso) return '';
		const [y, m, d] = iso.split('-');
		return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
	});
</script>

<SEO
	title="Activities | Frédérick Madore"
	description="Professional activities by Frédérick Madore, including workshops, talks, conferences, and other academic engagements in digital humanities and African studies."
	keywords="activities, workshops, talks, conferences, academic events, Frédérick Madore, digital humanities, Islam, West Africa"
	canonical="https://www.frederickmadore.com/activities"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div
	class="container py-8 page-enter"
	use:urlFilterSync={{
		filters: af,
		setters: { setTags: filters.setters.setTags, setTypes: filters.setters.setTypes }
	}}
>
	<div class="max-w-6xl mx-auto activities-page">
		<!-- HERO — mono log eyebrow, Archivo masthead, serif standfirst, year strip. -->
		<header class="activities-hero scroll-reveal">
			<p class="eyebrow activities-hero-eyebrow">
				Log · {totalCount} entries · {minYear} — {maxYear}
			</p>
			<h1 class="activities-hero-title">Activities</h1>
			<p class="standfirst activities-hero-standfirst">
				Talks, workshops, conferences, grants and publications, most recent first.
			</p>
		</header>

		<!-- Two columns opened by a 3px rule: the log, then the browse aside. -->
		<div class="activities-layout">
			<!-- MAIN — a press-column log grouped by year, hairline-separated rows. -->
			<main class="activities-log" id="activities-log">
				{#if anyFiltering}
					<p class="filter-note" aria-live="polite">
						<span class="filter-note-label">Filtered by</span>
						<span class="filter-note-value">{activeFilterLabels.join(' · ')}</span>
						<button type="button" class="filter-note-clear" onclick={filters.clearAllFilters}>
							Clear ✕
						</button>
					</p>
				{/if}

				{#if filtered.length === 0}
					<p class="log-empty">No activities match the current filters.</p>
				{:else}
					{#each pageGroups as group (group.year)}
						<section class="year-group" aria-label="Activities from {group.year}">
							<div class="year-group-head">
								<!-- Real h2 so the h1 → h2 (year) → h3 (item) outline holds for AT -->
								<h2 class="year-group-year">{group.year}</h2>
								<span class="year-group-count">
									{group.total}
									{group.total === 1 ? 'entry' : 'entries'}
								</span>
							</div>
							<div class="year-group-entries grid-stagger">
								{#each group.items as activity (activity.id)}
									<ActivityItem {activity} />
								{/each}
							</div>
						</section>
					{/each}

					<Pagination
						page={currentPage}
						perPage={PER_PAGE}
						total={filtered.length}
						onchange={(p) => (currentPage = p)}
						label="entries"
						scrollTargetId="activities-log"
					/>
				{/if}
			</main>

			<!-- ASIDE — browse-by-year meter, tag facet, RSS/updated footer. -->
			<aside class="activities-aside scroll-reveal">
				<section class="aside-block">
					<h2 class="aside-title">Browse by year</h2>
					<ul class="year-meter">
						{#each yearsDesc as year (year)}
							{@const count = countForYear(year)}
							<li>
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
								<a class="year-meter-row" href={resolve(`/activities/year/${year}`)}>
									<span class="year-meter-key" class:year-meter-key--current={year === newestYear}>
										{year}
									</span>
									<span
										class="hbar"
										class:hbar--current={year === newestYear}
										style="--pct: {(count / maxYearCount) * 100}%"
										aria-hidden="true"
									></span>
									<span class="year-meter-count">{count}</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>

				{#if typeOptions.length > 0}
					<section class="aside-block">
						<h2 class="aside-title">Filter by type</h2>
						<div class="chip-row aside-tags">
							<button
								type="button"
								class="chip"
								class:chip--selected={af.types.length === 0}
								onclick={() => filters.setValues('types', [])}
							>
								All <span class="chip-count">{typeOptions.length}</span>
							</button>
							{#each typeOptions as type (type)}
								<button
									type="button"
									class="chip"
									class:chip--selected={af.types.includes(type)}
									aria-pressed={af.types.includes(type)}
									onclick={() => filters.toggle('types', type)}
								>
									{ACTIVITY_TYPE_BADGE_LABELS[type] ?? type}
									<span class="chip-count">{filters.counts.types[type] ?? 0}</span>
								</button>
							{/each}
						</div>
					</section>
				{/if}

				{#if tagCounts.length > 0}
					<section class="aside-block">
						<h2 class="aside-title">Explore by tag</h2>
						<div class="chip-row aside-tags">
							<button
								type="button"
								class="chip"
								class:chip--selected={af.tags.length === 0}
								onclick={() => filters.setValues('tags', [])}
							>
								All <span class="chip-count">{tagCounts.length}</span>
							</button>
							{#each visibleTags as [tag, count] (tag)}
								<button
									type="button"
									class="chip"
									class:chip--selected={af.tags.includes(tag)}
									aria-pressed={af.tags.includes(tag)}
									onclick={() => filters.toggle('tags', tag)}
								>
									{tag} <span class="chip-count">{count}</span>
								</button>
							{/each}
							{#if overflowTagCount > 0}
								<button
									type="button"
									class="chip-more"
									aria-expanded={showAllTags}
									onclick={() => (showAllTags = !showAllTags)}
								>
									{showAllTags ? 'Fewer tags ↑' : `All ${tagCounts.length} tags ↓`}
								</button>
							{/if}
						</div>
					</section>
				{/if}

				<section class="aside-block aside-footer">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- static asset -->
					<a href="{base}/rss.xml" class="aside-rss">RSS Feed ↗</a>
					{#if updatedLabel}
						<span class="aside-updated">Updated {updatedLabel}</span>
					{/if}
				</section>
			</aside>
		</div>
	</div>
</div>
