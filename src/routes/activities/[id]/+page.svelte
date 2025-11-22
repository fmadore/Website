<script lang="ts">
	import { page } from '$app/stores';
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import type { PageData } from './$types';
	import { browser } from '$app/environment';

	// Animation imports following home page pattern
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

	// Added imports for consistency
	import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';
	import { createActivitySEODescription, createActivitySEOKeywords } from '$lib/utils/seoUtils';
	import MetaTags from '$lib/components/activities/MetaTags.svelte';

	// Get data from the load function
	let { data }: { data: PageData } = $props();
	const activity = $derived(data.activity);
	const jsonLdString = $derived(data.jsonLdString);

	// Generate optimized SEO data for blog-style activity pages
	const seoDescription = $derived(createActivitySEODescription(activity));
	const seoKeywords = $derived(createActivitySEOKeywords(activity));

	// Helper function to truncate title at the first colon (copied from publications page)
	function truncateTitle(title: string): string {
		const colonIndex = title.indexOf(':');
		return colonIndex > -1 ? title.substring(0, colonIndex) + '...' : title;
	}

	// Define breadcrumb items - reactive to activity changes
	const breadcrumbItems = $derived([
		{ label: 'Activities', href: `${base}/activities` },
		{ label: truncateTitle(activity.title), href: `${base}/activities/${activity.id}` }
	]);

	// Generate Breadcrumb JSON-LD - reactive to breadcrumb changes
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
	);

	// Helper function to format panelType for display
	function formatPanelType(panelType: string | undefined): string {
		if (!panelType) return '';
		return panelType.charAt(0).toUpperCase() + panelType.slice(1);
	}

	const activityJsonLdScriptId = 'activity-json-ld';
	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

	// Replace onMount and onDestroy with $effect for JSON-LD management and optimizations
	$effect(() => {
		if (browser) {
			// Optimize animations for better performance - WITHOUT contain property that breaks z-index
			const optimizeAnimations = () => {
				const animatedElements = document.querySelectorAll('[data-animate]');
				animatedElements.forEach((el) => {
					const element = el as HTMLElement;
					element.style.willChange = 'transform, opacity';
					element.style.transform = 'translateZ(0)';
					// DO NOT add contain property - it creates stacking context issues with mobile menu
				});
			};

			// Use requestIdleCallback for better performance
			if ('requestIdleCallback' in window) {
				window.requestIdleCallback(optimizeAnimations);
			} else {
				setTimeout(optimizeAnimations, 0);
			}

			// Handle activity JSON-LD script
			const activityScriptId = activityJsonLdScriptId;
			let activityScript = document.getElementById(activityScriptId) as HTMLScriptElement | null;

			if (jsonLdString) {
				if (activityScript) {
					activityScript.textContent = jsonLdString;
				} else {
					activityScript = document.createElement('script');
					activityScript.id = activityScriptId;
					activityScript.type = 'application/ld+json';
					activityScript.textContent = jsonLdString;
					document.head.appendChild(activityScript);
				}
			} else if (activityScript && activityScript.parentElement === document.head) {
				document.head.removeChild(activityScript);
			}

			// Handle breadcrumb JSON-LD script
			const breadcrumbScriptId = breadcrumbJsonLdScriptId;
			let breadcrumbScript = document.getElementById(
				breadcrumbScriptId
			) as HTMLScriptElement | null;

			if (breadcrumbJsonLdString) {
				if (breadcrumbScript) {
					breadcrumbScript.textContent = breadcrumbJsonLdString;
				} else {
					breadcrumbScript = document.createElement('script');
					breadcrumbScript.id = breadcrumbScriptId;
					breadcrumbScript.type = 'application/ld+json';
					breadcrumbScript.textContent = breadcrumbJsonLdString;
					document.head.appendChild(breadcrumbScript);
				}
			} else if (breadcrumbScript && breadcrumbScript.parentElement === document.head) {
				document.head.removeChild(breadcrumbScript);
			}

			// Cleanup function
			return () => {
				if (browser) {
					const activityScriptToRemove = document.getElementById(activityScriptId);
					if (activityScriptToRemove && activityScriptToRemove.parentElement === document.head) {
						document.head.removeChild(activityScriptToRemove);
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

	// Format the tags for display - using optional chaining for cleaner syntax
	const formattedTags = $derived(activity?.tags ?? []);

	// --- Content Parsing Logic (Keep as is, uses activity from data) ---
	interface ContentSegment {
		type: 'html' | 'ItemReference';
		value?: string; // For html type
		id?: string; // For ItemReference type
	}
	const contentSegments = $derived(
		activity?.content
			? (() => {
					const rawContent = activity.content.replace(/href="\/([^/])/g, `href="${base}/$1`);
					const regex = /<ItemReference\s+id="([^"]+)"\s*>/g;
					const segments: ContentSegment[] = [];
					let lastIndex = 0;
					let match;

					while ((match = regex.exec(rawContent)) !== null) {
						if (match.index > lastIndex) {
							segments.push({ type: 'html', value: rawContent.substring(lastIndex, match.index) });
						}
						segments.push({ type: 'ItemReference', id: match[1] });
						lastIndex = regex.lastIndex;
					}
					if (lastIndex < rawContent.length) {
						segments.push({ type: 'html', value: rawContent.substring(lastIndex) });
					}
					return segments;
				})()
			: []
	);
	// --- End Content Parsing Logic ---
</script>

<svelte:head>
	<!-- Preconnect to improve performance -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />

	<!-- Conditional preload of hero image if it exists to improve LCP -->
	{#if activity?.heroImage?.src}
		<link rel="preload" href="{base}/{activity.heroImage.src}" as="image" fetchpriority="high" />
	{/if}
</svelte:head>

<!-- SEO Component with blog post optimizations -->
<SEO
	title={activity.title}
	description={seoDescription}
	keywords={seoKeywords}
	type="article"
	ogImage={activity.heroImage?.src
		? `${base}/${activity.heroImage.src}`
		: `${base}/images/Profile-picture.webp`}
/>

<!-- MetaTags Component for Zotero blog post detection -->
<MetaTags {activity} />

{#if activity}
	<div class="container py-8">
		<div class="content-wrapper max-w-6xl mx-auto">
			{#if activity}
				<!-- Separate page header section - no animation to prevent flash -->
				<div>
					<Breadcrumb items={breadcrumbItems} />
				</div>

				<div>
					<PageHeader
						title={activity.title}
						date={activity.date}
						typeBadgeText={formatPanelType(activity.panelType)}
					/>
				</div>

				{#if activity.heroImage && activity.heroImage.src}
					<div class="hero-image-wrapper mb-8">
						<HeroImageDisplay
							heroImage={{
								src: activity.heroImage.src,
								alt: activity.heroImage.alt ?? activity.title,
								caption: activity.heroImage.caption
							}}
							fallbackImage={activity.image}
							defaultAlt={activity.title}
							variant="featured"
							glassEffect={true}
							fetchpriority="high"
							loading="eager"
							maxHeight="60vh"
						/>
					</div>
				{/if}

				<!-- Main content card -->
				<div data-animate use:scrollAnimate={{ delay: DELAY_STEP, animationClass: 'fade-in-up' }}>
					<ContentBody variant="default" glassEffect="glass-card">
						<!-- Render parsed content segments -->
						{#each contentSegments as segment, segmentIndex (segmentIndex)}
							{#if segment.type === 'html'}
								<!-- Safe: content is from trusted activity data files in src/lib/data/activities/ -->
								{@html segment.value}
							{:else if segment.type === 'ItemReference' && segment.id}
								<ItemReference id={segment.id} />
							{/if}
						{/each}
					</ContentBody>
				</div>

				{#if activity.url || (activity.additionalUrls && activity.additionalUrls.length > 0)}
					<div
						data-animate
						use:scrollAnimate={{ delay: DELAY_STEP * 2, animationClass: 'fade-in-up' }}
					>
						<ActionLinks
							primaryUrl={activity.url}
							primaryLabel="Visit Activity"
							additionalUrls={activity.additionalUrls}
							sectionClass="action-links mt-4"
							primaryButtonClass="btn btn-primary glass-button"
							secondaryButtonClass="btn btn-outline-primary glass-button"
							primaryDivClass="mb-4"
						/>
					</div>
				{/if}

				{#if activity.pdfPath}
					<div
						class="pdf-section glass-card mt-4 p-6 md:p-8"
						data-animate
						use:scrollAnimate={{ delay: DELAY_STEP * 3, animationClass: 'fade-in-up' }}
					>
						<h2 class="text-xl font-serif font-semibold mb-4 text-emphasis">
							{activity.pdfTitle || 'Associated Document'}
						</h2>
						<IframeRenderer
							id="activity-pdf-{activity.id}"
							src="{base}/{activity.pdfPath}"
							title="{activity.title} PDF Document"
							height="800px"
							containerClass="iframe-container iframe-container-fullwidth"
							glassEffect={true}
							glassVariant="glass-light"
						/>
					</div>
				{/if}

				{#if formattedTags && formattedTags.length > 0}
					<div
						class="mt-4 mb-6"
						data-animate
						use:scrollAnimate={{ delay: DELAY_STEP * 4, animationClass: 'fade-in-up' }}
					>
						<TagList tags={formattedTags} baseUrl="/activities?tag=" />
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<style>
		/* Hero image wrapper - ensure it doesn't interfere with modal stacking */
		.hero-image-wrapper {
			position: relative;
			z-index: auto; /* Ensure no stacking context issues */
			isolation: auto; /* Prevent isolation that could interfere with modal */
		}

		/* Responsive hero image optimization */
		:global(.hero-image-wrapper .hero-image) {
			width: 100%;
			height: auto;
			max-width: 330px; /* Match the displayed dimensions from PageSpeed Insights */
			max-height: 438px;
			object-fit: cover;
			border-radius: var(--border-radius-lg);
		}

		@media (min-width: 768px) {
			:global(.hero-image-wrapper .hero-image) {
				max-width: 600px;
				max-height: auto;
			}
		}

		@media (min-width: 1024px) {
			:global(.hero-image-wrapper .hero-image) {
				max-width: 800px;
			}
		}

		/* PDF section styling with glassmorphism */
		.pdf-section {
			position: relative;
			content-visibility: auto;
			contain-intrinsic-size: 800px;
			border-radius: var(--border-radius-xl);
			transition: transform var(--transition-duration-300) var(--transition-timing-ease);
			box-shadow: var(--shadow-md);
			/* Enhanced glassmorphism with subtle gradient overlay */
			background: linear-gradient(
				135deg,
				rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
				rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
				rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
			);
		}

		/* Override h2 margin-top inside pdf-section */
		.pdf-section h2 {
			margin-top: 0;
		}

		.pdf-section:hover {
			transform: var(--transform-lift-sm);
			box-shadow: var(--shadow-lg);
			background: linear-gradient(
				135deg,
				rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
				rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
				rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
			);
		}

		/* Responsive adjustments */
		@media (max-width: 640px) {
			.pdf-section {
				padding: var(--spacing-6) !important;
			}
		}

		/* Respect user motion preferences */
		@media (prefers-reduced-motion: reduce) {
			.pdf-section {
				transition: none;
			}

			.pdf-section:hover {
				transform: none;
			}
		}
	</style>
{/if}
