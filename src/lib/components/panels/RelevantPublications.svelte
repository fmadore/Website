<script lang="ts">
	// import { onMount } from 'svelte'; // Removed as unused
	import { allPublications } from '../../data/publications/index';
	// import type { Publication } from '$lib/types'; // Removed as unused
	import RelevantItemsList from '$lib/components/panels/RelevantItemsList.svelte';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';
	import Button from '../atoms/Button.svelte';

	// Props - project name and limit
	let {
		projectName,
		limit = 5,
		showTypeFilters = true
	}: {
		projectName: string;
		limit?: number;
		showTypeFilters?: boolean;
	} = $props();

	// Add state for selected type filter
	let selectedType = $state<string | null>(null);

	// Filter publications by project name
	let publicationList = $derived<RelevantItem[]>(
		allPublications
			.filter((pub) => pub.project === projectName)
			.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
			.slice(0, limit) as RelevantItem[]
	);

	// Get unique publication types for the type filter
	let publicationTypes = $derived<string[]>(
		[...new Set(publicationList.map((pub) => pub.type).filter(Boolean))].sort() as string[]
	);

	// Compute filtered list based on selected type
	let filteredList = $derived<RelevantItem[]>(
		selectedType ? publicationList.filter((pub) => pub.type === selectedType) : publicationList
	);

	// Handler for type filter button
	function selectType(type: string) {
		selectedType = selectedType === type ? null : type;
	}

	// Format publication type for display
	function formatPublicationType(type: string): string {
		const typeMap: Record<string, string> = {
			article: 'Journal Article',
			book: 'Book',
			chapter: 'Book Chapter',
			'special-issue': 'Special Issue',
			report: 'Report',
			encyclopedia: 'Encyclopedia Entry',
			blogpost: 'Blog Post',
			dissertation: 'Dissertation'
		};
		return typeMap[type] || type;
	}

	// Format authors for display (can be reused or moved to utils later)
	function formatAuthors(authors: string[]): string {
		if (!authors || authors.length === 0) return '';
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
		return `${authors[0]} et al.`;
	}
</script>

<div>
	{#snippet filterButtons()}
		{#if showTypeFilters && publicationTypes.length > 1}
			<div class="type-filters-container">
				{#each publicationTypes as type (type)}
					<Button
						variant={selectedType === type ? 'primary' : 'outline-secondary'}
						size="sm"
						additionalClasses="glass-button filter-button {selectedType === type ? 'active' : ''}"
						onclick={() => selectType(type)}
						type="button"
					>
						{formatPublicationType(type)}
					</Button>
				{/each}
			</div>
		{/if}
	{/snippet}

	<RelevantItemsList
		title="Relevant Publications"
		items={filteredList}
		itemTypePlural="publications"
		basePath="/publications"
		viewAllPath="/publications"
		{projectName}
		formatType={formatPublicationType}
		{formatAuthors}
		filters={filterButtons}
	/>
</div>

<style>
	.type-filters-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
