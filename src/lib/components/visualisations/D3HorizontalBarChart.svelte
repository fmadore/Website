<script lang="ts">
    import { scaleLinear, scaleBand } from 'd3-scale';
    import { onDestroy, onMount } from 'svelte';

    // Props
    type DataItem = $$Generic; // Allows flexible data types
    let {
        data = [] as DataItem[],
        xAccessor, // Accessor for the value (length of the bar)
        yAccessor, // Accessor for the category (label on y-axis)
        xAxisLabel = '',
        yAxisLabel = '',
        barColor = 'var(--color-highlight, orange)' // Different default color
    }: {
        data?: DataItem[];
        xAccessor: (d: DataItem) => number;
        yAccessor: (d: DataItem) => string | number;
        xAxisLabel?: string;
        yAxisLabel?: string;
        barColor?: string;
    } = $props();

    // Dimensions
    let width = $state(500);
    let height = $state(300);
    const margins = { top: 20, right: 30, bottom: 50, left: 150 }; // Adjusted for longer y-axis labels

    let svgElement: SVGSVGElement | undefined;

    // Tooltip State
    let tooltipVisible = $state(false);
    let tooltipContent = $state('');
    let tooltipTop = $state(0);
    let tooltipLeft = $state(0);
    const tooltipOffsetX = 10;
    const tooltipOffsetY = 10;

    // Dynamic text color for axes
    let axisTextColor = $state('var(--color-text-light)');

    // Derived values
    const innerWidth = $derived(width - margins.left - margins.right);
    const innerHeight = $derived(height - margins.top - margins.bottom);

    const yScale = $derived(
        scaleBand<string | number>()
            .domain(data.map(yAccessor))
            .range([0, innerHeight])
            .padding(0.2)
    );

    const xScale = $derived(
        scaleLinear()
            .domain([0, Math.max(10, ...data.map(xAccessor))])
            .range([0, innerWidth])
    );

    const xTicks = $derived(xScale.ticks(5));

    // Observers
    let resizeObserver: ResizeObserver;
    let themeObserver: MutationObserver;

    onMount(() => {
        if (svgElement && svgElement.parentElement) {
            width = svgElement.parentElement.clientWidth;
            height = svgElement.parentElement.clientHeight || 300;

            resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    width = entry.contentRect.width;
                    height = entry.contentRect.height;
                }
            });
            resizeObserver.observe(svgElement.parentElement);
        }

        const updateTextColor = () => {
            axisTextColor = document.documentElement.classList.contains('dark')
                ? 'var(--color-text)'
                : 'var(--color-text-light)';
        };
        updateTextColor();

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

    // Tooltip Handlers
    function showTooltip(event: MouseEvent | FocusEvent, d: DataItem) {
        tooltipVisible = true;
        tooltipContent = `<strong>${yAccessor(d)}</strong><br/>${xAxisLabel || 'Value'}: ${xAccessor(d)}`;
        if (event instanceof MouseEvent) {
            tooltipLeft = event.clientX + tooltipOffsetX;
            tooltipTop = event.clientY + tooltipOffsetY;
        } else if (event.currentTarget instanceof Element) {
            const rect = event.currentTarget.getBoundingClientRect();
            tooltipLeft = rect.right + tooltipOffsetX; 
            tooltipTop = rect.top + rect.height / 2 + tooltipOffsetY;
        }
    }

    function handleMouseMove(event: MouseEvent) {
        if (tooltipVisible && event instanceof MouseEvent) {
            tooltipLeft = event.clientX + tooltipOffsetX;
            tooltipTop = event.clientY + tooltipOffsetY;
        }
    }

    function hideTooltip() {
        tooltipVisible = false;
    }

</script>

<div class="d3-chart-container">
    <svg bind:this={svgElement} {width} {height}>
        <g transform="translate({margins.left}, {margins.top})">
            <!-- X Axis (Values) -->
            <g class="axis x-axis" transform="translate(0, {innerHeight})">
                {#each xTicks as tickValue}
                    <g class="tick" transform="translate({xScale(tickValue)}, 0)">
                        <line y2="6" stroke={axisTextColor} />
                        <text y="9" dy=".71em" text-anchor="middle" fill={axisTextColor}>
                            {tickValue}
                        </text>
                    </g>
                {/each}
                <line x1="0" y1="0" x2={innerWidth} y2="0" stroke={axisTextColor} />
                {#if xAxisLabel}
                    <text class="axis-label" x={innerWidth / 2} y={margins.bottom - 10} text-anchor="middle" fill={axisTextColor}>
                        {xAxisLabel}
                    </text>
                {/if}
            </g>

            <!-- Y Axis (Categories) -->
            <g class="axis y-axis">
                {#each yScale.domain() as tickValue}
                    <g class="tick" transform="translate(0, {(yScale(tickValue) ?? 0) + yScale.bandwidth() / 2})">
                        <text x="-9" dy=".32em" text-anchor="end" fill={axisTextColor}>
                            {tickValue}
                        </text>
                    </g>
                {/each}
                <line y1="0" x1="0" y2={innerHeight} x2="0" stroke={axisTextColor} />
            </g>

            <!-- Bars -->
            <g class="bars">
                {#each data as d (yAccessor(d))}
                    <rect
                        x={xScale(0)}
                        y={yScale(yAccessor(d))}
                        width={xScale(xAccessor(d))}
                        height={yScale.bandwidth()}
                        fill={barColor}
                        onmouseenter={(e) => showTooltip(e, d)}
                        onmousemove={handleMouseMove}
                        onmouseleave={hideTooltip}
                        role="button"
                        aria-label={`Bar for ${yAccessor(d)}: ${xAccessor(d)}`}
                        tabindex="0"
                        onfocus={(e) => showTooltip(e, d)}
                        onblur={hideTooltip}
                    />
                {/each}
            </g>
        </g>
    </svg>
    {#if tooltipVisible}
        <div class="custom-tooltip" style="position: fixed; top: {tooltipTop}px; left: {tooltipLeft}px;">
            {@html tooltipContent}
        </div>
    {/if}
</div>

<style>
    .d3-chart-container {
        width: 100%;
        height: 100%; /* Make it flexible to parent */
        min-height: 350px; /* Or a specific min-height */
        display: block;
        position: relative;
    }
    svg {
        display: block;
        overflow: visible;
    }
    .axis text, .axis-label {
        font-size: var(--font-size-sm, 0.875rem);
    }
    .bars rect {
        transition: fill 0.2s ease-in-out;
    }
    .bars rect:hover {
        fill: var(--color-primary-dark); /* Consider a different hover for highlight */
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
        pointer-events: none;
        z-index: var(--z-index-tooltip, 1070);
        box-shadow: var(--box-shadow-lg);
        white-space: nowrap;
        transition: opacity 0.1s ease-out;
    }
</style> 