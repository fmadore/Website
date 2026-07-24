<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import {
		useBreadcrumbJsonLd,
		createSubsectionBreadcrumbs
	} from '$lib/utils/breadcrumbJsonLd.svelte';

	// Define breadcrumb items
	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Teaching',
		'/teaching',
		'Guest Lectures',
		'/teaching/guest-lectures'
	);

	// JSON-LD for Breadcrumbs - uses reusable utility
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-guest-lectures');

	const guestLecturesByInstitution = {
		'Universität Bayreuth': [
			{
				title: 'Islam and Muslims in West Africa',
				course: 'Religion in/from Africa',
				level: 'graduate',
				date: '31 May 2022'
			}
		],
		'University of Florida': [
			{
				title: 'Colonial Surveillance in French West Africa in the Interwar Period',
				course: 'Politics, Identity and Violence in Africa',
				level: 'undergraduate',
				date: '11 September 2020'
			},
			{
				title: 'Islam and Muslim Societies in Francophone West Africa',
				course: 'Religions of Africa',
				level: 'undergraduate',
				date: '5 September 2019'
			}
		],
		'Université Laval': [
			{
				title: 'Outils technologiques pour la recherche en histoire',
				course: 'Recherche et rédaction [Research and Writing]',
				level: 'undergraduate',
				date: '16 February 2018'
			},
			{
				title: "La recherche historique en Afrique de l'Ouest: enjeux et défis",
				course: "Les sciences historiques aujourd'hui [Historical Sciences Today]",
				level: 'undergraduate',
				date: '5 February 2018'
			},
			{
				title: 'Religions et enjeux de pouvoir',
				course:
					'Afrique subsaharienne: diversité culturelle et mondialisation [Sub-Saharan Africa: Cultural Diversity and Globalization]',
				level: 'undergraduate',
				date: '3 April 2017'
			},
			{
				title: 'Sociétés, religion et politique',
				course: 'Politique et société en Afrique [Politics and Society in Africa]',
				level: 'graduate',
				date: '28 February 2017'
			},
			{
				title: 'Outils technologiques pour la recherche doctorale',
				course: 'Projet de thèse [Dissertation Project]',
				level: 'graduate',
				date: '13 January 2017; 1 February 2016'
			}
		]
	};
</script>

<SEO
	title="Guest Lectures | Frédérick Madore"
	description="List of guest lectures delivered by Frédérick Madore."
/>

<div class="container py-8">
	<Breadcrumb items={breadcrumbItems} />
	<PageHeader title="Guest Lectures" />

	{#each Object.entries(guestLecturesByInstitution) as [institution, lectures] (institution)}
		<section class="section institution-section scroll-reveal">
			<div class="section-head">
				<h2 class="section-title">{institution}</h2>
			</div>

			<!-- Lectures as a ledger: date key + level status left, serif title +
			     course right. -->
			<div class="ledger ledger--ruled grid-stagger" style="--ledger-key-w: 11rem">
				{#each lectures as lecture (lecture.title + lecture.date)}
					<div class="ledger-row lecture-row">
						<span class="ledger-key">
							<span class="lecture-date">{lecture.date}</span>
							<span class="ledger-status">{lecture.level}</span>
						</span>
						<span class="ledger-content">
							<span class="ledger-title">{lecture.title}</span>
							<span class="lecture-course">In course: <em>{lecture.course}</em></span>
						</span>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.institution-section {
		margin-bottom: var(--space-2xl);
	}

	/* Date key rides the mono data voice above the level status. */
	.lecture-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		letter-spacing: 0.02em;
	}

	/* Course line — serif prose, title of the host course set in italic. */
	.lecture-course {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
	}

	.lecture-course em {
		font-style: italic;
		color: var(--color-text-emphasis);
	}

	/* On narrow screens collapse the two-column ledger to a stacked row. */
	@media (--md-down) {
		.lecture-row {
			grid-template-columns: 1fr;
			gap: var(--space-sm);
		}
	}
</style>
