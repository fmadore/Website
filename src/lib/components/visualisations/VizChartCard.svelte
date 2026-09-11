<script lang="ts">
	import type { Snippet } from 'svelte';
	import { inView } from '$lib/actions/inView';

	/**
	 * Shared chart container used by the visualisations pages.
	 *
	 * Owns the surface, hover, dark-mode and responsive sizing rules so each
	 * viz section reduces to <VizChartCard variant="stacked" height="450px"
	 * {hasData}> ... {#snippet placeholder()}...{/snippet} </VizChartCard>.
	 *
	 * It is also the gate. A visualisation page is a column of seven canvases
	 * and a map, every one of which used to mount on load: the reader waited
	 * several seconds of main thread for plates fourteen viewports below them.
	 * The card now holds its reserved box empty until `use:inView` fires 400px
	 * ahead of the viewport, so a plate costs its library only when it is about
	 * to be read. The box height never changes, so nothing below it moves.
	 */
	type Variant =
		'stacked' | 'network' | 'arc' | 'matrix' | 'bubble' | 'treemap' | 'gantt' | 'map' | 'bigrams';

	/**
	 * The three network plates draw themselves: declarative SVG from pure layout
	 * maths, with an `sr-only` table inside them. They are server-rendered as
	 * they stand, they pull no library the page has not already paid for, and
	 * gating them would take their table out of the prerendered HTML — a real
	 * loss for no saving. So they are never deferred.
	 */
	const SELF_DRAWN: ReadonlySet<string> = new Set(['network', 'arc', 'matrix']);

	let {
		variant,
		height,
		placeholderHeight,
		hasData = true,
		placeholder,
		table,
		children
	}: {
		variant?: Variant;
		/** CSS height applied when hasData is true (e.g. "450px"). */
		height?: string;
		/** CSS height applied when hasData is false. Defaults to `height`. */
		placeholderHeight?: string;
		hasData?: boolean;
		placeholder?: Snippet;
		/**
		 * The plate's own figures, printed under it in a closed `<details>`.
		 * Pass a `<VizDataTable>` built from the same data the chart receives.
		 * The SVG plates do not use it — a closed `<details>` is outside the
		 * accessibility tree, so they keep their `sr-only` tables instead.
		 */
		table?: Snippet;
		children?: Snippet;
	} = $props();

	const wrapperClass = $derived(variant ? `chart-wrapper ${variant}-chart` : 'chart-wrapper');
	const emptyHeight = $derived(placeholderHeight ?? height);
	const deferred = $derived(!(variant !== undefined && SELF_DRAWN.has(variant)));
	/** The map plate says what it is loading; every other plate is a chart. */
	const pendingLabel = $derived(variant === 'map' ? 'Loading map…' : 'Loading chart…');

	let revealed = $state(false);
	const showChildren = $derived(!deferred || revealed);
</script>

{#if hasData}
	<div class={wrapperClass} style:height use:inView={() => (revealed = true)}>
		{#if showChildren}
			{@render children?.()}
		{:else}
			<!-- Held, not failed: the same flat panel the honest state uses, with
			     the machine saying what is on its way. No spinner, no shimmer. -->
			<div class="state-note plate-pending" role="status">
				<span class="dateline">{pendingLabel}</span>
			</div>
		{/if}
	</div>
	{#if table}
		<!-- Outside the gate on purpose: the figures behind the plate are the
		     plate's accessible alternative and must never wait on a scroll. -->
		<details class="chart-table">
			<summary class="dateline">Data table</summary>
			{@render table()}
		</details>
	{/if}
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
	 *
	 * The plate does not respond to the pointer. It used to darken its border on
	 * hover, which is an app affordance offered by something that is not
	 * clickable — a printed plate does not acknowledge being looked at. The
	 * marks inside it are the interactive part.
	 */
	.chart-wrapper,
	.placeholder-message {
		position: relative;
		border-radius: 0;
		background: var(--color-background);
		border: var(--border-width-thin) solid var(--color-border);
	}

	.chart-wrapper {
		padding: var(--space-lg);
		contain: layout style paint;
		min-height: var(--iframe-height-xs);
	}

	/* The plate while its library is on the way. `.state-note` (ink-signal.css)
	   is the panel; this only makes it fill the box the plate has already
	   reserved, exactly as `.map-state-note` does for a map that failed — so
	   pending and failed sit in the same place and only the words differ. */
	.plate-pending {
		width: 100%;
		height: 100%;
	}

	.stacked-chart {
		height: var(--iframe-height-sm);
		contain: strict;
	}

	.network-chart {
		height: var(--iframe-height-md);
		contain: strict;
	}

	/* The arc ledger's height follows its row count, supplied via the `height`
	   prop, so it must not be `contain: strict` (which would fix the size). */
	.arc-chart {
		contain: layout style;
	}

	/* The matrix is square: its height comes from the row count via the `height`
	   prop, so it must not be `contain: strict` (which would fix the size). */
	.matrix-chart {
		contain: layout style;
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

	/* The empty plate sets its message where a first line goes — top left — not
	 * floating in the middle of 450px of paper. See `.viz-empty`. */
	.placeholder-message {
		padding: var(--space-lg);
		min-height: var(--iframe-height-xs);
		contain: layout style;
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

		/*
		 * Below --sm the toolbar floats over the top right of a 350px plate and
		 * covers the data it acts on — on the horizontal bar charts, the longest
		 * bar's own label. So the plate becomes a column and the toolbar leaves
		 * the drawing area for a right-aligned control row above it.
		 *
		 * Matched with `:has()` rather than each chart's own container class:
		 * every one of them wraps the toolbar the same way (`.echarts-container`,
		 * `.viz-plate`, `.map-wrapper`), and none of them should have to know
		 * about this breakpoint. `.viz-plate` is already a column, so the rule
		 * only restates what it does.
		 */
		.chart-wrapper {
			display: flex;
			flex-direction: column;
		}

		.chart-wrapper > :global(*),
		.chart-wrapper :global(:has(> .chart-toolbar)) {
			display: flex;
			flex-direction: column;
			flex: 1 1 auto;
			min-height: 0;
		}

		.chart-wrapper :global(:has(> .chart-toolbar) > :not(.chart-toolbar)) {
			flex: 1 1 auto;
			min-height: 0;
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
