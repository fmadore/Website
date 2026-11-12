<script lang="ts">
	import { mediaAppearancesByDate } from '#lib/data/media-appearances/index.ts';
	import { cvCommunicationsByDate as communicationsByDate } from '#lib/data/communications/cv.ts';
	import { splitCvTalks } from '#lib/utils/cvSections.ts';
	import { formatDayMonth, getYearFromISODate } from '#lib/utils/date-formatter.ts';
	import { resolve } from '$app/paths';
	import { titleLangAttr } from '#lib/utils/languageUtils.ts';
	import { quoteTitle, typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import CVEntry from './CVEntry.svelte';
	import { CV_GLYPH } from './CVGlyphs.svelte';

	const { podcasts } = splitCvTalks(communicationsByDate);
</script>

<section>
	<h3>Media Appearances</h3>

	<!-- Podcasts -->
	{#if podcasts.length > 0}
		<h4>Podcasts</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each podcasts as podcast (podcast.id)}
				<CVEntry year={getYearFromISODate(podcast.dateISO)}>
					<a
						href={resolve('/communications/[id]', { id: podcast.id })}
						lang={titleLangAttr(podcast.language)}
						class="cv-record-link">{quoteTitle(podcast.title)}</a
					>{#if podcast.conference}, <em>{typesetQuotes(podcast.conference)}</em
						>{/if}{#if podcast.episode}, ep. {podcast.episode}{/if}.
					{formatDayMonth(podcast.dateISO)}.
					{#if podcast.doi}
						<span class="cv-note"
							><svg class="cv-doi-mark" aria-hidden="true" focusable="false"
								><use href="#{CV_GLYPH.doi}" /></svg
							>
							DOI:
							<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
							<a href="https://doi.org/{podcast.doi}" target="_blank" rel="noopener noreferrer"
								>{podcast.doi}<span class="sr-only"> (opens in new tab)</span></a
							><!-- eslint-enable svelte/no-navigation-without-resolve --></span
						>
					{/if}
					{#if podcast.url}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
						<a
							href={podcast.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Listen to {podcast.title} (opens in new tab)"
							class="cv-detail">Listen<span aria-hidden="true">&nbsp;↗</span></a
						>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	<!-- Traditional Media Appearances -->
	{#if mediaAppearancesByDate.length > 0}
		<h4>Interviews and Appearances</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each mediaAppearancesByDate as media (media.id)}
				<CVEntry year={getYearFromISODate(media.dateISO)}>
					{media.type === 'interview' ? 'Interviewed by' : 'Appeared in'}
					<em>{typesetQuotes(media.outlet)}</em>{#if media.program}, {typesetQuotes(
							media.program
						)}{/if}.
					{formatDayMonth(media.dateISO)}.
					<span class="cv-note">Topic: {typesetQuotes(media.topic)}</span>
					{#if media.url}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
						<a
							href={media.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Link to {media.outlet}: {media.topic} (opens in new tab)"
							class="cv-detail">Link<span aria-hidden="true">&nbsp;↗</span></a
						>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if mediaAppearancesByDate.length === 0 && podcasts.length === 0}
		<p class="cv-empty">No media appearances or podcasts listed.</p>
	{/if}
</section>

<style>
	/* The DOI mark in a podcast's note, at the size and seat <Icon inline>
	 * gave it: 1.2em, dropped onto the baseline. */
	.cv-doi-mark {
		width: 1.2em;
		height: 1.2em;
		vertical-align: -0.125em;
	}
</style>
