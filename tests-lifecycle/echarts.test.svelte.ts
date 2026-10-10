import { afterEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useECharts } from '../src/lib/utils/useECharts.svelte';

const mocks = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock('$lib/utils/echartsCore', () => ({ init: mocks.init }));
let stop: (() => void) | undefined;
afterEach(() => {
	stop?.();
	stop = undefined;
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

/** A scrolled element: inside a tooltip, or anywhere else on the page. */
class StubElement {
	constructor(readonly inTooltip: boolean) {}
	closest(selector: string) {
		return this.inTooltip && selector === '[role="tooltip"]' ? this : null;
	}
}

function setup(loadExtensions?: () => Promise<void>) {
	const viewport = new EventTarget();
	const win = Object.assign(new EventTarget(), { visualViewport: viewport });
	vi.stubGlobal('window', win);
	vi.stubGlobal('Element', StubElement);
	const chart = {
		isDisposed: vi.fn(() => false),
		dispose: vi.fn(),
		setOption: vi.fn(),
		resize: vi.fn(),
		clear: vi.fn(),
		dispatchAction: vi.fn()
	};
	mocks.init.mockReturnValue(chart);
	let resized = () => {};
	const disconnect = vi.fn();
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(callback: () => void) {
				resized = callback;
			}
			observe() {}
			disconnect = disconnect;
		}
	);
	const state = $state({ hasData: true, revision: 1 });
	let hook!: ReturnType<typeof useECharts>;
	stop = $effect.root(() => {
		hook = useECharts({
			getContainer: () =>
				({ getBoundingClientRect: () => ({ width: 100, height: 100 }) }) as HTMLDivElement,
			getOption: () => ({ revision: state.revision, tooltip: { trigger: 'item' } }),
			hasData: () => state.hasData,
			loadExtensions
		});
	});
	flushSync();
	/** A capture-phase scroll reaches window with the scrolled element as its target. */
	const scrollFrom = (element: StubElement) => {
		const event = new Event('scroll');
		Object.defineProperty(event, 'target', { value: element });
		win.dispatchEvent(event);
	};
	return { hook, chart, state, disconnect, resize: () => resized(), win, viewport, scrollFrom };
}
async function ready(hook: ReturnType<typeof useECharts>) {
	await vi.waitFor(() => {
		flushSync();
		expect(hook.isReady).toBe(true);
	});
}
it('updates options, clears empty data, resizes and disposes without reinitializing', async () => {
	const s = setup();
	await ready(s.hook);
	s.state.revision = 2;
	flushSync();
	expect(s.chart.setOption).toHaveBeenLastCalledWith(
		{
			revision: 2,
			// The option's own tooltip settings survive the viewport placement.
			tooltip: { trigger: 'item', confine: false, position: expect.any(Function) }
		},
		{ notMerge: true }
	);
	s.state.hasData = false;
	flushSync();
	expect(s.chart.clear).toHaveBeenCalledOnce();
	s.resize();
	expect(s.chart.resize).toHaveBeenCalledOnce();
	expect(mocks.init).toHaveBeenCalledOnce();
	stop?.();
	stop = undefined;
	expect(s.chart.dispose).toHaveBeenCalledOnce();
	expect(s.disconnect).toHaveBeenCalledOnce();
});
it('does not initialize after unmount while an async extension is loading', async () => {
	let finish!: () => void;
	const extension = vi.fn(
		() =>
			new Promise<void>((resolve) => {
				finish = resolve;
			})
	);
	setup(extension);
	await vi.waitFor(() => expect(extension).toHaveBeenCalledOnce());
	stop?.();
	stop = undefined;
	finish();
	await Promise.resolve();
	flushSync();
	expect(mocks.init).not.toHaveBeenCalled();
});
it('reports an initialization failure and permits a successful retry', async () => {
	const extension = vi
		.fn()
		.mockRejectedValueOnce(new Error('offline'))
		.mockResolvedValue(undefined);
	const s = setup(extension);
	await vi.waitFor(() => {
		flushSync();
		expect(s.hook.error).toBe('offline');
	});
	s.hook.retry();
	flushSync();
	await ready(s.hook);
	expect(s.hook.error).toBeNull();
	expect(extension).toHaveBeenCalledTimes(2);
});
it('hides the tooltip when the page scrolls or resizes, until unmount', async () => {
	const s = setup();
	await ready(s.hook);
	const hides = () => s.chart.dispatchAction.mock.calls.length;

	s.win.dispatchEvent(new Event('resize'));
	s.viewport.dispatchEvent(new Event('resize'));
	s.scrollFrom(new StubElement(false));
	expect(hides()).toBe(3);
	expect(s.chart.dispatchAction).toHaveBeenLastCalledWith({ type: 'hideTip' });

	// Scrolling a long tooltip's own content must not dismiss it.
	s.scrollFrom(new StubElement(true));
	expect(hides()).toBe(3);

	stop?.();
	stop = undefined;
	s.win.dispatchEvent(new Event('resize'));
	s.viewport.dispatchEvent(new Event('resize'));
	s.scrollFrom(new StubElement(false));
	expect(hides()).toBe(3);
});
