<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { type TimelineItem, TIMELINE_CATEGORIES, getCategoryColor } from '$lib/types/timeline';
	import TimelineTooltip from './timeline/TimelineTooltip.svelte';
	import TimelineDetailCard from './timeline/TimelineDetailCard.svelte';

	interface Props {
		items?: TimelineItem[];
		height?: number;
		class?: string;
	}

	let { items = [], height = 0, class: className = '' }: Props = $props();

	// Get unique categories present in the data.
	// $derived.by caches the filtered array; the previous $derived(() => fn)
	// returned a function that recomputed on every call site (4× per render).
	const activeCategories = $derived.by(() => {
		const cats = items.map((item) => item.category);
		const uniqueCats = new Set(cats);
		// Return all categories but filter by presence in data, preserving order
		return TIMELINE_CATEGORIES.filter((c) => uniqueCats.has(c.id));
	});

	// Chart dimensions. `margin.left` is the hanging mono key column of the
	// ledger: every lane names itself there, so no lane is keyed by colour
	// alone. The plate draws at 1:1 (the viewBox matches the pixel size), so
	// SVG user units are CSS pixels and the label column keeps its typographic
	// size whatever the viewport.
	const margin = { top: 40, right: 32, bottom: 8, left: 124 };
	const MIN_PLOT_WIDTH = 620;
	const LANE_HEIGHT = 52;

	// The single horizontal scroller lives on the route container; the plate
	// sizes to the space it is given, with a readable floor.
	let containerWidth = $state(0);
	const chartWidth = $derived(
		Math.max(margin.left + MIN_PLOT_WIDTH + margin.right, Math.floor(containerWidth))
	);
	const chartHeight = $derived(
		margin.top + Math.max(1, activeCategories.length) * LANE_HEIGHT + margin.bottom
	);
	const innerWidth = $derived(chartWidth - margin.left - margin.right);
	const innerHeight = $derived(Math.max(1, activeCategories.length) * LANE_HEIGHT);

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

	const xScale = $derived(scaleTime().domain(yearDomain).range([0, innerWidth]));

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

	function formatRange(item: TimelineItem): string {
		const start = item.startDate.getFullYear();
		if (item.endDate) {
			const end = item.endDate.getFullYear();
			return end === start ? `${start}` : `${start}–${end}`;
		}
		if (item.isOngoing) return `${start}–present`;
		return `${start}`;
	}

	// One row per category: hanging mono key, hairline above, marks to the right.
	const lanes = $derived.by(() =>
		activeCategories.map((category, index) => {
			const laneItems = items
				.filter((item) => item.category === category.id)
				.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
			return {
				...category,
				index,
				top: index * LANE_HEIGHT,
				centre: index * LANE_HEIGHT + LANE_HEIGHT / 2,
				count: laneItems.length,
				items: laneItems
			};
		})
	);

	interface Mark {
		item: TimelineItem;
		laneIndex: number;
		x: number;
		width: number;
		y: number;
		duration: boolean;
		colour: string;
		name: string;
	}

	// Flat, lane-major then chronological — this order is also the keyboard
	// order, so a roving tabindex over it reads the plate the way it is drawn.
	const marks = $derived.by((): Mark[] =>
		lanes.flatMap((lane) =>
			lane.items.map((item) => {
				const x = xScale(item.startDate);
				const duration = !!(item.endDate || item.isOngoing);
				const end = item.endDate ?? new Date();
				return {
					item,
					laneIndex: lane.index,
					x,
					width: duration ? Math.max(6, xScale(end) - x) : 0,
					y: lane.centre,
					duration,
					colour: getCategoryColor(item.category),
					name: `${item.title}, ${lane.label}, ${formatRange(item)}`
				};
			})
		)
	);

	// State for interaction
	let containerEl = $state<HTMLDivElement | null>(null);
	let tooltipOpen = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipPlacement = $state<'above' | 'below'>('above');
	let tooltipItem = $state<TimelineItem | null>(null);
	/**
	 * The selection is an index into `marks`, not into `items`.
	 *
	 * `items` arrives in the order the data files were aggregated; `marks` is
	 * the order the plate is drawn in, lane by lane and then chronological. Two
	 * orders meant Previous and Next walked a sequence the reader could not see
	 * — pressing Next from the first record in a lane could land three lanes
	 * away — and the count under them ("4 of 31") was counting a third thing
	 * again. One index, keyed to what is on screen, and the roving tabindex
	 * follows it so the keyboard and the buttons never disagree about where the
	 * reader is.
	 *
	 * Nothing is selected on arrival. The effect that opened the most recent
	 * record for the reader put a card between them and the plate before they
	 * had asked a question of it, and it fought every attempt to close it.
	 */
	let selectedIndex = $state<number | null>(null);
	let focusIndex = $state(0);

	const rovingIndex = $derived(Math.min(focusIndex, Math.max(0, marks.length - 1)));
	const selectedMark = $derived(selectedIndex === null ? null : (marks[selectedIndex] ?? null));

	function placeTooltip(x: number, y: number) {
		tooltipX = x;
		tooltipY = y;
		// Near the top of the plate there is no room above the mark, and the
		// route's scroller clips vertical overflow — flip below instead.
		tooltipPlacement = y > 150 ? 'above' : 'below';
	}

	function showTooltip(e: PointerEvent, item: TimelineItem) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		tooltipOpen = true;
		tooltipItem = item;
		placeTooltip(e.clientX - rect.left, e.clientY - rect.top - 10);
	}

	function showTooltipForMark(mark: Mark) {
		tooltipOpen = true;
		tooltipItem = mark.item;
		placeTooltip(
			margin.left + mark.x + (mark.duration ? mark.width / 2 : 0),
			margin.top + mark.y - 14
		);
	}

	function hideTooltip() {
		tooltipOpen = false;
		tooltipItem = null;
	}

	function selectMark(index: number) {
		if (index < 0 || index >= marks.length) return;
		selectedIndex = index;
		// The roving tabindex follows the selection, so tabbing back into the
		// plate returns to the record the card is showing.
		focusIndex = index;

		// Scroll detailed card into view on mobile. `scrollIntoView({ behavior:
		// 'smooth' })` ignores `prefers-reduced-motion`; feature-detect and
		// downgrade to instant scroll for users who opt out of motion.
		if (window.innerWidth < 768) {
			const card = document.querySelector('.detail-card');
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			card?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
		}
	}

	function focusMark(index: number) {
		const next = Math.max(0, Math.min(marks.length - 1, index));
		focusIndex = next;
		containerEl?.querySelector<SVGGElement>(`[data-mark="${next}"]`)?.focus();
	}

	/** Nearest mark in time within another lane — keeps vertical moves aligned. */
	function nearestInLane(laneIndex: number, x: number): number {
		let best = -1;
		let bestDistance = Number.POSITIVE_INFINITY;
		marks.forEach((mark, index) => {
			if (mark.laneIndex !== laneIndex) return;
			const distance = Math.abs(mark.x - x);
			if (distance < bestDistance) {
				bestDistance = distance;
				best = index;
			}
		});
		return best === -1 ? 0 : best;
	}

	function onMarkKeydown(event: KeyboardEvent, mark: Mark, index: number) {
		switch (event.key) {
			case 'Enter':
			case ' ':
			case 'Spacebar':
				// Space must activate as well as Enter, without scrolling the page.
				event.preventDefault();
				selectMark(index);
				break;
			case 'ArrowRight':
				event.preventDefault();
				focusMark(index + 1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				focusMark(index - 1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				focusMark(nearestInLane(Math.min(lanes.length - 1, mark.laneIndex + 1), mark.x));
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusMark(nearestInLane(Math.max(0, mark.laneIndex - 1), mark.x));
				break;
			case 'Home':
				event.preventDefault();
				focusMark(0);
				break;
			case 'End':
				event.preventDefault();
				focusMark(marks.length - 1);
				break;
			default:
				break;
		}
	}

	function goToPrevious() {
		if (selectedIndex !== null) selectMark(selectedIndex - 1);
	}

	function goToNext() {
		if (selectedIndex !== null) selectMark(selectedIndex + 1);
	}

	function closeDetailCard() {
		selectedIndex = null;
	}
</script>

<div
	bind:this={containerEl}
	bind:clientWidth={containerWidth}
	class="career-timeline {className}"
	style:min-height={height ? `${height}px` : null}
	role="group"
	aria-label="Career timeline, one lane per category"
>
	<!-- Hover Tooltip -->
	{#if tooltipOpen && tooltipItem}
		<TimelineTooltip item={tooltipItem} x={tooltipX} y={tooltipY} placement={tooltipPlacement} />
	{/if}

	{#if items.length > 0}
		<p class="sr-only">
			{marks.length} records across {lanes.length} categories. Move between records with the arrow keys;
			press Enter or Space to open one.
		</p>

		<svg
			class="timeline-svg"
			width={chartWidth}
			height={chartHeight}
			viewBox="0 0 {chartWidth} {chartHeight}"
		>
			<g transform="translate({margin.left}, {margin.top})">
				<!-- Year axis (top) -->
				<g class="x-axis">
					<line x1={-margin.left} y1="0" x2={innerWidth} y2="0" class="axis-line" />
					{#each xTicks as tick (tick.getTime())}
						{@const x = xScale(tick)}
						{#if x >= 0 && x <= innerWidth}
							<g transform="translate({x}, 0)">
								<line y1="0" y2="-6" class="tick-line" />
								<text y="-12" text-anchor="middle" class="tick-label">
									{tick.getFullYear()}
								</text>
							</g>
						{/if}
					{/each}
				</g>

				<!-- Lane key column: the ledger's hanging mono key, one per lane -->
				<g class="lanes">
					<line class="key-rule" x1="0" y1="0" x2="0" y2={innerHeight} />
					{#each lanes as lane (lane.id)}
						{#if lane.index > 0}
							<line
								class="lane-rule"
								x1={-margin.left}
								y1={lane.top}
								x2={innerWidth}
								y2={lane.top}
							/>
						{/if}
						<text class="lane-label" x={-margin.left} y={lane.centre - 2}>
							{lane.label.toUpperCase()}
						</text>
						<text class="lane-count" x={-margin.left} y={lane.centre + 13}>
							{lane.count} records
						</text>
					{/each}
					<line
						class="lane-rule"
						x1={-margin.left}
						y1={innerHeight}
						x2={innerWidth}
						y2={innerHeight}
					/>
				</g>

				<!-- Records -->
				<g class="marks">
					{#each marks as mark, index (`${mark.item.category}:${mark.item.id}:${index}`)}
						{@const hitWidth = Math.max(24, mark.width)}
						{@const hitX = mark.duration
							? mark.x - Math.max(0, (24 - mark.width) / 2)
							: mark.x - 12}
						<g
							class="mark"
							class:selected={selectedIndex === index}
							data-mark={index}
							style="--_mark-colour: {mark.colour};"
							role="button"
							tabindex={index === rovingIndex ? 0 : -1}
							aria-label={mark.name}
							aria-pressed={selectedIndex === index}
							onpointermove={(e) => showTooltip(e, mark.item)}
							onpointerleave={hideTooltip}
							onclick={() => selectMark(index)}
							onkeydown={(e) => onMarkKeydown(e, mark, index)}
							onfocus={() => {
								focusIndex = index;
								showTooltipForMark(mark);
							}}
							onblur={hideTooltip}
						>
							<!-- 24px hit area (WCAG 2.5.8), and the focus ring -->
							<rect class="mark-hit" x={hitX} y={mark.y - 12} width={hitWidth} height="24" />
							{#if mark.duration}
								<rect
									class="timeline-bar"
									x={mark.x}
									y={mark.y - 9}
									width={mark.width}
									height="18"
								/>
							{:else}
								<circle class="timeline-point" cx={mark.x} cy={mark.y} r="6" />
							{/if}
						</g>
					{/each}
				</g>
			</g>
		</svg>

		<!-- Detail Card — only once the reader has opened a record. -->
		{#if selectedMark && selectedIndex !== null}
			<div class="detail-slot">
				<TimelineDetailCard
					item={selectedMark.item}
					index={selectedIndex}
					total={marks.length}
					onprevious={goToPrevious}
					onnext={goToNext}
					onclose={closeDetailCard}
				/>
			</div>
		{/if}

		<!-- Key to the mark forms; the lanes name their own categories. -->
		<div class="timeline-key">
			<span class="key-item">
				<svg class="key-mark" viewBox="0 0 26 10" width="26" height="10" aria-hidden="true">
					<rect x="0" y="2" width="26" height="6" />
				</svg>
				<span class="key-label">Span</span>
			</span>
			<span class="key-item">
				<svg class="key-mark" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
					<circle cx="6" cy="6" r="5" />
				</svg>
				<span class="key-label">Single date</span>
			</span>
			<span class="key-note">Colour repeats the category named at the head of each lane.</span>
		</div>
	{:else}
		<div class="empty-state">
			<p class="text-muted">No records to plot.</p>
		</div>
	{/if}
</div>

<style>
	.career-timeline {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* The route container owns the one horizontal scroller; the plate draws at
	   its natural width and lets that container scroll it. */
	.timeline-svg {
		display: block;
		flex: none;
		align-self: start;
	}

	.axis-line,
	.tick-line {
		stroke: var(--color-border);
	}

	.tick-label {
		fill: var(--color-text-light);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-figures);
	}

	/* Hairlines separate the lanes — the house separator, not a zebra fill. */
	.lane-rule,
	.key-rule {
		stroke: var(--color-hairline);
		stroke-width: var(--rule-hairline);
	}

	.lane-label {
		fill: var(--color-text-light);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
	}

	/* The stamp under the key: a real count, the only ornament allowed. */
	.lane-count {
		fill: var(--color-text-muted);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-figures);
	}

	.mark {
		cursor: pointer;
		outline: none;
	}

	.mark-hit {
		fill: transparent;
		stroke: none;
		pointer-events: all;
	}

	.timeline-bar,
	.timeline-point {
		fill: var(--_mark-colour, var(--color-accent));
		/* A ground-coloured ring keeps overlapping marks legible. */
		stroke: var(--color-background);
		stroke-width: var(--border-width-medium);
		pointer-events: none;
		transition: stroke var(--duration-fast) var(--ease-out);
	}

	.mark:hover .timeline-bar,
	.mark:hover .timeline-point {
		stroke: var(--color-text-emphasis);
	}

	.mark.selected .timeline-bar,
	.mark.selected .timeline-point {
		stroke: var(--color-accent);
	}

	.mark:focus-visible .mark-hit {
		stroke: var(--color-accent);
		stroke-width: var(--border-width-medium);
	}

	/* The plate is the only thing that scrolls sideways in the route's single
	   scroller; the apparatus below it stays put at the left edge. */
	.detail-slot,
	.timeline-key {
		position: sticky;
		left: 0;
	}

	/* Key to the mark forms */
	.timeline-key {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm) var(--space-xl);
		padding-top: var(--space-md);
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.key-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.key-mark {
		display: block;
		fill: var(--color-primary);
	}

	.key-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}

	.key-note {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 200px;
	}

	@media (--md-down) {
		.timeline-key {
			gap: var(--space-2) var(--space-md);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.timeline-bar,
		.timeline-point {
			transition: none !important;
		}
	}
</style>
