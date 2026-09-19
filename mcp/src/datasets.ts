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

import { createDocumentLoader } from './documentLoader.js';
import type {
	DatasetName,
	ApiDocumentName,
	ApiItem as Item,
	DatasetPayload,
	CvPayload
} from '../../src/lib/apiContract';
export type { DatasetName, ApiDocumentName, Item, CvPayload };

const fetchDocument = createDocumentLoader({
	base: apiBase,
	timeoutMs: Number(process.env.WEBSITE_API_TIMEOUT_MS ?? 10000),
	ttlMs: Number(process.env.WEBSITE_API_CACHE_TTL_MS ?? 300000)
});

/** Load one complete API document for exposure as an MCP resource. */
export async function loadApiDocument(name: ApiDocumentName): Promise<unknown> {
	return fetchDocument<unknown>(name);
}

/** All items in a dataset, in the order the site publishes them (newest first). */
export async function loadDataset(name: DatasetName): Promise<Item[]> {
	const payload = await fetchDocument<DatasetPayload<Item>>(name);
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
