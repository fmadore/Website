<script>
	import { base } from '$app/paths';
	import Card from '$lib/components/common/Card.svelte'; // Import the Card component
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

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

<div class="container" use:scrollAnimate={{ delay: DELAY_STEP * 0, animationClass: 'fade-in-up' }}>
	<PageHeader title="Research" />

	<PageIntro>
		My research focuses on the history of Islam and Muslim societies in francophone West Africa from
		the 1960s to the present. I have conducted extensive fieldwork and archival research in Benin,
		Togo, Côte d'Ivoire, and Burkina Faso, examining various aspects of Islamic activism, media use,
		and Muslim politics.
	</PageIntro>

	<div
		class="content-grid"
		use:scrollAnimate={{ delay: DELAY_STEP * 2, animationClass: 'fade-in-up' }}
	>
		{#each researchProjects as project, index}
			<Card
				title={project.title}
				imageUrl={project.imageUrl}
				linkUrl={`${base}/research/${project.id}`}
				target="_self"
				animationDelay={DELAY_STEP * (5 + index * 2)}
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
		max-width: var(--content-max-width);
		margin: 0 auto;
		padding: 0 var(--space-md);
	}
</style>
