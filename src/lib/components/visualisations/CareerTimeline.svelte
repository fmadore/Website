<script lang="ts">
	import { scaleTime, scaleBand } from 'd3-scale';
	import { type TimelineItem, TIMELINE_CATEGORIES, getCategoryColor } from '$lib/types/timeline';
	import TimelineTooltip from './timeline/TimelineTooltip.svelte';
	import TimelineDetailCard from './timeline/TimelineDetailCard.svelte';

	interface Props {
		items?: TimelineItem[];
		height?: number;
		class?: string;
	}

	let { items = [], height = 500, class: className = '' }: Props = $props();

	// Simple counter for reactive key
	const chartKey = $derived(`career-timeline-${items.length}`);

	// Get unique categories present in the data.
	// $derived.by caches the filtered array; the previous $derived(() => fn)
	// returned a function that recomputed on every call site (4× per render).
	const activeCategories = $derived.by(() => {
		const cats = items.map((item) => item.category);
		const uniqueCats = new Set(cats);
		// Return all categories but filter by presence in data, preserving order
		return TIMELINE_CATEGORIES.filter((c) => uniqueCats.has(c.id));
	});

	// Chart dimensions
	const margin = { top: 40, right: 30, bottom: 40, left: 20 };
	const chartWidth = $derived(900);
	const chartHeight = $derived(
		Math.max(300, activeCategories.length * 50 + margin.top + margin.bottom)
	);
	const innerWidth = $derived(chartWidth - margin.left - margin.right);
	const innerHeight = $derived(chartHeight - margin.top - margin.bottom);

	// Calculate the year domain
	const yearDomain = $derived.by((): [Date, Date] => {
		if (items.length === 0) {
			const currentYear = new Date().getFullYear();
			return [new Date(currentYear - 20, 0, 1), new Date(currentYear + 1, 11, 31)];
		}

		const allDates = items.flatMap((item) => {
			const dates = [item.startDate];
			if (item.endDate) dates.push(item.endDate);
			// For ongoing items, use current date
			if (item.isOngoing) dates.push(new Date());
			return dates;
		});

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

		// Add some padding
		minDate.setFullYear(minDate.getFullYear() - 2);
		maxDate.setFullYear(maxDate.getFullYear() + 1);

		return [minDate, maxDate];
	});

	// Create scales
	const xScale = $derived(scaleTime().domain(yearDomain).range([0, innerWidth]));

	const yScale = $derived(
		scaleBand<string>()
			.domain(activeCategories.map((c) => c.id))
			.range([0, innerHeight])
			.padding(0.25)
	);

	// Generate x-axis ticks
	const xTicks = $derived.by(() => {
		const [minDate, maxDate] = yearDomain;
		const ticks: Date[] = [];
		const startYear = Math.ceil(minDate.getFullYear() / 5) * 5;
		const endYear = maxDate.getFullYear();

		for (let year = startYear; year <= endYear; year += 5) {
			ticks.push(new Date(year, 0, 1));
		}
		return ticks;
	});

	// State for interaction
	let containerEl = $state<HTMLDivElement | null>(null);
	let tooltipOpen = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipItem = $state<TimelineItem | null>(null);
	let selectedItem = $state<TimelineItem | null>(null);
	let selectedIndex = $state(0);

	// Initialize with the most recent item selected for better discovery
	$effect(() => {
		if (items.length > 0 && !selectedItem) {
			// Try to find the most recent items
			// Since items might not be sorted by date, let's find the one with the max start date
			let maxDate = -1;
			let maxIndex = 0;

			items.forEach((item, index) => {
				const time = item.startDate.getTime();
				if (time > maxDate) {
					maxDate = time;
					maxIndex = index;
				}
			});

			selectedIndex = maxIndex;
			selectedItem = items[maxIndex];
		}
	});

	function updateTooltipPosition(e: PointerEvent) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		// Position tooltip above the mouse with some offset
		tooltipX = e.clientX - rect.left;
		tooltipY = e.clientY - rect.top - 10;
	}

	function showTooltip(e: PointerEvent, item: TimelineItem) {
		tooltipOpen = true;
		tooltipItem = item;
		updateTooltipPosition(e);
	}

	function hideTooltip() {
		tooltipOpen = false;
		tooltipItem = null;
	}

	function selectItem(item: TimelineItem) {
		selectedItem = item;
		selectedIndex = items.findIndex((i) => i.id === item.id);

		// Scroll detailed card into view on mobile. `scrollIntoView({ behavior:
		// 'smooth' })` ignores `prefers-reduced-motion`; feature-detect and
		// downgrade to instant scroll for users who opt out of motion.
		if (window.innerWidth < 768) {
			const card = document.querySelector('.detail-card');
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			card?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
		}
	}

	function goToPrevious() {
		// Find previous item logically (based on current index)
		if (selectedIndex > 0) {
			selectedIndex--;
			selectedItem = items[selectedIndex];
		}
	}

	function goToNext() {
		if (selectedIndex < items.length - 1) {
			selectedIndex++;
			selectedItem = items[selectedIndex];
		}
	}

	function closeDetailCard() {
		selectedItem = null;
	}

	// Get x position for an item
	function getItemX(item: TimelineItem): number {
		return xScale(item.startDate);
	}

	// Get width for an item (duration items get bars, point items get circles)
	function getItemWidth(item: TimelineItem): number {
		if (item.endDate || item.isOngoing) {
			const end = item.endDate || new Date();
			return Math.max(8, xScale(end) - xScale(item.startDate));
		}
		// Point items - small width
		return 8;
	}

	// Check if item is a duration (has meaningful width) or a point
	function isDuration(item: TimelineItem): boolean {
		return !!(item.endDate || item.isOngoing);
	}
</script>

{#key chartKey}
	<div
		bind:this={containerEl}
		class="career-timeline {className}"
		style="height: auto; min-height: {height}px;"
		role="img"
		aria-label="Career timeline visualization"
	>
		<!-- Hover Tooltip -->
		{#if tooltipOpen && tooltipItem}
			<TimelineTooltip item={tooltipItem} x={tooltipX} y={tooltipY} />
		{/if}

		<!-- SVG Chart -->
		{#if items.length > 0}
			<div class="chart-container">
				<svg
					viewBox="0 0 {chartWidth} {chartHeight}"
					class="timeline-svg"
					preserveAspectRatio="xMidYMid meet"
				>
					<g transform="translate({margin.left}, {margin.top})">
						<!-- X Axis (top) -->
						<g class="x-axis">
							<line x1="0" y1="0" x2={innerWidth} y2="0" class="axis-line" />
							{#each xTicks as tick (tick.getTime())}
								{@const x = xScale(tick)}
								<g transform="translate({x}, 0)">
									<line y1="0" y2="-6" class="tick-line" />
									<text y="-12" text-anchor="middle" class="tick-label">
										{tick.getFullYear()}
									</text>
								</g>
							{/each}
						</g>

						<!-- Category swim lanes -->
						{#each activeCategories as category, index (category.id)}
							{@const y = yScale(category.id) ?? 0}
							{@const bandHeight = yScale.bandwidth()}
							{@const categoryItems = items.filter((item) => item.category === category.id)}
							{@const color = getCategoryColor(category.id)}

							<!-- Lane background (subtle) -->
							<rect
								x="0"
								{y}
								width={innerWidth}
								height={bandHeight}
								class="lane-background"
								style="--lane-index: {index};"
							/>

							<!-- Items in this lane -->
							{#each categoryItems as item (item.id)}
								{@const itemX = getItemX(item)}
								{@const itemWidth = getItemWidth(item)}
								{@const itemY = y + bandHeight / 2}

								{#if isDuration(item)}
									<!-- Duration bar -->
									<rect
										x={itemX}
										y={itemY - 10}
										width={itemWidth}
										height={20}
										fill={color}
										rx="0"
										ry="0"
										class="timeline-bar"
										class:selected={selectedItem?.id === item.id}
										onpointermove={(e) => showTooltip(e, item)}
										onpointerleave={hideTooltip}
										onclick={() => selectItem(item)}
										role="button"
										tabindex="0"
										onkeydown={(e) => e.key === 'Enter' && selectItem(item)}
									/>
								{:else}
									<!-- Point marker -->
									<circle
										cx={itemX}
										cy={itemY}
										r="6"
										fill={color}
										class="timeline-point"
										class:selected={selectedItem?.id === item.id}
										onpointermove={(e) => showTooltip(e, item)}
										onpointerleave={hideTooltip}
										onclick={() => selectItem(item)}
										role="button"
										tabindex="0"
										onkeydown={(e) => e.key === 'Enter' && selectItem(item)}
									/>
								{/if}
							{/each}
						{/each}
					</g>
				</svg>
			</div>

			<!-- Detail Card (Always rendered if selectedItem exists) -->
			{#if selectedItem}
				<TimelineDetailCard
					item={selectedItem}
					index={selectedIndex}
					total={items.length}
					onprevious={goToPrevious}
					onnext={goToNext}
					onclose={closeDetailCard}
				/>
			{:else}
				<!-- Clean prompt to select an item if nothing selected (though we try to auto-select) -->
				<div class="empty-selection-hint">
					<p>Select an item from the timeline to view details</p>
				</div>
			{/if}

			<!-- Legend -->
			<div class="timeline-legend">
				{#each activeCategories as category (category.id)}
					<div class="legend-item">
						<span class="legend-color" style="background: {category.color};"></span>
						<span class="legend-label">{category.label}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p class="text-muted">No timeline data available</p>
			</div>
		{/if}
	</div>
{/key}

<style>
	.career-timeline {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.chart-container {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		/* Hide scrollbar but keep functionality */
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.chart-container::-webkit-scrollbar {
		display: none;
	}

	.timeline-svg {
		width: 100%;
		height: auto;
		display: block;
		min-width: 600px; /* Ensure it doesn't get too squished */
	}

	.axis-line {
		stroke: var(--color-border);
		stroke-opacity: 0.5;
	}

	.tick-line {
		stroke: var(--color-border);
		stroke-opacity: 0.5;
	}

	.tick-label {
		fill: var(--color-text-muted);
		font-size: var(--font-size-xs);
		font-family: var(--font-family-mono);
	}

	.lane-background {
		fill: var(--color-surface-alt);
		opacity: 0.3;
		rx: 0;
	}

	.lane-background:nth-child(even) {
		opacity: 0.1;
	}

	.timeline-bar {
		cursor: pointer;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			filter var(--duration-fast) var(--ease-out);
		stroke: transparent;
		stroke-width: var(--space-0-5);
	}

	.timeline-bar:hover {
		filter: brightness(1.2) contrast(1.1);
		opacity: 1;
	}

	.timeline-bar.selected {
		stroke: var(--color-accent);
		stroke-width: var(--space-0-5);
		filter: brightness(1.05);
		opacity: 1;
	}

	.timeline-point {
		cursor: pointer;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			filter var(--duration-fast) var(--ease-out);
		stroke: transparent;
		stroke-width: var(--space-0-5);
	}

	.timeline-point:hover {
		filter: brightness(1.2) contrast(1.1);
		opacity: 1;
	}

	.timeline-point.selected {
		stroke: var(--color-accent);
		stroke-width: var(--space-0-5);
		filter: brightness(1.05);
		opacity: 1;
	}

	.empty-selection-hint {
		text-align: center;
		padding: var(--space-xl);
		border: 1px dashed var(--color-border);
		border-radius: 0;
		color: var(--color-text-light);
		font-family: var(--font-family-serif);
		font-style: italic;
	}

	/* Legend */
	.timeline-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md) var(--space-xl);
		padding: var(--space-lg);
		justify-content: center;
		border-top: 1px solid var(--color-border);
		margin-top: var(--space-lg);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.legend-color {
		width: var(--space-3);
		height: var(--space-3);
		border-radius: 50%;
		border: var(--space-0-5) solid transparent;
		box-shadow: 0 0 0 1px var(--color-border);
	}

	.legend-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 200px;
	}

	/* Mobile Optimizations */
	@media (--md-down) {
		.timeline-legend {
			gap: var(--space-sm) var(--space-md);
		}

		.timeline-svg {
			/* On mobile, let it scroll horizontally */
			min-width: 800px;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.timeline-bar,
		.timeline-point {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
