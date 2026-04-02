<!--
ChartToolbar - Reusable toolbar for ECharts visualizations.
Provides decal toggle (accessibility), download as PNG, and optional fullscreen.
-->
<script lang="ts">
	import Icon from '@iconify/svelte';
	import type * as echarts from 'echarts';
	import { downloadChartAsImage } from '$lib/utils/chartActions';

	let {
		chart,
		showDecal = $bindable(false),
		showDecalToggle = true,
		showFullscreen = false,
		fullscreenTarget,
		filename = 'chart'
	}: {
		chart: echarts.ECharts | null;
		showDecal?: boolean;
		showDecalToggle?: boolean;
		showFullscreen?: boolean;
		fullscreenTarget?: HTMLElement;
		filename?: string;
	} = $props();

	let isFullscreen = $state(false);

	function handleDownload() {
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
			title={showDecal ? 'Hide decal patterns' : 'Show decal patterns for accessibility'}
			aria-label={showDecal ? 'Hide decal patterns' : 'Show decal patterns for accessibility'}
			aria-pressed={showDecal}
		>
			<Icon icon="lucide:blend" width="16" height="16" />
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
			<Icon
				icon={isFullscreen ? 'lucide:shrink' : 'lucide:expand'}
				width="16"
				height="16"
			/>
		</button>
	{/if}
	<button
		class="toolbar-btn"
		onclick={handleDownload}
		disabled={!chart}
		title="Download chart as PNG"
		aria-label="Download chart as PNG"
	>
		<Icon icon="lucide:download" width="16" height="16" />
	</button>
</div>

<style>
	.chart-toolbar {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		z-index: 10;
		display: flex;
		gap: var(--space-1);
		opacity: 0.6;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.chart-toolbar:hover,
	.chart-toolbar:focus-within {
		opacity: 1;
	}

	.toolbar-btn {
		width: var(--space-8);
		height: var(--space-8);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: color-mix(in srgb, var(--color-surface) 85%, transparent);
		backdrop-filter: var(--glass-blur-sm);
		-webkit-backdrop-filter: var(--glass-blur-sm);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius);
		color: var(--color-text-light);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
		box-shadow: var(--shadow-sm);
	}

	.toolbar-btn:hover:not(:disabled) {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.toolbar-btn:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.toolbar-btn:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	.toolbar-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.toolbar-btn.active {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		opacity: 1;
	}

	.toolbar-btn.active:hover {
		background-color: var(--color-primary-dark);
		border-color: var(--color-primary-dark);
	}

	:global(html.dark) .toolbar-btn {
		background-color: color-mix(in srgb, var(--color-surface) 60%, transparent);
		color: var(--color-text-light);
	}

	@media (prefers-reduced-motion: reduce) {
		.chart-toolbar {
			opacity: 1;
			transition: none !important;
		}

		.toolbar-btn {
			transition: none !important;
		}

		.toolbar-btn:hover:not(:disabled) {
			transform: none !important;
		}
	}

	@media (--sm-down) {
		.toolbar-btn {
			width: var(--space-9);
			height: var(--space-9);
		}

		.chart-toolbar {
			opacity: 1;
		}
	}

	@media (--can-hover) {
		.toolbar-btn {
			width: var(--space-8);
			height: var(--space-8);
		}
	}
</style>
