<script lang="ts">
	import RangeSlider from './RangeSlider.svelte';

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

<div class="filter-section-content glass-panel-light">
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
	.filter-section-content {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-4);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.filter-section-content:hover {
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-white-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-md);
		transform: var(--transform-lift-sm);
	}

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
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0;
		padding-bottom: var(--spacing-2);
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-accent-rgb), var(--opacity-medium));
		flex-shrink: 0;
	}

	.range-display {
		display: flex;
		align-items: center;
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid
			rgba(var(--color-surface-rgb), var(--opacity-medium-high));
		border-radius: var(--border-radius-md);
		padding: var(--spacing-2) var(--spacing-3);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		box-shadow: var(--shadow-sm);
	}

	.range-display:hover {
		border-color: rgba(var(--color-accent-rgb), var(--opacity-medium-high));
		background: rgba(var(--color-accent-rgb), var(--opacity-medium));
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.range-text {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		line-height: 1;
		white-space: nowrap;
	}

	.slider-container {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: var(--spacing-2) 0 var(--spacing-4);
		margin-top: var(--spacing-2);
		position: relative;
		overflow: visible;
		min-height: 60px;
	}

	.no-data-message {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-4);
		background: transparent;
		border: var(--border-width-thin) dashed var(--color-border);
		border-radius: var(--border-radius);
		color: var(--color-text-light);
		font-style: italic;
		font-size: var(--font-size-sm);
	}

	/* Dark mode overrides using design system variables */
	:global(html.dark) .filter-section-content {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
		box-shadow:
			0 8px 32px 0 rgba(var(--color-black-rgb), var(--opacity-medium)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-low));
	}

	:global(html.dark) .range-display {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-white-rgb), var(--opacity-low));
	}

	:global(html.dark) .range-display:hover {
		background: rgba(var(--color-accent-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-accent-rgb), var(--opacity-medium-high));
	}

	:global(html.dark) .slider-container {
		background: transparent;
		border: none;
	}

	:global(html.dark) .no-data-message {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-white-rgb), var(--opacity-low));
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
		--range-float-text: var(--color-white);
		margin-bottom: var(--spacing-2) !important;
	}

	:global(.rangeSlider .rangeHandle) {
		box-shadow: var(--shadow-md);
		transition: all var(--anim-duration-fast) var(--anim-ease-out);
	}

	:global(.rangeSlider .rangeHandle:hover) {
		transform: scale(var(--scale-110));
		box-shadow: var(--shadow-lg);
	}

	:global(.rangeSlider .rangeFloat) {
		border-radius: var(--border-radius);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-xs);
		box-shadow: var(--shadow-sm);
	}

	/* Ensure pip labels (years) have adequate space */
	:global(.rangeSlider .rangePips) {
		margin-bottom: var(--spacing-2) !important;
	}

	:global(.rangeSlider .pip) {
		font-size: var(--font-size-xs);
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	:global(.rangeSlider .pip.first),
	:global(.rangeSlider .pip.last) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.filter-section-content {
			padding: var(--spacing-3);
		}

		.filter-section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-2);
		}

		.range-display {
			padding: var(--spacing-1) var(--spacing-2);
		}

		.range-text {
			font-size: var(--font-size-xs);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-section-content,
		.range-display {
			transition: none;
		}

		.range-display:hover {
			transform: none;
		}

		:global(.rangeSlider .rangeHandle) {
			transition: none;
		}

		:global(.rangeSlider .rangeHandle:hover) {
			transform: none;
		}
	}
</style>
