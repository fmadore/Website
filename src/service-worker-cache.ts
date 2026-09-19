import type { SwStrategy } from './service-worker-routes';

interface CacheOptions {
	storage: Pick<CacheStorage, 'open' | 'match'>;
	fetch: (request: Request) => Promise<Response>;
	assetCache: string;
	runtimeCache: string;
	maxEntries: number;
}

/** Separate the response from background work so the fetch event can retain both lifetimes. */
export function createCacheHandler(options: CacheOptions) {
	const { storage, fetch, assetCache, runtimeCache, maxEntries } = options;
	const match = async (request: Request | string) => {
		try {
			return await storage.match(request);
		} catch {
			return undefined;
		}
	};
	async function put(name: string, request: Request, response: Response) {
		try {
			const cache = await storage.open(name);
			await cache.put(request, response);
			if (name === runtimeCache) {
				const keys = await cache.keys();
				await Promise.all(
					keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key))
				);
			}
		} catch {
			// Storage is optional. A quota/security failure must never replace an online response.
		}
	}

	return (
		request: Request,
		strategy: Exclude<SwStrategy, 'passthrough'>,
		preload?: Promise<Response | undefined>
	) => {
		const background: Promise<unknown>[] = [];
		const save = (name: string, response: Response) => {
			if (response.ok) background.push(put(name, request, response.clone()));
			return response;
		};
		const response = (async () => {
			if (strategy === 'cache-first') {
				return (await match(request)) ?? save(assetCache, await fetch(request));
			}
			if (strategy === 'stale-while-revalidate') {
				const cached = await match(request);
				const refresh = fetch(request).then(async (fresh) => {
					if (fresh.ok) await put(runtimeCache, request, fresh.clone());
					return fresh;
				});
				background.push(refresh.catch(() => undefined));
				return cached ?? refresh;
			}
			try {
				const preloaded = await preload?.catch(() => undefined);
				return save(runtimeCache, preloaded ?? (await fetch(request)));
			} catch (error) {
				const cached = await match(request);
				if (cached) return cached;
				if (request.destination !== 'document') throw error;
				const offline = await match('/offline.html');
				return offline && !offline.redirected
					? offline
					: new Response('You are offline', {
							status: 503,
							headers: { 'Content-Type': 'text/html' }
						});
			}
		})();
		// Created synchronously: callers register waitUntil before leaving the event callback.
		const done = response
			.catch(() => undefined)
			.then(async () => {
				await Promise.all(background);
			});
		return { response, done };
	};
}
