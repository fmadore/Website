<script lang="ts">
	/**
	 * Interactive controls for a network graph section: a top-N slider, edge-kind
	 * toggle chips, and a diacritic-insensitive search box. Placed above the
	 * VizChartCard (the LanguageToggle precedent); the chart consumes the bound
	 * values as plain props and reacts declaratively.
	 *
	 * Two-way bind:
	 *   <NetworkControls bind:topN bind:visibleKinds bind:searchQuery … />
	 */
	import RangeSlider from '$lib/components/atoms/RangeSlider.svelte';
	import type { NetworkEdgeKind } from '$lib/utils/networkAggregation';

	let {
		topN = $bindable(20),
		minN = 5,
		maxN,
		edgeKindOptions = [],
		visibleKinds = $bindable<NetworkEdgeKind[]>([]),
		searchQuery = $bindable(''),
		searchLabel = 'Search',
		searchPlaceholder = 'Type a name…',
		entityLabel = 'nodes',
		suggestions = []
	}: {
		topN?: number;
		minN?: number;
		maxN: number;
		/** Toggleable edge layers (base direct/cooccurrence edges are never listed). */
		edgeKindOptions?: { kind: NetworkEdgeKind; label: string; count: number }[];
		visibleKinds?: NetworkEdgeKind[];
		searchQuery?: string;
		searchLabel?: string;
		/** Placeholder for the search field, in the section's own noun. */
		searchPlaceholder?: string;
		/** Plural noun for what this network counts: keywords, tags, collaborators… */
		entityLabel?: string;
		/** Node ids offered as <datalist> autocompletions. */
		suggestions?: string[];
	} = $props();

	// The slider is dual-handle under the hood; single mode pins the lower bound.
	// The tuple is derived from `topN` (clamped into range, so an oversized
	// default like 20 on a 12-node graph collapses to the max); the slider
	// reports changes back through `onchange`, avoiding a bindable update cycle.
	const upperBound = $derived(Math.max(minN, maxN));
	const clampedTopN = $derived(Math.min(topN, upperBound));
	const sliderValues = $derived<[number, number]>([minN, clampedTopN]);

	function toggleKind(kind: NetworkEdgeKind) {
		visibleKinds = visibleKinds.includes(kind)
			? visibleKinds.filter((k) => k !== kind)
			: [...visibleKinds, kind];
	}

	// Diacritic-insensitive matching, the same fold the network components use,
	// applied to the vocabulary this control actually offers. A query that hits
	// nothing gets said out loud rather than leaving the chart silently unchanged.
	function fold(value: string): string {
		return value
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '');
	}
	const trimmedQuery = $derived(searchQuery.trim());
	const noMatches = $derived.by(() => {
		const folded = fold(trimmedQuery);
		if (!folded) return false;
		return !suggestions.some((s) => fold(s).includes(folded));
	});

	// Stable across SSR/hydration (unlike Math.random()) — these pages prerender.
	const uid = $props.id();
	const datalistId = 'network-search-' + uid;
</script>

<div class="network-controls">
	<div class="control control-slider">
		{#if maxN <= minN}
			<!-- A slider whose two ends are the same number is a control that
			     cannot be operated: it offers a choice the corpus does not have.
			     State the count instead, in the label's own voice. -->
			<span class="control-label">Showing all {maxN} {entityLabel}</span>
		{:else}
			<span class="control-label">
				Showing top <span class="control-value">{clampedTopN}</span> / {maxN}
			</span>
			<RangeSlider
				single
				float
				min={minN}
				max={upperBound}
				values={sliderValues}
				onchange={(e) => (topN = e.detail.values[1])}
				ariaLabel="Number of {entityLabel} to show"
				ariaValueText="{clampedTopN} of {maxN} {entityLabel}"
			/>
		{/if}
	</div>

	{#if edgeKindOptions.length > 0}
		<div class="control control-chips">
			<span class="control-label">Edges</span>
			<div class="chip-row">
				{#each edgeKindOptions as option (option.kind)}
					{@const selected = visibleKinds.includes(option.kind)}
					<button
						type="button"
						class="chip"
						class:chip--selected={selected}
						aria-pressed={selected}
						onclick={() => toggleKind(option.kind)}
					>
						{option.label}
						<span class="chip-count">{option.count}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="control control-search">
		<label class="control-label" for={datalistId + '-input'}>{searchLabel}</label>
		<div class="search-field">
			<!-- type="text", not "search": with a datalist attached, a search input
			     renders the browser's own clear button *and* the datalist arrow on
			     top of our clear button — three affordances in one field. -->
			<input
				id={datalistId + '-input'}
				type="text"
				class="search-input"
				list={datalistId}
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				autocomplete="off"
			/>
			{#if searchQuery}
				<button
					type="button"
					class="search-clear"
					aria-label="Clear search"
					onclick={() => (searchQuery = '')}
				>
					<span aria-hidden="true">×</span>
				</button>
			{/if}
			<datalist id={datalistId}>
				{#each suggestions as suggestion (suggestion)}
					<option value={suggestion}></option>
				{/each}
			</datalist>
		</div>
		<p class="dateline search-status" aria-live="polite">
			{#if noMatches}No {entityLabel} match &ldquo;{trimmedQuery}&rdquo;.{/if}
		</p>
	</div>
</div>

<style>
	.network-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--space-md) var(--space-xl);
		margin-bottom: var(--space-lg);
	}

	.control {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.control-slider {
		flex: 1 1 16rem;
		min-width: 12rem;
	}

	.control-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	/* The live count reads as the current thing — pine, the signal accent. */
	.control-value {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	/* Zero-result note: sits under the field in the mono dateline voice, and
	   stays in the DOM while empty so the live region can announce. */
	.search-status {
		margin: 0;
		text-transform: none;
	}

	.search-field {
		position: relative;
		display: flex;
		align-items: center;
	}

	/* Square, mono, hairline — the data voice, not a rounded app input. */
	.search-input {
		width: 100%;
		min-width: 12rem;
		padding: var(--space-xs) var(--space-xl) var(--space-xs) var(--space-sm);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		background: var(--color-surface-elevated);
		color: var(--color-text);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.search-input:focus-visible {
		outline: none;
		border-color: var(--color-accent);
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	/* Suppress the datalist dropdown arrow Chrome draws inside the field; the
	   suggestions still open on focus/typing. Our own clear button is the only
	   control in the box. */
	.search-input::-webkit-calendar-picker-indicator {
		display: none !important;
	}

	.search-clear {
		position: absolute;
		right: var(--space-2xs);
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--space-6);
		height: var(--space-6);
		border: none;
		background: transparent;
		color: var(--color-text-light);
		font-size: var(--font-size-lg);
		line-height: 1;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.search-clear:hover {
		color: var(--color-accent);
	}

	.search-clear:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-3xs);
	}

	@media (--sm-down) {
		.network-controls {
			gap: var(--space-md);
		}

		.control-slider,
		.control-search {
			flex: 1 1 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-input,
		.search-clear {
			transition: none;
		}
	}
</style>
