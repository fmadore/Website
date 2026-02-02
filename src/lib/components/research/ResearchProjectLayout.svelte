<!--
ResearchProjectLayout - Shared layout for research project pages

Provides consistent structure for all research project pages including:
- SEO metadata
- Breadcrumb navigation with JSON-LD
- Page header with title
- Project years
- Image banner
- Content area (via snippet)
- Optional audio player
- Related publications and communications
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import ProjectImageBanner from '$lib/components/common/ProjectImageBanner.svelte';
	import ProjectYears from '$lib/components/common/ProjectYears.svelte';
	import MediaPlayer from '$lib/components/media/MediaPlayer.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { base } from '$app/paths';

	interface Props {
		/** Full title displayed in the page header */
		title: string;
		/** Short title for breadcrumb navigation */
		shortTitle: string;
		/** URL slug (e.g., 'dh-ai-african-studies') */
		slug: string;
		/** Project years (e.g., '2025-' or '2021-2024') */
		years: string;
		/** Image path relative to /images/research/ */
		imageSrc: string;
		/** Alt text for the image */
		imageAlt: string;
		/** SEO description (optional, defaults to title-based) */
		seoDescription?: string;
		/** SEO keywords (optional) */
		seoKeywords?: string;
		/** Audio source path for podcast (optional) */
		audioSrc?: string;
		/** Project name for filtering related content */
		projectName: string;
		/** Content snippet for the main body */
		children: Snippet;
	}

	let {
		title,
		shortTitle,
		slug,
		years,
		imageSrc,
		imageAlt,
		seoDescription,
		seoKeywords,
		audioSrc,
		projectName,
		children
	}: Props = $props();

	// Build breadcrumb items
	const breadcrumbItems = $derived([
		{ label: 'Research', href: `${base}/research` },
		{ label: shortTitle, href: `${base}/research/${slug}` }
	]);

	// Inject breadcrumb JSON-LD structured data
	useBreadcrumbJsonLd(() => breadcrumbItems);
</script>

<SEO
	title="{title} | Frédérick Madore"
	description={seoDescription}
	keywords={seoKeywords}
/>

<div class="container py-8 page-enter">
	<div class="content-wrapper">
		<div class="main-content max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader {title} />

			<div class="mb-6">
				<ProjectYears {years} />
			</div>

			<div class="scroll-reveal">
				<ProjectImageBanner
					src="{base}/images/research/{imageSrc}"
					alt={imageAlt}
					glassEffect="glass-medium"
					overlayIntensity="medium"
				/>
			</div>

			<div class="scroll-reveal">
				<ContentBody variant="default" glassEffect="glass-card">
					{@render children()}
				</ContentBody>
			</div>

			{#if audioSrc}
				<div class="scroll-reveal">
					<MediaPlayer
						src="{base}/{audioSrc}"
						type="audio"
						title="Google NotebookLM Podcast Discussion"
						glassEffect="glass-card"
						showControls={true}
					/>
				</div>
			{/if}
		</div>

		<div class="related-content mt-16 max-w-6xl mx-auto scroll-reveal">
			<RelevantPublications {projectName} limit={6} />
			<div class="mt-12">
				<RelevantCommunications {projectName} limit={6} />
			</div>
		</div>
	</div>
</div>
