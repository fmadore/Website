import type { Action } from 'svelte/action';

/**
 * How far ahead of the viewport a heavy plate starts loading.
 *
 * One number for every plate on the site — maps and charts alike. The figure is
 * chosen so that the note a plate prints while it loads is, on an ordinary
 * scroll, never actually read: 400px is roughly half a phone viewport ahead of
 * the reader, which is longer than any of these chunks takes to arrive on a
 * warm connection and long enough on a cold one that the chart is drawing by
 * the time the plate's top edge appears.
 *
 * Exported so the observer's margin and anything asserting on it (the bundle
 * probes, a future test) read the same constant rather than two copies of a
 * string.
 */
export const IN_VIEW_ROOT_MARGIN = '400px 0px';

/**
 * inView — run a callback once, just before an element scrolls into view.
 *
 * The one gate for every heavy plate: the ECharts canvases on the two
 * visualisation pages, the MapLibre plates on those pages and on a talk record.
 * Each of those costs hundreds of kilobytes and, on the visualisation pages,
 * several seconds of main thread; each of them also sits well below the fold
 * (the publisher map is fourteen viewports down at 375px). Mounting them
 * eagerly spends the whole budget before the reader has seen anything.
 *
 * The action fires at most once and disconnects immediately, because these are
 * imports, not animations: there is nothing to undo when the plate leaves the
 * viewport again, and re-firing would only re-enter a module the browser has
 * already cached.
 *
 * Where `IntersectionObserver` is missing the callback runs at once. That is
 * the honest fallback: the page then behaves exactly as it did before this gate
 * existed, rather than showing a note that will never resolve.
 *
 * Cleanup runs through the action's `destroy` lifecycle method — runes such as
 * `$effect` are unavailable in a plain `.ts` file and throw at runtime.
 */
export const inView: Action<Element, (() => void) | undefined> = (node, callback) => {
	let current = callback;
	let fired = false;
	let observer: IntersectionObserver | null = null;

	function fire() {
		if (fired) return;
		fired = true;
		observer?.disconnect();
		observer = null;
		current?.();
	}

	if (typeof IntersectionObserver === 'undefined') {
		fire();
	} else {
		observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) fire();
			},
			{ rootMargin: IN_VIEW_ROOT_MARGIN }
		);
		observer.observe(node);
	}

	return {
		update(next: (() => void) | undefined) {
			current = next;
		},
		destroy() {
			observer?.disconnect();
			observer = null;
		}
	};
};
