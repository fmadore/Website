<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';

	import { base } from '$app/paths';
	import { page } from '$app/stores';
	// import { onMount, onDestroy } from 'svelte'; // No longer needed for this specific logic
	import { browser } from '$app/environment';

	import type {
		DigitalHumanitiesProject,
		EmbeddableContentItem,
		Review,
		ProjectPublication
	} from '$lib/types/digitalHumanities';

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

<div class="container mx-auto px-4 py-8">
	<Breadcrumb items={breadcrumbItems} />

	<PageHeader title={project.title} />
	{#if project.years}
		<p class="text-left md:text-left text-xl font-light text-secondary mb-6">
			{project.years}
		</p>
	{/if}

	<article class="project-detail-article bg-background p-4 md:p-6 rounded-lg shadow-md mb-8">
		<section class="prose prose-lg max-w-none mb-6">
			{@html project.description}
		</section>

		{#if projectDetails.length > 0}
			<DetailsGrid details={projectDetails} />
		{/if}

		{#if project.skills && project.skills.length > 0}
			<section class="mb-6">
				<TagList tags={project.skills} sectionTitle="" baseUrl="/digital-humanities?skill=" />
			</section>
		{/if}

		{#if project.embeddableContent && project.embeddableContent.length > 0}
			<section class="mb-6">
				{#each project.embeddableContent as item (item.id)}
					<div class="mb-8">
						{#if item.showTitle && item.title}
							<h3 class="text-xl font-semibold mb-2">{item.title}</h3>
						{/if}
						{#if item.description}
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
		{/if}

		{#if project.award}
			<section class="mb-6 p-4 bg-background-alt rounded-md shadow-sm">
				<h3 class="text-lg font-semibold text-accent mb-1">Award</h3>
				<p>{@html project.award}</p>
			</section>
		{/if}

		{#if project.publication}
			<section class="mb-6">
				<h3 class="text-lg font-semibold mb-1">Related Publication</h3>
				<p>
					<a href={project.publication.url} target="_blank" rel="noopener noreferrer" class="link"
						>{@html project.publication.text}</a
					>
				</p>
			</section>
		{/if}

		{#if project.reviews && project.reviews.length > 0}
			<section class="mb-6">
				<h3 class="text-lg font-semibold mb-2">Reviews</h3>
				<ul class="space-y-4">
					{#each project.reviews as review}
						<li class="bg-background-alt p-4 rounded-md shadow-sm">
							<a
								href={review.url}
								target="_blank"
								rel="noopener noreferrer"
								class="link font-medium">{@html review.text}</a
							>
							{#if review.quote}
								<blockquote
									class="mt-2 p-3 border-l-4 border-border text-sm text-light italic bg-background rounded-r-md"
								>
									<p>{review.quote}</p>
								</blockquote>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Add other sections as needed: e.g., team, methodology, findings -->
	</article>

	<!-- Optional: Link to related projects or a back button -->
	<div class="mt-8 text-center">
		<a href="{base}/digital-humanities" class="btn btn-primary"
			>Back to Digital Humanities Projects</a
		>
	</div>
</div>

<style>
	/* Add any specific styles for this page here, if needed. */
	.responsive-image {
		max-width: 100%;
		height: auto;
		display: block; /* To prevent extra space below image */
	}
	/* 
    .project-detail-article {
        // background-color: var(--color-background-alt); 
    }
    .prose a {
        color: var(--color-primary);
    }
    .prose a:hover {
        text-decoration: underline;
    }
    */
</style>
