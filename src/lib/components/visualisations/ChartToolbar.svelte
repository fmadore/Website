<!--
ChartToolbar - Reusable toolbar for chart visualizations.
Provides decal toggle (accessibility), download as PNG, and optional fullscreen.

Works for both renderers: pass an ECharts instance as `chart` for the canvas
charts, or an `onDownload` callback for the SVG ones (NetworkGraph), which
export themselves via `downloadSvgAsImage`.
-->
<script lang="ts">
	import Icon from '@iconify/svelte';
	// Types from the tree-shaken core, never the all-in-one 'echarts' entry.
	import type * as echarts from '$lib/utils/echartsCore';
	import { downloadChartAsImage } from '$lib/utils/chartActions';

	let {
		chart,
		onDownload,
		showDecal = $bindable(false),
		showDecalToggle = true,
		showFullscreen = false,
		fullscreenTarget,
		filename = 'chart'
	}: {
		chart: echarts.ECharts | null;
		/** Overrides the ECharts export path; used by SVG-rendered charts. */
		onDownload?: () => void;
		showDecal?: boolean;
		showDecalToggle?: boolean;
		showFullscreen?: boolean;
		fullscreenTarget?: HTMLElement;
		filename?: string;
	} = $props();

	let isFullscreen = $state(false);

	function handleDownload() {
		if (onDownload) {
			onDownload();
			return;
		}
		if (chart && !chart.isDisposed()) {
			downloadChartAsImage(chart, filename);
		}
	}

	function toggleDecal() {
		showDecal = !showDecal;
	}

	async function toggleFullscreen() {
		if (!fullscreenTarget) return;

		try {
			if (!document.fullscreenElement) {
				await fullscreenTarget.requestFullscreen();
				isFullscreen = true;
			} else {
				await document.exitFullscreen();
				isFullscreen = false;
			}
		} catch {
			// Fullscreen not supported or denied
		}

		// Resize chart after fullscreen change
		requestAnimationFrame(() => {
			if (chart && !chart.isDisposed()) {
				chart.resize();
			}
		});
	}

	$effect(() => {
		function onFullscreenChange() {
			isFullscreen = !!document.fullscreenElement;
			// Resize chart when fullscreen state changes (e.g. user presses Escape)
			requestAnimationFrame(() => {
				if (chart && !chart.isDisposed()) {
					chart.resize();
				}
			});
		}

		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	});
</script>

<div class="chart-toolbar" role="toolbar" aria-label="Chart actions">
	{#if showDecalToggle}
		<button
			class="toolbar-btn"
			class:active={showDecal}
			onclick={toggleDecal}
			title={showDecal ? 'Remove pattern fills' : 'Add pattern fills'}
			aria-label={showDecal ? 'Remove pattern fills' : 'Add pattern fills'}
			aria-pressed={showDecal}
		>
			<Icon icon="lucide:contrast" width="16" height="16" />
		</button>
	{/if}
	{#if showFullscreen && fullscreenTarget}
		<button
			class="toolbar-btn"
			class:active={isFullscreen}
			onclick={toggleFullscreen}
			title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
			aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
		>
			<Icon icon={isFullscreen ? 'lucide:shrink' : 'lucide:expand'} width="16" height="16" />
		</button>
	{/if}
	<button
		class="toolbar-btn"
		onclick={handleDownload}
		disabled={!chart && !onDownload}
		title="Download chart as PNG"
		aria-label="Download chart as PNG"
	>
		<Icon icon="lucide:download" width="16" height="16" />
	</button>
</div>

<style>
	/*
	 * Apparatus, not chrome: the toolbar is a small stamped control block sitting
	 * in the plate's corner. It used to sit at 0.6 opacity and fade in on hover,
	 * which is an app affordance — a printed page does not hide its apparatus —
	 * and left the icons under the contrast floor at rest. Full opacity, quiet
	 * ink, and hover is a border/colour change only.
	 */
	.chart-toolbar {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		z-index: 10;
		display: flex;
		gap: var(--space-1);
	}

	.toolbar-btn {
		/* WCAG 2.5.8 floor with room to spare; the glyph is 16px. */
		width: var(--space-8);
		height: var(--space-8);
		min-width: var(--space-6);
		min-height: var(--space-6);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		color: var(--color-text-soft);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	/* The house move on a quiet control: the edge darkens, the ink comes up.
	   No pine — the accent marks the current thing, not the hovered one. */
	.toolbar-btn:hover:not(:disabled) {
		border-color: var(--color-border-dark);
		color: var(--color-text-emphasis);
	}

	.toolbar-btn:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.toolbar-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Engaged toggle — solid ink fill, exactly as a selected chip. */
	.toolbar-btn.active {
		background-color: var(--color-primary);
		color: var(--color-text-inverted);
		border-color: var(--color-primary);
	}

	.toolbar-btn.active:hover {
		background-color: var(--color-primary-dark);
		border-color: var(--color-primary-dark);
		color: var(--color-text-inverted);
	}

	/* Below --sm the toolbar leaves the drawing area for a right-aligned control
	 * row above it; the plate turns itself into a column to receive it (see
	 * VizChartCard). Nothing here knows how tall the plate is. */
	@media (--sm-down) {
		.chart-toolbar {
			position: static;
			align-self: flex-end;
			margin-bottom: var(--space-2);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toolbar-btn {
			transition: none !important;
		}
	}

	@media (--touch) {
		.toolbar-btn {
			width: var(--space-9);
			height: var(--space-9);
		}
	}
</style>
