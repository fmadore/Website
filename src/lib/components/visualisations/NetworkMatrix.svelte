<!--
NetworkMatrix — a seriated adjacency matrix for co-occurrence networks
(keywords, tags).

Why not a node-link graph: at the sizes this site plots — 25 terms, ~95 pairs,
density ≈ 0.32 — every node is a hop or two from every other, so a force
layout's positions encode almost nothing and the edges become texture. The
matrix draws exactly the same data with no overlap at all: one cell per pair,
ink density for strength. Rows are ordered by spectral seriation, so thematic
blocks gather on the diagonal instead of being scattered around a hairball.

It is also the site's own idiom rather than a borrowed one: a matrix is a
ledger — ruled, gridded, set in the data voice.
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import { getResolvedChartColors, colorWithOpacity } from '$lib/utils/chartColorUtils';
	import { downloadSvgAsImage } from '$lib/utils/chartActions';
	import ChartToolbar from './ChartToolbar.svelte';
	import NetworkTooltip from './NetworkTooltip.svelte';
	import type { TooltipContent } from './NetworkTooltip.svelte';
	import { selectGraph } from '$lib/utils/networkAggregation';
	import type { NetworkEdge, NetworkNode } from '$lib/utils/networkAggregation';
	import { buildMatrix } from '$lib/utils/networkMatrix';
	import type { NodeOrder } from '$lib/utils/seriation';
	import '$styles/components/network-viz.css';

	let {
		nodes = [] as NetworkNode[],
		edges = [] as NetworkEdge[],
		maxNodes = 25,
		highlightQuery = '',
		order = 'cluster' as NodeOrder,
		labels = {} as {
			itemSingular?: string;
			itemPlural?: string;
			entityNode?: string;
			pairLabel?: string;
			sharedLabel?: string;
		},
		filename = 'network-matrix',
		ariaDescription = undefined
	}: {
		nodes?: NetworkNode[];
		edges?: NetworkEdge[];
		maxNodes?: number;
		highlightQuery?: string;
		order?: NodeOrder;
		labels?: {
			itemSingular?: string;
			itemPlural?: string;
			entityNode?: string;
			pairLabel?: string;
			sharedLabel?: string;
		};
		filename?: string;
		ariaDescription?: string;
	} = $props();

	const copy = $derived({
		itemSingular: labels.itemSingular ?? 'publication',
		itemPlural: labels.itemPlural ?? 'Publications',
		entityNode: labels.entityNode ?? 'Terms',
		pairLabel: labels.pairLabel ?? 'Co-occurrence',
		sharedLabel: labels.sharedLabel ?? 'Shared items'
	});

	let outerContainer = $state<HTMLDivElement>(undefined!);
	let plotArea = $state<HTMLDivElement>(undefined!);
	let svgEl = $state<SVGSVGElement>(undefined!);
	let areaWidth = $state(900);

	const isMobile = $derived((innerWidth.current ?? 1024) < 768);
	const colors = $derived(getResolvedChartColors());

	// --- Model -------------------------------------------------------------
	const selection = $derived(selectGraph(nodes, edges, { maxNodes }));
	const matrix = $derived(buildMatrix(selection, { order }));
	const n = $derived(matrix.nodes.length);

	// --- Geometry ----------------------------------------------------------
	// Drawn at a natural size and scaled to the plate through the viewBox, so
	// the grid always fits its width and the cells stay square.
	const fontSize = $derived(isMobile ? 9 : 11);
	const cell = 22;
	/** Room for the row labels; the column labels reuse it, rotated. */
	const labelSpace = $derived(Math.min(220, Math.max(90, areaWidth * 0.22)));
	const gridSize = $derived(n * cell);
	const viewWidth = $derived(labelSpace + gridSize + 8);
	const viewHeight = $derived(labelSpace + gridSize + 8);

	/** Cap on the drawn side, so a large top-N cannot swallow the page. */
	const MAX_SIDE = 820;

	/**
	 * The grid is square, so it is sized from its own aspect rather than a
	 * height handed down by the page: full width on a narrow screen (no dead
	 * space below it), capped at MAX_SIDE on a wide one.
	 * Below roughly 8px of rendered type the labels stop being readable, so they
	 * are dropped and the grid degrades to a heatmap — still legible as block
	 * structure, with the tooltip carrying the detail.
	 */
	const renderScale = $derived(viewWidth > 0 ? Math.min(areaWidth, MAX_SIDE) / viewWidth : 1);
	const showLabels = $derived(n > 0 && fontSize * renderScale >= 8);

	function truncate(text: string, max: number): string {
		return text.length > max ? text.slice(0, Math.max(1, max - 1)) + '…' : text;
	}
	const maxLabelChars = $derived(Math.floor(labelSpace / (fontSize * 0.6)));

	// --- Highlight ---------------------------------------------------------
	function fold(value: string): string {
		return value
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '');
	}
	const foldedQuery = $derived(fold(highlightQuery.trim()));
	// Collected as an array and frozen into a Set at the end: the derived
	// recomputes wholesale, so nothing mutates the Set after it is read.
	const matchedIndices = $derived.by(() => {
		if (!foldedQuery) return undefined;
		const indices = matrix.nodes
			.map((node, i) => (fold(node.id).includes(foldedQuery) ? i : -1))
			.filter((i) => i >= 0);
		return new Set(indices);
	});

	/** Row/column under the pointer — the reading cross. */
	let hoverRow = $state<number | null>(null);
	let hoverCol = $state<number | null>(null);

	function cellDimmed(row: number, col: number): boolean {
		if (hoverRow !== null || hoverCol !== null) {
			return !(row === hoverRow || col === hoverCol);
		}
		if (matchedIndices) return !(matchedIndices.has(row) || matchedIndices.has(col));
		return false;
	}

	function labelDimmed(index: number): boolean {
		if (hoverRow !== null || hoverCol !== null) return index !== hoverRow && index !== hoverCol;
		if (matchedIndices) return !matchedIndices.has(index);
		return false;
	}

	// --- Tooltip -----------------------------------------------------------
	let tooltip = $state<{ content: TooltipContent; x: number; y: number } | null>(null);

	function summarise(items: string[], limit = 6): string[] {
		return items.length <= limit
			? items
			: [...items.slice(0, limit), `…and ${items.length - limit} more`];
	}

	function showCellTooltip(
		event: PointerEvent | FocusEvent,
		row: number,
		col: number,
		edge: NetworkEdge
	) {
		hoverRow = row;
		hoverCol = col;
		const a = matrix.nodes[row]!;
		const b = matrix.nodes[col]!;
		const content: TooltipContent = {
			title: `${a.id} × ${b.id}`,
			meta: `${copy.sharedLabel}: ${edge.weight}`,
			lines: summarise(edge.items)
		};
		place(event, content);
	}

	function showRowTooltip(event: PointerEvent | FocusEvent, index: number) {
		hoverRow = index;
		hoverCol = index;
		const node = matrix.nodes[index]!;
		place(event, {
			title: node.id,
			meta: `${copy.itemPlural}: ${node.weight}`,
			lines: summarise(node.items)
		});
	}

	function place(event: PointerEvent | FocusEvent, content: TooltipContent) {
		if (!plotArea) return;
		const rect = plotArea.getBoundingClientRect();
		const point =
			'clientX' in event
				? { x: event.clientX, y: event.clientY }
				: (() => {
						const target = (event.target as Element).getBoundingClientRect();
						return { x: target.left + target.width / 2, y: target.top + target.height / 2 };
					})();
		tooltip = {
			content,
			x: Math.max(0, Math.min(point.x - rect.left + 14, rect.width - 8)),
			y: Math.max(0, Math.min(point.y - rect.top + 14, rect.height - 8))
		};
	}

	function clearHover() {
		hoverRow = null;
		hoverCol = null;
		tooltip = null;
	}

	// --- Accessibility -----------------------------------------------------
	const effectiveAriaDescription = $derived.by(() => {
		if (ariaDescription) return ariaDescription;
		if (n === 0) return 'Empty co-occurrence matrix.';
		const strongest = [...matrix.cells]
			.filter((c) => c.row < c.col)
			.sort((a, b) => b.weight - a.weight)
			.slice(0, 3)
			.map((c) => `${matrix.nodes[c.row]!.id} with ${matrix.nodes[c.col]!.id} (${c.weight})`)
			.join(', ');
		return `Co-occurrence matrix of ${n} ${copy.entityNode.toLowerCase()}, ordered so related entries sit together. Strongest pairs: ${strongest}.`;
	});

	/** Ink ramp: pale wash at weight 1, solid ink at the heaviest pair. */
	function cellFill(intensity: number): string {
		return colorWithOpacity(colors.primary, 0.12 + intensity * 0.78);
	}

	function handleDownload() {
		if (svgEl) void downloadSvgAsImage(svgEl, filename, colors.surface);
	}
</script>

<div class="viz-plate scroll-reveal-scale" bind:this={outerContainer}>
	<ChartToolbar
		chart={null}
		onDownload={handleDownload}
		showDecalToggle={false}
		showFullscreen={true}
		fullscreenTarget={outerContainer}
		{filename}
	/>

	<div
		class="viz-plate-area viz-plate-area--fixed"
		bind:this={plotArea}
		bind:clientWidth={areaWidth}
	>
		<!-- The pointer handler only clears the reading cross on exit. -->
		<!-- `meet` scales the square grid to fit whichever of the plate's two
		     dimensions is tighter, so the matrix is always whole: no clipping, no
		     scrollbar, and the cells stay square at any row count. -->
		<svg
			bind:this={svgEl}
			class="matrix-svg"
			viewBox="0 0 {viewWidth} {viewHeight}"
			preserveAspectRatio="xMidYMid meet"
			role="img"
			aria-label={effectiveAriaDescription}
			onpointerleave={clearHover}
		>
			<!-- Column labels, rotated a quarter turn so they read bottom-to-top. -->
			{#if showLabels}
				<g class="labels">
					{#each matrix.nodes as node, i (node.id)}
						{@const x = labelSpace + i * cell + cell / 2}
						<text
							class="matrix-label"
							class:matrix-label--dim={labelDimmed(i)}
							class:matrix-label--hit={i === hoverRow || i === hoverCol}
							transform="translate({x},{labelSpace - 6}) rotate(-90)"
							text-anchor="start"
							dominant-baseline="middle"
							fill={colors.text}
							font-family={colors.fontFamily}
							font-size={fontSize}>{truncate(node.id, maxLabelChars)}</text
						>
					{/each}

					{#each matrix.nodes as node, i (node.id)}
						{@const y = labelSpace + i * cell + cell / 2}
						<text
							class="matrix-label"
							class:matrix-label--dim={labelDimmed(i)}
							class:matrix-label--hit={i === hoverRow || i === hoverCol}
							x={labelSpace - 6}
							{y}
							text-anchor="end"
							dominant-baseline="middle"
							fill={colors.text}
							font-family={colors.fontFamily}
							font-size={fontSize}>{truncate(node.id, maxLabelChars)}</text
						>
					{/each}
				</g>
			{/if}

			<!-- Grid rules: a hairline lattice, so empty cells still read as a table. -->
			<g class="grid" stroke={colors.border} stroke-width="0.5" opacity="0.55">
				{#each Array(n + 1) as _, i (i)}
					<line
						x1={labelSpace}
						y1={labelSpace + i * cell}
						x2={labelSpace + gridSize}
						y2={labelSpace + i * cell}
					/>
					<line
						x1={labelSpace + i * cell}
						y1={labelSpace}
						x2={labelSpace + i * cell}
						y2={labelSpace + gridSize}
					/>
				{/each}
			</g>

			<!-- The diagonal is the identity: hatched, never a value. -->
			<g class="diagonal">
				{#each matrix.nodes as node, i (node.id)}
					<rect
						x={labelSpace + i * cell}
						y={labelSpace + i * cell}
						width={cell}
						height={cell}
						fill={colorWithOpacity(colors.textLight, 0.18)}
					/>
				{/each}
			</g>

			<!-- Cells. One triangle is focusable so the matrix is keyboard-readable
			     without doubling the tab stops on its mirror image. -->
			<g class="cells">
				{#each matrix.cells as c (`${c.row}-${c.col}`)}
					<!-- A focusable graphic that reveals its description on focus is the
					     documented SVG pattern; role="button" would be a lie here. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<rect
						class="matrix-cell"
						class:matrix-cell--dim={cellDimmed(c.row, c.col)}
						x={labelSpace + c.col * cell}
						y={labelSpace + c.row * cell}
						width={cell}
						height={cell}
						fill={cellFill(c.intensity)}
						tabindex={c.row < c.col ? 0 : -1}
						role="img"
						aria-label="{matrix.nodes[c.row]!.id} and {matrix.nodes[c.col]!
							.id}: {c.weight} shared {c.weight === 1
							? copy.itemSingular
							: copy.itemPlural.toLowerCase()}"
						onpointerenter={(e) => showCellTooltip(e, c.row, c.col, c.edge)}
						onpointermove={(e) => showCellTooltip(e, c.row, c.col, c.edge)}
						onfocus={(e) => showCellTooltip(e, c.row, c.col, c.edge)}
						onblur={clearHover}
					/>
				{/each}
			</g>

			<!-- Row/column hit strips: hovering a label lights its whole line. -->
			{#if showLabels}
				<g class="label-hits">
					{#each matrix.nodes as node, i (node.id)}
						<rect
							class="label-hit"
							x="0"
							y={labelSpace + i * cell}
							width={labelSpace}
							height={cell}
							fill="transparent"
							role="img"
							aria-label="{node.id}: {node.weight} {node.weight === 1
								? copy.itemSingular
								: copy.itemPlural.toLowerCase()}"
							onpointerenter={(e) => showRowTooltip(e, i)}
							onpointermove={(e) => showRowTooltip(e, i)}
						/>
					{/each}
				</g>
			{/if}
		</svg>

		{#if tooltip}
			<NetworkTooltip content={tooltip.content} x={tooltip.x} y={tooltip.y} />
		{/if}
	</div>

	<div class="viz-legend">
		<span class="viz-legend-entry">
			{copy.entityNode}: {n}
		</span>
		<span class="viz-legend-entry">
			<span
				class="viz-legend-ramp"
				style="background: linear-gradient(to right, {cellFill(0)}, {cellFill(1)})"
			></span>
			1 – {matrix.maxWeight}
			{copy.sharedLabel.toLowerCase()}
		</span>
		<span class="viz-legend-entry">Ordered so related entries sit together</span>
	</div>

	<!-- A real table is the accessible reading of a matrix; the cells above are
	     focusable too, but this gives the whole thing to a screen reader at once. -->
	<table class="sr-only">
		<caption>{effectiveAriaDescription}</caption>
		<tbody>
			{#each matrix.nodes as node (node.id)}
				<tr>
					<th scope="row">{node.id}</th>
					<td>
						{node.weight}
						{node.weight === 1 ? copy.itemSingular : copy.itemPlural.toLowerCase()}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* Square by viewBox, so `height: auto` makes the plate exactly as tall as
	   the grid is wide — no letterboxing on mobile, no runaway on desktop. */
	.matrix-svg {
		display: block;
		width: 100%;
		max-width: 820px;
		height: auto;
		margin: 0 auto;
	}

	/* Instant state change — the register is print, not app. */
	.matrix-cell--dim,
	.matrix-label--dim {
		opacity: var(--opacity-20, 0.2);
	}

	.matrix-cell {
		cursor: pointer;
	}

	.matrix-cell:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: -1px;
	}

	.matrix-label {
		pointer-events: none;
	}

	/* The row and column under the cross take the accent — "the current thing". */
	.matrix-label--hit {
		fill: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	.label-hit {
		cursor: pointer;
	}
</style>
