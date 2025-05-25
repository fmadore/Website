<script lang="ts">
    import RangeSlider from 'svelte-range-slider-pips';
    import { createEventDispatcher } from 'svelte';

    // Simple debounce function
    function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
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
    const maxYear = $derived(allYears.length > 0 ? allYears[allYears.length - 1] : new Date().getFullYear()); // Fallback max

    // Internal state for the slider values, initialized from activeRange or full range
    let sliderValues = $state<[number, number]>([0, 0]);
    
    // Update sliderValues when activeRange or year bounds change
    $effect(() => {
        if (activeRange) {
            sliderValues = [activeRange.min, activeRange.max];
        } else {
            sliderValues = [minYear, maxYear]; // Default to full range if no active filter
        }
    });    // Flag to prevent initial update on component mount
    let isInitialized = $state(false);

    // Debounced version of the update logic
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
            if (event.detail.values[0] === minYear && event.detail.values[1] === maxYear && activeRange === null) {
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
    const displayRange = $derived(activeRange ? `${activeRange.min} - ${activeRange.max}` : 'All Years');

</script>

<div class="filter-section">
    <div class="flex justify-between items-center mb-2">
        <h3 class="text-dark font-weight-600">{title}</h3>
        <span class="text-sm text-light">{displayRange}</span>
    </div>
    {#if allYears.length > 0}
        <div class="slider-container pt-3 pb-1 px-2">
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
                on:change={handleSliderChange} 
            />
        </div>
    {:else}
        <p class="text-sm text-light">No year data available.</p>
    {/if}
</div>

<style>
    /* Scoped styles using CSS variables from global scope */
    .filter-section {
        margin-bottom: var(--spacing-6, 1.5rem);
    }

    .font-weight-600 {
        font-weight: var(--font-weight-semibold, 600);
    }

    .text-sm {
        font-size: var(--font-size-sm, 0.875rem);
    }

    .mb-2 {
        margin-bottom: var(--spacing-2, 0.5rem);
    }
    
    .pt-3 {
        padding-top: var(--spacing-3, 0.75rem);
    }

    .pb-1 {
        padding-bottom: var(--spacing-1, 0.25rem);
    }

    .px-2 {
        padding-left: var(--spacing-2, 0.5rem);
        padding-right: var(--spacing-2, 0.5rem);
    }

    .flex {
        display: flex;
    }

    .justify-between {
        justify-content: space-between;
    }

    .items-center {
        align-items: center;
    }

    /* Style overrides for the slider using theme variables */
    .slider-container :global(.rangeSlider) {
        height: 4px;
        background-color: var(--color-border); /* Use theme border color */
        border-radius: 2px;
    }

    .slider-container :global(.rangeHandle) {
        width: 16px;
        height: 16px;
        background-color: var(--color-primary); /* Use theme primary color */
        border-radius: 50%;
        box-shadow: none;
        border: none;
        top: -6px; /* Adjust vertical position */
    }
    
    .slider-container :global(.rangeHandle.active) {
         /* Use theme primary color with alpha for focus ring */
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    .slider-container :global(.rangeFloat) {
        background-color: var(--color-primary); /* Use theme primary color */
        color: white; /* Keep text white */
        padding: 2px 6px;
        font-size: var(--font-size-xs, 0.75rem);
        border-radius: 4px;
    }
    
    .slider-container :global(.rangePips) {
        margin-top: 10px;
    }

    .slider-container :global(.pip) {
        width: 1px;
        height: 5px;
        background-color: var(--color-text-light); /* Use theme light text color for pips */
        border: none;
        margin-left: -0.5px;
    }

    .slider-container :global(.pip.pip-large) {
        height: 8px;
    }

    .slider-container :global(.rangeLabel) {
        font-size: var(--font-size-xs, 0.75rem);
        color: var(--color-text-light); /* Use theme light text color for labels */
        margin-top: 4px;
    }
</style> 