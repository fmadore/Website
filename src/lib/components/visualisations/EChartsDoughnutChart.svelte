<!--
ECharts Doughnut/Pie Chart - A doughnut chart for visualizing categorical data
-->
<script lang="ts">	import * as echarts from 'echarts';
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
	// Resolve colors from CSS variables - now reactive to theme changes
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary'),
		text: getCSSVariableValue('--color-text'),
		textLight: getCSSVariableValue('--color-text-light'),
		border: getCSSVariableValue('--color-border'),
		surface: getCSSVariableValue('--color-surface'),
		accent: getCSSVariableValue('--color-accent'),
				highlight: getCSSVariableValue('--color-highlight'),
		// Resolve chart colors
		chartColors: colors.map(color => resolveColor(color)),
		// Include theme to make this reactive to theme changes
		currentTheme: getTheme()
	});
	// Convert data to ECharts format
	const chartData = $derived(
		data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d)
		}))
	);

	// Chart options
	const option = $derived({
		title: {
			show: false // Hide internal title to avoid duplication with external container title
		},		tooltip: {
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
			// Constrain tooltip position on mobile to prevent out-of-bounds
			confine: isMobile,
			position: isMobile ? function (point: [number, number], params: any, dom: HTMLElement, rect: any, size: any) {
				// Calculate tooltip position to keep it within viewport
				const tooltipWidth = size.contentSize[0];
				const tooltipHeight = size.contentSize[1];
				const viewportWidth = size.viewSize[0];
				const viewportHeight = size.viewSize[1];
				
				let x = point[0];
				let y = point[1];
				
				// Ensure tooltip doesn't go off the right edge
				if (x + tooltipWidth > viewportWidth) {
					x = viewportWidth - tooltipWidth - 10;
				}
				
				// Ensure tooltip doesn't go off the left edge
				if (x < 10) {
					x = 10;
				}
				
				// Ensure tooltip doesn't go off the bottom edge
				if (y + tooltipHeight > viewportHeight) {
					y = viewportHeight - tooltipHeight - 10;
				}
				
				// Ensure tooltip doesn't go off the top edge
				if (y < 10) {
					y = 10;
				}
				
				return [x, y];
			} : undefined
		},		legend: {
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
				center: ['50%', isMobile ? '40%' : '38%'], // Adjust center to provide more space for legend
				data: chartData,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				},				label: {
					show: showLabels, // Always show labels when showLabels is true
					position: isMobile ? 'inside' : 'outside', // Use inside position on mobile
					color: isMobile ? '#ffffff' : resolvedColors.text, // White text on mobile for better contrast
					fontSize: isMobile ? 11 : 12,
					fontFamily: 'Inter, -apple-system, sans-serif',
					fontWeight: 'bold',
					formatter: isMobile ? '{d}%' : '{b}: {d}%', // Shorter format on mobile
					textBorderColor: isMobile ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
					textBorderWidth: isMobile ? 2 : 0,
					textShadowColor: isMobile ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
					textShadowBlur: isMobile ? 3 : 0,
					textShadowOffsetX: isMobile ? 1 : 0,
					textShadowOffsetY: isMobile ? 1 : 0,
					// Prevent label overlap on mobile
					minMargin: isMobile ? 8 : 5,
					// Ensure labels don't overlap by adjusting their positioning
					alignTo: isMobile ? 'none' : 'edge',
					// Add padding to prevent text from being too close to edges
					padding: isMobile ? [2, 4] : [0, 0]
				},
				labelLine: {
					show: showLabels && !isMobile, // Only show label lines on desktop
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
				// Prevent label overlap on mobile by adjusting label layout
				labelLayout: isMobile ? {
					hideOverlap: true,
					moveOverlap: 'shiftY'
				} : undefined,
				animationType: 'scale',
				animationEasing: 'elasticOut' as any,
				animationDelay: function (idx: number) {
					return Math.random() * 200;
				}
			}
		],
		color: resolvedColors.chartColors,
		backgroundColor: 'transparent' // Let the container handle background
	});	// Initialize chart and handle updates
	$effect(() => {
		// Initialize chart if container is available and chart doesn't exist
		if (!chart && chartContainer) {
			chart = echarts.init(chartContainer);
		}

		// Update chart options whenever they change (including theme changes)
		if (chart) {
			chart.setOption(option, true); // true = notMerge for clean update
		}
	});

	// Setup resize observer and cleanup
	$effect(() => {
		let resizeObserver: ResizeObserver | undefined;

		if (chartContainer && chart) {
			// Handle resize
			resizeObserver = new ResizeObserver(() => {
				chart?.resize();
			});
			resizeObserver.observe(chartContainer);
		}

		// Cleanup function
		return () => {
			resizeObserver?.disconnect();
			chart?.dispose();
		};
	});
</script>

<div class="echarts-container" use:scrollAnimate={{ delay: 350, animationClass: 'scale-in-center', rootMargin: '100px', threshold: 0.1 }}>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>	.echarts-container {
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
