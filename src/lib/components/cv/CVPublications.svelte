<script lang="ts">
	import Icon from '@iconify/svelte';
	import { publicationSummariesByDate as publicationsByDate } from '$lib/data/publications/summaries';
	import type { Publication } from '$lib/types';
	import {
		groupPublicationsByType,
		formatVolumeIssueDisplay,
		formatCVAuthorList,
		formatEditorList,
		terminalPeriod,
		formatBlogDate,
		getCVDisplayYear
	} from '$lib/utils/cvFormatters';
	import { getPublicationTypeDisplayName } from '$lib/utils/publicationTypeLabels';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';

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
				<div class="space-y-3 ledger ledger--tight ledger--ruled">
					{#each publicationsByType[pubType] as pub (pub.id)}
						{@const formattedAuthors = formatCVAuthorList(pub.authors)}
						{@const authorStop = terminalPeriod(formattedAuthors)}
						<CVEntry year={getCVDisplayYear(pub)}>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
							{#if formattedAuthors}{@html formattedAuthors}{#if (pub.type === 'book' && pub.isEditedVolume) || pub.type === 'special-issue'}&nbsp;(eds.),{:else}{authorStop}{/if}
							{/if}
							{#if pub.type !== 'book' && pub.type !== 'blogpost'}{quoteTitle(pub.title)}.{/if}
							{#if (pub.type === 'article' || pub.type === 'bulletin-article') && pub.journal}
								<em>{typesetQuotes(pub.journal)}</em>{formatVolumeIssueDisplay(
									pub.volume,
									pub.issue
								)}{#if pub.pages}: {pub.pages}{/if}.
							{:else if pub.type === 'chapter' && pub.book}
								In {#if pub.editors}{formatEditorList(pub.editors)} (eds.),&nbsp;{/if}<em
									>{typesetQuotes(pub.book)}</em
								>{#if pub.placeOfPublication || pub.publisher}.&nbsp;{@const city = typesetQuotes(
										pub.placeOfPublication
									)}{@const publisher = typesetQuotes(pub.publisher)}{#if city && publisher}{city}: {publisher}{:else if city}{city}{:else if publisher}{publisher}{/if}{/if}{#if pub.pages},
									{pub.pages}{/if}.
							{:else if pub.type === 'book'}
								<em>{typesetQuotes(pub.title)}</em
								>{#if pub.placeOfPublication || pub.publisher}.&nbsp;{@const city = typesetQuotes(
										pub.placeOfPublication
									)}{@const publisher = typesetQuotes(pub.publisher)}{#if city && publisher}{city}: {publisher}{:else if city}{city}{:else if publisher}{publisher}{/if}.{:else}.{/if}
							{:else if pub.type === 'special-issue' && pub.journal}
								<em>{typesetQuotes(pub.journal)}</em>{formatVolumeIssueDisplay(
									pub.volume,
									pub.issue
								)}.
							{:else if pub.type === 'working-paper'}
								{#if pub.series || pub.journal}<em>{typesetQuotes(pub.series || pub.journal)}</em
									>{#if pub.issue}&nbsp;{pub.issue}{/if}{/if}{#if pub.pages}: {pub.pages}{/if}{#if pub.publisher && pub.publisher !== (pub.series || pub.journal)}.
									{typesetQuotes(pub.publisher)}{/if}.
							{:else if pub.type === 'report'}
								{#if pub.journal}<em>{typesetQuotes(pub.journal)}</em>{formatVolumeIssueDisplay(
										pub.volume,
										pub.issue
									)}{:else if pub.publisher}<em>{typesetQuotes(pub.publisher)}</em
									>{formatVolumeIssueDisplay(pub.volume, pub.issue)}{/if}{#if pub.pages}, {pub.pages}{/if}.
							{:else if pub.type === 'encyclopedia' && pub.encyclopediaTitle}
								In <em>{typesetQuotes(pub.encyclopediaTitle)}</em>{#if pub.publisher}, {typesetQuotes(
										pub.publisher
									)}{/if}.
							{:else if pub.type === 'blogpost'}
								{quoteTitle(pub.title)}{#if pub.publisher}. <em>{typesetQuotes(pub.publisher)}</em
									>{/if}{#if pub.dateISO}, {formatBlogDate(pub.dateISO)}{/if}.
							{:else if pub.type === 'conference-proceedings'}
								In <em>{typesetQuotes(pub.proceedingsTitle)}</em>.
							{:else}
								<!-- Generic fallback -->
								{#if pub.journal}In <em>{typesetQuotes(pub.journal)}</em>.{/if}
								{#if pub.book}In <em>{typesetQuotes(pub.book)}</em>.{/if}
								{#if pub.publisher}{typesetQuotes(pub.publisher)}.{/if}
							{/if}
							{#if pub.doi}<!-- eslint-disable svelte/no-navigation-without-resolve -- external link --><a
									href="https://doi.org/{pub.doi}"
									target="_blank"
									rel="noopener noreferrer"
									class="doi-link"
									><Icon icon="academicons:doi" class="doi-link-icon" aria-hidden="true" /><span
										class="doi-link-text">doi:{pub.doi}</span
									><span class="sr-only"> (opens in new tab)</span></a
								><!-- eslint-enable svelte/no-navigation-without-resolve -->{/if}
							{#if pub.url && !pub.doi}<!-- eslint-disable svelte/no-navigation-without-resolve -- external link --><a
									href={pub.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Link to {pub.title} (opens in new tab)"
									class="ml-1 text-primary hover:underline text-sm"
									>Link<span aria-hidden="true">&nbsp;↗</span></a
								><!-- eslint-enable svelte/no-navigation-without-resolve -->{/if}
							{#if pub.reviewedBy && pub.reviewedBy.length > 0}
								<p class="text-sm mt-1">
									Reviewed in
									{#each pub.reviewedBy as review, i (review.title + review.year)}
										<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
										<a
											href={review.url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-primary review-link no-underline"
											>{typesetQuotes(review.journal)}<span class="sr-only">
												(opens in new tab)</span
											></a
										><!-- eslint-enable svelte/no-navigation-without-resolve -->{#if i < pub.reviewedBy.length - 2},&nbsp;{:else if i === pub.reviewedBy.length - 2},&nbsp;and&nbsp;{:else}.{/if}
									{/each}
								</p>
							{/if}
						</CVEntry>
					{/each}
				</div>
			{/if}
		{/each}

		<!-- Optional: Section for other publication types -->
		{#if otherPublicationTypes.length > 0}
			<h4>Other</h4>
			<div class="space-y-3 ledger ledger--tight ledger--ruled">
				{#each otherPublicationTypes as pubType (pubType)}
					{#each publicationsByType[pubType as Publication['type']] as pub (pub.id)}
						<CVEntry year={getCVDisplayYear(pub)}>
							<!-- Simplified display for other types -->
							<span class="font-medium">{typesetQuotes(pub.title)}</span>.
							{#if pub.type}<span class="pub-type-badge">{pub.type}</span>{/if}
							{#if pub.url}<!-- eslint-disable svelte/no-navigation-without-resolve -- external link --><a
									href={pub.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Link to {pub.title} (opens in new tab)"
									class="ml-1 text-primary hover:underline text-sm"
									>Link<span aria-hidden="true">&nbsp;↗</span></a
								><!-- eslint-enable svelte/no-navigation-without-resolve -->{/if}
						</CVEntry>
					{/each}
				{/each}
			</div>
		{/if}
	{:else}
		<p class="cv-empty">No publications listed.</p>
	{/if}
</section>

<style>
	/* DOI — the Academicons mark and the identifier in the data voice. An
	 * inline SVG in place of the former Zenodo badge image, which cost one
	 * third-party request per publication and reserved a width that varied
	 * with each badge. The `.doi-link` hook is load-bearing: the PDF generator
	 * and the print stylesheet both key off it. */
	.doi-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		margin-left: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-soft);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.doi-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	.doi-link :global(.doi-link-icon) {
		width: 1.25em;
		height: 1.25em;
		flex-shrink: 0;
	}

	/* "Other" type tag — square, mono uppercase, hairline outline. */
	.pub-type-badge {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-muted);
		background-color: transparent;
		border: var(--border-width-thin) solid var(--color-border);
		padding: 0 var(--space-1-5);
		border-radius: 0;
	}
</style>
