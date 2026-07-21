<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import MetaTags from '$lib/components/digital-humanities/MetaTags.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
	import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';

	import { base, resolve } from '$app/paths';

	import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

	// Define the type for project details items
	type ProjectDetailItem = {
		label: string;
		value: string | string[];
		link?: string;
		condition?: boolean;
	};

	let { data } = $props<{ data: { project: DigitalHumanitiesProject } }>();
	let project = $derived(data.project);
	const jsonLdString = $derived(data.jsonLdString as string | undefined);

	// Breadcrumbs
	let breadcrumbItems = $derived([
		{ label: 'Digital Humanities', href: `${base}/digital-humanities` },
		{ label: project.title, href: `${base}/digital-humanities/${project.id}` }
	]);

	// JSON-LD for Breadcrumbs - uses reusable utility
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-dh-project');

	// Inject project JSON-LD structured data
	useJsonLdScript('dh-project-json-ld', () => jsonLdString);

	// Prepare details for DetailsGrid
	const projectDetails: ProjectDetailItem[] = [
		// Example of adding another detail:
		// { label: 'Project Lead', value: project.leadName, condition: !!project.leadName },
	];
</script>

<SEO
	title={project.seoTitle || `${project.title} | Digital Humanities | Frédérick Madore`}
	description={project.seoDescription || project.shortDescription}
	keywords={project.seoKeywords?.join(', ') ||
		[project.title, 'Digital Humanities', 'Frédérick Madore', ...(project.skills || [])].join(', ')}
	ogImage={project.heroImageUrl ? `${base}${project.heroImageUrl}` : `${base}${project.imageUrl}`}
/>

<!-- Zotero/COinS metadata — mirrors the other detail routes' MetaTags. -->
<MetaTags {project} />

<div class="container py-8 page-enter">
	<div class="content-wrapper">
		<article class="project-detail-article max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader title={project.title} typeBadgeText="Digital Humanities" date={project.years} />

			{#if project.heroImageUrl || project.imageUrl}
				<div class="hero-image-wrapper mb-8 scroll-reveal">
					<HeroImageDisplay
						heroImage={project.heroImageUrl
							? { src: project.heroImageUrl, alt: project.title }
							: undefined}
						fallbackImage={project.imageUrl}
						defaultAlt={project.title}
						variant="featured"
						framed={false}
						fetchpriority="high"
						loading="eager"
						maxHeight="60vh"
					/>
				</div>
			{/if}

			<div class="scroll-reveal">
				<section class="content-section drop-cap">
					<!-- Safe: project.description is from trusted project data in src/lib/data/digital-humanities/ -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html project.description}
				</section>
			</div>

			<div class="scroll-reveal">
				{#if projectDetails.length > 0}
					<DetailsGrid details={projectDetails} />
				{/if}
			</div>

			<div class="scroll-reveal">
				{#if project.skills && project.skills.length > 0}
					<section class="section">
						<div class="section-head">
							<h2 class="section-title">Methods &amp; tools</h2>
						</div>
						<div class="chip-row">
							{#each project.skills as skill (skill)}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- skill filter URL -->
								<a class="chip" href="{base}/digital-humanities?skill={encodeURIComponent(skill)}"
									>{skill}</a
								>
							{/each}
						</div>
					</section>
				{/if}
			</div>

			{#if project.embeddableContent && project.embeddableContent.length > 0}
				<div class="scroll-reveal">
					<section class="embeddable-section">
						{#each project.embeddableContent as item (item.id)}
							<div class="embeddable-item">
								{#if item.showTitle && item.title}
									<h3 class="embeddable-title">{item.title}</h3>
								{/if}
								{#if item.description}
									<!-- Safe: item.description is from trusted project data -->
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									<p class="embeddable-description">{@html item.description}</p>
								{/if}

								{#if item.type === 'iframe'}
									<div class="iframe-wrapper">
										<IframeRenderer {...item} />
									</div>
								{:else if item.type === 'image'}
									{#if item.linkUrl}
										<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
										<a
											href={item.linkUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="image-link"
										>
											<img
												src={item.src}
												alt={item.alt}
												class="plate responsive-image"
												width="800"
												height="600"
												loading="lazy"
												decoding="async"
											/>
										</a>
										<!-- eslint-enable svelte/no-navigation-without-resolve -->
									{:else}
										<img
											src={item.src}
											alt={item.alt}
											class="plate responsive-image"
											width="800"
											height="600"
											loading="lazy"
											decoding="async"
										/>
									{/if}
								{/if}
							</div>
						{/each}
					</section>
				</div>
			{/if}

			<div class="scroll-reveal">
				{#if project.award}
					<section class="section apparatus-section">
						<div class="section-head">
							<h2 class="section-title">Award</h2>
						</div>
						<!-- Safe: project.award is from trusted project data -->
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<p class="apparatus-text">{@html project.award}</p>
					</section>
				{/if}
			</div>

			<div class="scroll-reveal">
				{#if project.publication}
					<section class="section apparatus-section">
						<div class="section-head">
							<h2 class="section-title">Related publication</h2>
						</div>
						<p class="apparatus-text">
							<!-- Safe: project.publication.text is from trusted project data -->
							<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
							<!-- eslint-disable svelte/no-at-html-tags -->
							<a
								href={project.publication.url}
								target="_blank"
								rel="noopener noreferrer"
								class="link">{@html project.publication.text}</a
							>
							<!-- eslint-enable svelte/no-at-html-tags -->
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</p>
					</section>
				{/if}
			</div>

			<div class="scroll-reveal">
				{#if project.reviews && project.reviews.length > 0}
					<section class="section apparatus-section">
						<div class="section-head">
							<h2 class="section-title">Reviews</h2>
						</div>
						<ul class="reviews-list">
							{#each project.reviews as review (review.url)}
								<li class="review-item">
									<!-- Safe: review.text is from trusted project data -->
									<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
									<!-- eslint-disable svelte/no-at-html-tags -->
									<a
										href={review.url}
										target="_blank"
										rel="noopener noreferrer"
										class="link font-medium">{@html review.text}</a
									>
									<!-- eslint-enable svelte/no-at-html-tags -->
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
									{#if review.quote}
										<blockquote class="review-quote">
											<p>{review.quote}</p>
										</blockquote>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			</div>
		</article>
	</div>

	<!-- Back link — quiet editorial text link, left-aligned like the
	     header back-links on other detail pages. -->
	<div class="mt-8 max-w-6xl mx-auto">
		<a href={resolve('/digital-humanities')} class="back-to-index">
			← Back to Digital Humanities projects
		</a>
	</div>
</div>

<style>
	/* Back link — mono data-voice affordance matching the header back-link. */
	.back-to-index {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--color-text-light);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.back-to-index:hover {
		color: var(--color-accent);
	}

	.back-to-index:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/* Article container - consistent with activity and research pages */
	.project-detail-article {
		position: relative;
	}

	/* Content section — prose on paper, no tile. The drop-cap idiom opens it. */
	.content-section {
		margin-bottom: var(--space-xl);
	}

	.content-section :global(p) {
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
	}

	.content-section :global(p:last-child) {
		margin-bottom: 0;
	}

	/* Lead paragraph — slightly larger, full-ink colour; the drop-cap on the
	 * section carries the opening flourish. */
	.content-section :global(p:first-child) {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-relaxed);
	}

	.content-section :global(a) {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.content-section :global(a:hover) {
		color: var(--color-accent-dark);
		/* No text-decoration needed - typography.css handles animated underlines */
	}

	/* Ensure buttons maintain their proper colors */
	.content-section :global(.btn) {
		color: inherit;
	}

	.content-section :global(.btn-primary) {
		color: var(--color-white);
	}

	.content-section :global(.btn-primary:hover) {
		color: var(--color-white);
		text-decoration: none;
	}

	/* Embeddable content section */
	.embeddable-section {
		margin-bottom: var(--space-xl);
		margin-top: var(--space-2xl);
	}

	.embeddable-item {
		margin-bottom: var(--space-2xl);
	}

	.embeddable-item:last-child {
		margin-bottom: 0;
	}

	.embeddable-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-xl);
		font-weight: 720;
		letter-spacing: -0.01em;
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-sm);
		line-height: var(--line-height-tight);
	}

	.embeddable-description {
		font-family: var(--font-family-serif);
		color: var(--color-text-soft);
		margin-bottom: var(--space-md);
		line-height: var(--line-height-relaxed);
	}

	/* The iframe carries its own toolbar chrome; no tile wrapper needed. */
	.iframe-wrapper {
		margin: var(--space-lg) 0;
	}

	/* Image plate — a documentary scan set flat and square (.plate idiom).
	 * The link (when present) opens the larger view; the plate does not lift. */
	.responsive-image {
		max-width: 100%;
		height: auto;
	}

	.image-link {
		display: block;
	}

	/* Apparatus sections — award / publication / reviews. Serif prose under a
	 * §-numbered section rule; no tile, no glass. */
	.apparatus-text {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0;
		max-width: 66ch;
	}

	.apparatus-text :global(a),
	.reviews-list :global(a.link) {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
	}

	.apparatus-text :global(a:hover),
	.reviews-list :global(a.link:hover) {
		color: var(--color-accent-dark);
	}

	/* Reviews list */
	.reviews-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.review-item {
		font-family: var(--font-family-serif);
		padding: var(--space-md) 0;
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	.review-item:first-child {
		border-top: none;
		padding-top: 0;
	}

	/*
	 * Review quote — indented italic pull-quote with a leading quote glyph.
	 */
	.review-quote {
		margin: var(--space-sm) 0 0 var(--space-md);
		padding: var(--space-2xs) 0 var(--space-2xs) var(--space-md);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		font-family: var(--font-family-serif);
		line-height: var(--line-height-relaxed);
		position: relative;
	}

	.review-quote::before {
		content: '\201C';
		position: absolute;
		left: calc(-1 * var(--space-xs));
		top: calc(-1 * var(--space-2xs));
		font-size: var(--font-size-2xl);
		color: color-mix(in srgb, var(--color-accent) 45%, transparent);
		font-family: var(--font-family-serif);
		line-height: 1;
	}

	/* Responsive adjustments */
	@media (--sm) {
		.embeddable-title {
			font-size: var(--font-size-2xl);
		}
	}
</style>
