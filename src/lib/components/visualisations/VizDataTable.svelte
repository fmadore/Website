<!--
VizDataTable — the figures behind a plate.

Every canvas plate on the two visualisation pages carries one of these in the
`table` snippet of its VizChartCard, closed by default. It is the same
`LabelledValue[]` the chart is drawn from, so the table and the marks can never
disagree; the chrome (`.chart-table`, `.chart-table-key`, `.chart-table-figure`)
is the shared idiom in `ink-signal.css`.

The three SVG network plates do not use it: their `sr-only` tables are already
in the accessibility tree, and a closed `<details>` is not.
-->
<script lang="ts">
	import type { LabelledValue } from '$lib/utils/chartDescriptions';

	let {
		rows,
		keyLabel,
		valueLabel,
		caption
	}: {
		rows: LabelledValue[];
		/** Column head for the category: "Year", "Venue", "Country". */
		keyLabel: string;
		/** Column head for the figure: "Publications", "Talks", "Citations". */
		valueLabel: string;
		/** Table caption, read out before the rows. */
		caption: string;
	} = $props();
</script>

<div class="chart-table-scroll">
	<table>
		<caption class="sr-only">{caption}</caption>
		<thead>
			<tr>
				<th scope="col" class="chart-table-key">{keyLabel}</th>
				<th scope="col" class="chart-table-figure">{valueLabel}</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.label)}
				<tr>
					<th scope="row" class="chart-table-key">{row.label}</th>
					<td class="chart-table-figure">{row.value}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
