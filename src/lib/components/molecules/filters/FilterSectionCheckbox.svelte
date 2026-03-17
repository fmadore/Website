<script lang="ts">
	import { getFilterCount, getFilterLabel } from '$lib/utils/filterHelpers';

	let {
		title,
		items,
		itemLabels = undefined,
		activeItems,
		toggleItem,
		counts
	}: {
		title: string;
		items: string[];
		itemLabels: { [key: string]: string } | undefined;
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
	} = $props();
</script>

<div class="filter-section-content">
	<h3 class="filter-section-title">{title}</h3>
	<div class="filter-chips-container">
		{#each items as item (item)}
			<button
				type="button"
				class="filter-chip {activeItems.includes(item) ? 'active' : ''}"
				onclick={() => toggleItem(item)}
			>
				<span class="chip-text">{getFilterLabel(itemLabels, item)}</span>
				{#if counts !== undefined}
					<span class="chip-count">{getFilterCount(counts, item)}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	/* All styles provided by src/styles/components/filters.css */
</style>
