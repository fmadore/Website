import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useNetworkMonitor } from '../src/lib/utils/networkMonitor.svelte';
import { getGlobalState } from '../src/lib/stores/globalState.svelte';

let stop: (() => void) | undefined;
let target: EventTarget;
beforeEach(() => {
	target = new EventTarget();
	vi.stubGlobal('window', target);
	getGlobalState().isOnline = true;
});
afterEach(() => {
	stop?.();
	stop = undefined;
	vi.unstubAllGlobals();
});

function setup(onLine: boolean) {
	vi.stubGlobal('navigator', { onLine });
	stop = $effect.root(() => {
		useNetworkMonitor();
	});
	flushSync();
}

it('takes the initial status from the browser', () => {
	setup(false);
	expect(getGlobalState().isOnline).toBe(false);
});

it('follows the online and offline events', () => {
	setup(true);
	const state = getGlobalState();
	expect(state.isOnline).toBe(true);
	target.dispatchEvent(new Event('offline'));
	expect(state.isOnline).toBe(false);
	target.dispatchEvent(new Event('online'));
	expect(state.isOnline).toBe(true);
});

it('stops listening when its owner is destroyed', () => {
	setup(true);
	stop?.();
	stop = undefined;
	target.dispatchEvent(new Event('offline'));
	expect(getGlobalState().isOnline).toBe(true);
});
