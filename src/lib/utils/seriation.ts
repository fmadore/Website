/**
 * Seriation — choosing the order in which nodes are listed.
 *
 * A node-link diagram places nodes in space; a matrix and an arc diagram place
 * them in a *sequence*, and that sequence is the whole design. Order the rows
 * badly and a matrix is confetti; order them well and the thematic blocks fall
 * out on the diagonal on their own.
 *
 * The clustering order here is the classic spectral one: sort by the Fiedler
 * vector (the eigenvector of the graph Laplacian's second-smallest eigenvalue),
 * which is the continuous relaxation of the minimum linear arrangement — it
 * puts strongly connected nodes near each other on the line. It is computed by
 * power iteration from a fixed start vector, so the ordering is deterministic:
 * the same corpus always produces the same matrix.
 */

/** The minimum an edge needs for seriation: two endpoints and a strength. */
export interface WeightedEdge {
	source: string;
	target: string;
	weight: number;
}

export type NodeOrder = 'cluster' | 'weight' | 'name';

/**
 * Dominant eigenvector of `A` (symmetric, n×n) restricted to the subspace
 * orthogonal to the all-ones vector, by power iteration.
 *
 * Re-orthogonalising against 1 on every step is what deflates away the
 * Laplacian's known null vector, leaving the Fiedler direction dominant.
 */
function dominantOrthogonalEigenvector(A: number[][], n: number, iterations = 256): number[] {
	// Deterministic, non-degenerate start: cos(i) has no symmetry that would
	// leave it orthogonal to the vector we are looking for.
	let v = Array.from({ length: n }, (_, i) => Math.cos(i + 1));

	const orthonormalise = (x: number[]): number[] => {
		const mean = x.reduce((s, xi) => s + xi, 0) / n;
		const centred = x.map((xi) => xi - mean);
		const norm = Math.hypot(...centred);
		return norm < 1e-12 ? centred : centred.map((xi) => xi / norm);
	};

	v = orthonormalise(v);

	for (let it = 0; it < iterations; it++) {
		const next = new Array<number>(n).fill(0);
		for (let i = 0; i < n; i++) {
			const row = A[i]!;
			let sum = 0;
			for (let j = 0; j < n; j++) sum += row[j]! * v[j]!;
			next[i] = sum;
		}
		const normalised = orthonormalise(next);
		// Degenerate (empty or fully symmetric) — keep the last good vector.
		if (normalised.every((x) => x === 0)) return v;
		v = normalised;
	}
	return v;
}

/**
 * Order `ids` so that strongly connected nodes sit near each other.
 *
 * Falls back to the input order when there is nothing to cluster (fewer than
 * three nodes, or no edges at all), which keeps the caller's ranking intact
 * rather than scrambling it for no gain.
 */
export function spectralOrder(ids: string[], edges: WeightedEdge[]): string[] {
	const n = ids.length;
	if (n < 3 || edges.length === 0) return [...ids];

	const index = new Map(ids.map((id, i) => [id, i]));

	// Weighted adjacency + degrees.
	const W: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
	const degree = new Array<number>(n).fill(0);
	let hasEdge = false;
	for (const edge of edges) {
		const i = index.get(edge.source);
		const j = index.get(edge.target);
		if (i === undefined || j === undefined || i === j) continue;
		const w = Math.max(0, edge.weight);
		if (w === 0) continue;
		W[i]![j]! += w;
		W[j]![i]! += w;
		degree[i]! += w;
		degree[j]! += w;
		hasEdge = true;
	}
	if (!hasEdge) return [...ids];

	// M = cI - L = cI - (D - W). Its dominant eigenvector (orthogonal to 1) is
	// the Laplacian's Fiedler vector: the shift flips the spectrum so the
	// *smallest* non-trivial eigenvalue of L becomes the largest of M.
	const c = 2 * Math.max(...degree) + 1;
	const M: number[][] = Array.from({ length: n }, (_, i) =>
		Array.from({ length: n }, (_, j) => (i === j ? c - degree[i]! : W[i]![j]!))
	);

	const fiedler = dominantOrthogonalEigenvector(M, n);

	return ids
		.map((id, i) => ({ id, key: fiedler[i]!, i }))
		.sort((a, b) => a.key - b.key || a.i - b.i)
		.map((entry) => entry.id);
}

/** A node as far as ordering is concerned. */
export interface OrderableNode {
	id: string;
	weight: number;
}

/**
 * Order nodes for a sequence-based chart.
 *
 * - `cluster` — spectral seriation; the default for matrices, where the point
 *   is to reveal blocks.
 * - `weight`  — heaviest first; the ledger's ranked idiom.
 * - `name`    — alphabetical, for looking a known entry up.
 *
 * Every mode breaks ties on the id so the result is stable across builds.
 */
export function orderNodes<T extends OrderableNode>(
	nodes: T[],
	edges: WeightedEdge[],
	order: NodeOrder
): T[] {
	if (order === 'weight') {
		return [...nodes].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
	}
	if (order === 'name') {
		return [...nodes].sort((a, b) => a.id.localeCompare(b.id));
	}
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const sequence = spectralOrder(
		nodes.map((n) => n.id),
		edges
	);
	return sequence.map((id) => byId.get(id)!).filter(Boolean);
}
