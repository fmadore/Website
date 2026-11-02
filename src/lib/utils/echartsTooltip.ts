import type { TooltipComponentOption } from 'echarts/components';
import {
	positionTooltip,
	tooltipViewport,
	TOOLTIP_EDGE_PADDING,
	type TooltipBounds
} from './tooltipPosition';

/**
 * Translate containment back into ECharts' chart-local coordinates.
 *
 * The tooltip node lives inside the chart, and the plate around it
 * (`VizChartCard`) is paint-contained, so it clips whatever crosses its edge.
 * The box the tooltip may occupy is therefore the viewport intersected with the
 * chart container, not the viewport alone.
 */
export function visibleChartBounds(
	rect: DOMRect | TooltipBounds,
	viewport: TooltipBounds
): TooltipBounds {
	const left = Math.max(viewport.left, rect.left);
	const top = Math.max(viewport.top, rect.top);
	const right = Math.min(viewport.left + viewport.width, rect.left + rect.width);
	const bottom = Math.min(viewport.top + viewport.height, rect.top + rect.height);
	return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

export function echartsTooltipPlacement(
	getContainer: () => HTMLElement | undefined
): Pick<TooltipComponentOption, 'position' | 'confine'> {
	const position: TooltipComponentOption['position'] = (point, _params, dom) => {
		const container = getContainer();
		if (!container) return point;
		const rect = container.getBoundingClientRect();
		const bounds = visibleChartBounds(rect, tooltipViewport());
		const node = dom as HTMLElement;
		node.setAttribute('role', 'tooltip');
		node.style.maxWidth = `${Math.max(0, Math.min(360, bounds.width - TOOLTIP_EDGE_PADDING * 2))}px`;
		node.style.maxHeight = `${Math.max(0, bounds.height - TOOLTIP_EDGE_PADDING * 2)}px`;
		const placed = positionTooltip(
			{ x: rect.left + point[0], y: rect.top + point[1] },
			node.getBoundingClientRect(),
			bounds
		);
		return [placed.x - rect.left, placed.y - rect.top];
	};
	return {
		confine: false,
		position
	};
}
