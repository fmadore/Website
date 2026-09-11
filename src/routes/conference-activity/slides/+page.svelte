<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { base, resolve } from '$app/paths';
	import { communicationSummariesWithSlides as communicationsWithSlides } from '$lib/data/communications/summaries';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import { plateFallback } from '$lib/actions/plateFallback';
	import { buildSrcset, resolveImagePath } from '$lib/utils/imageVariants';
	import { resolveSlidePoster } from '$lib/utils/slidePoster';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import { COMMUNICATION_TYPE_LIST_LABELS } from '$lib/utils/typeUtils';
	import {
		buildBreadcrumbJsonLd,
		createSubsectionBreadcrumbs
	} from '$lib/utils/breadcrumbJsonLd.svelte';

	/**
	 * The gallery was six equal tiles with ragged bottoms, a `01 02 03` stamp
	 * that encoded nothing but list position, and no rule heavier than a
	 * hairline anywhere on the page — the one route on the site the rule
	 * hierarchy never drew. It is a keyed, dated record list, so it is a ledger,
	 * and the cover posters the deck repo already mirrors are the plates it
	 * hangs: the same catalogue entry /digital-humanities sets.
	 *
	 * The key hangs the talk's own date, split day-month over year exactly as
	 * the home log's activity ledger does. Parsed as a string rather than
	 * through `Date`, so a deck presented on the 1st cannot print the 31st for a
	 * reader west of UTC.
	 */
	const MONTHS_MONO = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC'
	] as const;

	function dateKey(isoDate: string | undefined, fallback: string) {
		const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate ?? '');
		if (!parts) return { dayMonth: fallback, year: '' };
		const [, year = '', month = '', day = ''] = parts;
		return { dayMonth: `${day} ${MONTHS_MONO[parseInt(month, 10) - 1]}`, year };
	}

	/**
	 * Every deck, prepared once: the record it belongs to, the venue line, the
	 * poster the deck repo mirrored, and the date split into the ledger key.
	 *
	 * A deck whose poster has never been mirrored simply has no plate. That is a
	 * known absence at build time, not a load failure, so it draws nothing
	 * rather than an empty `.plate--missing` box — which is reserved for bytes
	 * that were promised and never arrived, and is what `use:plateFallback`
	 * still puts up if a mirrored poster 404s at runtime.
	 */
	const PLATE_SIZES = '(max-width: 768px) 96px, 176px';
	const decks = communicationsWithSlides.map((communication) => {
		const posterPath = resolveSlidePoster(communication.slidesUrl);
		const posterSrc = resolveImagePath(posterPath, base);
		return {
			id: communication.id,
			href: resolve(`/communications/${communication.id}` as `/communications/${string}`),
			slidesUrl: communication.slidesUrl,
			title: typesetQuotes(communication.title),
			venue: typesetQuotes(
				[communication.conference, communication.location].filter(Boolean).join(' · ')
			),
			typeLabel:
				COMMUNICATION_TYPE_LIST_LABELS[communication.type ?? 'conference'] ?? 'Academic event',
			...dateKey(communication.dateISO, communication.date),
			posterSrc,
			posterSrcset: posterSrc ? buildSrcset(posterSrc) : ''
		};
	});

	// The corpus figure the page never stated. Both ends come off the records,
	// so the masthead cannot advertise a span the ledger does not hold.
	const deckYears = decks.map((deck) => deck.year).filter(Boolean);
	const deckSpan =
		deckYears.length > 0
			? `${deckYears[deckYears.length - 1]}–${deckYears[0]}`.replace(/^(\d{4})–\1$/, '$1')
			: '';

	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Talks & Events',
		'/conference-activity',
		'Slides',
		'/conference-activity/slides'
	);
	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
</script>

<SEO
	title="Slides | Frédérick Madore"
	description="Slide decks from conference papers, lectures and workshops by Frédérick Madore."
	keywords="slides, presentations, slide decks, conference papers, lectures, reveal.js, Frédérick Madore"
/>

<JsonLd id="breadcrumb-json-ld-conf-activity-slides" json={breadcrumbJsonLd} />
<div class="page-container">
	<Breadcrumb items={breadcrumbItems} />

	<PageHeader
		tier="index"
		title="Slides"
		typeBadgeText="Decks"
		date={deckSpan ? `${decks.length} entries · ${deckSpan}` : `${decks.length} entries`}
	/>

	<PageIntro>Decks from my talks and conference papers.</PageIntro>

	{#if decks.length > 0}
		<div class="ledger ledger--ruled deck-ledger">
			{#each decks as deck (deck.id)}
				<article class="ledger-row ledger-row--meta deck-entry">
					<span class="ledger-key">
						<span>{deck.dayMonth}</span>
						{#if deck.year}<span class="ledger-status">{deck.year}</span>{/if}
					</span>

					<div class="deck-entry-body">
						{#if deck.posterSrc}
							<figure class="deck-entry-figure">
								<!-- Decorative: the title beside it names the deck. -->
								<img
									class="plate deck-entry-plate"
									src={deck.posterSrc}
									srcset={deck.posterSrcset}
									sizes={deck.posterSrcset ? PLATE_SIZES : undefined}
									alt=""
									width="176"
									height="99"
									loading="lazy"
									decoding="async"
									use:plateFallback
								/>
							</figure>
						{/if}

						<div class="ledger-content">
							<h2 class="ledger-title deck-entry-title">
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved route -->
								<a class="link-animated" href={deck.href} data-sveltekit-preload-code="tap"
									>{deck.title}</a
								>
							</h2>
							{#if deck.venue}
								<p class="ledger-desc deck-entry-venue">{deck.venue}</p>
							{/if}
						</div>
					</div>

					<span class="ledger-meta deck-entry-meta">
						<!-- The record's kind, in quiet mono: it is a fact about the talk,
						     not the current thing, so it never takes the accent. -->
						<span class="deck-entry-type">{deck.typeLabel}</span>
						{#if deck.slidesUrl}
							<!-- eslint-disable svelte/no-navigation-without-resolve -- external deck on the slides subdomain -->
							<a
								class="ledger-action"
								href={deck.slidesUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Open deck: {deck.title} (opens in new tab)"
							>
								Open deck<span class="sr-only"> (opens in new tab)</span><span aria-hidden="true"
									>&nbsp;↗</span
								>
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{/if}
					</span>
				</article>
			{/each}
		</div>
	{:else}
		<!-- Editorial empty state — prose on paper, not a dashed placeholder box.
		     The link takes the prose-link idiom from the `.prose` container rather
		     than a local copy of the same underline. -->
		<div class="prose deck-empty">
			<p class="deck-empty-title">No decks published yet.</p>
			<p class="deck-empty-text">
				Slide decks appear here as talks are presented. In the meantime, browse the
				<a href={resolve('/conference-activity')}>full Talks &amp; Events listing</a>.
			</p>
		</div>
	{/if}
</div>

<style>
	.page-container {
		max-width: var(--content-width-6xl);
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md);
	}

	/* ===== THE DECK LEDGER =====
	 * The row, its hairline, its padding, its key column and its narrow-measure
	 * collapse all come from the `.ledger-row` idiom. What is local is the plate
	 * sharing the content column with the record — the same shape the research
	 * and digital-humanities catalogues use for the same kind of thing — and the
	 * two stamps that stack in the meta column. */
	.deck-ledger {
		--ledger-key-w: 7rem;
		--ledger-meta-w: 11rem;
		margin-top: var(--space-xl);
	}

	.deck-entry {
		/* The plate makes the row tall, so top-align the date key rather than
		 * baseline-aligning it against a replaced element. */
		align-items: start;
	}

	.deck-entry-body {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
		min-width: 0;
	}

	.deck-entry-figure {
		flex: none;
		width: 96px;
		margin: 0;
	}

	.deck-entry-plate {
		/* The deck site renders every cover at 1280×720. */
		aspect-ratio: 16 / 9;
		height: auto;
		object-fit: cover;
		object-position: center top;
	}

	/* `.ledger-title` carries the serif cast; these two replace what the global
	 * h1–h3 rule adds on top of it (a display tracking and a width axis that
	 * belong to Archivo, not to a serif record title). */
	.deck-entry-title {
		letter-spacing: var(--tracking-title);
		font-variation-settings: normal;
	}

	/* The venue is apparatus rather than a description, so it takes the serif
	 * italic the record's own head uses for the same line. */
	.deck-entry-venue {
		font-style: italic;
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.deck-entry-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.deck-entry-type {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
	}

	/* Above the ledger's stacking point the meta column hangs off the right
	 * edge; below it, the row is one column and everything reads left. */
	@media (--sm) {
		.deck-entry-meta {
			align-items: flex-end;
		}
	}

	@media (--md) {
		.deck-entry-figure {
			width: 176px;
		}
	}

	/* Empty state — the display voice for the statement, serif for what to do
	 * instead. */
	.deck-empty {
		max-width: var(--measure-prose);
		margin-top: var(--space-2xl);
	}

	.deck-empty-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-xl);
		font-weight: 700;
		letter-spacing: var(--tracking-display-sm);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-2xs);
	}

	.deck-empty-text {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0;
	}

	@media (--md-down) {
		.page-container {
			padding: var(--space-md) var(--space-sm);
		}
	}
</style>
