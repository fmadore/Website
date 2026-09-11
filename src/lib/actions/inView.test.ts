import { describe, it, expect, afterEach, vi } from 'vitest';

import { inView, IN_VIEW_ROOT_MARGIN } from './inView';

/**
 * The gate every heavy plate hangs on, so its contract is worth pinning: fire
 * once, disconnect, never fire again, and — where the browser has no
 * `IntersectionObserver` — fire immediately rather than leaving a plate stuck
 * on "Loading chart…" for ever.
 *
 * Vitest runs in a plain Node environment here, so the observer is stubbed
 * rather than driven: the action only ever calls `observe`, `disconnect` and
 * the callback, and none of that needs a document.
 */

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

interface StubObserver {
	callback: ObserverCallback;
	options: IntersectionObserverInit | undefined;
	observed: unknown[];
	disconnected: number;
}

const stubs: StubObserver[] = [];

function installObserver() {
	class Stub {
		callback: ObserverCallback;
		options: IntersectionObserverInit | undefined;
		observed: unknown[] = [];
		disconnected = 0;

		constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
			this.callback = callback;
			this.options = options;
			stubs.push(this as unknown as StubObserver);
		}

		observe(target: unknown) {
			this.observed.push(target);
		}

		disconnect() {
			this.disconnected += 1;
		}

		unobserve() {}
		takeRecords() {
			return [];
		}
	}

	(globalThis as Record<string, unknown>).IntersectionObserver = Stub;
}

afterEach(() => {
	stubs.length = 0;
	delete (globalThis as Record<string, unknown>).IntersectionObserver;
});

const node = {} as Element;

describe('inView', () => {
	it('observes the node once, at the shared 400px margin', () => {
		installObserver();
		inView(node, () => {});

		expect(stubs).toHaveLength(1);
		expect(stubs[0]!.observed).toEqual([node]);
		expect(stubs[0]!.options?.rootMargin).toBe(IN_VIEW_ROOT_MARGIN);
		expect(IN_VIEW_ROOT_MARGIN).toBe('400px 0px');
	});

	it('does not fire before the node intersects', () => {
		installObserver();
		const load = vi.fn();
		inView(node, load);

		stubs[0]!.callback([{ isIntersecting: false }]);
		expect(load).not.toHaveBeenCalled();
	});

	it('fires once on intersection and disconnects', () => {
		installObserver();
		const load = vi.fn();
		inView(node, load);

		stubs[0]!.callback([{ isIntersecting: false }, { isIntersecting: true }]);
		expect(load).toHaveBeenCalledTimes(1);
		expect(stubs[0]!.disconnected).toBe(1);

		// A chunk is imported once; a second intersection must not re-enter it.
		stubs[0]!.callback([{ isIntersecting: true }]);
		expect(load).toHaveBeenCalledTimes(1);
	});

	it('calls the latest callback after an update', () => {
		installObserver();
		const first = vi.fn();
		const second = vi.fn();
		const handle = inView(node, first);

		handle?.update?.(second);
		stubs[0]!.callback([{ isIntersecting: true }]);

		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
	});

	it('disconnects on destroy without firing', () => {
		installObserver();
		const load = vi.fn();
		const handle = inView(node, load);

		handle?.destroy?.();
		expect(stubs[0]!.disconnected).toBe(1);
		expect(load).not.toHaveBeenCalled();
	});

	it('loads immediately where IntersectionObserver is unavailable', () => {
		const load = vi.fn();
		const handle = inView(node, load);

		expect(load).toHaveBeenCalledTimes(1);
		// Nothing to tear down; destroy must still be safe to call.
		expect(() => handle?.destroy?.()).not.toThrow();
	});
});
