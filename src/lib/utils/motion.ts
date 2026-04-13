/**
 * Motion preference utilities.
 *
 * Keeps Svelte transition/animate durations in sync with the user's
 * `prefers-reduced-motion` setting. CSS-only animations already respect this
 * via media queries in `src/styles/components/animations.css`; this helper
 * covers the JS-driven Svelte transition path (fade, flip, etc.).
 */

/**
 * Returns true if the user has requested reduced motion.
 * SSR-safe: returns false when `window` is unavailable.
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns the given duration, or 0 when reduced motion is requested.
 * Use for Svelte `transition:`/`animate:` duration options.
 */
export function motionDuration(duration: number): number {
	return prefersReducedMotion() ? 0 : duration;
}
