<!--
ECharts Doughnut/Pie Chart - A doughnut chart for visualizing categorical data
-->
<script lang="ts">
	import * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	// Props - keeping interface simple for doughnut chart
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		nameAccessor,
		valueAccessor,
		title = '',
		showLabels = true,
		radius = ['40%', '70%'], // Inner and outer radius for doughnut
		colors = [
			'var(--color-primary)',
			'var(--color-accent)',
			'var(--color-highlight)',
			'var(--color-success)',
			'var(--color-secondary)',
			'rgba(var(--color-primary-rgb), 0.8)',
			'rgba(var(--color-highlight-rgb), 0.8)',
			'rgba(var(--color-success-rgb), 0.8)',
			'rgba(var(--color-primary-rgb), 0.6)',
			'rgba(var(--color-highlight-rgb), 0.6)',
			'rgba(var(--color-success-rgb), 0.6)',
			'rgba(var(--color-primary-rgb), 0.4)',
			'rgba(var(--color-highlight-rgb), 0.4)',
			'rgba(var(--color-success-rgb), 0.4)'
		]
	}: {
		data?: DataItem[];
		nameAccessor: (d: DataItem) => string;
		valueAccessor: (d: DataItem) => number;
		title?: string;
		showLabels?: boolean;
		radius?: [string, string];
		colors?: string[];
	} = $props();

	// State management
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = null;
	let isMobile = $state(false);

	// Utility functions for CSS variable resolution
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '#6366f1';
		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value || '#6366f1';
	}

	function resolveColor(color: string): string {
		if (color.startsWith('var(')) {
			const varName = color.slice(4, -1).trim();
			return getCSSVariableValue(varName);
		}
		if (color.startsWith('rgba(var(')) {
			const rgbaMatch = color.match(/rgba\(var\(([^)]+)\),\s*([^)]+)\)/);
			if (rgbaMatch) {
				const rgbVarName = rgbaMatch[1];
				const opacity = rgbaMatch[2];
				const rgbValue = getCSSVariableValue(rgbVarName);
				return `rgba(${rgbValue}, ${opacity})`;
			}
		}
		return color;
	}

	// Reactive mobile detection
	$effect(() => {
		if (typeof window !== 'undefined') {
			const checkMobile = () => {
				isMobile = window.innerWidth < 768;
			};

			checkMobile();
			window.addEventListener('resize', checkMobile);

			return () => window.removeEventListener('resize', checkMobile);
		}
	});

	// Reactive color resolution
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary'),
		text: getCSSVariableValue('--color-text'),
		textLight: getCSSVariableValue('--color-text-light'),
		border: getCSSVariableValue('--color-border'),
		surface: getCSSVariableValue('--color-surface'),
		accent: getCSSVariableValue('--color-accent'),
		highlight: getCSSVariableValue('--color-highlight'),
		chartColors: colors.map((color) => resolveColor(color)),
		currentTheme: getTheme()
	});
	// Chart data transformation
	const chartData = $derived(
		data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d)
		}))
	);

	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false // Hide internal title to avoid duplication with external container title
		},
		tooltip: {
			trigger: 'item',
			backgroundColor: resolvedColors.surface,
			textStyle: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			borderRadius: 6,
			borderColor: resolvedColors.border,
			borderWidth: 1,
			extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);',
			formatter: '{a} <br/>{b}: {c} ({d}%)',
			confine: isMobile,
			position: isMobile
				? function (point: [number, number], params: any, dom: HTMLElement, rect: any, size: any) {
						const tooltipWidth = size.contentSize[0];
						const tooltipHeight = size.contentSize[1];
						const viewportWidth = size.viewSize[0];

						let x = Math.max(
							10,
							Math.min(viewportWidth - tooltipWidth - 10, point[0] - tooltipWidth / 2)
						);
						let y = point[1] - tooltipHeight - 10;

						if (y < 10) {
							y = point[1] + 20;
						}

						return [x, y];
					}
				: undefined
		},
		legend: {
			orient: 'horizontal',
			left: 'center',
			bottom: isMobile ? '10px' : '20px',
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 11 : 13,
				fontFamily: 'Inter, -apple-system, sans-serif',
				fontWeight: '500'
			},
			itemGap: isMobile ? 12 : 20,
			itemWidth: isMobile ? 12 : 14,
			itemHeight: isMobile ? 12 : 14,
			padding: [5, 10],
			backgroundColor: 'transparent'
		},
		series: [
			{
				name: title || 'Data',
				type: 'pie',
				radius: radius,
				center: ['50%', isMobile ? '40%' : '38%'],
				data: chartData,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				},
				label: {
					show: showLabels,
					position: isMobile ? 'inside' : 'outside',
					color: isMobile ? '#ffffff' : resolvedColors.text,
					fontSize: isMobile ? 11 : 12,
					fontFamily: 'Inter, -apple-system, sans-serif',
					fontWeight: 'bold',
					formatter: isMobile ? '{d}%' : '{b}: {d}%',
					textBorderColor: isMobile ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
					textBorderWidth: isMobile ? 2 : 0,
					textShadowColor: isMobile ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
					textShadowBlur: isMobile ? 3 : 0,
					minMargin: isMobile ? 8 : 5,
					padding: isMobile ? [2, 4] : [0, 0]
				},
				labelLine: {
					show: showLabels && !isMobile,
					length: 15,
					length2: 10,
					lineStyle: {
						color: resolvedColors.textLight,
						width: 1
					}
				},
				itemStyle: {
					borderRadius: 6,
					borderColor: resolvedColors.surface,
					borderWidth: 2
				},
				labelLayout: isMobile
					? {
							hideOverlap: true,
							moveOverlap: 'shiftY'
						}
					: undefined,
				animationType: 'scale',
				animationEasing: 'elasticOut' as any,
				animationDelay: function (_: number) {
					return Math.random() * 200;
				}
			}
		],
		color: resolvedColors.chartColors,
		backgroundColor: 'transparent'
	});

	// Chart lifecycle management
	$effect(() => {
		// Initialize chart only when container is available and chart doesn't exist
		if (chartContainer && !chart) {
			try {
				chart = echarts.init(chartContainer);
			} catch (error) {
				console.error('Failed to initialize ECharts:', error);
				return;
			}
		}

		// Update chart options whenever they change
		if (chart && chartData.length > 0) {
			try {
				chart.setOption(chartOption, true); // true = notMerge for clean update
			} catch (error) {
				console.error('Failed to set chart options:', error);
			}
		}
	});

	// Resize handling
	$effect(() => {
		if (!chartContainer || !chart) return;

		let resizeObserver: ResizeObserver | undefined;

		try {
			resizeObserver = new ResizeObserver(() => {
				if (chart && !chart.isDisposed()) {
					chart.resize();
				}
			});
			resizeObserver.observe(chartContainer);
		} catch (error) {
			console.error('Failed to setup resize observer:', error);
		}

		return () => {
			resizeObserver?.disconnect();
		};
	});

	// Cleanup on component destroy
	$effect(() => {
		return () => {
			if (chart && !chart.isDisposed()) {
				chart.dispose();
				chart = null;
			}
		};
	});
</script>

<div
	class="echarts-container"
	use:scrollAnimate={{
		delay: 350,
		animationClass: 'scale-in-center',
		rootMargin: '100px',
		threshold: 0.1
	}}
>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 480px; /* Increased height to accommodate legend */
		display: block;
		position: relative;
		/* Remove background, border, and styling - let parent handle it */
		font-family: var(--font-family-sans);
		/* Initial state for scroll animation */
		opacity: 0;
		transform: scale(0.8) translateY(20px);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.chart {
		width: 100%;
		height: 100%;
	}
	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.echarts-container {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.echarts-container {
			height: 420px; /* Increased height for mobile with legend space */
		}
	}

	@media (max-width: 480px) {
		.echarts-container {
			height: 400px; /* Adequate height for very small screens with legend */
		}
	}
</style>
