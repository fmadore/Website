<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import type { Communication } from '$lib/types/communication';
	import { formatCVAuthorList } from '$lib/utils/cvFormatters';
	import { formatDayMonth } from '$lib/utils/date-formatter';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVSection from './CVSection.svelte';

	const invitedTalks = communicationsByDate.filter(
		(comm) => comm.type === 'lecture' || comm.type === 'seminar' || comm.type === 'workshop'
	);
	// A panel appearance carries the event itself as its title, so printing the
	// conference alongside would repeat it verbatim ("University of Kansas AI and
	// Africa Symposium", *AI and Africa Symposium*). Print it only when it adds
	// something the title has not already said.
	const venue = (comm: Communication) =>
		comm.conference && !comm.title.includes(comm.conference) ? comm.conference : '';
</script>

<CVSection
	title="Invited Talks"
	items={invitedTalks}
	year={(comm) => new Date(comm.dateISO).getFullYear()}
	key={(comm) => comm.id}
	conditional
>
	{#snippet entry(comm)}
		{@const formattedAuthors = formatCVAuthorList(comm.authors)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
		{#if formattedAuthors}{@html formattedAuthors}.
		{/if}
		{quoteTitle(comm.title)}{#if venue(comm)}, <em>{typesetQuotes(venue(comm))}</em
			>{/if}{#if comm.location}, {typesetQuotes(comm.location)}{/if},
		{formatDayMonth(comm.dateISO)}.
	{/snippet}
</CVSection>
