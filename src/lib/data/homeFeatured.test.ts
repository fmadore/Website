import { describe, it, expect } from 'vitest';
import { featuredPublicationIds } from './homeFeatured';
import { allPublicationSummaries } from '#lib/data/publications/summaries.ts';

describe('featuredPublicationIds', () => {
	it('names only publications that exist, each once', () => {
		const ids = new Set(allPublicationSummaries.map((p) => p.id));
		expect(featuredPublicationIds.filter((id) => !ids.has(id))).toEqual([]);
		expect(new Set(featuredPublicationIds).size).toBe(featuredPublicationIds.length);
	});
});
