<script lang="ts">
	import { publicationsByDate } from '$lib/data/publications';
	import type { Publication } from '$lib/types';
	import {
		groupPublicationsByType,
		getPublicationTypeDisplayName,
		formatVolumeIssueDisplay,
		formatCVAuthorList,
		formatEditorList
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
				<div class="space-y-3">
					{#each publicationsByType[pubType] as pub (pub.id)}
						{@const formattedAuthors = formatCVAuthorList(pub.authors)}
						<div class="flex gap-4">
							<div class="font-semibold text-nowrap">{pub.year}</div>
							<div class="flex-1">
								{#if formattedAuthors}{@html formattedAuthors}{#if (pub.type === 'book' && pub.isEditedVolume) || pub.type === 'special-issue'}&nbsp;(eds.),{:else}.{/if} {/if}
								{#if pub.type !== 'book'}"{pub.title}".{/if}
								{#if pub.type === 'article' && pub.journal}
									<em>{pub.journal}</em>{formatVolumeIssueDisplay(
										pub.volume,
										pub.issue
									)}{#if pub.pages}: {pub.pages}{/if}.
								{:else if pub.type === 'chapter' && pub.book}
									In {#if pub.editors}{formatEditorList(pub.editors)} (eds.),&nbsp;{/if}<em>{pub.book}</em>{#if pub.placeOfPublication || pub.publisher}.&nbsp;{@const city =
											pub.placeOfPublication || ''}{@const publisher =
											pub.publisher || ''}{#if city && publisher}{city}: {publisher}{:else if city}{city}{:else if publisher}{publisher}{/if}{/if}{#if pub.pages}, {pub.pages}{/if}.
								{:else if pub.type === 'book'}
									<em>{pub.title}</em
									>{#if pub.placeOfPublication || pub.publisher}.&nbsp;{@const city =
											pub.placeOfPublication || ''}{@const publisher =
											pub.publisher || ''}{#if city && publisher}{city}: {publisher}{:else if city}{city}{:else if publisher}{publisher}{/if}.{:else}.{/if}
								{:else if pub.type === 'special-issue' && pub.journal}
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
								{#if pub.reviewedBy && pub.reviewedBy.length > 0}
									<div class="mt-2 ml-4 text-sm">
										Reviewed in
										{#each pub.reviewedBy as review, i (review.title + review.year)}
											<a
												href={review.url}
												target="_blank"
												rel="noopener noreferrer"
												class="text-primary hover:underline"
												><em>{review.journal}</em></a
											>{#if i < pub.reviewedBy.length - 2}, {' '}
											{:else if i === pub.reviewedBy.length - 2}, and {' '}
											{:else}.{/if}
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/each}

		<!-- Optional: Section for other publication types -->
		{#if otherPublicationTypes.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Other</h4>
			<div class="space-y-3">
				{#each otherPublicationTypes as pubType (pubType)}
					{#each publicationsByType[pubType as Publication['type']] as pub (pub.id)}
						<div class="flex gap-4">
							<div class="font-semibold text-nowrap">{pub.year}</div>
							<div class="flex-1">
								<!-- Simplified display for other types -->
								<span class="font-medium">{pub.title}</span>.
								{#if pub.type}<span class="text-sm bg-border px-1 rounded">{pub.type}</span>{/if}
								{#if pub.url}<a
										href={pub.url}
										target="_blank"
										rel="noopener noreferrer"
										class="ml-1 text-primary hover:underline text-sm">[Link]</a
									>{/if}
							</div>
						</div>
					{/each}
				{/each}
			</div>
		{/if}
	{:else}
		<p class="text-light">No publications listed.</p>
	{/if}
</section>
