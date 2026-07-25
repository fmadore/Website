import { describe, expect, it } from 'vitest';
import { orderNodes, spectralOrder, type WeightedEdge } from './seriation';

const edge = (source: string, target: string, weight = 1): WeightedEdge => ({
	source,
	target,
	weight
});

/** Position of each id in an ordering, for adjacency assertions. */
function positions(order: string[]): Map<string, number> {
	return new Map(order.map((id, i) => [id, i]));
}

/** Sum of |pos(a) - pos(b)| over all edges — what seriation minimises. */
function arrangementCost(order: string[], edges: WeightedEdge[]): number {
	const pos = positions(order);
	return edges.reduce(
		(sum, e) => sum + Math.abs((pos.get(e.source) ?? 0) - (pos.get(e.target) ?? 0)) * e.weight,
		0
	);
}

describe('spectralOrder', () => {
	it('keeps two dense clusters contiguous', () => {
		// Two triangles joined by a single weak bridge.
		const ids = ['a1', 'b1', 'a2', 'b2', 'a3', 'b3'];
		const edges = [
			edge('a1', 'a2', 5),
			edge('a2', 'a3', 5),
			edge('a1', 'a3', 5),
			edge('b1', 'b2', 5),
			edge('b2', 'b3', 5),
			edge('b1', 'b3', 5),
			edge('a3', 'b1', 1)
		];
		const order = spectralOrder(ids, edges);
		const pos = positions(order);

		const aPositions = ['a1', 'a2', 'a3'].map((id) => pos.get(id)!).sort((x, y) => x - y);
		const bPositions = ['b1', 'b2', 'b3'].map((id) => pos.get(id)!).sort((x, y) => x - y);

		// Each cluster occupies three consecutive slots.
		expect(aPositions[2]! - aPositions[0]!).toBe(2);
		expect(bPositions[2]! - bPositions[0]!).toBe(2);
	});

	it('beats the input order on linear arrangement cost', () => {
		// A path graph handed over in a deliberately scrambled order.
		const ids = ['e', 'a', 'd', 'b', 'c'];
		const edges = [edge('a', 'b'), edge('b', 'c'), edge('c', 'd'), edge('d', 'e')];
		const ordered = spectralOrder(ids, edges);
		expect(arrangementCost(ordered, edges)).toBeLessThan(arrangementCost(ids, edges));
	});

	it('recovers the sequence of a path graph', () => {
		const ids = ['c', 'e', 'a', 'd', 'b'];
		const edges = [edge('a', 'b'), edge('b', 'c'), edge('c', 'd'), edge('d', 'e')];
		const order = spectralOrder(ids, edges);
		// Either direction along the path is a correct seriation.
		expect(['abcde', 'edcba']).toContain(order.join(''));
	});

	it('is deterministic across repeated calls', () => {
		const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
		const edges = [edge('a', 'b', 3), edge('b', 'c', 2), edge('d', 'e', 4), edge('e', 'f', 1)];
		expect(spectralOrder(ids, edges)).toEqual(spectralOrder(ids, edges));
	});

	it('does not depend on the order the edges arrive in', () => {
		const ids = ['a', 'b', 'c', 'd', 'e'];
		const edges = [edge('a', 'b', 2), edge('b', 'c', 3), edge('c', 'd', 2), edge('d', 'e', 1)];
		expect(spectralOrder(ids, [...edges].reverse())).toEqual(spectralOrder(ids, edges));
	});

	it('returns every input id exactly once', () => {
		const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		const edges = [edge('a', 'c'), edge('c', 'g'), edge('b', 'd')];
		const order = spectralOrder(ids, edges);
		expect(order).toHaveLength(ids.length);
		expect([...order].sort()).toEqual([...ids].sort());
	});

	it('keeps the input order when there is nothing to cluster', () => {
		expect(spectralOrder(['a', 'b'], [edge('a', 'b')])).toEqual(['a', 'b']);
		expect(spectralOrder(['a', 'b', 'c'], [])).toEqual(['a', 'b', 'c']);
	});

	it('ignores self-loops and zero-weight edges', () => {
		const ids = ['a', 'b', 'c'];
		expect(spectralOrder(ids, [edge('a', 'a', 5), edge('b', 'c', 0)])).toEqual(ids);
	});

	it('tolerates edges naming unknown nodes', () => {
		const ids = ['a', 'b', 'c', 'd'];
		const order = spectralOrder(ids, [edge('a', 'b', 2), edge('a', 'ghost', 9)]);
		expect([...order].sort()).toEqual([...ids].sort());
	});

	it('handles a disconnected graph without dropping the isolated nodes', () => {
		const ids = ['a', 'b', 'c', 'lonely'];
		const order = spectralOrder(ids, [edge('a', 'b', 2), edge('b', 'c', 2)]);
		expect(order).toContain('lonely');
		expect(order).toHaveLength(4);
	});
});

describe('orderNodes', () => {
	const nodes = [
		{ id: 'beta', weight: 3 },
		{ id: 'alpha', weight: 9 },
		{ id: 'gamma', weight: 3 }
	];

	it('sorts heaviest first in weight mode, breaking ties on the id', () => {
		expect(orderNodes(nodes, [], 'weight').map((n) => n.id)).toEqual(['alpha', 'beta', 'gamma']);
	});

	it('sorts alphabetically in name mode', () => {
		expect(orderNodes(nodes, [], 'name').map((n) => n.id)).toEqual(['alpha', 'beta', 'gamma']);
	});

	it('seriates in cluster mode', () => {
		const clustered = [
			{ id: 'x1', weight: 1 },
			{ id: 'y1', weight: 1 },
			{ id: 'x2', weight: 1 },
			{ id: 'y2', weight: 1 }
		];
		const edges = [edge('x1', 'x2', 5), edge('y1', 'y2', 5)];
		const order = orderNodes(clustered, edges, 'cluster').map((n) => n.id);
		const pos = positions(order);
		// Each pair ends up adjacent rather than interleaved.
		expect(Math.abs(pos.get('x1')! - pos.get('x2')!)).toBe(1);
		expect(Math.abs(pos.get('y1')! - pos.get('y2')!)).toBe(1);
	});

	it('preserves every node in cluster mode', () => {
		const order = orderNodes(nodes, [edge('beta', 'gamma', 2)], 'cluster');
		expect(order).toHaveLength(3);
		expect(order.map((n) => n.id).sort()).toEqual(['alpha', 'beta', 'gamma']);
	});

	it('does not mutate the input array', () => {
		const input = [...nodes];
		orderNodes(input, [], 'weight');
		expect(input.map((n) => n.id)).toEqual(['beta', 'alpha', 'gamma']);
	});
});
