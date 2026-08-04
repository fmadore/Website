/**
 * Loads the site's static JSON datasets.
 *
 * The server reads the published files over HTTP rather than importing
 * `src/lib/data` directly: those modules are assembled by Vite's
 * `import.meta.glob`, which only exists inside a Vite build. Fetching also means
 * the server always reflects what the live site is actually serving, with no
 * rebuild step of its own.
 *
 * Point `WEBSITE_API_BASE` at a local build (`http://localhost:4173`) to develop
 * against unpublished content.
 */

const DEFAULT_BASE = 'https://www.frederickmadore.com';

/**
 * Trailing slashes would produce `//api/...` on join. An empty value counts as
 * unset: the MCPB bundle substitutes `${user_config.api_base}` into the
 * environment, which yields `''` when the user leaves that setting blank.
 */
const apiBase = (process.env.WEBSITE_API_BASE?.trim() || DEFAULT_BASE).replace(/\/+$/, '');

export type DatasetName =
	'research' | 'publications' | 'communications' | 'activities' | 'digital-humanities';

/** A record in any of the item datasets. Fields vary; only `id` is guaranteed. */
export interface Item {
	id: string;
	url?: string;
	title?: string;
	year?: number;
	[key: string]: unknown;
}

interface DatasetPayload {
	version: number;
	dataset: string;
	count: number;
	items: Item[];
}

export interface CvPayload {
	version: number;
	person: Record<string, unknown>;
	sections: Record<string, unknown>;
}

/**
 * One in-flight fetch per document for the life of the process. The corpus is
 * a few hundred records that change a few times a month, so a process-lifetime
 * cache is the right trade: no staleness a restart won't fix, no refetch per
 * tool call.
 */
const cache = new Map<string, Promise<unknown>>();

async function fetchDocument<T>(path: string): Promise<T> {
	const cached = cache.get(path);
	if (cached) return cached as Promise<T>;

	const pending = (async () => {
		const url = `${apiBase}/api/${path}.json`;
		let response: Response;
		try {
			response = await fetch(url);
		} catch (cause) {
			throw new Error(`Could not reach ${url}. Is the site online?`, { cause });
		}
		if (!response.ok) {
			throw new Error(`${url} returned HTTP ${response.status} ${response.statusText}`);
		}
		return (await response.json()) as T;
	})();

	// Don't cache a rejection: a transient network blip would otherwise poison
	// every later call for the life of the process.
	pending.catch(() => cache.delete(path));
	cache.set(path, pending);
	return pending;
}

/** All items in a dataset, in the order the site publishes them (newest first). */
export async function loadDataset(name: DatasetName): Promise<Item[]> {
	const payload = await fetchDocument<DatasetPayload>(name);
	return payload.items;
}

export async function loadCv(): Promise<CvPayload> {
	return fetchDocument<CvPayload>('cv');
}

/** Look up one record, with a message that helps the caller recover. */
export async function findItem(name: DatasetName, id: string): Promise<Item> {
	const items = await loadDataset(name);
	const item = items.find((candidate) => candidate.id === id);
	if (item) return item;

	const suggestions = items
		.filter((candidate) => candidate.id.includes(id) || id.includes(candidate.id))
		.slice(0, 5)
		.map((candidate) => candidate.id);

	throw new Error(
		`No ${name} record with id "${id}".` +
			(suggestions.length > 0
				? ` Did you mean: ${suggestions.join(', ')}?`
				: ` Use the matching search tool to find valid ids.`)
	);
}
