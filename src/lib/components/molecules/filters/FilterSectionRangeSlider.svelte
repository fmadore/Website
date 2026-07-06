<script lang="ts">
	import RangeSlider from '$lib/components/atoms/RangeSlider.svelte';

	// Simple debounce function
	function debounce<T extends (...args: never[]) => void>(
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
		resetRange, // Function to clear the range filter
		onchange = undefined // Optional callback prop for range changes
	}: {
		title: string;
		allYears: number[];
		activeRange: { min: number; max: number } | null;
		updateRange: (min: number, max: number) => void;
		resetRange: () => void;
		onchange?: ((event: { min: number; max: number } | null) => void) | undefined;
	} = $props();

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
		// Check if the new range differs from the full extent
		const isRangeChanged = newMin !== minYear || newMax !== maxYear;

		if (isRangeChanged) {
			// Update the filter with the new range
			updateRange(newMin, newMax);
			onchange?.({ min: newMin, max: newMax });
		} else if (activeRange !== null) {
			// User slid back to full range - clear the filter
			resetRange();
			onchange?.(null);
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
		<span class="range-display">{displayRange}</span>
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
	/* Base styles provided by src/styles/components/filters.css */

	/* Range read-out as quiet mono text, pushed to the right of the label —
	 * no tinted pill. */
	.range-display {
		margin-left: auto;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		color: var(--color-text-soft);
	}

	.slider-container {
		padding: var(--space-sm) 0 var(--space-lg);
		position: relative;
		overflow: visible;
		min-height: 50px;
	}

	.no-data-message {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		border: var(--border-width-thin) dashed var(--color-border);
		border-radius: 0;
		color: var(--color-text-muted);
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
	}

	/* Global range slider styling */
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
		--range-float-text: var(--color-text-inverted);
		margin-bottom: var(--space-xs) !important;
	}

	/* The handle stays round (a slider thumb reads better circular) but sheds
	 * its shadow and scale-on-hover — the redesign keeps controls flat and still. */
	:global(.rangeSlider .rangeHandle) {
		box-shadow: none;
	}

	/* Float read-out — square, mono, the data voice. */
	:global(.rangeSlider .rangeFloat) {
		border-radius: 0;
		font-family: var(--font-family-mono);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-2xs);
	}

	:global(.rangeSlider .rangePips) {
		margin-bottom: var(--space-xs) !important;
	}

	:global(.rangeSlider .pip) {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	:global(.rangeSlider .pip.first),
	:global(.rangeSlider .pip.last) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
	}

	/* Responsive slider adjustments */
	@media (--sm-down) {
		.range-display {
			font-size: var(--font-size-xs);
		}

		.slider-container {
			padding: var(--space-xs) 0 var(--space-md);
			min-height: var(--space-10);
		}
	}

	/* Respect user motion preferences — the handle no longer animates, so
	 * there is nothing to disable here. */
</style>
