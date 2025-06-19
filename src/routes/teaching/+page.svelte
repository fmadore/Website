<script>
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths'; // Import base path for images
	import Card from '$lib/components/common/Card.svelte'; // Import Card component
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	// Unified teaching items data for cards
	let teachingItems = $state([
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
				'A list of invited talks and lectures delivered at various academic institutions.', // Updated description
			imageUrl: `${base}/images/teaching/guest-lecture.jpg`,
			linkUrl: `${base}/teaching/guest-lectures` // <-- Link to new page
		}
	]);
</script>

<SEO
	title="Teaching | Frédérick Madore"
	description="Frédérick Madore teaches African History, Islam in sub-Saharan Africa, and digital humanities."
/>

<div class="teaching-container">
	<div class="main-content">
		<PageHeader title="Teaching" />

		<div use:scrollAnimate={{ delay: 100, animationClass: 'fade-in-up' }}>
			<PageIntro>
				Teaching interests: African History (pre-modern and modern periods), Islam in sub-Saharan
				Africa, Digital Humanities, West African history.
			</PageIntro>
		</div>

		<!-- Card Grid Layout -->
		<div class="content-grid">
			{#each teachingItems as item, index (item.id)}
				<div use:scrollAnimate={{ delay: 200 + (index * 100), animationClass: 'fade-in-up' }}>
					<Card
						title={item.title}
						imageUrl={item.imageUrl}
						linkUrl={item.linkUrl}
						target={item.type === 'guest_lecture' ? '_self' : '_blank'}
					>
					{#snippet subtitle()}
						<span>{item.institution}</span>
					{/snippet}

					{#snippet details()}
						<div class="teaching-card-specific-details">
							{#if item.type === 'course'}
								<p><span class="label">Level:</span> {item.level}</p>
								<p><span class="label">Period:</span> {item.period}</p>
							{:else if item.type === 'guest_lecture'}
								<!-- Specific details not shown on card, link provided -->
							{/if}
						</div>
					{/snippet}

					{#snippet children()}{item.description}{/snippet}

					{#snippet action()}
						<div>
							{#if item.syllabusUrl}
								<a href={item.syllabusUrl} target="_blank" rel="noopener noreferrer">
									View Syllabus →
								</a>
							{:else if item.linkUrl && item.type === 'guest_lecture'}
								<a href={item.linkUrl}> View List → </a>
							{/if}
						</div>
					{/snippet}
					</Card>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.teaching-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-4);
	}

	.main-content {
		width: 100%;
	}



	/* .teaching-grid styles are now handled by .content-grid */

	.teaching-card-specific-details p {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-1);
	}
	.teaching-card-specific-details .label {
		font-weight: 500;
		color: var(--color-text);
	}

	/* @media (min-width: 640px) {
        .teaching-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (min-width: 1024px) {
        .teaching-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    } */
</style>
