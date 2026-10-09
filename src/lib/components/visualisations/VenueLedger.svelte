<!--
VenueLedger — where the publications appeared, as a ranked ledger with one
mark per work.

It replaces an ECharts treemap. Most venues in this record carry a single
work, so the treemap could only tile its plate into near-equal rectangles too
small to name: area encoded nothing, and labels were dropped wholesale to keep
them from colliding. Here every venue is named. A venue with more than one work
gets its own row, with a mark per work, so the column of marks reads as a
bar chart. The singletons share one row, which is the truth about them: the
record is dispersed. The grouping and ranking are pure (`utils/venueLedger.ts`).

Each work is reachable from its row: the years under a venue name link to its
works, and a singleton's name links to its one work. It is HTML rather than a
canvas, so it is server-rendered, themed by the tokens, read by a screen reader
as the list it is, and needs no separate data table.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { VenueLedger, VenueWork } from '$lib/utils/venueLedger';

	let { ledger }: { ledger: VenueLedger } = $props();

	const workHref = (work: VenueWork) => resolve('/publications/[id]', { id: work.id });

	const venues = (n: number) => `${n} ${n === 1 ? 'venue' : 'venues'}`;
	const works = (n: number) => `${n} ${n === 1 ? 'work' : 'works'}`;

	/** `14 more venues, one work each`; no "more" when the tail is the whole group. */
	const tailKey = (n: number, afterRanked: boolean) =>
		n === 1
			? `${afterRanked ? '1 more venue' : '1 venue'}, one work`
			: `${n} ${afterRanked ? 'more ' : ''}venues, one work each`;
</script>

<div class="venue-ledger" style="--venue-max: {ledger.maxWorks}">
	{#each ledger.groups as group (group.key)}
		<section class="venue-group" aria-labelledby="venue-group-{group.key}">
			<h3 class="rail-label venue-group-head" id="venue-group-{group.key}">
				<span>{group.label}</span>
				<span class="venue-group-count">
					{venues(group.venueCount)} · {works(group.workCount)}
				</span>
			</h3>

			<ul class="venue-rows">
				{#each group.ranked as venue (venue.name)}
					<li class="venue-row">
						<div class="venue-body">
							<span class="venue-name">{venue.name}</span>
							<p class="apparatus-line venue-works">
								{#each venue.works as work, i (work.id)}
									{#if i > 0}
										<span class="apparatus-line-sep" aria-hidden="true">·</span>
									{/if}
									<a
										class="no-underline"
										href={workHref(work)}
										title={work.title}
										aria-label="{work.year}: {work.title}">{work.year}</a
									>
								{/each}
							</p>
						</div>
						<span class="venue-marks" aria-hidden="true">
							{#each venue.works as work (work.id)}<span class="venue-mark"></span>{/each}
						</span>
						<span class="venue-count">
							{venue.works.length}<span class="sr-only"> works</span>
						</span>
					</li>
				{/each}

				{#if group.singles.length > 0}
					<li class="venue-row venue-row--tail">
						<div class="venue-body">
							<span class="venue-tail-key">
								{tailKey(group.singles.length, group.ranked.length > 0)}
							</span>
							<p class="venue-tail">
								{#each group.singles as venue, i (venue.name)}
									{@const work = venue.works[0]!}
									{#if i > 0}
										<span class="venue-tail-sep" aria-hidden="true">·</span>
									{/if}
									<a
										class="no-underline venue-tail-link"
										href={workHref(work)}
										title="{work.title} ({work.year})"
										aria-label="{venue.name}: {work.title} ({work.year})">{venue.name}</a
									>
								{/each}
							</p>
						</div>
						<span class="venue-marks" aria-hidden="true"><span class="venue-mark"></span></span>
						<span class="venue-count" aria-hidden="true">1</span>
					</li>
				{/if}
			</ul>
		</section>
	{/each}
</div>

<style>
	/*
	 * The two groups sit side by side once there is room for two reading
	 * columns, and stack below that. Each is a ledger: a mono head over a
	 * hairline, then one hairline-ruled row per venue.
	 */
	.venue-ledger {
		--venue-mark: 0.75rem;
		--venue-mark-gap: 3px;
		/* The line box of a venue name: marks and count sit on that first line. */
		--venue-line: calc(var(--font-size-base) * var(--line-height-snug));
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-xl) var(--space-2xl);
	}

	@media (--lg) {
		.venue-ledger {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.venue-group-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-1) var(--space-md);
		margin-bottom: 0;
	}

	.venue-group-count {
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		color: var(--color-text-light);
	}

	.venue-rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/*
	 * Name, marks, count. The mark column is as wide as the busiest venue
	 * needs, the same for every row of both groups, so the marks align into a
	 * single bar chart down the page.
	 */
	.venue-row {
		display: grid;
		grid-template-columns:
			minmax(0, 1fr)
			calc(var(--venue-max) * (var(--venue-mark) + var(--venue-mark-gap)))
			2ch;
		align-items: start;
		gap: var(--space-md);
		margin: 0;
		padding: var(--space-2-5) 0;
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.venue-row:first-child {
		border-top: none;
	}

	.venue-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-0-5);
		min-width: 0;
	}

	.venue-name {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--venue-line);
		color: var(--color-text-emphasis);
	}

	/* The years are the works: set as an apparatus run under the name. */
	.venue-works {
		letter-spacing: var(--tracking-figures);
	}

	.venue-marks {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--venue-mark-gap);
		min-height: var(--venue-line);
	}

	/* One square per work, in ink: real data, so it may decorate. */
	.venue-mark {
		width: var(--venue-mark);
		height: var(--venue-mark);
		background: var(--color-primary);
	}

	.venue-count {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-figures);
		font-variant-numeric: tabular-nums;
		line-height: var(--venue-line);
		color: var(--color-text-emphasis);
		text-align: right;
	}

	/* The long tail: a mono key, then the venues as a typeset serif run. */
	.venue-tail-key {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		line-height: var(--venue-line);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.venue-tail {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
	}

	.venue-tail-link {
		color: inherit;
		text-decoration: none;
	}

	.venue-tail-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-decoration-thickness: var(--border-width-thin);
		text-underline-offset: 0.2em;
	}

	.venue-tail-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
		color: var(--color-text-emphasis);
	}

	/* As `.apparatus-line-sep`, measured for the serif: Svelte keeps only the
	 * space after the interpunct, so the one before it is drawn. */
	.venue-tail-sep {
		margin-inline-start: 0.25em;
		color: color-mix(in srgb, var(--color-text-light) 55%, transparent);
	}

	/* The marks are ink fills, which a printer drops with the backgrounds. */
	@media print {
		.venue-mark {
			print-color-adjust: exact;
		}
	}
</style>
