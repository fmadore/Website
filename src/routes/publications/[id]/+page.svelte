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
			let breadcrumbScriptElement = document.getElementById(breadcrumbScriptId) as HTMLScriptElement | null;

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
					if (breadcrumbScriptToRemove && breadcrumbScriptToRemove.parentElement === document.head) {
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
			link: publication.project && (projectMappings as Record<string, string>)[publication.project]
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
/>

<MetaTags {publication} />

<div class="container mx-auto py-8 px-4">
	<article class="publication-article rounded-lg p-6 mb-8">
		<!-- Use the Breadcrumb component -->
		<Breadcrumb items={breadcrumbItems} />

		<PageHeader
			title={publication.title}
			date={publication.date}
			typeBadgeText={getTypeBadgeText(publication.type)}
			authors={publication.authors}
		/>

		<!-- Use the new HeroImageDisplay component -->
		<HeroImageDisplay
			heroImage={publication.heroImage}
			fallbackImage={publication.image}
			defaultAlt={publication.title}
			imageClass="w-full max-w-md h-auto rounded-md mx-auto"
			figcaptionClass="text-text-muted text-sm mt-2 italic text-center"
		/>

		<!-- Use the new AbstractSection component -->
		<AbstractSection abstract={publication.abstract} />

		<!-- Use the new DetailsGrid component -->
		<DetailsGrid details={publicationDetails} />

		<!-- Table of Contents Section -->
		{#if (publication.type === 'book' || publication.type === 'special-issue') && publication.tableOfContents && publication.tableOfContents.length > 0}
			<section class="mt-8 mb-8">
				<h2 class="text-xl font-semibold mb-4 text-text-headings">Table of Contents</h2>
				<ul class="list-disc list-inside space-y-3 text-text-base pl-4">
					{#each publication.tableOfContents as item}
						<li>{item}</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Use the new TagList component -->
		<TagList tags={publication.tags} baseUrl="/publications?tag=" />

		<!-- Container for Action Links and Export Button -->
		<div class="mt-8 flex flex-wrap items-center gap-4">
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
                    on:click={downloadRis} 
                    class="btn btn-primary cursor-pointer"
                >
                    Export RIS
                </button>
            </div>
            -->
		</div>
	</article>

	<!-- Use the Reviews component -->
	<Reviews reviewedBy={publication.reviewedBy} />

	<!-- Use the CitedBy component -->
	<CitedBy citedBy={publication.citedBy} />

	<!-- Use the RelatedItemsList organism -->
	{#if publication.project}
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
	{/if}
</div>

<style>
	/* Theme styles for main article container */
	.publication-article {
		background-color: var(--color-background);
		box-shadow: var(--shadow-md);
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	/* Add styles for the table of contents if needed, e.g., spacing, list style */
	/* Styles are mostly handled by utility classes above */

	/* Related item styles are now in RelatedItemCard.svelte */
</style>
