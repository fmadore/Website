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
	<div class="item-meta improved-meta">
		{#if item.type}
		<span class="item-type improved-type-tag" data-type={item.type}>{formatType(item.type)}</span>
		{/if}
		<span class="item-date improved-date">{item.date}</span>
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
		padding: var(--spacing-4);
		border-radius: var(--border-radius-sm);
		transition: all 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
		box-shadow: var(--shadow-sm);
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

	.item-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	/* Improved meta row: type left, date right, both vertically centered */
	.item-meta.improved-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-1);
	}

	/* Improved type tag style */
	.item-type.improved-type-tag {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: 600;
		color: var(--color-primary);
		background-color: rgba(var(--color-primary-rgb), 0.08);
		padding: 0.15rem 0.85rem;
		border-radius: 9999px;
		flex-shrink: 0;
		white-space: nowrap;
		line-height: 1.7;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		box-shadow: 0 1px 4px 0 rgba(26,54,93,0.06);
		border: 1px solid var(--color-border);
	}

	/* Improved date: right-aligned, multiline support */
	.item-date.improved-date {
		font-weight: 600;
		color: var(--color-text);
		display: block;
		text-align: right;
		line-height: 1.4;
		margin-bottom: 0;
		word-break: break-word;
		min-width: 0;
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