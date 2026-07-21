/**
 * Vitest-only stub for SvelteKit's `$app/environment`.
 *
 * The standalone vitest.config.ts deliberately does not load the SvelteKit
 * plugin, so `$app/*` virtual modules don't exist. Unit tests that import
 * modules with a transitive `$app/environment` dependency resolve to this
 * stub instead (see the alias in vitest.config.ts). Node is always "SSR".
 */
export const browser = false;
export const dev = false;
