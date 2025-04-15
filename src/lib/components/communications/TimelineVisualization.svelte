<script context="module" lang="ts">
    // Define the structure for timeline item data
    export type TimelineItemData = {
        id: string;
        title: string;
        year: number;
        // Add other optional fields as needed, e.g., activityType for styling
        activityType?: string;
    };
</script>

<script lang="ts">
    import { base } from '$app/paths'; // Import base path if needed for links

    export let itemsData: TimelineItemData[] = [];
    export let title: string = "Activity Timeline"; // Optional title for the component

    // Reactive sorting of items by year
    $: sortedItems = [...itemsData].sort((a, b) => a.year - b.year);

    // Find min and max year for timeline range
    $: minYear = sortedItems.length > 0 ? sortedItems[0].year : new Date().getFullYear() - 10;
    $: maxYear = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1].year : new Date().getFullYear();
    $: yearRange = maxYear - minYear;

    // Function to calculate horizontal position based on year
    function calculatePosition(year: number): number {
        if (yearRange <= 0) return 50; // Center if no range or single year
        // Ensure items don't overlap excessively at the ends by adding padding to the effective range
        const effectiveRange = yearRange + 2; // Add 1 year padding on each side
        const effectiveYear = year - minYear + 1; // Offset year by 1
        return (effectiveYear / effectiveRange) * 100;
    }
</script>

<div class="timeline-container">
    {#if title}
        <h3 class="timeline-title">{title}</h3>
    {/if}
    {#if sortedItems.length > 0}
        <div class="timeline-wrapper">
            <div class="timeline-axis"></div>
            {#each sortedItems as item (item.id)}
                <a href="{base}/communications/{item.id}"
                   class="timeline-item type-{item.activityType || 'default'}"
                   style="left: {calculatePosition(item.year)}%;"
                   title="{item.title} ({item.year})">
                    <div class="timeline-marker"></div>
                    <span class="timeline-item-tooltip">{item.title} ({item.year})</span>
                </a>
            {/each}
            <!-- Optional: Add year labels -->
            <div class="timeline-labels">
                 {#if yearRange >= 0}
                    <span class="timeline-label start" style="left: {calculatePosition(minYear)}%;">{minYear}</span>
                    {#if yearRange > 0}
                        <span class="timeline-label end" style="left: {calculatePosition(maxYear)}%;">{maxYear}</span>
                    {/if}
                 {/if}
                <!-- Add intermediate labels if needed -->
            </div>
        </div>
    {:else}
        <p class="timeline-empty">No timeline data available.</p>
    {/if}
</div>

<style>
    .timeline-container {
        width: 100%;
        padding: var(--spacing-4, 1rem);
        background-color: var(--color-background-secondary, #f9f9f9);
        border-radius: var(--border-radius-md, 4px);
        margin-top: var(--spacing-4, 1rem);
        box-sizing: border-box;
        position: relative; /* Needed for absolute positioning of items */
         overflow-x: auto; /* Allow horizontal scroll if content overflows */
         min-height: 150px; /* Ensure some minimum height */
         /* Add some horizontal padding to prevent items sticking to edges */
         padding-left: var(--spacing-6, 1.5rem); 
         padding-right: var(--spacing-6, 1.5rem);
         padding-bottom: var(--spacing-6, 1.5rem); /* Space for labels */
    }

    .timeline-title {
        text-align: center;
        margin-bottom: var(--spacing-8, 2rem); /* Increased spacing */
        color: var(--color-text);
        font-size: var(--font-size-lg, 1.125rem);
    }

    .timeline-wrapper {
        position: relative;
        width: 100%;
        height: 60px; /* Height for the main timeline area */
        margin-top: var(--spacing-4, 1rem);
        box-sizing: border-box;
    }

    .timeline-axis {
        position: absolute;
        top: 50%;
        left: 0; /* Use padding of container */
        right: 0; /* Use padding of container */
        height: 3px; /* Slightly thicker axis */
        background-color: var(--color-border-subtle, #ddd); /* Lighter border */
        transform: translateY(-50%);
        z-index: 1;
         border-radius: 2px;
    }

    .timeline-item {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%); /* Center the item horizontally and vertically */
        z-index: 3; /* Above axis and labels */
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        text-decoration: none;
    }

    .timeline-marker {
        width: 14px; /* Slightly larger */
        height: 14px;
        background-color: var(--color-primary); /* Default color */
        border-radius: 50%;
        border: 2px solid var(--color-background-secondary, #f9f9f9); /* Allows seeing axis through */
        transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2); /* Add subtle shadow */
    }
    
    /* Type-specific colors - use same variables as map */
    .timeline-item.type-lecture .timeline-marker {
        background-color: var(--color-accent);
    }
    .timeline-item.type-event .timeline-marker {
         background-color: var(--color-highlight);
    }
     /* Add other types if needed */
     /* .timeline-item.type-workshop .timeline-marker { background-color: var(--color-success); } */

    .timeline-item:hover .timeline-marker {
        transform: scale(1.5); /* Slightly larger hover scale */
         border-color: var(--color-background, #fff); /* Brighter border on hover */
    }

    .timeline-item-tooltip {
        position: absolute;
        bottom: 100%; /* Position above the marker */
        left: 50%;
        transform: translateX(-50%) translateY(-8px); /* Center and add slightly more gap */
        background-color: var(--color-background-tooltip, rgba(0, 0, 0, 0.85)); /* Slightly darker tooltip */
        color: var(--color-text-tooltip, white);
        padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
        border-radius: var(--border-radius-sm, 3px);
        font-size: var(--font-size-xs, 0.75rem);
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out, transform 0.2s ease-in-out;
        z-index: 10;
        pointer-events: none; /* Allow hover over marker */
    }

    .timeline-item:hover .timeline-item-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(-12px); /* Move up slightly more on hover */
    }

    .timeline-labels {
        position: absolute;
        top: calc(50% + 20px); /* Position labels below the axis */
        left: 0;
        right: 0;
        height: 20px;
        box-sizing: border-box;
        z-index: 2; /* Above axis, below items */
        pointer-events: none; /* Don't interfere with item clicks */
    }

    .timeline-label {
        position: absolute;
        top: 0;
        transform: translateX(-50%); /* Center the label text */
        font-size: var(--font-size-xs, 0.75rem);
        color: var(--color-text-light, #777);
        background: var(--color-background-secondary, #f9f9f9); /* Help label stand out if axis is behind */
        padding: 0 3px;
    }
    
    /* Adjust positioning for start/end labels */
    .timeline-label.start {
        transform: translateX(-5%); /* Pull start label slightly left */
    }
    .timeline-label.end {
        transform: translateX(-95%); /* Pull end label slightly right */
    }

    /* Special handling if only one year */
    .timeline-label.start:only-child {
         transform: translateX(-50%); /* Center if only one label */
    }

    .timeline-empty {
        text-align: center;
        color: var(--color-text-light, #777);
        padding: var(--spacing-4, 1rem);
        min-height: 80px; /* Ensure container has height even when empty */
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style> 