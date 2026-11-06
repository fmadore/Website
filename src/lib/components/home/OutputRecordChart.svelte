<script lang="ts">
	import { resolve } from '$app/paths';
	import type { OutputRecord, OutputYear } from '#lib/utils/homeDigest.ts';

	/**
	 * Publications above the year axis, talks below it, one column per year on
	 * one shared scale, so the two series compare by length. The home page's
	 * only ornament, and true: every bar is a count from the datasets. The
	 * newest year is the current thing, so it alone takes the accent.
	 */
	let { record }: { record: OutputRecord } = $props();

	const first = $derived(record.years[0]?.year);
	const last = $derived(record.years.at(-1)?.year);

	function busiest(key: 'publications' | 'talks'): OutputYear | undefined {
		return record.years.reduce<OutputYear | undefined>(
			(best, row) => (!best || row[key] > best[key] ? row : best),
			undefined
		);
	}

	// What the bars say, for a reader who cannot see them.
	const summary = $derived.by(() => {
		const pubs = busiest('publications');
		const talks = busiest('talks');
		if (!pubs || !talks) return '';
		return (
			`Publications and talks per year, ${first} to ${last}: ` +
			`${record.publications} publications and ${record.talks} talks. ` +
			`Busiest year for publications: ${pubs.year}, ${pubs.publications}. ` +
			`Busiest year for talks: ${talks.year}, ${talks.talks}.`
		);
	});
</script>

{#if record.years.length > 0}
	<section class="section output-record" aria-labelledby="output-record-title">
		<div class="output-head">
			<h2 class="section-title" id="output-record-title">Publications and talks per year</h2>
			<span class="dateline">{first}–{last}</span>
		</div>
		<p class="sr-only">{summary}</p>

		<div class="output-grid" style="--years: {record.years.length}">
			<a class="output-total" href={resolve('/publications')}>
				<span class="output-n">{record.publications}</span>
				<span class="output-label">Publications <span aria-hidden="true">→</span></span>
			</a>
			<div class="output-bars output-bars--up" aria-hidden="true">
				{#each record.years as row (row.year)}
					<span class="output-col" class:output-col--current={row.year === last}>
						<span class="output-value">{row.publications || ''}</span>
						<span class="output-bar" style="--n: {row.publications}"></span>
					</span>
				{/each}
			</div>

			<span class="output-axis-key" aria-hidden="true"></span>
			<div class="output-years" aria-hidden="true">
				{#each record.years as row (row.year)}
					<span class:output-year--current={row.year === last}>{row.year}</span>
				{/each}
			</div>

			<a class="output-total output-total--down" href={resolve('/conference-activity')}>
				<span class="output-n">{record.talks}</span>
				<span class="output-label">Talks <span aria-hidden="true">→</span></span>
			</a>
			<div class="output-bars output-bars--down" aria-hidden="true">
				{#each record.years as row (row.year)}
					<span class="output-col" class:output-col--current={row.year === last}>
						<span class="output-bar" style="--n: {row.talks}"></span>
						<span class="output-value">{row.talks || ''}</span>
					</span>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.output-record {
		/* One entry is this tall, in both series, so a bar's length is its count. */
		--unit: 6px;
	}

	.output-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-xs) var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.output-grid {
		display: grid;
		grid-template-columns: 9rem minmax(0, 1fr);
		column-gap: var(--space-lg);
	}

	.output-total {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding-bottom: var(--space-xs);
		color: var(--color-text-emphasis);
		text-decoration: none;
	}

	.output-total--down {
		justify-content: flex-start;
		padding: var(--space-xs) 0 0;
	}

	.output-total:hover .output-label {
		color: var(--color-accent);
	}

	.output-total:focus-visible {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-offset);
	}

	.output-n {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-weight: 850;
		font-size: var(--font-size-3xl);
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.output-label {
		margin-top: var(--space-2xs);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		transition: color 150ms ease;
	}

	.output-bars,
	.output-years {
		display: grid;
		grid-template-columns: repeat(var(--years), minmax(0, 1fr));
		column-gap: var(--space-1-5);
	}

	.output-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		min-height: calc(12 * var(--unit));
	}

	.output-bars--down .output-col {
		justify-content: flex-start;
		min-height: calc(18 * var(--unit));
	}

	.output-bar {
		width: 100%;
		max-width: 1.875rem;
		height: calc(var(--n) * var(--unit));
		background: var(--color-primary);
	}

	.output-bars--down .output-bar {
		background: var(--color-text-light);
	}

	.output-col--current .output-bar {
		background: var(--color-accent);
	}

	.output-value {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		line-height: 1.6;
		font-variant-numeric: tabular-nums;
		color: var(--color-text-light);
	}

	.output-col--current .output-value,
	.output-year--current {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	/* The year axis is the chart's baseline: ink above and below it, across the
	 * totals' column too, so the two series read as one figure. */
	.output-years,
	.output-axis-key {
		border-block: var(--rule-hairline) solid var(--color-hairline);
	}

	.output-years {
		padding: var(--space-2xs) 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text);
	}

	.output-years span {
		text-align: center;
		white-space: nowrap;
	}

	/* A phone has no room beside the bars, so each total sits above its series
	 * and every other year is named. */
	@media (--sm-down) {
		.output-record {
			--unit: 5px;
		}

		.output-grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.output-total,
		.output-total--down {
			flex-direction: row;
			justify-content: flex-start;
			align-items: baseline;
			gap: var(--space-xs);
			padding: var(--space-xs) 0;
		}

		.output-n {
			font-size: var(--font-size-xl);
		}

		.output-axis-key {
			display: none;
		}

		.output-bars,
		.output-years {
			column-gap: var(--space-0-5);
		}
	}

	/* Below --lg a column is too narrow for four figures: name every other year. */
	@media (--lg-down) {
		.output-years span:nth-child(even) {
			visibility: hidden;
		}
	}

	@media (--reduced-motion) {
		.output-label {
			transition: none;
		}
	}
</style>
