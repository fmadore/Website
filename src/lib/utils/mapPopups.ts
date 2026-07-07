/**
 * Shared MapLibre popup construction + containment.
 *
 * Both map components (the clustered activity map and the marker-based location
 * map) used to build popups by hand, and only one of them kept the popup inside
 * the map container. This centralises the two concerns so popups behave
 * identically everywhere:
 *
 * 1. **Placement** — MapLibre's own dynamic anchor is left to choose the corner
 *    that fits, constrained by the `padding` option so it never hugs an edge.
 * 2. **Containment fallback** — after the popup opens (and again once any image
 *    inside it loads and changes its height), the map pans the *minimum* amount
 *    needed to bring the whole popup into view, respecting reduced motion.
 */

import type { Map as MapLibreMap, Popup, PopupOptions } from 'maplibre-gl';
import type { MapLibreModule } from './maplibre';
import { prefersReducedMotion } from './maplibre';

/**
 * Default edge padding (px) applied both to the Popup `padding` option (which
 * constrains MapLibre's placement) and to the pan-into-view fallback.
 */
export const POPUP_EDGE_PADDING = 16;

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
		const popupRect = popupEl.getBoundingClientRect();
		if (popupRect.width === 0 || popupRect.height === 0) return;

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

		if (dx !== 0 || dy !== 0) {
			map.panBy([-dx, -dy], { duration: prefersReducedMotion() ? 0 : 250 });
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

	const popup = new maplibregl.Popup({
		className,
		offset,
		maxWidth,
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

	popup.on('open', () => {
		keepPopupInView(map, container, popup, padding);

		// Image-bearing popups grow taller once the image loads, which can push
		// them back out of bounds — re-run containment when each image settles.
		const el = popup.getElement?.();
		if (!el) return;
		el.querySelectorAll('img').forEach((img) => {
			if (!img.complete) {
				img.addEventListener('load', () => keepPopupInView(map, container, popup, padding), {
					once: true
				});
			}
		});
	});

	return popup;
}
