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
		{#if item.type}
		<span class="item-type" data-type={item.type}>{formatType(item.type)}</span>
		{/if}
		<span class="item-date">{item.date}</span>
	</div>
	<a href="{base}{basePath}/{item.id}" class="item-title">
		{item.title}
	</a>
	{#if item.authors && item.authors.length > 0}
	<div class="item-authors">
		{formatAuthors(item.authors)}
	</div>
	{/if}
	{#if item.abstract}
		<div class="item-abstract">
			{item.abstract.length > 120 ? item.abstract.substring(0, 120) + '...' : item.abstract}
		</div>
	{/if}
</div>

<!-- Styles are similar to the original item styles -->
<style>
	.item-card {
		position: relative;
		padding: var(--spacing-2);
		border-radius: var(--border-radius-sm);
		transition: all 0.2s ease;
	}

	.item-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0;
		background-color: var(--color-primary);
		border-radius: var(--border-radius-sm) 0 0 var(--border-radius-sm);
		transition: width 0.2s ease;
		opacity: 0.7;
	}

	.item-card:hover::before {
		width: 3px;
	}

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
		background-color: rgba(var(--color-primary-rgb), 0.08);
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
		transition: color 0.2s ease;
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