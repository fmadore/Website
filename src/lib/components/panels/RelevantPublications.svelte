<script lang="ts">
	import { allPublicationSummaries } from '$lib/data/publications/summaries';
	import RelevantItemsList from '$lib/components/panels/RelevantItemsList.svelte';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';
	import { formatAuthorsCompact as formatAuthors } from '$lib/utils/nameUtils';
	import { PUBLICATION_TYPE_PANEL_LABELS } from '$lib/utils/publicationTypeLabels';

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

	// Filter publications by project name. The summaries suffice: the panel row
	// prints at most PANEL_EXCERPT_LENGTH characters of the abstract, which the
	// excerpt covers.
	let publicationList = $derived<RelevantItem[]>(
		allPublicationSummaries
			.filter((pub) => pub.project === projectName)
			.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
			.slice(0, limit)
			.map((pub) => ({
				id: pub.id,
				project: pub.project,
				type: pub.type,
				date: pub.date,
				dateISO: pub.dateISO,
				title: pub.title,
				authors: pub.authors,
				abstract: pub.abstractExcerpt
			}))
	);

	// The types present in this project's set, each with its tally — a chip
	// states what it would leave standing, which is what makes it a facet
	// rather than a button.
	let publicationTypes = $derived(
		[...new Set(publicationList.map((pub) => pub.type).filter(Boolean))].sort().map((type) => ({
			type: type as string,
			count: publicationList.filter((pub) => pub.type === type).length
		}))
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
		return PUBLICATION_TYPE_PANEL_LABELS[type] || type;
	}
</script>

<div>
	{#snippet filterButtons()}
		{#if showTypeFilters && publicationTypes.length > 1}
			<div class="chip-row">
				{#each publicationTypes as { type, count } (type)}
					<button
						type="button"
						class="chip"
						class:chip--selected={selectedType === type}
						aria-pressed={selectedType === type}
						data-count={count}
						onclick={() => selectType(type)}
					>
						{formatPublicationType(type)} <span class="chip-count">{count}</span>
					</button>
				{/each}
			</div>
		{/if}
	{/snippet}

	<RelevantItemsList
		title="Related publications"
		items={filteredList}
		collectionLabel="publications"
		emptyLabel="publications"
		basePath="/publications"
		viewAllPath="/publications"
		{projectName}
		formatType={formatPublicationType}
		{formatAuthors}
		filters={filterButtons}
	/>
</div>
