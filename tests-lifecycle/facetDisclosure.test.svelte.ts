import { afterEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import {
	createFacetCollapsible,
	FACET_COLLAPSIBLE_QUERY
} from '../src/lib/utils/facetDisclosure.svelte';

let stop: (() => void) | undefined;
afterEach(() => {
	stop?.();
	stop = undefined;
	vi.unstubAllGlobals();
});

/** A single media query list the test can flip. */
function stubMatchMedia(matches: boolean) {
	// Test bookkeeping, read directly by the assertions; nothing reactive observes it.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const listeners = new Set<(event: { matches: boolean }) => void>();
	const matchMedia = vi.fn(() => ({
		matches,
		addEventListener: (_: string, fn: (event: { matches: boolean }) => void) => listeners.add(fn),
		removeEventListener: (_: string, fn: (event: { matches: boolean }) => void) =>
			listeners.delete(fn)
	}));
	vi.stubGlobal('window', { matchMedia });
	return {
		matchMedia,
		listeners,
		change: (next: boolean) => listeners.forEach((fn) => fn({ matches: next }))
	};
}

function setup() {
	let collapsible!: { readonly current: boolean };
	stop = $effect.root(() => {
		collapsible = createFacetCollapsible();
	});
	flushSync();
	return collapsible;
}

it('reads the breakpoint on mount and follows it across a resize', () => {
	const media = stubMatchMedia(true);
	const collapsible = setup();
	expect(media.matchMedia).toHaveBeenCalledWith(FACET_COLLAPSIBLE_QUERY);
	expect(collapsible.current).toBe(true);

	media.change(false);
	expect(collapsible.current).toBe(false);
	media.change(true);
	expect(collapsible.current).toBe(true);
});

it('reports a wide viewport as not collapsible', () => {
	stubMatchMedia(false);
	expect(setup().current).toBe(false);
});

it('stops listening when its owner is destroyed', () => {
	const media = stubMatchMedia(false);
	setup();
	expect(media.listeners.size).toBe(1);
	stop?.();
	stop = undefined;
	expect(media.listeners.size).toBe(0);
});

it('states the same boundary as --lg-down', async () => {
	const { readFile } = await import('node:fs/promises');
	const media = await readFile(new URL('../src/styles/base/media.css', import.meta.url), 'utf8');
	const declared = media.match(/@custom-media\s+--lg-down\s+([^;]+);/);
	expect(declared?.[1]?.trim()).toBe(FACET_COLLAPSIBLE_QUERY);
});
