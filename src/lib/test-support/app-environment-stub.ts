/**
 * Vitest-only stub for SvelteKit's `$app/env`.
 *
 * The standalone vitest.config.ts deliberately does not load the SvelteKit
 * plugin, so `$app/*` virtual modules don't exist. Unit tests that import
 * modules with a transitive `$app/env` dependency resolve to this
 * stub instead (see the alias in vitest.config.ts). Node is always "SSR".
 */
export const browser = false;
export const dev = false;
