<script>
	import { base } from '$app/paths';
	import Card from '$lib/components/common/Card.svelte'; // Import the Card component
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Research', '/research');

	// Research projects data
	const researchProjects = [
		{
			id: 'islams-peripheries-dh-ai-west-africa-central-asia',
			title: "Islam's 'Peripheries': DH & AI in West Africa and Central Asia",
			years: '2026-2027',
			shortDescription:
				'Applying AI and computational methods to compare Islamic discourse and responses to modernity in the multilingual archives of West Africa and Central Asia.',
			imageUrl: `${base}/images/research/islams-peripheries.webp`
		},
		{
			id: 'dh-ai-african-studies',
			title: 'Digital Humanities and AI in African Studies',
			years: '2025-',
			shortDescription:
				'Exploring how DH and AI can transform knowledge production in African studies through ethical, sustainable, and Africa-centred digital infrastructures.',
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

<SEO
	title="Research | Frédérick Madore"
	description="Research projects on Islam and Muslim societies in francophone West Africa, including fieldwork in Benin, Togo, Côte d'Ivoire, and Burkina Faso."
	keywords="research, Islam, West Africa, Muslim societies, Benin, Togo, Côte d'Ivoire, Burkina Faso, Frédérick Madore"
	canonical="https://www.frederickmadore.com/research"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8 page-enter">
	<PageHeader title="Research" />

	<PageIntro>
		My research lies at the intersection of African history, Islamic studies, and digital humanities.
		I explore the contemporary history of Islam and Muslim societies in Francophone West Africa. I
		focus on how youth, women and religious minorities have engaged with religious activism, the
		media and political life from the 1960s to the present day. By combining extensive fieldwork and
		archival research in Benin, Togo, Côte d'Ivoire and Burkina Faso with computational
		methodologies, I examine the evolving landscape of Islamic discourse and Muslim politics.
	</PageIntro>

	<div class="content-grid grid-stagger">
		{#each researchProjects as project (project.id)}
			<Card
				title={project.title}
				imageUrl={project.imageUrl}
				linkUrl={`${base}/research/${project.id}`}
				target="_self"
			>
				{#snippet subtitle()}
					<span>{project.years}</span>
				{/snippet}
				{project.shortDescription}
				{#snippet action()}
					<a href={`${base}/research/${project.id}`}>Read more →</a>
				{/snippet}
			</Card>
		{/each}
	</div>
</div>

<style>
	/* .container styles are handled by global layout/container.css */
</style>
