<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import EntityDetailLayout from '$lib/components/common/EntityDetailLayout.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	// Added imports for consistency
	import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';
	import {
		createActivitySEODescription,
		createActivitySEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { formatPanelType } from '$lib/utils/typeUtils';
	import MetaTags from '$lib/components/activities/MetaTags.svelte';

	// Get data from the load function
	let { data }: { data: PageData } = $props();
	const activity = $derived(data.activity);
	const jsonLdString = $derived(data.jsonLdString);

	// Generate optimized SEO data for blog-style activity pages
	const seoDescription = $derived(createActivitySEODescription(activity));
	const seoKeywords = $derived(createActivitySEOKeywords(activity));

	// Define breadcrumb items - reactive to activity changes
	const breadcrumbItems = $derived([
		{ label: 'Activities', href: `${base}/activities` },
		{ label: truncateTitle(activity.title), href: `${base}/activities/${activity.id}` }
	]);

	// Breadcrumb + activity JSON-LD injection is handled by EntityDetailLayout.

	// Optimize animations for better performance
	$effect(() => {
		if (browser) {
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
		}
	});

	// Format the tags for display - using optional chaining for cleaner syntax
	const formattedTags = $derived(activity?.tags ?? []);

	// Hero image preload as a string. Using {@html} instead of {#if} inside
	// <svelte:head> avoids a Svelte 5 hydration bug where falsy {#if} blocks
	// in the head leave a marker the client cannot walk (TypeError reading
	// 'nodeType' of null in if.js). Source values come from trusted .ts files
	// in src/lib/data/activities, so direct interpolation is safe here.
	const heroImagePreloadHtml = $derived(
		activity?.heroImage?.src
			? `<link rel="preload" href="${encodeURI(`${base}/${activity.heroImage.src}`)}" as="image" fetchpriority="high">`
			: ''
	);

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
	<!-- Font preconnects are global in app.html; no per-route duplicates. -->

	<!-- Conditional preload of hero image if it exists to improve LCP. -->
	<!-- See heroImagePreloadHtml in <script> for why this uses {@html}. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html heroImagePreloadHtml}
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
	<EntityDetailLayout
		{breadcrumbItems}
		jsonLdScriptId="activity-json-ld"
		{jsonLdString}
		title={activity.title}
		date={activity.date}
		typeBadgeText={formatPanelType(activity.panelType)}
		wrapperClass="content-wrapper max-w-6xl mx-auto"
	>
		{#snippet children({ breadcrumb, header })}
			{#if activity}
				<!-- Separate page header section - no animation to prevent flash -->
				<div>
					{@render breadcrumb()}
				</div>

				<div>
					{@render header()}
				</div>

				{#if activity.heroImage && activity.heroImage.src}
					<div class="hero-image-wrapper mb-8 scroll-reveal">
						<HeroImageDisplay
							heroImage={{
								src: activity.heroImage.src,
								alt: activity.heroImage.alt ?? activity.title,
								caption: activity.heroImage.caption
							}}
							fallbackImage={activity.image}
							defaultAlt={activity.title}
							variant="featured"
							framed={true}
							fetchpriority="high"
							loading="eager"
							maxHeight="60vh"
						/>
					</div>
				{/if}

				<!-- Main content (prose on paper, no card wrapper) -->
				<div class="scroll-reveal">
					<ContentBody variant="default">
						<!-- Render parsed content segments -->
						{#each contentSegments as segment, segmentIndex (segmentIndex)}
							{#if segment.type === 'html'}
								<!-- Safe: content is from trusted activity data files in src/lib/data/activities/ -->
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html segment.value}
							{:else if segment.type === 'ItemReference' && segment.id}
								<ItemReference id={segment.id} />
							{/if}
						{/each}
					</ContentBody>
				</div>

				{#if activity.url || (activity.additionalUrls && activity.additionalUrls.length > 0)}
					<div class="scroll-reveal">
						<ActionLinks
							primaryUrl={activity.url}
							primaryLabel={activity.urlLabel ??
								(activity.panelType === 'publication' ? 'Read Publication' : 'Visit Activity')}
							additionalUrls={activity.additionalUrls}
							sectionClass="action-links mt-4"
							primaryButtonClass="btn btn-primary"
							secondaryButtonClass="btn btn-outline-primary"
							primaryDivClass="mb-4"
						/>
					</div>
				{/if}

				{#if activity.pdfPath}
					<div class="pdf-section mt-4 p-6 md:p-8 scroll-reveal">
						<h2 class="pdf-section-title editorial-section-title">
							{activity.pdfTitle || 'Associated Document'}
						</h2>
						<IframeRenderer
							id="activity-pdf-{activity.id}"
							src="{base}/{activity.pdfPath}"
							title="{activity.title} PDF Document"
							height="800px"
							containerClass="iframe-container iframe-container-fullwidth"
							framed={false}
						/>
					</div>
				{/if}

				{#if formattedTags && formattedTags.length > 0}
					<div class="mt-4 mb-6 scroll-reveal">
						<TagList tags={formattedTags} baseUrl="/activities?tag=" />
					</div>
				{/if}

				<!-- RSS Feed Button -->
				<div class="rss-button-wrapper scroll-reveal">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- static asset -->
					<a href="{base}/rss.xml" class="rss-feed-button">
						<Icon icon="mdi:rss" width="16" height="16" aria-hidden="true" />
						RSS Feed
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			{/if}
		{/snippet}
	</EntityDetailLayout>
{/if}

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
		border-radius: 0;
	}

	@media (--md) {
		:global(.hero-image-wrapper .hero-image) {
			max-width: 600px;
			max-height: auto;
		}
	}

	@media (--lg) {
		:global(.hero-image-wrapper .hero-image) {
			max-width: 800px;
		}
	}

	/* PDF callout — a flat paper document plate: hairline border, square
		 * corners, no shadow, no hover lift. It's an enclosure, not an
		 * affordance. */
	.pdf-section {
		position: relative;
		content-visibility: auto;
		contain-intrinsic-size: 800px;
		border-radius: 0;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
	}

	.pdf-section-title {
		margin-top: 0;
	}

	/* RSS Feed Button — the data voice: a flat square mono chip. */
	.rss-button-wrapper {
		margin-top: var(--space-4);
	}

	.rss-feed-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1-5) var(--space-2-5);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		color: var(--color-text-soft);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.rss-feed-button:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.rss-feed-button:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-0-5);
	}

	@media (prefers-reduced-motion: reduce) {
		.rss-feed-button {
			transition: none;
		}
	}
</style>
