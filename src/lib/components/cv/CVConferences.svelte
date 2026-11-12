<script lang="ts">
	import { cvCommunicationsByDate as communicationsByDate } from '#lib/data/communications/cv.ts';
	import { formatCVAuthorList, terminalPeriod } from '#lib/utils/cvFormatters.ts';
	import { organisedPanelTitle, splitCvTalks } from '#lib/utils/cvSections.ts';
	import { formatDayMonth, getYearFromISODate } from '#lib/utils/date-formatter.ts';
	import { resolve } from '$app/paths';
	import { titleLangAttr } from '#lib/utils/languageUtils.ts';
	import { quoteTitle, typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import CVEntry from './CVEntry.svelte';

	const {
		panels: organizedPanels,
		papers: presentedPapers,
		posters: presentedPosters
	} = splitCvTalks(communicationsByDate);
</script>

{#if organizedPanels.length > 0 || presentedPapers.length > 0 || presentedPosters.length > 0}
	<section>
		<h3>Conference Participation</h3>

		<!-- Panels Organised -->
		{#if organizedPanels.length > 0}
			<h4>Panels organised</h4>
			<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
				{#each organizedPanels as comm (comm.id)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={getYearFromISODate(comm.dateISO)}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
						{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
						{/if}
						<a
							href={resolve('/communications/[id]', { id: comm.id })}
							lang={titleLangAttr(comm.language)}
							class="cv-record-link">{quoteTitle(organisedPanelTitle(comm))}</a
						>{#if comm.conference}, <em>{typesetQuotes(comm.conference)}</em
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
			<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
				{#each presentedPapers as comm (comm.id)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={getYearFromISODate(comm.dateISO)}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
						{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
						{/if}
						<a
							href={resolve('/communications/[id]', { id: comm.id })}
							lang={titleLangAttr(comm.language)}
							class="cv-record-link">{quoteTitle(comm.title)}</a
						>{#if comm.conference}, <em>{typesetQuotes(comm.conference)}</em
							>{/if}{#if comm.location}, {typesetQuotes(comm.location)}{/if},
						{formatDayMonth(comm.dateISO)}.
					</CVEntry>
				{/each}
			</div>
		{/if}

		<!-- Posters Presented -->
		{#if presentedPosters.length > 0}
			<h4>Posters presented</h4>
			<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
				{#each presentedPosters as comm (comm.id)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<CVEntry year={getYearFromISODate(comm.dateISO)}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
						{#if formattedAuthors}{@html formattedAuthors}{terminalPeriod(formattedAuthors)}
						{/if}
						<a
							href={resolve('/communications/[id]', { id: comm.id })}
							lang={titleLangAttr(comm.language)}
							class="cv-record-link">{quoteTitle(comm.title)}</a
						>{#if comm.conference}, <em>{typesetQuotes(comm.conference)}</em
							>{/if}{#if comm.location}, {typesetQuotes(comm.location)}{/if},
						{formatDayMonth(comm.dateISO)}.
					</CVEntry>
				{/each}
			</div>
		{/if}
	</section>
{/if}
