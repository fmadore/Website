import { describe, it, expect } from 'vitest';
import {
	splitNameList,
	buildEgoNetwork,
	buildPublicationCollaborationNetwork,
	buildCommunicationCoPresenterNetwork,
	buildCooccurrenceNetwork,
	buildInstitutionNetwork
} from './networkAggregation';
import type { NetworkData } from './networkAggregation';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';

const CENTER = 'Frédérick Madore';

function node(network: NetworkData, id: string) {
	return network.nodes.find((n) => n.id === id);
}

function edge(network: NetworkData, a: string, b: string, kind?: string) {
	return network.edges.find(
		(e) =>
			((e.source === a && e.target === b) || (e.source === b && e.target === a)) &&
			(kind === undefined || e.kind === kind)
	);
}

describe('splitNameList', () => {
	it('splits on commas, "and", and ampersands', () => {
		expect(splitNameList('Jane Doe, John Smith and Alice Roe')).toEqual([
			'Jane Doe',
			'John Smith',
			'Alice Roe'
		]);
		expect(splitNameList('Jane Doe & John Smith')).toEqual(['Jane Doe', 'John Smith']);
	});

	it('handles the Oxford comma', () => {
		expect(splitNameList('A. One, B. Two, and C. Three')).toEqual(['A. One', 'B. Two', 'C. Three']);
	});

	it('does not split names containing "and" as a substring', () => {
		expect(splitNameList('Alexander Smith')).toEqual(['Alexander Smith']);
		expect(splitNameList('Rosa Randall and Sandra Anderson')).toEqual([
			'Rosa Randall',
			'Sandra Anderson'
		]);
	});

	it('passes arrays through without splitting their entries', () => {
		expect(splitNameList(['Islam and politics', ' spaced '])).toEqual([
			'Islam and politics',
			'spaced'
		]);
	});

	it('trims, de-duplicates, and drops empties and nullish input', () => {
		expect(splitNameList(' Jane Doe ,, Jane Doe ')).toEqual(['Jane Doe']);
		expect(splitNameList(null)).toEqual([]);
		expect(splitNameList(undefined)).toEqual([]);
		expect(splitNameList('')).toEqual([]);
	});
});

describe('buildEgoNetwork', () => {
	type Item = {
		title: string;
		direct: string[];
		groups?: { members: string[]; bridgeTo?: string[] }[];
	};
	const build = (items: Item[]) =>
		buildEgoNetwork(
			items,
			(i) => ({ title: i.title, direct: i.direct, contributorGroups: i.groups }),
			{ centerName: CENTER }
		);

	it('returns empty data when no items produce collaborators', () => {
		expect(build([])).toEqual({ nodes: [], edges: [] });
		expect(build([{ title: 'Solo', direct: [CENTER] }])).toEqual({ nodes: [], edges: [] });
	});

	it('puts the centre first and sorts collaborators by weight descending', () => {
		const network = build([
			{ title: 'P1', direct: ['Ann'] },
			{ title: 'P2', direct: ['Ann', 'Bob'] }
		]);
		expect(network.nodes.map((n) => n.id)).toEqual([CENTER, 'Ann', 'Bob']);
		expect(network.nodes[0]!.kind).toBe('center');
		expect(node(network, 'Ann')?.weight).toBe(2);
		expect(node(network, 'Bob')?.weight).toBe(1);
	});

	it('counts unique item titles, not raw appearances', () => {
		const network = build([
			{ title: 'Same', direct: ['Ann'] },
			{ title: 'Same', direct: ['Ann'] }
		]);
		expect(node(network, 'Ann')?.weight).toBe(1);
		expect(node(network, 'Ann')?.items).toEqual(['Same']);
	});

	it('excludes the centre from every name list', () => {
		const network = build([
			{ title: 'P1', direct: [CENTER, 'Ann'], groups: [{ members: [CENTER, 'Eve'] }] }
		]);
		expect(node(network, CENTER)?.kind).toBe('center');
		expect(network.nodes.filter((n) => n.id === CENTER)).toHaveLength(1);
		expect(edge(network, CENTER, CENTER)).toBeUndefined();
	});

	it('emits explicit direct edges from the centre to every node', () => {
		const network = build([{ title: 'P1', direct: ['Ann', 'Bob'] }]);
		expect(edge(network, CENTER, 'Ann', 'direct')?.weight).toBe(1);
		expect(edge(network, CENTER, 'Bob', 'direct')?.weight).toBe(1);
	});

	it('creates order-independent peer edges with unique-title weights', () => {
		const network = build([
			{ title: 'P1', direct: ['Ann', 'Bob'] },
			{ title: 'P2', direct: ['Bob', 'Ann'] }
		]);
		const peers = network.edges.filter((e) => e.kind === 'peer');
		expect(peers).toHaveLength(1);
		expect(peers[0]!.weight).toBe(2);
	});

	it('links contributor group members to each other and to bridge targets', () => {
		const network = build([
			{
				title: 'Chapter',
				direct: ['Ann'],
				groups: [{ members: ['Ed One', 'Ed Two'], bridgeTo: ['Ann'] }]
			}
		]);
		expect(edge(network, 'Ed One', 'Ed Two', 'contributor')).toBeDefined();
		expect(edge(network, 'Ed One', 'Ann', 'contributor')).toBeDefined();
		expect(edge(network, 'Ed Two', 'Ann', 'contributor')).toBeDefined();
		// The chapter co-author pair stays peer-only; no peer edge among editors.
		expect(edge(network, 'Ed One', 'Ed Two', 'peer')).toBeUndefined();
	});

	it('marks a person as collaborator when they are ever direct, regardless of order', () => {
		const contributorFirst = build([
			{ title: 'V1', direct: [], groups: [{ members: ['Ann'] }] },
			{ title: 'P1', direct: ['Ann'] }
		]);
		const directFirst = build([
			{ title: 'P1', direct: ['Ann'] },
			{ title: 'V1', direct: [], groups: [{ members: ['Ann'] }] }
		]);
		expect(node(contributorFirst, 'Ann')?.kind).toBe('collaborator');
		expect(node(directFirst, 'Ann')?.kind).toBe('collaborator');
	});

	it('marks contributor-only people as contributors', () => {
		const network = build([{ title: 'V1', direct: [], groups: [{ members: ['Eve'] }] }]);
		expect(node(network, 'Eve')?.kind).toBe('contributor');
	});
});

describe('buildPublicationCollaborationNetwork', () => {
	const pub = (overrides: Partial<Publication>): Publication =>
		({
			id: 'x',
			type: 'article',
			title: 'T',
			authors: [CENTER],
			date: '2024',
			dateISO: '2024',
			year: 2024,
			language: 'English',
			...overrides
		}) as Publication;

	it('treats co-authors as direct collaborators and excludes the centre', () => {
		const network = buildPublicationCollaborationNetwork(
			[pub({ authors: [CENTER, 'Ann Ba'] })],
			CENTER
		);
		expect(node(network, 'Ann Ba')?.kind).toBe('collaborator');
		expect(network.nodes.filter((n) => n.id === CENTER)).toHaveLength(1);
	});

	it('treats editors of non-chapter works and preface authors as direct', () => {
		const network = buildPublicationCollaborationNetwork(
			[pub({ type: 'book', editors: 'Ed One and Ed Two', prefacedBy: 'Pref Author' })],
			CENTER
		);
		expect(node(network, 'Ed One')?.kind).toBe('collaborator');
		expect(node(network, 'Ed Two')?.kind).toBe('collaborator');
		expect(node(network, 'Pref Author')?.kind).toBe('collaborator');
	});

	it('treats chapter volume editors as contributors bridged to co-authors', () => {
		const network = buildPublicationCollaborationNetwork(
			[pub({ type: 'chapter', authors: [CENTER, 'Ann Ba'], editors: 'Ed One, Ed Two' })],
			CENTER
		);
		expect(node(network, 'Ed One')?.kind).toBe('contributor');
		expect(edge(network, 'Ed One', 'Ed Two', 'contributor')).toBeDefined();
		expect(edge(network, 'Ed One', 'Ann Ba', 'contributor')).toBeDefined();
		expect(edge(network, 'Ed One', 'Ann Ba', 'peer')).toBeUndefined();
	});

	it('treats table-of-contents authors of edited volumes as contributors', () => {
		const network = buildPublicationCollaborationNetwork(
			[
				pub({
					type: 'special-issue',
					tableOfContents: [
						'Front matter',
						{ title: 'Article A', authors: ['Toc One', 'Toc Two'] },
						{ title: 'Article B', authors: [CENTER] }
					]
				})
			],
			CENTER
		);
		expect(node(network, 'Toc One')?.kind).toBe('contributor');
		expect(edge(network, 'Toc One', 'Toc Two', 'contributor')).toBeDefined();
	});

	it('does not split author names containing "and"', () => {
		const network = buildPublicationCollaborationNetwork(
			[pub({ authors: [CENTER, 'Alexander Smith'] })],
			CENTER
		);
		expect(node(network, 'Alexander Smith')).toBeDefined();
		expect(node(network, 'Alex')).toBeUndefined();
	});
});

describe('buildCommunicationCoPresenterNetwork', () => {
	const comm = (overrides: Partial<Communication>): Communication =>
		({
			id: 'c',
			title: 'Talk',
			authors: [CENTER],
			date: '2024',
			dateISO: '2024-01-01',
			year: 2024,
			conference: 'Conf',
			location: 'City',
			country: 'Country',
			...overrides
		}) as Communication;

	it('unions authors, participants, and paper authors, de-duplicated', () => {
		const network = buildCommunicationCoPresenterNetwork(
			[
				comm({
					authors: [CENTER, 'Ann Ba'],
					participants: [{ name: 'Ann Ba', role: 'chair' }, { name: 'Carl Di' }],
					papers: [{ title: 'Paper', authors: [{ name: 'Dana Ek', affiliation: 'Uni' }] }]
				})
			],
			CENTER
		);
		expect(network.nodes.map((n) => n.id)).toContain('Ann Ba');
		expect(network.nodes.map((n) => n.id)).toContain('Carl Di');
		expect(network.nodes.map((n) => n.id)).toContain('Dana Ek');
		expect(node(network, 'Ann Ba')?.weight).toBe(1);
		// Everyone on the same communication is peer-linked.
		expect(edge(network, 'Carl Di', 'Dana Ek', 'peer')).toBeDefined();
	});
});

describe('buildCooccurrenceNetwork', () => {
	type Item = { title: string; tags?: string[] };
	const build = (
		items: Item[],
		options: Partial<Parameters<typeof buildCooccurrenceNetwork<Item>>[1]> = {}
	) =>
		buildCooccurrenceNetwork(items, {
			getKeys: (i) => i.tags,
			getTitle: (i) => i.title,
			...options
		});

	it('weights nodes by item count and edges by shared items', () => {
		const network = build(
			[
				{ title: 'P1', tags: ['islam', 'politics'] },
				{ title: 'P2', tags: ['islam', 'politics'] },
				{ title: 'P3', tags: ['islam'] }
			],
			{ minNodeWeight: 1, minEdgeWeight: 1 }
		);
		expect(node(network, 'islam')?.weight).toBe(3);
		expect(node(network, 'politics')?.weight).toBe(2);
		expect(edge(network, 'islam', 'politics', 'cooccurrence')?.weight).toBe(2);
		expect(network.nodes.every((n) => n.kind === 'entity')).toBe(true);
	});

	it('applies node and edge thresholds (defaults drop singletons and one-off pairs)', () => {
		const network = build([
			{ title: 'P1', tags: ['a', 'b', 'rare'] },
			{ title: 'P2', tags: ['a', 'b'] }
		]);
		expect(node(network, 'rare')).toBeUndefined();
		expect(edge(network, 'a', 'b')?.weight).toBe(2);
	});

	it('drops nodes left isolated after edge filtering by default', () => {
		const network = build([
			{ title: 'P1', tags: ['a', 'b'] },
			{ title: 'P2', tags: ['a', 'b'] },
			{ title: 'P3', tags: ['lonely'] },
			{ title: 'P4', tags: ['lonely'] }
		]);
		expect(node(network, 'lonely')).toBeUndefined();
		expect(node(network, 'a')).toBeDefined();
	});

	it('keeps isolated nodes when dropIsolatedNodes is false', () => {
		const network = build(
			[
				{ title: 'P3', tags: ['lonely'] },
				{ title: 'P4', tags: ['lonely'] }
			],
			{ dropIsolatedNodes: false }
		);
		expect(node(network, 'lonely')?.weight).toBe(2);
	});

	it('de-duplicates keys within a single item', () => {
		const network = build([{ title: 'P1', tags: ['a', 'a', ' a '] }], {
			minNodeWeight: 1,
			minEdgeWeight: 1,
			dropIsolatedNodes: false
		});
		expect(node(network, 'a')?.weight).toBe(1);
		expect(network.edges).toHaveLength(0);
	});

	it('skips items with no keys', () => {
		const network = build([{ title: 'P1' }, { title: 'P2', tags: [] }], {
			minNodeWeight: 1,
			minEdgeWeight: 1
		});
		expect(network.nodes).toHaveLength(0);
	});
});

describe('buildInstitutionNetwork', () => {
	it('extracts affiliations from participants and paper authors', () => {
		const comms = [
			{
				id: 'c1',
				title: 'Panel',
				authors: [CENTER],
				date: '2024',
				dateISO: '2024-01-01',
				year: 2024,
				conference: 'Conf',
				location: 'City',
				country: 'Country',
				participants: [{ name: 'Ann', affiliation: 'Uni A' }, { name: 'NoAffil' }],
				papers: [
					{
						title: 'Paper',
						authors: [
							{ name: 'Bob', affiliation: 'Uni B' },
							{ name: 'Cara', affiliation: 'Uni A' }
						]
					}
				]
			}
		] as Communication[];

		const network = buildInstitutionNetwork(comms);
		expect(node(network, 'Uni A')?.weight).toBe(1);
		expect(node(network, 'Uni B')?.weight).toBe(1);
		expect(edge(network, 'Uni A', 'Uni B', 'cooccurrence')).toBeDefined();
		// Missing affiliations never become nodes.
		expect(network.nodes.map((n) => n.id)).not.toContain('');
	});
});
