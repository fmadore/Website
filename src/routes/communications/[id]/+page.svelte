<script lang="ts">
	import { allCommunications } from '$lib/data/communications/index';
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Communication } from '$lib/types/communication';
	import type { ComponentType } from 'svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
	import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
	import AbstractSection from '$lib/components/molecules/AbstractSection.svelte';
	import SlideDeckEmbed from '$lib/components/communications/SlideDeckEmbed.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import {
		createCommunicationSEODescription,
		createCommunicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { getCommunicationTypeBadge } from '$lib/utils/typeUtils';
	import MetaTags from '$lib/components/communications/MetaTags.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';

	// Get communication from the page data
	let { data } = $props();
	const communication = $derived(data.communication as Communication);
	const jsonLdString = $derived(data.jsonLdString as string | undefined);

	// Generate optimized SEO content
	const seoDescription = $derived(createCommunicationSEODescription(communication));
	const seoKeywords = $derived(createCommunicationSEOKeywords(communication));

	// Define breadcrumb items
	const breadcrumbItems = $derived([
		{ label: 'Talks & Events', href: `${base}/conference-activity` },
		{
			label: truncateTitle(communication.title),
			href: `${base}/communications/${communication.id}`
		}
	]);

	// Inject breadcrumb JSON-LD structured data
	useBreadcrumbJsonLd(() => breadcrumbItems);

	// Inject communication JSON-LD structured data
	useJsonLdScript('communication-json-ld', () => jsonLdString);

	// Lazy load MapVisualization only when the map scrolls near the viewport.
	// maplibre-gl (~267 KiB JS) plus ~2 MB of Carto tiles dominate LCP/TBT, and
	// the map sits at the very bottom of the page — well below the fold — so
	// eagerly importing it on mount tanked PageSpeed for no visible benefit.
	let MapVisualization:
		| typeof import('$lib/components/visualisations/MapVisualization.svelte').default
		| null = $state(null);
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

	// Prepare details for the DetailsGrid component
	const communicationDetails = $derived([
		{ label: 'Event', value: communication.conference ?? '' },
		{
			label: communication.type === 'conference' ? 'Panel' : 'Series',
			value: communication.panelTitle ?? '',
			condition: !!communication.panelTitle
		},
		{ label: 'Location', value: communication.location ?? '' },
		{ label: 'Country', value: communication.country ?? '' },
		{ label: 'Language', value: communication.language ?? '' },
		{ label: 'Year', value: String(communication.year ?? '') }
	]);
</script>

<SEO
	title="{truncateTitle(communication.title)} | Frédérick Madore"
	description={seoDescription}
	keywords={seoKeywords}
	ogImage="{base}/{communication.image}"
/>

<MetaTags {communication} />

<div class="container py-8 page-enter">
	<div class="max-w-6xl mx-auto">
		<Breadcrumb items={breadcrumbItems} />

		<article class="communication-article">
			<div class="content-wrapper">
				<PageHeader
					title={communication.title}
					date={communication.date}
					typeBadgeText={getCommunicationTypeBadge(communication.type || '')}
					authors={communication.authors}
				/>

				<!-- Hero Image Display -->
				<HeroImageDisplay
					heroImage={communication.heroImage}
					fallbackImage={communication.image}
					defaultAlt={communication.title}
					imageClass="w-full max-w-md h-auto rounded-md mx-auto"
					figcaptionClass="text-muted text-sm mt-2 italic"
				/>

				<!-- Abstract Section -->
				<AbstractSection abstract={communication.abstract} />

				<!-- Slide Deck — embedded inline when an embeddable deck URL is set -->
				{#if communication.slidesUrl}
					<section class="slides-section scroll-reveal" id="slides">
						<h2 class="editorial-section-title">Slides</h2>
						<SlideDeckEmbed src={communication.slidesUrl} title={communication.title} />
					</section>
				{/if}

				<!-- Details Grid -->
				<DetailsGrid details={communicationDetails} />

				<!-- Panel-specific information: Papers in Panel -->
				{#if communication.type === 'panel' && communication.papers && communication.papers.length > 0}
					<section class="panel-papers-section scroll-reveal">
						<h2 class="editorial-section-title">Papers in this Panel</h2>
						<div class="panel-papers-grid grid-stagger">
							{#each communication.papers as paper, index (paper.title + index)}
								<div class="panel-paper-card">
									<h3 class="panel-paper-title">{paper.title}</h3>
									{#if paper.authors && paper.authors.length > 0}
										<div class="panel-paper-authors">
											{#each paper.authors as author, index (author.name + index)}
												<span>
													{author.name}{#if author.affiliation}&nbsp;({author.affiliation}){/if}{#if index < paper.authors.length - 1},&nbsp;{/if}
												</span>
											{/each}
										</div>
									{/if}
									{#if paper.abstract}
										<div class="panel-paper-abstract">
											{paper.abstract}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Participants Section -->
				{#if communication.participants && communication.participants.length > 0}
					<section class="participants-section scroll-reveal">
						<h2 class="editorial-section-title">Participants</h2>
						<div class="participants-grid grid-stagger">
							{#each communication.participants as participant, index (participant.name + index)}
								<div class="participant-card">
									<div class="participant-name">{participant.name}</div>
									{#if participant.role}
										<div class="participant-role">
											{participant.role}
										</div>
									{/if}
									{#if participant.affiliation}
										<div class="participant-affiliation">
											{participant.affiliation}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Tags -->
				<TagList tags={communication.tags} baseUrl="/conference-activity?tag=" />

				<!-- Action Links -->
				<ActionLinks
					primaryUrl={communication.url}
					primaryLabel={communication.urlLabel ?? 'Access Presentation'}
					additionalUrls={communication.additionalUrls}
					sectionClass="action-links"
					primaryButtonClass="btn btn-primary"
					secondaryButtonClass="btn btn-outline-primary"
					primaryDivClass="mb-4"
				/>

				<!-- Map Location -->
				{#if communication.coordinates}
					<section class="map-section scroll-reveal" bind:this={mapSectionEl}>
						<h2 class="map-section-title">Location</h2>
						<div class="map-container-wrapper">
							{#if MapVisualization}
								<MapVisualization markersData={singleMarkerData} />
							{:else}
								<div class="flex items-center justify-center py-12">
									<span class="text-light">Loading map...</span>
								</div>
							{/if}
						</div>
					</section>
				{/if}
			</div>
		</article>

		<!-- Related Communications in this Project -->
		{#if communication.project}
			<RelatedItemsList
				allItems={allCommunications}
				currentItemId={communication.id}
				filterKey="project"
				filterValue={communication.project}
				title="More Conference Activities in this Project"
				itemComponent={RelatedItemCard as unknown as ComponentType}
				baseItemUrl="/communications/"
				viewAllUrl="{base}/conference-activity"
				maxItems={3}
			/>
		{/if}
	</div>
</div>

<style>
	/* Article container - no outer glassmorphism, individual sections have their own */
	.communication-article {
		position: relative;
	}

	/* Content wrapper for scroll animation - consistent spacing between sections */
	.content-wrapper {
		display: flex;
		flex-direction: column;
	}

	/* Consistent vertical spacing between major sections */
	.content-wrapper > :global(*) {
		margin-bottom: 0;
	}

	.content-wrapper > :global(* + *) {
		margin-top: var(--space-xl);
	}

	/* Panel Papers & Participants — content-on-paper sections, not tiles.
	 * The outer box (elevated surface + border + shadow) was the last
	 * cards-in-cards survivor: it wrapped already-bordered inner cards. Now
	 * the section sits directly on the page like Abstract / Reviews, the
	 * shared .editorial-section-title carries the heading, and the inner
	 * cards are the only chrome. */
	.panel-papers-section,
	.participants-section {
		margin-top: var(--space-2xl);
	}

	/* Section titles come from the shared .editorial-section-title utility
	 * (typography.css). */

	/* Panel Papers Grid */
	.panel-papers-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	/* Panel Paper Cards — paper tiles sitting directly on the page ground.
	 * Same treatment as the publication-detail review/citation tiles
	 * (.glass-sub-card): elevated surface, hairline border, faint shadow,
	 * no hover lift (these are entries, not affordances). */
	.panel-paper-card {
		padding: var(--space-md);
		border-radius: var(--border-radius-lg);
		position: relative;
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-xs);
	}

	.panel-paper-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-sm) 0;
		line-height: var(--line-height-snug);
	}

	.panel-paper-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--space-sm);
		font-weight: var(--font-weight-medium);
	}

	.panel-paper-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text);
		line-height: var(--line-height-relaxed);
		margin-top: var(--space-xs);
	}

	/* Participants Grid */
	.participants-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (--md) {
		.participants-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Participant Cards — same paper-tile treatment as panel-paper cards. */
	.participant-card {
		padding: var(--space-md);
		border-radius: var(--border-radius-lg);
		position: relative;
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-xs);
	}

	.participant-name {
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-base);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-2xs);
	}

	.participant-role {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--space-2xs);
	}

	.participant-affiliation {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		line-height: var(--line-height-relaxed);
	}

	/* Map Section */
	.map-section {
		display: block; /* Ensure block-level for spacing to work */
	}

	.map-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-sm) 0;
	}

	.map-container-wrapper {
		height: 400px;
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		background: var(--color-surface-alt);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	/* Dark mode — warm dusk surfaces resolve automatically via the
	 * `--color-surface-*` tokens; no per-element overrides required. */

	/* Responsive adjustments */
	@media (--sm-down) {
		.panel-paper-card,
		.participant-card {
			padding: var(--space-sm);
		}

		.panel-paper-title {
			font-size: var(--font-size-base);
		}

		.map-container-wrapper {
			height: 300px;
		}
	}
</style>
