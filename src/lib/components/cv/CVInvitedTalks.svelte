<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList } from '$lib/utils/cvFormatters';
	import CVSection from './CVSection.svelte';

	const invitedTalks = communicationsByDate.filter(
		(comm) => comm.type === 'lecture' || comm.type === 'seminar' || comm.type === 'workshop'
	);
</script>

<CVSection
	title="Invited Talks"
	items={invitedTalks}
	year={(comm) => new Date(comm.dateISO).getFullYear()}
	conditional
>
	{#snippet entry(comm)}
		{@const commDate = new Date(comm.dateISO)}
		{@const formattedAuthors = formatCVAuthorList(comm.authors)}
		{#if formattedAuthors}{@html formattedAuthors}. {/if}
		"{comm.title}"{#if comm.conference}, <em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}, {commDate.toLocaleDateString(
			'en-GB',
			{
				day: 'numeric',
				month: 'long'
			}
		)}.
	{/snippet}
</CVSection>
