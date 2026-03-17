<script lang="ts">
	import { getFilterCount } from '$lib/utils/filterHelpers';

	let {
		title,
		items,
		activeItems,
		toggleItem,
		counts
	}: {
		title: string;
		items: string[];
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
				title={item}
				onclick={() => toggleItem(item)}
			>
				<span class="chip-text">{item}</span>
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
