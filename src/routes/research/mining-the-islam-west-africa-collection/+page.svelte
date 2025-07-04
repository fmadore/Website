<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import ProjectImageBanner from '$lib/components/common/ProjectImageBanner.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { page } from '$app/stores'; // Import page store
	import { browser } from '$app/environment'; // Import browser check
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

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

<SEO title="Mining the Islam West Africa Collection | Frédérick Madore" />

<div class="container mx-auto px-4 py-8" use:scrollAnimate={{ delay: DELAY_STEP * 0, animationClass: 'fade-in-up' }}>
	<!-- Apply grid layout to this container on medium screens and up -->
	<div class="grid" use:scrollAnimate={{ delay: DELAY_STEP * 2, animationClass: 'fade-in-up' }}>
		<div class="main-content">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader
				title="Mining the Islam West Africa Collection: Mapping Print Culture and Intellectual Networks in Francophone Regions"
			/>

			<ProjectImageBanner
				src="{base}/images/research/IWAC.webp"
				alt="Mining the Islam West Africa Collection"
				glassEffect="glass-medium"
				overlayIntensity="medium"
			/>

			<ContentBody variant="default" glassEffect="glass-card">
				{#snippet children()}
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

					<!-- Enhanced iframe with glassmorphism and responsive design -->
					<div class="iframe-section">
						<IframeRenderer
							id="iwac-overview-visualization"
							src="https://fmadore.github.io/IWAC-overview/index.html"
							title="Islam West Africa Collection Overview"
							containerClass="iframe-container iframe-with-header iframe-interactive iframe-container-lg"
							scrolling="yes"
							allowfullscreen={true}
							glassEffect={true}
							glassVariant="glass-medium"
						/>
					</div>
				{/snippet}
			</ContentBody>
		</div>

		<div class="sidebar">
			<RelevantPublications projectName="Mining the Islam West Africa Collection" limit={5} animationDelay={DELAY_STEP * 12} />
			<div class="mt-6">
				<RelevantCommunications projectName="Mining the Islam West Africa Collection" limit={5} animationDelay={DELAY_STEP * 15} />
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

	.iframe-section {
		margin-top: var(--spacing-12);
		margin-bottom: var(--spacing-8);
		/* Add a subtle background to make glassmorphism more visible */
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), 0.05) 0%, 
			rgba(var(--color-accent-rgb), 0.03) 50%, 
			rgba(var(--color-highlight-rgb), 0.05) 100%);
		padding: var(--spacing-6);
		border-radius: var(--border-radius-lg);
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
