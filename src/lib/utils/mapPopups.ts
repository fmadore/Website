/**
 * Shared MapLibre popup construction + containment.
 *
 * Both map components (the clustered activity map and the marker-based location
 * map) used to build popups by hand, and only one of them kept the popup inside
 * the map container. This centralises the two concerns so popups behave
 * identically everywhere:
 *
 * 1. **Placement** — MapLibre's own dynamic anchor is left to choose the corner
 *    that fits, constrained by the v6 `padding` option so it never hugs an edge.
 * 2. **Size fallback** — content taller or wider than the usable map viewport is
 *    constrained and made scrollable before positioning is corrected.
 * 3. **Containment fallback** — after the popup opens (and whenever either the
 *    popup or map is resized), the map pans the *minimum* amount needed to bring
 *    the whole popup into view, respecting reduced motion.
 */

import type { Map as MapLibreMap, Popup, PopupOptions } from 'maplibre-gl';
import type { MapLibreModule } from './maplibre';
import { prefersReducedMotion } from './maplibre';

/**
 * Default edge padding (px) applied both to the Popup `padding` option (which
 * constrains MapLibre's placement) and to the pan-into-view fallback.
 */
export const POPUP_EDGE_PADDING = 16;

type RectEdges = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;

/**
 * Return the MapLibre `panBy` delta that moves `popupRect` inside
 * `containerRect`. MapLibre moves rendered geography in the opposite direction
 * to the supplied pan delta, so a positive right/bottom overflow deliberately
 * produces a positive x/y correction.
 */
export function calculatePopupPan(
	containerRect: RectEdges,
	popupRect: RectEdges,
	padding: number = POPUP_EDGE_PADDING
): [number, number] {
	let dx = 0;
	let dy = 0;

	if (popupRect.left < containerRect.left + padding) {
		dx = popupRect.left - (containerRect.left + padding);
	} else if (popupRect.right > containerRect.right - padding) {
		dx = popupRect.right - (containerRect.right - padding);
	}

	if (popupRect.top < containerRect.top + padding) {
		dy = popupRect.top - (containerRect.top + padding);
	} else if (popupRect.bottom > containerRect.bottom - padding) {
		dy = popupRect.bottom - (containerRect.bottom - padding);
	}

	return [dx, dy];
}

/**
 * Return the content-height cap required to fit a complete popup inside the
 * usable map height, or `null` when its natural height already fits.
 */
export function calculatePopupContentMaxHeight(
	containerHeight: number,
	popupChromeHeight: number,
	naturalContentHeight: number,
	padding: number = POPUP_EDGE_PADDING
): number | null {
	const availableHeight = Math.max(0, containerHeight - padding * 2);
	const maxContentHeight = Math.max(0, availableHeight - popupChromeHeight);
	return naturalContentHeight > maxContentHeight ? Math.floor(maxContentHeight) : null;
}

/**
 * Limit tall popup content to the usable container height. Returns `true` when
 * a changed constraint means MapLibre should recompute its dynamic anchor.
 */
function constrainPopupHeight(
	containerRect: DOMRect,
	popupEl: HTMLElement,
	padding: number
): boolean {
	const contentEl = popupEl.querySelector<HTMLElement>('.maplibregl-popup-content');
	if (!contentEl) return false;

	const popupRect = popupEl.getBoundingClientRect();
	const contentRect = contentEl.getBoundingClientRect();
	const chromeHeight = Math.max(0, popupRect.height - contentRect.height);
	const borderHeight = Math.max(0, contentRect.height - contentEl.clientHeight);
	const naturalContentHeight = Math.max(contentRect.height, contentEl.scrollHeight + borderHeight);
	const maxContentHeight = calculatePopupContentMaxHeight(
		containerRect.height,
		chromeHeight,
		naturalContentHeight,
		padding
	);
	const shouldConstrain = maxContentHeight !== null;
	const nextMaxHeight = shouldConstrain ? `${maxContentHeight}px` : '';
	const wasConstrained = contentEl.dataset.mapPopupConstrained === 'true';
	const changed = shouldConstrain
		? contentEl.style.maxHeight !== nextMaxHeight || !wasConstrained
		: wasConstrained;

	if (shouldConstrain) {
		contentEl.dataset.mapPopupConstrained = 'true';
		contentEl.style.boxSizing = 'border-box';
		contentEl.style.maxHeight = nextMaxHeight;
		contentEl.style.overflowY = 'auto';
		contentEl.style.overscrollBehavior = 'contain';
	} else if (wasConstrained) {
		delete contentEl.dataset.mapPopupConstrained;
		contentEl.style.boxSizing = '';
		contentEl.style.maxHeight = '';
		contentEl.style.overflowY = '';
		contentEl.style.overscrollBehavior = '';
	}

	return changed;
}

/**
 * Pan the map by the minimum amount needed for `popup` to sit fully inside
 * `container` (with `padding` to spare on every edge). Safe to call repeatedly.
 */
export function keepPopupInView(
	map: MapLibreMap,
	container: HTMLElement,
	popup: Popup,
	padding: number = POPUP_EDGE_PADDING
): void {
	if (typeof window === 'undefined') return;
	const popupEl = popup.getElement?.();
	if (!popupEl) return;

	// Wait a frame so MapLibre has positioned the popup / applied its anchor.
	requestAnimationFrame(() => {
		if (!popupEl.isConnected) return; // popup closed before the frame fired
		const containerRect = container.getBoundingClientRect();

		// Dynamic anchoring alone cannot contain a popup that is taller than the
		// usable map viewport. Cap the content first, then ask MapLibre v6 to
		// re-evaluate its anchor against the new dimensions.
		if (constrainPopupHeight(containerRect, popupEl, padding)) {
			popup.setLngLat(popup.getLngLat());
		}

		const popupRect = popupEl.getBoundingClientRect();
		if (popupRect.width === 0 || popupRect.height === 0) return;
		const [dx, dy] = calculatePopupPan(containerRect, popupRect, padding);

		if (dx !== 0 || dy !== 0) {
			map.panBy([dx, dy], { duration: prefersReducedMotion() ? 0 : 250 });
		}
	});
}

export interface ContainedPopupConfig {
	/** Anchor coordinate `[lng, lat]`. */
	lngLat: [number, number];
	/** Space-separated CSS class names for the popup container. */
	className?: string;
	/** Pixel offset applied to the popup's location (number or per-anchor object). */
	offset?: PopupOptions['offset'];
	/** CSS `max-width` for the popup, e.g. `'280px'`. */
	maxWidth?: string;
	/** Edge padding for both placement and the pan-into-view fallback. */
	padding?: number;
	/**
	 * Whether opening the popup moves focus into it. Defaults to `false` so
	 * mouse-opened popups don't yank focus (which can contribute to page/map
	 * jumps); keyboard users still reach popup content via the close button.
	 */
	focusAfterOpen?: boolean;
	closeButton?: boolean;
	closeOnClick?: boolean;
}

/**
 * Build a popup with consistent options and containment wired up. Content may be
 * an HTML string (`setHTML`) or a prepared DOM node (`setDOMContent`, preferred
 * for untrusted content since MapLibre does not sanitise `setHTML`).
 *
 * The caller decides how it opens — `popup.addTo(map)` for click-opened popups,
 * or `marker.setPopup(popup)` for marker-bound popups. Containment runs on the
 * popup's `open` event, so both paths get it.
 *
 * `anchor` is deliberately left unset so MapLibre dynamically picks the anchor
 * that keeps the popup within the container.
 */
export function createContainedPopup(
	maplibregl: MapLibreModule,
	map: MapLibreMap,
	container: HTMLElement,
	config: ContainedPopupConfig,
	content: string | HTMLElement
): Popup {
	const {
		lngLat,
		className,
		offset,
		maxWidth = '280px',
		padding = POPUP_EDGE_PADDING,
		focusAfterOpen = false,
		closeButton = true,
		closeOnClick = true
	} = config;

	// A percentage max-width is resolved against the popup's map container.
	// This covers narrow embeds where even the configured pixel width would not
	// fit; height is measured after opening because the popup tip also consumes
	// space and its size depends on the selected anchor.
	const containedMaxWidth =
		maxWidth === 'none'
			? `calc(100% - ${padding * 2}px)`
			: `min(${maxWidth}, calc(100% - ${padding * 2}px))`;
	const popup = new maplibregl.Popup({
		className,
		offset,
		maxWidth: containedMaxWidth,
		closeButton,
		closeOnClick,
		focusAfterOpen,
		padding: { top: padding, right: padding, bottom: padding, left: padding }
	}).setLngLat(lngLat);

	if (typeof content === 'string') {
		popup.setHTML(content);
	} else {
		popup.setDOMContent(content);
	}

	let resizeObserver: ResizeObserver | null = null;
	const handleWindowResize = () => keepPopupInView(map, container, popup, padding);

	popup.on('open', () => {
		keepPopupInView(map, container, popup, padding);

		const el = popup.getElement?.();
		if (!el) return;

		// Re-run containment for responsive map layouts and late content changes.
		// ResizeObserver covers both popup growth and container resizes; the image
		// listener also catches an image whose intrinsic content grows inside an
		// already height-constrained (and therefore size-stable) popup.
		resizeObserver?.disconnect();
		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => keepPopupInView(map, container, popup, padding));
			resizeObserver.observe(container);
			resizeObserver.observe(el);
		} else {
			window.addEventListener('resize', handleWindowResize);
		}

		el.querySelectorAll('img').forEach((img) => {
			if (!img.complete) {
				img.addEventListener('load', () => keepPopupInView(map, container, popup, padding), {
					once: true
				});
			}
		});
	});

	popup.on('close', () => {
		resizeObserver?.disconnect();
		resizeObserver = null;
		window.removeEventListener('resize', handleWindowResize);
	});

	return popup;
}
