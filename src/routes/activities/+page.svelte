<script lang="ts">
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base, resolve } from '$app/paths';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import { activityFilters } from '$lib/data/activities/filters.svelte';
	import FacetCombobox from '$lib/components/entity-index/FacetCombobox.svelte';
	import { visibleFacetOptions } from '$lib/components/entity-index/facetSearch';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import { areFiltersActive } from '$lib/utils/filterUtils';
	import { ACTIVITY_TYPE_BADGE_LABELS } from '$lib/utils/typeUtils';
	import { formatShortDateMono } from '$lib/utils/date-formatter';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
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

	// Count of active filter dimensions, for the "N filters active" readout the
	// three indexes share.
	const activeFilterCount = $derived(af.types.length + af.tags.length);

	// Human-readable list of the active filters for the log's filter note. Tag
	// values are authored strings and carry apostrophes, so they are typeset
	// here exactly as the chips that switch them off are.
	const activeFilterLabels = $derived(
		[...af.types.map((t) => ACTIVITY_TYPE_BADGE_LABELS[t] ?? t), ...af.tags].map(typesetQuotes)
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

	// --- Tag facet (aside): frequency across the filtered set, most used first.
	// The system's counts are computed over filteredItems, so this reflects the
	// current view; a selected tag always appears (its items all carry it). ---
	const tagCounts = $derived(
		Object.entries(filters.counts.tags).sort((a, b) =>
			b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]
		)
	);
	const rankedTags = $derived(tagCounts.map(([tag]) => tag));
	// The frequency-ranked head stays printed as chips (real data as ornament);
	// the tail — 95 tags over 33 entries — is reached by typing rather than by
	// dumping the whole vocabulary into a 320px column. Any selected value the
	// cut would hide is merged back so it stays switchable off in place.
	const visibleTags = $derived(visibleFacetOptions(rankedTags, PRIMARY_TAGS, af.tags));

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
	const updatedLabel = $derived.by(() => {
		const iso = activities.find((a: Activity) =>
			/^\d{4}-\d{2}-\d{2}$/.test(a.dateISO ?? '')
		)?.dateISO;
		return iso ? formatShortDateMono(iso) : '';
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
	class="container py-8"
	use:urlFilterSync={{
		filters: af,
		setters: { setTags: filters.setters.setTags, setTypes: filters.setters.setTypes }
	}}
>
	<div class="max-w-6xl mx-auto activities-page">
		<!-- HERO — mono log eyebrow (tally + span), Archivo masthead, serif
		     standfirst, all opened by the 4px rule the two sibling indexes open on.
		     The year distribution is not drawn here as a bar strip: the aside's
		     browse meter already draws it, with counts and a link per year, and a
		     second copy of the same data would be ornament rather than apparatus. -->
		<header class="activities-hero">
			<p class="eyebrow activities-hero-eyebrow">
				Log · {totalCount} entries · {minYear}–{maxYear}
			</p>
			<h1 class="activities-hero-title">Activities</h1>
			<p class="standfirst">
				Talks, workshops, conferences, grants and publications, most recent first.
			</p>
		</header>

		<!-- Two columns opened by a 3px rule: the log, then the browse aside. -->
		<div class="activities-layout">
			<!-- The log — a press column grouped by year, hairline-separated rows.
			     A <div>, not a <main>: the app shell already opens one around every
			     route, and a second (nested) main is invalid and leaves the document
			     with two main landmarks for a screen reader to choose between. -->
			<div class="activities-log" id="activities-log">
				<!-- The narrowing, stated: what is filtering, how much of the log
				     survives it, and the way out. The count is the half that was
				     missing — a filtered log that reports no match figure leaves the
				     reader to count the rows themselves. -->
				{#if anyFiltering}
					<p class="filter-note">
						<span class="filter-note-label">Filtered by</span>
						<span class="filter-note-value">{activeFilterLabels.join(' · ')}</span>
						<!-- The count alone is the live region: with the button inside it, every
						     narrowing re-announced the control along with the figure. -->
						<span class="filter-note-count" aria-live="polite">
							{activeFilterCount}
							{activeFilterCount === 1 ? 'filter' : 'filters'} active · {filtered.length} of {totalCount}
							{totalCount === 1 ? 'entry' : 'entries'}
						</span>
						<button type="button" class="filter-note-clear" onclick={filters.clearAllFilters}>
							Clear all <span aria-hidden="true">✕</span>
						</button>
					</p>
				{/if}

				{#if filtered.length === 0}
					<!-- Empty state: name the corpus that is still there, and carry the
					     control back to it. The filter note above also clears, but it is
					     scrolled past on a phone, where the log is the whole column. -->
					<div class="log-empty">
						<p class="log-empty-line">No activities match.</p>
						<p class="log-empty-note">
							The log holds {totalCount} entries, {minYear}–{maxYear}.
						</p>
					</div>
				{:else}
					{#each pageGroups as group, groupIndex (group.year)}
						<section class="year-group" aria-label="Activities from {group.year}">
							<div class="year-group-head">
								<!-- Real h2 so the h1 → h2 (year) → h3 (item) outline holds for AT -->
								<h2 class="year-group-year">{group.year}</h2>
								<span class="year-group-count">
									{group.total}
									{group.total === 1 ? 'entry' : 'entries'}
								</span>
							</div>
							<!-- An <ol>, like `.bib-list` on the two sibling indexes: the
							     hairline between entries and the key/plate track widths are
							     the list's to set, so year-group spacing stays under its
							     control and every row hangs on the same two columns. -->
							<ol class="log-list">
								{#each group.items as activity, itemIndex (activity.id)}
									<li class="log-item">
										<ActivityItem {activity} eager={groupIndex === 0 && itemIndex === 0} />
									</li>
								{/each}
							</ol>
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
			</div>

			<!-- ASIDE — browse-by-year meter, tag facet, RSS/updated footer. -->
			<aside class="activities-aside">
				<section class="aside-block">
					<h2 class="aside-title">Years</h2>
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
						<h2 class="aside-title">Types</h2>
						<div class="chip-row aside-tags">
							<button
								type="button"
								class="chip"
								class:chip--selected={af.types.length === 0}
								aria-label="All types"
								onclick={() => filters.setValues('types', [])}
							>
								All <span class="chip-count">{totalCount}</span>
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
						<h2 class="aside-title">Tags</h2>
						<div class="chip-row aside-tags">
							<button
								type="button"
								class="chip"
								class:chip--selected={af.tags.length === 0}
								aria-label="All tags"
								onclick={() => filters.setValues('tags', [])}
							>
								All <span class="chip-count">{totalCount}</span>
							</button>
							{#each visibleTags as tag (tag)}
								<button
									type="button"
									class="chip"
									class:chip--selected={af.tags.includes(tag)}
									aria-pressed={af.tags.includes(tag)}
									onclick={() => filters.toggle('tags', tag)}
								>
									{typesetQuotes(tag)}
									<span class="chip-count">{filters.counts.tags[tag] ?? 0}</span>
								</button>
							{/each}
						</div>
						{#if rankedTags.length > PRIMARY_TAGS}
							<FacetCombobox
								options={rankedTags}
								counts={filters.counts.tags}
								selected={af.tags}
								label="tags"
								ontoggle={(value) => filters.toggle('tags', value)}
							/>
						{/if}
					</section>
				{/if}

				<section class="aside-block aside-footer">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- static asset -->
					<a href="{base}/rss.xml" class="aside-rss">RSS feed</a>
					{#if updatedLabel}
						<span class="aside-updated">Log updated {updatedLabel}</span>
					{/if}
				</section>
			</aside>
		</div>
	</div>
</div>
