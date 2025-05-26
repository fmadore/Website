<script lang="ts">
	// Expects the item object and the pre-calculated URL from RelatedItemsList
	let {
		item,
		itemUrl,
		cardClass = 'related-item rounded-lg p-4 transition-shadow',
		dateClass = 'related-date text-sm mb-1',
		titleClass = 'related-title font-medium text-primary',
		authorsClass = 'related-authors text-sm mt-1'
	}: {
		item: {
			id: string | number;
			date?: string;
			title?: string;
			authors?: string[];
			// Add other potential fields if needed, though unused in this display
		};
		itemUrl: string;
		// Styling props
		cardClass?: string; // Reuse existing styles
		dateClass?: string;
		titleClass?: string; // Keeping title styling consistent
		authorsClass?: string;
	} = $props();
</script>

<a href={itemUrl} class={cardClass}>
	{#if item.date}
		<div class={dateClass}>{item.date}</div>
	{/if}
	{#if item.title}
		<h3 class={titleClass}>{item.title}</h3>
	{/if}
	{#if item.authors && item.authors.length > 0}
		<div class={authorsClass}>{item.authors.join(', ')}</div>
	{/if}
</a>

<style>
	/* Reuse styles defined in the parent page or global styles for consistency */
	.related-item {
		background-color: var(--color-background);
		box-shadow: var(--shadow-sm);
		/* Ensure transform is included in the transition */
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease,
			transform 0.3s ease;
	}
	.related-item:hover {
		box-shadow: var(--shadow-md);
		transform: var(--transform-lift-md); /* Added lift effect */
	}
	.related-date,
	.related-authors {
		color: var(--color-text-light);
	}
	/* titleClass uses text-primary, assuming that's globally defined */
</style>
