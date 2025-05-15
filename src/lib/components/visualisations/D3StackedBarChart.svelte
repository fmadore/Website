<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	type DataPoint = {
		year: number;
		total: number;
		[key: string]: number; // For publication types
	};

	const {
		data,
		keys, // publication types for stacking
		xAccessor = (d: DataPoint) => d.year,
		xAxisLabel = '',
		yAxisLabel = 'Count',
		barColors = d3.schemeTableau10 // Default color scheme
	} = $props<{
		data: DataPoint[];
		keys: string[];
		xAccessor?: (d: DataPoint) => number | string;
		xAxisLabel?: string;
		yAxisLabel?: string;
		barColors?: readonly string[];
	}>();

	let el: HTMLDivElement | undefined = $state();
	let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
	let width = $state(500);
	let height = $state(300); // Will be updated by ResizeObserver
	const marginTop = 20;
	const marginRight = 20;
	// Restore original marginBottom logic, it's for the chart's plotting area
	// Legend and X-axis label will be placed relative to this, within the SVG's total height
	const marginBottom = $derived(xAxisLabel ? 65 : 45);

	const marginLeft = $derived(yAxisLabel ? 60 : 40);

	let tooltipVisible = $state(false);
	let tooltipContent = $state('');
	let tooltipLeft = $state(0);
	let tooltipTop = $state(0);
	const tooltipOffsetX = 10;
	const tooltipOffsetY = 10;

	let axisTextColor = $state('var(--color-text-light)');

	function updateAxisTextColor() {
		if (document.documentElement.classList.contains('dark')) {
			axisTextColor = 'var(--color-text)';
		} else {
			axisTextColor = 'var(--color-text-light)';
		}
	}

	function showTooltip(
		event: MouseEvent | FocusEvent,
		content: string
	) {
		tooltipContent = content;
		tooltipVisible = true;
		
		if (event instanceof MouseEvent) {
			tooltipLeft = event.clientX + tooltipOffsetX;
			tooltipTop = event.clientY + tooltipOffsetY;
		} else if (event.currentTarget instanceof Element) {
			const rect = event.currentTarget.getBoundingClientRect();
			tooltipLeft = rect.left + rect.width / 2 + window.scrollX - el!.getBoundingClientRect().left + tooltipOffsetX;
			tooltipTop = rect.top + window.scrollY - el!.getBoundingClientRect().top - 30 + tooltipOffsetY;
		}
	}

	function moveTooltip(event: MouseEvent) {
		if (tooltipVisible && event instanceof MouseEvent) {
			tooltipLeft = event.clientX + tooltipOffsetX;
			tooltipTop = event.clientY + tooltipOffsetY;
		}
	}

	function hideTooltip() {
		tooltipVisible = false;
	}


	function drawChart() {
		if (!svg || !data || data.length === 0 || keys.length === 0) {
			if (svg) svg.selectAll('*').remove();
			return;
		}

		svg.selectAll('*').remove();

		const processedData = data.map((d: DataPoint) => ({
			...d,
			year: +d.year
		}));

		const stack = d3.stack<DataPoint, string>().keys(keys);
		const series = stack(processedData);
		const keysWithData = keys.filter((key: string) => processedData.some((d: DataPoint) => d[key] > 0));

		// Legend layout constants
		const legendRectSize = 15;
		const legendTextOffsetX = 5;
		const legendSlotWidth = 120; 
		const legendHorizontalItemSpacing = 10;
		const legendVerticalSpacing = 5;
		const legendItemRowHeight = 20;

		// Calculate number of legend rows and total legend height
		let numLegendRows = 0;
		let tempLegendX = 0;
		const availableWidthForLegendRow = width - marginLeft - marginRight;

		if (keysWithData.length > 0) {
			numLegendRows = 1;
			keysWithData.forEach(() => {
				if (tempLegendX > 0 && tempLegendX + legendSlotWidth > availableWidthForLegendRow) {
					tempLegendX = 0;
					numLegendRows++;
				}
				tempLegendX += legendSlotWidth + legendHorizontalItemSpacing;
			});
		}
		const totalLegendVisualHeight = numLegendRows > 0 ? (numLegendRows * legendItemRowHeight) + Math.max(0, numLegendRows - 1) * legendVerticalSpacing : 0;

		// Define space needed for X-axis (ticks and optional label)
		const xAxisTickLabelHeight = 20;
		const xAxisTitleHeight = xAxisLabel ? 25 : 0; 
		const spaceForXAxis = xAxisTickLabelHeight + xAxisTitleHeight;
		
		const paddingBelowXAxis = totalLegendVisualHeight > 0 ? 15 : 0; // Increased padding

		// This is the margin for the D3 plot area at the bottom
		const finalPlotMarginBottom = spaceForXAxis + paddingBelowXAxis + totalLegendVisualHeight;

		// Scales
		const xDomain = processedData.map(xAccessor);
		const xScale = d3
			.scaleBand()
			.domain(xDomain.map(String))
			.range([marginLeft, width - marginRight])
			.padding(0.1);

		const yMax = d3.max(series, (s) => d3.max(s, (d) => d[1])) || 0;
		const yScale = d3
			.scaleLinear()
			.domain([0, yMax])
			.nice()
			.range([height - finalPlotMarginBottom, marginTop]); // Use dynamic bottom margin

		const colorScale = d3.scaleOrdinal<string>().domain(keys).range(barColors);

		// X-axis Tick Values Logic
		const allOriginalXTickValues = xScale.domain().map(String); // Years
		const tickLabelEstimatedWidth = 40; // px, estimated width for a year label + padding
		const availableWidthForXAxisLabels = width - marginLeft - marginRight;

		let xTicksToDisplay = allOriginalXTickValues;

		if (availableWidthForXAxisLabels > 0 && allOriginalXTickValues.length > 0) {
			const maxFitLabels = Math.max(1, Math.floor(availableWidthForXAxisLabels / tickLabelEstimatedWidth));

			if (allOriginalXTickValues.length > maxFitLabels) {
				if (maxFitLabels === 1 && allOriginalXTickValues.length > 1) {
					xTicksToDisplay = [allOriginalXTickValues[0]];
					if (allOriginalXTickValues[allOriginalXTickValues.length - 1] !== allOriginalXTickValues[0]) {
						xTicksToDisplay.push(allOriginalXTickValues[allOriginalXTickValues.length - 1]);
					}
				} else {
					const stride = Math.ceil(allOriginalXTickValues.length / maxFitLabels);
					const tempSet = new Set<string>();
					// Always include the first and last tick values
					if (allOriginalXTickValues.length > 0) {
						tempSet.add(allOriginalXTickValues[0]);
						tempSet.add(allOriginalXTickValues[allOriginalXTickValues.length - 1]);
					}
					// Add intermediate ticks based on stride
					for (let i = 0; i < allOriginalXTickValues.length; i++) {
						if (i % stride === 0) {
							tempSet.add(allOriginalXTickValues[i]);
						}
					}
					xTicksToDisplay = Array.from(tempSet).sort((a, b) => Number(a) - Number(b));
				}
			}
		} else if (allOriginalXTickValues.length > 0) { // Not enough width or no width data, show first & last
			xTicksToDisplay = [allOriginalXTickValues[0]];
			if (allOriginalXTickValues.length > 1 && allOriginalXTickValues[0] !== allOriginalXTickValues[allOriginalXTickValues.length - 1]) {
				xTicksToDisplay.push(allOriginalXTickValues[allOriginalXTickValues.length - 1]);
			}
		} else {
			xTicksToDisplay = [];
		}
		x#
		const d3XAxisTickValues = xTicksToDisplay.length > 0 ? xTicksToDisplay : null;

		// X-axis
		const xAxisD3 = d3.axisBottom(xScale)
		    .tickSizeOuter(0);
		if (d3XAxisTickValues) {
		    xAxisD3.tickValues(d3XAxisTickValues);
		} // If null, D3 will use its default tick generation which is fine

		const xAxisGroup = svg
			.append('g')
			.attr('class', 'x-axis')
			.attr('transform', `translate(0,${height - finalPlotMarginBottom})`)
			.call(xAxisD3);
		
		xAxisGroup.selectAll('text')
			.style('fill', axisTextColor)
			.style('font-size', 'var(--font-size-xs, 0.75rem)');
		xAxisGroup.selectAll('.domain, .tick line').style('stroke', axisTextColor);


		// Y-axis
		const numTicks = Math.min(Math.ceil(yScale.domain()[1]), 6);
		const yAxisD3 = d3.axisLeft(yScale).ticks(numTicks > 1 ? numTicks : 2).tickFormat(d3.format('d'));
		const yAxisGroup = svg
			.append('g')
			.attr('class', 'y-axis')
			.attr('transform', `translate(${marginLeft},0)`)
			.call(yAxisD3);

		yAxisGroup.selectAll('text')
			.style('fill', axisTextColor)
			.style('font-size', 'var(--font-size-xs, 0.75rem)');
		yAxisGroup.selectAll('.domain, .tick line').style('stroke', axisTextColor);


		// X-axis label
		if (xAxisLabel) {
			svg
				.append('text')
				.attr('class', 'x-axis-label axis-label')
				.attr('text-anchor', 'middle')
				.attr('x', marginLeft + (width - marginLeft - marginRight) / 2)
				.attr('y', height - finalPlotMarginBottom + xAxisTickLabelHeight + (xAxisTitleHeight > 0 ? (xAxisTitleHeight - 5) : 0)) // Adjusted y
				.style('fill', axisTextColor)
				.style('font-size', 'var(--font-size-sm, 0.875rem)') 
                .style('font-weight', 'var(--font-weight-medium, 500)')
				.text(xAxisLabel);
		}

		// Y-axis label
		if (yAxisLabel) {
			svg
				.append('text')
				.attr('class', 'y-axis-label axis-label')
				.attr('text-anchor', 'middle')
				.attr('transform', 'rotate(-90)')
				.attr('x', -( (height - finalPlotMarginBottom - marginTop) / 2 + marginTop) )
				.attr('y', marginLeft - (yAxisLabel.length > 20 ? 50 : 45) ) // Adjust based on typical label length
				.style('fill', axisTextColor)
				.style('font-size', 'var(--font-size-sm, 0.875rem)')
                .style('font-weight', 'var(--font-weight-medium, 500)')
				.text(yAxisLabel);
		}

		// Draw bars (series and rects logic remains largely the same)
		const serieGroups = svg
			.append('g')
			.selectAll<SVGGElement, d3.Series<DataPoint, string>>('g')
			.data(series)
			.join('g')
			.attr('fill', (d) => colorScale(d.key))
			.attr('role', 'list') 
			.attr('aria-label', (d) => `Publication type: ${d.key}`);

		serieGroups
			.selectAll<SVGRectElement, d3.SeriesPoint<DataPoint>>('rect')
			.data((d) => d) 
			.join('rect')
			.attr('x', (d, i) => xScale(String(xAccessor(d.data))) ?? 0)
			.attr('y', (d) => yScale(d[1]))
			.attr('height', (d) => Math.max(0, yScale(d[0]) - yScale(d[1])))
			.attr('width', xScale.bandwidth())
			.attr('role', 'button') 
			.attr('tabindex', '0')
			.attr('aria-label', (d) => {
				const year = xAccessor(d.data);
				// Correctly find the series key for the aria-label
                const seriesDataItem = series.find(s => s.some(p => p.data === d.data && p[0] === d[0] && p[1] === d[1]));
                const seriesKey = seriesDataItem ? seriesDataItem.key : "Unknown";
				const count = d.data[seriesKey] || (d[1]-d[0]); // Fallback to calculated stack height if key not found
				return `Year: ${year}, Type: ${seriesKey}, Count: ${count}`;
			})
			.on('mouseenter', (event: MouseEvent, d: d3.SeriesPoint<DataPoint>) => {
				const year = xAccessor(d.data);
				const parentNode = (event.currentTarget as SVGRectElement).parentNode as SVGGElement;
				const seriesData = d3.select<SVGGElement, d3.Series<DataPoint, string>>(parentNode).datum();
				const type = seriesData.key;
				const count = d.data[type];
				showTooltip(event, `<strong>Year ${year}</strong><br/>${type}: ${count}`);
			})
			.on('mousemove', moveTooltip as any) 
			.on('mouseleave', hideTooltip)
			.on('focus', (event: FocusEvent, d: d3.SeriesPoint<DataPoint>) => {
				const year = xAccessor(d.data);
				const parentNode = (event.currentTarget as SVGRectElement).parentNode as SVGGElement;
				const seriesData = d3.select<SVGGElement, d3.Series<DataPoint, string>>(parentNode).datum();
				const type = seriesData.key;
				const count = d.data[type];
				showTooltip(event, `<strong>Year ${year}</strong><br/>${type}: ${count}`);
			})
			.on('blur', hideTooltip);


		// Draw Legend (Responsive)
		if (totalLegendVisualHeight > 0) {
			const legendStartY = height - finalPlotMarginBottom + spaceForXAxis + paddingBelowXAxis;
			const legendContainerGroup = svg.append('g').attr('class', 'legend')
				.attr('transform', `translate(${marginLeft}, ${legendStartY})`);

			let currentLegendX = 0;
			let currentLegendY = 0; 

			keysWithData.forEach((keyString: string) => {
				const formattedText = keyString.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
				
				// Estimate necessary width for current item (rect + text)
				// This is a simplification. For perfect fitting, measure text width.
				const estimatedTextWidth = formattedText.length * 7; // Approx 7px per char for 0.75rem font
				const currentItemEstimatedTotalWidth = legendRectSize + legendTextOffsetX + estimatedTextWidth;


				if (currentLegendX > 0 && currentLegendX + Math.min(legendSlotWidth, currentItemEstimatedTotalWidth) > availableWidthForLegendRow) {
					currentLegendX = 0;
					currentLegendY += legendItemRowHeight + legendVerticalSpacing;
				}

				const legendItemG = legendContainerGroup.append('g')
					.attr('class', 'legend-item')
					.attr('transform', `translate(${currentLegendX}, ${currentLegendY})`);
				
				legendItemG.append('rect')
					.attr('x', 0)
					.attr('y', (legendItemRowHeight - legendRectSize) / 2) 
					.attr('width', legendRectSize)
					.attr('height', legendRectSize)
					.style('fill', colorScale(keyString));

				legendItemG.append('text')
					.attr('x', legendRectSize + legendTextOffsetX)
					.attr('y', legendItemRowHeight / 2) 
					.attr('dy', '.35em')
					.style('text-anchor', 'start')
					.style('fill', axisTextColor)
					.style('font-size', 'var(--font-size-xs, 0.75rem)')
					.text(formattedText);
				
				// Advance X by the slot width, not the estimated item width, for consistent spacing
				currentLegendX += legendSlotWidth + legendHorizontalItemSpacing;
			});
		}
	}

	let observer: ResizeObserver | undefined;
	let themeObserver: MutationObserver | undefined;

	onMount(() => {
		if (el) {
			svg = d3.select(el).append('svg');
			
			// Initial size update based on the container div (el)
			width = el.clientWidth;
			height = el.clientHeight || 300; // Use clientHeight of el, fallback to 300

			observer = new ResizeObserver((entries) => {
				if (entries[0]) {
					const newWidth = entries[0].contentRect.width;
					const newHeight = entries[0].contentRect.height; // Get height from observed element (el)
					if (newWidth > 0) {
						width = newWidth;
					}
					if (newHeight > 0) {
						height = newHeight; // Update height state
					}
				}
			});
			observer.observe(el); // Observe the div.d3-chart-container

			themeObserver = new MutationObserver((mutationsList) => {
				for (const mutation of mutationsList) {
					if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
						updateAxisTextColor();
						// No need to redraw the whole chart if only text color changes for axes
						// If other elements need color changes, a full redraw might be simpler
						// For now, just update axis text color and rely on CSS vars for tooltip if possible
						if (svg) {
							svg.selectAll('.x-axis-label, .y-axis-label, .legend text, g.tick text')
								.style('fill', axisTextColor);
							svg.selectAll('.domain, .tick line')
								.style('stroke', axisTextColor);
						}
					}
				}
			});
			themeObserver.observe(document.documentElement, { attributes: true });
			updateAxisTextColor(); // Initial check
		}

		return () => {
			if (observer && el) {
				observer.unobserve(el);
			}
			if (themeObserver) {
				themeObserver.disconnect();
			}
			if (svg) {
				svg.remove();
			}
		};
	});

	$effect(() => {
		if (el && svg && width > 0 && height > 0 && data && data.length > 0) {
			svg.attr('width', width).attr('height', height);
			drawChart();
		} else if (svg) {
			svg.selectAll('*').remove(); // Clear if no data or invalid dimensions
		}
	});
</script>

<div bind:this={el} class="d3-chart-container" style="width: 100%; height: 100%;">
	{#if tooltipVisible}
		<div
			class="custom-tooltip"
			style="position: fixed; left: {tooltipLeft}px; top: {tooltipTop}px;"
		>
			{@html tooltipContent}
		</div>
	{/if}
</div>

<style>
	.d3-chart-container {
		position: relative;
		width: 100%;
		display: block;
	}
	:global(svg) {
		display: block;
		overflow: visible;
	}

	.custom-tooltip {
		background-color: var(--color-background-tooltip, rgba(20, 20, 20, 0.9));
		color: var(--color-text-tooltip, white);
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-md, 6px);
		font-size: var(--font-size-sm, 0.875rem);
		pointer-events: none;
		z-index: var(--z-index-tooltip, 1070);
		box-shadow: var(--box-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05));
		white-space: nowrap;
	}

	:global(svg .axis-label) {
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: var(--font-weight-medium, 500);
	}

	:global(svg .tick text) {
		font-size: var(--font-size-xs, 0.75rem);
	}
	
	:global(svg .legend text) {
		font-size: var(--font-size-xs, 0.75rem);
	}

	:global(.bars rect:hover), :global(g[fill]:hover rect) {
		fill-opacity: 0.8;
	}
</style> 