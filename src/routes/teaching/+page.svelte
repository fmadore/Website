<script>
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base } from '$app/paths'; // Import base path for images
	import Card from '$lib/components/common/Card.svelte'; // Import Card component
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Teaching', '/teaching');

	// Unified teaching items data for cards
	const teachingItems = [
		{
			id: 'african-past',
			type: 'course',
			title: 'The African Past',
			institution: 'University of Ottawa (Canada)',
			level: 'undergraduate',
			period: 'fall 2020',
			description:
				'An introduction to the major themes and debates in African history, from ancient empires to colonial rule and independence.',
			imageUrl: `${base}/images/teaching/uottawa.png`,
			syllabusUrl: `${base}/files/syllabus_the_african_past__fall_2020.pdf`
		},
		{
			id: 'francophone-west-africa',
			type: 'course',
			title: 'Francophone West Africa',
			institution: 'University of Florida (United States)',
			level: 'undergraduate',
			period: 'spring 2020',
			description:
				'From the French conquest in the 19th century to the emergence of jihadi groups in the Sahel today, this course traces how colonial rule and its aftermath have shaped francophone West Africa, using case studies from lesser-known countries such as Burkina Faso, Benin and Togo.',
			imageUrl: `${base}/images/teaching/university-of-florida-logo.png`,
			syllabusUrl: `${base}/files/syllabus-francophone-west-africa.pdf`
		},
		{
			id: 'dissertation-historique',
			type: 'course',
			title: 'Dissertation historique [Historical writing]',
			institution: 'Université Laval (Canada)',
			level: 'undergraduate',
			period: '8 sections; fall 2013-winter 2018',
			description:
				'Guidance and workshops on research methodologies and the craft of historical writing.',
			imageUrl: `${base}/images/teaching/universite-Laval-logo.svg`
		},
		{
			id: 'guest-lecturer',
			type: 'guest_lecture', // Differentiate this type
			title: 'Guest Lecturer',
			institution: 'Various Institutions',
			description:
				'A list of invited talks and lectures delivered at various academic institutions.',
			imageUrl: `${base}/images/teaching/guest-lecture.jpg`,
			linkUrl: `${base}/teaching/guest-lectures`
		}
	];
</script>

<SEO
	title="Teaching | Frédérick Madore"
	description="Teaching experience by Frédérick Madore, including courses on African History, Islam in sub-Saharan Africa, and digital humanities."
	keywords="teaching, courses, African history, Islam, digital humanities, Frédérick Madore, guest lectures"
	canonical="https://www.frederickmadore.com/teaching"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8 page-enter">
	<PageHeader title="Teaching" />

	<PageIntro>
		Teaching interests: African History (pre-modern and modern periods), Islam in sub-Saharan
		Africa, Digital Humanities, West African history.
	</PageIntro>

	<div class="content-grid grid-stagger">
		{#each teachingItems as item (item.id)}
			<Card
				title={item.title}
				imageUrl={item.imageUrl}
				linkUrl={item.type === 'course' ? item.syllabusUrl : item.linkUrl}
				target={item.type === 'guest_lecture' ? '_self' : '_blank'}
			>
				{#snippet subtitle()}
					<span>{item.institution}</span>
				{/snippet}

				{item.description}

				{#snippet details()}
					{#if item.type === 'course' && (item.level || item.period)}
						<div class="teaching-details">
							{#if item.level}
								<p><span class="detail-label">Level:</span> {item.level}</p>
							{/if}
							{#if item.period}
								<p><span class="detail-label">Period:</span> {item.period}</p>
							{/if}
						</div>
					{/if}
				{/snippet}

				{#snippet action()}
					{#if item.type === 'course' && item.syllabusUrl}
						<a href={item.syllabusUrl} target="_blank" rel="noopener noreferrer">
							View Syllabus →
						</a>
					{:else if item.type === 'guest_lecture' && item.linkUrl}
						<a href={item.linkUrl}>View List →</a>
					{/if}
				{/snippet}
			</Card>
		{/each}
	</div>
</div>

<style>
	.teaching-details p {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--space-2xs);
		line-height: var(--line-height-normal);
	}

	.teaching-details .detail-label {
		font-weight: var(--font-weight-medium);
		color: var(--color-text);
	}
</style>
