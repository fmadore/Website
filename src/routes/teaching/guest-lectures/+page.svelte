<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { page } from '$app/stores'; // Import page store
	import { browser } from '$app/environment'; // Import browser check

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

<div class="container py-8">
	<Breadcrumb items={breadcrumbItems} />
	<PageHeader title="Guest Lectures" />

	{#each Object.entries(guestLecturesByInstitution) as [institution, lectures] (institution)}
		<section class="institution-section scroll-reveal">
			<h2>{institution}</h2>
			<ul class="lectures-list grid-stagger">
				{#each lectures as lecture (lecture.title + lecture.date)}
					<li class="lecture-item glass-card">
						<h3 class="lecture-title">{lecture.title}</h3>
						<p class="lecture-details" data-level={lecture.level}>
							In course: <em>{lecture.course}</em><br />
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
		margin-bottom: var(--space-2xl);
	}

	h2 {
		font-size: var(--font-size-2xl);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-sm);
		position: relative;
	}

	h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: calc(var(--space-2xl) + var(--space-sm));
		height: var(--border-width-medium);
		background: linear-gradient(135deg, var(--color-highlight) 0%, var(--color-accent) 100%);
		border-radius: var(--border-radius-full);
	}

	.lectures-list {
		list-style: none;
		padding-left: 0;
		display: grid;
		gap: var(--space-md);
	}

	.lecture-item {
		/* Enhanced borders */
		border-left: var(--border-width-thick) solid var(--color-primary);

		/* Balanced spacing - less top padding, more bottom padding */
		padding: var(--space-md) var(--space-lg) var(--space-lg) var(--space-lg);
		margin-bottom: var(--space-md);
		transition: all var(--anim-duration-base) var(--anim-ease-base);

		/* Subtle transform for depth */
		position: relative;
	}

	.lecture-item:hover {
		/* Enhanced hover effects */
		border-left-color: var(--color-highlight);

		/* Subtle lift effect */
		transform: var(--transform-lift-sm);
	}

	.lecture-title {
		font-size: var(--font-size-lg);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-top: 0;
		margin-bottom: var(--space-md);
		line-height: var(--line-height-tight);
	}

	.lecture-details {
		font-size: var(--font-size-base);
		color: var(--color-text-light);
		line-height: var(--line-height-relaxed);
		margin: 0;
	}

	.lecture-details em {
		font-style: italic;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	/* Level badge styling */
	.lecture-details::after {
		content: attr(data-level);
		display: inline-block;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent) 10%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 5%, transparent) 100%
		);
		color: var(--color-accent);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-full);
		margin-left: var(--space-xs);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-medium-high) * 100%), transparent);
	}

	/* Dark mode adaptations */
	/* Handled by glass-card utility */

	/* Responsive design */
	@media (--md) {
		.lectures-list {
			gap: var(--space-lg);
		}

		.lecture-item {
			/* Maintain balanced padding on larger screens */
			padding: var(--space-lg) var(--space-xl) var(--space-xl) var(--space-xl);
		}

		.lecture-title {
			font-size: var(--font-size-xl);
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.lecture-item {
			transition: none;
		}

		.lecture-item:hover {
			transform: none;
		}
	}

	@media (prefers-contrast: high) {
		.lecture-item {
			border-width: var(--border-width-medium);
		}

		h2::after {
			height: var(--border-width-thick);
		}
	}
</style>
