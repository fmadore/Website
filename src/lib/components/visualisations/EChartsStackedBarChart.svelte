<!--
ECharts Stacked Bar Chart component
-->
<script lang="ts">
	import * as echarts from 'echarts'; // Props - keeping the same interface as your D3 component for easy replacement
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		keys = [] as string[],
		xAxisLabel = '',
		yAxisLabel = '',
		colors = [
			'var(--color-primary)',
			'var(--color-success)',
			'var(--color-highlight)',
			'var(--color-accent)',
			'#8B5CF6',
			'#06B6D4',
			'#84CC16',
			'#F97316',
			'#EC4899',
			'#6366F1'
		]
	}: {
		data?: DataItem[];
		keys?: string[];
		xAxisLabel?: string;
		yAxisLabel?: string;
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
		return color; // Return as-is if not a CSS variable
	}

	// Resolve colors from CSS variables
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary'),
		text: getCSSVariableValue('--color-text'),
		textLight: getCSSVariableValue('--color-text-light'),
		border: getCSSVariableValue('--color-border'),
		surface: getCSSVariableValue('--color-surface'),
		resolvedSeriesColors: colors.map((color) => resolveColor(color))
	});

	// Theme detection
	let isDark = $state(false);

	function updateTheme() {
		isDark = document.documentElement.classList.contains('dark');
	} // Convert data to ECharts format
	const chartCategories = $derived(
		data.map((d) => String((d as any).year || (d as any).name || (d as any).x))
	);
	const seriesData = $derived(
		keys.map((key, index) => ({
			name: key,
			type: 'bar',
			stack: 'total',
			data: data.map((d) => (d as any)[key] || 0),
			itemStyle: {
				color:
					resolvedColors.resolvedSeriesColors[index % resolvedColors.resolvedSeriesColors.length],
				borderRadius: [4, 4, 0, 0]
			},
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: resolvedColors.primary
				}
			}
		}))
	); // Chart options
	const option = $derived({
		tooltip: {
			trigger: 'axis',
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
			axisPointer: {
				type: 'shadow'
			}
		},
		legend: {
			orient: 'horizontal',
			left: 'center',
			top: 'top',
			textStyle: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: 'Inter, -apple-system, sans-serif'
			}
		},
		grid: {
			left: 64,
			right: 24,
			top: 64,
			bottom: xAxisLabel ? 80 : 48,
			containLabel: false
		},
		xAxis: {
			type: 'category',
			data: chartCategories,
			name: xAxisLabel,
			nameLocation: 'middle',
			nameGap: 30,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			axisLabel: {
				color: resolvedColors.textLight,
				fontSize: 12,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			axisLine: {
				lineStyle: {
					color: resolvedColors.border
				}
			},
			axisTick: {
				lineStyle: {
					color: resolvedColors.border
				}
			}
		},
		yAxis: {
			type: 'value',
			name: yAxisLabel,
			nameLocation: 'middle',
			nameGap: 45,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			axisLabel: {
				color: resolvedColors.textLight,
				fontSize: 12,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			axisLine: {
				lineStyle: {
					color: resolvedColors.border
				}
			},
			axisTick: {
				lineStyle: {
					color: resolvedColors.border
				}
			},
			splitLine: {
				lineStyle: {
					color: resolvedColors.border,
					opacity: 0.5
				}
			}
		},
		series: seriesData,
		backgroundColor: 'transparent',
		animationDuration: 1000,
		animationEasing: 'elasticOut' as any
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

<style>
	.echarts-container {
		width: 100%;
		height: 100%;
		display: block;
		position: relative;
		/* Remove background, border, and styling - let parent handle it */
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
		height: 100%;
	}
</style>
