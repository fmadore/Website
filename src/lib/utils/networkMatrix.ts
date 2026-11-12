/**
 * Adjacency-matrix model for the co-occurrence networks.
 *
 * A node-link diagram of a co-occurrence corpus is a hairball: at the sizes
 * this site plots (25 keywords, ~95 pairs, density ≈ 0.32) every node is a few
 * hops from every other, so the layout encodes almost nothing and the edges
 * become texture. A matrix reads the same data exactly: one cell per pair, ink
 * density for strength, and — once the rows are seriated — thematic blocks on
 * the diagonal.
 *
 * It is also the right idiom for this site: a matrix *is* a ledger, set in the
 * data voice, ruled rather than drawn.
 */
import type { NetworkEdge, NetworkNode, SelectedGraph } from '#lib/utils/networkAggregation.ts';
import { orderNodes, type NodeOrder } from '#lib/utils/seriation.ts';

export interface MatrixCell {
	/** Row / column indices into `nodes`. */
	row: number;
	col: number;
	/** Shared-item count for the pair. */
	weight: number;
	/** Position on the ink ramp, 0–1 (`matrixIntensity`: square-root scale). */
	intensity: number;
	edge: NetworkEdge;
}

export interface NetworkMatrix {
	/** Row order — also the column order; the matrix is symmetric. */
	nodes: NetworkNode[];
	/** Off-diagonal cells only, both triangles (so hover can light a full cross). */
	cells: MatrixCell[];
	/** Heaviest pair, the top of the ink ramp. */
	maxWeight: number;
	/** Index lookup for the hover cross and the sr-only table. */
	indexById: Map<string, number>;
}

/**
 * Where a pair sits on the ink ramp: `√(weight / maxWeight)`.
 *
 * A linear ramp let one pair decide the whole plate. In the keyword matrix
 * Islam × West Africa shares 31 publications and nearly every other pair 1–5,
 * so on `weight / max` they all sat in the palest sixth of the ramp and the
 * block structure the seriation finds was invisible. The square root keeps the
 * order and the top of the scale, and spreads the low counts where most of the
 * data is: 1 of 31 lands at 0.18 rather than 0.03, 4 of 31 at 0.36 rather than
 * 0.13. The legend says so.
 */
export function matrixIntensity(weight: number, maxWeight: number): number {
	if (maxWeight <= 0 || weight <= 0) return 0;
	return Math.min(1, Math.sqrt(weight / maxWeight));
}

/**
 * The most rows a plate can draw with its labels still legible: the grid is
 * scaled to the plate, and below `minRenderedFont` px of rendered type the
 * labels stop being readable. Never fewer than `floor` rows.
 */
export function legibleMatrixSize(options: {
	plateWidth: number;
	fontSize: number;
	labelSpace: number;
	cell: number;
	minRenderedFont?: number;
	floor?: number;
	/** Extra margin in the viewBox beyond labels and grid. */
	margin?: number;
}): number {
	const {
		plateWidth,
		fontSize,
		labelSpace,
		cell,
		minRenderedFont = 8,
		floor = 6,
		margin = 8
	} = options;
	const widestView = (plateWidth * fontSize) / minRenderedFont;
	return Math.max(floor, Math.floor((widestView - labelSpace - margin) / cell));
}

/**
 * Build the matrix for a selected graph.
 *
 * Cells are emitted for both `(i,j)` and `(j,i)` — the extra half costs
 * nothing at these sizes and lets the reader scan from either axis, which is
 * the main ergonomic advantage a matrix has over a triangle.
 */
export function buildMatrix(
	selected: SelectedGraph,
	options: { order?: NodeOrder } = {}
): NetworkMatrix {
	const { order = 'cluster' } = options;

	// The centre of an egocentric network is connected to everything by
	// construction, so it would be a solid row and column of no information.
	const nodes = orderNodes(
		selected.nodes.filter((n) => n.kind !== 'center'),
		selected.edges,
		order
	);
	const indexById = new Map(nodes.map((n, i) => [n.id, i]));

	const relevant = selected.edges.filter(
		(e) => e.kind !== 'direct' && indexById.has(e.source) && indexById.has(e.target)
	);
	const maxWeight = relevant.reduce((m, e) => Math.max(m, e.weight), 1);

	const cells: MatrixCell[] = [];
	for (const edge of relevant) {
		const i = indexById.get(edge.source)!;
		const j = indexById.get(edge.target)!;
		if (i === j) continue;
		const intensity = matrixIntensity(edge.weight, maxWeight);
		cells.push({ row: i, col: j, weight: edge.weight, intensity, edge });
		cells.push({ row: j, col: i, weight: edge.weight, intensity, edge });
	}

	return { nodes, cells, maxWeight, indexById };
}
