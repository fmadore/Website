import { describe, expect, it } from 'vitest';
import { buildMatrix } from './networkMatrix';
import { selectGraph } from './networkAggregation';
import type { NetworkEdge, NetworkNode, SelectedGraph } from './networkAggregation';

function node(id: string, weight: number, kind: NetworkNode['kind'] = 'entity'): NetworkNode {
	return { id, weight, items: [`${id} item`], kind };
}

function edge(
	source: string,
	target: string,
	weight: number,
	kind: NetworkEdge['kind'] = 'cooccurrence'
): NetworkEdge {
	return { source, target, weight, items: [`${source}+${target}`], kind };
}

function selected(nodes: NetworkNode[], edges: NetworkEdge[]): SelectedGraph {
	return selectGraph(nodes, edges, { maxNodes: 50 });
}

describe('buildMatrix', () => {
	it('emits both triangles so either axis can be scanned', () => {
		const m = buildMatrix(selected([node('a', 3), node('b', 2)], [edge('a', 'b', 4)]), {
			order: 'name'
		});
		expect(m.cells).toHaveLength(2);
		const coords = m.cells.map((c) => `${c.row},${c.col}`).sort();
		expect(coords).toEqual(['0,1', '1,0']);
	});

	it('normalises intensity against the heaviest pair', () => {
		const m = buildMatrix(
			selected([node('a', 5), node('b', 5), node('c', 5)], [edge('a', 'b', 8), edge('b', 'c', 2)]),
			{ order: 'name' }
		);
		expect(m.maxWeight).toBe(8);
		const strong = m.cells.find((c) => c.weight === 8)!;
		const weak = m.cells.find((c) => c.weight === 2)!;
		expect(strong.intensity).toBe(1);
		expect(weak.intensity).toBeCloseTo(0.25, 6);
	});

	it('drops the centre node of an egocentric network', () => {
		// The centre is joined to everyone by construction, so its row and column
		// would be solid ink carrying no information.
		const nodes = [
			node('me', 9, 'center'),
			node('a', 4, 'collaborator'),
			node('b', 3, 'collaborator')
		];
		const edges = [
			edge('me', 'a', 4, 'direct'),
			edge('me', 'b', 3, 'direct'),
			edge('a', 'b', 2, 'peer')
		];
		const m = buildMatrix(selectGraph(nodes, edges, { centerId: 'me', maxNodes: 10 }), {
			order: 'name'
		});
		expect(m.nodes.map((n) => n.id)).toEqual(['a', 'b']);
		expect(m.cells.every((c) => c.edge.kind !== 'direct')).toBe(true);
		expect(m.cells).toHaveLength(2);
	});

	it('never emits a diagonal cell', () => {
		const m = buildMatrix(
			selected([node('a', 3), node('b', 2)], [edge('a', 'a', 5), edge('a', 'b', 1)]),
			{ order: 'name' }
		);
		expect(m.cells.every((c) => c.row !== c.col)).toBe(true);
	});

	it('indexes every row by id', () => {
		const m = buildMatrix(
			selected([node('a', 3), node('b', 2), node('c', 1)], [edge('a', 'b', 1)]),
			{ order: 'name' }
		);
		expect(m.indexById.get('a')).toBe(0);
		expect(m.indexById.get('c')).toBe(2);
		expect(m.indexById.size).toBe(m.nodes.length);
	});

	it('keeps cell coordinates inside the matrix', () => {
		const nodes = Array.from({ length: 12 }, (_, i) => node(`n${i}`, 12 - i));
		const edges = nodes.slice(1).map((n, i) => edge(nodes[0]!.id, n.id, i + 1));
		const m = buildMatrix(selected(nodes, edges));
		for (const cell of m.cells) {
			expect(cell.row).toBeGreaterThanOrEqual(0);
			expect(cell.col).toBeGreaterThanOrEqual(0);
			expect(cell.row).toBeLessThan(m.nodes.length);
			expect(cell.col).toBeLessThan(m.nodes.length);
		}
	});

	it('orders rows by weight when asked', () => {
		const m = buildMatrix(
			selected([node('light', 1), node('heavy', 9), node('mid', 5)], [edge('light', 'heavy', 1)]),
			{ order: 'weight' }
		);
		expect(m.nodes.map((n) => n.id)).toEqual(['heavy', 'mid', 'light']);
	});

	it('clusters rows by default so blocks land on the diagonal', () => {
		// Two disjoint triples; a good ordering keeps each contiguous.
		const nodes = ['x1', 'x2', 'x3', 'y1', 'y2', 'y3'].map((id) => node(id, 3));
		const edges = [
			edge('x1', 'x2', 4),
			edge('x2', 'x3', 4),
			edge('x1', 'x3', 4),
			edge('y1', 'y2', 4),
			edge('y2', 'y3', 4),
			edge('y1', 'y3', 4)
		];
		const m = buildMatrix(selected(nodes, edges));
		const pos = new Map(m.nodes.map((n, i) => [n.id, i]));
		const xs = ['x1', 'x2', 'x3'].map((id) => pos.get(id)!).sort((a, b) => a - b);
		expect(xs[2]! - xs[0]!).toBe(2);
	});

	it('handles a graph with no edges', () => {
		const m = buildMatrix(selected([node('a', 2), node('b', 1)], []));
		expect(m.cells).toEqual([]);
		expect(m.maxWeight).toBe(1);
		expect(m.nodes).toHaveLength(2);
	});

	it('handles an empty selection', () => {
		const m = buildMatrix({ nodes: [], edges: [], maxWeight: 1 });
		expect(m.nodes).toEqual([]);
		expect(m.cells).toEqual([]);
		expect(m.indexById.size).toBe(0);
	});

	it('is deterministic for the same input', () => {
		const nodes = Array.from({ length: 9 }, (_, i) => node(`n${i}`, 9 - i));
		const edges = [
			edge('n0', 'n1', 3),
			edge('n1', 'n2', 2),
			edge('n3', 'n4', 4),
			edge('n5', 'n6', 1),
			edge('n7', 'n8', 2)
		];
		const a = buildMatrix(selected(nodes, edges));
		const b = buildMatrix(selected(nodes, edges));
		expect(a.nodes.map((n) => n.id)).toEqual(b.nodes.map((n) => n.id));
	});
});
