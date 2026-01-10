<script lang="ts">
	import { mediaAppearancesByDate } from '$lib/data/media-appearances';
	import { communicationsByDate } from '$lib/data/communications';
	import CVEntry from './CVEntry.svelte';

	// Filter podcasts from communications
	const podcasts = communicationsByDate.filter((comm) => comm.type === 'podcast');
</script>

<section>
	<h3>Media Appearances</h3>
	
	<!-- Podcasts -->
	{#if podcasts.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Podcasts</h4>
		<div class="space-y-3">
			{#each podcasts as podcast (podcast.id)}
				{@const podcastDate = new Date(podcast.dateISO)}
				<CVEntry year={podcastDate.getFullYear()}>
					"{podcast.title}"{#if podcast.conference}, <em>{podcast.conference}</em>{/if}{#if podcast.episode}, ep. {podcast.episode}{/if}.
					{podcastDate.toLocaleDateString('en-GB', {
						day: 'numeric',
						month: 'long'
					})}.
					{#if podcast.doi}
						<span class="block text-sm text-light mt-1">DOI: <a href="https://doi.org/{podcast.doi}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">{podcast.doi}</a></span>
					{/if}
					{#if podcast.url}
						<a
							href={podcast.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary hover:underline text-sm">[Listen]</a
						>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}
	
	<!-- Traditional Media Appearances -->
	{#if mediaAppearancesByDate.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Interviews and Appearances</h4>
		<div class="space-y-3">
			{#each mediaAppearancesByDate as media (media.id)}
				{@const mediaDate = new Date(media.dateISO)}
				<CVEntry year={mediaDate.getFullYear()}>
					{media.type === 'interview' ? 'Interviewed by' : 'Appeared in'}
				<em>{media.outlet}</em>{#if media.program}, {media.program}{/if}.
				{mediaDate.toLocaleDateString('en-GB', {
					day: 'numeric',
					month: 'long'
				})}.
				<span class="block text-sm text-light mt-1">Topic: {media.topic}</span>
					{#if media.url}<a
							href={media.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary hover:underline text-sm">[Link]</a
						>{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}
	
	{#if mediaAppearancesByDate.length === 0 && podcasts.length === 0}
		<p class="text-light">No media appearances or podcasts listed.</p>
	{/if}
</section>
