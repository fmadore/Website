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
	import RelevantItemCard from '$lib/components/panels/RelevantItemCard.svelte'; // Import the Card-based molecule
	import PanelBase from './PanelBase.svelte';

	// Props
	export let title: string; // e.g., "Relevant Publications", "Relevant Communications"
	export let items: RelevantItem[];
	export let itemTypePlural: string; // e.g., "publications", "communications"
	export let basePath: string; // Base path for individual item links e.g., "/publications", "/communications"
	export let viewAllPath: string; // Path for the "View all" link e.g., "/publications", "/conference-activity"
	export let formatType: (type: string) => string;
	export let formatAuthors: (authors: string[]) => string;

	// Get unique item types for the type filter
	$: itemTypes = [...new Set(items.map(item => item.type).filter(Boolean))].sort() as string[];
</script>

<PanelBase {title} variant="items">
	<svelte:fragment slot="content">
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
				<a href="{base}{viewAllPath}" class="view-all-link">View all {itemTypePlural}</a>
			</div>
		{/if}
	</svelte:fragment>
</PanelBase>

<style>
	/* Item-specific styles that aren't covered by PanelBase */
	/* .item-list-item styles can be added here when needed */
</style>