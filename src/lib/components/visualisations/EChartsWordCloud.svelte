<!--
ECharts WordCloud - Word frequency visualization for publication text analysis
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import { getResolvedChartColors } from '$lib/utils/chartColorUtils';
	import type { WordFrequency } from '$lib/types';
	import type * as echarts from 'echarts';

	// Props
	let {
		words = [] as WordFrequency[],
		title = '',
		maxWords = 100,
		minFontSize = 12,
		maxFontSize = 60,
		shape = 'circle' as 'circle' | 'cardioid' | 'diamond' | 'square' | 'triangle' | 'star',
		rotationRange = [-45, 45] as [number, number],
		colors = [
			'var(--color-primary)',
			'var(--color-primary-light)',
			'var(--color-accent)',
			'var(--color-accent-dark)',
			'var(--color-highlight)',
			'var(--color-primary-dark)',
			'var(--color-accent-light)'
		]
	}: {
		words?: WordFrequency[];
		title?: string;
		maxWords?: number;
		minFontSize?: number;
		maxFontSize?: number;
		shape?: 'circle' | 'cardioid' | 'diamond' | 'square' | 'triangle' | 'star';
		rotationRange?: [number, number];
		colors?: string[];
	} = $props();

	// Container reference
	let chartContainer: HTMLDivElement | undefined = $state(undefined);
	let chart: echarts.ECharts | null = $state(null);
	let isReady = $state(false);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Resolve CSS variables to actual colors
	function resolveColor(color: string): string {
		if (!color.startsWith('var(')) return color;
		const varName = color.match(/var\(([^)]+)\)/)?.[1];
		if (!varName) return color;

		if (typeof document !== 'undefined') {
			const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
			return computed || color;
		}
		return color;
	}

	const resolvedColors = $derived({
		...getResolvedChartColors(),
		wordColors: colors.map(resolveColor)
	});

	// Process words for the chart - limit and normalize
	const chartData = $derived(() => {
		if (!words.length) return [];

		const limitedWords = words.slice(0, maxWords);
		const maxCount = Math.max(...limitedWords.map((w) => w.count));
		const minCount = Math.min(...limitedWords.map((w) => w.count));
		const range = maxCount - minCount || 1;

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
			backgroundColor: resolvedColors.surface,
			borderColor: resolvedColors.border,
			borderWidth: 1,
			textStyle: {
				color: resolvedColors.text,
				fontFamily: resolvedColors.fontFamily
			},
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
				sizeRange: [isMobile ? minFontSize * 0.8 : minFontSize, isMobile ? maxFontSize * 0.7 : maxFontSize],
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
						textShadowBlur: 10,
						textShadowColor: 'rgba(0, 0, 0, 0.3)'
					}
				},
				data: chartData()
			}
		],
		backgroundColor: 'transparent'
	});

	// Initialize chart with wordcloud extension
	$effect(() => {
		let mounted = true;
		let resizeObserver: ResizeObserver | undefined;

		(async () => {
			if (!chartContainer) return;

			try {
				// Import echarts first, then the wordcloud extension
				const echartsModule = await import('echarts');
				await import('echarts-wordcloud');

				if (!mounted || !chartContainer) return;

				// Initialize chart
				chart = echartsModule.init(chartContainer);

				// Setup resize observer
				resizeObserver = new ResizeObserver(() => {
					if (chart && !chart.isDisposed()) {
						chart.resize();
					}
				});
				resizeObserver.observe(chartContainer);

				// Trigger initial resize after DOM settles
				requestAnimationFrame(() => {
					if (chart && !chart.isDisposed()) {
						chart.resize();
					}
				});

				isReady = true;
			} catch (error) {
				console.error('Failed to initialize WordCloud:', error);
			}
		})();

		return () => {
			mounted = false;
			isReady = false;
			resizeObserver?.disconnect();
			if (chart && !chart.isDisposed()) {
				chart.dispose();
				chart = null;
			}
		};
	});

	// Update chart when options change
	$effect(() => {
		if (isReady && chart && !chart.isDisposed() && words.length > 0) {
			try {
				chart.setOption(chartOption, true);
			} catch (error) {
				console.error('Failed to update WordCloud options:', error);
			}
		}
	});
</script>

<div class="wordcloud-container scroll-reveal-scale">
	{#if words.length === 0}
		<div class="empty-state">
			<p>No word frequency data available</p>
		</div>
	{:else}
		<div bind:this={chartContainer} class="chart"></div>
	{/if}
</div>

<style>
	.wordcloud-container {
		width: 100%;
		height: 400px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
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

	@media (--md-up) {
		.wordcloud-container {
			height: 500px;
		}
	}

	@media (--sm-down) {
		.wordcloud-container {
			height: 350px;
		}
	}
</style>
