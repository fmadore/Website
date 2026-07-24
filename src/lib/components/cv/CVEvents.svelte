<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList } from '$lib/utils/cvFormatters';
	import { formatDayMonth } from '$lib/utils/date-formatter';
	import CVSection from './CVSection.svelte';

	const organizedEvents = communicationsByDate.filter((comm) => comm.type === 'event');
</script>

<CVSection
	title="Organization of Academic Events"
	items={organizedEvents}
	year={(comm) => new Date(comm.dateISO).getFullYear()}
	key={(comm) => comm.id}
	conditional
>
	{#snippet entry(comm)}
		{@const formattedAuthors = formatCVAuthorList(comm.authors)}
		{@const dateDisplay = comm.date.includes('-')
			? comm.date.replace(/\s+\d{4}$/, '')
			: formatDayMonth(comm.dateISO)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
		{#if formattedAuthors}{@html formattedAuthors}.
		{/if}
		"{comm.title}"{#if comm.location}, {comm.location}{/if}, {dateDisplay}.
	{/snippet}
</CVSection>
