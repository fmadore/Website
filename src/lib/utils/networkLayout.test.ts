import { describe, expect, it } from 'vitest';
import {
	approximateTextWidth,
	computeNetworkLayout,
	fitTransform,
	nodeRadius,
	seededRandom
} from './networkLayout';
import { selectGraph } from './networkAggregation';
import type { NetworkEdge, NetworkNode, SelectedGraph } from './networkAggregation';

function node(id: string, weight: number, kind: NetworkNode['kind'] = 'entity'): NetworkNode {
	return { id, weight, items: Array.from({ length: weight }, (_, i) => `${id} item ${i}`), kind };
}

function edge(
	source: string,
	target: string,
	weight: number,
	kind: NetworkEdge['kind'] = 'cooccurrence'
): NetworkEdge {
	return { source, target, weight, items: [`${source}+${target}`], kind };
}

/** A small connected co-occurrence graph, used by most cases below. */
function sampleGraph(): SelectedGraph {
	const nodes = [node('Islam', 9), node('West Africa', 8), node('Togo', 5), node('Benin', 4)];
	const edges = [
		edge('Islam', 'West Africa', 6),
		edge('Islam', 'Togo', 3),
		edge('West Africa', 'Benin', 2),
		edge('Togo', 'Benin', 2)
	];
	return selectGraph(nodes, edges, { maxNodes: 10 });
}

const BOX = { width: 800, height: 500 };

describe('seededRandom', () => {
	it('produces a repeatable stream for a given seed', () => {
		const a = seededRandom(42);
		const b = seededRandom(42);
		const first = Array.from({ length: 5 }, () => a());
		const second = Array.from({ length: 5 }, () => b());
		expect(first).toEqual(second);
	});

	it('produces different streams for different seeds', () => {
		expect(seededRandom(1)()).not.toBe(seededRandom(2)());
	});

	it('stays within [0, 1)', () => {
		const random = seededRandom(7);
		for (let i = 0; i < 500; i++) {
			const value = random();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});
});

describe('selectGraph', () => {
	it('keeps only the top-N heaviest non-centre nodes', () => {
		const nodes = [node('a', 1), node('b', 5), node('c', 3), node('d', 4)];
		const selected = selectGraph(nodes, [], { maxNodes: 2 });
		expect(selected.nodes.map((n) => n.id)).toEqual(['b', 'd']);
	});

	it('always keeps the centre node and puts it first', () => {
		const nodes = [node('me', 20, 'center'), node('a', 5), node('b', 3)];
		const selected = selectGraph(nodes, [], { centerId: 'me', maxNodes: 1 });
		expect(selected.nodes.map((n) => n.id)).toEqual(['me', 'a']);
	});

	it('drops edges whose endpoints were not kept', () => {
		const nodes = [node('a', 5), node('b', 4), node('c', 1)];
		const edges = [edge('a', 'b', 2), edge('a', 'c', 2)];
		const selected = selectGraph(nodes, edges, { maxNodes: 2 });
		expect(selected.edges).toHaveLength(1);
		expect(selected.edges[0]!.target).toBe('b');
	});

	it('filters by edge kind but never hides direct spokes', () => {
		const nodes = [node('me', 9, 'center'), node('a', 5), node('b', 4)];
		const edges = [
			edge('me', 'a', 3, 'direct'),
			edge('a', 'b', 2, 'peer'),
			edge('a', 'b', 1, 'contributor')
		];
		const selected = selectGraph(nodes, edges, {
			centerId: 'me',
			maxNodes: 10,
			visibleEdgeKinds: ['peer']
		});
		expect(selected.edges.map((e) => e.kind).sort()).toEqual(['direct', 'peer']);
	});

	it('breaks weight ties on the id so selection is stable', () => {
		const forward = selectGraph([node('b', 3), node('a', 3), node('c', 3)], [], { maxNodes: 2 });
		const reversed = selectGraph([node('c', 3), node('a', 3), node('b', 3)], [], { maxNodes: 2 });
		expect(forward.nodes.map((n) => n.id)).toEqual(['a', 'b']);
		expect(reversed.nodes.map((n) => n.id)).toEqual(forward.nodes.map((n) => n.id));
	});

	it('reports the heaviest non-centre weight as maxWeight', () => {
		const selected = selectGraph([node('me', 50, 'center'), node('a', 7)], [], {
			centerId: 'me',
			maxNodes: 5
		});
		expect(selected.maxWeight).toBe(7);
	});

	it('returns an empty selection for an empty network', () => {
		expect(selectGraph([], [], { maxNodes: 10 })).toEqual({ nodes: [], edges: [], maxWeight: 1 });
	});
});

describe('nodeRadius', () => {
	it('scales with the square root of the weight, so area tracks it', () => {
		const quarter = nodeRadius(25, 100, false, false);
		const full = nodeRadius(100, 100, false, false);
		const min = nodeRadius(0, 100, false, false);
		// r(25/100) should sit halfway up the min..max range: sqrt(0.25) = 0.5
		expect(quarter - min).toBeCloseTo((full - min) / 2, 5);
	});

	it('gives the centre node a fixed, larger radius', () => {
		expect(nodeRadius(1, 100, true, false)).toBeGreaterThan(nodeRadius(100, 100, false, false));
	});

	it('draws smaller on mobile', () => {
		expect(nodeRadius(50, 100, false, true)).toBeLessThan(nodeRadius(50, 100, false, false));
	});

	it('never exceeds the maximum, even when weight overshoots maxWeight', () => {
		expect(nodeRadius(500, 100, false, false)).toBe(nodeRadius(100, 100, false, false));
	});
});

describe('computeNetworkLayout', () => {
	it('is deterministic: identical input yields identical positions', () => {
		const a = computeNetworkLayout(sampleGraph(), BOX);
		const b = computeNetworkLayout(sampleGraph(), BOX);
		expect(a.nodes.map((n) => [n.id, n.x, n.y])).toEqual(b.nodes.map((n) => [n.id, n.x, n.y]));
	});

	it('produces finite coordinates for every node', () => {
		const layout = computeNetworkLayout(sampleGraph(), BOX);
		for (const n of layout.nodes) {
			expect(Number.isFinite(n.x)).toBe(true);
			expect(Number.isFinite(n.y)).toBe(true);
		}
	});

	it('pins the centre node to the middle of the box', () => {
		const nodes = [
			node('me', 12, 'center'),
			node('a', 5, 'collaborator'),
			node('b', 3, 'collaborator')
		];
		const edges = [edge('me', 'a', 4, 'direct'), edge('me', 'b', 2, 'direct')];
		const layout = computeNetworkLayout(
			selectGraph(nodes, edges, { centerId: 'me', maxNodes: 10 }),
			BOX
		);
		const centre = layout.nodes.find((n) => n.kind === 'center')!;
		expect(centre.x).toBeCloseTo(BOX.width / 2, 6);
		expect(centre.y).toBeCloseTo(BOX.height / 2, 6);
	});

	it('preserves node identity, weight and items', () => {
		const selected = sampleGraph();
		const layout = computeNetworkLayout(selected, BOX);
		expect(layout.nodes.map((n) => n.id)).toEqual(selected.nodes.map((n) => n.id));
		expect(layout.nodes.map((n) => n.weight)).toEqual(selected.nodes.map((n) => n.weight));
		expect(layout.nodes[0]!.items).toEqual(selected.nodes[0]!.items);
	});

	it('passes the edges through untouched', () => {
		const selected = sampleGraph();
		expect(computeNetworkLayout(selected, BOX).edges).toEqual(selected.edges);
	});

	it('separates nodes by at least their combined radii', () => {
		const layout = computeNetworkLayout(sampleGraph(), BOX);
		for (let i = 0; i < layout.nodes.length; i++) {
			for (let j = i + 1; j < layout.nodes.length; j++) {
				const a = layout.nodes[i]!;
				const b = layout.nodes[j]!;
				const distance = Math.hypot(a.x - b.x, a.y - b.y);
				expect(distance).toBeGreaterThan(a.r + b.r);
			}
		}
	});

	it('handles an empty selection without throwing', () => {
		const layout = computeNetworkLayout({ nodes: [], edges: [], maxWeight: 1 }, BOX);
		expect(layout.nodes).toEqual([]);
		expect(layout.bounds).toEqual({ minX: 0, minY: 0, maxX: BOX.width, maxY: BOX.height });
	});

	it('handles a single isolated node', () => {
		const layout = computeNetworkLayout(selectGraph([node('lonely', 3)], [], { maxNodes: 5 }), BOX);
		expect(layout.nodes).toHaveLength(1);
		expect(Number.isFinite(layout.nodes[0]!.x)).toBe(true);
	});

	it('ignores edges pointing at nodes outside the selection', () => {
		const selected: SelectedGraph = {
			nodes: [node('a', 3), node('b', 2)],
			edges: [edge('a', 'b', 2), edge('a', 'ghost', 2)],
			maxWeight: 3
		};
		expect(() => computeNetworkLayout(selected, BOX)).not.toThrow();
	});
});

describe('label placement', () => {
	it('never overlaps two shown labels', () => {
		const nodes = Array.from({ length: 24 }, (_, i) => node(`Keyword number ${i}`, 24 - i));
		const edges = nodes.slice(1).map((n, i) => edge(nodes[0]!.id, n.id, 2 + (i % 3)));
		const layout = computeNetworkLayout(selectGraph(nodes, edges, { maxNodes: 24 }), BOX);

		const fontSize = 12;
		const boxes = layout.nodes
			.filter((n) => n.label.show)
			.map((n) => {
				const w = approximateTextWidth(n.label.text, fontSize);
				const x =
					n.label.anchor === 'start'
						? n.label.x
						: n.label.anchor === 'end'
							? n.label.x - w
							: n.label.x - w / 2;
				return { x0: x, x1: x + w, y0: n.label.y - fontSize, y1: n.label.y + fontSize * 0.3 };
			});

		for (let i = 0; i < boxes.length; i++) {
			for (let j = i + 1; j < boxes.length; j++) {
				const a = boxes[i]!;
				const b = boxes[j]!;
				const overlaps = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
				expect(overlaps).toBe(false);
			}
		}
	});

	it('always labels the centre node', () => {
		const nodes = [
			node('Frédérick Madore', 40, 'center'),
			...Array.from({ length: 20 }, (_, i) => node(`Collaborator ${i}`, 20 - i, 'collaborator'))
		];
		const edges = nodes.slice(1).map((n) => edge('Frédérick Madore', n.id, n.weight, 'direct'));
		const layout = computeNetworkLayout(
			selectGraph(nodes, edges, { centerId: 'Frédérick Madore', maxNodes: 20 }),
			BOX
		);
		const centre = layout.nodes.find((n) => n.kind === 'center')!;
		expect(centre.label.show).toBe(true);
		expect(centre.label.text).toBe('Frédérick Madore');
	});

	it('truncates labels longer than maxLabelChars', () => {
		const long = 'An extremely long keyword label that will not fit anywhere';
		const layout = computeNetworkLayout(selectGraph([node(long, 3)], [], { maxNodes: 5 }), {
			...BOX,
			maxLabelChars: 12
		});
		const label = layout.nodes[0]!.label;
		expect(label.text.length).toBeLessThanOrEqual(12);
		expect(label.text.endsWith('…')).toBe(true);
	});

	it('honours an injected text measurer when placing labels', () => {
		const nodes = Array.from({ length: 12 }, (_, i) => node(`Node ${i}`, 12 - i));
		const edges = nodes.slice(1).map((n) => edge(nodes[0]!.id, n.id, 2));
		const selected = selectGraph(nodes, edges, { maxNodes: 12 });

		const narrow = computeNetworkLayout(selected, { ...BOX, measureText: () => 4 });
		const wide = computeNetworkLayout(selected, { ...BOX, measureText: () => 400 });

		// Same simulation, different label metrics: the wide run must claim more
		// horizontal room and so end up with a wider bounding box.
		expect(wide.bounds.maxX - wide.bounds.minX).toBeGreaterThan(
			narrow.bounds.maxX - narrow.bounds.minX
		);
	});

	it('drops labels that cannot find clear space', () => {
		// `ticks: 0` leaves the nodes on d3-force's tightly packed phyllotaxis
		// seed, so wide labels are guaranteed to contend for the same space.
		// The losers must be hidden rather than overprinted.
		const nodes = Array.from({ length: 40 }, (_, i) => node(`Keyword ${i}`, 40 - i));
		const edges = nodes.slice(1).map((n) => edge(nodes[0]!.id, n.id, 2));
		const layout = computeNetworkLayout(selectGraph(nodes, edges, { maxNodes: 40 }), {
			...BOX,
			ticks: 0,
			measureText: () => 120
		});
		const shown = layout.nodes.filter((n) => n.label.show).length;
		expect(shown).toBeGreaterThan(0);
		expect(shown).toBeLessThan(layout.nodes.length);
	});

	it('spends the available label space on the heaviest nodes', () => {
		// Placement is greedy by weight: nodes get first pick in weight order, so
		// crowding should cost the tail rather than the entries a reader is most
		// likely looking for. (First pick is not a guarantee — a node can still
		// lose every slot to a neighbouring disc — so this asserts the skew.)
		const nodes = Array.from({ length: 40 }, (_, i) => node(`Keyword ${i}`, 40 - i));
		const edges = nodes.slice(1).map((n) => edge(nodes[0]!.id, n.id, 2));
		const layout = computeNetworkLayout(selectGraph(nodes, edges, { maxNodes: 40 }), {
			...BOX,
			ticks: 0,
			measureText: () => 120
		});

		const mean = (list: typeof layout.nodes) =>
			list.reduce((sum, n) => sum + n.weight, 0) / Math.max(1, list.length);
		const shown = layout.nodes.filter((n) => n.label.show);
		const hidden = layout.nodes.filter((n) => !n.label.show);

		expect(shown.length).toBeGreaterThan(0);
		expect(hidden.length).toBeGreaterThan(0);
		expect(mean(shown)).toBeGreaterThan(mean(hidden));
	});

	it('measures bounds with the same measurer used for placement', () => {
		// Guards the fit transform: measuring the box with a different metric
		// than the placement would let the widest labels get clipped.
		const selected = sampleGraph();
		const layout = computeNetworkLayout(selected, { ...BOX, measureText: () => 300 });
		const labelled = layout.nodes.filter((n) => n.label.show);
		expect(labelled.length).toBeGreaterThan(0);
		for (const n of labelled) {
			const x =
				n.label.anchor === 'start'
					? n.label.x
					: n.label.anchor === 'end'
						? n.label.x - 300
						: n.label.x - 150;
			expect(x).toBeGreaterThanOrEqual(layout.bounds.minX);
			expect(x + 300).toBeLessThanOrEqual(layout.bounds.maxX);
		}
	});

	it('honours maxLabels, spending the budget on the heaviest nodes', () => {
		const nodes = Array.from({ length: 20 }, (_, i) => node(`Keyword ${i}`, 20 - i));
		const edges = nodes.slice(1).map((n) => edge(nodes[0]!.id, n.id, 2));
		const layout = computeNetworkLayout(selectGraph(nodes, edges, { maxNodes: 20 }), {
			...BOX,
			maxLabels: 5
		});
		const shown = layout.nodes.filter((n) => n.label.show);
		expect(shown).toHaveLength(5);
		// The five heaviest weights are 20..16.
		expect(shown.map((n) => n.weight).sort((a, b) => b - a)).toEqual([20, 19, 18, 17, 16]);
	});

	it('labels the centre even when the budget is exhausted', () => {
		const nodes = [
			node('me', 1, 'center'),
			...Array.from({ length: 10 }, (_, i) => node(`Peer ${i}`, 10 - i, 'collaborator'))
		];
		const edges = nodes.slice(1).map((n) => edge('me', n.id, n.weight, 'direct'));
		const layout = computeNetworkLayout(
			selectGraph(nodes, edges, { centerId: 'me', maxNodes: 10 }),
			{ ...BOX, maxLabels: 2 }
		);
		expect(layout.nodes.find((n) => n.kind === 'center')!.label.show).toBe(true);
	});

	it('reports bounds that contain every node disc', () => {
		const layout = computeNetworkLayout(sampleGraph(), BOX);
		for (const n of layout.nodes) {
			expect(n.x - n.r).toBeGreaterThanOrEqual(layout.bounds.minX);
			expect(n.x + n.r).toBeLessThanOrEqual(layout.bounds.maxX);
			expect(n.y - n.r).toBeGreaterThanOrEqual(layout.bounds.minY);
			expect(n.y + n.r).toBeLessThanOrEqual(layout.bounds.maxY);
		}
	});
});

describe('fitTransform', () => {
	it('centres content that is smaller than the box without magnifying it', () => {
		const fit = fitTransform({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, 800, 500);
		expect(fit.k).toBe(1);
		// Content centre (50, 50) should land at the box centre (400, 250).
		expect(50 * fit.k + fit.x).toBeCloseTo(400, 6);
		expect(50 * fit.k + fit.y).toBeCloseTo(250, 6);
	});

	it('shrinks content that overflows the box', () => {
		const fit = fitTransform({ minX: 0, minY: 0, maxX: 1600, maxY: 1000 }, 800, 500, 0);
		expect(fit.k).toBeCloseTo(0.5, 6);
	});

	it('fits both axes, taking the tighter constraint', () => {
		const fit = fitTransform({ minX: 0, minY: 0, maxX: 800, maxY: 2000 }, 800, 500, 0);
		expect(fit.k).toBeCloseTo(0.25, 6);
	});

	it('leaves room for the padding', () => {
		const fit = fitTransform({ minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, 500, 500, 50);
		expect(fit.k).toBeCloseTo(0.4, 6);
	});

	it('keeps the transform finite for degenerate bounds', () => {
		const fit = fitTransform({ minX: 5, minY: 5, maxX: 5, maxY: 5 }, 800, 500);
		expect(Number.isFinite(fit.k)).toBe(true);
		expect(Number.isFinite(fit.x)).toBe(true);
		expect(Number.isFinite(fit.y)).toBe(true);
	});
});
