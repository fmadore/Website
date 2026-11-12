import { describe, expect, it } from 'vitest';
import { buildMatrix, legibleMatrixSize, matrixIntensity } from './networkMatrix';
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

	it('places intensity on a square-root ramp against the heaviest pair', () => {
		const m = buildMatrix(
			selected([node('a', 5), node('b', 5), node('c', 5)], [edge('a', 'b', 8), edge('b', 'c', 2)]),
			{ order: 'name' }
		);
		expect(m.maxWeight).toBe(8);
		const strong = m.cells.find((c) => c.weight === 8)!;
		const weak = m.cells.find((c) => c.weight === 2)!;
		expect(strong.intensity).toBe(1);
		// √(2/8): a linear ramp would have put it at 0.25.
		expect(weak.intensity).toBeCloseTo(0.5, 6);
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

describe('matrixIntensity', () => {
	it('keeps the order and the top of the scale', () => {
		expect(matrixIntensity(31, 31)).toBe(1);
		expect(matrixIntensity(0, 31)).toBe(0);
		const ramp = [1, 2, 4, 8, 16, 31].map((w) => matrixIntensity(w, 31));
		for (let i = 1; i < ramp.length; i++) expect(ramp[i]!).toBeGreaterThan(ramp[i - 1]!);
	});

	it('lifts the low counts off the palest end when one pair saturates', () => {
		// The keyword matrix: Islam × West Africa at 31, nearly everything else 1–5.
		expect(matrixIntensity(1, 31)).toBeCloseTo(0.18, 2);
		expect(matrixIntensity(4, 31)).toBeCloseTo(0.36, 2);
		expect(matrixIntensity(4, 31)).toBeGreaterThan(2 * (4 / 31));
	});
});

describe('legibleMatrixSize', () => {
	it('keeps labels at 8px or more by drawing fewer rows on a narrow plate', () => {
		const phone = legibleMatrixSize({ plateWidth: 343, fontSize: 9, labelSpace: 90, cell: 22 });
		expect(phone).toBe(13);
		// Check: the grid that many rows makes renders its type at ≥ 8px.
		const view = 90 + phone * 22 + 8;
		expect((343 / view) * 9).toBeGreaterThanOrEqual(8);
	});

	it('does not cap a desktop plate below the usual 25', () => {
		expect(
			legibleMatrixSize({ plateWidth: 820, fontSize: 11, labelSpace: 198, cell: 22 })
		).toBeGreaterThanOrEqual(25);
	});

	it('never goes below its floor', () => {
		expect(legibleMatrixSize({ plateWidth: 50, fontSize: 9, labelSpace: 90, cell: 22 })).toBe(6);
	});
});
