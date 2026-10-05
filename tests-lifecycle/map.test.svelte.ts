import { afterEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useMapLibre, MAP_STYLE_TIMEOUT_MS } from '../src/lib/utils/useMapLibre.svelte';

const mocks = vi.hoisted(() => ({ load: vi.fn(), layout: vi.fn() }));
vi.mock('$lib/utils/maplibre', () => ({
	MAP_STYLES: { light: 'light', dark: 'dark' },
	hasWebGLSupport: () => true,
	loadMapLibre: mocks.load,
	waitForContainerLayout: mocks.layout
}));
let stop: (() => void) | undefined;
afterEach(() => {
	stop?.();
	stop = undefined;
	vi.clearAllMocks();
	vi.useRealTimers();
});

function setup() {
	// Test event registry is deliberately nonreactive.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const handlers = new Map<string, (event?: { error: Error }) => void>();
	// Read through a closure: the hook keeps the map in $state, which proxies this
	// plain mock (a real maplibre Map is a class instance and is not proxied).
	const style = { loaded: true };
	const map = {
		on: vi.fn((event: string, fn: () => void) => handlers.set(event, fn)),
		once: vi.fn((event: string, fn: () => void) => handlers.set(event, fn)),
		off: vi.fn((event: string, fn: () => void) => {
			if (handlers.get(event) === fn) handlers.delete(event);
		}),
		setStyle: vi.fn(),
		remove: vi.fn(),
		addControl: vi.fn(),
		getStyle: vi.fn((): object | undefined => ({ version: 8 })),
		isStyleLoaded: () => style.loaded
	};
	mocks.layout.mockResolvedValue(true);
	mocks.load.mockResolvedValue({
		Map: class {
			constructor() {
				return map;
			}
		},
		NavigationControl: class {},
		GlobeControl: class {},
		FullscreenControl: class {}
	});
	const state = $state({ dark: false, data: 1 });
	const styleReady = vi.fn();
	const dataChanged = vi.fn();
	let hook!: ReturnType<typeof useMapLibre>;
	stop = $effect.root(() => {
		hook = useMapLibre({
			getContainer: () => ({ isConnected: true }) as HTMLElement,
			getMapOptions: () => ({}),
			isDark: () => state.dark,
			onStyleReady: styleReady,
			watchData: () => state.data,
			onDataChange: dataChanged
		});
	});
	flushSync();
	return { hook, state, map, style, handlers, styleReady, dataChanged };
}

it('updates data and theme without rebuilding, and removes pending style listeners on disposal', async () => {
	const s = setup();
	await vi.waitFor(() => expect(s.hook.map).not.toBeNull());
	s.handlers.get('load')!();
	flushSync();
	s.state.data = 0;
	flushSync();
	expect(s.dataChanged).toHaveBeenCalled();
	s.state.dark = true;
	flushSync();
	expect(s.map.setStyle).toHaveBeenCalledWith('dark');
	s.handlers.get('style.load')!();
	expect(s.styleReady).toHaveBeenCalledTimes(2);
	stop?.();
	stop = undefined;
	expect(s.map.remove).toHaveBeenCalledOnce();
	expect(s.map.off).toHaveBeenCalled();
	expect(mocks.load).toHaveBeenCalledOnce();
});

it('defers a data change made while tiles load to the next idle, keeping only the latest', async () => {
	const s = setup();
	await vi.waitFor(() => expect(s.hook.map).not.toBeNull());
	s.handlers.get('load')!();
	flushSync();
	s.dataChanged.mockClear();
	s.style.loaded = false;
	s.state.data = 2;
	flushSync();
	s.state.data = 3;
	flushSync();
	expect(s.dataChanged).not.toHaveBeenCalled();
	// The superseded change's listener is withdrawn, not left to fire as well.
	expect(s.map.off).toHaveBeenCalledWith('idle', expect.any(Function));
	s.style.loaded = true;
	s.handlers.get('idle')!();
	expect(s.dataChanged).toHaveBeenCalledOnce();
});

it('does not construct a map after unmount during loading', async () => {
	const s = setup();
	// The initial layout promise is already awaited; disposing cancels subsequent initialization.
	stop?.();
	stop = undefined;
	await Promise.resolve();
	await Promise.resolve();
	expect(s.hook.map).toBeNull();
	expect(mocks.load).not.toHaveBeenCalled();
});

it('can retry a failed initialization', async () => {
	const s = setup();
	mocks.load.mockRejectedValueOnce(new Error('offline'));
	await vi.waitFor(() => expect(s.hook.importError).toBe('offline'));
	s.hook.retry();
	flushSync();
	await vi.waitFor(() => expect(s.hook.map).not.toBeNull());
	expect(s.hook.importError).toBeNull();
	expect(mocks.load).toHaveBeenCalledTimes(2);
});

it('offers recovery for a failed initial style and successfully retries', async () => {
	const s = setup();
	await vi.waitFor(() => expect(s.hook.map).not.toBeNull());
	s.map.getStyle.mockReturnValue(undefined);
	s.handlers.get('error')!({ error: new Error('style request failed') });
	flushSync();
	expect(s.hook.importError).toContain('style');
	s.hook.retry();
	flushSync();
	await vi.waitFor(() => expect(mocks.load).toHaveBeenCalledTimes(2));
	s.handlers.get('load')!();
	flushSync();
	expect(s.hook.importError).toBeNull();
	expect(s.hook.isMapLoaded).toBe(true);
	expect(s.map.remove).toHaveBeenCalledOnce();
});

it('does not replace a usable map when one tile fails', async () => {
	const s = setup();
	await vi.waitFor(() => expect(s.hook.map).not.toBeNull());
	s.handlers.get('load')!();
	s.handlers.get('error')!({ error: new Error('one tile failed') });
	expect(s.hook.importError).toBeNull();
});

it('times out a stalled style and cancels the next timer on disposal', async () => {
	vi.useFakeTimers();
	const s = setup();
	await vi.waitFor(() => expect(s.hook.map).not.toBeNull());
	await vi.advanceTimersByTimeAsync(MAP_STYLE_TIMEOUT_MS);
	expect(s.hook.importError).toContain('in time');
	s.hook.retry();
	flushSync();
	await vi.waitFor(() => expect(mocks.load).toHaveBeenCalledTimes(2));
	stop?.();
	stop = undefined;
	await vi.advanceTimersByTimeAsync(MAP_STYLE_TIMEOUT_MS);
	expect(s.hook.importError).toBeNull();
	expect(s.hook.map).toBeNull();
});
