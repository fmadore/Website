<script lang="ts">
	// import { onMount } from 'svelte'; // Removed as unused
	import { allCommunications } from '../../data/communications/index';
	// import type { Communication } from '$lib/types/communication'; // Removed as unused
	import RelevantItemsList from '$lib/components/panels/RelevantItemsList.svelte';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';

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

	// Get unique communication types for the type filter
	let communicationTypes = $derived<string[]>(
		[...new Set(communicationList.map((comm) => comm.type).filter(Boolean))].sort() as string[]
	);

	// Compute filtered list based on selected type
	let filteredList = $derived<RelevantItem[]>(
		selectedType
			? communicationList.filter((comm) => comm.type === selectedType)
			: communicationList
	);

	// Handler for type filter button
	function selectType(type: string) {
		selectedType = selectedType === type ? null : type;
	}

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

	// Format authors for display (can be reused or moved to utils later)
	function formatAuthors(authors: string[]): string {
		if (!authors || authors.length === 0) return '';
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
		return `${authors[0]} et al.`;
	}
</script>

<div>
	<RelevantItemsList
		title="Relevant Communications"
		items={filteredList}
		itemTypePlural="communications"
		basePath="/communications"
		viewAllPath="/conference-activity"
		formatType={formatCommunicationType}
		{formatAuthors}
	/>
</div>
