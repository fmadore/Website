<!--
CrossTabTable — a two-way count table, shaded by count.

It replaces the ECharts treemap that drew talks by research project. Projects
by kinds of talk is a contingency table: a handful of rows, a handful of
columns. The treemap set it as nested rectangles, so "conference papers" in
one project and in the next sat in different blocks with different shapes and
could not be compared. Here each kind keeps its column, so the comparison is a
glance down it, and each project keeps its row, closed by its total and a bar.

Every figure is printed. The ink behind a cell only repeats it so the busy
cells stand out: one hue, light to dark, kept light enough that the figure
on it stays readable. A cell or a row head can link to the index filtered to
it, so the table is also a way into the talks it counts.

It is a native <table>, so it needs no separate data table and no description
string: a screen reader reads it as what it is.
-->
<script lang="ts">
	import type { CrossTab } from '$lib/utils/vizAggregation';

	let {
		table,
		caption,
		rowHeading,
		totalLabel = 'All',
		columnLabel = (key: string) => key,
		rowHref = undefined,
		cellHref = undefined,
		itemSingular = 'item',
		itemPlural = 'items'
	}: {
		table: CrossTab;
		/** Read out before the rows; the section heading already shows it. */
		caption: string;
		/** Head of the row-key column: "Project". */
		rowHeading: string;
		/** Head of the totals row: "All projects". */
		totalLabel?: string;
		columnLabel?: (key: string) => string;
		/** Where a row head links, e.g. the index filtered to that project. */
		rowHref?: (row: string) => string;
		/** Where a non-zero cell links, e.g. the index filtered to both keys. */
		cellHref?: (row: string, column: string) => string;
		itemSingular?: string;
		itemPlural?: string;
	} = $props();

	const noun = (n: number) => (n === 1 ? itemSingular : itemPlural);

	/**
	 * Ink behind a cell, as a percentage: a pale wash at 1, 38% at the busiest
	 * cell. The ceiling is the contrast budget, not taste: the figure is printed
	 * on the tile in ink (cream at midnight) and holds 4.5:1 up to about 40% in
	 * both themes. Past that neither ink nor paper type would clear it in the
	 * middle of the ramp, and every figure here has to stay readable.
	 */
	function ink(n: number): number {
		if (n === 0 || table.maxCell === 0) return 0;
		return Math.round(8 + (n / table.maxCell) * 30);
	}
</script>

<div class="crosstab-scroll">
	<table class="crosstab">
		<caption class="sr-only">{caption}</caption>
		<thead>
			<tr>
				<th scope="col" class="crosstab-corner">{rowHeading}</th>
				{#each table.columns as column (column.key)}
					<th scope="col" class="crosstab-col">{columnLabel(column.key)}</th>
				{/each}
				<th scope="col" class="crosstab-total-head">Total</th>
			</tr>
		</thead>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- the caller resolves the index path and appends its filter query -->
		<tbody>
			{#each table.rows as row (row.key)}
				<tr>
					<th scope="row" class="crosstab-row">
						{#if rowHref}
							<a class="crosstab-row-link" rel="nofollow" href={rowHref(row.key)}>{row.key}</a>
						{:else}
							{row.key}
						{/if}
					</th>
					{#each row.cells as n, i (table.columns[i]!.key)}
						{@const column = table.columns[i]!.key}
						<td class="crosstab-cell">
							{#if n === 0}
								<span class="crosstab-fill crosstab-fill--empty">
									<span aria-hidden="true">·</span><span class="sr-only">0</span>
								</span>
							{:else if cellHref}
								<a
									class="crosstab-fill"
									style="--ink: {ink(n)}%"
									rel="nofollow"
									href={cellHref(row.key, column)}
									aria-label="{n} {noun(n)}: {row.key}, {columnLabel(column)}">{n}</a
								>
							{:else}
								<span class="crosstab-fill" style="--ink: {ink(n)}%">{n}</span>
							{/if}
						</td>
					{/each}
					<td class="crosstab-total">
						<span class="crosstab-total-figure">{row.total}</span>
						<span
							class="hbar"
							style="--pct: {((row.total / table.maxRowTotal) * 100).toFixed(1)}%"
							aria-hidden="true"
						></span>
					</td>
				</tr>
			{/each}
		</tbody>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
		<tfoot>
			<tr>
				<th scope="row" class="crosstab-row crosstab-row--total">{totalLabel}</th>
				{#each table.columns as column (column.key)}
					<td class="crosstab-foot">{column.total}</td>
				{/each}
				<td class="crosstab-total">
					<span class="crosstab-total-figure">{table.total}</span>
				</td>
			</tr>
		</tfoot>
	</table>
</div>

<style>
	/*
	 * On a phone the table is wider than the column, so it scrolls inside its
	 * own box rather than pushing the page sideways. `contain: inline-size`
	 * keeps the table's width out of the box's own, and `position: relative`
	 * makes the box the containing block of the `sr-only` zeros in the empty
	 * cells: absolutely positioned against the page instead, they escaped the
	 * scroll box's clip and widened the page on a phone.
	 */
	.crosstab-scroll {
		position: relative;
		overflow-x: auto;
		contain: inline-size;
	}

	.crosstab {
		width: 100%;
		min-width: 40rem;
		margin: 0;
		border-collapse: collapse;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		font-variant-numeric: tabular-nums;
	}

	/* The document `th`/`td` is a filled band closed by a box edge
	 * (typography.css); a ledger wants a hairline between entries instead. */
	.crosstab th,
	.crosstab td {
		background: transparent;
		border: 0;
		border-top: var(--rule-hairline) solid var(--color-hairline);
		padding: var(--space-1);
		vertical-align: middle;
	}

	.crosstab thead th {
		border-top: 0;
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
		padding-bottom: var(--space-2);
		vertical-align: bottom;
	}

	/* Column heads: data voice, wrapped to the column rather than rotated. */
	.crosstab-corner,
	.crosstab-col,
	.crosstab-total-head {
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		line-height: var(--line-height-snug);
		color: var(--color-text-light);
	}

	.crosstab-col {
		width: 6.5rem;
		text-align: center;
	}

	.crosstab-total-head {
		width: 9rem;
	}

	/*
	 * The project: a title, so it takes the document voice. The column keeps a
	 * readable measure on a phone, and stays put while the figures scroll
	 * under it, on the page ground so they pass beneath rather than through.
	 */
	.crosstab .crosstab-corner,
	.crosstab .crosstab-row {
		position: sticky;
		left: 0;
		z-index: 1;
		background: var(--color-background);
	}

	.crosstab-row {
		min-width: 11rem;
		padding-inline-end: var(--space-md);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-normal);
		line-height: var(--line-height-snug);
		text-align: left;
		color: var(--color-text-emphasis);
	}

	/* Block-level, so the whole head cell is the target, not just the type. */
	.crosstab-row-link {
		display: block;
		color: inherit;
		text-decoration: none;
	}

	.crosstab-row-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-decoration-thickness: var(--border-width-thin);
		text-underline-offset: 0.2em;
	}

	.crosstab-row-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/*
	 * A cell is a fixed-height tile inside its row, so a project name that
	 * wraps to three lines makes the row taller without making its ink heavier.
	 * The cell padding is the gap between tiles.
	 */
	.crosstab-fill {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--space-8);
		background: color-mix(in srgb, var(--color-primary) var(--ink, 0%), transparent);
		color: var(--color-text-emphasis);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.crosstab-fill--empty {
		color: var(--color-text-muted);
		font-weight: var(--font-weight-normal);
	}

	a.crosstab-fill:hover {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: -2px;
	}

	a.crosstab-fill:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: 1px;
	}

	/* A tile is a link, so on a touch screen it takes the 44px floor. */
	@media (--touch) {
		.crosstab-fill {
			min-height: 44px;
		}
	}

	/* Row total: the figure, then a bar against the busiest project. */
	.crosstab-total {
		padding-inline-start: var(--space-md);
	}

	.crosstab-total .hbar {
		display: block;
		margin-top: var(--space-1);
	}

	.crosstab-total-figure {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/* Column totals close the table, in the data voice, like a ledger's foot. */
	.crosstab tfoot th,
	.crosstab tfoot td {
		padding-block: var(--space-2);
	}

	.crosstab-row--total {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.crosstab-foot {
		text-align: center;
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-soft);
	}

	@media print {
		.crosstab-scroll {
			overflow: visible;
		}

		.crosstab {
			min-width: 0;
		}

		.crosstab-fill,
		.crosstab .hbar {
			print-color-adjust: exact;
		}
	}
</style>
