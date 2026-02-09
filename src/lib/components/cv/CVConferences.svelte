<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList } from '$lib/utils/cvFormatters';
	import CVEntry from './CVEntry.svelte';

	// Filter communications by type
	const organizedPanels = communicationsByDate.filter((comm) => comm.type === 'panel');
	const presentedPapers = communicationsByDate.filter((comm) => comm.type === 'conference');
</script>

{#if organizedPanels.length > 0 || presentedPapers.length > 0}
	<section>
		<h3>Conference Participation</h3>

		<!-- Panels Organised -->
		{#if organizedPanels.length > 0}
			<h4>Panels organised</h4>
			<div class="space-y-3">
				{#each organizedPanels as comm (comm.id)}
					{@const commDate = new Date(comm.dateISO)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={commDate.getFullYear()}>
						{#if formattedAuthors}{@html formattedAuthors}. {/if}
						"{comm.panelTitle || comm.title}"{#if comm.conference}, <em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}, {commDate.toLocaleDateString(
							'en-GB',
							{
								day: 'numeric',
								month: 'long'
							}
						)}.
					</CVEntry>
				{/each}
			</div>
		{/if}

		<!-- Papers Presented -->
		{#if presentedPapers.length > 0}
			<h4>Papers presented</h4>
			<div class="space-y-3">
				{#each presentedPapers as comm (comm.id)}
					{@const commDate = new Date(comm.dateISO)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={commDate.getFullYear()}>
						{#if formattedAuthors}{@html formattedAuthors}. {/if}
						"{comm.title}"{#if comm.conference}, <em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}, {commDate.toLocaleDateString(
							'en-GB',
							{
								day: 'numeric',
								month: 'long'
							}
						)}.
					</CVEntry>
				{/each}
			</div>
		{/if}
	</section>
{/if}
