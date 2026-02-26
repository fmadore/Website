<script lang="ts">
	let {
		title,
		items, // List of tags
		activeItems, // List of active tags
		toggleItem, // Function to toggle a tag
		counts // Tag counts
	}: {
		title: string;
		items: string[];
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
	} = $props();

	// Helper to safely get count
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
				title={item}
				onclick={() => handleToggleItem(item)}
			>
				<span class="chip-text">{item}</span>
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
