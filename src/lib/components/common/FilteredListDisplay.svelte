<script lang="ts" generics="Item extends Record<string, unknown> = Record<string, unknown>">
	import type { Component } from 'svelte';
	import Button from '$lib/components/atoms/Button.svelte'; // Import Button component

	// Generic type to represent any store with a subscribe method
	type Readable<T> = { subscribe: (run: (value: T) => void) => () => void };

	// Use a more generic type definition that works with dynamic components
	type AnyComponentType = Component<Record<string, unknown>>;
	type MaybeValue<T> = { value?: T };

	interface Props {
		filteredItems: Readable<Item[]> | Item[]; // Store of filtered items OR plain array
		itemComponent: AnyComponentType; // Component to render each item
		itemComponentProps?: Record<string, unknown>; // Props to pass to each item component
		areFiltersActive?: boolean; // Whether filters are active
		clearAllFilters: () => void; // Function to clear all filters
		emptyStateMessage?: string; // Message for empty state
		emptyStateNoFiltersMessage?: string; // Message when no filters but still empty
		itemPropName?: string; // The prop name used by the item component (e.g., "communication", "publication")
		onitemrequest?: ((event: { type: string; value: string }) => void) | null; // Optional event handler for item events (e.g., filter requests)
	}

	let {
		filteredItems,
		itemComponent,
		itemComponentProps = {},
		areFiltersActive = false,
		clearAllFilters,
		emptyStateMessage = 'No items found matching your criteria.',
		emptyStateNoFiltersMessage = 'Try adding some items to the system.',
		itemPropName = 'item',
		onitemrequest = null
	}: Props = $props();

	// Handle both store and plain array
	const items = $derived(
		Array.isArray(filteredItems)
			? filteredItems
			: ((filteredItems as MaybeValue<Item[]>)?.value ?? [])
	);

	const getItemKey = (item: Item, index: number): string | number => {
		if (item && typeof item === 'object' && 'id' in item) {
			const value = (item as { id?: string | number }).id;
			if (typeof value === 'string' || typeof value === 'number') {
				return value;
			}
		}
		return index;
	};
</script>

<div>
	{#if items && items.length > 0}
		<ul class="list-none p-0 space-y-8 mt-6">
			{#each items as item, index (getItemKey(item, index))}
				{#if onitemrequest}
					{@const Component = itemComponent}
					<Component
						{...itemComponentProps}
						{...{ [itemPropName]: item }}
						{index}
						onfilterrequest={onitemrequest}
						onclick={onitemrequest}
						oncustomaction={onitemrequest}
					/>
				{:else}
					{@const Component = itemComponent}
					<Component {...itemComponentProps} {...{ [itemPropName]: item }} {index} />
				{/if}
			{/each}
		</ul>
	{:else}
		<div class="p-8 bg-gray-50 rounded text-center mt-6">
			<p>{emptyStateMessage}</p>
			{#if areFiltersActive}
				<Button variant="primary" size="sm" onclick={clearAllFilters} additionalClasses="mt-4">
					Clear all filters
				</Button>
			{:else if !areFiltersActive}
				<p class="mt-2 text-sm text-gray-500">
					{emptyStateNoFiltersMessage}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Styles for status-bar-container and clear-filters-inline removed */
</style>
