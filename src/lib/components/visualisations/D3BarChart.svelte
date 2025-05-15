<script lang="ts">
    import { scaleLinear, scaleBand } from 'd3-scale';
    import { onDestroy, onMount } from 'svelte';

    // Props
    type DataItem = $$Generic; // Allows flexible data types
    let {
        data = [] as DataItem[], // Default to an empty array if not provided
        xAccessor,
        yAccessor,
        xAxisLabel = '',
        yAxisLabel = '',
        barColor = 'var(--color-primary, steelblue)'
    }: {
        data?: DataItem[];
        xAccessor: (d: DataItem) => string | number;
        yAccessor: (d: DataItem) => number;
        xAxisLabel?: string;
        yAxisLabel?: string;
        barColor?: string;
    } = $props();

    // Dimensions - reactive to container size
    let width = $state(500);
    let height = $state(300); // Default height, can be adjusted via CSS on the container
    
    const margins = { top: 20, right: 20, bottom: 50, left: 60 }; // Adjusted for labels

    let svgElement: SVGSVGElement | undefined;

    // Tooltip State
    let tooltipVisible = $state(false);
    let tooltipContent = $state('');
    let tooltipTop = $state(0);
    let tooltipLeft = $state(0);
    const tooltipOffsetX = 10; // Offset from cursor or element edge
    const tooltipOffsetY = 10;

    // Dynamic text color for axes
    let axisTextColor = $state('var(--color-text-light)'); // Default for light mode

    // Derived values for chart rendering
    const innerWidth = $derived(width - margins.left - margins.right);
    const innerHeight = $derived(height - margins.top - margins.bottom);

    const xScale = $derived(
        scaleBand<string | number>()
            .domain(data.map(xAccessor))
            .range([0, innerWidth])
            .padding(0.2) // Padding between bars
    );

    const yScale = $derived(
        scaleLinear()
            .domain([0, Math.max(10, ...data.map(yAccessor))]) // Ensure domain starts at 0 and covers max data or at least 10
            .range([innerHeight, 0]) // Inverted for SVG y-coordinate
    );

    // For rendering ticks
    const yTicks = $derived(yScale.ticks(5)); // Aim for about 5 ticks

    // Responsive width
    let resizeObserver: ResizeObserver;
    let themeObserver: MutationObserver;

    onMount(() => {
        if (svgElement && svgElement.parentElement) {
            width = svgElement.parentElement.clientWidth; // Initial width
            height = svgElement.parentElement.clientHeight || 300; // Initial height or default

            resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    width = entry.contentRect.width;
                    height = entry.contentRect.height;
                }
            });
            resizeObserver.observe(svgElement.parentElement);
        }

        // Function to update text color based on theme
        const updateTextColor = () => {
            if (document.documentElement.classList.contains('dark')) {
                axisTextColor = 'var(--color-text)'; // Should be a light color from your variables.css
            } else {
                axisTextColor = 'var(--color-text-light)'; // Should be a dark color for light mode
            }
        };

        // Initial text color set
        updateTextColor();

        // Observe changes to the class attribute of the html element
        themeObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateTextColor();
                }
            }
        });

        themeObserver.observe(document.documentElement, { attributes: true });
    });

    onDestroy(() => {
        if (resizeObserver && svgElement && svgElement.parentElement) {
            resizeObserver.unobserve(svgElement.parentElement);
        }
        if (themeObserver) {
            themeObserver.disconnect();
        }
    });

    // Event Handlers for Tooltip
    function showTooltip(event: MouseEvent | FocusEvent, d: DataItem) {
        tooltipVisible = true;
        tooltipContent = `<strong>${xAccessor(d)}</strong><br/>${yAxisLabel || 'Value'}: ${yAccessor(d)}`;
        
        if (event instanceof MouseEvent) {
            tooltipLeft = event.clientX + tooltipOffsetX;
            tooltipTop = event.clientY + tooltipOffsetY;
        } else if (event.currentTarget instanceof Element) { // FocusEvent
            const rect = event.currentTarget.getBoundingClientRect();
            tooltipLeft = rect.left + rect.width / 2 + tooltipOffsetX; // Center of the bar + offset
            tooltipTop = rect.top + tooltipOffsetY;
        }
    }

    function handleMouseMove(event: MouseEvent) {
        if (tooltipVisible && event instanceof MouseEvent) { // Only update if it was originally a mouse event based positioning
            tooltipLeft = event.clientX + tooltipOffsetX;
            tooltipTop = event.clientY + tooltipOffsetY;
        }
    }

    function hideTooltip() {
        tooltipVisible = false;
    }

</script>

<div class="d3-chart-container">
    <svg bind:this={svgElement} width={width} height={height}>
        <g transform="translate({margins.left}, {margins.top})">
            <!-- Y Axis -->
            <g class="axis y-axis">
                {#each yTicks as tickValue}
                    <g class="tick" transform="translate(0, {yScale(tickValue)})">
                        <line x2="-6" stroke={axisTextColor} />
                        <text dy=".32em" x="-9" text-anchor="end" fill={axisTextColor}>
                            {tickValue}
                        </text>
                    </g>
                {/each}
                <line y1={innerHeight} x1="0" y2="0" x2="0" stroke={axisTextColor} />
                 {#if yAxisLabel}
                    <text
                        class="axis-label"
                        transform="rotate(-90)"
                        y="-45" 
                        x={-innerHeight / 2}
                        dy="1em"
                        text-anchor="middle"
                        fill={axisTextColor}
                    >
                        {yAxisLabel}
                    </text>
                {/if}
            </g>

            <!-- X Axis -->
            <g class="axis x-axis" transform="translate(0, {innerHeight})">
                {#each xScale.domain() as tickValue}
                    <g class="tick" transform="translate({(xScale(tickValue) ?? 0) + xScale.bandwidth() / 2}, 0)">
                        <line y2="6" stroke={axisTextColor} />
                        <text y="9" dy=".71em" text-anchor="middle" fill={axisTextColor}>
                            {tickValue}
                        </text>
                    </g>
                {/each}
                 <line x1="0" y1="0" x2={innerWidth} y2="0" stroke={axisTextColor} />
                 {#if xAxisLabel}
                    <text
                        class="axis-label"
                        x={innerWidth / 2}
                        y={margins.bottom - 10}
                        text-anchor="middle"
                        fill={axisTextColor}
                    >
                        {xAxisLabel}
                    </text>
                {/if}
            </g>

            <!-- Bars -->
            <g class="bars">
                {#each data as d}
                    <rect
                        x={xScale(xAccessor(d))}
                        y={yScale(yAccessor(d))}
                        width={xScale.bandwidth()}
                        height={innerHeight - yScale(yAccessor(d))}
                        fill={barColor}
                        onmouseenter={(e) => showTooltip(e, d)}
                        onmousemove={handleMouseMove}
                        onmouseleave={hideTooltip}
                        role="button"
                        aria-label={`Bar for ${xAccessor(d)}: ${yAccessor(d)}`}
                        tabindex="0"
                        onfocus={(e) => showTooltip(e, d)}
                        onblur={hideTooltip}
                    >
                        <!-- <title>{xAccessor(d)}: {yAccessor(d)}</title> --> 
                    </rect>
                {/each}
            </g>
        </g>
    </svg>
    {#if tooltipVisible}
        <div 
            class="custom-tooltip"
            style="position: fixed; top: {tooltipTop}px; left: {tooltipLeft}px;"
        >
            {@html tooltipContent}
        </div>
    {/if}
</div>

<style>
    .d3-chart-container {
        width: 100%;
        height: 350px; /* Default height, can be overridden */
        display: block;
        position: relative; /* Context for potential absolute positioning if not using fixed tooltip */
    }
    svg {
        display: block; /* Remove extra space below SVG */
        overflow: visible; /* Allow labels outside main plotting area if needed */
    }
    .axis text, .axis-label {
        font-size: var(--font-size-sm, 0.875rem);
        /* fill: var(--color-text-default, #333); */ /* Replaced by dynamic fill */
    }
    .bars rect {
        transition: fill 0.2s ease-in-out;
    }
    .bars rect:hover {
        fill: var(--color-primary-dark, darkblue); /* Use a darker shade on hover */
    }
    .axis-label {
        font-weight: var(--font-weight-medium, 500);
    }

    .custom-tooltip {
        background-color: var(--color-background-tooltip, rgba(20, 20, 20, 0.9));
        color: var(--color-text-tooltip, white);
        padding: var(--spacing-2) var(--spacing-3);
        border-radius: var(--border-radius-md, 6px);
        font-size: var(--font-size-sm, 0.875rem);
        pointer-events: none; /* Important: so it doesn't block mouse events on elements underneath */
        z-index: var(--z-index-tooltip, 1070); /* Ensure it's above other elements */
        box-shadow: var(--box-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05));
        white-space: nowrap; /* Prevent content from wrapping unexpectedly */
        transition: opacity 0.1s ease-out; /* Optional: for fade effect if #if wasn't immediate */
    }
</style> 