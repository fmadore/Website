<script>
	import { base } from '$app/paths';
	import Card from '$lib/components/common/Card.svelte'; // Import the Card component
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';

	// Research projects data
	const researchProjects = [
		{
			id: 'mining-the-islam-west-africa-collection',
			title: 'Mining the Islam West Africa Collection',
			years: '2025-',
			shortDescription:
				'Using AI and machine learning to analyze the Islam West Africa Collection (IWAC) digital database.',
			imageUrl: `${base}/images/research/IWAC.webp`
		},
		{
			id: 'religious-activism-campuses-togo-benin',
			title: 'Religious Activism on Campuses in Togo and Benin',
			years: '2021-2024',
			shortDescription:
				"Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
			imageUrl: `${base}/images/research/campus-activism.webp`
		},
		{
			id: 'muslim-minorities-southern-cities-benin-togo',
			title: 'Muslim Minorities in Southern Cities of Benin and Togo',
			years: '2018-2020',
			shortDescription:
				'Investigating the experiences and integration of Muslim minority communities in southern urban areas of Benin and Togo.',
			imageUrl: `${base}/images/research/muslim-minorities.webp`
		},
		{
			id: 'youth-womens-islamic-activism-cote-divoire-burkina-faso',
			title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso",
			years: '2013-2018',
			shortDescription:
				"Analyzing the evolving roles of youth and women in Islamic movements and organizations in Côte d'Ivoire and Burkina Faso.",
			imageUrl: `${base}/images/research/youth-women-activism.webp`
		}
	];
</script>

<SEO title="Research | Frédérick Madore" />

<div class="container">
	<PageHeader title="Research" />

	<PageIntro>
		My research focuses on the history of Islam and Muslim societies in francophone West Africa from
		the 1960s to the present. I have conducted extensive fieldwork and archival research in Benin,
		Togo, Côte d'Ivoire, and Burkina Faso, examining various aspects of Islamic activism, media use,
		and Muslim politics.
	</PageIntro>

	<div class="content-grid">
		{#each researchProjects as project}
			<Card
				title={project.title}
				imageUrl={project.imageUrl}
				linkUrl={`${base}/research/${project.id}`}
				target="_self"
			>
				{#snippet subtitle()}
					<span>{project.years}</span>
				{/snippet}
				{#snippet children()}
					{project.shortDescription}
				{/snippet}
				{#snippet action()}
					<a href={`${base}/research/${project.id}`}>Read more →</a>
				{/snippet}
			</Card>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Remove the old text-xl and mb-10 styles since they're now handled by PageIntro */
	/* .text-xl {
		font-size: 1.25rem;
	}
	.mb-10 {
		margin-bottom: 2.5rem;
	} */

	/* .research-grid and its responsive styles are now handled by .content-grid */
	/* Ensure any unique styles for this page that were part of .research-grid are preserved or moved if necessary. */
	/* For example, if .research-grid had a specific margin-top not covered by .content-grid, that would need to be handled. */
	/* However, .content-grid now includes margin-top: var(--spacing-8), which was 2rem for .research-grid. */

	/* Remove old card styles - Handled by Card component */
	/* .project-card, .project-card:hover, .project-card-image, ... etc. */

	/* Responsive grid adjustments */
	/* These are now handled by the global .content-grid class */
	/* @media (min-width: 640px) {
        .research-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    } */

	/* No need for 1024px breakpoint adjustment if 2 columns is sufficient */
</style>
