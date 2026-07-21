<script lang="ts">
	import type { Communication } from '$lib/types/communication';
	import { resolve } from '$app/paths';
	import { truncateAbstract } from '$lib/utils/textUtils';
	import { formatAuthorList, formatCommunicationCitation } from '$lib/utils/citationFormatter';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import BibliographyRow from '$lib/components/molecules/BibliographyRow.svelte';
	import type { BibliographyAction } from '$lib/components/molecules/BibliographyRow.svelte';
	// Entity-card styles (relocated from the global app.css so they only load on
	// pages that render publication/communication list items).
	import '$styles/components/entity-cards.css';

	interface Props {
		communication: Communication;
		index?: number;
		/**
		 * Render this item as the editorial "lead" of a featured block:
		 * no card chrome, serif display title, larger image, longer-form
		 * abstract treatment. Mirrors the publications-list lead-story
		 * pattern; styled by `.entity-card--editorial` in entity-cards.css.
		 */
		editorial?: boolean;
		/**
		 * Render as a quiet list row (no card chrome, hairline separator) —
		 * used by the long main lists so cards stay reserved for featured
		 * material. Styled by `.entity-card--row` in entity-cards.css.
		 */
		row?: boolean;
		/**
		 * Render as a typeset bibliography entry (Ink + Signal), matching the
		 * /publications finding-aid list: a hanging year column (owned by the
		 * parent), a square cover plate, a mono kind eyebrow, a serif title, the
		 * venue line, and a right-aligned mono action column.
		 */
		bibliography?: boolean;
		/** In bibliography mode: the hanging year, printed once per year-group. */
		yearLabel?: string | number | null;
		/** In bibliography mode: mark this entry as the featured lead. */
		featured?: boolean;
	}

	let {
		communication,
		index,
		editorial = false,
		row = false,
		bibliography = false,
		yearLabel = null,
		featured = false
	}: Props = $props();

	// Optimize loading for above-the-fold images (first 3 items)
	const imageLoading = $derived((index ?? 0) < 3 ? 'eager' : 'lazy');

	// Human-readable labels for communication types
	const typeLabels: { [key: string]: string } = {
		conference: 'Conference',
		workshop: 'Workshop',
		seminar: 'Seminar',
		lecture: 'Lecture',
		panel: 'Panel',
		event: 'Academic Event',
		podcast: 'Podcast'
	};

	// Helper to format language display
	const languageDisplay = $derived.by(() => {
		if (!communication?.language) return null;
		const langs = Array.isArray(communication.language)
			? communication.language
			: [communication.language];

		// If it's only English, don't show anything
		if (langs.length === 1 && langs[0] === 'English') return null;

		// If multiple languages (bilingual/multilingual), show all
		if (langs.length > 1) {
			return langs.join(', ');
		}

		// Single non-English language
		return langs[0];
	});

	// Format the citation details
	const citationDetails = $derived(formatCommunicationCitation(communication));

	// ── Bibliography mode (Ink + Signal finding-aid row, shared with publications) ──
	const detailHref = $derived(resolve(`/communications/${communication.id}`));
	const kindLabel = $derived(typeLabels[communication.type ?? 'conference'] ?? 'Talk');
	// Venue line (conference · city · country) — the finding-aid byline.
	const venueLine = $derived(citationDetails);
	// A one-line standfirst for the featured lead: a trimmed abstract if present.
	const bibStandfirst = $derived(
		communication.abstract ? truncateAbstract(communication.abstract, 180) : ''
	);
	// Right-aligned action column: primary material (slides/other), an optional
	// DOI; BibliographyRow appends the internal "Details" link.
	const bibActions = $derived.by(() => {
		const list: BibliographyAction[] = [];
		if (communication.slidesUrl)
			list.push({ href: communication.slidesUrl, label: 'Slides ↗', primary: true });
		else if (communication.url)
			list.push({ href: communication.url, label: 'Materials ↗', primary: true });
		if (communication.doi)
			list.push({
				href: `https://doi.org/${communication.doi}`,
				label: 'DOI ↗',
				// The first action in the column is the primary one (as before).
				primary: list.length === 0
			});
		return list;
	});
</script>

{#if bibliography}
	<!-- Square plate (conference logos/seals, not portrait covers) via plateAspect. -->
	<BibliographyRow
		href={detailHref}
		{kindLabel}
		languageNote={languageDisplay}
		title={communication.title}
		byline={venueLine}
		standfirst={bibStandfirst}
		image={communication.image}
		imageAlt="Illustration — {communication.title}"
		imageWidth={200}
		imageHeight={200}
		plateAspect="1 / 1"
		loading={imageLoading}
		actions={bibActions}
		detailLabel="Details"
		{yearLabel}
		{featured}
	/>
{:else}
	<article class="entity-list-item scroll-reveal-scale" class:editorial>
		<div class="entity-card" class:entity-card--editorial={editorial} class:entity-card--row={row}>
			<div class="entity-grid">
				{#if communication?.image}
					<div class="entity-image-container">
						<a
							href={resolve(`/communications/${communication.id}`)}
							data-sveltekit-preload-code="tap"
						>
							<img
								src={communication.image}
								alt={communication.title}
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
						<span class="entity-type"
							>{typeLabels[communication?.type || 'conference'] ||
								communication?.type ||
								'Conference'}</span
						>
						{#if languageDisplay}
							<span class="entity-language">({languageDisplay})</span>
						{/if}
					</div>

					<h3 class="entity-title">
						<a
							href={resolve(`/communications/${communication.id}`)}
							class="entity-title-link"
							data-sveltekit-preload-code="tap"
						>
							{communication?.title || 'Untitled Communication'}
						</a>
					</h3>
					<div class="entity-details">
						{#if communication?.authors && communication.authors.length > 0}
							<div>
								{formatAuthorList(communication.authors)}
							</div>
						{/if}

						{#if citationDetails}
							<div>{citationDetails}</div>
						{/if}
					</div>

					{#if communication?.abstract}
						<div class="entity-abstract">
							{truncateAbstract(communication.abstract)}
						</div>
					{/if}

					{#if communication?.tags && communication.tags.length > 0}
						<div class="entity-tags">
							<TagList
								tags={communication.tags}
								baseUrl="/conference-activity?tag="
								showTitle={false}
							/>
						</div>
					{/if}

					{#if (communication?.additionalUrls && communication.additionalUrls.length > 0) || communication?.doi}
						<div class="entity-links">
							{#if communication?.doi}
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
								<a
									href={`https://doi.org/${communication.doi}`}
									target="_blank"
									rel="noopener noreferrer"
									class="entity-link-btn btn btn-outline-primary btn-sm"
								>
									DOI
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							{/if}
							{#if communication?.additionalUrls}
								{#each communication.additionalUrls as url, i (url.url)}
									<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
									<a
										href={url.url}
										target="_blank"
										rel="noopener noreferrer"
										class="entity-link-btn btn btn-outline-primary btn-sm"
									>
										{url.label || `Link ${i + 1}`}
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</article>
{/if}
