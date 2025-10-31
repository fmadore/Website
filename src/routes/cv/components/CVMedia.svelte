<script lang="ts">
	import { mediaAppearancesByDate } from '$lib/data/media-appearances';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">Media Appearances</h3>
	{#if mediaAppearancesByDate.length > 0}
		<ul>
			{#each mediaAppearancesByDate as media (media.id)}
				<li class="mb-3">
					{media.type === 'interview' ? 'Interviewed by' : 'Appeared in'}
					<em>{media.outlet}</em>{#if media.program}, {media.program}{/if}.
					{new Date(media.dateISO).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}.
					<span class="block ml-4 text-sm text-light">Topic: {media.topic}</span>
					{#if media.url}<a
							href={media.url}
							target="_blank"
							rel="noopener noreferrer"
							class="ml-4 text-primary hover:underline text-sm">[Link]</a
						>{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-light">No media appearances listed.</p>
	{/if}
</section>
