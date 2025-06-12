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
		<a href={itemLink} class="relevant-item-link"> View details → </a>
	</div>
</div>

<style>
	.relevant-item {
		position: relative;
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		/* Use glass-card utility for consistent glassmorphism */
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.37),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.relevant-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0;
		background: linear-gradient(180deg, 
			var(--color-accent) 0%, 
			var(--color-highlight) 100%
		);
		border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		transition: width 0.3s ease;
		opacity: var(--opacity-high);
	}

	.relevant-item:hover::before {
		width: var(--border-width-thick);
	}

	.relevant-item:hover {
		transform: var(--transform-lift-sm);
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.relevant-item-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-3);
	}

	.relevant-item-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent);
		background-color: rgba(var(--color-accent-rgb), var(--opacity-medium));
		padding: var(--spacing-1) var(--spacing-3);
		border: 1px solid rgba(var(--color-accent-rgb), var(--opacity-medium-high));
		border-radius: var(--border-radius-full);
		transition: all 0.2s ease;
	}

	.relevant-item-date {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		min-width: 0;
		line-height: var(--line-height-snug);
	}

	.relevant-item-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--spacing-2) 0;
		line-height: var(--line-height-relaxed);
	}

	.relevant-item-title a {
		color: var(--color-text);
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.relevant-item-title a:hover {
		color: var(--color-accent);
	}

	.relevant-item-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		margin-bottom: var(--spacing-2);
		line-height: var(--line-height-relaxed);
	}

	.relevant-item-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--spacing-3);
	}

	.relevant-item-action {
		margin-top: auto;
	}

	.relevant-item-link {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
		position: relative;
		overflow: hidden;
	}

	.relevant-item-link::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 1px;
		background: var(--color-accent);
		transition: width 0.3s ease;
	}

	.relevant-item-link:hover {
		color: var(--color-highlight);
		text-decoration: none;
	}

	.relevant-item-link:hover::before {
		width: 100%;
	}

	/* Dark mode overrides */
	:global(html.dark) .relevant-item {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .relevant-item:hover {
		background: rgba(0, 0, 0, 0.3);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .relevant-item-type {
		background-color: rgba(var(--color-accent-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-accent-rgb), var(--opacity-medium-high));
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.relevant-item-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-2);
		}

		.relevant-item-date {
			align-self: flex-end;
		}

		.relevant-item-title {
			font-size: var(--font-size-base);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.relevant-item,
		.relevant-item::before,
		.relevant-item-title a,
		.relevant-item-type,
		.relevant-item-link,
		.relevant-item-link::before {
			transition: none;
		}

		.relevant-item:hover {
			transform: none;
		}
	}
</style>
