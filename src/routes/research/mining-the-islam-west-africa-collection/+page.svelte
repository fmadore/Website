<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { page } from '$app/stores'; // Import page store
	import { browser } from '$app/environment'; // Import browser check

	// Pre-construct breadcrumb items with evaluated paths
	const breadcrumbItems = [
		{ label: 'Research', href: `${base}/research` },
		{
			label: 'Mining the Islam West Africa Collection',
			href: `${base}/research/mining-the-islam-west-africa-collection`
		}
	];

	// Generate Breadcrumb JSON-LD reactively using $derived
	let breadcrumbJsonLdString = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				item: `${$page.url.origin}${item.href}`
			}))
		})
	);

	// Manage JSON-LD script injection
	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

	// Update handler for iframe load event with improved reliability
	function handleIframeLoad(event: Event) {
		// Add the iframe-loaded class to the parent container when iframe loads
		if (event.target) {
			const iframe = event.target as HTMLElement;
			const container = iframe.parentNode as HTMLElement;
			if (container) {
				container.classList.add('iframe-loaded');
				console.log('Iframe loaded, animation should hide'); // Debug message
			}
		}
	}

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

			// Fallback for loading animation in case onload doesn't fire
			const loadingTimeout = setTimeout(() => {
				const containers = document.querySelectorAll('.iframe-container-loading');
				containers.forEach((container) => {
					container.classList.add('iframe-loaded');
					console.log('Forced loading animation hide via timeout');
				});
			}, 5000); // 5 second timeout

			return () => {
				// Cleanup: remove the script if it exists and clear timeout
				if (browser) {
					const scriptToRemove = document.getElementById(scriptId);
					if (scriptToRemove && scriptToRemove.parentElement === document.head) {
						document.head.removeChild(scriptToRemove);
					}
				}
				clearTimeout(loadingTimeout);
			};
		}
	});
</script>

<SEO title="Mining the Islam West Africa Collection | Frédérick Madore" />

<div class="container mx-auto px-4 py-8">
	<!-- Apply grid layout to this container on medium screens and up -->
	<div class="grid">
		<div class="main-content">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader
				title="Mining the Islam West Africa Collection: Mapping Print Culture and Intellectual Networks in Francophone Regions"
			/>

			<div class="project-image">
				<img
					src="{base}/images/research/IWAC.webp"
					alt="Mining the Islam West Africa Collection"
					class="w-full h-auto"
					width="800"
					height="600"
					loading="lazy"
					decoding="async"
				/>
			</div>

			<div class="project-content">
				<p>
					Scholarship on Islam in West Africa has long privileged manuscript traditions, leaving the
					vibrant Muslim periodical press of the 1980s, 90s, and early 2000s largely unexplored. My
					project fills this gap by tracing the emergence of modern Islamic print culture and the
					networks of Western-educated Francophone Muslim intellectuals who animated it in Benin,
					Burkina Faso, Côte d'Ivoire and Togo.
				</p>

				<p>
					Working with the <a
						href="https://islam.zmo.de/s/westafrica/"
						target="_blank"
						rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a
					>, I combine digital humanities methods with close reading to analyse around 1,500 Islamic
					publications published between 1980 and 2020. Topic modelling, word embeddings, and
					sentiment analysis chart the shifting meanings of key religious terms (<em>ummah</em>,
					Salafism, <em>jihad</em>) alongside political concepts such as democracy and
					<em>laïcité</em>), revealing the themes, semantic turns and affective registers that have
					shaped Muslim public debate during a period of rapid socio-political change.
				</p>

				<p>
					Network analysis maps the contours of an "Islamic Francophonie", visualising the links
					between authors, publishers, NGOs and state institutions. These visualisations show how
					French became a strategic language for Islamic debate among urban elites, and how
					regionally rooted networks engaged with - rather than merely echoed - broader Arab-Islamic
					currents.
				</p>

				<p>
					By integrating these computational insights with ethnographic fieldwork and close textual
					study, the project offers a composite portrait of Islamic thought in Francophone West
					Africa - one that situates religious ideas within their material, linguistic and political
					ecologies. In doing so, it advances the intellectual history of the region and proposes a
					new approach to the study of print publics at the intersection of religion, morality, and
					civic life.
				</p>

				<div
					class="iframe-container iframe-with-header iframe-interactive iframe-container-lightweight"
				>
					<div class="iframe-header">Islam West Africa Collection Overview</div>
					<iframe
						src="https://fmadore.github.io/IWAC-overview/index.html"
						title="IWAC Visualization"
						frameborder="0"
						scrolling="yes"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			</div>
		</div>

		<div class="sidebar">
			<RelevantPublications projectName="Mining the Islam West Africa Collection" limit={5} />
			<div class="mt-6">
				<RelevantCommunications projectName="Mining the Islam West Africa Collection" limit={5} />
			</div>
		</div>
	</div>
</div>

<style>
	/* Styles for mobile first */
	.main-content {
		width: 100%;
	}

	.sidebar {
		width: 100%;
		margin-top: var(--spacing-8);
	}

	.project-image {
		margin-bottom: var(--spacing-8);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-md);
	}

	.project-image img {
		width: 100%;
		height: auto;
		display: block;
	}

	/* Grid layout for medium screens and up */
	@media (min-width: 768px) {
		.grid {
			display: grid;
			grid-template-columns: 1fr 300px; /* Main content takes remaining space, sidebar is 300px */
			gap: var(--spacing-8);
		}

		.main-content {
			width: auto; /* Reset width */
		}

		.sidebar {
			width: auto; /* Reset width */
			margin-top: 0; /* Reset margin */
		}
	}
</style>
