<!--
ChartToolbar - Reusable toolbar for ECharts visualizations.
Provides decal toggle (accessibility) and download as PNG.
-->
<script lang="ts">
	import Icon from '@iconify/svelte';
	import type * as echarts from 'echarts';
	import { downloadChartAsImage } from '$lib/utils/chartActions';

	let {
		chart,
		showDecal = $bindable(false),
		filename = 'chart'
	}: {
		chart: echarts.ECharts | null;
		showDecal: boolean;
		filename?: string;
	} = $props();

	function handleDownload() {
		if (chart && !chart.isDisposed()) {
			downloadChartAsImage(chart, filename);
		}
	}

	function toggleDecal() {
		showDecal = !showDecal;
	}
</script>

<div class="chart-toolbar" role="toolbar" aria-label="Chart actions">
	<button
		class="toolbar-btn"
		class:active={showDecal}
		onclick={toggleDecal}
		title={showDecal ? 'Hide decal patterns' : 'Show decal patterns for accessibility'}
		aria-label={showDecal ? 'Hide decal patterns' : 'Show decal patterns for accessibility'}
		aria-pressed={showDecal}
	>
		<Icon icon="lucide:blend" width="18" height="18" />
	</button>
	<button
		class="toolbar-btn"
		onclick={handleDownload}
		disabled={!chart}
		title="Download chart as PNG"
		aria-label="Download chart as PNG"
	>
		<Icon icon="lucide:download" width="18" height="18" />
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
	}

	.toolbar-btn {
		width: var(--space-9);
		height: var(--space-9);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: color-mix(in srgb, var(--color-surface) 80%, transparent);
		backdrop-filter: blur(var(--glass-blur-sm));
		-webkit-backdrop-filter: blur(var(--glass-blur-sm));
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius);
		color: var(--color-text);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		box-shadow: var(--shadow-sm);
	}

	.toolbar-btn:hover:not(:disabled) {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.toolbar-btn:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	.toolbar-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toolbar-btn.active {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
	}

	.toolbar-btn.active:hover {
		background-color: var(--color-primary-dark);
		border-color: var(--color-primary-dark);
	}

	@media (prefers-reduced-motion: reduce) {
		.toolbar-btn {
			transition: none !important;
		}

		.toolbar-btn:hover:not(:disabled) {
			transform: none !important;
		}
	}

	@media (--sm-down) {
		.toolbar-btn {
			width: var(--space-8);
			height: var(--space-8);
		}
	}
</style>
