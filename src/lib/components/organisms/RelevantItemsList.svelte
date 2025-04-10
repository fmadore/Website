<script context="module" lang="ts">
	// Define a generic item type structure that includes properties from both publications and communications
	export type RelevantItem = {
		id: string;
		project?: string; // Project might not always be directly on the item if filtered beforehand
		type: string;
		date: string;
		dateISO: string; // Needed for sorting
		title: string;
		authors: string[];
		abstract?: string;
	};
</script>

<script lang="ts">
	import { base } from '$app/paths';
	import ItemCard from '$lib/components/molecules/ItemCard.svelte'; // Import the new molecule

	// Props
	export let title: string; // e.g., "Relevant Publications", "Relevant Communications"
	export let items: RelevantItem[];
	export let itemTypePlural: string; // e.g., "publications", "communications"
	export let basePath: string; // e.g., "/publications", "/communications"
	export let projectName: string;
	export let showTypeFilters: boolean = true;
	export let formatType: (type: string) => string;
	export let formatAuthors: (authors: string[]) => string;

	// Get unique item types for the type filter
	$: itemTypes = [...new Set(items.map(item => item.type).filter(Boolean))].sort() as string[];
</script>

<div class="relevant-items">
	<!-- Add slot for title, falling back to prop -->
	<slot name="title">
		<h2 class="card-title">{title}</h2>
	</slot>

	{#if items.length === 0}
		<p class="no-items">No {itemTypePlural} found for this project.</p>
	{:else}
		<ul class="item-list">
			{#each items as item (item.id)}
				<li class="item-list-item">
					<ItemCard {item} {basePath} {formatType} {formatAuthors} />
				</li>
			{/each}
		</ul>

		{#if showTypeFilters && itemTypes.length > 1}
			<div class="type-filters mt-4">
				<span class="text-sm text-light">Browse by type:</span>
				<div class="flex flex-wrap gap-2 mt-2">
					{#each itemTypes as type}
						<a href="{base}{basePath}?type={type}" class="type-tag">
							{formatType(type)}
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<div class="mt-4 text-right">
			<a href="{base}{basePath}?project={encodeURIComponent(projectName)}" class="view-all">View all {itemTypePlural}</a>
		</div>
	{/if}
</div>

<!-- Styles are largely the same as the original components -->
<style>
	.relevant-items {
		height: auto; /* Override potential base card height */
		transition: background-color 0.3s ease, box-shadow 0.3s ease;
		background-color: rgba(var(--color-primary-rgb), 0.02);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-4);
		border: 1px solid rgba(var(--color-primary-rgb), 0.06);
	}

	.card-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		margin-bottom: var(--spacing-4);
		color: var(--color-primary);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: var(--spacing-2);
	}

	.item-list {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.item-list-item {
		margin-bottom: var(--spacing-4);
		padding-bottom: var(--spacing-4);
		border-bottom: 1px solid var(--color-border);
	}

	.item-list-item:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.no-items {
		font-style: italic;
		color: var(--color-text-light);
		text-align: center;
		padding: var(--spacing-4) 0;
	}

	.type-tag {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background-color: var(--color-border);
		color: var(--color-text);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-sm);
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.type-tag:hover {
		background-color: var(--color-primary);
		color: var(--color-background);
	}

	.view-all {
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
		font-size: var(--font-size-sm);
	}

	.view-all:hover {
		text-decoration: underline;
	}

    /* Inherit styles from global or pass down necessary variables */
    .text-sm {
        font-size: var(--font-size-sm);
    }
    .text-light {
        color: var(--color-text-light);
    }
    .mt-4 {
        margin-top: var(--spacing-4);
    }
    .mt-2 {
        margin-top: var(--spacing-2);
    }
    .gap-2 {
        gap: var(--spacing-2);
    }
    .flex {
        display: flex;
    }
    .flex-wrap {
        flex-wrap: wrap;
    }
    .text-right {
        text-align: right;
    }
</style> 