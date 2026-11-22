<script lang="ts">
	import ExternalLink from '#lib/components/atoms/ExternalLink.svelte';
	import { resolve } from '$app/paths';
	import { cvPublicationsByDate as publicationsByDate } from '#lib/data/publications/cv.ts';
	import type { CvPublication } from '#lib/types/index.ts';
	import {
		groupPublicationsByType,
		formatCVAuthorList,
		terminalPeriod,
		getCVDisplayYear
	} from '#lib/utils/cvFormatters.ts';
	import { cvPublicationParts } from '#lib/utils/cvPublicationParts.ts';
	import { isCvPublication } from '#lib/utils/cvSections.ts';
	import { getPublicationTypeDisplayName } from '#lib/utils/publicationTypeLabels.ts';
	import { titleLangAttr } from '#lib/utils/languageUtils.ts';
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import CVEntry from './CVEntry.svelte';
	import { CV_GLYPH } from './CVGlyphs.svelte';

	// Group publications using the utility function
	const { publicationsByType, presentPublicationTypes, otherPublicationTypes } =
		groupPublicationsByType(publicationsByDate);
	const filteredPublicationsByDate = publicationsByDate.filter(isCvPublication);
</script>

<section>
	<h3>Publications</h3>
	{#if filteredPublicationsByDate.length > 0}
		{#each presentPublicationTypes as pubType (pubType)}
			{#if publicationsByType[pubType] && publicationsByType[pubType].length > 0}
				<h4>{getPublicationTypeDisplayName(pubType)}</h4>
				<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
					{#each publicationsByType[pubType] as pub (pub.id)}
						{@const formattedAuthors = formatCVAuthorList(pub.authors)}
						{@const authorStop = terminalPeriod(formattedAuthors)}
						<!-- Every title links to its record page, and carries the work's
						     language when that is one language other than English. -->
						{@const href = resolve('/publications/[id]', { id: pub.id })}
						{@const lang = titleLangAttr(pub.language)}
						<CVEntry year={getCVDisplayYear(pub)}>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: formatCVAuthorList output (bolds site author) over static data files -->
							{#if formattedAuthors}{@html formattedAuthors}{#if (pub.type === 'book' && pub.isEditedVolume) || pub.type === 'special-issue'}&nbsp;(eds.),{:else}{authorStop}{/if}
							{/if}
							<!-- Title and venue, segment for segment as the Markdown twin sets them
							     (cvPublicationParts). A book's <em> wraps its link, not the
							     reverse: the PDF export reads a link as one plain string, and
							     italic only from an ancestor. -->
							{#each cvPublicationParts(pub) as part, index (index)}{#if part.kind === 'text'}{part.text}{:else if part.kind === 'italic'}<em>
										{part.text}
									</em>{:else if part.italic}<em>
										<a {href} {lang} class="cv-record-link">{part.text}</a>
									</em>{:else}<a {href} {lang} class="cv-record-link">{part.text}</a>{/if}{/each}
							{#if pub.doi}<ExternalLink href="https://doi.org/{pub.doi}" class="doi-link">
									<svg class="doi-link-icon" aria-hidden="true" focusable="false">
										<use href="#{CV_GLYPH.doi}" />
									</svg><span class="doi-link-text">doi:{pub.doi}</span>
								</ExternalLink>{/if}
							{#if pub.url && !pub.doi}<!-- eslint-disable svelte/no-navigation-without-resolve -- external link --><a
									href={pub.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Link to {pub.title} (opens in new tab)"
									class="cv-aside-link"
								>
									Link<span aria-hidden="true">&nbsp;↗</span>
								</a><!-- eslint-enable svelte/no-navigation-without-resolve -->{/if}
							{#if pub.reviewedBy && pub.reviewedBy.length > 0}
								<p class="cv-detail">
									Reviewed in
									{#each pub.reviewedBy as review, i (review.title + review.year)}
										<ExternalLink href={review.url} class="review-link no-underline">
											{typesetQuotes(review.journal)}
										</ExternalLink>{#if i < pub.reviewedBy.length - 2},&nbsp;{:else if i === pub.reviewedBy.length - 2},&nbsp;and&nbsp;{:else}.{/if}
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
			<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
				{#each otherPublicationTypes as pubType (pubType)}
					{#each publicationsByType[pubType as CvPublication['type']] as pub (pub.id)}
						<CVEntry year={getCVDisplayYear(pub)}>
							<!-- Simplified display for other types -->
							<a
								href={resolve('/publications/[id]', { id: pub.id })}
								lang={titleLangAttr(pub.language)}
								class="cv-title cv-record-link"
							>
								{typesetQuotes(pub.title)}
							</a>.
							{#if pub.type}<span class="pub-type-badge">{pub.type}</span>{/if}
							{#if pub.url}<!-- eslint-disable svelte/no-navigation-without-resolve -- external link --><a
									href={pub.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Link to {pub.title} (opens in new tab)"
									class="cv-aside-link"
								>
									Link<span aria-hidden="true">&nbsp;↗</span>
								</a><!-- eslint-enable svelte/no-navigation-without-resolve -->{/if}
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
	/* The [Link] after a citation that has no DOI: set a step down, a space off. */
	.cv-aside-link {
		margin-left: var(--space-2xs);
		font-size: var(--font-size-sm);
	}

	/* DOI — the Academicons mark and the identifier in the data voice. An
	 * inline SVG in place of the former Zenodo badge image, which cost one
	 * third-party request per publication and reserved a width that varied
	 * with each badge. The `:global(.doi-link)` hook is load-bearing: the PDF generator
	 * and the print stylesheet both key off it. */
	:global(.doi-link) {
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

	:global(.doi-link):hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	/* 16px, the size every other inline mark on the sheet renders at (the contact
	 * stack's five, the ORCID mark). Sized absolutely rather than in `em`: the
	 * identifier beside it is set at the 2xs mono step, so `1.25em` drew this
	 * mark at 14px and made the DOI the one glyph on the page at its own size. */
	.doi-link-icon {
		width: var(--space-4);
		height: var(--space-4);
		flex-shrink: 0;
	}

	/* A DOI is one unbroken token; at 320px the longest ran past the sheet's
	 * edge. It may break anywhere once it no longer fits its line. */
	.doi-link-text {
		min-width: 0;
		overflow-wrap: anywhere;
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
