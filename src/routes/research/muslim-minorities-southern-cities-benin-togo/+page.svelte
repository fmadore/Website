<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import RelevantGrants from '$lib/components/panels/RelevantGrants.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import ProjectImageBanner from '$lib/components/common/ProjectImageBanner.svelte';
	import ProjectYears from '$lib/components/common/ProjectYears.svelte';
	import MediaPlayer from '$lib/components/media/MediaPlayer.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';

	// Pre-construct breadcrumb items with evaluated paths
	const breadcrumbItems = [
		{ label: 'Research', href: `${base}/research` },
		{
			label: 'Muslim Minorities in Southern Cities',
			href: `${base}/research/muslim-minorities-southern-cities-benin-togo`
		}
	];

	// Inject breadcrumb JSON-LD structured data
	useBreadcrumbJsonLd(() => breadcrumbItems);
</script>

<SEO title="Muslim Minorities in Southern Cities of Benin and Togo | Frédérick Madore" />

<div class="container py-8 page-enter">
	<div class="content-wrapper">
		<div class="main-content max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader title="Muslim Minorities in Southern Cities of Benin and Togo" />

			<div class="mb-6">
				<ProjectYears years="2018-2020" />
			</div>

			<div class="scroll-reveal">
				<ProjectImageBanner
					src="{base}/images/research/muslim-minorities.webp"
					alt="Muslim Minorities in Southern Cities of Benin and Togo"
					glassEffect="glass-medium"
					overlayIntensity="medium"
				/>
			</div>

			<div class="scroll-reveal">
				<ContentBody variant="default" glassEffect="glass-card">
				{#snippet children()}
					<p>
						Muslims in Benin and Togo rarely make international headlines, except when warnings are 
						issued about jihadist groups from the Sahel region encroaching on the Gulf of Guinea. 
						This project moves beyond such narrow security concerns to examine the everyday lives of 
						Muslim minorities in Cotonou, Porto-Novo, and Lomé. Using a combination of archival 
						research and long-term ethnography, it traces the trajectories of these communities from 
						the 1960s to the present day. It explores how living as an internally diverse minority 
						within a Christian-majority environment shapes religious practice, civic engagement and 
						claims to citizenship.
					</p>
					<p>
						A key finding of this project is that political elites often exploit global terror 
						narratives to neutralise domestic dissent. In Togo, for example, the Faure Gnassingbé 
						regime responded to the anti-government protests of 2017–2018 by pitting state-loyal 
						"good Muslims" against perceived opposition-aligned "bad Muslims". By branding the 
						opposition leader Tikpi Atchadam and his party as "Salafi" radicals, the state exploited 
						Western fears of jihadism to discredit calls for democratic reform <ItemReference
							id="good-muslim-bad-muslim-togo-2021"
						/>.
					</p>
					<p>
						In neighbouring Benin, Imam Ibrahim Ousmane's controversial election to the National Assembly in 2019 exposed divisions within the Muslim community regarding legitimate representation in a minority context <ItemReference 
							id="beninese-imam-election-2022" 
						/>. In both cases, accusations of "radicalisation" are employed as rhetorical weapons in 
						disputes over local leadership and resources, rather than reflecting imported ideologies <ItemReference
							id="lutte-terrorisme-salafisme-benin-togo-2022"
						/>.
					</p>
					<p>
						Beyond politics, the project examined the statistical narratives that shape religious 
						life in these countries. While official census data suggests a clear shift from "African 
						traditional religions" to monotheism, a critical analysis of religious categorisation 
						reveals a more complex reality. In Benin, for example, Muslim and Christian 
						identities rarely exist in isolation; they often overlap with long-standing Vodun 
						practices <ItemReference
							id="repenser-categorisation-religieuse-benin-2026"
						/>. By transcending rigid theological boundaries, this research shows that minority 
						status is not just a demographic limitation, but a dynamic space in which believers 
						navigate faith, power and belonging in one of the most religiously diverse areas of West 
						Africa.
					</p>

				<RelevantGrants projectName="Muslim Minorities in Southern Cities of Benin and Togo" />
			{/snippet}
			</ContentBody>
			</div>			<div class="scroll-reveal">
				<MediaPlayer
					src="{base}/notebooklm/muslim-minorities-southern-cties-Benin-Togo.mp3"
					type="audio"
					title="Google NotebookLM Podcast Discussion"
					glassEffect="glass-card"
					showControls={true}
				/>
			</div>		</div>

		<div class="related-content mt-16 max-w-6xl mx-auto scroll-reveal">
			<RelevantPublications
				projectName="Muslim Minorities in Southern Cities of Benin and Togo"
				limit={6}
			/>
			<div class="mt-12">
				<RelevantCommunications
					projectName="Muslim Minorities in Southern Cities of Benin and Togo"
					limit={6}
				/>
			</div>
		</div>
	</div>
</div>
