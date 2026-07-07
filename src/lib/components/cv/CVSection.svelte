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

<!--
	CV section — a ruled ledger module. The <section> + <h3> structure and
	the .space-y-3 entry wrapper are load-bearing DOM hooks for the PDF generator,
	so they are preserved; the ledger look comes from #cv-content styles in
	+page.svelte (which number the h3 and rule each row) plus CVEntry.
-->
{#if !conditional || hasItems}
	<section>
		<h3>{title}</h3>
		{#if hasItems}
			<div class="space-y-3 ledger">
				{#each items as item (key(item))}
					<CVEntry year={year(item)} {yearWidth}>
						{@render entry(item)}
					</CVEntry>
				{/each}
			</div>
		{:else if emptyMessage}
			<p class="cv-empty">{emptyMessage}</p>
		{/if}
	</section>
{/if}
