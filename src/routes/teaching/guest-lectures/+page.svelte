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
		<section
			class="institution-section"
			use:scrollAnimate={{ delay: 100 + sectionIndex * 150, animationClass: 'fade-in-up' }}
		>
			<h2>{institution}</h2>
			<ul class="lectures-list">
				{#each lectures as lecture, lectureIndex (lecture.title + lecture.date)}
					<li
						class="lecture-item"
						use:scrollAnimate={{
							delay: 200 + sectionIndex * 150 + lectureIndex * 50,
							animationClass: 'fade-in-up'
						}}
					>
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
		margin-bottom: var(--spacing-12);
	}

	h2 {
		font-size: var(--font-size-2xl);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-6);
		padding-bottom: var(--spacing-3);
		position: relative;
	}

	h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 60px;
		height: var(--border-width-medium);
		background: linear-gradient(135deg, var(--color-highlight) 0%, var(--color-accent) 100%);
		border-radius: var(--border-radius-full);
	}

	.lectures-list {
		list-style: none;
		padding-left: 0;
		display: grid;
		gap: var(--spacing-4);
	}

	.lecture-item {
		/* Glassmorphism card styling */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);

		/* Enhanced borders and shadows */
		border: var(--border-width-thin) solid rgba(255, 255, 255, var(--opacity-medium-high));
		border-left: var(--border-width-thick) solid var(--color-primary);
		border-radius: var(--border-radius-lg);

		/* Glassmorphism shadow system */
		box-shadow:
			0 8px 32px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, var(--opacity-medium-high));

		/* Balanced spacing - less top padding, more bottom padding */
		padding: var(--spacing-4) var(--spacing-6) var(--spacing-6) var(--spacing-6);
		margin-bottom: var(--spacing-4);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		/* Subtle transform for depth */
		position: relative;
	}

	.lecture-item:hover {
		/* Enhanced hover state with glassmorphism */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);

		/* Enhanced hover effects */
		border-color: rgba(255, 255, 255, 0.3);
		border-left-color: var(--color-highlight);

		/* Enhanced shadow on hover */
		box-shadow:
			0 12px 40px 0 rgba(31, 38, 135, var(--opacity-medium-high)),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);

		/* Subtle lift effect */
		transform: var(--transform-lift-sm);
	}

	.lecture-title {
		font-size: var(--font-size-lg);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-top: 0;
		margin-bottom: var(--spacing-4);
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
			rgba(var(--color-accent-rgb), 0.1) 0%,
			rgba(var(--color-highlight-rgb), 0.05) 100%
		);
		color: var(--color-accent);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-full);
		margin-left: var(--spacing-2);
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), var(--opacity-medium-high));
	}

	/* Dark mode adaptations */
	:global(html.dark) .lecture-item {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border: var(--border-width-thin) solid rgba(255, 255, 255, var(--opacity-medium));
		box-shadow:
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .lecture-item:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow:
			0 12px 40px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	/* Responsive design */
	@media (min-width: 768px) {
		.lectures-list {
			gap: var(--spacing-6);
		}

		.lecture-item {
			/* Maintain balanced padding on larger screens */
			padding: var(--spacing-6) var(--spacing-8) var(--spacing-8) var(--spacing-8);
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
