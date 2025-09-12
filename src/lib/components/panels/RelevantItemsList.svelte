<script module lang="ts">
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
	import RelevantItemCard from '$lib/components/panels/RelevantItemCard.svelte'; // Import the Card-based molecule
	import PanelBase from './PanelBase.svelte';
	import Button from '../atoms/Button.svelte';

	// Props
	let {
		title,
		items,
		itemTypePlural,
		basePath,
		viewAllPath,
		formatType,
		formatAuthors
	}: {
		title: string; // e.g., "Relevant Publications", "Relevant Communications"
		items: RelevantItem[];
		itemTypePlural: string; // e.g., "publications", "communications"
		basePath: string; // Base path for individual item links e.g., "/publications", "/communications"
		viewAllPath: string; // Path for the "View all" link e.g., "/publications", "/conference-activity"
		formatType: (type: string) => string;
		formatAuthors: (authors: string[]) => string;
	} = $props();

	// Get unique item types for the type filter
	let itemTypes = $derived(
		[...new Set(items.map((item) => item.type).filter(Boolean))].sort() as string[]
	);
</script>

{#snippet panelContent()}
	{#if items.length === 0}
		<p class="no-items">No {itemTypePlural} found for this project.</p>
	{:else}
		<ul class="item-list">
			{#each items as item (item.id)}
				<li class="item-list-item">
					<RelevantItemCard {item} {basePath} {formatType} {formatAuthors} />
				</li>
			{/each}
		</ul>

		<div class="view-all-container">
			<Button
				href="{base}{viewAllPath}"
				variant="outline-primary"
				size="base"
				additionalClasses="glass-button"
			>
				{#snippet children()}
					View all {itemTypePlural} →
				{/snippet}
			</Button>
		</div>
	{/if}
{/snippet}

<PanelBase {title} variant="items" glassEffect="glass-panel" content={panelContent} />

<style>
	/* Item-specific styles that aren't covered by PanelBase */
	/* .item-list-item styles can be added here when needed */
</style>
