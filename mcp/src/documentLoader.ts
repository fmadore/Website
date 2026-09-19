import { validateApiDocument, type ApiDocumentName } from '../../src/lib/apiContract';

interface LoaderOptions {
	base: string;
	timeoutMs: number;
	ttlMs: number;
	fetch?: typeof globalThis.fetch;
	now?: () => number;
}

export function createDocumentLoader({
	base,
	timeoutMs,
	ttlMs,
	fetch = globalThis.fetch,
	now = Date.now
}: LoaderOptions) {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isFinite(ttlMs) || ttlMs < 0) {
		throw new Error(
			'API timeout must be positive and cache TTL must be nonnegative (milliseconds).'
		);
	}
	const cache = new Map<ApiDocumentName, { pending: Promise<unknown>; expires: number }>();
	return function fetchDocument<T>(name: ApiDocumentName): Promise<T> {
		const cached = cache.get(name);
		if (cached && cached.expires > now()) return cached.pending as Promise<T>;
		const url = `${base.replace(/\/+$/, '')}/api/${name}.json`;
		const controller = new AbortController();
		let timer: ReturnType<typeof setTimeout>;
		const deadline = new Promise<never>((_, reject) => {
			timer = setTimeout(() => {
				reject(new Error(`Timed out loading ${url}`));
				controller.abort();
			}, timeoutMs);
		});
		const request = (async () => {
			const response = await fetch(url, { signal: controller.signal });
			if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
			const value: unknown = await response.json();
			validateApiDocument(name, value);
			return value;
		})();
		const entry = { pending: Promise.resolve() as Promise<unknown>, expires: Infinity };
		entry.pending = Promise.race([request, deadline])
			.then((value) => {
				entry.expires = now() + ttlMs;
				return value;
			})
			.catch((cause) => {
				if (cache.get(name) === entry) cache.delete(name);
				throw new Error(
					`Could not load ${url}: ${cause instanceof Error ? cause.message : 'request failed'}`,
					{ cause }
				);
			})
			.finally(() => clearTimeout(timer));
		cache.set(name, entry);
		return entry.pending as Promise<T>;
	};
}
