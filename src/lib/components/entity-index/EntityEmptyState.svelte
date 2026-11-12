<script lang="ts" generics="TItem">
	// The empty state every index shares: what failed to match, the corpus that
	// is still there (the Count Rule), and the one way back (the Clearing Rule).
	// The tally above drops its own clear control while this block shows, so
	// exactly one exists, and it sits where the reader is looking.
	import type { EntityFilterSystem } from '#lib/utils/entityFilterSystem.svelte.ts';
	import { truncateSearchTerm } from '#lib/utils/entityFilterCore.ts';
	import { clearKeepingFocus } from './focusAfterClear';

	interface Props {
		filters: EntityFilterSystem<TItem>;
		totalEntries: number;
		minYear: number;
		maxYear: number;
		/** What the corpus is called: the publications index, the activities log. */
		corpus?: 'index' | 'log';
	}

	let { filters, totalEntries, minYear, maxYear, corpus = 'index' }: Props = $props();

	const term = $derived(filters.searchTerm.trim());
	const searchOnly = $derived(filters.hasSearch && filters.activeFilterCount === 0);
	let clearEl: HTMLButtonElement | undefined = $state();
</script>

<div class="bib-empty">
	<p class="bib-empty-line">
		{#if term}
			No entries match &ldquo;{truncateSearchTerm(term)}&rdquo;.
		{:else}
			No entries match.
		{/if}
	</p>
	<p class="dateline bib-empty-note">
		The {corpus} holds {totalEntries}
		{totalEntries === 1 ? 'entry' : 'entries'}, {minYear}–{maxYear}.
	</p>
	{#if filters.narrowingCount > 0}
		<button
			type="button"
			class="mono-action"
			bind:this={clearEl}
			onclick={() => clearKeepingFocus(clearEl ?? null, filters.clearAll)}
		>
			{searchOnly ? 'Clear search' : 'Clear all'}
			<span aria-hidden="true">✕</span>
		</button>
	{/if}
</div>

<style>
	@media print {
		.mono-action {
			display: none;
		}
	}
</style>
