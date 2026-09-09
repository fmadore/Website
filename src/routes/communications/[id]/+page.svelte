<script lang="ts">
	import { allCommunications } from '$lib/data/communications/index';
	import { researchProjectPath } from '$lib/data/research';
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Communication } from '$lib/types/communication';
	import type { ComponentType } from 'svelte';
	import RecordLayout, { type EyebrowToken } from '$lib/components/common/RecordLayout.svelte';
	import CommunicationRecordRail from '$lib/components/communications/CommunicationRecordRail.svelte';
	import SlideDeckEmbed from '$lib/components/communications/SlideDeckEmbed.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import {
		createCommunicationSEODescription,
		createCommunicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { getCommunicationTypeBadge } from '$lib/utils/typeUtils';
	import { formatByline } from '$lib/utils/byline';
	import { typesetQuotes, typesetQuotesInHtml } from '$lib/utils/typesetQuotes';
	import MetaTags from '$lib/components/communications/MetaTags.svelte';

	// Get communication from the page data
	let { data } = $props();
	const communication = $derived(data.communication as Communication);
	const jsonLdString = $derived(data.jsonLdString as string | undefined);

	// Generate optimized SEO content
	const seoDescription = $derived(createCommunicationSEODescription(communication));
	const seoKeywords = $derived(createCommunicationSEOKeywords(communication));

	// Define breadcrumb items (used for JSON-LD structured data)
	const breadcrumbItems = $derived([
		{ label: 'Talks & Events', href: `${base}/conference-activity` },
		{
			label: truncateTitle(communication.title),
			href: `${base}/communications/${communication.id}`
		}
	]);

	// The type badge prints in the breadcrumb, the masthead eyebrow and the rail
	// ledger — one label, computed once.
	const typeLabel = $derived(typesetQuotes(getCommunicationTypeBadge(communication.type ?? '')));

	// Eyebrow: type and dateline only. A "Slides" token was considered and
	// declined — a deck is an action, not a fact about the record, and it already
	// has two affordances (the rail's jump button and the Slides section itself).
	const eyebrow = $derived.by((): EyebrowToken[] => {
		const tokens: EyebrowToken[] = [];
		if (typeLabel) tokens.push({ label: typeLabel });
		if (communication.date) tokens.push({ label: communication.date });
		return tokens;
	});

	const displayTitle = $derived(typesetQuotes(communication.title));
	const byline = $derived(formatByline(communication.authors));

	// Internal research page for this talk's project, when the name matches one.
	const projectPath = $derived(researchProjectPath(communication.project));
	const projectUrl = $derived(projectPath ? `${base}${projectPath}` : undefined);

	// Abstract → paragraphs. Rendered via {@html} because abstracts carry inline
	// markup, so they take the HTML-aware typesetter — `typesetQuotes` would curl
	// quotes inside any attribute.
	const abstractParagraphs = $derived(
		(communication.abstract ?? '')
			.split(/\n\s*\n|\n/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
			.map(typesetQuotesInHtml)
	);

	const papers = $derived(communication.papers ?? []);
	const participants = $derived(communication.participants ?? []);
	const tags = $derived(communication.tags?.filter(Boolean) ?? []);

	// Related talks in the same project (excluding the current one).
	const relatedInProject = $derived(
		communication.project
			? allCommunications.filter(
					(c) => c.id !== communication.id && c.project === communication.project
				)
			: []
	);

	// Lazy load MapVisualization only when the map scrolls near the viewport.
	// maplibre-gl (~267 KiB JS) plus ~2 MB of Carto tiles dominate LCP/TBT, and
	// the map sits at the very bottom of the page — well below the fold — so
	// eagerly importing it on mount tanked PageSpeed for no visible benefit.
	let MapVisualization:
		typeof import('$lib/components/visualisations/MapVisualization.svelte').default | null =
		$state(null);
	let mapLoaded = $state(false);
	let mapSectionEl = $state<HTMLElement>();

	function loadMap() {
		if (mapLoaded) return;
		mapLoaded = true;
		import('$lib/components/visualisations/MapVisualization.svelte').then((module) => {
			MapVisualization = module.default;
		});
	}

	// Defer the maplibre-gl import until the map section approaches the viewport
	// (200px pre-load margin). Falls back to loading immediately if
	// IntersectionObserver is unavailable.
	$effect(() => {
		if (!communication.coordinates || mapLoaded || !mapSectionEl) return;

		if (typeof IntersectionObserver === 'undefined') {
			loadMap();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					loadMap();
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(mapSectionEl);

		return () => observer.disconnect();
	});

	// Prepare marker data for the map (array with one item)
	const singleMarkerData = $derived(
		communication.coordinates
			? [
					{
						id: communication.id,
						title: communication.title,
						coordinates: communication.coordinates,
						year: communication.year,
						activityType: communication.type,
						image: communication.image
					}
				]
			: []
	);

	/** Programme order, printed as the hanging key of a paper's ledger row. */
	function runningOrder(index: number): string {
		return String(index + 1).padStart(2, '0');
	}

	/** "Name (Affiliation), Name (Affiliation)" — one serif line under a title. */
	function paperByline(authors: Array<{ name: string; affiliation?: string }>): string {
		return authors
			.map((a) => (a.affiliation ? `${a.name} (${a.affiliation})` : a.name))
			.map(typesetQuotes)
			.join(', ');
	}
</script>

<SEO
	title="{truncateTitle(communication.title)} | Frédérick Madore"
	description={seoDescription}
	keywords={seoKeywords}
	ogImage="{base}/{communication.image}"
/>

<MetaTags {communication} />

<!-- The tag block and the sibling-work block are grid children with their own
     gap, so each is passed only when it prints something: an empty block would
     read as a stray interval in the column. -->
{#snippet indexRail()}
	<div class="comm-tags">
		<h2 class="rail-label">Tags</h2>
		<div class="chip-row">
			{#each tags as tag (tag)}
				<!-- Label typeset; the href keeps the raw tag the filter matches. -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- tag search URL -->
				<a class="chip" href="{base}/conference-activity?tag={encodeURIComponent(tag)}"
					>{typesetQuotes(tag)}</a
				>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet relatedBlock()}
	<RelatedItemsList
		allItems={allCommunications}
		currentItemId={communication.id}
		filterKey="project"
		filterValue={communication.project}
		title="More in this Project"
		itemComponent={RelatedItemCard as unknown as ComponentType}
		baseItemUrl="/communications/"
		viewAllUrl="{base}/conference-activity"
		maxItems={3}
		sectionClass="comm-related section section--flush"
		titleClass="comm-related-title section-title"
	/>
{/snippet}

<RecordLayout
	section={{ label: 'Talks & Events', href: `${base}/conference-activity` }}
	breadcrumbCurrent={typeLabel}
	{eyebrow}
	title={displayTitle}
	{byline}
	{breadcrumbItems}
	jsonLdScriptId="communication-json-ld"
	{jsonLdString}
	railSecondary={tags.length > 0 ? indexRail : undefined}
	related={relatedInProject.length > 0 ? relatedBlock : undefined}
>
	{#snippet main()}
		<!-- Abstract -->
		{#if abstractParagraphs.length > 0}
			<section class="section comm-section" aria-labelledby="comm-abstract-head">
				<div class="section-head">
					<h2 id="comm-abstract-head" class="section-title">Abstract</h2>
				</div>
				<div class="comm-abstract">
					{#each abstractParagraphs as paragraph, index (index)}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: abstracts are trusted static data, and carry inline markup (<i> around transliterated terms). -->
						<p class="comm-abstract-p" class:drop-cap={index === 0}>{@html paragraph}</p>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Slides — embedded inline when an embeddable deck URL is set. -->
		{#if communication.slidesUrl}
			<section class="section comm-section" id="slides" aria-labelledby="comm-slides-head">
				<div class="section-head">
					<h2 id="comm-slides-head" class="section-title">Slides</h2>
				</div>
				<SlideDeckEmbed src={communication.slidesUrl} title={communication.title} />
			</section>
		{/if}

		<!-- Papers — a ledger keyed by programme order, not a grid of cards. -->
		{#if papers.length > 0}
			<section class="section comm-section" aria-labelledby="comm-papers-head">
				<div class="section-head">
					<h2 id="comm-papers-head" class="section-title">
						{communication.type === 'panel' ? 'Papers in this Panel' : 'Papers'}
					</h2>
				</div>
				<div class="ledger ledger--ruled comm-papers">
					{#each papers as paper, index (paper.title + index)}
						<div class="ledger-row">
							<span class="ledger-key">{runningOrder(index)}</span>
							<span class="ledger-content">
								<span class="ledger-title">{typesetQuotes(paper.title)}</span>
								{#if paper.authors && paper.authors.length > 0}
									<span class="comm-paper-byline">{paperByline(paper.authors)}</span>
								{/if}
								{#if paper.abstract}
									<span class="ledger-desc">{typesetQuotes(paper.abstract)}</span>
								{/if}
							</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Participants — role as the hanging key; an unroled name keys to an em dash. -->
		{#if participants.length > 0}
			<section class="section comm-section" aria-labelledby="comm-participants-head">
				<div class="section-head">
					<h2 id="comm-participants-head" class="section-title">Participants</h2>
				</div>
				<div class="ledger ledger--ruled comm-participants">
					{#each participants as participant, index (participant.name + index)}
						<div class="ledger-row">
							<span class="ledger-key"
								>{participant.role ? typesetQuotes(participant.role) : '—'}</span
							>
							<span class="ledger-content">
								<span class="ledger-title">{typesetQuotes(participant.name)}</span>
								{#if participant.affiliation}
									<span class="comm-affiliation">{typesetQuotes(participant.affiliation)}</span>
								{/if}
							</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Location — the venue as a plate. -->
		{#if communication.coordinates}
			<section class="section comm-section" aria-labelledby="comm-location-head">
				<div class="section-head">
					<h2 id="comm-location-head" class="section-title">Location</h2>
				</div>
				<div class="comm-map" bind:this={mapSectionEl}>
					{#if MapVisualization}
						<MapVisualization markersData={singleMarkerData} />
					{:else}
						<p class="comm-map-loading">Loading map…</p>
					{/if}
				</div>
			</section>
		{/if}
	{/snippet}

	{#snippet railPrimary()}
		<CommunicationRecordRail
			{communication}
			{typeLabel}
			{projectUrl}
			hasSlides={Boolean(communication.slidesUrl)}
		/>
	{/snippet}
</RecordLayout>

<style>
	/* Consistent rhythm between the sections. */
	.comm-section {
		margin-top: var(--space-2xl);
	}

	/* ── Abstract ──────────────────────────────────────────────────────────── */
	.comm-abstract {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		max-width: var(--measure-prose);
	}

	.comm-abstract-p {
		margin: 0;
	}

	.comm-abstract-p + .comm-abstract-p {
		margin-top: var(--space-md);
	}

	/* ── Papers & participants ─────────────────────────────────────────────── */
	/* The programme number is a two-character key, so the ledger's 7rem default
	   would hang the titles a third of the column away from it. */
	.comm-papers {
		--ledger-key-w: 3rem;
	}

	/* Roles are words, not numbers ("Chair", "Discussant", "Convenor"). */
	.comm-participants {
		--ledger-key-w: 8rem;
	}

	/* A paper's byline and a participant's affiliation are both names and
	   institutions — the document voice, set quieter than the title above. */
	.comm-paper-byline,
	.comm-affiliation {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-base);
		line-height: var(--line-height-normal);
		color: var(--color-text-soft);
	}

	.comm-affiliation {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	/* ── Map plate ─────────────────────────────────────────────────────────── */
	/* A plain block, not a flex box: MapVisualization sizes itself to the
	   wrapper's height, and a flex main axis would leave it at content height. */
	.comm-map {
		height: 400px;
		overflow: hidden;
		background: var(--color-background-muted);
		border: var(--border-width-thin) solid var(--color-border);
	}

	/* Placeholder held in the data voice — it is machine status, not prose. */
	.comm-map-loading {
		margin: 0;
		padding: var(--space-3xl) var(--space-md);
		text-align: center;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	@media (--sm-down) {
		.comm-map {
			height: 300px;
		}
	}
</style>
