<script lang="ts">
	import { base } from '$app/paths';
	import type { RelevantItem } from '$lib/components/organisms/RelevantItemsList.svelte'; // Use the type from the organism

	// Props
	export let item: RelevantItem;
	export let basePath: string; // Base path for the item detail link
	export let formatType: (type: string) => string;
	export let formatAuthors: (authors: string[]) => string;
</script>

<div class="item-card">
	<div class="item-meta">
		<span class="item-type">{item.type ? formatType(item.type) : 'Item'}</span>
		<span class="item-date">{item.date}</span>
	</div>
	<a href="{base}{basePath}/{item.id}" class="item-title">
		{item.title}
	</a>
	<div class="item-authors">
		{formatAuthors(item.authors)}
	</div>
	{#if item.abstract}
		<div class="item-abstract">
			{item.abstract.length > 120 ? item.abstract.substring(0, 120) + '...' : item.abstract}
		</div>
	{/if}
</div>

<!-- Styles are similar to the original item styles -->
<style>
	.item-meta {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--spacing-1);
	}

	.item-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: 600;
		color: var(--color-primary);
		background-color: var(--color-border);
		padding: 0.1rem 0.5rem;
		border-radius: var(--border-radius-sm);
	}

	.item-date {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.item-title {
		font-weight: 600;
		color: var(--color-text);
		text-decoration: none;
		display: block;
		line-height: 1.4;
		margin-bottom: var(--spacing-1);
	}

	.item-title:hover {
		color: var(--color-primary);
	}

	.item-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		margin-bottom: var(--spacing-1);
	}

	.item-abstract {
		font-size: var(--font-size-sm);
		margin-top: var(--spacing-1);
		color: var(--color-text-light);
		line-height: 1.5;
	}
</style> 