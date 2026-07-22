<script>
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base, resolve } from '$app/paths'; // base for images/files, resolve for hrefs
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
			imageUrl: `${base}/images/teaching/guest-lecture.webp`,
			linkUrl: resolve('/teaching/guest-lectures')
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
	<div class="max-w-6xl mx-auto">
		<PageHeader title="Teaching" />

		<PageIntro>
			Teaching interests: African History (pre-modern and modern periods), Islam in sub-Saharan
			Africa, Digital Humanities, West African history.
		</PageIntro>

		<!-- Courses as a pure ledger: term key + level status left, serif title +
		     institution right, mono syllabus/list action. -->
		<div class="ledger ledger--ruled grid-stagger" style="--ledger-key-w: 12rem">
			{#each teachingItems as item (item.id)}
				<div class="ledger-row ledger-row--meta course-row">
					<span class="ledger-key">
						{#if item.period}
							<span class="course-term">{item.period}</span>
						{/if}
						{#if item.type === 'course' && item.level}
							<span class="ledger-status">{item.level}</span>
						{:else if item.type === 'guest_lecture'}
							<span class="ledger-status">Invited talks</span>
						{/if}
					</span>

					<span class="ledger-content">
						<span class="ledger-title">{item.title}</span>
						<span class="course-institution">{item.institution}</span>
						<span class="ledger-desc">{item.description}</span>
					</span>

					<span class="ledger-meta course-action">
						{#if item.type === 'course' && item.syllabusUrl}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- static asset URL -->
							<a href={item.syllabusUrl} target="_blank" rel="noopener noreferrer">
								Syllabus PDF ↗
							</a>
						{:else if item.type === 'guest_lecture' && item.linkUrl}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved URL -->
							<a href={item.linkUrl}>View list →</a>
						{/if}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* The term key sits in the mono data voice, one line above the level status. */
	.course-term {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		letter-spacing: 0.02em;
	}

	/* Institution — serif byline under the course title. */
	.course-institution {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-base);
		color: var(--color-text-soft);
	}

	/* The action column carries the accent link; align its top to the title. */
	.course-action {
		text-align: right;
	}

	.course-action a {
		color: var(--color-accent);
		text-decoration: none;
		white-space: nowrap;
	}

	.course-action a:hover {
		color: var(--color-accent-dark);
	}

	.course-action a:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/* On narrow screens the three-column ledger collapses to a single column;
	   the action drops under the content and left-aligns with it. */
	@media (--md-down) {
		.course-row {
			grid-template-columns: 1fr;
			gap: var(--space-sm);
		}

		.course-action {
			text-align: left;
		}
	}
</style>
