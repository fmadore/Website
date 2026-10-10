export const TOOLTIP_EDGE_PADDING = 12;

export interface TooltipBounds {
	left: number;
	top: number;
	width: number;
	height: number;
}

export function tooltipViewport(): TooltipBounds {
	const viewport = window.visualViewport;
	return {
		left: viewport?.offsetLeft ?? 0,
		top: viewport?.offsetTop ?? 0,
		width: viewport?.width ?? document.documentElement.clientWidth,
		height: viewport?.height ?? window.innerHeight
	};
}

/** Position the measured box, flipping at an edge before clamping both axes. */
export function positionTooltip(
	anchor: { x: number; y: number },
	size: { width: number; height: number },
	bounds: TooltipBounds,
	placement: 'above' | 'beside' = 'beside'
) {
	const gap = 14;
	const left = bounds.left + TOOLTIP_EDGE_PADDING;
	const top = bounds.top + TOOLTIP_EDGE_PADDING;
	const right = bounds.left + bounds.width - TOOLTIP_EDGE_PADDING;
	const bottom = bounds.top + bounds.height - TOOLTIP_EDGE_PADDING;
	let x = placement === 'above' ? anchor.x - size.width / 2 : anchor.x + gap;
	let y = placement === 'above' ? anchor.y - size.height - gap : anchor.y + gap;
	if (placement === 'above' && y < top) y = anchor.y + gap;
	if (placement === 'beside' && x + size.width > right) x = anchor.x - size.width - gap;
	if (y + size.height > bottom) y = anchor.y - size.height - gap;
	return {
		x: Math.max(left, Math.min(x, right - size.width)),
		y: Math.max(top, Math.min(y, bottom - size.height))
	};
}
