<script lang="ts">
	import Icon from '@iconify/svelte';
	import { mediaAppearancesByDate } from '$lib/data/media-appearances';
	import { communicationSummariesByDate as communicationsByDate } from '$lib/data/communications/summaries';
	import { formatDayMonth } from '$lib/utils/date-formatter';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';

	// Filter podcasts from communications
	const podcasts = communicationsByDate.filter((comm) => comm.type === 'podcast');
</script>

<section>
	<h3>Media Appearances</h3>

	<!-- Podcasts -->
	{#if podcasts.length > 0}
		<h4>Podcasts</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each podcasts as podcast (podcast.id)}
				{@const podcastDate = new Date(podcast.dateISO)}
				<CVEntry year={podcastDate.getFullYear()}>
					{quoteTitle(podcast.title)}{#if podcast.conference}, <em
							>{typesetQuotes(podcast.conference)}</em
						>{/if}{#if podcast.episode}, ep. {podcast.episode}{/if}.
					{formatDayMonth(podcast.dateISO)}.
					{#if podcast.doi}
						<span class="block text-sm text-light mt-1"
							><Icon
								icon="academicons:doi"
								width="1.2em"
								height="1.2em"
								inline
								aria-hidden="true"
							/> DOI:
							<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
							<a
								href="https://doi.org/{podcast.doi}"
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary hover:underline"
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
							class="text-primary hover:underline text-sm"
							>Listen<span aria-hidden="true">&nbsp;↗</span></a
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
				{@const mediaDate = new Date(media.dateISO)}
				<CVEntry year={mediaDate.getFullYear()}>
					{media.type === 'interview' ? 'Interviewed by' : 'Appeared in'}
					<em>{typesetQuotes(media.outlet)}</em>{#if media.program}, {typesetQuotes(
							media.program
						)}{/if}.
					{formatDayMonth(media.dateISO)}.
					<span class="block text-sm text-light mt-1">Topic: {typesetQuotes(media.topic)}</span>
					{#if media.url}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
						<a
							href={media.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Link to {media.outlet}: {media.topic} (opens in new tab)"
							class="text-primary hover:underline text-sm"
							>Link<span aria-hidden="true">&nbsp;↗</span></a
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
