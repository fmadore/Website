<script lang="ts">
	import type { Publication } from '$lib/types/publication';
	import { resolve } from '$app/paths';
	import { truncateAbstract } from '$lib/utils/textUtils';
	// Import the necessary functions from the new formatter
	import { formatCitation, getAuthorsArray } from '$lib/utils/citationFormatter';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import BibliographyRow from '$lib/components/molecules/BibliographyRow.svelte';
	import type { BibliographyAction } from '$lib/components/molecules/BibliographyRow.svelte';
	// Entity-card styles (relocated from the global app.css so they only load on
	// pages that render publication/communication list items).
	import '$styles/components/entity-cards.css';

	interface Props {
		publication: Publication;
		onfilterrequest?: (event: { type: string; value: string }) => void;
		index?: number; // Index for loading optimization
		/**
		 * Render this item as the editorial "lead" of a featured block:
		 * no card chrome, serif display title, larger image, longer-form
		 * abstract treatment. Breaks the uniform card stack the way an
		 * editorial-magazine lead story breaks a section.
		 */
		editorial?: boolean;
		/**
		 * Render as a quiet list row (no card chrome, hairline separator) —
		 * used by the long main lists so cards stay reserved for featured
		 * material. A bibliography entry, not a tile.
		 */
		row?: boolean;
		/**
		 * Render as a typeset bibliography entry (Ink + Signal): a hanging
		 * mono/Archivo year column owned by the parent, a kind eyebrow (mono),
		 * a serif title (italic for books/edited works), an optional serif
		 * standfirst, and a right-aligned mono action column (DOI / OPEN
		 * ACCESS / CITE). Used by the /publications finding-aid list.
		 */
		bibliography?: boolean;
		/**
		 * In bibliography mode: the hanging year to print in the left column.
		 * The parent passes it only for the first entry of each year (so the
		 * ledger reads the year once, then blank rows beneath). Pass `null`
		 * / omit to leave the column blank.
		 */
		yearLabel?: string | number | null;
		/**
		 * In bibliography mode: mark this entry as the current/featured lead —
		 * pine kind eyebrow, larger Archivo year, and (if a cover exists)
		 * an inline plate. Reserved for the newest/featured record.
		 */
		featured?: boolean;
	}

	let {
		publication,
		onfilterrequest,
		index,
		editorial = false,
		row = false,
		bibliography = false,
		yearLabel = null,
		featured = false
	}: Props = $props();

	// Optimize loading for above-the-fold images (first 3 items)
	const imageLoading = $derived((index ?? 0) < 3 ? 'eager' : 'lazy');

	// Citation count for the inline badge
	const citationCount = $derived(publication.citedBy?.length ?? 0);

	// Reactive computation using the citation formatter
	const formattedCitation = $derived(formatCitation(publication)); // Define structure for display list items
	const publicationHref = $derived(resolve('/publications/[id]', { id: publication.id }));
	const tagFilterBase = $derived(`${resolve('/publications')}?tag=`);

	// ── Bibliography mode helpers ──────────────────────────────────────────────
	// Books, edited volumes and special issues set their title in italic serif —
	// the convention for a standalone published work vs. an article within one.
	const isItalicTitle = $derived(
		publication.type === 'book' ||
			publication.type === 'special-issue' ||
			publication.isEditedVolume === true ||
			publication.isEditedWork === true
	);

	// Kind eyebrow — the mono dateline that opens a bibliography row. A short,
	// finding-aid label per type ("MONOGRAPH · BOOK", "JOURNAL ARTICLE",
	// "SPECIAL ISSUE · CO-EDITED"), derived from structured fields only.
	const kindLabel = $derived.by(() => {
		const t = publication.type;
		switch (t) {
			case 'book':
				return publication.isEditedVolume ? 'Edited Volume · Book' : 'Monograph · Book';
			case 'article':
				return 'Journal Article';
			case 'bulletin-article':
				return 'Bulletin Article';
			case 'chapter':
				return 'Book Chapter';
			case 'special-issue':
				return 'Special Issue · Co-edited';
			case 'report':
				return 'Report';
			case 'encyclopedia':
				return 'Encyclopedia Entry';
			case 'blogpost':
				return 'Blog Post';
			case 'phd-dissertation':
				return 'Ph.D. Dissertation';
			case 'masters-thesis':
				return "Master's Thesis";
			case 'conference-proceedings':
				return 'Conference Proceedings';
			default:
				return formattedCitation.typeLabel;
		}
	});

	// A DOI/URL means we can send the reader to the freely-accessible copy — the
	// site only lists the author's own open work. Same rule as the detail page.
	const isOpenAccess = $derived(Boolean(publication.doi || publication.url));
	const openHref = $derived(
		publication.doi ? `https://doi.org/${publication.doi}` : (publication.url ?? undefined)
	);

	// Language tag for the eyebrow — only surfaced when it isn't plain English.
	const languageNote = $derived(
		publication.language && publication.language !== 'English' ? publication.language : ''
	);

	// A one-line standfirst under the title: a trimmed abstract if present.
	const bibStandfirst = $derived(
		publication.abstract ? truncateAbstract(publication.abstract, 180) : ''
	);

	// Right-aligned action column: the freely-accessible copy (DOI or URL) as
	// the primary action; BibliographyRow appends the internal "Cite" link.
	const bibActions = $derived<BibliographyAction[]>(
		isOpenAccess && openHref
			? [{ href: openHref, label: publication.doi ? 'DOI ↗' : 'Open Access ↗', primary: true }]
			: []
	);
	interface DisplayListItem {
		name: string;
		isClickable: boolean;
	}

	// Reactive computation for Author/Editor list (not HTML string)
	const displayData = $derived.by(() => {
		const type = publication.type;
		const authors = publication.authors;
		const editors = publication.editors;

		let items: DisplayListItem[] = [];
		let listPrefix = ''; // Reset prefix

		if (
			type === 'book' ||
			type === 'article' ||
			type === 'bulletin-article' ||
			type === 'chapter' ||
			type === 'encyclopedia' ||
			type === 'report' ||
			type === 'blogpost' ||
			type === 'phd-dissertation' ||
			type === 'masters-thesis' ||
			type === 'conference-proceedings'
		) {
			if (authors) {
				const authorsArray = getAuthorsArray(authors);
				items = authorsArray.map((author) => ({
					name: author,
					isClickable: false // No longer needed, but keep structure for now
				}));
			}
		} else if (type === 'special-issue') {
			if (editors) {
				listPrefix = 'Edited by ';
				if (typeof editors === 'string') {
					const editorsArray = editors
						.split(' and ')
						.flatMap((part) => part.split(', '))
						.map((name) => name.trim())
						.filter(Boolean);
					items = editorsArray.map((editor) => ({
						name: editor,
						isClickable: false // No longer needed
					}));
				}
				// Add logic for array editors if needed
			}
		}
		// Handle advisors separately in the template as before
		// Handle prefacedBy separately in the template as before

		// Build the authorString
		let builtString = '';
		const listLength = items.length;
		items.forEach((item, i) => {
			builtString += item.name; // Add name
			if (i < listLength - 1) {
				// If not the last item
				// Use ', ' for all but the last join, which is ' and '.
				const separator = i === listLength - 2 ? ' and ' : ', ';
				builtString += separator;
			}
		});

		return {
			displayList: items,
			listPrefix,
			authorString: builtString
		};
	});
</script>

{#if bibliography}
	<BibliographyRow
		href={publicationHref}
		{kindLabel}
		{languageNote}
		title={publication.title}
		italicTitle={isItalicTitle}
		byline={displayData.authorString ? `${displayData.listPrefix}${displayData.authorString}` : ''}
		standfirst={bibStandfirst}
		image={publication.image}
		imageAlt="Cover — {publication.title}"
		imageWidth={200}
		imageHeight={280}
		loading={imageLoading}
		actions={bibActions}
		detailLabel="Cite"
		citedCount={citationCount}
		{yearLabel}
		{featured}
	/>
{:else}
	<!-- li, not article: this branch renders as a direct child of the
	     <ul class="entity-list"> in FeaturedPublications, and a ul may only
	     contain li children. -->
	<li class="entity-list-item scroll-reveal-scale" class:editorial>
		<div class="entity-card" class:entity-card--editorial={editorial} class:entity-card--row={row}>
			<div class="entity-grid">
				{#if publication.image}
					<div class="entity-image-container">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
						<a href={publicationHref} data-sveltekit-preload-code="tap">
							<img
								src={publication.image}
								alt={publication.title}
								class="entity-cover-image"
								width="200"
								height="280"
								loading={imageLoading}
								decoding="async"
							/>
						</a>
					</div>
				{/if}

				<div class="entity-content">
					<div class="entity-meta">
						<!-- Use typeLabel from formattedCitation -->
						<span class="entity-type">{formattedCitation.typeLabel}</span>
						{#if publication.language && publication.language.includes(',')}
							<span class="entity-language">({publication.language})</span>
						{:else if publication.language && publication.language !== 'English'}
							<span class="entity-language">({publication.language})</span>
						{/if}
						{#if citationCount > 0}
							<span
								class="citation-badge"
								title="Cited by {citationCount} {citationCount === 1 ? 'work' : 'works'}"
								aria-label="Cited by {citationCount} {citationCount === 1 ? 'work' : 'works'}"
							>
								Cited {citationCount}×
							</span>
						{/if}
					</div>

					<!-- h2: these cards sit under the page h1 with only a non-heading
					     eyebrow above them, so h3 would skip a level. -->
					<h2 class="entity-title">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
						<a href={publicationHref} class="entity-title-link" data-sveltekit-preload-code="tap">
							{publication.title}
						</a>
					</h2>

					<div class="entity-details">
						<!-- Render prefix and the constructed author string -->
						{displayData.listPrefix}{displayData.authorString}
						<!-- Space, then (Year). Only if year is defined -->
						{#if formattedCitation.year}
							({formattedCitation.year}).
						{/if}

						<!-- Add type-specific prefixes before detailsHtml -->
						{#if publication.type === 'phd-dissertation' || publication.type === 'masters-thesis'}
							<span>"{publication.title}". </span>
							<!-- Safe: detailsHtml is generated by internal citationFormatter.ts from structured data -->
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html formattedCitation.detailsHtml}
							<!-- Supervisor info remains separate -->
							{#if publication.advisors && publication.advisors.length > 0}
								<div class="advisor-info">
									<span>Supervised by </span>
									{#each publication.advisors as advisor, i (advisor)}
										{#if advisor !== 'Frédérick Madore'}
											<button
												class="author-btn"
												onclick={() => onfilterrequest?.({ type: 'author', value: advisor })}
											>
												{advisor}
											</button>
										{:else}
											<span>{advisor}</span>
										{/if}
										{#if i < publication.advisors.length - 1}
											<span> and </span>
										{/if}
									{/each}
								</div>
							{/if}
						{:else if publication.type === 'encyclopedia'}
							<span>"{publication.title}". </span>
							<!-- Safe: detailsHtml is generated by internal citationFormatter.ts from structured data -->
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html formattedCitation.detailsHtml}
						{:else}
							<!-- Safe: detailsHtml is generated by internal citationFormatter.ts from structured data -->
							<!-- Render details generated by formatter (covers article, chapter, book, report, special-issue, blogpost, conference-proceedings) -->
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html formattedCitation.detailsHtml}
						{/if}
						<!-- Preface information -->
						{#if publication.prefacedBy}
							<div class="preface-info">
								<span>Preface by </span>
								{#if publication.prefacedBy !== 'Frédérick Madore'}
									<button
										class="author-btn"
										onclick={() =>
											onfilterrequest?.({ type: 'author', value: publication.prefacedBy || '' })}
									>
										{publication.prefacedBy}
									</button>
								{:else}
									<span>{publication.prefacedBy}</span>
								{/if}
							</div>
						{/if}
					</div>

					{#if publication.abstract}
						<div class="entity-abstract">
							{truncateAbstract(publication.abstract)}
						</div>
					{/if}

					{#if publication.tags && publication.tags.length > 0}
						<div class="entity-tags">
							<TagList tags={publication.tags} baseUrl={tagFilterBase} showTitle={false} />
						</div>
					{/if}

					{#if publication.additionalUrls && publication.additionalUrls.length > 0}
						<div class="entity-links">
							{#each publication.additionalUrls as url, i (url.url + i)}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
								<a
									href={url.url}
									target="_blank"
									rel="external noopener noreferrer"
									class="entity-link-btn btn btn-outline-primary btn-sm"
								>
									{url.label || `Link ${i + 1}`}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</li>
{/if}

<style>
	/* Citation count as quiet type, not a pill. A mono count in muted ink reads
	 * as marginalia beside the byline — the data voice of the meta row. */
	.citation-badge {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-light);
		white-space: nowrap;
	}

	.advisor-info,
	.preface-info {
		margin-top: var(--space-1);
	}

	/* Author as an inline ink link — no pill background, no rounded corners,
	 * no tinted hover box. Underline on hover carries the affordance. */
	.author-btn {
		background: none;
		border: none;
		padding: 0;
		font-size: inherit;
		font-family: inherit;
		color: var(--color-primary);
		text-decoration: none;
		cursor: pointer;
		display: inline;
		border-radius: 0;
		font-weight: var(--font-weight-medium);
		transition:
			color var(--duration-fast) var(--ease-out),
			text-decoration var(--duration-fast) var(--ease-out);
	}

	.author-btn:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	.author-btn:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-0-5);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.author-btn {
			transition: none !important;
		}
	}

	/* Bibliography mode renders through the shared BibliographyRow molecule;
	 * its styles live in $styles/components/bibliography.css. */
</style>
