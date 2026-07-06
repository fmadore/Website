<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Shared chart container used by the visualisations pages.
	 *
	 * Owns the surface, hover, dark-mode and responsive sizing rules so each
	 * viz section reduces to <VizChartCard variant="stacked" height="450px"
	 * {hasData}> ... {#snippet placeholder()}...{/snippet} </VizChartCard>.
	 */
	type Variant = 'stacked' | 'network' | 'bubble' | 'treemap' | 'gantt' | 'map' | 'bigrams';

	let {
		variant,
		height,
		placeholderHeight,
		hasData = true,
		placeholder,
		children
	}: {
		variant?: Variant;
		/** CSS height applied when hasData is true (e.g. "450px"). */
		height?: string;
		/** CSS height applied when hasData is false. Defaults to `height`. */
		placeholderHeight?: string;
		hasData?: boolean;
		placeholder?: Snippet;
		children?: Snippet;
	} = $props();

	const wrapperClass = $derived(variant ? `chart-wrapper ${variant}-chart` : 'chart-wrapper');
	const emptyHeight = $derived(placeholderHeight ?? height);
</script>

{#if hasData}
	<div class={wrapperClass} style:height>
		{@render children?.()}
	</div>
{:else}
	<div class="placeholder-message" style:height={emptyHeight}>
		{@render placeholder?.()}
	</div>
{/if}

<style>
	/*
	 * Chart wrapper — Ink + Signal: a flat archival panel. Square corners,
	 * no shadow, no glass; a single hairline rule sits the chart on the page
	 * like a plate in a printed volume. The chart chrome (axes, labels) carries
	 * the data voice; the container stays quiet.
	 */
	.chart-wrapper,
	.placeholder-message {
		position: relative;
		border-radius: 0;
		background: var(--color-background);
		border: var(--border-width-thin) solid var(--color-border-light);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.chart-wrapper {
		padding: var(--space-lg);
		contain: layout style paint;
		min-height: var(--iframe-height-xs);
	}

	.chart-wrapper:hover {
		border-color: var(--color-border);
	}

	.stacked-chart {
		height: var(--iframe-height-sm);
		contain: strict;
	}

	.network-chart {
		height: var(--iframe-height-md);
		contain: strict;
	}

	.bubble-chart {
		height: 850px;
		contain: strict;
		overflow: visible;
	}

	.treemap-chart {
		height: 500px;
		contain: strict;
	}

	.gantt-chart {
		height: 450px;
		contain: strict;
	}

	.map-chart {
		height: 500px;
		contain: layout style;
	}

	.bigrams-chart {
		/* Height is dynamic based on data — set via the height prop. */
		contain: layout style;
	}

	.placeholder-message {
		padding: var(--space-lg);
		min-height: var(--iframe-height-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		contain: layout style;
	}

	@media (prefers-reduced-motion: reduce) {
		.chart-wrapper:hover {
			transform: none;
		}
	}

	:global(html.dark) .chart-wrapper,
	:global(html.dark) .placeholder-message {
		background: var(--color-background);
		border-color: var(--color-border-light);
	}

	:global(html.dark) .chart-wrapper:hover {
		border-color: var(--color-border);
	}

	@media (--md-down) {
		.chart-wrapper {
			padding: var(--space-md);
		}

		.stacked-chart {
			height: calc(var(--iframe-height-sm) - var(--space-4xl));
		}

		.network-chart {
			height: var(--iframe-height-sm);
		}

		.bubble-chart {
			height: 550px;
		}

		.treemap-chart {
			height: 450px;
		}

		.gantt-chart {
			height: 400px;
		}

		.map-chart {
			height: 400px;
		}
	}

	@media (--sm-down) {
		.chart-wrapper {
			padding: var(--space-sm);
		}

		.stacked-chart {
			height: calc(var(--iframe-height-xs) + var(--space-3xl));
		}

		.network-chart {
			height: calc(var(--iframe-height-xs) + var(--space-3xl));
		}

		.bubble-chart {
			height: 450px;
		}

		.treemap-chart {
			height: 380px;
		}

		.gantt-chart {
			height: 350px;
		}

		.map-chart {
			height: 350px;
		}
	}
</style>
