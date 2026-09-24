import { afterEach, beforeEach, expect, it, vi } from 'vitest';

type Store = typeof import('../src/lib/stores/themeStore.svelte');

interface Browser {
	stored?: string | null;
	storage?: 'blocked';
	prefersDark?: boolean;
	ground?: string;
}

let classes: Set<string>;
let metas: { content: string }[];
let saved: Map<string, string>;

beforeEach(() => {
	vi.resetModules();
});
afterEach(() => {
	vi.unstubAllGlobals();
});

/** Stub the browser the store boots in, then evaluate it fresh. */
async function boot({
	stored = null,
	storage,
	prefersDark = false,
	ground = '#FAF7EF'
}: Browser = {}): Promise<Store> {
	// The stubbed DOM and storage: plain bookkeeping the assertions read directly.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	classes = new Set(['light']);
	metas = [{ content: 'os-light' }, { content: 'os-dark' }];
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	saved = new Map(stored ? [['theme', stored]] : []);
	const blocked = () => {
		throw new DOMException('denied', 'SecurityError');
	};
	vi.stubGlobal('localStorage', {
		getItem: storage === 'blocked' ? blocked : (key: string) => saved.get(key) ?? null,
		setItem: storage === 'blocked' ? blocked : (key: string, value: string) => saved.set(key, value)
	});
	vi.stubGlobal('window', { matchMedia: () => ({ matches: prefersDark }) });
	vi.stubGlobal('document', {
		documentElement: {
			classList: {
				add: (name: string) => classes.add(name),
				remove: (...names: string[]) => names.forEach((name) => classes.delete(name))
			}
		},
		querySelectorAll: () =>
			metas.map((meta) => ({ setAttribute: (_: string, value: string) => (meta.content = value) }))
	});
	vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => ` ${ground} ` }));
	return import('../src/lib/stores/themeStore.svelte');
}

it('prefers a stored choice over the OS, and paints both metas with the ground', async () => {
	const store = await boot({ stored: 'dark', prefersDark: false, ground: '#171310' });
	expect(store.getTheme()).toBe('dark');
	expect([...classes]).toEqual(['dark']);
	expect(metas.map((meta) => meta.content)).toEqual(['#171310', '#171310']);
});

it('falls back to the OS preference when nothing valid is stored', async () => {
	expect((await boot({ stored: 'sepia', prefersDark: true })).getTheme()).toBe('dark');
	vi.resetModules();
	expect((await boot({ prefersDark: false })).getTheme()).toBe('light');
});

it('toggles, persists, and repaints', async () => {
	const store = await boot();
	store.toggleTheme();
	expect(store.getTheme()).toBe('dark');
	expect([...classes]).toEqual(['dark']);
	expect(saved.get('theme')).toBe('dark');
	store.toggleTheme();
	expect(store.getTheme()).toBe('light');
	expect(saved.get('theme')).toBe('light');
});

it('boots and toggles where storage is blocked', async () => {
	const store = await boot({ storage: 'blocked', prefersDark: true });
	expect(store.getTheme()).toBe('dark');
	expect(() => store.toggleTheme()).not.toThrow();
	expect(store.getTheme()).toBe('light');
	expect([...classes]).toEqual(['light']);
});

it('leaves the metas alone when the stylesheet has not supplied a ground', async () => {
	await boot({ ground: '' });
	expect(metas.map((meta) => meta.content)).toEqual(['os-light', 'os-dark']);
});
