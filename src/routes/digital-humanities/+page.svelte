<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Card from '$lib/components/common/Card.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import FeaturedDHProjects from '$lib/components/digital-humanities/FeaturedDHProjects.svelte';
	import { allDhProjects } from '$lib/data/digital-humanities';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Digital Humanities', '/digital-humanities');

	// Reactive variable for the skill from URL, only access searchParams if in browser
	let selectedSkill = $derived(browser ? $page.url.searchParams.get('skill') : null);

	// Get featured projects (only show when no skill filter is active)
	const featuredProjects = $derived(
		allDhProjects.filter((project) => project.featured).slice(0, 2)
	);

	// Check if we should show featured projects
	const shouldShowFeatured = $derived(!selectedSkill && featuredProjects.length > 0);

	// Filter projects based on selectedSkill, then process them
	// When showing featured, exclude them from the main list
	let finalProjectsToDisplay = $derived(
		(selectedSkill
			? allDhProjects.filter((project) => project.skills && project.skills.includes(selectedSkill))
			: allDhProjects.filter((project) => !project.featured)
		).map((project) => {
			const isExternal =
				project.linkUrl &&
				(project.linkUrl.startsWith('http://') || project.linkUrl.startsWith('https://'));
			const internalPath = `/digital-humanities/${project.id}`;
			// Ensure project.linkUrl is used directly if it's external, otherwise construct internal path with base
			const finalLinkUrl = isExternal ? project.linkUrl! : `${base}${internalPath}`;
			const linkTarget = isExternal ? '_blank' : '_self';
			const actionText = isExternal ? 'Visit Site →' : 'Explore project →';

			return {
				...project,
				// Prepend base to imageUrl for the Card component, as project.imageUrl is a root-relative path like /images/...
				// Ensure project.imageUrl has a leading slash if it doesn't already, for consistency with base path.
				imageUrl: `${base}${project.imageUrl.startsWith('/') ? project.imageUrl : '/' + project.imageUrl}`,
				finalLinkUrl,
				linkTarget,
				actionText
			};
		})
	);
</script>

<SEO
	title="Digital Humanities | Frédérick Madore"
	description="Digital humanities projects by Frédérick Madore including the Islam West Africa Collection (IWAC), AI-assisted workflows, and data visualization."
	keywords="digital humanities, IWAC, Islam West Africa Collection, AI, machine learning, data visualization, Frédérick Madore"
	canonical="https://www.frederickmadore.com/digital-humanities"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8 page-enter">
	<div class="max-w-6xl mx-auto">
		<PageHeader title="Digital Humanities" />

	{#if selectedSkill}
		<p class="text-lg mb-6">
			Showing projects with skill: <span class="font-semibold text-primary">{selectedSkill}</span>
			<a
				href="{base}/digital-humanities"
				class="text-sm ml-2 text-light hover:text-primary hover:underline">(Clear filter)</a
			>
		</p>
	{/if}

	<PageIntro>
		Digital humanities has become central to my research practice—not as an end in itself, but as a
		response to a concrete problem. After years of fieldwork across West Africa, I had accumulated
		thousands of documents that exceeded what traditional methods could process. The projects below
		trace my effort to transform this accumulation into open research infrastructure: from building
		digital archives and AI-assisted processing pipelines to interactive visualizations and
		conversational interfaces. All code is open source, and all data follows open access principles
		wherever rights permit, with the conviction that African historical sources should not only be
		preserved, but made usable for researchers, students, and the communities from which they
		originate.
	</PageIntro>

	<!-- Featured Projects Section (only shown when no skill filter active) -->
	{#if shouldShowFeatured}
		<FeaturedDHProjects projects={featuredProjects} />
	{/if}

	<!-- All Projects Section Header (only when featured are shown) -->
	{#if shouldShowFeatured}
		<div class="all-projects-header">
			<h2 class="section-title">All Projects</h2>
		</div>
	{/if}

	<div class="content-grid grid-stagger">
		{#each finalProjectsToDisplay as project (project.id)}
			<Card
				title={project.title}
				imageUrl={project.imageUrl}
				linkUrl={project.finalLinkUrl}
				target={project.linkTarget}
			>
				{#snippet subtitle()}
					<span>{project.years}</span>
				{/snippet}

				{project.shortDescription}

				{#snippet details()}
					<div class="dh-card-extras">
						<!-- Skills section -->
						{#if project.skills && project.skills.length > 0}
							<div class="skills-section">
								<TagList
									tags={project.skills}
									baseUrl="/digital-humanities?skill="
									sectionTitle="Skills"
									showTitle={true}
									buttonVariant="outline-secondary"
									buttonSize="sm"
								/>
							</div>
						{/if}
					</div>
				{/snippet}

				{#snippet action()}
					<a
						href={project.finalLinkUrl}
						target={project.linkTarget}
						rel={project.linkTarget === '_blank' ? 'noopener noreferrer' : null}
					>
						{project.actionText}
					</a>
				{/snippet}
			</Card>
		{/each}
	</div>

	<!-- Optional: Add back detailed descriptions or other content here if needed -->
	<!--
    <section class="project-details">
        <h2>Project Details & Publications</h2>
        // Add more content here if the cards aren't enough
    </section>
    -->
	</div>
</div>

<style>
	/* All Projects header styling */
	.all-projects-header {
		margin-bottom: var(--space-4);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin: 0;
	}

	/* Styles for content within the details slot */
	.dh-card-extras {
		font-size: var(--font-size-sm);
		margin-top: var(--space-2);
		line-height: var(--line-height-snug);
	}

	.skills-section {
		margin-bottom: var(--space-2);
	}

	/* Customize the skills tag list title */
	.skills-section :global(.tag-list-title) {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-secondary);
		margin-bottom: var(--space-2);
	}
</style>
