import type { Action } from 'svelte/action';
import { positionTooltip, tooltipViewport, TOOLTIP_EDGE_PADDING } from '$lib/utils/tooltipPosition';

interface Options {
	/** Coordinates in the original parent's scrollable content. */
	x: number;
	y: number;
	placement?: 'above' | 'beside';
	maxWidth?: number;
}

/** Escape plot scrollers and keep the entire measured tooltip in the visible viewport. */
export const viewportTooltip: Action<HTMLElement, Options> = (node, initial) => {
	const origin = node.parentElement!;
	let options = initial;
	let frame = 0;
	// The top layer escapes overflow and transformed ancestors without moving
	// Svelte's DOM. The portal fallback serves browsers without Popover support.
	const topLayer = typeof node.showPopover === 'function';
	if (topLayer) node.setAttribute('popover', 'manual');
	else (document.fullscreenElement ?? document.body).appendChild(node);
	Object.assign(node.style, {
		position: 'fixed',
		inset: 'auto',
		margin: '0',
		transform: 'none',
		boxSizing: 'border-box',
		minWidth: '0',
		width: 'max-content',
		overflowWrap: 'anywhere',
		overflow: 'auto'
	});
	if (topLayer) node.showPopover();

	function place() {
		const bounds = tooltipViewport();
		node.style.maxWidth = `${Math.max(0, Math.min(options.maxWidth ?? 300, bounds.width - TOOLTIP_EDGE_PADDING * 2))}px`;
		node.style.maxHeight = `${Math.max(0, bounds.height - TOOLTIP_EDGE_PADDING * 2)}px`;
		const rect = origin.getBoundingClientRect();
		const point = positionTooltip(
			{ x: rect.left + options.x - origin.scrollLeft, y: rect.top + options.y - origin.scrollTop },
			node.getBoundingClientRect(),
			bounds,
			options.placement
		);
		node.style.left = `${point.x}px`;
		node.style.top = `${point.y}px`;
	}
	function schedule() {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(place);
	}
	const observer = new ResizeObserver(schedule);
	observer.observe(node);
	observer.observe(origin);
	window.addEventListener('scroll', schedule, true);
	window.addEventListener('resize', schedule);
	window.visualViewport?.addEventListener('resize', schedule);
	window.visualViewport?.addEventListener('scroll', schedule);
	place();
	return {
		update(next) {
			options = next;
			place();
		},
		destroy() {
			cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener('scroll', schedule, true);
			window.removeEventListener('resize', schedule);
			window.visualViewport?.removeEventListener('resize', schedule);
			window.visualViewport?.removeEventListener('scroll', schedule);
			if (topLayer) node.hidePopover();
			else node.remove();
		}
	};
};
