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

	interface Props {
		// Get data from the load function
		data: PageData;
	}

	let { data }: Props = $props();
	let publication = $derived(data.publication as Publication);
	let jsonLdString = $derived(data.jsonLdString); // Use the raw string

	// Helper function to truncate title at the first colon
	function truncateTitle(title: string): string {
		const colonIndex = title.indexOf(':');
		return colonIndex > -1 ? title.substring(0, colonIndex) + '...' : title;
	}

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

	// Format date for display
	function formatDate(dateString: string): string {
		return dateString || '';
	}

	// Helper to get badge text
	function getTypeBadgeText(type: string): string {
		switch (type) {
			case 'article':
				return 'Journal Article';
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
			condition: publication.type === 'article' || publication.type === 'special-issue'
		},
		{
			label: 'Volume',
			value: publication.volume ?? '',
			condition: publication.type === 'article' || publication.type === 'special-issue'
		},
		{
			label: 'Issue',
			value: publication.issue ?? '',
			condition: publication.type === 'article' || publication.type === 'special-issue'
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

	// Define static links within the component if they don't depend on `data`
	const staticLinks = {
		'Mining the Islam West Africa Collection': `${base}/research/mining-the-islam-west-africa-collection`,
		'Muslim Minorities in Southern Cities (Benin & Togo)': `${base}/research/muslim-minorities-southern-cities-benin-togo`,
		'Religious Activism on Campuses (Togo & Benin)': `${base}/research/religious-activism-campuses-togo-benin`
	};

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
	description={publication.abstract ||
		`Details about ${publication.title} by ${publication.authors?.join(', ')}`}
	keywords={[
		'publication',
		publication.type,
		...(publication.tags || []),
		...(publication.authors || []),
		'Islam',
		'West Africa',
		'Frédérick Madore'
	].join(', ')}
	ogImage={`${base}/${publication.image}`}
	includeCitationAuthor={false}
/>

<MetaTags {publication} />

<div class="container mx-auto py-8 px-4">
	<article
		class="publication-article rounded-lg p-6 mb-8"
		use:scrollAnimate={{ delay: 100, animationClass: 'fade-in-up' }}
	>
		<!-- Use the Breadcrumb component -->
		<Breadcrumb items={breadcrumbItems} />

		<PageHeader
			title={publication.title}
			date={publication.date}
			typeBadgeText={getTypeBadgeText(publication.type)}
			authors={publication.authors}
		/>

		<!-- Use the new HeroImageDisplay component -->
		<div use:scrollAnimate={{ delay: 200, animationClass: 'fade-in-up' }}>
			<HeroImageDisplay
				heroImage={publication.heroImage}
				fallbackImage={publication.image}
				defaultAlt={publication.title}
				imageClass="w-full max-w-md h-auto rounded-md mx-auto"
				figcaptionClass="text-text-muted text-sm mt-2 italic text-center"
			/>
		</div>

		<!-- Use the new AbstractSection component -->
		<div use:scrollAnimate={{ delay: 300, animationClass: 'fade-in-up' }}>
			<AbstractSection abstract={publication.abstract} />
		</div>

		<!-- Use the new DetailsGrid component -->
		<div use:scrollAnimate={{ delay: 400, animationClass: 'fade-in-up' }}>
			<DetailsGrid details={publicationDetails} />
		</div>

		<!-- Table of Contents Section -->
		{#if (publication.type === 'book' || publication.type === 'special-issue') && publication.tableOfContents && publication.tableOfContents.length > 0}
			<div use:scrollAnimate={{ delay: 500, animationClass: 'fade-in-up' }}>
				<section class="table-of-contents-section">
					<h2 class="toc-title">Table of Contents</h2>
					<ol class="toc-list">
						{#each publication.tableOfContents as item, index}
							<li class="toc-item">
								<span class="toc-number">{index + 1}.</span>
								<span class="toc-content">{item}</span>
							</li>
						{/each}
					</ol>
				</section>
			</div>
		{/if}

		<!-- Use the new TagList component -->
		<div use:scrollAnimate={{ delay: 600, animationClass: 'fade-in-up' }}>
			<TagList tags={publication.tags} baseUrl="/publications?tag=" />
		</div>

		<!-- Container for Action Links and Export Button -->
		<div
			class="publication-actions flex flex-wrap items-center gap-4"
			use:scrollAnimate={{ delay: 700, animationClass: 'fade-in-up' }}
		>
			<!-- ActionLinks component -->
			<ActionLinks
				primaryUrl={publication.url}
				primaryLabel="Access Publication"
				additionalUrls={publication.additionalUrls}
				sectionClass=""
				primaryDivClass=""
			/>

			<!-- Export BibTeX Button -->
			<div>
				<button onclick={downloadBibtex} class="btn btn-primary cursor-pointer">
					Export BibTeX
				</button>
			</div>

			<!-- Export RIS Button - REMOVED -->
			<!--
            <div>
                <button 
                    onclick={downloadRis} 
                    class="btn btn-primary cursor-pointer"
                >
                    Export RIS
                </button>
            </div>
            -->
		</div>
	</article>

	<!-- Use the Reviews component -->
	<div use:scrollAnimate={{ delay: 800, animationClass: 'fade-in-up' }}>
		<Reviews reviewedBy={publication.reviewedBy} />
	</div>

	<!-- Use the CitedBy component -->
	<div use:scrollAnimate={{ delay: 900, animationClass: 'fade-in-up' }}>
		<CitedBy citedBy={publication.citedBy} />
	</div>

	<!-- Use the RelatedItemsList organism -->
	{#if publication.project}
		<div use:scrollAnimate={{ delay: 1000, animationClass: 'fade-in-up' }}>
			<RelatedItemsList
				allItems={allPublications}
				currentItemId={publication.id}
				filterKey="project"
				filterValue={publication.project}
				title="More Publications in this Project"
				itemComponent={RelatedItemCard as unknown as ComponentType}
				baseItemUrl="/publications/"
				maxItems={3}
			/>
		</div>
	{/if}
</div>

<style>
	/* Enhanced styles for main article container with glassmorphism integration */
	.publication-article {
		/* Sophisticated glassmorphism effect matching other components */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.04) 0%,
			rgba(var(--color-highlight-rgb), 0.025) 35%,
			rgba(var(--color-accent-rgb), 0.02) 65%,
			var(--color-surface) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 10px));
		backdrop-filter: blur(var(--glass-blur-fallback, 10px));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low, 0.1));
		box-shadow: var(--shadow-lg);
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
		position: relative;
		overflow: hidden;
	}

	/* Enhanced hover effect */
	.publication-article:hover {
		transform: var(--transform-lift-sm, translateY(-2px));
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 35%,
			rgba(var(--color-accent-rgb), 0.03) 65%,
			var(--color-surface) 100%
		);
		box-shadow: var(--shadow-xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
	}

	/* Subtle inner highlight for depth */
	.publication-article::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		background: linear-gradient(
			180deg,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.08) 0%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 40%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 60%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.08) 100%
		);
		mix-blend-mode: overlay;
		opacity: 0.3;
	}

	/* Table of Contents Section - Enhanced styling */
	.table-of-contents-section {
		margin: var(--spacing-8) 0;
		padding: var(--spacing-6);
		border-radius: var(--border-radius-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.03) 0%,
			rgba(var(--color-primary-rgb), 0.02) 50%,
			rgba(var(--color-highlight-rgb), 0.015) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), var(--opacity-low, 0.08));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.table-of-contents-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.05) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-highlight-rgb), 0.025) 100%
		);
		box-shadow: var(--shadow-md);
	}

	.toc-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-4);
		line-height: var(--line-height-tight);
		position: relative;
	}

	.toc-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--spacing-2));
		left: 0;
		width: var(--spacing-12);
		height: var(--border-width-medium, 2px);
		background: linear-gradient(
			90deg,
			var(--color-accent) 0%,
			rgba(var(--color-accent-rgb), 0.3) 100%
		);
		border-radius: var(--border-radius-full);
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
		counter-reset: toc-counter;
	}

	.toc-item {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-3);
		padding: var(--spacing-3) 0;
		border-bottom: var(--border-width-thin) solid rgba(var(--color-accent-rgb), 0.1);
		transition: all var(--anim-duration-fast, 0.2s) var(--anim-ease-out, ease-out);
	}

	.toc-item:last-child {
		border-bottom: none;
	}

	.toc-item:hover {
		background: rgba(var(--color-accent-rgb), 0.02);
		padding-left: var(--spacing-2);
		border-radius: var(--border-radius-sm);
	}

	.toc-number {
		counter-increment: toc-counter;
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		min-width: var(--spacing-6);
	}

	.toc-content {
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text);
		flex: 1;
	}

	/* Dark mode refinements */
	:global(html.dark) .publication-article {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.7) 0%,
			rgba(var(--color-primary-rgb), 0.15) 35%,
			rgba(var(--color-accent-rgb), 0.1) 65%,
			var(--color-dark-surface, #334155) 100%
		);
	}

	:global(html.dark) .publication-article:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.8) 0%,
			rgba(var(--color-primary-rgb), 0.2) 35%,
			rgba(var(--color-accent-rgb), 0.15) 65%,
			var(--color-dark-surface, #334155) 100%
		);
	}

	:global(html.dark) .table-of-contents-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.5) 0%,
			rgba(var(--color-accent-rgb), 0.1) 50%,
			rgba(var(--color-primary-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.08);
	}

	:global(html.dark) .toc-item {
		border-bottom-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.05);
	}

	:global(html.dark) .toc-item:hover {
		background: rgba(var(--color-accent-rgb), 0.05);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.table-of-contents-section {
			padding: var(--spacing-4);
		}

		.toc-title {
			font-size: var(--font-size-lg);
		}

		.toc-item {
			padding: var(--spacing-2) 0;
		}

		.toc-number,
		.toc-content {
			font-size: var(--font-size-xs);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.publication-article,
		.publication-article:hover,
		.table-of-contents-section,
		.table-of-contents-section:hover,
		.toc-item,
		.toc-item:hover {
			transition: none;
			transform: none;
		}
	}

	/* Publication actions container styling - enhanced for better visual integration */
	.publication-actions {
		margin-top: var(--spacing-8);
		padding: var(--spacing-4) var(--spacing-6);
		border-radius: var(--border-radius-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), 0.025) 0%,
			rgba(var(--color-primary-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.015) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		border: var(--border-width-thin) solid
			rgba(var(--color-highlight-rgb), var(--opacity-low, 0.08));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base) var(--anim-ease-out);
	}

	.publication-actions:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), 0.04) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.025) 100%
		);
		box-shadow: var(--shadow-md);
	}

	/* Enhanced styling for export buttons within the actions container */
	.publication-actions .btn {
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 4px));
		backdrop-filter: blur(var(--glass-blur-fallback, 4px));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low, 0.1));
		position: relative;
		overflow: hidden;
	}

	.publication-actions .btn::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			45deg,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.05) 0%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 50%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.05) 100%
		);
		opacity: 0;
		transition: opacity var(--anim-duration-fast) var(--anim-ease-out);
	}

	.publication-actions .btn:hover::before {
		opacity: 1;
	}

	/* Dark mode adjustments for publication actions */
	:global(html.dark) .publication-actions {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.5) 0%,
			rgba(var(--color-highlight-rgb), 0.08) 50%,
			rgba(var(--color-primary-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.08);
	}

	:global(html.dark) .publication-actions:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.6) 0%,
			rgba(var(--color-highlight-rgb), 0.12) 50%,
			rgba(var(--color-primary-rgb), 0.08) 100%
		);
	}

	/* Responsive adjustments for actions */
	@media (max-width: 640px) {
		.publication-actions {
			padding: var(--spacing-3) var(--spacing-4);
			margin-top: var(--spacing-6);
		}
	}

	/* Motion preferences for actions */
	@media (prefers-reduced-motion: reduce) {
		.publication-actions,
		.publication-actions:hover,
		.publication-actions .btn::before {
			transition: none;
		}
	}
</style>
