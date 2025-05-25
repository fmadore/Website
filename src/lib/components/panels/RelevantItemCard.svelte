<script lang="ts">
	import { base } from '$app/paths';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';

	// Props - same interface as the old ItemCard for compatibility
	let { 
		item, 
		basePath, 
		formatType, 
		formatAuthors 
	}: {
		item: RelevantItem;
		basePath: string; // Base path for the item detail link
		formatType: (type: string) => string;
		formatAuthors: (authors: string[]) => string;
	} = $props();

	// Construct the link URL
	let itemLink = $derived(`${base}${basePath}/${item.id}`);
</script>

<div class="relevant-item">
	<div class="relevant-item-meta">
		{#if item.type}
			<span class="relevant-item-type">{formatType(item.type)}</span>
		{/if}
		<span class="relevant-item-date">{item.date}</span>
	</div>
	
	<h3 class="relevant-item-title">
		<a href={itemLink}>{item.title}</a>
	</h3>
	
	{#if item.authors && item.authors.length > 0}
		<div class="relevant-item-authors">
			{formatAuthors(item.authors)}
		</div>
	{/if}
	
	{#if item.abstract}
		<div class="relevant-item-abstract">
			{item.abstract.length > 120 ? item.abstract.substring(0, 120) + '...' : item.abstract}
		</div>
	{/if}
	
	<div class="relevant-item-action">
		<a href={itemLink} class="relevant-item-link">
			View details →
		</a>
	</div>
</div>

<style>
	.relevant-item {
		position: relative;
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.relevant-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0;
		background-color: var(--color-primary);
		border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		transition: width 0.2s ease;
		opacity: var(--opacity-high);
	}

	.relevant-item:hover::before {
		width: var(--border-width-thick);
	}

	.relevant-item:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.relevant-item-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-2);
	}

	.relevant-item-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: 600;
		color: var(--color-primary);
		background-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
		padding: var(--spacing-1) var(--spacing-3);
		border: 1px solid rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		border-radius: var(--border-radius-full);
	}

	.relevant-item-date {
		color: var(--color-text-light);
		font-size: var(--font-size-xs);
		font-weight: 500;
		min-width: 0;
	}

	.relevant-item-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		margin: 0 0 var(--spacing-2) 0;
		line-height: 1.4;
	}

	.relevant-item-title a {
		color: var(--color-text);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.relevant-item-title a:hover {
		color: var(--color-primary);
	}

	.relevant-item-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		margin-bottom: var(--spacing-2);
		line-height: 1.4;
	}

	.relevant-item-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		line-height: 1.5;
		margin-bottom: var(--spacing-3);
	}

	.relevant-item-action {
		margin-top: auto;
	}

	.relevant-item-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--font-size-sm);
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
	}

	.relevant-item-link:hover {
		color: var(--color-primary);
		text-decoration: underline;
	}

	/* Dark mode overrides */
	:global(html.dark) .relevant-item {
		background: var(--color-surface-dark);
		border-color: var(--color-border-dark);
	}

	:global(html.dark) .relevant-item-type {
		background-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}
</style>
