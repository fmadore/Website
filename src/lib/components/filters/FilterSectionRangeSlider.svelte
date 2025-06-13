<script lang="ts">
	import RangeSlider from '../panels/RangeSlider.svelte';
	import { createEventDispatcher } from 'svelte';


	// Simple debounce function
	function debounce<T extends (...args: any[]) => any>(
		func: T,
		wait: number
	): (...args: Parameters<T>) => void {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		return (...args: Parameters<T>): void => {
			const later = () => {
				timeout = null;
				func(...args);
			};
			if (timeout !== null) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(later, wait);
		};
	}

	let {
		title,
		allYears, // All available years, sorted asc
		activeRange, // Current filter state
		updateRange, // Function to update the store
		resetRange // Function to clear the range filter
	}: {
		title: string;
		allYears: number[];
		activeRange: { min: number; max: number } | null;
		updateRange: (min: number, max: number) => void;
		resetRange: () => void;
	} = $props();

	const dispatch = createEventDispatcher();

	// Determine min and max from all available years
	const minYear = $derived(allYears.length > 0 ? allYears[0] : new Date().getFullYear() - 10); // Fallback min
	const maxYear = $derived(
		allYears.length > 0 ? allYears[allYears.length - 1] : new Date().getFullYear()
	); // Fallback max

	// Internal state for the slider values, initialized from activeRange or full range
	let sliderValues = $state<[number, number]>([0, 0]);

	// Update sliderValues when activeRange or year bounds change
	$effect(() => {
		if (activeRange) {
			sliderValues = [activeRange.min, activeRange.max];
		} else {
			sliderValues = [minYear, maxYear]; // Default to full range if no active filter
		}
	}); // Flag to prevent initial update on component mount
	let isInitialized = $state(false);

	// Debounced version of the update logic (scroll preservation handled at sidebar level)
	const debouncedUpdate = debounce((newMin: number, newMax: number) => {
		// Only update the store if the range is not the full extent (or if it was already filtered)
		if (newMin !== minYear || newMax !== maxYear || activeRange !== null) {
			updateRange(newMin, newMax);
			dispatch('change', { min: newMin, max: newMax });
		} else if (activeRange !== null) {
			// If user slides back to full range, effectively reset the filter
			resetRange();
			dispatch('change', null);
		}
	}, 150); // Debounce by 150ms

	// Function to handle slider changes
	function handleSliderChange(event: CustomEvent<{ values: [number, number] }>) {
		if (!isInitialized) {
			isInitialized = true; // Set flag after first potential init
			// Prevent initial update if values match the full range and no active filter
			if (
				event.detail.values[0] === minYear &&
				event.detail.values[1] === maxYear &&
				activeRange === null
			) {
				// Update internal slider values but don't trigger external update yet
				sliderValues = event.detail.values;
				return;
			}
		}
		const [newMin, newMax] = event.detail.values;
		sliderValues = [newMin, newMax]; // Update internal state immediately for responsiveness

		// Call the debounced update function
		debouncedUpdate(newMin, newMax);
	}

	// Format the displayed range string
	const displayRange = $derived(
		activeRange ? `${activeRange.min} - ${activeRange.max}` : 'All Years'
	);
</script>

<div class="filter-section-content">
	<div class="filter-section-header">
		<h3 class="filter-section-title">{title}</h3>
		<div class="range-display">
			<span class="range-text">{displayRange}</span>
		</div>
	</div>
	{#if allYears.length > 0}
		<div class="slider-container">
			<RangeSlider
				bind:values={sliderValues}
				min={minYear}
				max={maxYear}
				step={1}
				pips
				pipstep={5}
				first="label"
				last="label"
				float
				onchange={handleSliderChange}
			/>
		</div>
	{:else}
		<div class="no-data-message">
			<span>No year data available</span>
		</div>
	{/if}
</div>

<style>
	.filter-section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-3);
		gap: var(--spacing-3);
	}

	.filter-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text-emphasis);
		margin: 0;
		padding-bottom: var(--spacing-2);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.range-display {
		display: flex;
		align-items: center;
		background: var(--color-surface-alt);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius);
		padding: var(--spacing-2) var(--spacing-3);
		transition: all 0.2s ease;
	}

	.range-display:hover {
		border-color: var(--color-primary);
	}

	.range-text {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text);
		line-height: 1;
		white-space: nowrap;
	}

	.slider-container {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: var(--spacing-4) 0 var(--spacing-8);
		margin-top: var(--spacing-2);
		position: relative;
		overflow: visible;
		min-height: 100px;
	}

	.no-data-message {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-4);
		background: transparent;
		border: 1px dashed var(--color-border);
		border-radius: var(--border-radius);
		color: var(--color-text-light);
		font-style: italic;
		font-size: var(--font-size-sm);
	}

	/* Dark mode enhancements */
	:global(html.dark) .range-display {
		background: linear-gradient(
			135deg,
			var(--color-surface) 0%,
			color-mix(in srgb, var(--color-surface) 85%, var(--color-primary) 15%) 100%
		);
		border-color: var(--color-border);
	}

	:global(html.dark) .slider-container {
		background: transparent;
		border: none;
	}

	:global(html.dark) .no-data-message {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	/* Global range slider styling enhancements */
	:global(.rangeSlider) {
		--range-slider: var(--color-border);
		--range-handle-inactive: var(--color-surface);
		--range-handle: var(--color-primary);
		--range-handle-focus: var(--color-primary);
		--range-handle-border: var(--color-primary);
		--range-range-inactive: var(--color-border);
		--range-range: var(--color-primary);
		--range-float-inactive: var(--color-surface-alt);
		--range-float: var(--color-primary);
		--range-float-text: var(--color-background);
		margin-bottom: var(--spacing-6) !important;
	}

	:global(.rangeSlider .rangeHandle) {
		box-shadow: var(--shadow-md);
		transition: all 0.2s ease;
	}

	:global(.rangeSlider .rangeHandle:hover) {
		transform: scale(1.1);
		box-shadow: var(--shadow-lg);
	}

	:global(.rangeSlider .rangeFloat) {
		border-radius: var(--border-radius);
		font-weight: 600;
		font-size: var(--font-size-xs);
		box-shadow: var(--shadow-sm);
	}

	/* Ensure pip labels (years) have adequate space */
	:global(.rangeSlider .rangePips) {
		margin-bottom: var(--spacing-4) !important;
	}

	:global(.rangeSlider .pip) {
		font-size: var(--font-size-xs);
		color: var(--color-text-light);
		font-weight: 500;
	}

	:global(.rangeSlider .pip.first),
	:global(.rangeSlider .pip.last) {
		font-weight: 600;
		color: var(--color-text);
	}
</style>
