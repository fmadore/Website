<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList, terminalPeriod } from '$lib/utils/cvFormatters';
	import { formatDayMonth } from '$lib/utils/date-formatter';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';

	// Filter communications by type
	const organizedPanels = communicationsByDate.filter((comm) => comm.type === 'panel');
	const presentedPapers = communicationsByDate.filter((comm) => comm.type === 'conference');
	const presentedPosters = communicationsByDate.filter((comm) => comm.type === 'poster');
</script>

{#if organizedPanels.length > 0 || presentedPapers.length > 0 || presentedPosters.length > 0}
	<section>
		<h3>Conference Participation</h3>

		<!-- Panels Organised -->
		{#if organizedPanels.length > 0}
			<h4>Panels organised</h4>
			<div class="space-y-3 ledger">
				{#each organizedPanels as comm (comm.id)}
					{@const commDate = new Date(comm.dateISO)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={commDate.getFullYear()}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
						{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
						{/if}
						{quoteTitle(comm.panelTitle || comm.title)}{#if comm.conference}, <em
								>{typesetQuotes(comm.conference)}</em
							>{/if}{#if comm.location}, {typesetQuotes(comm.location)}{/if}, {formatDayMonth(
							comm.dateISO
						)}.
					</CVEntry>
				{/each}
			</div>
		{/if}

		<!-- Papers Presented -->
		{#if presentedPapers.length > 0}
			<h4>Papers presented</h4>
			<div class="space-y-3 ledger">
				{#each presentedPapers as comm (comm.id)}
					{@const commDate = new Date(comm.dateISO)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={commDate.getFullYear()}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
						{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
						{/if}
						{quoteTitle(comm.title)}{#if comm.conference}, <em>{typesetQuotes(comm.conference)}</em
							>{/if}{#if comm.location}, {typesetQuotes(comm.location)}{/if},
						{formatDayMonth(comm.dateISO)}.
					</CVEntry>
				{/each}
			</div>
		{/if}

		<!-- Posters Presented -->
		{#if presentedPosters.length > 0}
			<h4>Posters presented</h4>
			<div class="space-y-3 ledger">
				{#each presentedPosters as comm (comm.id)}
					{@const commDate = new Date(comm.dateISO)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={commDate.getFullYear()}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
						{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
						{/if}
						{quoteTitle(comm.title)}{#if comm.conference}, <em>{typesetQuotes(comm.conference)}</em
							>{/if}{#if comm.location}, {typesetQuotes(comm.location)}{/if},
						{formatDayMonth(comm.dateISO)}.
					</CVEntry>
				{/each}
			</div>
		{/if}
	</section>
{/if}
