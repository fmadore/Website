<script lang="ts">
	import { publicationsByDate } from '$lib/data/publications';
	import { formatAuthorList } from '$lib/utils/citationFormatter';
	import type { Publication } from '$lib/types';
	import {
		groupPublicationsByType,
		getPublicationTypeDisplayName,
		formatVolumeIssueDisplay
	} from '../utils/cvFormatters';

	// Group publications using the utility function
	const { publicationsByType, presentPublicationTypes, otherPublicationTypes } =
		groupPublicationsByType(publicationsByDate);
	const filteredPublicationsByDate = publicationsByDate.filter(
		(pub) => pub.type !== 'phd-dissertation' && pub.type !== 'masters-thesis'
	);
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-light pb-1">Publications</h3>
	{#if filteredPublicationsByDate.length > 0}
		{#each presentPublicationTypes as pubType (pubType)}
			{#if publicationsByType[pubType] && publicationsByType[pubType].length > 0}
				<h4 class="text-lg font-semibold mt-4 mb-2">{getPublicationTypeDisplayName(pubType)}</h4>
				<ul class="list-disc pl-6">
					{#each publicationsByType[pubType] as pub (pub.id)}
						<li class="mb-3">
							{#if pub.authors}{formatAuthorList(pub.authors)}
							{/if}
							({pub.year}).
							{#if pub.type !== 'book'}"{pub.title}".{/if}
							{#if pub.type === 'article' && pub.journal}
								<em>{pub.journal}</em>{formatVolumeIssueDisplay(
									pub.volume,
									pub.issue
								)}{#if pub.pages}: {pub.pages}{/if}.
							{:else if pub.type === 'chapter' && pub.book}
								In {#if pub.editors}<em>{pub.editors} (ed.), </em>{/if}<em>{pub.book}</em
								>{#if pub.publisher}, {pub.publisher}{/if}{#if pub.pages}, pp. {pub.pages}{/if}.
							{:else if pub.type === 'book'}
								<em>{pub.title}</em
								>{#if pub.placeOfPublication || pub.publisher}.&nbsp;{@const city =
										pub.placeOfPublication || ''}{@const publisher =
										pub.publisher || ''}{#if city && publisher}{city}: {publisher}{:else if city}{city}{:else if publisher}{publisher}{/if}.{:else}.{/if}
							{:else if pub.type === 'special-issue' && pub.journal}
								Guest Editor for Special Issue: "{pub.title}",
								<em>{pub.journal}</em>{formatVolumeIssueDisplay(pub.volume, pub.issue)}.
							{:else if pub.type === 'report'}
								<em>{pub.title}</em>{#if pub.publisher}, {pub.publisher}{/if}.
							{:else if pub.type === 'encyclopedia' && pub.encyclopediaTitle}
								In <em>{pub.encyclopediaTitle}</em>{#if pub.publisher}, {pub.publisher}{/if}.
							{:else if pub.type === 'blogpost'}
								{#if pub.url}<a href={pub.url} target="_blank" rel="noopener noreferrer"
										>"{pub.title}"</a
									>{/if}. Blog Post.
							{:else if pub.type === 'conference-proceedings'}
								In <em>{pub.proceedingsTitle}</em>.
							{:else}
								<!-- Generic fallback -->
								{#if pub.journal}In <em>{pub.journal}</em>.{/if}
								{#if pub.book}In <em>{pub.book}</em>.{/if}
								{#if pub.publisher}{pub.publisher}.{/if}
							{/if}
							{#if pub.doi}<a
									href="https://doi.org/{pub.doi}"
									target="_blank"
									rel="noopener noreferrer"
									class="ml-2 inline-flex items-center align-middle"
									><img
										src="https://zenodo.org/badge/DOI/{pub.doi}.svg"
										alt="DOI: {pub.doi}"
										class="h-5"
										onerror={(e) => {
											const img = e.currentTarget as HTMLImageElement;
											img.style.display = 'none';
											const fallback = img.nextElementSibling as HTMLElement;
											if (fallback) {
												fallback.style.display = 'inline-flex';
											}
										}}
									/><span
										class="px-2 py-0.5 text-xs font-medium text-white bg-primary rounded items-center"
										style="display:none;">DOI: {pub.doi}</span
									></a
								>{/if}
							{#if pub.url && pub.type !== 'blogpost' && !pub.doi}<a
									href={pub.url}
									target="_blank"
									rel="noopener noreferrer"
									class="ml-1 text-primary hover:underline text-sm">[Link]</a
								>{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{/each}

		<!-- Optional: Section for other publication types -->
		{#if otherPublicationTypes.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Other</h4>
			<ul class="list-disc pl-6">
				{#each otherPublicationTypes as pubType (pubType)}
					{#each publicationsByType[pubType as Publication['type']] as pub (pub.id)}
						<li class="mb-3">
							<!-- Simplified display for other types -->
							<span class="font-medium">{pub.title}</span> ({pub.year}).
							{#if pub.type}<span class="text-sm bg-border px-1 rounded">{pub.type}</span>{/if}
							{#if pub.url}<a
									href={pub.url}
									target="_blank"
									rel="noopener noreferrer"
									class="ml-1 text-primary hover:underline text-sm">[Link]</a
								>{/if}
						</li>
					{/each}
				{/each}
			</ul>
		{/if}
	{:else}
		<p class="text-light">No publications listed.</p>
	{/if}
</section>
