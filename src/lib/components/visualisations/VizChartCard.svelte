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
	 * Chart wrapper — same visual language as Card.svelte so viz pages feel
	 * part of the same design system instead of their own aesthetic. Solid
	 * --color-surface, primary-tinted hover shadow, no glass gradient.
	 */
	.chart-wrapper,
	.placeholder-message {
		position: relative;
		border-radius: var(--border-radius-lg);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-moderate) var(--ease-spring),
			box-shadow var(--duration-moderate) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.chart-wrapper {
		padding: var(--space-lg);
		contain: layout style paint;
		will-change: transform;
		min-height: var(--iframe-height-xs);
	}

	.chart-wrapper:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 20%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 6%, transparent);
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
		background: var(--color-surface);
		border-color: var(--color-border);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .chart-wrapper:hover {
		border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 35%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 40%, transparent);
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
