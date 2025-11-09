<!--
D3 Bubble Chart - A bubble chart for visualizing keyword frequency
Uses D3.js force simulation for organic, physics-based bubble layout
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { innerWidth as windowInnerWidth } from 'svelte/reactivity/window';

	// Props
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		nameAccessor,
		valueAccessor,
		colors = [
			'var(--color-primary)',
			'var(--color-accent)',
			'var(--color-highlight)',
			'var(--color-success)',
			'var(--color-secondary)',
			'rgba(var(--color-primary-rgb), 0.8)',
			'rgba(var(--color-accent-rgb), 0.8)',
			'rgba(var(--color-highlight-rgb), 0.8)',
			'rgba(var(--color-success-rgb), 0.7)',
			'rgba(var(--color-primary-rgb), 0.6)'
		],
		minBubbleSize = 20,
		maxBubbleSize = 80
	}: {
		data?: DataItem[];
		nameAccessor: (d: DataItem) => string;
		valueAccessor: (d: DataItem) => number;
		colors?: string[];
		minBubbleSize?: number;
		maxBubbleSize?: number;
	} = $props();

	// State management
	let chartContainer: HTMLDivElement;
	let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
	let simulation: d3.Simulation<SimulationNode, undefined> | null = null;

	// Reactive values
	const isMobile = $derived((windowInnerWidth.current ?? 1024) < 768);

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

	// Reactive color resolution
	const resolvedColors = $derived({
		text: getCSSVariableValue('--color-text'),
		border: getCSSVariableValue('--color-border'),
		surface: getCSSVariableValue('--color-surface'),
		chartColors: colors.map((color) => resolveColor(color)),
		currentTheme: getTheme()
	});

	// Type for simulation nodes
	type SimulationNode = {
		name: string;
		value: number;
		radius: number;
		x: number;
		y: number;
		vx?: number;
		vy?: number;
	};

	// Chart data transformation
	const chartData: SimulationNode[] = $derived.by(() => {
		if (data.length === 0) return [];

		const maxValue = d3.max(data, (d) => valueAccessor(d)) || 1;
		const sizeScale = d3
			.scaleSqrt()
			.domain([0, maxValue])
			.range([minBubbleSize, isMobile ? maxBubbleSize * 0.7 : maxBubbleSize]);

		return data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d),
			radius: sizeScale(valueAccessor(d)),
			x: 0,
			y: 0
		}));
	});

	// Responsive sizing
	const dimensions = $derived({
		width: isMobile ? Math.min(350, (windowInnerWidth.current ?? 350) - 32) : 800,
		height: isMobile ? 400 : 500,
		padding: 4
	});

	// Create/update chart
	function createChart() {
		if (!chartContainer || chartData.length === 0) return;

		// Clear previous chart
		d3.select(chartContainer).selectAll('*').remove();

		const { width, height, padding } = dimensions;

		// Create SVG
		svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('role', 'img')
			.attr('aria-label', 'Keyword frequency bubble chart visualization');

		// Color scale
		const colorScale = d3
			.scaleOrdinal<string>()
			.domain(chartData.map((d) => d.name))
			.range(resolvedColors.chartColors);

		// Create tooltip
		const tooltip = d3
			.select(chartContainer)
			.append('div')
			.attr('class', 'bubble-tooltip')
			.style('position', 'absolute')
			.style('visibility', 'hidden')
			.style('background-color', resolvedColors.surface)
			.style('color', resolvedColors.text)
			.style('border', `1px solid ${resolvedColors.border}`)
			.style('border-radius', '6px')
			.style('padding', '8px 12px')
			.style('font-size', '13px')
			.style('font-family', 'Inter, -apple-system, sans-serif')
			.style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
			.style('pointer-events', 'none')
			.style('z-index', '1000')
			.style('white-space', 'nowrap');

		// Create bubble groups
		const bubbleGroups = svg
			.selectAll<SVGGElement, SimulationNode>('.bubble')
			.data(chartData)
			.enter()
			.append('g')
			.attr('class', 'bubble')
			.style('cursor', 'pointer');

		// Add circles
		bubbleGroups
			.append('circle')
			.attr('r', (d) => d.radius)
			.attr('fill', (d) => colorScale(d.name))
			.attr('stroke', resolvedColors.border)
			.attr('stroke-width', 1.5)
			.style('opacity', 0.85)
			.on('mouseenter', function (event, d) {
				d3.select(this).transition().duration(200).style('opacity', 1).attr('stroke-width', 2.5);

				tooltip.style('visibility', 'visible').html(`<strong>${d.name}</strong><br/>Count: ${d.value}`);
			})
			.on('mousemove', function (event) {
				const containerRect = chartContainer.getBoundingClientRect();
				tooltip
					.style('top', `${event.clientY - containerRect.top - 60}px`)
					.style('left', `${event.clientX - containerRect.left - 50}px`);
			})
			.on('mouseleave', function () {
				d3.select(this).transition().duration(200).style('opacity', 0.85).attr('stroke-width', 1.5);

				tooltip.style('visibility', 'hidden');
			});

		// Add text labels (only for larger bubbles)
		bubbleGroups
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.style('fill', resolvedColors.text)
			.style('font-size', (d) => `${Math.max(10, Math.min(14, d.radius / 3))}px`)
			.style('font-weight', '600')
			.style('font-family', 'Inter, -apple-system, sans-serif')
			.style('pointer-events', 'none')
			.style('user-select', 'none')
			.each(function (d) {
				// Only show label if bubble is large enough
				if (d.radius < 25) return;

				const text = d.name.length > 12 ? d.name.substring(0, 10) + '...' : d.name;
				d3.select(this).text(text);
			});

		// Create force simulation
		simulation = d3
			.forceSimulation(chartData)
			.force(
				'charge',
				d3.forceManyBody<SimulationNode>().strength((d) => -Math.pow(d.radius, 2) * 0.02)
			)
			.force('center', d3.forceCenter<SimulationNode>(width / 2, height / 2))
			.force(
				'collision',
				d3
					.forceCollide<SimulationNode>()
					.radius((d) => d.radius + padding)
					.strength(0.9)
			)
			.force('x', d3.forceX<SimulationNode>(width / 2).strength(0.03))
			.force('y', d3.forceY<SimulationNode>(height / 2).strength(0.03))
			.on('tick', () => {
				bubbleGroups.attr('transform', (d) => {
					// Keep bubbles within bounds
					d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
					d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
					return `translate(${d.x},${d.y})`;
				});
			});
	}

	// Lifecycle management
	onMount(() => {
		createChart();

		return () => {
			if (simulation) {
				simulation.stop();
			}
		};
	});

	// Reactive updates when data or dimensions change
	$effect(() => {
		// Track dependencies
		const _ = [chartData, dimensions, resolvedColors];

		if (chartContainer && chartData.length > 0) {
			createChart();
		}

		return () => {
			if (simulation) {
				simulation.stop();
			}
		};
	});
</script>

<div class="bubble-chart-container">
	<div bind:this={chartContainer} class="bubble-chart" role="region" aria-label="Keyword frequency bubble chart"></div>
	{#if chartData.length === 0}
		<div class="no-data-message">
			<p>No data available to display</p>
		</div>
	{/if}
</div>

<style>
	.bubble-chart-container {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.bubble-chart {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: visible;
	}

	.bubble-chart :global(svg) {
		display: block;
		margin: 0 auto;
	}

	.no-data-message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.bubble-chart :global(.bubble circle) {
			transition: none !important;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.bubble-chart-container {
			min-height: 400px;
		}
	}
</style>
