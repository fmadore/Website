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

<div class="container mx-auto py-8 px-4">
	<article
		class="project-detail-article glass-card rounded-lg p-6 mb-8"
		use:scrollAnimate={{ delay: 100, animationClass: 'fade-in-up' }}
	>
		<Breadcrumb items={breadcrumbItems} />

		<PageHeader title={project.title} authors={project.years ? [project.years] : undefined} />

		<div use:scrollAnimate={{ delay: 200, animationClass: 'fade-in-up' }}>
			<section class="prose prose-lg max-w-none mb-6">
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
				<section class="mb-6">
					{#each project.embeddableContent as item (item.id)}
						<div class="mb-8">
							{#if item.showTitle && item.title}
								<h3 class="text-xl font-semibold mb-2">{item.title}</h3>
							{/if}
							{#if item.description}
								<!-- Safe: item.description is from trusted project data -->
								<p class="text-light mb-3 prose">{@html item.description}</p>
							{/if}

							{#if item.type === 'iframe'}
								<IframeRenderer {...item} />
							{:else if item.type === 'image'}
								{#if item.linkUrl}
									<a href={item.linkUrl} target="_blank" rel="noopener noreferrer">
										<img
											src={item.src}
											alt={item.alt}
											class="responsive-image shadow-md rounded-md"
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
										class="responsive-image shadow-md rounded-md"
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
					<h3 class="award-title">Award</h3>
					<!-- Safe: project.award is from trusted project data -->
					<p>{@html project.award}</p>
				</section>
			{/if}
		</div>

		<div use:scrollAnimate={{ delay: 700, animationClass: 'fade-in-up' }}>
			{#if project.publication}
				<section class="publication-section">
					<h3 class="publication-title">Related Publication</h3>
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
					<h3 class="reviews-title">Reviews</h3>
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

		<!-- Add other sections as needed: e.g., team, methodology, findings -->
	</article>	<!-- Optional: Link to related projects or a back button -->
	<div class="mt-8 text-center" use:scrollAnimate={{ delay: 900, animationClass: 'fade-in-up' }}>
		<a href="{base}/digital-humanities" class="btn btn-primary"
			>Back to Digital Humanities Projects</a
		>
	</div>
</div>

<style>
	/* Article container - glassmorphism applied via utility class */
	.project-detail-article {
		position: relative;
		/* All glassmorphism effects handled by .glass-card utility */
	}

	/* Responsive image styling */
	.responsive-image {
		max-width: 100%;
		height: auto;
		display: block;
	}

	/* Award Section */
	.award-section {
		margin: var(--spacing-8) 0;
		padding: var(--spacing-6);
		border-radius: var(--border-radius-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), var(--opacity-low));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base) var(--anim-ease-out);
	}

	.award-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
	}

	.award-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent);
		margin-bottom: var(--spacing-2);
		line-height: var(--line-height-tight);
	}

	/* Publication Section */
	.publication-section {
		margin: var(--spacing-8) 0;
		padding: var(--spacing-6);
		border-radius: var(--border-radius-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base) var(--anim-ease-out);
	}

	.publication-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
	}

	.publication-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-2);
		line-height: var(--line-height-tight);
	}

	/* Reviews Section */
	.reviews-section {
		margin: var(--spacing-8) 0;
		padding: var(--spacing-6);
		border-radius: var(--border-radius-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		border: var(--border-width-thin) solid rgba(var(--color-highlight-rgb), var(--opacity-low));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base) var(--anim-ease-out);
	}

	.reviews-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
	}

	.reviews-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-4);
		line-height: var(--line-height-tight);
	}

	.reviews-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	.review-item {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 4px));
		backdrop-filter: blur(var(--glass-blur-fallback, 4px));
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), var(--opacity-low));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base) var(--anim-ease-out);
	}

	.review-item:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
	}

	.review-quote {
		margin-top: var(--spacing-3);
		padding: var(--spacing-3);
		border-left: var(--border-width-thick) solid var(--color-accent);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		background: rgba(var(--color-background-rgb), var(--opacity-medium));
		border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
	}

	/* Dark mode refinements */
	:global(html.dark) .award-section,
	:global(html.dark) .publication-section,
	:global(html.dark) .reviews-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
	}

	:global(html.dark) .award-section:hover,
	:global(html.dark) .publication-section:hover,
	:global(html.dark) .reviews-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
	}

	:global(html.dark) .review-item {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
	}

	:global(html.dark) .review-item:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.award-section,
		.publication-section,
		.reviews-section {
			padding: var(--spacing-4);
		}

		.award-title,
		.publication-title,
		.reviews-title {
			font-size: var(--font-size-base);
		}

		.review-item {
			padding: var(--spacing-3);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.project-detail-article,
		.project-detail-article:hover,
		.award-section,
		.award-section:hover,
		.publication-section,
		.publication-section:hover,
		.reviews-section,
		.reviews-section:hover,
		.review-item,
		.review-item:hover {
			transition: none;
			transform: none;
		}
	}
</style>
