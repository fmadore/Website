<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import CVEntry from './CVEntry.svelte';

	let {
		title,
		items = [] as T[],
		year,
		key,
		yearWidth = 'auto',
		emptyMessage,
		conditional = false,
		entry
	}: {
		title: string;
		items?: T[];
		year: (item: T) => string | number;
		key: (item: T) => string | number;
		yearWidth?: 'auto' | 'fixed';
		emptyMessage?: string;
		conditional?: boolean;
		entry: Snippet<[T]>;
	} = $props();

	const hasItems = $derived(items.length > 0);
</script>

{#if !conditional || hasItems}
	<section>
		<h3>{title}</h3>
		{#if hasItems}
			<div class="space-y-3">
				{#each items as item (key(item))}
					<CVEntry year={year(item)} {yearWidth}>
						{@render entry(item)}
					</CVEntry>
				{/each}
			</div>
		{:else if emptyMessage}
			<p class="text-light">{emptyMessage}</p>
		{/if}
	</section>
{/if}
