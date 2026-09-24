import { describe, expect, it } from 'vitest';
import { allGrants } from '$lib/data/grants/index';
import { buildGrantsJsonLd } from './grantsJsonLd';

const PAGE = 'https://www.frederickmadore.com/research/example';

describe('buildGrantsJsonLd', () => {
	it("graphs a project's awarded grants, anchored on the page", () => {
		const funded = allGrants.find(
			(grant) => grant.project && (!grant.status || grant.status === 'Awarded')
		)!;
		const expected = allGrants.filter(
			(grant) => grant.project === funded.project && (!grant.status || grant.status === 'Awarded')
		);
		const graph = JSON.parse(buildGrantsJsonLd(funded.project!, PAGE)!);
		expect(graph['@context']).toBe('https://schema.org');
		expect(graph['@graph'].map((node: { '@id': string }) => node['@id'])).toEqual(
			expected.map((grant) => `${PAGE}#grant-${grant.id}`)
		);
		for (const node of graph['@graph']) {
			expect(node['@type']).toBe('MonetaryGrant');
			expect(node).not.toHaveProperty('@context');
		}
	});

	it('is null for no project or one without a grant', () => {
		expect(buildGrantsJsonLd('', PAGE)).toBeNull();
		expect(buildGrantsJsonLd('No such project', PAGE)).toBeNull();
	});
});
