<script lang="ts">
	import { allCommunicationSummaries } from '$lib/data/communications/summaries';
	import RelevantItemsList from '$lib/components/panels/RelevantItemsList.svelte';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';
	import { formatAuthorsCompact as formatAuthors } from '$lib/utils/nameUtils';

	// Props - project name and limit
	let {
		projectName,
		limit = 5
	}: {
		projectName: string;
		limit?: number;
	} = $props();

	// Add state for selected type filter
	let selectedType = $state<string | null>(null);

	// Filter talks by project name. The summaries suffice: the card prints at
	// most 120 characters of the abstract, which the excerpt covers.
	let communicationList = $derived<RelevantItem[]>(
		allCommunicationSummaries
			.filter((comm) => comm.project === projectName)
			.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
			.slice(0, limit)
			.map((comm) => ({
				id: comm.id,
				project: comm.project,
				type: comm.type ?? 'conference',
				date: comm.date,
				dateISO: comm.dateISO,
				title: comm.title,
				authors: comm.authors,
				abstract: comm.abstractExcerpt
			}))
	);

	// Compute filtered list based on selected type
	let filteredList = $derived<RelevantItem[]>(
		selectedType
			? communicationList.filter((comm) => comm.type === selectedType)
			: communicationList
	);

	// Format communication type for display
	function formatCommunicationType(type: string): string {
		const typeMap: Record<string, string> = {
			conference: 'Conference Paper',
			workshop: 'Workshop',
			seminar: 'Seminar',
			lecture: 'Lecture',
			panel: 'Panel',
			poster: 'Poster Presentation',
			event: 'Academic Event'
		};
		return typeMap[type] || type;
	}
</script>

<div>
	<RelevantItemsList
		title="Related talks & events"
		items={filteredList}
		collectionLabel="talks & events"
		emptyLabel="talks or events"
		basePath="/communications"
		viewAllPath="/conference-activity"
		{projectName}
		formatType={formatCommunicationType}
		{formatAuthors}
	/>
</div>
