<!--
NetworkTooltip — the flat archival tooltip shared by the three network views
(force graph, arc diagram, adjacency matrix).

Content is passed as data rather than an HTML string: the old ECharts
formatters built markup by concatenation, which meant every corpus title went
through `innerHTML`. Here the title, the meta line and the item list are just
text nodes.

Positioning is the caller's job (it knows where its own marks are); this only
renders and clamps nothing.
-->
<script lang="ts">
	import '$styles/components/network-viz.css';

	export interface TooltipContent {
		title: string;
		/** Secondary line under the title — counts, the pair, the weight. */
		meta?: string;
		/** Item titles behind the mark. */
		lines?: string[];
	}

	let {
		content,
		x,
		y
	}: {
		content: TooltipContent;
		/** Position within the plate area, in px. */
		x: number;
		y: number;
	} = $props();
</script>

<div class="viz-tooltip" role="tooltip" style:left="{x}px" style:top="{y}px">
	<strong>{content.title}</strong>
	{#if content.meta}
		<em>{content.meta}</em>
	{/if}
	{#if content.lines && content.lines.length > 0}
		<ul>
			{#each content.lines as line (line)}
				<li>{line}</li>
			{/each}
		</ul>
	{/if}
</div>
