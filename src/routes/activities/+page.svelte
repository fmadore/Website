<script lang="ts">
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	// Page-specific CSS relocated from the global app.css (this page renders the
	// activities log, the browse-by-year meter, and the tag facet).
	import '$styles/components/activity-list.css';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Activities', '/activities');

	const PER_PAGE = 8;
	const PRIMARY_TAGS = 8;

	// All activities, newest first (the store pre-sorts by date).
	let activities = $derived(getActivities());

	// The active tag filter rides in the URL (?tag=…) so any filtered view is
	// bookmarkable/shareable. Only read searchParams in the browser.
	let selectedTag = $derived(browser ? page.url.searchParams.get('tag') : null);

	// The filtered record set (tag filter applied case-insensitively).
	let filtered = $derived(
		selectedTag
			? activities.filter((activity: Activity) =>
					activity.tags?.some((tag) => tag.toLowerCase() === selectedTag!.toLowerCase())
				)
			: activities
	);

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

	// --- Tag facet (aside): frequency across the filtered set, most used first. ---
	const tagCounts = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- build-time tally
		const freq = new Map<string, number>();
		for (const a of filtered) {
			for (const tag of a.tags ?? []) freq.set(tag, (freq.get(tag) ?? 0) + 1);
		}
		return Array.from(freq.entries()).sort((a, b) =>
			b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]
		);
	});
	let showAllTags = $state(false);
	const visibleTags = $derived(showAllTags ? tagCounts : tagCounts.slice(0, PRIMARY_TAGS));
	const overflowTagCount = $derived(Math.max(0, tagCounts.length - PRIMARY_TAGS));

	// --- Pagination over the flat filtered list; reset to page 1 on filter change. ---
	let currentPage = $state(1);
	$effect(() => {
		void selectedTag;
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

	// URL helpers — base-prefixed query strings so filtered views are shareable.
	function tagHref(tag: string): string {
		return `${base}/activities?tag=${encodeURIComponent(tag)}`;
	}

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

<div class="container py-8 page-enter">
	<div class="max-w-6xl mx-auto activities-page">
		<!-- HERO — mono log eyebrow, Archivo masthead, serif standfirst, year strip. -->
		<header class="activities-hero scroll-reveal">
			<p class="eyebrow activities-hero-eyebrow">
				Log · {totalCount} entries · {minYear} — {maxYear}
			</p>
			<h1 class="activities-hero-title">Activities</h1>
			<p class="standfirst activities-hero-standfirst">
				A running record of talks, workshops, conferences, grants and publications — the working log
				of a research practice, most recent first.
			</p>
		</header>

		<!-- Two columns opened by a 3px rule: the log, then the browse aside. -->
		<div class="activities-layout">
			<!-- MAIN — a press-column log grouped by year, hairline-separated rows. -->
			<main class="activities-log" id="activities-log">
				{#if selectedTag}
					<p class="filter-note">
						<span class="filter-note-label">Filtered by tag</span>
						<span class="filter-note-value">{selectedTag}</span>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed -->
						<a href="{base}/activities" class="filter-note-clear">Clear ✕</a>
					</p>
				{/if}

				{#if filtered.length === 0}
					<p class="log-empty">
						No activities found{selectedTag ? ` with the tag “${selectedTag}”` : ''}.
					</p>
				{:else}
					{#each pageGroups as group (group.year)}
						<section class="year-group" aria-label="Activities from {group.year}">
							<div class="year-group-head">
								<span class="year-group-year">{group.year}</span>
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

				{#if tagCounts.length > 0}
					<section class="aside-block">
						<h2 class="aside-title">Explore by tag</h2>
						<div class="chip-row aside-tags">
							<!-- eslint-disable svelte/no-navigation-without-resolve -- base-prefixed query strings -->
							<a
								class="chip"
								class:chip--selected={!selectedTag}
								href="{base}/activities"
								aria-current={!selectedTag ? 'true' : undefined}
							>
								All <span class="chip-count">{tagCounts.length}</span>
							</a>
							{#each visibleTags as [tag, count] (tag)}
								<a
									class="chip"
									class:chip--selected={selectedTag?.toLowerCase() === tag.toLowerCase()}
									href={tagHref(tag)}
									aria-current={selectedTag?.toLowerCase() === tag.toLowerCase()
										? 'true'
										: undefined}
								>
									{tag} <span class="chip-count">{count}</span>
								</a>
							{/each}
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
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
