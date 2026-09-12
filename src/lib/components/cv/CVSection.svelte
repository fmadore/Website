<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import CVEntry from './CVEntry.svelte';

	let {
		title,
		items = [] as T[],
		year,
		key,
		emptyMessage,
		conditional = false,
		entry
	}: {
		title: string;
		items?: T[];
		year: (item: T) => string | number;
		key: (item: T) => string | number;
		emptyMessage?: string;
		conditional?: boolean;
		entry: Snippet<[T]>;
	} = $props();

	const hasItems = $derived(items.length > 0);
</script>

<!--
	CV section — a ruled ledger module. The <section> + <h3> structure and the
	[data-cv-ledger] entry wrapper are load-bearing DOM hooks for the PDF
	generator, so they are preserved; the ledger itself is the shared `.ledger`
	idiom at its tight density (see ink-signal.css), closed by `--ruled`.
-->
{#if !conditional || hasItems}
	<section>
		<h3>{title}</h3>
		{#if hasItems}
			<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
				{#each items as item (key(item))}
					<CVEntry year={year(item)}>
						{@render entry(item)}
					</CVEntry>
				{/each}
			</div>
		{:else if emptyMessage}
			<p class="cv-empty">{emptyMessage}</p>
		{/if}
	</section>
{/if}
