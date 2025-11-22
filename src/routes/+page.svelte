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
	const jsonLdString = $derived(data.jsonLdString);

	const jsonLdScriptId = 'person-json-ld';

	$effect(() => {
		if (browser && jsonLdString) {
			if (document.getElementById(jsonLdScriptId)) return;
			const script = document.createElement('script');
			script.id = jsonLdScriptId;
			script.type = 'application/ld+json';
			script.textContent = jsonLdString;
			document.head.appendChild(script);

			return () => {
				const scriptElement = document.getElementById(jsonLdScriptId);
				if (scriptElement) document.head.removeChild(scriptElement);
			};
		}
	});

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
	description="Frédérick Madore, Research Fellow at ZMO, studies Islam in francophone West Africa combining fieldwork, digital humanities, and AI-enhanced pipelines for computational analysis."
/>

<div class="container max-w-7xl py-8">
	<ProfileBanner />
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
		<div class="md:col-span-2">
			<ContentBody variant="default" glassEffect="glass-card">
				<p>
					I am a Research Fellow in the <a
						href="https://www.zmo.de/en/research/religion-and-intellectual-culture"
						target="_blank"
						rel="noopener noreferrer">Religion and Intellectual Culture</a
					>
					unit at
					<a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer"
						>Leibniz-Zentrum Moderner Orient (ZMO)</a
					>. My research explores how Islamic movements and Muslim intellectuals have navigated
					secular governance and influenced public discourse in Francophone West Africa since the
					1960s. I analyse these dynamics by combining extensive fieldwork and archival research
					with
					<a href="{base}/digital-humanities" data-sveltekit-preload-data>digital humanities</a> (DH)
					and artificial intelligence (AI), examining them from local case studies to region-wide patterns.
					My work focuses on Benin, Burkina Faso, Côte d'Ivoire and Togo, paying particular attention
					to universities and other educational institutions as key sites of religious mobilisation.
				</p>

				<h2>DH, AI, and the Islam West Africa Collection (IWAC)</h2>
				<p>
					Since 2023, I am developing the <a
						href="https://islam.zmo.de/s/westafrica/"
						target="_blank"
						rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a
					>, an open-access database comprising over 13,500 items relating to Islam across the
					region. I use computational methods and
					<a
						href="https://github.com/fmadore/iwac-ai-pipelines"
						target="_blank"
						rel="noopener noreferrer">AI-assisted workflows</a
					> to map patterns in religious mobilisation, track shifts in Islamic discourse, analyse media
					representations of Islam and trace the changing relationships between Muslim communities and
					state authorities. Data visualisation transforms these analyses into accessible narratives
					for scholarly and public audiences.
				</p>
				<h2>Books & Publications</h2>
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
					special journal issues: "Muslim Minorities in Africa, Part 1" <ItemReference
						id="muslim-minorities-africa-1"
					/> & "Part 2" <ItemReference id="muslim-minorities-africa-2" /> and "Les acteurs religieux
					africains à l'ère du numérique" <ItemReference id="acteurs-religieux-numerique" />. My
					<a href="{base}/publications" data-sveltekit-preload-data>research</a> has been published in
					eleven peer-reviewed journals and six edited volumes.
				</p>

				<h2>Consulting</h2>
				<p>
					Beyond academia, I work with <a
						href="https://communitology.co/"
						target="_blank"
						rel="noopener noreferrer">Communitology</a
					>, to produce specialised Country of Origin Information (COI) reports for asylum and
					immigration cases involving Benin, Côte d'Ivoire, and Togo.
				</p>

				<h2>Training & Affiliations</h2>
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
					>. Through my ongoing <a href="{base}/research">research</a> and
					<a href="{base}/digital-humanities">DH projects</a>, I combine historical methods with
					computational techniques to advance understanding of Muslim societies in Francophone West
					Africa.
				</p>
			</ContentBody>
		</div>
		<aside class="md:col-span-1">
			<LatestActivities limit={3} />
		</aside>
	</div>
</div>
