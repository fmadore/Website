<script lang="ts">
	import { cvCommunicationsByDate as communicationsByDate } from '$lib/data/communications/cv';
	import { formatCVAuthorList, terminalPeriod } from '$lib/utils/cvFormatters';
	import { invitedTalkVenue as venue, splitCvTalks } from '$lib/utils/cvSections';
	import { formatDayMonth, getYearFromISODate } from '$lib/utils/date-formatter';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVSection from './CVSection.svelte';

	// Lectures, seminars and workshops; the venue is printed only when the title
	// does not already name it (see `invitedTalkVenue`).
	const { invited: invitedTalks } = splitCvTalks(communicationsByDate);
</script>

<CVSection
	title="Invited Talks"
	items={invitedTalks}
	year={(comm) => getYearFromISODate(comm.dateISO)}
	key={(comm) => comm.id}
	conditional
>
	{#snippet entry(comm)}
		{@const formattedAuthors = formatCVAuthorList(comm.authors)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
		{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
		{/if}
		{quoteTitle(comm.title)}{#if venue(comm)}, <em>{typesetQuotes(venue(comm))}</em
			>{/if}{#if comm.location}, {typesetQuotes(comm.location)}{/if},
		{formatDayMonth(comm.dateISO)}.
	{/snippet}
</CVSection>
