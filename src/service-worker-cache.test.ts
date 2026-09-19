import { describe, expect, it, vi } from 'vitest';
import { createCacheHandler } from './service-worker-cache';

function setup() {
	const entries = new Map<string, Response>();
	const key = (r: Request | string) => (typeof r === 'string' ? r : r.url);
	const put = vi.fn(async (request: Request, response: Response) => {
		entries.set(key(request), response);
	});
	const storage = {
		match: vi.fn(async (r: Request | string) => entries.get(key(r))?.clone()),
		open: vi.fn(async () => ({
			put,
			keys: async () => [...entries.keys()],
			delete: async (r: string) => entries.delete(r)
		}))
	} as unknown as Pick<CacheStorage, 'match' | 'open'>;
	const fetch = vi.fn(async () => new Response('fresh'));
	const handle = createCacheHandler({
		storage,
		fetch,
		assetCache: 'assets',
		runtimeCache: 'runtime',
		maxEntries: 2
	});
	return { entries, put, storage, fetch, handle };
}
const request = () => new Request('https://example.org/api/items.json');
const navigation = () => Object.defineProperty(request(), 'destination', { value: 'document' });

describe('worker cache strategies', () => {
	it('returns stale data immediately and retains the refresh through the cache write', async () => {
		const s = setup();
		const req = request();
		s.entries.set(req.url, new Response('stale'));
		let finish!: (r: Response) => void;
		s.fetch.mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const work = s.handle(req, 'stale-while-revalidate');
		expect(await (await work.response).text()).toBe('stale');
		let completed = false;
		void work.done.then(() => {
			completed = true;
		});
		await Promise.resolve();
		expect(completed).toBe(false);
		finish(new Response('updated'));
		await work.done;
		expect(await s.entries.get(req.url)!.text()).toBe('updated');
	});
	it.each(['cache-first', 'network-first', 'stale-while-revalidate'] as const)(
		'preserves an online response despite cache-write rejection: %s',
		async (strategy) => {
			const s = setup();
			s.put.mockRejectedValue(new Error('quota'));
			const work = s.handle(request(), strategy);
			expect(await (await work.response).text()).toBe('fresh');
			await expect(work.done).resolves.toBeUndefined();
		}
	);
	it('preserves navigation preload when storage is unavailable', async () => {
		const s = setup();
		vi.mocked(s.storage.open).mockRejectedValue(new Error('denied'));
		const work = s.handle(
			navigation(),
			'network-first',
			Promise.resolve(new Response('preloaded'))
		);
		expect(await (await work.response).text()).toBe('preloaded');
		await work.done;
		expect(s.fetch).not.toHaveBeenCalled();
	});
	it('uses normal fetch if navigation preload fails', async () => {
		const s = setup();
		const work = s.handle(navigation(), 'network-first', Promise.reject(new Error('preload')));
		expect(await (await work.response).text()).toBe('fresh');
		await work.done;
	});
	it('returns a visited document offline and a fallback for an unvisited document', async () => {
		const s = setup();
		const req = navigation();
		s.fetch.mockRejectedValue(new Error('offline'));
		s.entries.set(req.url, new Response('visited'));
		s.entries.set('/offline.html', new Response('fallback'));
		expect(await (await s.handle(req, 'network-first').response).text()).toBe('visited');
		s.entries.delete(req.url);
		expect(await (await s.handle(req, 'network-first').response).text()).toBe('fallback');
		s.entries.delete('/offline.html');
		expect((await s.handle(req, 'network-first').response).status).toBe(503);
	});
	it('rejects missing offline data instead of responding with undefined or HTML', async () => {
		const s = setup();
		s.fetch.mockRejectedValue(new Error('offline'));
		const work = s.handle(request(), 'stale-while-revalidate');
		await expect(work.response).rejects.toThrow('offline');
		await work.done;
	});
	it('bounds runtime storage', async () => {
		const s = setup();
		s.entries.set('old', new Response('1'));
		s.entries.set('newer', new Response('2'));
		await s.handle(request(), 'network-first').done;
		expect([...s.entries.keys()]).toEqual(['newer', request().url]);
	});
});
