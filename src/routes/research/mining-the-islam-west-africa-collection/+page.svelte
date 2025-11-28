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

<div class="container py-8">
	<!-- Apply grid layout to this container on medium screens and up -->
	<div
		class="content-wrapper"
		use:scrollAnimate={{ delay: DELAY_STEP, animationClass: 'fade-in-up' }}
	>
		<div class="main-content max-w-6xl mx-auto">
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
						Scholarship on Islam in West Africa has long privileged manuscript traditions, leaving
						the vibrant Muslim periodical press of the 1980s, 90s, and early 2000s largely
						unexplored. My project fills this gap by tracing the emergence of modern Islamic print
						culture and the networks of Western-educated Francophone Muslim intellectuals who
						animated it in Benin, Burkina Faso, Côte d'Ivoire and Togo.
					</p>

					<p>
						Working with the <a
							href="https://islam.zmo.de/s/westafrica/"
							target="_blank"
							rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a
						>, I combine digital humanities methods with close reading to analyse around 1,500
						Islamic publications published between 1980 and 2020. Topic modelling, word embeddings,
						and sentiment analysis chart the shifting meanings of key religious terms (<em>ummah</em
						>, Salafism, <em>jihad</em>) alongside political concepts such as democracy and
						<em>laïcité</em>), revealing the themes, semantic turns and affective registers that
						have shaped Muslim public debate during a period of rapid socio-political change.
					</p>

					<p>
						Network analysis maps the contours of an "Islamic Francophonie", visualising the links
						between authors, publishers, NGOs and state institutions. These visualisations show how
						French became a strategic language for Islamic debate among urban elites, and how
						regionally rooted networks engaged with - rather than merely echoed - broader
						Arab-Islamic currents.
					</p>

					<p>
						By integrating these computational insights with ethnographic fieldwork and close
						textual study, the project offers a composite portrait of Islamic thought in Francophone
						West Africa - one that situates religious ideas within their material, linguistic and
						political ecologies. In doing so, it advances the intellectual history of the region and
						proposes a new approach to the study of print publics at the intersection of religion,
						morality, and civic life.
					</p>

					<!-- Enhanced iframe with glassmorphism and responsive design -->
					<div class="iframe-section">
						<IframeRenderer
							id="iwac-overview-visualization"
							src="https://fmadore.github.io/iwac-dashboard/?lang=en&theme=light"
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

		<div class="related-content mt-16 max-w-6xl mx-auto">
			<RelevantPublications
				projectName="Mining the Islam West Africa Collection"
				limit={6}
				animationDelay={DELAY_STEP * 12}
			/>
			<div class="mt-12">
				<RelevantCommunications
					projectName="Mining the Islam West Africa Collection"
					limit={6}
					animationDelay={DELAY_STEP * 15}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	/* Interactive content section with glassmorphism - consistent with activity pages */
	.iframe-section {
		position: relative;
		margin-top: var(--space-xl);
		margin-bottom: var(--space-lg);
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		/* Enhanced glassmorphism with subtle gradient overlay */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
	}

	.iframe-section:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.iframe-section {
			transition: none;
		}

		.iframe-section:hover {
			transform: none;
		}
	}

	/* Dark mode adjustments */
	:global(html.dark) .iframe-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
	}
</style>
