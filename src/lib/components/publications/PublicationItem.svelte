<script lang="ts">
	import type { PublicationSummary } from '$lib/types/publication';
	import { base, resolve } from '$app/paths';
	import { buildSrcset, resolveImagePath } from '$lib/utils/imageVariants';
	import { truncateAbstract } from '$lib/utils/textUtils';
	// Import the necessary functions from the new formatter
	import {
		formatCitation,
		formatReferenceText,
		getAuthorsArray
	} from '$lib/utils/citationFormatter';
	import { formatAuthorsWithEtAl } from '$lib/utils/nameUtils';
	import { author as siteAuthor } from '$lib/data/siteConfig';
	import { titleLangAttr } from '$lib/utils/languageUtils';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import BibliographyRow from '$lib/components/molecules/BibliographyRow.svelte';
	import type {
		BibliographyAction,
		BibliographyNote
	} from '$lib/components/molecules/BibliographyRow.svelte';
	// Entity-card styles (relocated from the global app.css so they only load on
	// pages that render publication/communication list items).
	import '$styles/components/entity-cards.css';

	interface Props {
		/** A summary: the list never needs the abstract or the citation list. */
		publication: PublicationSummary;
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
	const citationCount = $derived(publication.citedByCount);

	// The card branch prints the title twice — once as the heading link, once
	// inside the citation as a quoted work — so both go through the typesetter
	// or the row mixes registers (a straight "Côte d'Ivoire" in the heading
	// against a curled one in the citation of the same dissertation).
	// `quoteTitle` supplies the citation's surrounding marks, demoting anything
	// the title already quotes; the heading keeps the title unwrapped.
	const headingTitle = $derived(typesetQuotes(publication.title));
	const citationTitle = $derived(quoteTitle(publication.title));
	const displayAbstract = $derived(
		publication.abstractExcerpt ? typesetQuotes(truncateAbstract(publication.abstractExcerpt)) : ''
	);

	// Reactive computation using the citation formatter
	const formattedCitation = $derived(formatCitation(publication)); // Define structure for display list items
	const publicationHref = $derived(resolve('/publications/[id]', { id: publication.id }));

	// Card cover: capped at 12rem (9rem under --sm-down), 16rem for the
	// editorial lead — so the 400w derivative serves the cards and the 800w
	// the lead, whatever the pixel density; `sizes` states those widths.
	const coverSrc = $derived(resolveImagePath(publication.image, base));
	const coverSrcset = $derived(buildSrcset(coverSrc));
	const coverSizes = $derived(
		editorial ? '(max-width: 640px) 144px, 256px' : '(max-width: 640px) 144px, 192px'
	);
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
			case 'working-paper':
				return 'Working Paper';
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

	// Open access is an authored fact (`openAccess`), never inferred from having
	// a link: most bare `url`s go to a publisher's catalogue page, which is a
	// paywall. Same rule as the detail page.
	const isOpenAccess = $derived(publication.openAccess === true);
	const openHref = $derived(
		publication.doi ? `https://doi.org/${publication.doi}` : (publication.url ?? undefined)
	);

	// Language tag for the eyebrow — only surfaced when it isn't plain English.
	const languageNote = $derived(
		publication.language && publication.language !== 'English' ? publication.language : ''
	);

	// A one-line standfirst under the title: a trimmed abstract if present.
	// BibliographyRow typesets what it is handed.
	const bibStandfirst = $derived(
		publication.abstractExcerpt ? truncateAbstract(publication.abstractExcerpt, 180) : ''
	);

	// Open access is a fact about the record, so it prints in the kind eyebrow
	// beside the type — exactly where the record page's masthead prints it. As
	// an action label it could only appear when there was no DOI to name
	// instead, which silently withheld it from 21 of the 27 open-access records.
	const bibNotes = $derived<BibliographyNote[]>(
		isOpenAccess ? [{ label: 'Open Access', icon: 'academicons:open-access' }] : []
	);

	// Right-aligned action column: one primary action naming where the link
	// actually goes, marked for the kind of address it is — the DOI glyph for a
	// resolver, the globe for a web address. The label says what is at the end
	// of it. BibliographyRow appends the "Cite" control.
	const bibAction = $derived<BibliographyAction | null>(
		!openHref
			? null
			: publication.doi
				? { href: openHref, label: 'DOI ↗', primary: true, icon: 'academicons:doi' }
				: {
						href: openHref,
						label: isOpenAccess ? 'Full Text ↗' : 'Publisher ↗',
						primary: true,
						icon: 'mdi:web'
					}
	);
	const bibActions = $derived<BibliographyAction[]>(bibAction ? [bibAction] : []);
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
			type === 'working-paper' ||
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

		// Build the authorString: ", " between entries, " and " before the last.
		// A collective byline (two dozen signatories) collapses to "et al." so
		// the row stays a bibliography entry rather than a page of names; the
		// site owner is held in view wherever they sit in the running order.
		const builtString = formatAuthorsWithEtAl(
			items.map((item) => item.name),
			{ mustInclude: siteAuthor.name }
		);

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
		kindNotes={bibNotes}
		title={publication.title}
		titleLang={titleLangAttr(publication.language)}
		italicTitle={isItalicTitle}
		byline={displayData.authorString ? `${displayData.listPrefix}${displayData.authorString}` : ''}
		standfirst={bibStandfirst}
		image={publication.image}
		imageAlt="Cover — {publication.title}"
		imageWidth={200}
		imageHeight={280}
		loading={imageLoading}
		actions={bibActions}
		reference={() => formatReferenceText(publication, { doi: true })}
		citedCount={citationCount}
		{yearLabel}
		{featured}
	/>
{:else}
	<!-- li, not article: this branch renders as a direct child of the
	     <ul class="entity-list"> in publication lists, and a ul may only
	     contain li children. -->
	<li class="entity-list-item" class:editorial>
		<div class="entity-card" class:entity-card--editorial={editorial} class:entity-card--row={row}>
			<div class="entity-grid">
				{#if publication.image}
					<div class="entity-image-container">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
						<a href={publicationHref} data-sveltekit-preload-code="tap">
							<img
								src={coverSrc}
								srcset={coverSrcset}
								sizes={coverSrcset ? coverSizes : undefined}
								alt={headingTitle}
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
							{headingTitle}
						</a>
					</h2>

					<div class="entity-details">
						<!-- Render prefix and the constructed author string -->
						{displayData.listPrefix}{typesetQuotes(displayData.authorString)}
						<!-- Space, then (Year). Only if year is defined -->
						{#if formattedCitation.year}
							({formattedCitation.year}).
						{/if}

						<!-- Add type-specific prefixes before detailsHtml -->
						{#if publication.type === 'phd-dissertation' || publication.type === 'masters-thesis'}
							<span>{citationTitle}. </span>
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
												{typesetQuotes(advisor)}
											</button>
										{:else}
											<span>{typesetQuotes(advisor)}</span>
										{/if}
										{#if i < publication.advisors.length - 1}
											<span> and </span>
										{/if}
									{/each}
								</div>
							{/if}
						{:else if publication.type === 'encyclopedia'}
							<span>{citationTitle}. </span>
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
										{typesetQuotes(publication.prefacedBy)}
									</button>
								{:else}
									<span>{typesetQuotes(publication.prefacedBy)}</span>
								{/if}
							</div>
						{/if}
					</div>

					{#if displayAbstract}
						<div class="entity-abstract">
							{displayAbstract}
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
		letter-spacing: var(--tracking-caps);
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
