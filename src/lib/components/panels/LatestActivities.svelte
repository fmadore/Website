<script lang="ts">
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import type { ActivityLog } from '$lib/utils/activityLog';
	import { resolve } from '$app/paths';
	import PanelBase from './PanelBase.svelte';
	import Button from '../atoms/Button.svelte';
	// No route-scoped stylesheet: the rail is built entirely from the global
	// idiom layer (`.ledger*`, `.year-meter*`, `.hbar`, `.rail-label` in
	// ink-signal.css) plus panels.css, so the home page no longer downloads
	// `activity-list.css` for markup it does not render.

	// The rail arrives as data (`summariseActivityLog`, run by the page's server
	// load): the newest entries and the per-year tallies. The counts are what
	// turn a row of year links into a meter: the bar encodes real output per
	// year rather than decorating the list.
	let {
		log,
		showYearFilters = true
	}: {
		log: ActivityLog;
		showYearFilters?: boolean;
	} = $props();

	let activityList = $derived(log.latest);
	let yearRows = $derived(log.years);

	let newestYear = $derived(yearRows[0]?.year);

	/** Day + abbreviated month — '08 Sep', uppercased by the ledger key. */
	function formatDayMonth(dateString: string): string {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;
		const day = String(date.getDate()).padStart(2, '0');
		return `${day} ${date.toLocaleString('en-GB', { month: 'short' })}`;
	}

	function formatYear(dateString: string): string {
		const date = new Date(dateString);
		return isNaN(date.getTime()) ? '' : String(date.getFullYear());
	}
</script>

{#snippet panelHeader()}
	<div class="log-head">
		<h2 class="panel-title">Latest activities</h2>
		<span class="log-tally">{log.total} in the log</span>
	</div>
{/snippet}

{#snippet panelContent()}
	{#if activityList.length === 0}
		<p class="no-activities">The log is empty.</p>
	{:else}
		<ol class="ledger log-ledger">
			{#each activityList as activity (activity.id)}
				<li>
					<a
						class="ledger-row log-row"
						href={resolve(`/activities/${activity.id}` as `/activities/${string}`)}
					>
						<span class="ledger-key">
							<span>{formatDayMonth(activity.date)}</span>
							<span class="ledger-status">{formatYear(activity.date)}</span>
						</span>
						<span class="ledger-content">
							<span class="ledger-title log-title">{typesetQuotes(activity.title)}</span>
						</span>
					</a>
				</li>
			{/each}
		</ol>

		<div class="view-all-container">
			<Button href={resolve('/activities')} variant="outline-secondary" size="base">
				View all activities <span aria-hidden="true">→</span>
			</Button>
		</div>
	{/if}
{/snippet}

{#snippet panelFooter()}
	{#if showYearFilters && yearRows.length > 0}
		<h3 class="rail-label">Browse by year</h3>
		<ul class="year-meter">
			{#each yearRows as row (row.year)}
				<li>
					<a
						class="year-meter-row"
						href={resolve(`/activities/year/${row.year}` as `/activities/year/${string}`)}
						aria-label="{row.year}, {row.count} {row.count === 1 ? 'activity' : 'activities'}"
					>
						<span class="year-meter-key" class:year-meter-key--current={row.year === newestYear}>
							{row.year}
						</span>
						<span
							class="hbar"
							class:hbar--current={row.year === newestYear}
							style="--pct: {row.pct}%"
							aria-hidden="true"
						></span>
						<span class="year-meter-count" aria-hidden="true">{row.count}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

<PanelBase
	variant="activities"
	showFooter={true}
	header={panelHeader}
	content={panelContent}
	footer={panelFooter}
/>

<style>
	/* Panel head — the mono label and the log's own tally sharing one baseline.
	 * The tally is the apparatus half of the label: "Latest activities" states
	 * what the block is, "35 in the log" states what stands behind it. */
	.log-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2) var(--space-3);
	}

	.log-head :global(.panel-title) {
		margin-bottom: 0;
	}

	.log-tally {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
		white-space: nowrap;
	}

	/* The log itself — ledger rows, not cards. The same records render as
	 * hairline-separated rows on /activities; a rail that restated them as
	 * bordered tiles made the home page disagree with its own destination and
	 * spent an accent on every hover border. Key column is narrower than the
	 * 7rem default because the rail is 22rem, not a reading column. */
	.log-ledger {
		--ledger-key-w: 4.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.log-row {
		gap: var(--space-2) var(--space-4);
		text-decoration: none;
		color: inherit;
	}

	.log-row:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
	}

	/* Set one step below the reading column: the rail is apparatus pointing at
	 * the record, and must not compete with the prose it sits beside. */
	.log-title {
		font-size: var(--font-size-base);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.log-row:hover .log-title {
		color: var(--color-accent);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.log-title {
			transition: none;
		}
	}
</style>
