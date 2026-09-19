import { afterEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useMapLibre } from '../src/lib/utils/useMapLibre.svelte';

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
});

function setup() {
	// Test event registry is deliberately nonreactive.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const handlers = new Map<string, () => void>();
	const map = {
		on: vi.fn((event: string, fn: () => void) => handlers.set(event, fn)),
		once: vi.fn((event: string, fn: () => void) => handlers.set(event, fn)),
		off: vi.fn((event: string, fn: () => void) => {
			if (handlers.get(event) === fn) handlers.delete(event);
		}),
		setStyle: vi.fn(),
		remove: vi.fn(),
		addControl: vi.fn(),
		isStyleLoaded: () => true
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
	return { hook, state, map, handlers, styleReady, dataChanged };
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
