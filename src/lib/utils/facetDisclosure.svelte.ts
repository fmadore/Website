/**
 * The facet disclosure's one piece of state.
 *
 * /activities collapses its browse aside behind a `More filters` toggle below
 * --lg, and needs to know *is the apparatus actually collapsed right now*: the
 * toggle is `display: none` above the breakpoint, and a hidden control that an
 * assistive technology still reaches reported `aria-expanded="false"` over an
 * aside that was fully laid out. The attribute is therefore rendered only while
 * the control it describes is.
 *
 * The entity indexes (/publications, /conference-activity, the citations page)
 * no longer use it: their facet grid is closed behind `More filters` at every
 * width, so `EntityFilterBar` renders its toggle, and `aria-expanded`, always.
 *
 * Kept here rather than in the component so the breakpoint is stated once.
 * `--lg-down` in `media.css` is the same boundary; a literal is unavoidable in
 * `matchMedia`, so this module is the single place it is written down.
 */
import { browser } from '$app/env';

/** Mirrors `--lg-down` in `src/styles/base/media.css`. */
export const FACET_COLLAPSIBLE_QUERY = '(max-width: 1023px)';

/**
 * True while the viewport is narrow enough for the facet apparatus to be
 * collapsed. Call once from a component's script; the listener is registered
 * and torn down by the `$effect` it opens.
 */
export function createFacetCollapsible(): { readonly current: boolean } {
	let collapsible = $state(false);

	$effect(() => {
		if (!browser) return;
		const mql = window.matchMedia(FACET_COLLAPSIBLE_QUERY);
		collapsible = mql.matches;
		const onChange = (event: MediaQueryListEvent) => (collapsible = event.matches);
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	});

	return {
		get current() {
			return collapsible;
		}
	};
}
