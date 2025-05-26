<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { base } from '$app/paths';

	// Props
	let {
		allItems = [],
		currentItemId,
		filterKey,
		filterValue,
		title,
		itemComponent,
		baseItemUrl,
		maxItems = 3,
		sectionClass = 'mt-8',
		titleClass = 'text-xl font-semibold mb-4',
		gridClass = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
	}: {
		allItems?: any[]; // Array of all potential items (e.g., allPublications)
		currentItemId: string | number;
		filterKey: string; // Property to filter by (e.g., 'project', 'type')
		filterValue: any; // Value to match for the filterKey
		title: string; // Section title (e.g., "More Publications in this Project")
		itemComponent: ComponentType; // Component to render each item (e.g., ItemCard)
		// Removed itemPropName as it complicates <svelte:component>
		baseItemUrl: string; // Base URL for item links (e.g., "/publications/")
		maxItems?: number; // Max items to display
		// Optional styling props
		sectionClass?: string;
		titleClass?: string;
		gridClass?: string;
	} = $props();

	// Reactive calculation for related items
	let relatedItems = $derived(
		allItems
			.filter(
				(item) =>
					item.id !== currentItemId && // Exclude current item
					item[filterKey] === filterValue // Match filter criteria
			)
			.slice(0, maxItems) // Limit number of items
	);
</script>

{#if relatedItems.length > 0}
	<section class={sectionClass}>
		<h2 class={titleClass}>{title}</h2>
		<div class={gridClass}>
			{#each relatedItems as item (item.id)}
				{@const ItemComponent = itemComponent}
				<ItemComponent {item} itemUrl={`${baseItemUrl}${item.id}`} />
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Styles specific to the list layout itself, if needed. 
       Item styles should be handled by the passed itemComponent. */
</style>
