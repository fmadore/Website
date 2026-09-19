/** Shared API boundary contract; imports no content or framework code. */
export const API_VERSION = 1;
export type DatasetName =
	'research' | 'publications' | 'communications' | 'activities' | 'digital-humanities';
export type ApiDocumentName = DatasetName | 'cv' | 'index';
export interface ApiItem {
	id: string;
	url?: string;
	title?: string;
	year?: number;
	[key: string]: unknown;
}
export interface DatasetPayload<T> {
	version: number;
	dataset: string;
	url: string;
	count: number;
	items: T[];
}
export interface CvPayload extends Record<string, unknown> {
	version: number;
	person: Record<string, unknown>;
	sections: Record<string, unknown>;
}
const object = (v: unknown): v is Record<string, unknown> =>
	!!v && typeof v === 'object' && !Array.isArray(v);

/** Reject incompatible or malformed successful responses before they can enter a cache. */
export function validateApiDocument(name: ApiDocumentName, value: unknown): void {
	const fail = (reason: string): never => {
		throw new Error(`Invalid ${name} API document: ${reason}`);
	};
	if (!object(value)) return fail('expected an object');
	if (value.version !== API_VERSION) return fail(`unsupported version ${value.version}`);
	if (typeof value.url !== 'string') return fail('missing document URL');
	if (name === 'index') {
		if (
			!object(value.site) ||
			!Array.isArray(value.datasets) ||
			!value.datasets.every(
				(d) => object(d) && typeof d.name === 'string' && typeof d.url === 'string'
			)
		)
			return fail('invalid discovery manifest');
		return;
	}
	if (value.dataset !== name) return fail('dataset name does not match');
	if (name === 'cv') {
		if (!object(value.person) || !object(value.sections)) return fail('invalid person or sections');
		return;
	}
	if (!Array.isArray(value.items) || value.count !== value.items.length)
		return fail('invalid items/count');
	const ids = new Set<string>();
	for (const item of value.items) {
		if (!object(item) || typeof item.id !== 'string' || !item.id || /\s/.test(item.id))
			return fail('invalid item id');
		if (ids.has(item.id)) return fail(`duplicate id ${item.id}`);
		ids.add(item.id);
		if (item.title !== undefined && typeof item.title !== 'string') return fail('invalid title');
		if (item.url !== undefined && typeof item.url !== 'string') return fail('invalid item URL');
		if (item.year !== undefined && (typeof item.year !== 'number' || !Number.isFinite(item.year)))
			return fail('invalid year');
	}
}
