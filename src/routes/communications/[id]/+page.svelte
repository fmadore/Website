<script lang="ts">
	import { allCommunications } from '$lib/data/communications/index';
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Communication } from '$lib/types/communication';
	import type { ComponentType } from 'svelte';
	import MapVisualization from '$lib/components/visualisations/MapVisualization.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { page } from '$app/stores';
	import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
	import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
	import AbstractSection from '$lib/components/molecules/AbstractSection.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import { browser } from '$app/environment';
	import {
		createCommunicationSEODescription,
		createCommunicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import MetaTags from '$lib/components/communications/MetaTags.svelte';

	// Get communication from the page data
	let { data } = $props();
	const communication = $derived(data.communication as Communication);

	// Generate optimized SEO content
	const seoDescription = $derived(createCommunicationSEODescription(communication));
	const seoKeywords = $derived(createCommunicationSEOKeywords(communication)); // Define breadcrumb items
	const breadcrumbItems = $derived([
		{ label: 'Conference Activity', href: `${base}/conference-activity` },
		{
			label: truncateTitle(communication.title),
			href: `${base}/communications/${communication.id}`
		}
	]);
	// Generate Breadcrumb JSON-LD
	const breadcrumbJsonLdString = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				item: `${$page.url.origin}${item.href}`
			}))
		})
	); // Prepare marker data for the map (array with one item)
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

	// Helper to get badge text
	function getTypeBadgeText(type: string): string {
		switch (type) {
			case 'conference':
				return 'Conference Paper';
			case 'workshop':
				return 'Workshop Presentation';
			case 'seminar':
				return 'Seminar';
			case 'lecture':
				return 'Lecture';
			case 'panel':
				return 'Panel';
			default:
				return type;
		}
	} // Prepare details for the DetailsGrid component
	const communicationDetails = $derived([
		{ label: 'Event', value: communication.conference ?? '' },
		{
			label: 'Panel',
			value: communication.panelTitle ?? '',
			condition: communication.type === 'conference' && !!communication.panelTitle
		},
		{ label: 'Location', value: communication.location ?? '' },
		{ label: 'Country', value: communication.country ?? '' },
		{ label: 'Language', value: communication.language ?? '' },
		{ label: 'Year', value: String(communication.year ?? '') }
	]);

	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

	// Replace onMount and onDestroy with $effect
	$effect(() => {
		if (browser) {
			const scriptId = breadcrumbJsonLdScriptId;
			let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

			// breadcrumbJsonLdString is reactive via $derived
			if (breadcrumbJsonLdString) {
				if (scriptElement) {
					scriptElement.textContent = breadcrumbJsonLdString;
				} else {
					scriptElement = document.createElement('script');
					scriptElement.id = scriptId;
					scriptElement.type = 'application/ld+json';
					scriptElement.textContent = breadcrumbJsonLdString;
					document.head.appendChild(scriptElement);
				}
			} else {
				// If breadcrumbJsonLdString becomes falsy and the script exists, remove it
				if (scriptElement) {
					document.head.removeChild(scriptElement);
				}
			}

			return () => {
				// Cleanup: remove the script if it exists
				if (browser) {
					const scriptToRemove = document.getElementById(scriptId);
					if (scriptToRemove && scriptToRemove.parentElement === document.head) {
						document.head.removeChild(scriptToRemove);
					}
				}
			};
		}
	});
</script>

<SEO
	title="{truncateTitle(communication.title)} | Frédérick Madore"
	description={seoDescription}
	keywords={seoKeywords}
	ogImage="{base}/{communication.image}"
/>

<MetaTags {communication} />

<div class="container py-8 page-enter">
	<Breadcrumb items={breadcrumbItems} />

	<article class="communication-article">
		<div class="content-wrapper">
			<PageHeader
				title={communication.title}
				date={communication.date}
				typeBadgeText={getTypeBadgeText(communication.type || '')}
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

			<!-- Details Grid -->
			<DetailsGrid details={communicationDetails} />

			<!-- Panel-specific information: Papers in Panel -->
			{#if communication.type === 'panel' && communication.papers && communication.papers.length > 0}
				<section class="panel-papers-section scroll-reveal">
					<h2 class="panel-section-title">Papers in this Panel</h2>
					<div class="panel-papers-grid grid-stagger">
						{#each communication.papers as paper, index (paper.title + index)}
							<div class="panel-paper-card">
								<h3 class="panel-paper-title">{paper.title}</h3>
								{#if paper.authors && paper.authors.length > 0}
									<div class="panel-paper-authors">
										{#each paper.authors as author, index (author.name + index)}
											<span>
												{author.name}{#if author.affiliation}{' '}({author.affiliation}){/if}{#if index < paper.authors.length - 1},&nbsp;{/if}
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
					<h2 class="panel-section-title">Participants</h2>
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

			<!-- Map Location -->
			{#if communication.coordinates}
				<section class="map-section scroll-reveal">
					<h2 class="map-section-title">Location</h2>
					<div class="map-container-wrapper">
						<MapVisualization markersData={singleMarkerData} />
					</div>
				</section>
			{/if}

			<!-- Action Links -->
			<ActionLinks
				primaryUrl={communication.url}
				primaryLabel="Access Presentation"
				additionalUrls={communication.additionalUrls}
				sectionClass="action-links"
				primaryButtonClass="btn btn-primary glass-button"
				secondaryButtonClass="btn btn-outline-primary glass-button"
				primaryDivClass="mb-4"
			/>
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

	/* Panel Papers Section */
	.panel-papers-section {
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		position: relative;

		/* Glassmorphism effect */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.1);
		box-shadow:
			var(--shadow-md),
			inset 0 1px 0 rgba(var(--color-white-rgb), 0.1);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.panel-papers-section:hover {
		transform: translateY(-2px);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		box-shadow:
			var(--shadow-lg),
			inset 0 1px 0 rgba(var(--color-white-rgb), 0.15);
	}

	/* Participants Section */
	.participants-section {
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		position: relative;

		/* Glassmorphism effect */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.1);
		box-shadow:
			var(--shadow-md),
			inset 0 1px 0 rgba(var(--color-white-rgb), 0.1);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.participants-section:hover {
		transform: translateY(-2px);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		box-shadow:
			var(--shadow-lg),
			inset 0 1px 0 rgba(var(--color-white-rgb), 0.15);
	}

	/* Section Titles */
	.panel-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-tight);
		position: relative;
	}

	/* Elegant accent line under title */
	.panel-section-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-xs));
		left: 0;
		width: 4rem;
		height: 2px;
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			rgba(var(--color-highlight-rgb), 0.5) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.panel-papers-section:hover .panel-section-title::after,
	.participants-section:hover .panel-section-title::after {
		width: 5rem;
	}

	/* Panel Papers Grid */
	.panel-papers-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	/* Panel Paper Cards */
	.panel-paper-card {
		padding: var(--space-md);
		border-radius: var(--border-radius-lg);
		position: relative;

		/* Subtle glassmorphism */
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.02) 0%,
			rgba(var(--color-primary-rgb), 0.02) 50%,
			rgba(var(--color-highlight-rgb), 0.01) 100%
		);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), 0.1);
		box-shadow: var(--shadow-sm);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.panel-paper-card:hover {
		transform: translateY(-2px);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.04) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		box-shadow: var(--shadow-md);
	}

	.panel-paper-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-sm);
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

	@media (min-width: 768px) {
		.participants-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Participant Cards */
	.participant-card {
		padding: var(--space-md);
		border-radius: var(--border-radius-lg);
		position: relative;

		/* Subtle glassmorphism */
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.02) 0%,
			rgba(var(--color-primary-rgb), 0.02) 50%,
			rgba(var(--color-highlight-rgb), 0.01) 100%
		);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), 0.1);
		box-shadow: var(--shadow-sm);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.participant-card:hover {
		transform: translateY(-2px);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.04) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		box-shadow: var(--shadow-md);
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
		margin-bottom: var(--space-sm);
	}

	.map-container-wrapper {
		height: 400px;
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), 0.1);
		box-shadow: var(--shadow-sm);
	}

	/* Dark mode refinements */
	:global(html.dark) .panel-papers-section,
	:global(html.dark) .participants-section {
		background: linear-gradient(
			135deg,
			rgba(30, 41, 59, 0.7) 0%,
			rgba(var(--color-primary-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-white-rgb), 0.08);
	}

	:global(html.dark) .panel-papers-section:hover,
	:global(html.dark) .participants-section:hover {
		background: linear-gradient(
			135deg,
			rgba(30, 41, 59, 0.8) 0%,
			rgba(var(--color-primary-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	:global(html.dark) .panel-paper-card,
	:global(html.dark) .participant-card {
		background: linear-gradient(
			135deg,
			rgba(30, 41, 59, 0.5) 0%,
			rgba(var(--color-accent-rgb), 0.06) 50%,
			rgba(var(--color-primary-rgb), 0.04) 100%
		);
		border-color: rgba(var(--color-white-rgb), 0.06);
	}

	:global(html.dark) .panel-paper-card:hover,
	:global(html.dark) .participant-card:hover {
		background: linear-gradient(
			135deg,
			rgba(30, 41, 59, 0.6) 0%,
			rgba(var(--color-accent-rgb), 0.08) 50%,
			rgba(var(--color-primary-rgb), 0.06) 100%
		);
	}

	:global(html.dark) .map-container-wrapper {
		background: linear-gradient(
			135deg,
			rgba(30, 41, 59, 0.5) 0%,
			rgba(var(--color-accent-rgb), 0.06) 50%,
			rgba(var(--color-primary-rgb), 0.04) 100%
		);
		border-color: rgba(var(--color-white-rgb), 0.06);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.panel-papers-section,
		.participants-section {
			padding: var(--space-md);
		}

		.panel-section-title {
			font-size: var(--font-size-lg);
		}

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

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.panel-papers-section,
		.panel-papers-section:hover,
		.participants-section,
		.participants-section:hover,
		.panel-paper-card,
		.panel-paper-card:hover,
		.participant-card,
		.participant-card:hover,
		.panel-section-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
