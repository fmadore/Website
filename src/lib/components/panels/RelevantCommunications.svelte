<script lang="ts">
	import { allCommunications } from '../../data/communications/index';
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

	// Filter communications by project name
	let communicationList = $derived<RelevantItem[]>(
		allCommunications
			.filter((comm) => comm.project === projectName)
			.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
			.slice(0, limit) as RelevantItem[]
	); // Cast to the generic type

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
			event: 'Academic Event'
		};
		return typeMap[type] || type;
	}
</script>

<div>
	<RelevantItemsList
		title="Relevant Communications"
		items={filteredList}
		itemTypePlural="communications"
		basePath="/communications"
		viewAllPath="/conference-activity"
		{projectName}
		formatType={formatCommunicationType}
		{formatAuthors}
	/>
</div>
