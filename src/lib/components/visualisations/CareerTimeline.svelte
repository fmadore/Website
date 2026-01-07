<script lang="ts">
	import { scaleTime, scaleBand } from 'd3-scale';
	import {
		type TimelineItem,
		type TimelineCategory,
		TIMELINE_CATEGORIES,
		getCategoryColor,
		getCategoryLabel
	} from '$lib/types/timeline';
	import { fade, fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	interface Props {
		items?: TimelineItem[];
		height?: number;
		class?: string;
	}

	let { items = [], height = 500, class: className = '' }: Props = $props();

	// Simple counter for reactive key
	const chartKey = $derived(`career-timeline-${items.length}`);

	// Get unique categories present in the data
	const activeCategories = $derived(() => {
		const cats = items.map((item) => item.category);
		const uniqueCats = new Set(cats);
		// Return all categories but filter by presence in data, preserving order
		return TIMELINE_CATEGORIES.filter((c) => uniqueCats.has(c.id));
	});

	// Chart dimensions
	const margin = { top: 40, right: 30, bottom: 40, left: 20 };
	const chartWidth = $derived(900);
	const chartHeight = $derived(
		Math.max(300, activeCategories().length * 50 + margin.top + margin.bottom)
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

		const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
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
			.domain(activeCategories().map((c) => c.id))
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

		// Scroll detailed card into view on mobile
		if (window.innerWidth < 768) {
			const card = document.querySelector('.detail-card');
			card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

	// Category Icons Mapping
	const categoryIcons: Record<string, string> = {
		positions: 'lucide:briefcase',
		education: 'lucide:graduation-cap',
		grants: 'lucide:coins',
		publications: 'lucide:file-text',
		presentations: 'lucide:presentation',
		awards: 'lucide:award',
		fieldwork: 'lucide:map-pin',
		default: 'lucide:circle'
	};

	function getIconForCategory(category: string): string {
		return categoryIcons[category] || categoryIcons.default;
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
			<div
				class="tooltip-card"
				style="transform: translate({tooltipX}px, {tooltipY}px);"
				transition:fade={{ duration: 150 }}
			>
				<div class="tooltip-header">
					<span
						class="tooltip-category-indicator"
						style="background-color: {getCategoryColor(tooltipItem.category)}"
					></span>
					<span class="tooltip-category">{getCategoryLabel(tooltipItem.category)}</span>
				</div>
				<div class="tooltip-title">{tooltipItem.title}</div>
				{#if tooltipItem.subtitle}
					<div class="tooltip-subtitle">{tooltipItem.subtitle}</div>
				{/if}
				<div class="tooltip-date">
					{tooltipItem.startDate.getFullYear()}
					{#if tooltipItem.endDate && tooltipItem.endDate.getFullYear() !== tooltipItem.startDate.getFullYear()}
						–{tooltipItem.endDate.getFullYear()}
					{:else if tooltipItem.isOngoing}
						–Present
					{/if}
				</div>
			</div>
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
							{#each xTicks as tick}
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
						{#each activeCategories() as category, index}
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
							{#each categoryItems as item}
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
										rx="6"
										ry="6"
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
				<div class="detail-card glass-card" in:fly={{ y: 20, duration: 300 }}>
					<!-- Category Icon & Header -->
					<div class="card-content-wrapper">
						<div
							class="category-icon-large"
							style="background: {getCategoryColor(
								selectedItem.category
							)}; box-shadow: 0 4px 12px {getCategoryColor(selectedItem.category)}40;"
						>
							<Icon
								icon={getIconForCategory(selectedItem.category)}
								width="28"
								height="28"
								color="white"
							/>
						</div>

						<div class="card-main-info">
							<div class="card-header-row">
								<h3 class="detail-title">{selectedItem.title}</h3>
								<button class="close-btn-minimal" onclick={closeDetailCard} aria-label="Close">
									<Icon icon="lucide:x" width="18" height="18" />
								</button>
							</div>

							<div class="detail-meta-row">
								<span
									class="meta-badge"
									style="
										color: {getCategoryColor(selectedItem.category)};
										background: {getCategoryColor(selectedItem.category)}15;
										border-color: {getCategoryColor(selectedItem.category)}30;
									"
								>
									{selectedItem.startDate.getFullYear()}
									{#if selectedItem.endDate && selectedItem.endDate.getFullYear() !== selectedItem.startDate.getFullYear()}
										–{selectedItem.endDate.getFullYear()}
									{:else if selectedItem.isOngoing}
										–Present
									{/if}
								</span>
								<span class="meta-dot">•</span>
								<span class="detail-subtitle"
									>{selectedItem.subtitle || getCategoryLabel(selectedItem.category)}</span
								>
							</div>

							{#if selectedItem.description}
								<p class="detail-description">{selectedItem.description}</p>
							{/if}
						</div>
					</div>

					<!-- Navigation Footer -->
					<div class="detail-navigation">
						<button class="nav-btn previous" onclick={goToPrevious} disabled={selectedIndex === 0}>
							<Icon icon="lucide:chevron-left" width="18" height="18" />
							<span>Previous</span>
						</button>

						<span class="nav-count">
							<span class="current">{selectedIndex + 1}</span>
							<span class="separator">of</span>
							<span class="total">{items.length}</span>
						</span>

						<button
							class="nav-btn next"
							onclick={goToNext}
							disabled={selectedIndex === items.length - 1}
						>
							<span>Next</span>
							<Icon icon="lucide:chevron-right" width="18" height="18" />
						</button>
					</div>
				</div>
			{:else}
				<!-- Clean prompt to select an item if nothing selected (though we try to auto-select) -->
				<div class="empty-selection-hint">
					<p>Select an item from the timeline to view details</p>
				</div>
			{/if}

			<!-- Legend -->
			<div class="timeline-legend">
				{#each activeCategories() as category}
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

	/* Enhanced Hover Tooltip */
	.tooltip-card {
		position: absolute;
		top: 0;
		left: 0;
		z-index: var(--z-tooltip);
		pointer-events: none;
		background: color-mix(in srgb, var(--color-surface) 90%, transparent);
		backdrop-filter: blur(8px);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		padding: var(--space-3);
		min-width: 200px;
		max-width: 300px;
		transform: translate(-50%, -100%);
		margin-top: -12px;
	}

	.tooltip-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.tooltip-category-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.tooltip-category {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.tooltip-title {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin-bottom: var(--space-1);
		line-height: var(--line-height-tight);
	}

	.tooltip-subtitle {
		font-size: var(--font-size-xs);
		color: var(--color-text-light);
		margin-bottom: var(--space-1);
	}

	.tooltip-date {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-primary);
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border);
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
		rx: 6;
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
		stroke-width: 2px;
	}

	.timeline-bar:hover {
		filter: brightness(1.2) contrast(1.1);
		opacity: 1;
	}

	.timeline-bar.selected {
		stroke: var(--color-surface);
		filter: brightness(1.3);
		opacity: 1;
	}

	.timeline-point {
		cursor: pointer;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			filter var(--duration-fast) var(--ease-out);
		stroke: transparent;
		stroke-width: 2px;
	}

	.timeline-point:hover {
		filter: brightness(1.2) contrast(1.1);
		opacity: 1;
	}

	.timeline-point.selected {
		stroke: var(--color-surface);
		filter: brightness(1.3);
		opacity: 1;
	}

	/* Detail Card */
	.detail-card {
		position: relative;
		border-radius: var(--border-radius-xl);
		margin-top: var(--space-md);
		border: 1px solid color-mix(in srgb, var(--color-primary) 10%, transparent);
		overflow: hidden;
		background: color-mix(in srgb, var(--color-surface) 60%, transparent);
	}

	.card-content-wrapper {
		padding: var(--space-xl);
		display: flex;
		gap: var(--space-lg);
		align-items: flex-start;
	}

	.category-icon-large {
		width: 56px;
		height: 56px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-main-info {
		flex: 1;
		min-width: 0; /* Prevent flex blowout */
	}

	.card-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-md);
		margin-bottom: var(--space-xs);
	}

	.detail-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
		margin: 0;
		line-height: 1.3;
	}

	.close-btn-minimal {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: var(--space-1);
		margin: -4px -4px 0 0;
		border-radius: var(--border-radius-full);
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn-minimal:hover {
		color: var(--color-danger);
		background: color-mix(in srgb, var(--color-danger) 10%, transparent);
	}

	.detail-meta-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.meta-badge {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		padding: 2px 8px;
		border-radius: var(--border-radius-sm);
		border: 1px solid;
		font-weight: var(--font-weight-medium);
	}

	.meta-dot {
		color: var(--color-text-muted);
		font-size: 8px;
	}

	.detail-subtitle {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
	}

	.detail-description {
		font-size: var(--font-size-md);
		color: var(--color-text-light);
		line-height: 1.6;
		margin: 0;
	}

	.detail-navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-xl);
		border-top: 1px solid var(--color-border);
		background: color-mix(in srgb, var(--color-surface) 30%, transparent);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		border: none;
		color: var(--color-text);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		transition: all 0.2s ease;
	}

	.nav-btn:hover:not(:disabled) {
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 5%, transparent);
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.nav-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.nav-count .current {
		color: var(--color-text);
		font-weight: var(--font-weight-bold);
	}

	.nav-count .total {
		font-family: var(--font-family-mono);
	}

	.empty-selection-hint {
		text-align: center;
		padding: var(--space-xl);
		border: 1px dashed var(--color-border);
		border-radius: var(--border-radius-lg);
		color: var(--color-text-muted);
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
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid transparent;
		box-shadow: 0 0 0 1px var(--color-border);
	}

	.legend-label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 200px;
	}

	/* Mobile Optimizations */
	@media (max-width: 768px) {
		.card-content-wrapper {
			flex-direction: column;
			gap: var(--space-md);
		}

		.category-icon-large {
			width: 48px;
			height: 48px;
		}

		.card-header-row {
			margin-top: var(--space-xs);
		}

		.detail-navigation {
			padding: var(--space-md);
		}

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
		.tooltip-card,
		.timeline-bar,
		.timeline-point,
		.nav-btn,
		.close-btn-minimal,
		.detail-card {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
