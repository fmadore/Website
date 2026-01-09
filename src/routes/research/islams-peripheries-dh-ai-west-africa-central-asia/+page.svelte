<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import RelevantGrants from '$lib/components/panels/RelevantGrants.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import ProjectImageBanner from '$lib/components/common/ProjectImageBanner.svelte';
	import ProjectYears from '$lib/components/common/ProjectYears.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';

	// Pre-construct breadcrumb items
	const breadcrumbItems = [
		{ label: 'Research', href: `${base}/research` },
		{
			label: "Islam's 'Peripheries'",
			href: `${base}/research/islams-peripheries-dh-ai-west-africa-central-asia`
		}
	];

	// Inject breadcrumb JSON-LD structured data
	useBreadcrumbJsonLd(() => breadcrumbItems);
</script>

<SEO
	title="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia | Frédérick Madore"
	description="A research project using AI to unlock historical collections about Islamic communities in West Africa and Central Asia, focusing on comparative analysis of Islamic discourse and responses to modernity."
	keywords="Digital Humanities, AI, West Africa, Central Asia, Islam, Archives, Comparative History, Algorithmic Analysis"
/>

<div class="container py-8 page-enter">
	<div class="content-wrapper">
		<div class="main-content max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader
				title="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
			/>

			<div class="mb-6">
				<ProjectYears years="2026-2027" />
			</div>

			<div class="scroll-reveal">
				<ProjectImageBanner
					src="{base}/images/research/islams-peripheries.webp"
					alt="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
					glassEffect="glass-medium"
					overlayIntensity="medium"
				/>
			</div>

			<div class="scroll-reveal">
				<ContentBody variant="default" glassEffect="glass-card">
					{#snippet children()}
						<p class="lead">
							This research project (2026-2027), co-directed with <a
								href="https://www.zmo.de/en/people/dr-aksana-ismailbekova"
								target="_blank"
								rel="noopener noreferrer">Aksana Ismailbekova</a
							>, uses artificial intelligence (AI) to unlock valuable historical collections about
							Islamic communities in West Africa and Central Asia. These archives contain thousands of
							documents in multiple languages (including Russian, Arabic, Hausa, and Tajik) that have
							remained largely inaccessible due to their volume and complexity.
						</p>

						<p>
							The project focuses on two often-overlooked regions: West Africa (post-1960s) and
							Central Asia (colonial/early Soviet era and documents from the Tajik civil war,
							1992-97). By comparing these regions, we explore how Islamic discourse and responses
							to modernity developed in different contexts.
						</p>

						<h2>AI-Driven Comparative History</h2>
						<p>Using AI technologies, we aim to:</p>
						<ol>
							<li>
								<strong>Develop systems</strong> that recognize multilingual text and identify key information
								across diverse scripts and layouts.
							</li>
							<li>
								<strong>Create a chatbot</strong> that answers complex questions using documents across
								languages, enabling researchers to ask natural language questions like "How were notions
								of 'reform' debated differently in these contexts?"
							</li>
							<li>
								<strong>Ensure accessibility</strong> by prioritizing open-source, low-resource AI models,
								promoting equitable research practices that don't rely on high-resource institutional
								walls.
							</li>
						</ol>

						<p>
							This approach will reveal previously hidden connections and demonstrate how diverse
							Islamic communities navigated major historical transitions. All findings and tools will
							be made freely available, benefiting researchers worldwide, especially in West Africa
							and Central Asia.
						</p>

						<h2>Unlocking "Peripheral" Archives</h2>
						<p>
							Our work focuses on two unique, multilingual archives housed at <a
								href="https://www.zmo.de/en"
								target="_blank"
								rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a
							>:
						</p>
						<ul>
							<li>
								The <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"
									><em>Islam West Africa Collection</em></a
								>: Covering post-1960s Islamic discourse and public engagement.
							</li>
							<li>
								The <a
									href="https://www.zmo.de/en/library/special-collection-1/translate-to-english-reinhard-eisener-bestand"
									target="_blank"
									rel="noopener noreferrer"><em>Reinhard Eisener Collection</em></a
								>: Documenting colonial and early Soviet governance in Central Asia, including materials
								from the Tajik civil war.
							</li>
						</ul>

						<p>
							By combining expertise in regional studies, history, and AI, this project will uncover
							important historical insights while creating new methods for studying complex archives
							globally.
						</p>

						<RelevantGrants
							projectName="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
						/>
					{/snippet}
				</ContentBody>
			</div>
		</div>

		<div class="related-content mt-16 max-w-6xl mx-auto scroll-reveal">
			<RelevantPublications
				projectName="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
				limit={6}
			/>
			<div class="mt-12">
				<RelevantCommunications
					projectName="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
					limit={6}
				/>
			</div>
		</div>
	</div>
</div>
