<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import type { ComponentType } from 'svelte';
	import type { PageData } from './$types';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import MetaTags from '$lib/components/publications/MetaTags.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';

	// CitedBy, Reviews, PageHeader, etc. imports remain
	import CitedBy from '$lib/components/publications/CitedBy.svelte';
	import Reviews from '$lib/components/publications/Reviews.svelte';
	import PublicationWordCloud from '$lib/components/publications/PublicationWordCloud.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
	import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
	import AbstractSection from '$lib/components/molecules/AbstractSection.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import { allPublications } from '$lib/data/publications/index'; // Keep this for RelatedItemsList
	import { generateBibtex } from '$lib/utils/bibtexGenerator';
	import {
		createPublicationSEODescription,
		createPublicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { getPublicationTypeBadge } from '$lib/utils/typeUtils';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let publication = $derived(data.publication as Publication);
	let jsonLdString = $derived(data.jsonLdString);

	// Generate optimized SEO content
	const seoDescription = $derived(createPublicationSEODescription(publication));
	const seoKeywords = $derived(createPublicationSEOKeywords(publication));

	// Define breadcrumb items
	let breadcrumbItems = $derived([
		{ label: 'Publications', href: `${base}/publications` },
		{ label: truncateTitle(publication.title), href: `${base}/publications/${publication.id}` }
	]);

	// JSON-LD injection using reusable utilities
	useBreadcrumbJsonLd(() => breadcrumbItems);
	useJsonLdScript('publication-json-ld', () => jsonLdString);

	// Project URL mappings
	let projectMappings = $derived({
		'Religious Activism on Campuses in Togo and Benin': `${base}/research/religious-activism-campuses-togo-benin`,
		"Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso": `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`,
		'Muslim Minorities in Southern Cities of Benin and Togo': `${base}/research/muslim-minorities-southern-cities-benin-togo`,
		'Digital Humanities and AI in African Studies': `${base}/research/dh-ai-african-studies`
	});

	// Prepare details for the DetailsGrid component
	let publicationDetails = $derived([
		// Type-specific details
		{
			label: 'Journal',
			value: publication.journal ?? '',
			condition:
				publication.type === 'article' ||
				publication.type === 'special-issue' ||
				publication.type === 'bulletin-article'
		},
		{
			label: 'Volume',
			value: publication.volume ?? '',
			condition:
				publication.type === 'article' ||
				publication.type === 'special-issue' ||
				publication.type === 'bulletin-article'
		},
		{
			label: 'Issue',
			value: publication.issue ?? '',
			condition:
				publication.type === 'article' ||
				publication.type === 'special-issue' ||
				publication.type === 'bulletin-article'
		},
		{
			label: 'Publisher',
			value: publication.publisher ?? '',
			condition: ['book', 'chapter', 'report', 'encyclopedia'].includes(publication.type)
		},
		{
			label: 'Place',
			value: publication.placeOfPublication ?? '',
			condition: ['book', 'report'].includes(publication.type)
		},
		{ label: 'ISBN', value: publication.isbn ?? '', condition: publication.type === 'book' },
		{ label: 'Book', value: publication.book ?? '', condition: publication.type === 'chapter' },
		{
			label: 'Edited by',
			value: Array.isArray(publication.editors)
				? publication.editors.join(', ')
				: (publication.editors ?? ''),
			condition: publication.type === 'chapter' && !!publication.editors
		},
		{
			label: 'Encyclopedia',
			value: publication.encyclopediaTitle ?? '',
			condition: publication.type === 'encyclopedia'
		},
		{
			label: 'Blog',
			value: publication.publisher ?? '',
			condition: publication.type === 'blogpost'
		}, // Assuming publisher holds blog name
		{
			label: 'University',
			value: publication.university ?? '',
			condition: ['masters-thesis', 'phd-dissertation'].includes(publication.type)
		},
		{
			label: 'Department',
			value: publication.department ?? '',
			condition: ['masters-thesis', 'phd-dissertation'].includes(publication.type)
		},
		{
			label: 'Advisors',
			value: publication.advisors ?? [],
			condition:
				['masters-thesis', 'phd-dissertation'].includes(publication.type) &&
				publication.advisors &&
				publication.advisors.length > 0
		},

		// Common details
		{ label: 'Pages', value: String(publication.pages || publication.pageCount || '') },
		{ label: 'Language', value: publication.language ?? '' },
		{
			label: 'DOI',
			value: publication.doi ?? '',
			link: publication.doi ? `https://doi.org/${publication.doi}` : undefined
		},
		{
			label: 'Project',
			value: publication.project ?? '',
			link:
				publication.project && (projectMappings as Record<string, string>)[publication.project]
					? (projectMappings as Record<string, string>)[publication.project]
					: undefined
		},
		{ label: 'Countries', value: publication.country ?? [] }
	]);

	function downloadBibtex() {
		if (!publication) return;
		const bibtexString = generateBibtex(publication);
		const blob = new Blob([bibtexString], { type: 'application/x-bibtex;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${publication.id}.bib`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<!-- Ensure svelte:head block for JSON-LD is removed or commented out -->
<!-- 
<svelte:head>
    {#if jsonLdString} 
        <script type="application/ld+json">
            {@html jsonLdString}
        </script>
    {/if}
</svelte:head>
-->

<SEO
	title={truncateTitle(publication.title) + ' | Frédérick Madore'}
	description={seoDescription}
	keywords={seoKeywords}
	ogImage={publication.image ? `${base}/${publication.image}` : undefined}
	includeCitationAuthor={false}
/>

<MetaTags {publication} />

<div class="container py-8 page-enter">
	<!-- Breadcrumb outside article for better structure -->
	<div class="max-w-6xl mx-auto">
		<Breadcrumb items={breadcrumbItems} />

		<article class="publication-article">
		<div class="content-wrapper">
			<PageHeader
				title={publication.title}
				date={publication.date}
				typeBadgeText={getPublicationTypeBadge(publication.type)}
				authors={publication.authors}
			/>

			<!-- Hero Image Display -->
			<HeroImageDisplay
				heroImage={publication.heroImage}
				fallbackImage={publication.image}
				defaultAlt={publication.title}
				imageClass="w-full max-w-md h-auto rounded-md mx-auto"
				figcaptionClass="text-text-muted text-sm mt-2 italic text-center"
			/>

			<!-- Abstract Section -->
			<AbstractSection abstract={publication.abstract} />

			<!-- Details Grid -->
			<DetailsGrid details={publicationDetails} />

			<!-- Table of Contents Section -->
			{#if (publication.type === 'book' || publication.type === 'special-issue') && publication.tableOfContents && publication.tableOfContents.length > 0}
				<section class="table-of-contents-section glass-section-panel scroll-reveal">
					<h2 class="toc-title">Table of Contents</h2>
					<ol class="toc-list">
						{#each publication.tableOfContents as item, index (index)}
							<li class="toc-item">
								<span class="toc-number">{index + 1}.</span>
								{#if typeof item === 'string'}
									<span class="toc-content">{item}</span>
								{:else}
									<span class="toc-content">
										{item.title}
										{#if item.authors && item.authors.length > 0}
											<span class="toc-authors">({item.authors.length === 1
													? item.authors[0]
													: item.authors.length === 2
														? `${item.authors[0]} and ${item.authors[1]}`
														: `${item.authors.slice(0, -1).join(', ')} and ${item.authors[item.authors.length - 1]}`})</span>
										{/if}
									</span>
								{/if}
							</li>
						{/each}
					</ol>
				</section>
			{/if}

			<!-- Tags -->
			<TagList tags={publication.tags} baseUrl="/publications?tag=" />

			<!-- Word Cloud (only shows if text analysis available) -->
			<PublicationWordCloud publicationId={publication.id} />

			<!-- Action Links and Export Button -->
			<div class="publication-actions glass-section-panel scroll-reveal flex flex-wrap items-center gap-4">
				<ActionLinks
					primaryUrl={publication.url}
					primaryLabel="Access Publication"
					additionalUrls={publication.additionalUrls}
					sectionClass=""
					primaryDivClass=""
				/>

				<div>
					<button onclick={downloadBibtex} class="btn btn-primary cursor-pointer">
						Export BibTeX
					</button>
				</div>
			</div>
		</div>
	</article>

	<!-- Reviews component -->
	<Reviews reviewedBy={publication.reviewedBy} />

	<!-- CitedBy component -->
	<CitedBy citedBy={publication.citedBy} />

	<!-- Related Publications -->
	{#if publication.project}
		<RelatedItemsList
			allItems={allPublications}
			currentItemId={publication.id}
			filterKey="project"
			filterValue={publication.project}
			title="More Publications in this Project"
			itemComponent={RelatedItemCard as unknown as ComponentType}
			baseItemUrl="/publications/"
			viewAllUrl="{base}/publications"
			maxItems={3}
		/>
	{/if}
	</div>
</div>

<style>
	/* Article container - no outer glass card, sections have their own glassmorphism */
	.publication-article {
		position: relative;
		margin-bottom: var(--space-lg);
	}

	/* Content wrapper for animation - consistent spacing between sections */
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

	/* Table of Contents Section */
	.table-of-contents-section {
		padding: var(--space-lg);
	}

	.toc-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-tight);
		position: relative;
	}

	.toc-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-sm));
		left: 0;
		width: var(--space-3xl);
		height: var(--border-width-medium);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			color-mix(in srgb, var(--color-highlight) 30%, transparent) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.table-of-contents-section:hover .toc-title::after {
		width: var(--space-5xl);
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.toc-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		padding: var(--space-sm) 0;
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent);
		transition:
			background var(--duration-fast) var(--ease-out),
			padding-left var(--duration-fast) var(--ease-out);
	}

	.toc-item:last-child {
		border-bottom: none;
	}

	.toc-item:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-very-low) * 100%),
			transparent
		);
		padding-left: var(--space-sm);
		border-radius: var(--border-radius-sm);
	}

	.toc-number {
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		min-width: var(--space-lg);
	}

	.toc-content {
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text);
		flex: 1;
	}

	.toc-authors {
		font-weight: var(--font-weight-normal);
		color: var(--color-text-muted);
		font-style: italic;
		margin-left: var(--space-2xs);
	}

	/* Publication actions container — highlight→primary→accent color order */
	.publication-actions {
		--_gsp-c1: var(--color-highlight);
		--_gsp-c2: var(--color-primary);
		--_gsp-c3: var(--color-accent);
		padding: var(--space-md) var(--space-lg);
	}

	:global(html.dark) .toc-item {
		border-bottom-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-very-low) * 100%),
			transparent
		);
	}

	:global(html.dark) .toc-item:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	/* Responsive adjustments */
	@media (--sm) {
		.table-of-contents-section {
			padding: var(--space-xl);
		}

		.toc-title {
			font-size: var(--font-size-2xl);
		}

		.toc-item {
			padding: var(--space-md) 0;
		}

		.toc-number,
		.toc-content {
			font-size: var(--font-size-base);
		}

		.publication-actions {
			padding: var(--space-lg) var(--space-xl);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.toc-item,
		.toc-item:hover,
		.toc-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
