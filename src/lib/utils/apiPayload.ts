import { website } from '$lib/data/siteConfig';

/**
 * Helpers for the static JSON API under `/api/*.json`.
 *
 * These endpoints publish the same `src/lib/data` records that render the site,
 * so an external consumer (an MCP server, a scraper, an agent) never has to
 * parse HTML or re-key the corpus. They are prerendered by `adapter-static`
 * exactly like `/rss.xml` and `/llms.txt`.
 *
 * Note on headers: `adapter-static` writes the response *body* to a file and
 * discards the headers, so on GitHub Pages the `Content-Type` comes from the
 * `.json` extension and `Cache-Control` from Pages itself. The headers set here
 * are still correct for `npm run dev`/`preview` and for any future non-static
 * adapter, which is why they are declared rather than omitted.
 */

/** Payload schema version. Bump on any breaking change to the item shapes. */
export const API_VERSION = 1;

const SITE = website.url;

/** Resolve a site-relative path to an absolute URL. Pass-through for absolute ones. */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//i.test(path) || path.startsWith('mailto:')) return path;
	return `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** A labelled external address attached to a record. */
export type ApiLink = { label: string; url: string };

/**
 * Build the `links` array shared by every dataset: a primary address, any
 * additional labelled ones, then extras. Undefined entries and duplicate URLs
 * are dropped so consumers can iterate without guarding.
 */
export function buildLinks(
	entries: Array<{ label: string; url?: string } | undefined>,
	additional?: Array<{ label: string; url: string }>
): ApiLink[] | undefined {
	const all = [...entries, ...(additional ?? [])];
	const seen = new Set<string>();
	const links: ApiLink[] = [];

	for (const entry of all) {
		if (!entry?.url) continue;
		const url = absoluteUrl(entry.url);
		if (seen.has(url)) continue;
		seen.add(url);
		links.push({ label: entry.label, url });
	}

	return links.length > 0 ? links : undefined;
}

/**
 * Strip keys whose value carries no information (undefined, null, empty string,
 * empty array). Items are wide unions where most fields apply to one type only,
 * so without this every publication would ship two dozen nulls.
 */
export function compact<T extends Record<string, unknown>>(item: T): T {
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(item)) {
		if (value === undefined || value === null || value === '') continue;
		if (Array.isArray(value) && value.length === 0) continue;
		out[key] = value;
	}
	return out as T;
}

/** Envelope returned by every dataset endpoint. */
export interface DatasetPayload<T> {
	version: number;
	dataset: string;
	/** Absolute URL of this document, so a fetched payload stays self-locating. */
	url: string;
	count: number;
	items: T[];
}

export function datasetPayload<T>(dataset: string, items: T[]): DatasetPayload<T> {
	return {
		version: API_VERSION,
		dataset,
		url: `${SITE}/api/${dataset}.json`,
		count: items.length,
		items
	};
}

/**
 * Serialise a payload as an HTTP response. Tab-indented on purpose: the files
 * are served gzipped so the cost is negligible, and a human inspecting the
 * corpus with `curl` gets something readable.
 */
export function jsonResponse(payload: unknown): Response {
	return new Response(JSON.stringify(payload, null, '\t'), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'max-age=3600, s-maxage=3600',
			// These documents are meant to be read cross-origin by other tools.
			'Access-Control-Allow-Origin': '*',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
