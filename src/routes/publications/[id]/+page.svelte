<script lang="ts">
	// Removed local data import: import { allPublications } from '$lib/data/publications/index';
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import type { ComponentType } from 'svelte';
	import type { PageData } from './$types'; // Import PageData
	import { browser } from '$app/environment'; // Add back browser check
	import { page } from '$app/stores'; // Import page store
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte'; // Import Breadcrumb component
	import MetaTags from '$lib/components/publications/MetaTags.svelte'; // Import MetaTags component

	// CitedBy, Reviews, PageHeader, etc. imports remain
	import CitedBy from '$lib/components/publications/CitedBy.svelte';
	import Reviews from '$lib/components/publications/Reviews.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
	import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
	import AbstractSection from '$lib/components/molecules/AbstractSection.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import { allPublications } from '$lib/data/publications/index'; // Keep this for RelatedItemsList
	import { generateBibtex } from '$lib/utils/bibtexGenerator'; // Import the generator
	import { scrollAnimate } from '$lib/utils/scrollAnimations'; // Add scroll animations
	import {
		createPublicationSEODescription,
		createPublicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';

	interface Props {
		// Get data from the load function
		data: PageData;
	}

	let { data }: Props = $props();
	let publication = $derived(data.publication as Publication);
	let jsonLdString = $derived(data.jsonLdString); // Use the raw string

	// Generate optimized SEO content
	const seoDescription = $derived(createPublicationSEODescription(publication));
	const seoKeywords = $derived(createPublicationSEOKeywords(publication));

	// Define breadcrumb items
	let breadcrumbItems = $derived([
		{ label: 'Publications', href: `${base}/publications` },
		{ label: truncateTitle(publication.title), href: `${base}/publications/${publication.id}` } // Use truncated title
	]);

	// Generate Breadcrumb JSON-LD
	let breadcrumbJsonLdString = $derived(
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
	);

	// Manage JSON-LD script injection
	const publicationJsonLdScriptId = 'publication-json-ld';
	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

	// Replace onMount and onDestroy with $effect
	$effect(() => {
		if (browser) {
			// Handle publication JSON-LD
			const pubScriptId = publicationJsonLdScriptId;
			let pubScriptElement = document.getElementById(pubScriptId) as HTMLScriptElement | null;

			if (jsonLdString) {
				if (pubScriptElement) {
					pubScriptElement.textContent = jsonLdString;
				} else {
					pubScriptElement = document.createElement('script');
					pubScriptElement.id = pubScriptId;
					pubScriptElement.type = 'application/ld+json';
					pubScriptElement.textContent = jsonLdString;
					document.head.appendChild(pubScriptElement);
				}
			} else {
				if (pubScriptElement) {
					document.head.removeChild(pubScriptElement);
				}
			}

			// Handle breadcrumb JSON-LD
			const breadcrumbScriptId = breadcrumbJsonLdScriptId;
			let breadcrumbScriptElement = document.getElementById(
				breadcrumbScriptId
			) as HTMLScriptElement | null;

			if (breadcrumbJsonLdString) {
				if (breadcrumbScriptElement) {
					breadcrumbScriptElement.textContent = breadcrumbJsonLdString;
				} else {
					breadcrumbScriptElement = document.createElement('script');
					breadcrumbScriptElement.id = breadcrumbScriptId;
					breadcrumbScriptElement.type = 'application/ld+json';
					breadcrumbScriptElement.textContent = breadcrumbJsonLdString;
					document.head.appendChild(breadcrumbScriptElement);
				}
			} else {
				if (breadcrumbScriptElement) {
					document.head.removeChild(breadcrumbScriptElement);
				}
			}

			return () => {
				// Cleanup: remove scripts if they exist
				if (browser) {
					const pubScriptToRemove = document.getElementById(pubScriptId);
					if (pubScriptToRemove && pubScriptToRemove.parentElement === document.head) {
						document.head.removeChild(pubScriptToRemove);
					}
					const breadcrumbScriptToRemove = document.getElementById(breadcrumbScriptId);
					if (
						breadcrumbScriptToRemove &&
						breadcrumbScriptToRemove.parentElement === document.head
					) {
						document.head.removeChild(breadcrumbScriptToRemove);
					}
				}
			};
		}
	});

	// Helper to get badge text
	function getTypeBadgeText(type: string): string {
		switch (type) {
			case 'article':
				return 'Journal Article';
			case 'bulletin-article':
				return 'Bulletin Article';
			case 'book':
				return 'Book';
			case 'chapter':
				return 'Book Chapter';
			case 'special-issue':
				return 'Special Issue';
			case 'report':
				return 'Report';
			case 'encyclopedia':
				return 'Encyclopedia Entry';
			case 'blogpost':
				return 'Blog Post';
			case 'masters-thesis':
				return "Master's Thesis";
			case 'phd-dissertation':
				return 'PhD Dissertation';
			default:
				return type;
		}
	}

	// Project URL mappings
	let projectMappings = $derived({
		'Religious Activism on Campuses in Togo and Benin': `${base}/research/religious-activism-campuses-togo-benin`,
		"Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso": `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`,
		'Muslim Minorities in Southern Cities of Benin and Togo': `${base}/research/muslim-minorities-southern-cities-benin-togo`,
		'Mining the Islam West Africa Collection': `${base}/research/mining-the-islam-west-africa-collection`
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

<div class="container mx-auto py-8 px-4">
	<!-- Breadcrumb outside article for better structure -->
	<Breadcrumb items={breadcrumbItems} />

	<article class="publication-article">
		<div class="content-wrapper" use:scrollAnimate={{ delay: 100, animationClass: 'fade-in-up' }}>
			<PageHeader
				title={publication.title}
				date={publication.date}
				typeBadgeText={getTypeBadgeText(publication.type)}
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
				<section class="table-of-contents-section">
					<h2 class="toc-title">Table of Contents</h2>
					<ol class="toc-list">
						{#each publication.tableOfContents as item, index (index)}
							<li class="toc-item">
								<span class="toc-number">{index + 1}.</span>
								<span class="toc-content">{item}</span>
							</li>
						{/each}
					</ol>
				</section>
			{/if}

			<!-- Tags -->
			<TagList tags={publication.tags} baseUrl="/publications?tag=" />

			<!-- Action Links and Export Button -->
			<div class="publication-actions flex flex-wrap items-center gap-4">
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

<style>
	/* Article container - no outer glass card, sections have their own glassmorphism */
	.publication-article {
		position: relative;
		margin-bottom: var(--space-lg);
	}

	/* Content wrapper for animation */
	.content-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Table of Contents Section - Enhanced styling with consistent glassmorphism */
	.table-of-contents-section {
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	.table-of-contents-section:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
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
			rgba(var(--color-highlight-rgb), 0.3) 100%
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
			rgba(var(--color-primary-rgb), var(--opacity-very-low));
		transition:
			background var(--duration-fast) var(--ease-out),
			padding-left var(--duration-fast) var(--ease-out);
	}

	.toc-item:last-child {
		border-bottom: none;
	}

	.toc-item:hover {
		background: rgba(var(--color-primary-rgb), var(--opacity-very-low));
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

	/* Publication actions container - consistent glassmorphism */
	.publication-actions {
		padding: var(--space-md) var(--space-lg);
		border-radius: var(--border-radius-xl);
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid rgba(var(--color-highlight-rgb), var(--opacity-low));
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	.publication-actions:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Dark mode adjustments */
	:global(html.dark) .table-of-contents-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	:global(html.dark) .table-of-contents-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
	}

	:global(html.dark) .toc-item {
		border-bottom-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
	}

	:global(html.dark) .toc-item:hover {
		background: rgba(var(--color-primary-rgb), var(--opacity-low));
	}

	:global(html.dark) .publication-actions {
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), 0.08) 0%,
			rgba(var(--color-primary-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
	}

	:global(html.dark) .publication-actions:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), 0.12) 0%,
			rgba(var(--color-primary-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
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
		.table-of-contents-section,
		.table-of-contents-section:hover,
		.toc-item,
		.toc-item:hover,
		.toc-title::after,
		.publication-actions,
		.publication-actions:hover {
			transition: none;
			transform: none;
		}
	}
</style>
