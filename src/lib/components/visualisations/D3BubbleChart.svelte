<!--
D3 Bubble Chart - A bubble chart for visualizing keyword frequency
Uses D3.js circle packing for a balanced, overlap-free layout
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type * as d3Type from 'd3';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { innerWidth as windowInnerWidth } from 'svelte/reactivity/window';

	// D3 library loaded dynamically to reduce initial bundle size
	let d3: typeof d3Type | null = $state(null);
	let isD3Loaded = $state(false);

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
			'color-mix(in srgb, var(--color-primary) 80%, transparent)',
			'color-mix(in srgb, var(--color-accent) 80%, transparent)',
			'color-mix(in srgb, var(--color-highlight) 80%, transparent)',
			'color-mix(in srgb, var(--color-success) 70%, transparent)',
			'color-mix(in srgb, var(--color-primary) 60%, transparent)'
		],
		minBubbleSize = 22,
		maxBubbleSize = 75
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
	let svg: d3Type.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
	let zoomBehavior: d3Type.ZoomBehavior<SVGSVGElement, unknown> | null = null;
	let containerWidth = $state(1000);
	let containerHeight = $state(800);

	// Reactive values
	const isMobile = $derived((windowInnerWidth.current ?? 1024) < 768);

	// Utility functions for CSS variable resolution
	// Fallbacks match design system v2.0 values from variables.css
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '#9a4419';
		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value || '#9a4419';
	}

	function getCSSPx(variableName: string, fallbackPx: number): number {
		if (typeof window === 'undefined') return fallbackPx;
		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		const match = value.match(/^([\d.]+)px$/);
		return match ? Number(match[1]) : fallbackPx;
	}

	function prefersReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
		surfaceRgb: getCSSVariableValue('--color-surface-rgb'),
		chartColors: colors.map((color) => resolveColor(color)),
		currentTheme: getTheme()
	});

	// Type for simulation nodes
	type BubbleNode = d3Type.SimulationNodeDatum & {
		name: string;
		value: number;
		radius: number;
		x?: number;
		y?: number;
	};

	// Chart data transformation
	const chartData: BubbleNode[] = $derived.by(() => {
		if (data.length === 0 || !d3) return [];

		const maxValue = d3.max(data, (d) => valueAccessor(d)) || 1;

		// Adjust bubble size based on container size to ensure they fill space nicely
		const minDim = Math.min(containerWidth, containerHeight);
		// Reduced scale factor to prevent overcrowding
		const scaleFactor = Math.max(0.6, Math.min(1.1, minDim / 800));

		const sizeScale = d3
			.scaleSqrt()
			.domain([0, maxValue])
			.range([
				minBubbleSize * scaleFactor,
				(isMobile ? maxBubbleSize * 0.8 : maxBubbleSize) * scaleFactor
			]);

		return data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d),
			radius: sizeScale(valueAccessor(d))
		}));
	});

	// Create/update chart
	function createChart() {
		if (!chartContainer || chartData.length === 0 || !d3) return;

		// Clear previous chart
		d3.select(chartContainer).selectAll('*').remove();

		const width = containerWidth;
		const height = containerHeight;

		// Create SVG
		svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.style('width', '100%')
			.style('height', '100%')
			.style('display', 'block')
			.attr('role', 'img')
			.attr('aria-label', 'Keyword frequency bubble chart visualization');

		// Dedicated layer for zoomable content (recommended D3 zoom pattern)
		const zoomLayer = svg.append('g').attr('class', 'zoom-layer');

		// Add zoom behavior
		zoomBehavior = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 5])
			.on('zoom', (event) => {
				zoomLayer.attr('transform', event.transform.toString());
			});

		svg.call(zoomBehavior as any);

		// Color scale
		const colorScale = d3
			.scaleOrdinal<string>()
			.domain(chartData.map((d) => d.name))
			.range(resolvedColors.chartColors);

		// Create tooltip (styling lives in CSS so we can use global tokens)
		const tooltip = d3
			.select(chartContainer)
			.append('div')
			.attr('class', 'bubble-tooltip')
			.attr('role', 'tooltip')
			.attr('aria-hidden', 'true');

		const tooltipMargin = getCSSPx('--space-2', 8);

		function positionTooltip(clientX: number, clientY: number) {
			const tooltipNode = tooltip.node();
			if (!tooltipNode) return;

			const containerRect = chartContainer.getBoundingClientRect();
			const tooltipRect = tooltipNode.getBoundingClientRect();

			// Convert viewport coords to container-local coords
			let left = clientX - containerRect.left + tooltipMargin;
			let top = clientY - containerRect.top - tooltipRect.height - tooltipMargin;

			// Clamp within container
			left = Math.min(Math.max(left, tooltipMargin), containerRect.width - tooltipRect.width - tooltipMargin);
			top = Math.min(Math.max(top, tooltipMargin), containerRect.height - tooltipRect.height - tooltipMargin);

			tooltip.style('left', `${left}px`).style('top', `${top}px`);
		}

		function positionTooltipAtElement(element: Element) {
			const rect = element.getBoundingClientRect();
			positionTooltip(rect.left + rect.width / 2, rect.top + rect.height / 2);
		}

		function showTooltip(d: BubbleNode) {
			tooltip
				.attr('aria-hidden', 'false')
				.style('visibility', 'visible')
				.html(`<strong>${d.name}</strong><br/>Count: ${d.value}`);
		}

		function hideTooltip() {
			tooltip.attr('aria-hidden', 'true').style('visibility', 'hidden');
		}

		// Force Simulation for rectangular packing
		// We use forceX and forceY with different strengths to shape the cloud
		const aspectRatio = width / height;
		// Adjusted forces for a more organic, less "exploded" look
		const strengthY = 0.06;
		// Weaker X force to allow more horizontal spread
		const strengthX = strengthY / aspectRatio;

		const simulation = d3
			.forceSimulation<BubbleNode>(chartData)
			.force('x', d3.forceX(width / 2).strength(strengthX))
			.force('y', d3.forceY(height / 2).strength(strengthY))
			.force('collide', d3.forceCollide<BubbleNode>((d) => d.radius + 1).iterations(4))
			.stop();

		// Run simulation synchronously to pre-calculate positions
		// 300 ticks is usually enough for stabilization
		for (let i = 0; i < 300; ++i) simulation.tick();

		const bubbleGroups = zoomLayer
			.selectAll<SVGGElement, BubbleNode>('.bubble')
			.data(chartData)
			.enter()
			.append('g')
			.attr('class', 'bubble')
			.attr('transform', (d) => `translate(${d.x || width / 2},${d.y || height / 2})`)
			.attr('tabindex', 0)
			.attr('role', 'img')
			.attr('aria-label', (d) => `${d.name}: ${d.value}`)
			.style('cursor', 'grab');

		// Note: d3 is guaranteed to be loaded here since createChart guards against !d3
		bubbleGroups
			.on('mousedown', function () {
				d3!.select(this).style('cursor', 'grabbing');
			})
			.on('mouseup', function () {
				d3!.select(this).style('cursor', 'grab');
			});

		bubbleGroups
			.on('focus', function (event, d) {
				showTooltip(d);
				positionTooltipAtElement(this);
			})
			.on('blur', function () {
				hideTooltip();
			});

		const hoverTransitionMs = prefersReducedMotion() ? 0 : 200;

		bubbleGroups
			.append('circle')
			.attr('r', (d) => d.radius)
			.attr('fill', (d) => colorScale(d.name))
			.attr('stroke', `color-mix(in srgb, var(--color-surface) 35%, transparent)`)
			.attr('stroke-width', 1.25)
			.style('opacity', 0.9)
			.style('filter', 'drop-shadow(0 4px 6px color-mix(in srgb, black 10%, transparent))')
			.on('mouseenter', function (event, d) {
				d3!.select(this)
					.transition()
					.duration(hoverTransitionMs)
					.style('opacity', 1)
					.attr('stroke-width', 2)
					.style('filter', 'drop-shadow(0 8px 12px color-mix(in srgb, black 15%, transparent))');

				showTooltip(d);
				positionTooltip(event.clientX, event.clientY);
			})
			.on('mousemove', function (event) {
				positionTooltip(event.clientX, event.clientY);
			})
			.on('mouseleave', function () {
				d3!.select(this)
					.transition()
					.duration(hoverTransitionMs)
					.style('opacity', 0.9)
					.attr('stroke-width', 1.25)
					.style('filter', 'drop-shadow(0 4px 6px color-mix(in srgb, black 10%, transparent))');

				hideTooltip();
			});

		bubbleGroups
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.style('fill', 'white')
			.style('text-shadow', '0 1px 3px color-mix(in srgb, black 50%, transparent)')
			.style('font-size', (d) => `${Math.max(10, Math.min(20, d.radius / 2.2))}px`)
			.style('font-weight', '600')
			.style('font-family', 'var(--font-family-sans)')
			.style('pointer-events', 'none')
			.style('user-select', 'none')
			.each(function (d) {
				// Only show text if bubble is large enough
				if (d.radius < 16) return;

				// Smarter truncation based on radius
				const charLimit = Math.floor(d.radius / 2.4);
				const label =
					d.name.length > Math.max(10, charLimit)
						? `${d.name.slice(0, Math.max(8, charLimit - 1))}…`
						: d.name;

				d3!.select(this).text(label);
			});
	}

	// Zoom controls
	function zoomIn() {
		if (svg && zoomBehavior) {
			const duration = prefersReducedMotion() ? 0 : 500;
			svg.transition().duration(duration).call(zoomBehavior.scaleBy, 1.2);
		}
	}

	function zoomOut() {
		if (svg && zoomBehavior) {
			const duration = prefersReducedMotion() ? 0 : 500;
			svg.transition().duration(duration).call(zoomBehavior.scaleBy, 0.8);
		}
	}

	function resetZoom() {
		if (svg && zoomBehavior && d3) {
			const duration = prefersReducedMotion() ? 0 : 500;
			svg.transition().duration(duration).call(zoomBehavior.transform, d3.zoomIdentity);
		}
	}

	// Lifecycle management
	onMount(async () => {
		// Dynamically import D3 to reduce initial bundle size
		const d3Module = await import('d3');
		d3 = d3Module;
		isD3Loaded = true;
		createChart();
	});

	// Reactive updates when data or dimensions change
	$effect(() => {
		// Track dependencies
		const _ = [chartData, containerWidth, containerHeight, resolvedColors];

		if (chartContainer && chartData.length > 0 && isD3Loaded) {
			createChart();
		}
	});
</script>

<div
	class="bubble-chart-container scroll-reveal-scale"
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
>
	<div class="zoom-controls">
		<button class="zoom-btn" onclick={zoomIn} aria-label="Zoom in">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"
				></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"
				></line></svg
			>
		</button>
		<button class="zoom-btn" onclick={resetZoom} aria-label="Reset zoom">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"
				></path></svg
			>
		</button>
		<button class="zoom-btn" onclick={zoomOut} aria-label="Zoom out">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"
				></line><line x1="8" y1="11" x2="14" y2="11"></line></svg
			>
		</button>
	</div>
	<div
		bind:this={chartContainer}
		class="bubble-chart"
		role="region"
		aria-label="Keyword frequency bubble chart"
	></div>
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

	.bubble-chart-container :global(.bubble-tooltip) {
		position: absolute;
		visibility: hidden;
		background-color: color-mix(in srgb, var(--color-surface) 90%, transparent);
		color: var(--color-text);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-xs);
		font-family: var(--font-family-sans);
		backdrop-filter: blur(var(--glass-blur-sm));
		-webkit-backdrop-filter: blur(var(--glass-blur-sm));
		box-shadow: var(--shadow-lg);
		pointer-events: none;
		z-index: var(--z-dropdown);
		white-space: nowrap;
	}

	.bubble-chart {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: visible;
		/* Remove padding and border radius to match other charts */
	}

	.bubble-chart :global(svg) {
		display: block;
		margin: 0 auto;
		isolation: isolate;
	}

	.bubble-chart :global(.bubble:focus-visible) {
		outline: none;
	}

	.bubble-chart :global(.bubble:focus-visible circle) {
		stroke: var(--color-highlight);
		stroke-width: 2;
		opacity: 1;
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

	.zoom-controls {
		position: absolute;
		top: var(--space-4);
		left: var(--space-4);
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.zoom-btn {
		width: var(--space-9);
		height: var(--space-9);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: color-mix(in srgb, var(--color-surface) 80%, transparent);
		backdrop-filter: blur(var(--glass-blur-sm));
		-webkit-backdrop-filter: blur(var(--glass-blur-sm));
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		color: var(--color-text);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
		box-shadow: var(--shadow-sm);
		padding: 0;
	}

	.zoom-btn:hover {
		background-color: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.zoom-btn:active {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	/* Accessibility - reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.bubble-chart :global(.bubble circle) {
			transition: none !important;
		}

		.zoom-btn {
			transition: none !important;
		}

		.zoom-btn:hover {
			transform: none !important;
		}
	}

	/* Responsive adjustments */
	@media (--md-down) {
		.bubble-chart-container {
			min-height: 400px;
		}

		.bubble-chart {
			padding: var(--space-4);
		}
	}

	@media (--sm-down) {
		.bubble-chart-container {
			min-height: 320px;
		}

		.bubble-chart {
			padding: var(--space-3);
		}
	}
</style>
