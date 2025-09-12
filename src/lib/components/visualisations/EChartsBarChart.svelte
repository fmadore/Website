<!--
ECharts Bar Chart - A much simpler alternative to the custom D3 implementation
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
		barColor = 'var(--color-primary)'
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => string | number;
		yAccessor: (d: DataItem) => number;
		xAxisLabel?: string;
		yAxisLabel?: string;
		barColor?: string;
	} = $props();

	// State management
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = null;
	
	// Detect mobile screen size
	let isMobile = $state(false);
	
	// Utility functions for CSS variable resolution
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '#6366f1'; // Default fallback for SSR
		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value || '#6366f1'; // Fallback to a default blue if variable not found
	}

	function resolveColor(color: string): string {
		if (color.startsWith('var(')) {
			// Extract variable name from var(--variable-name)
			const varName = color.slice(4, -1).trim();
			return getCSSVariableValue(varName);
		}
		return color; // Return as-is if not a CSS variable
	}

	// Reactive mobile detection
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

	// Reactive color resolution - updates when theme changes
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

	// Chart data transformation
	const chartData = $derived(
		data.map((d) => ({
			name: String(xAccessor(d)),
			value: yAccessor(d)
		}))
	);
	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false // We'll handle titles externally if needed
		},
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
			left: isMobile ? 32 : 64,
			right: 24,
			top: 24,
			bottom: xAxisLabel ? 80 : 48,
			containLabel: false
		},
		xAxis: {
			type: 'category',
			data: chartData.map((d) => d.name),
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
				fontSize: isMobile ? 10 : 12,
				fontFamily: 'Inter, -apple-system, sans-serif',
				interval: isMobile ? 'auto' : 0 // Auto interval on mobile to prevent overlapping
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
				color: resolvedColors.text,
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
		series: [
			{
				name: yAxisLabel || 'Value',
				type: 'bar',
				data: chartData.map((d) => d.value),
				itemStyle: {
					color: resolvedColors.barColor,
					borderRadius: [4, 4, 0, 0]
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
		backgroundColor: 'transparent' // Let the container handle background
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

<div class="echarts-container" use:scrollAnimate={{ delay: 200, animationClass: 'scale-in', rootMargin: '100px', threshold: 0.1 }}>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 350px;
		display: block;
		position: relative;
		/* Remove background, border, and styling - let parent handle it */
		font-family: var(--font-family-sans);
		/* Initial state for scroll animation */
		opacity: 0;
		transform: scale(0.9);
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
