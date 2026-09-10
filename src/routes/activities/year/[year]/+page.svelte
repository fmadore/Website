<!--
/activities/year/[year] — the log scoped to one year.

This is not a page of its own; it is /activities with the filter already
applied, and it now says so by drawing the same page: the same 4px-ruled
masthead, the same year-grouped ledger of <ActivityItem> rows, and the same
browse-by-year meter in the same ruled aside. It had been a fourth template in
a family of three — a <PageHeader> masthead with no rule above it, the year
navigation as a horizontally scrolling `.pager` strip that reported no counts,
and the entries as a bare <div> whose rows drew no separator between them.

The one thing the index does not need and this page does is the step to the
neighbouring year (`.year-step`), which is what the log's last row hands the
reader. The meter above it is still the full apparatus — every year, its count,
its share — so the step is a convenience, not the only route.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base, resolve } from '$app/paths';
	import SEO from '$lib/SEO.svelte';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	// Activity-list styles relocated from the global app.css.
	import '$styles/components/activity-list.css';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import { buildBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { formatShortDateMono } from '$lib/utils/date-formatter';

	// Get the year parameter from the URL - reactive to route changes
	let year = $derived(parseInt(page.params.year || ''));

	// Get activities reactively
	let activities = $derived(getActivities());

	// Filter activities by year - using $derived for reactive filtering
	let filteredActivities = $derived(
		activities.filter((activity: Activity) => activity.year === year)
	);

	// All years for display - using $derived for consistent sorting
	let allYears = $derived(
		[...new Set(activities.map((activity: Activity) => activity.year))].sort(
			(a: number, b: number) => b - a
		)
	);

	// --- The browse meter, over the whole log (this page filters by year rather
	// than narrowing a set, so every year keeps its true count and share). ---
	function countForYear(y: number): number {
		return activities.filter((activity: Activity) => activity.year === y).length;
	}
	const maxYearCount = $derived(Math.max(1, ...allYears.map((y) => countForYear(y))));

	// --- The step to the neighbouring year. `allYears` is newest-first, so the
	// entry after this one in the array is the older year and the one before it
	// the newer. Years with no entries have no page and are simply not there. ---
	const yearIndex = $derived(allYears.indexOf(year));
	const olderYear = $derived(yearIndex >= 0 ? allYears[yearIndex + 1] : undefined);
	const newerYear = $derived(yearIndex > 0 ? allYears[yearIndex - 1] : undefined);

	// The "Updated" stamp in the aside footer — newest dated entry in this year.
	const updatedLabel = $derived.by(() => {
		const iso = filteredActivities.find((a: Activity) =>
			/^\d{4}-\d{2}-\d{2}$/.test(a.dateISO ?? '')
		)?.dateISO;
		return iso ? formatShortDateMono(iso) : '';
	});

	// Define breadcrumb items - reactive to year changes
	let breadcrumbItems = $derived([
		{ label: 'Activities', href: resolve('/activities') },
		{
			label: String(year),
			href: resolve('/activities/year/[year]', { year: String(year) })
		}
	]);

	// Inject breadcrumb JSON-LD structured data (with unique ID for this page type)
	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
</script>

<SEO title={`Activities (${year}) | Frédérick Madore`} />

<JsonLd id="breadcrumb-json-ld-activities-year" json={breadcrumbJsonLd} />
<div class="container py-8">
	<div class="max-w-6xl mx-auto activities-page">
		<Breadcrumb items={breadcrumbItems} />

		<!-- HERO — the index masthead, scoped: mono log eyebrow with this year's
		     tally, Archivo masthead, serif standfirst. -->
		<header class="activities-hero">
			<p class="eyebrow activities-hero-eyebrow">
				Log · {filteredActivities.length}
				{filteredActivities.length === 1 ? 'entry' : 'entries'} · {year}
			</p>
			<h1 class="activities-hero-title">Activities in {year}</h1>
			<p class="standfirst">Every entry filed under {year}, most recent first.</p>
		</header>

		<div class="activities-layout">
			<!-- A <div>, not a <main>: the app shell already opens one around every
			     route (see the same note on /activities). -->
			<div class="activities-log" id="activities-log">
				{#if filteredActivities.length > 0}
					<!-- The same ledger as the index: the <ol> sets the hairline between
					     entries and the key/plate tracks the rows hang on. -->
					<ol class="log-list log-list--flush">
						{#each filteredActivities as activity, index (activity.id)}
							<li class="log-item">
								<!-- h2, not the index's h3: this page heads no year groups, so an
								     entry sits directly under the page h1. -->
								<ActivityItem {activity} eager={index === 0} headingLevel={2} />
							</li>
						{/each}
					</ol>
				{:else}
					<div class="log-empty">
						<p class="log-empty-line">No activities are filed under {year}.</p>
						<p class="log-empty-note">
							The log runs {allYears[allYears.length - 1]}–{allYears[0]}.
						</p>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
						<a class="log-empty-clear" href={resolve('/activities')}>
							All activities <span aria-hidden="true">→</span>
						</a>
					</div>
				{/if}

				<!-- The step to the neighbouring year, and the way back up to the
				     whole log. Hidden placeholders keep "All activities" centred at
				     the ends of the run, where only one neighbour exists. -->
				<nav class="year-step" aria-label="Neighbouring years">
					{#if olderYear !== undefined}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
						<a
							class="year-step-link"
							href={resolve('/activities/year/[year]', { year: String(olderYear) })}
						>
							<span aria-hidden="true">←</span>
							{olderYear}
						</a>
					{:else}
						<span class="year-step-gap" aria-hidden="true">← {year}</span>
					{/if}

					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
					<a class="year-step-link" href={resolve('/activities')}>All activities</a>

					{#if newerYear !== undefined}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
						<a
							class="year-step-link"
							href={resolve('/activities/year/[year]', { year: String(newerYear) })}
						>
							{newerYear}
							<span aria-hidden="true">→</span>
						</a>
					{:else}
						<span class="year-step-gap" aria-hidden="true">{year} →</span>
					{/if}
				</nav>
			</div>

			<!-- ASIDE — the index's browse-by-year meter, with the accent on the year
			     being read rather than on the newest one: pine marks the current
			     thing, and here the current thing is where the reader is. -->
			<aside class="activities-aside">
				<section class="aside-block">
					<h2 class="aside-title">Years</h2>
					<ul class="year-meter">
						{#each allYears as y (y)}
							{@const count = countForYear(y)}
							<li>
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
								<a
									class="year-meter-row"
									href={resolve('/activities/year/[year]', { year: String(y) })}
									aria-current={y === year ? 'page' : undefined}
								>
									<span class="year-meter-key" class:year-meter-key--current={y === year}>
										{y}
									</span>
									<span
										class="hbar"
										class:hbar--current={y === year}
										style="--pct: {(count / maxYearCount) * 100}%"
										aria-hidden="true"
									></span>
									<span class="year-meter-count">{count}</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>

				<section class="aside-block aside-footer">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- static asset -->
					<a href="{base}/rss.xml" class="aside-rss">RSS feed</a>
					{#if updatedLabel}
						<span class="aside-updated">Last entry {updatedLabel}</span>
					{/if}
				</section>
			</aside>
		</div>
	</div>
</div>
