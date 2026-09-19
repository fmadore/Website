import { expect, it, vi } from 'vitest';
import { createBoundaryLoader } from './countryBoundaries';
it('validates responses, retries failures, and shares the successful boundaries', async () => {
	const collection = { type: 'FeatureCollection', features: [] };
	const fetcher = vi
		.fn<typeof fetch>()
		.mockResolvedValueOnce(Response.json({ type: 'bad' }))
		.mockResolvedValueOnce(Response.json(collection));
	const load = createBoundaryLoader('/boundaries', fetcher);
	await expect(load()).rejects.toThrow('invalid format');
	await expect(load()).resolves.toEqual(collection);
	await expect(load()).resolves.toEqual(collection);
	expect(fetcher).toHaveBeenCalledTimes(2);
});
