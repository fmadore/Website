<script lang="ts">
	import { base } from '$app/paths';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte'; // Use the type from the panel component

	// Props
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
</script>

<div class="item-card scroll-reveal">
	<div class="item-meta improved-meta">
		{#if item.type}
			<span class="item-type improved-type-tag" data-type={item.type}>{formatType(item.type)}</span>
		{/if}
		<span class="item-date improved-date">{item.date}</span>
	</div>
	<a href={`${base}${basePath}/${item.id}`} class="item-title">
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
		padding: var(--space-md);
		border-radius: var(--border-radius-sm);
		transition:
			all var(--duration-normal) var(--ease-out),
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
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
		transition: width var(--duration-normal) var(--ease-out);
		opacity: var(--opacity-70);
	}

	.item-card:hover::before {
		width: var(--space-1);
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
		gap: var(--space-xs);
		margin-bottom: var(--space-2xs);
	}

	/* Improved type tag style */
	.item-type.improved-type-tag {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
		background-color: rgba(var(--color-primary-rgb), var(--opacity-10));
		padding: var(--space-0-5) var(--space-sm);
		border-radius: var(--border-radius-full);
		flex-shrink: 0;
		white-space: nowrap;
		line-height: var(--line-height-relaxed);
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		box-shadow: var(--shadow-xs);
		border: var(--border-width-thin) solid var(--color-border);
	}

	/* Improved date: right-aligned, multiline support */
	.item-date.improved-date {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		display: block;
		text-align: right;
		line-height: var(--line-height-snug);
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
		margin-bottom: var(--space-2xs);
	}

	.item-abstract {
		font-size: var(--font-size-sm);
		margin-top: var(--space-2xs);
		color: var(--color-text-light);
		line-height: var(--line-height-normal);
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.item-card,
		.item-card::before {
			transition: none;
			animation: none;
		}
		.item-card:hover {
			transform: none;
		}
		.item-card:hover::before {
			width: var(--space-1);
		}

		/* Ensure content is visible when animations are disabled */
		.item-card {
			opacity: 1;
			transform: none;
		}
	}
</style>
