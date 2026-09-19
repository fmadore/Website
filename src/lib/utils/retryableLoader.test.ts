import { expect, it, vi } from 'vitest';
import { retryableLoader } from './retryableLoader';
it('shares in-flight and successful loads, but permits recovery after failure', async () => {
	const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('ready');
	const get = retryableLoader(load);
	const first = get();
	expect(get()).toBe(first);
	await expect(first).rejects.toThrow('offline');
	await expect(get()).resolves.toBe('ready');
	await expect(get()).resolves.toBe('ready');
	expect(load).toHaveBeenCalledTimes(2);
});
