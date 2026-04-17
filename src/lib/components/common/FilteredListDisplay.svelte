<script lang="ts" generics="Item extends Record<string, unknown> = Record<string, unknown>">
	import type { Component } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';
	import Button from '$lib/components/atoms/Button.svelte'; // Import Button component

	// Generic type to represent any store with a subscribe method
	type Readable<T> = { subscribe: (run: (value: T) => void) => () => void };

	// Use a more flexible type definition that works with dynamic components
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type AnyComponentType = Component<any>;
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

	// Motion durations for filter/sort list transitions.
	// Items reorder with FLIP (350ms) and fade on enter/exit.
	// Durations collapse to 0 automatically under prefers-reduced-motion.
	const FLIP_DURATION = 350;
	const FADE_IN_DURATION = 220;
	const FADE_OUT_DURATION = 160;
</script>

<div>
	{#if items && items.length > 0}
		<div class="filtered-list grid-stagger">
			{#each items as item, index (getItemKey(item, index))}
				<div
					class="filtered-list-row"
					animate:flip={{ duration: motionDuration(FLIP_DURATION), easing: cubicOut }}
					in:fade={{ duration: motionDuration(FADE_IN_DURATION), easing: cubicOut }}
					out:fade={{ duration: motionDuration(FADE_OUT_DURATION), easing: cubicOut }}
				>
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
				</div>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p class="empty-state-message">{emptyStateMessage}</p>
			{#if areFiltersActive}
				<Button
					variant="primary"
					size="sm"
					onclick={clearAllFilters}
					additionalClasses="mt-4"
					label="Clear all filters"
				/>
			{:else if !areFiltersActive}
				<p class="empty-state-hint">
					{emptyStateNoFiltersMessage}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Container for the animated, filterable list.
	 * Uses a <div> (not <ul>) so children can be wrapper <div>s carrying
	 * animate:flip — valid HTML regardless of the item component root. */
	.filtered-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		margin-top: var(--space-6);
		padding: 0;
		list-style: none;
	}

	.filtered-list-row {
		/* The wrapper is purely structural. Its children (item components)
		 * supply their own visual styling and scroll-reveal animations. */
		contain: layout style;
	}

	.empty-state {
		padding: var(--space-xl);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-surface) calc(var(--opacity-90) * 100%), transparent) 100%
		);
		border-radius: var(--border-radius-lg);
		text-align: center;
		margin-top: var(--space-lg);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
	}

	.empty-state-message {
		color: var(--color-text);
		font-size: var(--font-size-base);
		margin: 0;
	}

	.empty-state-hint {
		margin-top: var(--space-xs);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		margin-bottom: 0;
	}
</style>
