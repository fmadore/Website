<script lang="ts">
	import LatestActivities from '$lib/components/panels/LatestActivities.svelte';
	import ProfileBanner from '$lib/components/common/ProfileBanner.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	// Use the Person schema from page load data as additional schema
	const additionalSchemas = $derived(data.personSchema ? [data.personSchema] : []);

	// Preload profile picture since it's above-the-fold on home page
	$effect(() => {
		if (browser) {
			const profilePreloadId = 'profile-picture-preload';
			if (document.getElementById(profilePreloadId)) return;

			const preloadLink = document.createElement('link');
			preloadLink.id = profilePreloadId;
			preloadLink.rel = 'preload';
			preloadLink.as = 'image';
			preloadLink.href = `${base}/images/Profile-picture.webp`;
			document.head.appendChild(preloadLink);

			return () => {
				const linkElement = document.getElementById(profilePreloadId);
				if (linkElement) document.head.removeChild(linkElement);
			};
		}
	});
</script>

<SEO
	title="Frédérick Madore | Historian | Digital Humanist"
	description="Frédérick Madore, Data Curator at the Cluster of Excellence &quot;Africa Multiple&quot;, University of Bayreuth, and formerly Research Fellow at ZMO, studies Islam in francophone West Africa combining fieldwork, digital humanities, and AI-enhanced pipelines for computational analysis."
	keywords="Frédérick Madore, Islam, West Africa, Digital Humanities, Research, University of Bayreuth, Cluster of Excellence Africa Multiple, ZMO, Leibniz-Zentrum Moderner Orient, historian"
	canonical="https://www.frederickmadore.com"
	pageType="ProfilePage"
	{additionalSchemas}
/>

<div class="container max-w-7xl py-8 page-enter">
	<ProfileBanner />
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
		<div class="md:col-span-2 scroll-reveal">
			<ContentBody variant="default" glassEffect="glass-card">
				<p>
					I am a Data Curator at the <a
						href="https://www.africamultiple.uni-bayreuth.de/en/index.html"
						target="_blank"
						rel="noopener noreferrer">Cluster of Excellence "Africa Multiple"</a
					>, University of Bayreuth (Germany). In this role, I bridge the gap between technical
					infrastructure and African Studies, supporting researchers in managing data according to
					FAIR and CARE principles while ensuring that digital literacy and ethical standards are
					integrated into our workflows. I also continue my research at the intersection of Islamic
					studies,
					<a href="{base}/digital-humanities" data-sveltekit-preload-data>digital humanities</a>
					(DH), and artificial intelligence (AI), exploring how emerging technologies can transform the
					way we access, analyse, and interpret historical archives.
				</p>
				<p>
					My work combines over a decade of expertise on Islam in Francophone West Africa and
					extensive fieldwork in the region. My <a
						href="{base}/research"
						data-sveltekit-preload-data>research</a
					>
					examines the diverse ways Muslim communities, notably youth and women, have engaged with politics,
					education, and the public sphere in Benin, Burkina Faso, Côte d'Ivoire, and Togo since the 1960s—and
					how computational methods can reveal new patterns across these histories. Previously, I was
					a Research Fellow at
					<a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer"
						>Leibniz-Zentrum Moderner Orient (ZMO)</a
					>.
				</p>

				<h3>DH, AI, and the <em>Islam West Africa Collection</em> (IWAC)</h3>
				<p>
					Since 2023, I have been developing the <a
						href="https://islam.zmo.de/s/westafrica/"
						target="_blank"
						rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a
					>, an open-access database comprising over 14,500 items relating to Islam across the
					region. I experiment with
					<a
						href="https://github.com/fmadore/iwac-ai-pipelines"
						target="_blank"
						rel="noopener noreferrer">AI-assisted workflows</a
					> to process under-resourced African archives at scale.
				</p>
				<p>
					I also explore how "vibe coding" and agentic AI tools can democratise the use of
					computational methods by allowing social science scholars to prototype applications
					through natural language prompts. Data visualisation transforms analyses into accessible
					narratives: the
					<a
						href="https://fmadore.github.io/iwac-dashboard/"
						target="_blank"
						rel="noopener noreferrer">IWAC Dashboard</a
					>
					lets users explore the collection through interactive maps, networks, and word clouds, while
					the
					<a
						href="https://fmadore.github.io/IWAC-sentiment-analysis/"
						target="_blank"
						rel="noopener noreferrer">IWAC Sentiment Analysis</a
					>
					reveal how newspapers portray Islam across the region.
				</p>

				<h3>Current Project</h3>
				<p>
					I am coordinating
					<a href="{base}/research/dh-ai-african-studies" data-sveltekit-preload-data
						><em>Digital Humanities and AI in African Studies</em></a
					>, a collaborative research initiative comprising two international workshops in 2026 (<ItemReference
						id="volkswagenstiftung-dh-ai-african-studies-workshop-2026"
						label="Hanover"
					/>
					and
					<ItemReference id="stias-dh-ai-african-studies-workshop-2026" label="Stellenbosch" />) and
					a
					<a
						href="{base}/activities/dh-ai-african-studies-edited-volume"
						data-sveltekit-preload-data>forthcoming co-edited volume</a
					>
					to be published by Bielefeld University Press. This project brings together scholars from Africa,
					Europe, and beyond to examine how computational tools can transform research methods while centring
					African knowledge systems.
				</p>

				<h3>Books & Publications</h3>
				<p>
					My recent book, <em>Religious Activism on Campuses in Togo and Benin</em>
					<ItemReference id="religious-activism-campuses" />, examines the emergence of Christian
					and Muslim student associations in the 1970s and their subsequent reshaping of university
					life in Lomé and Abomey-Calavi, challenging the prevailing secular ideologies. I am also
					the author of
					<em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em>
					<ItemReference id="sphere-publique-musulmane" /> and the co-editor of
					<em>Religiosity on University Campuses in Africa</em>
					<ItemReference id="religiosity-university-campuses" />. In addition, I have co-edited two
					special journal issues: "Muslim Minorities in Africa, Part 1"
					<ItemReference id="muslim-minorities-africa-1" /> & "Part 2"
					<ItemReference id="muslim-minorities-africa-2" /> and "Les acteurs religieux africains à l'ère
					du numérique"
					<ItemReference id="acteurs-religieux-numerique" />. My research has been
					<a href="{base}/publications" data-sveltekit-preload-data>published</a> in eleven peer-reviewed
					journals and seven edited volumes.
				</p>

				<h3>Consulting</h3>
				<p>
					Beyond academia, I work with <a
						href="https://communitology.co/"
						target="_blank"
						rel="noopener noreferrer">Communitology</a
					>
					to produce specialised Country of Origin Information (COI) reports for asylum and immigration
					cases involving Benin, Côte d'Ivoire, and Togo.
				</p>

				<h3>Training & Affiliations</h3>
				<p>
					I hold a Ph.D. in History from <a
						href="https://www.ulaval.ca/"
						target="_blank"
						rel="noopener noreferrer">Université Laval</a
					>
					and previously held a
					<a
						href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html"
						target="_blank"
						rel="noopener noreferrer">Banting Postdoctoral Fellowship</a
					>
					at the
					<a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer"
						>University of Florida</a
					>.
				</p>
			</ContentBody>
		</div>
		<aside class="md:col-span-1 scroll-reveal">
			<LatestActivities limit={3} />
		</aside>
	</div>
</div>
