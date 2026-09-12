<script lang="ts">
	import { allCommunicationSummaries } from '$lib/data/communications/summaries';
	import RelevantItemsList from '$lib/components/panels/RelevantItemsList.svelte';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';
	import { formatAuthorsCompact as formatAuthors } from '$lib/utils/nameUtils';
	import { getCommunicationTypeBadge } from '$lib/utils/typeUtils';

	// Props - project name and limit
	let {
		projectName,
		limit = 5
	}: {
		projectName: string;
		limit?: number;
	} = $props();

	// Filter talks by project name. The summaries suffice: the panel row prints
	// at most PANEL_EXCERPT_LENGTH characters of the abstract, which the excerpt
	// covers.
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

	// Kind labels come from the shared register, not a local copy. The copy this
	// replaces duplicated COMMUNICATION_TYPE_BADGE_LABELS except that it omitted
	// `podcast` altogether, so a podcast talk filed under a project printed the
	// raw key `podcast` as its kind — the same failure mode the registry guard
	// was written for. There is no filter snippet on this panel, so there was
	// also a `selectedType` state and a `filteredList` derived from it that
	// nothing could ever change; both are gone with it.
</script>

<div>
	<RelevantItemsList
		title="Related talks & events"
		items={communicationList}
		collectionLabel="talks & events"
		emptyLabel="talks or events"
		basePath="/communications"
		viewAllPath="/conference-activity"
		{projectName}
		formatType={getCommunicationTypeBadge}
		{formatAuthors}
	/>
</div>
