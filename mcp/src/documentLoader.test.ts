import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocumentLoader } from './documentLoader';

const payload = {
	version: 1,
	dataset: 'publications',
	url: 'https://example.org/api/publications.json',
	count: 1,
	items: [{ id: 'one' }]
};
const options = { base: 'https://example.org/', ttlMs: 100, timeoutMs: 50 };
afterEach(() => vi.useRealTimers());

describe('API document loader', () => {
	it('deduplicates in-flight requests and refreshes expired documents', async () => {
		let now = 0;
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockImplementation(async () => Response.json(payload));
		const load = createDocumentLoader({ ...options, fetch, now: () => now });
		const first = load('publications');
		expect(load('publications')).toBe(first);
		await first;
		await load('publications');
		expect(fetch).toHaveBeenCalledTimes(1);
		now = 101;
		await load('publications');
		expect(fetch).toHaveBeenCalledTimes(2);
	});
	it.each([
		{ ...payload, version: 999 },
		{ ...payload, dataset: 'research' },
		{ ...payload, items: [{}] },
		{ ...payload, count: 4 },
		{ ...payload, count: 2, items: [{ id: 'one' }, { id: 'one' }] },
		{ ...payload, items: [{ id: 'one', title: 3 }] }
	])('rejects malformed envelopes and allows a later retry', async (malformed) => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValueOnce(Response.json(malformed))
			.mockResolvedValueOnce(Response.json(payload));
		const load = createDocumentLoader({ ...options, fetch });
		await expect(load('publications')).rejects.toThrow('Invalid publications API document');
		await expect(load('publications')).resolves.toEqual(payload);
	});
	it('evicts HTTP and JSON errors', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValueOnce(new Response('down', { status: 503 }))
			.mockResolvedValueOnce(new Response('invalid json'))
			.mockResolvedValueOnce(Response.json(payload));
		const load = createDocumentLoader({ ...options, fetch });
		await expect(load('publications')).rejects.toThrow('HTTP 503');
		await expect(load('publications')).rejects.toThrow('Could not load');
		await expect(load('publications')).resolves.toEqual(payload);
	});
	it('bounds even a stalled response body, aborts, and evicts the pending request', async () => {
		vi.useFakeTimers();
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValueOnce(new Response(new ReadableStream({ start() {} })))
			.mockResolvedValueOnce(Response.json(payload));
		const load = createDocumentLoader({ ...options, fetch });
		const rejected = expect(load('publications')).rejects.toThrow('Timed out');
		await vi.advanceTimersByTimeAsync(51);
		await rejected;
		expect(fetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		await expect(load('publications')).resolves.toEqual(payload);
	});
	it('validates CV and discovery documents too', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValueOnce(
				Response.json({ version: 1, url: 'x', dataset: 'cv', person: {}, sections: [] })
			)
			.mockResolvedValueOnce(Response.json({ version: 1, url: 'x', site: {}, datasets: [{}] }));
		const load = createDocumentLoader({ ...options, fetch });
		await expect(load('cv')).rejects.toThrow('invalid person or sections');
		await expect(load('index')).rejects.toThrow('invalid discovery manifest');
	});
});
