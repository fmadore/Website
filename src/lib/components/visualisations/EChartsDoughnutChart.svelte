<!--
ECharts Doughnut/Pie Chart - A doughnut chart for visualizing categorical data
-->
<script lang="ts">
	import * as echarts from 'echarts';
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

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	// Function to resolve CSS variables to actual color values
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '#6366f1'; // Default fallback for SSR

		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value || '#6366f1'; // Fallback to a default blue if variable not found
	}
	// Function to resolve any color value (CSS variable or direct color)
	function resolveColor(color: string): string {
		if (color.startsWith('var(')) {
			// Extract variable name from var(--variable-name)
			const varName = color.slice(4, -1).trim();
			return getCSSVariableValue(varName);
		}
		if (color.startsWith('rgba(var(')) {
			// Handle rgba(var(--variable-rgb), opacity) format
			const rgbaMatch = color.match(/rgba\(var\(([^)]+)\),\s*([^)]+)\)/);
			if (rgbaMatch) {
				const rgbVarName = rgbaMatch[1];
				const opacity = rgbaMatch[2];
				const rgbValue = getCSSVariableValue(rgbVarName);
				return `rgba(${rgbValue}, ${opacity})`;
			}
		}
		return color; // Return as-is if not a CSS variable
	}

	// Resolve colors from CSS variables
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary'),
		text: getCSSVariableValue('--color-text'),
		textLight: getCSSVariableValue('--color-text-light'),
		border: getCSSVariableValue('--color-border'),
		surface: getCSSVariableValue('--color-surface'),
		accent: getCSSVariableValue('--color-accent'),
		highlight: getCSSVariableValue('--color-highlight'),
		// Resolve chart colors
		chartColors: colors.map(color => resolveColor(color))
	});

	// Convert data to ECharts format
	const chartData = $derived(
		data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d)
		}))
	);

	// Theme detection
	let isDark = $state(false);

	function updateTheme() {
		if (typeof window !== 'undefined') {
			isDark = document.documentElement.classList.contains('dark');
		}
	}
	// Chart options
	const option = $derived({
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
			formatter: '{a} <br/>{b}: {c} ({d}%)'
		},		legend: {
			orient: 'horizontal',
			left: 'center',
			bottom: '10px',
			textStyle: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			itemGap: 12,
			itemWidth: 12,
			itemHeight: 12
		},
		series: [
			{
				name: title || 'Data',
				type: 'pie',
				radius: radius,
				center: ['50%', '45%'], // Center the chart more appropriately with bottom legend
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
					position: 'outside',
					color: resolvedColors.text,
					fontSize: 11,
					fontFamily: 'Inter, -apple-system, sans-serif',
					formatter: '{b}: {d}%'
				},
				labelLine: {
					show: showLabels,
					length: 15,
					length2: 10,
					lineStyle: {
						color: resolvedColors.textLight
					}
				},
				itemStyle: {
					borderRadius: 6,
					borderColor: resolvedColors.surface,
					borderWidth: 2
				},
				animationType: 'scale',
				animationEasing: 'elasticOut' as any,
				animationDelay: function (idx: number) {
					return Math.random() * 200;
				}
			}
		],
		color: resolvedColors.chartColors,
		backgroundColor: 'transparent' // Let the container handle background
	});

	$effect(() => {
		// Initialize theme detection
		updateTheme();

		// Initialize chart if container is available
		if (!chart && chartContainer) {
			chart = echarts.init(chartContainer);
		}

		// Set/update chart options
		if (chart) {
			chart.setOption(option, true); // true = notMerge for clean update
		}

		// Setup observers only once
		let resizeObserver: ResizeObserver | undefined;
		let themeObserver: MutationObserver | undefined;

		if (chartContainer && !resizeObserver) {
			// Handle resize
			resizeObserver = new ResizeObserver(() => {
				chart?.resize();
			});
			resizeObserver.observe(chartContainer);

			// Theme change observer
			themeObserver = new MutationObserver(() => {
				updateTheme();
			});
			themeObserver.observe(document.documentElement, { attributes: true });
		}

		// Cleanup function
		return () => {
			resizeObserver?.disconnect();
			themeObserver?.disconnect();
			chart?.dispose();
		};
	});
</script>

<div class="echarts-container">
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>	.echarts-container {
		width: 100%;
		height: 400px;
		display: block;
		position: relative;
		/* Remove background, border, and styling - let parent handle it */
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
		height: 100%;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.echarts-container {
			height: 350px;
		}
	}
</style>
