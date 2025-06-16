<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { page } from '$app/stores'; // Import page store
	import { browser } from '$app/environment'; // Import browser check
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	// Define breadcrumb items
	const breadcrumbItems = [
		{ label: 'Teaching', href: `${base}/teaching` },
		{ label: 'Guest Lectures', href: `${base}/teaching/guest-lectures` }
	];

	// Generate Breadcrumb JSON-LD using $derived for Svelte 5 style
	let breadcrumbJsonLdString = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				item: `${$page.url.origin}${item.href}` // Use page store here for origin
			}))
		})
	);

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

	// Manage JSON-LD script injection
	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

	// Replace onMount and onDestroy with $effect
	$effect(() => {
		if (browser) {
			const scriptId = breadcrumbJsonLdScriptId;
			let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

			// breadcrumbJsonLdString is reactive via $derived
			if (breadcrumbJsonLdString) {
				if (scriptElement) {
					scriptElement.textContent = breadcrumbJsonLdString;
				} else {
					scriptElement = document.createElement('script');
					scriptElement.id = scriptId;
					scriptElement.type = 'application/ld+json';
					scriptElement.textContent = breadcrumbJsonLdString;
					document.head.appendChild(scriptElement);
				}
			} else {
				// If breadcrumbJsonLdString becomes falsy and the script exists, remove it
				if (scriptElement) {
					document.head.removeChild(scriptElement);
				}
			}

			return () => {
				// Cleanup: remove the script if it exists
				if (browser) {
					const scriptToRemove = document.getElementById(scriptId);
					if (scriptToRemove && scriptToRemove.parentElement === document.head) {
						document.head.removeChild(scriptToRemove);
					}
				}
			};
		}
	});
</script>

<SEO
	title="Guest Lectures | Frédérick Madore"
	description="List of guest lectures delivered by Frédérick Madore."
/>

<div class="container mx-auto py-8 px-4">
	<Breadcrumb items={breadcrumbItems} />
	<PageHeader title="Guest Lectures" />

	{#each Object.entries(guestLecturesByInstitution) as [institution, lectures], sectionIndex (institution)}
		<section class="institution-section" use:scrollAnimate={{ delay: 100 + (sectionIndex * 150), animationClass: 'fade-in-up' }}>
			<h2>{institution}</h2>
			<ul class="lectures-list">
				{#each lectures as lecture, lectureIndex (lecture.title + lecture.date)}
					<li class="lecture-item" use:scrollAnimate={{ delay: 200 + (sectionIndex * 150) + (lectureIndex * 50), animationClass: 'fade-in-up' }}>
						<p class="lecture-title"><strong>{lecture.title}</strong></p>
						<p class="lecture-details">
							In course: <em>{lecture.course}</em> ({lecture.level})<br />
							Date: {lecture.date}
						</p>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.institution-section {
		margin-bottom: var(--spacing-8);
	}

	h2 {
		font-size: var(--font-size-2xl);
		color: var(--color-primary-dark);
		margin-bottom: var(--spacing-4);
		border-bottom: 1px solid var(--color-gray-300);
		padding-bottom: var(--spacing-1);
	}

	.lectures-list {
		list-style: none;
		padding-left: 0; /* Remove default padding */
	}

	.lecture-item {
		margin-bottom: var(--spacing-6);
		padding: var(--spacing-4);
		background-color: var(--color-background); /* Use main background color for cards */
		border: 1px solid var(--color-border); /* Add a standard card border */
		border-left: 3px solid var(--color-primary); /* Use primary color for left accent */
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-md); /* Add standard card shadow */
	}

	.lecture-title {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-1);
		color: var(--color-text);
	}

	.lecture-details {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin: 0;
	}

	.lecture-details em {
		font-style: italic;
	}
</style>
