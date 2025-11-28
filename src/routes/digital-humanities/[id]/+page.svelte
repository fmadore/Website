<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';

	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

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

	// Breadcrumbs
	let breadcrumbItems = $derived([
		{ label: 'Digital Humanities', href: `${base}/digital-humanities` },
		{ label: project.title, href: `${base}/digital-humanities/${project.id}` }
	]);

	// JSON-LD for Breadcrumbs
	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld-dh-project';
	let breadcrumbJsonLdString = $derived(
		$page.url && project
			? JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'BreadcrumbList',
					itemListElement: breadcrumbItems.map((item, index) => ({
						'@type': 'ListItem',
						position: index + 1,
						name: item.label,
						item: `${$page.url.origin}${item.href}`
					}))
				})
			: null
	);

	$effect(() => {
		if (browser) {
			const existingScript = document.getElementById(breadcrumbJsonLdScriptId);
			if (existingScript) {
				document.head.removeChild(existingScript);
			}

			if (breadcrumbJsonLdString) {
				const script = document.createElement('script');
				script.id = breadcrumbJsonLdScriptId;
				script.type = 'application/ld+json';
				script.textContent = breadcrumbJsonLdString;
				document.head.appendChild(script);
			}

			return () => {
				if (browser) {
					const script = document.getElementById(breadcrumbJsonLdScriptId);
					if (script) {
						document.head.removeChild(script);
					}
				}
			};
		}
	});

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

<div class="container py-8">
	<div
		class="content-wrapper"
		use:scrollAnimate={{ delay: 100, animationClass: 'fade-in-up' }}
	>
		<article class="project-detail-article max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader title={project.title} authors={project.years ? [project.years] : undefined} />

			<div use:scrollAnimate={{ delay: 200, animationClass: 'fade-in-up' }}>
				<section class="content-section glass-card">
					<!-- Safe: project.description is from trusted project data in src/lib/data/digital-humanities/ -->
					{@html project.description}
				</section>
			</div>

			<div use:scrollAnimate={{ delay: 300, animationClass: 'fade-in-up' }}>
				{#if projectDetails.length > 0}
					<DetailsGrid details={projectDetails} />
				{/if}
			</div>

			<div use:scrollAnimate={{ delay: 400, animationClass: 'fade-in-up' }}>
				{#if project.skills && project.skills.length > 0}
					<section class="mb-6">
						<TagList
							tags={project.skills}
							sectionTitle="Skills"
							baseUrl="/digital-humanities?skill="
							buttonVariant="outline-primary"
							buttonSize="sm"
						/>
					</section>
				{/if}
			</div>

			{#if project.embeddableContent && project.embeddableContent.length > 0}
				<div use:scrollAnimate={{ delay: 500, animationClass: 'fade-in-up' }}>
					<section class="embeddable-section">
						{#each project.embeddableContent as item (item.id)}
							<div class="embeddable-item">
								{#if item.showTitle && item.title}
									<h3 class="embeddable-title">{item.title}</h3>
								{/if}
								{#if item.description}
									<!-- Safe: item.description is from trusted project data -->
									<p class="embeddable-description">{@html item.description}</p>
								{/if}

								{#if item.type === 'iframe'}
									<div class="iframe-wrapper">
										<IframeRenderer {...item} />
									</div>
								{:else if item.type === 'image'}
									{#if item.linkUrl}
										<a href={item.linkUrl} target="_blank" rel="noopener noreferrer" class="image-link">
											<img
												src={item.src}
												alt={item.alt}
												class="responsive-image"
												width="800"
												height="600"
												loading="lazy"
												decoding="async"
											/>
										</a>
									{:else}
										<img
											src={item.src}
											alt={item.alt}
											class="responsive-image"
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

			<div use:scrollAnimate={{ delay: 600, animationClass: 'fade-in-up' }}>
				{#if project.award}
					<section class="award-section">
						<h3 class="section-title">Award</h3>
						<!-- Safe: project.award is from trusted project data -->
						<p>{@html project.award}</p>
					</section>
				{/if}
			</div>

			<div use:scrollAnimate={{ delay: 700, animationClass: 'fade-in-up' }}>
				{#if project.publication}
					<section class="publication-section">
						<h3 class="section-title">Related Publication</h3>
						<p>
							<!-- Safe: project.publication.text is from trusted project data -->
							<a href={project.publication.url} target="_blank" rel="noopener noreferrer" class="link"
								>{@html project.publication.text}</a
							>
						</p>
					</section>
				{/if}
			</div>

			<div use:scrollAnimate={{ delay: 800, animationClass: 'fade-in-up' }}>
				{#if project.reviews && project.reviews.length > 0}
					<section class="reviews-section">
						<h3 class="section-title">Reviews</h3>
						<ul class="reviews-list">
							{#each project.reviews as review (review.url)}
								<li class="review-item">
									<!-- Safe: review.text is from trusted project data -->
									<a
										href={review.url}
										target="_blank"
										rel="noopener noreferrer"
										class="link font-medium">{@html review.text}</a
									>
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

	<!-- Back button -->
	<div class="mt-8 text-center max-w-6xl mx-auto" use:scrollAnimate={{ delay: 900, animationClass: 'fade-in-up' }}>
		<a href="{base}/digital-humanities" class="btn btn-primary glass-button"
			>Back to Digital Humanities Projects</a
		>
	</div>
</div>

<style>
	/* Article container - consistent with activity and research pages */
	.project-detail-article {
		position: relative;
	}

	/* Content section with glassmorphism - consistent with ContentBody styling */
	.content-section {
		padding: var(--space-lg);
		border-radius: var(--border-radius-lg);
		margin-bottom: var(--space-lg);
	}

	.content-section :global(p) {
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
	}

	.content-section :global(p:last-child) {
		margin-bottom: 0;
	}

	.content-section :global(p:first-child) {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-emphasis);
		position: relative;
		padding-left: var(--space-md);
		border-left: var(--border-width-medium) solid transparent;
		border-image: linear-gradient(180deg, var(--color-highlight) 0%, var(--color-accent) 100%) 1;
		border-image-slice: 1;
	}

	.content-section :global(a) {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.content-section :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* Embeddable content section */
	.embeddable-section {
		margin-bottom: var(--space-lg);
	}

	.embeddable-item {
		margin-bottom: var(--space-xl);
	}

	.embeddable-item:last-child {
		margin-bottom: 0;
	}

	.embeddable-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-sm);
		line-height: var(--line-height-tight);
	}

	.embeddable-description {
		color: var(--color-text-light);
		margin-bottom: var(--space-md);
		line-height: var(--line-height-relaxed);
	}

	/* Iframe wrapper with glassmorphism - consistent with research iframe-section */
	.iframe-wrapper {
		position: relative;
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
	}

	.iframe-wrapper:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Image styling */
	.responsive-image {
		max-width: 100%;
		height: auto;
		display: block;
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
	}

	.image-link {
		display: block;
	}

	.image-link:hover .responsive-image {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
	}

	/* Shared section styling - consistent glassmorphism pattern */
	.award-section,
	.publication-section,
	.reviews-section {
		margin: var(--space-lg) 0;
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

	.award-section:hover,
	.publication-section:hover,
	.reviews-section:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Award section accent color */
	.award-section {
		border-color: rgba(var(--color-accent-rgb), var(--opacity-low));
	}

	.award-section .section-title {
		color: var(--color-accent);
	}

	/* Section titles - consistent typography */
	.section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-md);
		line-height: var(--line-height-tight);
	}

	/* Reviews list */
	.reviews-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.review-item {
		padding: var(--space-md);
		border-radius: var(--border-radius-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-surface-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 100%
		);
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
	}

	.review-item:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.review-quote {
		margin-top: var(--space-md);
		padding: var(--space-md);
		border-left: var(--border-width-thick) solid var(--color-accent);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
	}

	/* Dark mode adjustments - consistent with activity/research pages */
	:global(html.dark) .iframe-wrapper {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	:global(html.dark) .award-section,
	:global(html.dark) .publication-section,
	:global(html.dark) .reviews-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	:global(html.dark) .award-section:hover,
	:global(html.dark) .publication-section:hover,
	:global(html.dark) .reviews-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
	}

	:global(html.dark) .review-item {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
	}

	:global(html.dark) .review-item:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 100%
		);
	}

	:global(html.dark) .review-quote {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
	}

	/* Responsive adjustments */
	@media (--sm) {
		.content-section {
			padding: var(--space-xl);
		}

		.content-section :global(p:first-child) {
			font-size: var(--font-size-lg);
			padding-left: var(--space-lg);
		}

		.award-section,
		.publication-section,
		.reviews-section {
			padding: var(--space-xl);
		}

		.section-title {
			font-size: var(--font-size-xl);
		}

		.review-item {
			padding: var(--space-lg);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.iframe-wrapper,
		.responsive-image,
		.award-section,
		.publication-section,
		.reviews-section,
		.review-item {
			transition: none;
		}

		.iframe-wrapper:hover,
		.image-link:hover .responsive-image,
		.award-section:hover,
		.publication-section:hover,
		.reviews-section:hover,
		.review-item:hover {
			transform: none;
		}
	}
</style>
