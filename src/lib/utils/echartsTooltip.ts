import type { TooltipComponentOption } from 'echarts/components';
import { positionTooltip, tooltipViewport, TOOLTIP_EDGE_PADDING } from './tooltipPosition';

/** Translate viewport containment back into ECharts' chart-local coordinates. */
export function echartsTooltipPlacement(
	getContainer: () => HTMLElement | undefined
): Pick<TooltipComponentOption, 'position' | 'confine'> {
	const position: TooltipComponentOption['position'] = (point, _params, dom) => {
		const container = getContainer();
		if (!container) return point;
		const bounds = tooltipViewport();
		const node = dom as HTMLElement;
		node.setAttribute('role', 'tooltip');
		node.style.maxWidth = `${Math.max(0, Math.min(360, bounds.width - TOOLTIP_EDGE_PADDING * 2))}px`;
		node.style.maxHeight = `${Math.max(0, bounds.height - TOOLTIP_EDGE_PADDING * 2)}px`;
		const rect = container.getBoundingClientRect();
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
