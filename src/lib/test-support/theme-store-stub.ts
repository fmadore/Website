/**
 * Vitest-only stub for `$lib/stores/themeStore.svelte`.
 *
 * The real module uses Svelte 5 runes (`$state`), which only exist after
 * Svelte compilation — the standalone vitest.config.ts runs plain TS in Node,
 * so importing it throws `ReferenceError: $state is not defined`. Tests of
 * pure chart utilities resolve to this rune-free stand-in instead (see the
 * alias in vitest.config.ts).
 */
export const getTheme = () => 'light';
export const toggleTheme = () => {};
