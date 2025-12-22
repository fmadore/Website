<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import RelevantGrants from '$lib/components/panels/RelevantGrants.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import ProjectImageBanner from '$lib/components/common/ProjectImageBanner.svelte';
	import ProjectYears from '$lib/components/common/ProjectYears.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { page } from '$app/stores'; // Import page store
	import { browser } from '$app/environment'; // Import browser check

	// Pre-construct breadcrumb items with evaluated paths
	const breadcrumbItems = [
		{ label: 'Research', href: `${base}/research` },
		{
			label: 'Digital Humanities and AI in African Studies',
			href: `${base}/research/dh-ai-african-studies`
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

<SEO 
	title="Digital Humanities and AI in African Studies | Frédérick Madore"
	description="Exploring how digital humanities and artificial intelligence can transform knowledge production in African studies through ethical, sustainable, and Africa-centred digital infrastructures."
	keywords="digital humanities, artificial intelligence, African studies, AI, DH, African epistemologies, Islam West Africa Collection, IWAC, LLM, OCR, NER, vibe coding"
/>

<div class="container py-8 page-enter">
	<!-- Apply grid layout to this container on medium screens and up -->
	<div class="content-wrapper">
		<div class="main-content max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader
				title="Digital Humanities and Artificial Intelligence in African Studies"
			/>

			<div class="mb-6">
				<ProjectYears years="2025-" />
			</div>

			<div class="scroll-reveal">
				<ProjectImageBanner
					src="{base}/images/research/IWAC.webp"
					alt="Digital Humanities and AI in African Studies"
					glassEffect="glass-medium"
					overlayIntensity="medium"
				/>
			</div>

			<div class="scroll-reveal">
				<ContentBody variant="default" glassEffect="glass-card">
				{#snippet children()}
					<p>
						The convergence of digital humanities (DH) and artificial intelligence (AI) is fundamentally transforming the production of knowledge in African studies. It offers unprecedented opportunities to reimagine cultural heritage, widen access to diverse narratives and amplify marginalised voices. This research agenda navigates the rapidly evolving landscape by examining how scholars can move beyond the mere digitisation of archives and address the structural inequalities inherent in global knowledge systems. As the field approaches an AI-driven "tipping point", this project explores how to design, evaluate and sustain digital infrastructures. Crucially, these systems must be grounded in African epistemologies, rather than simply retrofitting Western paradigms to local contexts.
					</p>

					<p>
						These critical enquiries form the basis of a collaborative research initiative comprising two workshops in 2026 <ItemReference id="volkswagenstiftung-dh-ai-african-studies-workshop-2026" /> <ItemReference id="stias-dh-ai-african-studies-workshop-2026" /> and an upcoming co-edited volume entitled <em>Digital Humanities and Artificial Intelligence in African Studies</em> (Bielefeld University Press). By bringing together scholars and practitioners from Africa, Europe and beyond, the project facilitates essential dialogue between the Global North and South. The project focuses on three interconnected themes: transforming research methods through computational tools, building sustainable infrastructures in resource-constrained settings, and centring African knowledge systems in digital design. By shifting the focus from abstract policy governance to "practising with AI", this project charts pathways for the ethical development of DH across the continent.
					</p>

					<h2>From Digital Hoarder to Historian-Programmer</h2>
					<p>
						My contribution addresses the practical "problem of scale" in African digital collections. I chart my evolution from "digital hoarder" to "historian-programmer" through the practice of "vibe coding", using natural language prompts to generate automation scripts. I argue that pipelines utilising Large Language Models (LLMs) can effectively take on the laborious tasks of optical character recognition (OCR), and named entity recognition (NER). Through the development of these Python-based workflows, I demonstrate how vast, under-resourced collections can be made more navigable for researchers and local communities alike.
					</p>

					<p>
						These methodological innovations are prototyped within the <a
							href="https://islam.zmo.de/s/westafrica/"
							target="_blank"
							rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a
						>, using its 25-million-word corpus as a testing ground for the limits of AI in historical research. For instance, I use AI sentiment analysis to apply "distant reading" techniques and investigate how Islam and Muslims are represented in Francophone West African newspapers. This research ultimately posits AI not as a replacement for human judgement, but as a pragmatic and scalable solution for processing the vast amount of born-digital material that will define the future of African history.
					</p>

					<RelevantGrants projectName="Digital Humanities and AI in African Studies" />
				{/snippet}
				</ContentBody>
			</div>
		</div>

		<div class="related-content mt-16 max-w-6xl mx-auto scroll-reveal">
			<RelevantPublications
				projectName="Digital Humanities and AI in African Studies"
				limit={6}
			/>
			<div class="mt-12">
				<RelevantCommunications
					projectName="Digital Humanities and AI in African Studies"
					limit={6}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	/* Page-specific styles can go here */
</style>
