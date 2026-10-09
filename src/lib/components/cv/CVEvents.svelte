<script lang="ts">
	import { cvCommunicationsByDate as communicationsByDate } from '$lib/data/communications/cv';
	import { formatCVAuthorList, terminalPeriod } from '$lib/utils/cvFormatters';
	import { cvEventDate, splitCvTalks } from '$lib/utils/cvSections';
	import { getYearFromISODate } from '$lib/utils/date-formatter';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVSection from './CVSection.svelte';

	const { events: organizedEvents } = splitCvTalks(communicationsByDate);
</script>

<CVSection
	title="Organisation of Academic Events"
	items={organizedEvents}
	year={(comm) => getYearFromISODate(comm.dateISO)}
	key={(comm) => comm.id}
	conditional
>
	{#snippet entry(comm)}
		{@const formattedAuthors = formatCVAuthorList(comm.authors)}
		{@const dateDisplay = cvEventDate(comm)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
		{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
		{/if}
		{quoteTitle(comm.title)}{#if comm.location}, {typesetQuotes(comm.location)}{/if}, {dateDisplay}.
	{/snippet}
</CVSection>
