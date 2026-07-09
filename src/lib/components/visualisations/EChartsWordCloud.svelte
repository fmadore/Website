<!--
ECharts WordCloud - Word frequency visualization for publication text analysis
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColors,
		getEChartsTooltipStyle
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import type { WordFrequency } from '$lib/types';

	// Props
	let {
		words = [] as WordFrequency[],
		title = '',
		maxWords = 100,
		minFontSize = 12,
		maxFontSize = 60,
		shape = 'circle' as 'circle' | 'cardioid' | 'diamond' | 'square' | 'triangle' | 'star',
		rotationRange = [-45, 45] as [number, number],
		/* Ink + Signal word cloud: archival ink for the body of terms, the
		 * pine signal (and its bright/deep kin) for emphasis, with
		 * a few earthy --sys-viz-* hues so a dense cloud keeps some texture. */
		colors = [
			'var(--sys-viz-1)',
			'var(--color-text-emphasis)',
			'var(--sys-viz-7)',
			'var(--color-accent)',
			'var(--sys-viz-2)',
			'var(--sys-viz-4)',
			'var(--color-text-soft)'
		],
		/**
		 * Base (desktop) height in pixels. The component scales this down
		 * automatically on tablet (×0.9) and mobile (×0.76), so callers only
		 * pick the desktop number. No wrapper height or media queries needed
		 * on the page side.
		 */
		height = 500
	}: {
		words?: WordFrequency[];
		title?: string;
		maxWords?: number;
		minFontSize?: number;
		maxFontSize?: number;
		shape?: 'circle' | 'cardioid' | 'diamond' | 'square' | 'triangle' | 'star';
		rotationRange?: [number, number];
		colors?: string[];
		height?: number;
	} = $props();

	// Container reference
	let chartContainer: HTMLDivElement | undefined = $state(undefined);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	const resolvedColors = $derived({
		...getResolvedChartColors(),
		wordColors: resolveColors(colors)
	});

	// Process words for the chart - limit and normalize
	const chartData = $derived(() => {
		if (!words.length) return [];

		const limitedWords = words.slice(0, maxWords);

		return limitedWords.map((word, index) => ({
			name: word.word,
			value: word.count,
			// Normalize to font size range
			textStyle: {
				color: resolvedColors.wordColors[index % resolvedColors.wordColors.length]
			}
		}));
	});

	// Chart options
	const chartOption = $derived({
		title: title
			? {
					text: title,
					left: 'center',
					top: 10,
					textStyle: {
						color: resolvedColors.text,
						fontSize: isMobile ? 14 : 16,
						fontFamily: resolvedColors.fontFamily,
						fontWeight: 500
					}
				}
			: { show: false },
		tooltip: {
			show: true,
			...getEChartsTooltipStyle(resolvedColors),
			formatter: (params: { name: string; value: number }) => {
				return `<strong>${params.name}</strong><br/>Count: ${params.value}`;
			}
		},
		series: [
			{
				type: 'wordCloud',
				shape: shape,
				left: 'center',
				top: title ? 50 : 'center',
				width: '90%',
				height: title ? '85%' : '90%',
				sizeRange: [
					isMobile ? minFontSize * 0.8 : minFontSize,
					isMobile ? maxFontSize * 0.7 : maxFontSize
				],
				rotationRange: rotationRange,
				rotationStep: 15,
				gridSize: isMobile ? 6 : 8,
				drawOutOfBound: false,
				layoutAnimation: true,
				textStyle: {
					fontFamily: resolvedColors.fontFamily,
					fontWeight: 'bold'
				},
				emphasis: {
					focus: 'self',
					textStyle: {
						// No glow (brief bans shadows) — emphasize with the accent ink.
						color: resolvedColors.accent
					}
				},
				data: chartData()
			}
		],
		backgroundColor: 'transparent'
	});

	// Shared ECharts lifecycle. `loadExtensions` pulls in echarts-wordcloud
	// (which registers the 'wordCloud' series type on the core module) before
	// init, and `requireDimensions` defers init until the container is sized —
	// preserving the two behaviours this component used to hand-roll.
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => words.length > 0,
		loadExtensions: () => import('echarts-wordcloud').then(() => undefined),
		requireDimensions: true
	});
</script>

<div class="wordcloud-container scroll-reveal-scale" style:--wc-h="{height}px">
	{#if words.length === 0}
		<div class="empty-state">
			<p>No word frequency data available</p>
		</div>
	{:else}
		<ChartToolbar
			chart={echartsInstance.chart}
			showDecalToggle={false}
			filename={title || 'word-cloud'}
		/>
		<div bind:this={chartContainer} class="chart"></div>
	{/if}
</div>

<style>
	/* Single source of truth for word-cloud sizing. The `height` prop sets
	   --wc-h; tablet and mobile breakpoints scale it proportionally so the
	   caller never needs to repeat the height at multiple breakpoints. */
	.wordcloud-container {
		width: 100%;
		height: var(--wc-h, 500px);
		display: flex;
		justify-content: center;
		align-items: stretch;
		position: relative;
		font-family: var(--font-family-sans);
	}

	@media (--md-down) {
		.wordcloud-container {
			height: calc(var(--wc-h, 500px) * 0.9);
		}
	}

	@media (--sm-down) {
		.wordcloud-container {
			height: calc(var(--wc-h, 500px) * 0.76);
		}
	}

	.chart {
		flex: 1;
		height: 100%;
		max-width: 100%;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-secondary);
		font-style: italic;
	}
</style>
