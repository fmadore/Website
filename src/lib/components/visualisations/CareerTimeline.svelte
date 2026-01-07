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
	}

	function goToPrevious() {
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

			<!-- Detail Card -->
			{#if selectedItem}
				<div class="detail-card glass-card" in:fly={{ y: 20, duration: 300 }}>
					<button class="close-btn" onclick={closeDetailCard} aria-label="Close">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>
					<div class="detail-header">
						<div
							class="category-icon"
							style="background: {getCategoryColor(selectedItem.category)};"
						>
							{#if selectedItem.category === 'positions'}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"><path d="M20 7h-9M14 17H5M5 7h5M20 17h-2M15 7v10M9 7v10" /></svg
								>
							{:else if selectedItem.category === 'education'}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path
										d="M6 12v5c3 3 9 3 12 0v-5"
									/></svg
								>
							{:else if selectedItem.category === 'grants'}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg
								>
							{:else if selectedItem.category === 'publications'}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
										d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
									/></svg
								>
							{:else if selectedItem.category === 'presentations'}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><path d="M15 10l5 5-5 5" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg
								>
							{:else if selectedItem.category === 'awards'}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><circle cx="12" cy="8" r="7" /><path
										d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
									/></svg
								>
							{:else}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line
										x1="12"
										y1="8"
										x2="12.01"
										y2="8"
									/></svg
								>
							{/if}
						</div>
						<div class="detail-meta">
							<span
								class="detail-subtitle"
								style="color: {getCategoryColor(selectedItem.category)};"
							>
								{selectedItem.subtitle || getCategoryLabel(selectedItem.category)}
							</span>
							<span class="detail-year">
								{selectedItem.startDate.getFullYear()}{selectedItem.endDate
									? `–${selectedItem.endDate.getFullYear()}`
									: selectedItem.isOngoing
										? '–Present'
										: ''}
							</span>
						</div>
					</div>
					<h3 class="detail-title">{selectedItem.title}</h3>
					{#if selectedItem.description}
						<p class="detail-description">{selectedItem.description}</p>
					{/if}
					<div class="detail-navigation">
						<button class="nav-btn" onclick={goToPrevious} disabled={selectedIndex === 0}>
							← Previous
						</button>
						<span class="nav-count">{selectedIndex + 1} of {items.length}</span>
						<button
							class="nav-btn"
							onclick={goToNext}
							disabled={selectedIndex === items.length - 1}
						>
							Next →
						</button>
					</div>
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
		overflow: hidden;
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
		/* Removed transform: scaleY(1.1) to prevent jarring movement */
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
		/* Removed r: 9 to prevent jarring movement */
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
		padding: var(--space-xl);
		border-radius: var(--border-radius-xl);
		margin-top: var(--space-lg);
		box-shadow: var(--shadow-xl);
		border: 1px solid color-mix(in srgb, var(--color-primary) 10%, transparent);
	}

	.close-btn {
		position: absolute;
		top: var(--space-md);
		right: var(--space-md);
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--border-radius-full);
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		color: var(--color-danger);
		border-color: var(--color-danger);
		background: color-mix(in srgb, var(--color-danger) 5%, transparent);
	}

	.detail-header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	.category-icon {
		width: 56px;
		height: 56px;
		border-radius: var(--border-radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--color-white);
		box-shadow: var(--shadow-md);
	}

	.detail-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-top: var(--space-1);
	}

	.detail-subtitle {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-year {
		font-size: var(--font-size-base);
		color: var(--color-text-light);
		font-family: var(--font-family-mono);
	}

	.detail-title {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
		margin: 0 0 var(--space-md) 0;
		line-height: 1.2;
	}

	.detail-description {
		font-size: var(--font-size-md);
		color: var(--color-text-light);
		line-height: 1.6;
		margin: 0 0 var(--space-xl) 0;
		max-width: 65ch;
	}

	.detail-navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-border);
	}

	.nav-btn {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--border-radius-md);
		transition: all 0.2s ease;
	}

	.nav-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 5%, transparent);
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		border-color: var(--color-border);
	}

	.nav-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-family: var(--font-family-mono);
	}

	/* Legend */
	.timeline-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md) var(--space-xl);
		padding: var(--space-lg);
		justify-content: center;
		background: var(--color-surface-alt);
		border-radius: var(--border-radius-lg);
		margin-top: var(--space-sm);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 4px; /* Rounded square/pill shape */
		box-shadow: var(--shadow-sm);
	}

	.legend-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 200px;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.tooltip-card,
		.timeline-bar,
		.timeline-point,
		.nav-btn,
		.close-btn,
		.detail-card {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
