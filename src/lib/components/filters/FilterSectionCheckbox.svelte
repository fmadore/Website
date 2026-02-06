<script lang="ts">
	let {
		title,
		items, // e.g., ['book', 'article'] or ['Author One', 'Author Two']
		itemLabels = undefined, // Made optional
		activeItems, // The reactive list of active filters (e.g., $activeFilters.types)
		toggleItem, // Function to toggle an item
		counts // e.g., { 'book': 10, 'article': 5 }
	}: {
		title: string;
		items: string[];
		itemLabels: { [key: string]: string } | undefined;
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
	} = $props();

	// Helper to safely get count, defaulting to 0
	function getCount(item: string): number {
		return counts?.[item] ?? 0;
	}

	// Direct toggle function (scroll preservation handled at sidebar level)
	function handleToggleItem(item: string) {
		toggleItem(item);
	}
</script>

<div class="filter-section-content">
	<h3 class="filter-section-title">{title}</h3>
	<div class="filter-chips-container">
		{#each items as item (item)}
			<button
				type="button"
				class="filter-chip {activeItems.includes(item) ? 'active' : ''}"
				onclick={() => handleToggleItem(item)}
			>
				<span class="chip-text">{itemLabels?.[item] ?? item}</span>
				{#if counts !== undefined}
					<span class="chip-count">{getCount(item)}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	/* All styles provided by src/styles/components/filters.css */
</style>
