<!--
ECharts Horizontal Bar Chart component
-->
<script lang="ts">
	import * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	
	// Props - keeping the same interface as your D3 component for easy replacement
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		xAccessor,
		yAccessor,
		xAxisLabel = '',
		yAxisLabel = '',
		barColor = 'var(--color-primary)',
		maxValue
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => number;
		yAccessor: (d: DataItem) => string;
		xAxisLabel?: string;
		yAxisLabel?: string;
		barColor?: string;
		maxValue?: number;
	} = $props();
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	// Detect mobile screen size
	let isMobile = $state(false);
	
	$effect(() => {
		if (typeof window !== 'undefined') {
			const checkMobile = () => {
				isMobile = window.innerWidth < 768; // Mobile breakpoint
			};
			
			checkMobile();
			window.addEventListener('resize', checkMobile);
			
			return () => window.removeEventListener('resize', checkMobile);
		}
	});

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

	// Resolve colors from CSS variables - now reactive to theme changes
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary'),
		text: getCSSVariableValue('--color-text'),
		textLight: getCSSVariableValue('--color-text-light'),
		border: getCSSVariableValue('--color-border'),
				surface: getCSSVariableValue('--color-surface'),
		primaryDark: getCSSVariableValue('--color-primary-dark') || '#4f46e5',
		barColor: resolveColor(barColor),
		// Include theme to make this reactive to theme changes
		currentTheme: getTheme()
	});

	// Convert data to ECharts format - reverse order so highest values appear at top
	const chartData = $derived(
		data.map((d) => ({
			name: String(yAccessor(d)),
			value: xAccessor(d)
		})).reverse() // Reverse the order so highest values appear at top
	);
	// Chart options
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
			extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);'
		},
		grid: {
			left: isMobile ? '120px' : '150px', // Less space for author names on mobile
			right: 24,
			top: 24,
			bottom: xAxisLabel ? 80 : 48,
			containLabel: false
		},
		xAxis: {
			type: 'value',
			name: xAxisLabel,
			nameLocation: 'middle',
			nameGap: 30,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			axisLabel: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: 'Inter, -apple-system, sans-serif',
				// Ensure only whole numbers are shown for citation counts
				formatter: function (value: number) {
					return Number.isInteger(value) ? value.toString() : '';
				}
			},
			// Force integer intervals for citation counts
			interval: 1,
			minInterval: 1,
			// Set consistent max value if provided for pagination consistency
			max: maxValue,
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
		yAxis: {
			type: 'category',
			data: chartData.map((d) => d.name),
			name: yAxisLabel,
			nameLocation: 'middle',
			nameGap: 120,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			axisLabel: {
				color: resolvedColors.text,
				fontSize: isMobile ? 10 : 12,
				fontFamily: 'Inter, -apple-system, sans-serif',
				width: isMobile ? 100 : 130,
				overflow: 'truncate'
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
		series: [
			{
				name: xAxisLabel || 'Value',
				type: 'bar',
				data: chartData.map((d) => d.value),
				itemStyle: {
					color: resolvedColors.barColor,
					borderRadius: [0, 4, 4, 0]
				},
				emphasis: {
					itemStyle: {
						color: resolvedColors.primaryDark,
						shadowColor: resolvedColors.primary,
						shadowBlur: 10
					}
				},
				animationDuration: 1000,
				animationEasing: 'elasticOut' as any
			}
		],
		backgroundColor: 'transparent'
	});

	$effect(() => {
		// Initialize chart if container is available
		if (!chart && chartContainer) {
			chart = echarts.init(chartContainer);
		}

		// Set/update chart options whenever they change
		if (chart) {
			chart.setOption(option, true); // true = notMerge for clean update
		}
	});

	// Handle resize
	$effect(() => {
		let resizeObserver: ResizeObserver | undefined;

		if (chartContainer && chart) {
			resizeObserver = new ResizeObserver(() => {
				chart?.resize();
			});
			resizeObserver.observe(chartContainer);
		}

		// Cleanup function
		return () => {
			resizeObserver?.disconnect();
		};
	});

	// Cleanup chart on component destroy
	$effect(() => {
		return () => {
			chart?.dispose();
		};
	});
</script>

<div class="echarts-container" use:scrollAnimate={{ delay: 300, animationClass: 'slide-in-left', rootMargin: '100px', threshold: 0.1 }}>
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
		/* Initial state for scroll animation */
		opacity: 0;
		transform: translateX(-30px);
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
</style>
