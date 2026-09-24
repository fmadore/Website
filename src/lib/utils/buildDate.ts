/**
 * When this build ran.
 *
 * A `new Date()` read while rendering is two different dates on a prerendered
 * site: the build's, baked into the HTML, and the reader's, computed again by
 * the client as it hydrates. A page that splits talks into upcoming and past,
 * prints "As of <date>", or ends an ongoing bar at "now" then hydrates markup
 * rendered for another day, and whatever differs has to be patched or rebuilt
 * mid-hydration. Render from BUILT_AT, which is the same on both sides; a
 * component that must show the reader's today switches to it after mount, as
 * an ordinary update.
 *
 * Vitest does not run Vite's `define`, so tests fall back to the current time.
 */
export const BUILT_AT: Date = new Date(
	typeof __BUILT_AT__ === 'string' ? __BUILT_AT__ : Date.now()
);
