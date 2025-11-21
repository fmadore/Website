<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import { page } from '$app/stores'; // Added page store import
	import { browser } from '$app/environment'; // Added browser import
	import Card from '$lib/components/common/Card.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import { allDhProjects } from '$lib/data/digital-humanities'; // Import the new data source

	// Reactive variable for the skill from URL, only access searchParams if in browser
	let selectedSkill = $derived(browser ? $page.url.searchParams.get('skill') : null);

	// Filter projects based on selectedSkill, then process them
	let finalProjectsToDisplay = $derived(
		(selectedSkill
			? allDhProjects.filter((project) => project.skills && project.skills.includes(selectedSkill))
			: allDhProjects
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
	description="Discover Frédérick Madore's digital humanities projects including the Islam West Africa Collection (IWAC)."
/>

<div class="container">
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
		This section presents some of my work in digital humanities (DH), applying computational methods
		to historical research on Islam and Muslim societies in West Africa. DH has taken an
		increasingly important place in my research in recent years, leading me to develop my skills
		through both specialised training and continuous self-learning. I use data visualisation
		techniques to translate research findings into compelling narratives, making historical findings
		accessible and engaging.
	</PageIntro>

	<div class="content-grid">
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

<style>
	/* .dh-grid styles are now handled by .content-grid */
	/* Ensure any unique styles for this page that were part of .dh-grid are preserved or moved if necessary. */
	/* .content-grid includes gap: var(--spacing-8) and margin-top: var(--spacing-8) (which was 2rem for .dh-grid) */

	/* Responsive grid adjustments */
	/* These are now handled by the global .content-grid class */
	/* @media (min-width: 640px) {
        .dh-grid {
            grid-template-columns: repeat(2, 1fr); 
        }
    } */

	/* Styles for content within the details slot */
	.dh-card-extras {
		font-size: var(--font-size-sm);
		margin-top: var(--spacing-2);
		line-height: var(--line-height-snug);
	}

	.skills-section {
		margin-bottom: var(--spacing-2);
	}

	/* Customize the skills tag list title */
	.skills-section :global(.tag-list-title) {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-secondary);
		margin-bottom: var(--spacing-2);
	}
</style>
