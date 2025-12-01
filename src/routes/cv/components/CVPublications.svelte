<script lang="ts">
	import { publicationsByDate } from '$lib/data/publications';
	import type { Publication } from '$lib/types';
	import {
		groupPublicationsByType,
		getPublicationTypeDisplayName,
		formatVolumeIssueDisplay,
		formatCVAuthorList,
		formatEditorList,
		formatBlogDate
	} from '../utils/cvFormatters';

	// Group publications using the utility function
	const { publicationsByType, presentPublicationTypes, otherPublicationTypes } =
		groupPublicationsByType(publicationsByDate);
	const filteredPublicationsByDate = publicationsByDate.filter(
		(pub) => pub.type !== 'phd-dissertation' && pub.type !== 'masters-thesis'
	);
</script>

<section>
	<h3>Publications</h3>
	{#if filteredPublicationsByDate.length > 0}
		{#each presentPublicationTypes as pubType (pubType)}
			{#if publicationsByType[pubType] && publicationsByType[pubType].length > 0}
				<h4>{getPublicationTypeDisplayName(pubType)}</h4>
				<div class="space-y-3">
					{#each publicationsByType[pubType] as pub (pub.id)}
						{@const formattedAuthors = formatCVAuthorList(pub.authors)}
						<div class="flex gap-4">
							<div class="font-semibold text-nowrap">{pub.year}</div>
							<div class="flex-1">
								{#if formattedAuthors}{@html formattedAuthors}{#if (pub.type === 'book' && pub.isEditedVolume) || pub.type === 'special-issue'}&nbsp;(eds.),{:else}.{/if} {/if}
								{#if pub.type !== 'book' && pub.type !== 'blogpost'}"{pub.title}".{/if}
								{#if (pub.type === 'article' || pub.type === 'bulletin-article') && pub.journal}
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
									{#if pub.journal}<em>{pub.journal}</em>{formatVolumeIssueDisplay(pub.volume, pub.issue)}{:else if pub.publisher}<em>{pub.publisher}</em>{formatVolumeIssueDisplay(pub.volume, pub.issue)}{/if}{#if pub.pages}, {pub.pages}{/if}.
								{:else if pub.type === 'encyclopedia' && pub.encyclopediaTitle}
									In <em>{pub.encyclopediaTitle}</em>{#if pub.publisher}, {pub.publisher}{/if}.
								{:else if pub.type === 'blogpost'}
									"{pub.title}"{#if pub.publisher}. <em>{pub.publisher}</em>{/if}{#if pub.dateISO}, {formatBlogDate(pub.dateISO)}{/if}.
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
										class="doi-link"
										><img
											src="https://zenodo.org/badge/DOI/{pub.doi}.svg"
											alt="DOI: {pub.doi}"
											class="doi-badge-img"
											onerror={(e) => {
												const img = e.currentTarget as HTMLImageElement;
												img.style.display = 'none';
												const fallback = img.nextElementSibling as HTMLElement;
												if (fallback) {
													fallback.style.display = 'inline-flex';
												}
											}}
										/><span class="doi-badge-fallback">DOI: {pub.doi}</span></a
									>{/if}
								{#if pub.url && !pub.doi}<a
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
								{#if pub.type}<span class="pub-type-badge">{pub.type}</span>{/if}
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

<style>
	.doi-link {
		display: inline-flex;
		align-items: center;
		margin-left: var(--space-2);
	}

	.doi-badge-img {
		height: 1.25rem; /* 20px - equivalent to h-5 */
	}

	.doi-badge-fallback {
		display: none;
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-white);
		background-color: var(--color-primary);
		border-radius: var(--border-radius);
		align-items: center;
	}

	.pub-type-badge {
		font-size: var(--font-size-sm);
		background-color: var(--color-border);
		padding: 0 var(--space-1);
		border-radius: var(--border-radius);
	}
</style>
