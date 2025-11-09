<!--
D3 Bubble Chart - A bubble chart for visualizing keyword frequency
Uses D3.js circle packing for a balanced, overlap-free layout
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
		minBubbleSize = 15,
		maxBubbleSize = 60
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
	type PackedHierarchyNode = {
		name: string;
		value: number;
		radius: number;
		packingValue: number;
		children?: PackedHierarchyNode[];
	};

	// Chart data transformation
	const chartData: PackedHierarchyNode[] = $derived.by(() => {
		if (data.length === 0) return [];

		const maxValue = d3.max(data, (d) => valueAccessor(d)) || 1;
		const sizeScale = d3
			.scaleSqrt()
			.domain([0, maxValue])
			.range([minBubbleSize, isMobile ? maxBubbleSize * 0.6 : maxBubbleSize]);

		return data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d),
			radius: sizeScale(valueAccessor(d)),
			packingValue: Math.pow(sizeScale(valueAccessor(d)), 2)
		}));
	});

	// Responsive sizing
	const dimensions = $derived({
		width: isMobile ? Math.min(350, (windowInnerWidth.current ?? 350) - 32) : 1000,
		height: isMobile ? 500 : 800,
		padding: 12
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
			.style('width', '100%')
			.style('height', '100%')
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

		// Compute packed layout to guarantee no overlaps and clean alignment
		const rootNode: PackedHierarchyNode = {
			name: 'root',
			value: 0,
			radius: 0,
			packingValue: 0,
			children: chartData
		};

		const packedNodes = d3
			.pack<PackedHierarchyNode>()
			.size([width - padding * 2, height - padding * 2])
			.padding(padding)
			(
				d3
					.hierarchy(rootNode)
					.sum((d) => d.packingValue)
					.sort((a, b) => (b.data.value || 0) - (a.data.value || 0))
			 )
			.leaves();

		const bubbleGroups = svg
			.selectAll<SVGGElement, d3.HierarchyCircularNode<PackedHierarchyNode>>('.bubble')
			.data(packedNodes)
			.enter()
			.append('g')
			.attr('class', 'bubble')
			.attr('transform', (d) => `translate(${d.x + padding},${d.y + padding})`)
			.style('cursor', 'pointer');

		bubbleGroups
			.append('circle')
			.attr('r', (d) => d.r)
			.attr('fill', (d) => colorScale(d.data.name))
			.attr('stroke', `rgba(var(--color-surface-rgb), 0.35)`)
			.attr('stroke-width', 1.25)
			.style('opacity', 0.9)
			.style('filter', 'drop-shadow(0 12px 18px rgba(17, 24, 39, 0.12))')
			.on('mouseenter', function (event, d) {
				d3.select(this)
					.transition()
					.duration(200)
					.style('opacity', 1)
					.attr('stroke-width', 2);

				tooltip
					.style('visibility', 'visible')
					.html(`<strong>${d.data.name}</strong><br/>Count: ${d.data.value}`);
			})
			.on('mousemove', function (event) {
				const containerRect = chartContainer.getBoundingClientRect();
				tooltip
					.style('top', `${event.clientY - containerRect.top - 60}px`)
					.style('left', `${event.clientX - containerRect.left - 50}px`);
			})
			.on('mouseleave', function () {
				d3.select(this)
					.transition()
					.duration(200)
					.style('opacity', 0.9)
					.attr('stroke-width', 1.25);

				tooltip.style('visibility', 'hidden');
			});

		bubbleGroups
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.style('fill', resolvedColors.text)
			.style('font-size', (d) => `${Math.max(10, Math.min(16, d.r / 3.2))}px`)
			.style('font-weight', '600')
			.style('font-family', 'Inter, -apple-system, sans-serif')
			.style('pointer-events', 'none')
			.style('user-select', 'none')
			.each(function (d) {
				if (d.r < 24) return;

				const label = d.data.name.length > 14 ? `${d.data.name.slice(0, 12)}…` : d.data.name;
				d3.select(this).text(label);
			});
	}

	// Lifecycle management
	onMount(() => {
		createChart();
	});

	// Reactive updates when data or dimensions change
	$effect(() => {
		// Track dependencies
		const _ = [chartData, dimensions, resolvedColors, windowInnerWidth.current];

		if (chartContainer) {
			if (chartData.length > 0) {
				createChart();
			} else {
				d3.select(chartContainer).selectAll('*').remove();
				svg = null;
			}
		}
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
		padding: var(--spacing-6);
		border-radius: var(--border-radius-2xl);
		border: 1px solid rgba(var(--color-surface-rgb), 0.25);
		background:
			linear-gradient(
				135deg,
				rgba(var(--color-primary-rgb), 0.06),
				rgba(var(--color-highlight-rgb), 0.04)
			);
		backdrop-filter: blur(22px);
		-webkit-backdrop-filter: blur(22px);
		box-shadow: 0 24px 60px rgba(17, 25, 40, 0.18);
	}

	.bubble-chart :global(svg) {
		display: block;
		margin: 0 auto;
		border-radius: var(--border-radius-xl);
		isolation: isolate;
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

		.bubble-chart {
			padding: var(--spacing-4);
		}
	}

	@media (max-width: 640px) {
		.bubble-chart-container {
			min-height: 320px;
		}

		.bubble-chart {
			padding: var(--spacing-3);
		}
	}
</style>
