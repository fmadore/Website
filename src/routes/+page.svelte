<script lang="ts">
	import LatestActivities from '$lib/components/panels/LatestActivities.svelte';
	import ProfileBanner from '$lib/components/common/ProfileBanner.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import SEO from '$lib/SEO.svelte';
	import { base, resolve } from '$app/paths';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import { profile } from '$lib/data/siteConfig';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	// Use the Person schema from page load data as additional schema
	const additionalSchemas = $derived(data.personSchema ? [data.personSchema] : []);

	// No JS preload for the portrait: the image below is in the prerendered
	// HTML with loading="eager" + fetchpriority="high", so the browser already
	// requests it from the preload scanner — a link injected after hydration
	// arrives long after the image has loaded.
</script>

<SEO
	title="Frédérick Madore | Historian | Digital Humanist"
	description="Frédérick Madore, historian of Islam in francophone West Africa and Data Curator at the Cluster of Excellence &quot;Africa Multiple&quot;, University of Bayreuth. He builds open digital collections with Omeka S and AI, including the Islam West Africa Collection (IWAC) and AMIRA."
	keywords="Frédérick Madore, Islam, West Africa, Digital Humanities, Artificial Intelligence, Omeka S, Islam West Africa Collection, IWAC, AMIRA, Africa Multiple Interactive Research Atlas, data curation, University of Bayreuth, Cluster of Excellence Africa Multiple, ZMO, Leibniz-Zentrum Moderner Orient, historian"
	canonical="https://www.frederickmadore.com"
	pageType="ProfilePage"
	dateModified={profile.dateModified}
	{additionalSchemas}
/>

<div class="container max-w-7xl py-8">
	<ProfileBanner />
	<div class="home-grid">
		<figure class="home-portrait">
			<img
				class="plate"
				src="{base}/images/Profile-picture.webp"
				alt="Frédérick Madore"
				width="380"
				height="330"
				loading="eager"
				decoding="async"
				fetchpriority="high"
			/>
		</figure>
		<!-- Keep this long prose column fully readable throughout scrolling. -->
		<div class="home-main">
			<ContentBody variant="default">
				<p>
					I am a Data Curator at the <a
						href="https://www.africamultiple.uni-bayreuth.de/en/index.html"
						target="_blank"
						rel="noopener noreferrer">Cluster of Excellence “Africa Multiple”</a
					>, University of Bayreuth (Germany), where I work at the point where research
					infrastructure meets African Studies. I help design the systems that make research data
					more findable and reusable under the FAIR and CARE principles, and I work with colleagues
					on the digital literacy and ethical standards that curation demands. Alongside this, I
					continue my own research at the intersection of Islamic studies,
					<a href={resolve('/digital-humanities')} data-sveltekit-preload-data>digital humanities</a
					>
					(DH), and artificial intelligence (AI).
				</p>
				<p>
					My <a href={resolve('/research')} data-sveltekit-preload-data>research</a> draws on
					fifteen years of work on Islam in francophone West Africa and extensive fieldwork in the
					region. It examines how Muslim communities, particularly youth and women, have engaged
					with politics, education, and the public sphere in Benin, Burkina Faso, Côte d’Ivoire, and
					Togo since the 1960s. Before Bayreuth, I was a Research Fellow at
					<a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer"
						>Leibniz-Zentrum Moderner Orient (ZMO)</a
					>
					in Berlin, and before that a
					<a
						href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html"
						target="_blank"
						rel="noopener noreferrer">Banting Postdoctoral Fellow</a
					>
					at the
					<a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer"
						>University of Florida</a
					>.
				</p>

				<h2>Digital Humanities and AI in African Studies</h2>
				<p>
					More recently, I have started applying computational methods and AI to that material, to
					see what they turn up once a corpus outgrows close reading, and where they mislead. The
					same question now organises
					<a href={resolve('/research/dh-ai-african-studies')} data-sveltekit-preload-data
						>a collaborative initiative I coordinate</a
					>: two international workshops in 2026, in
					<ItemReference
						id="volkswagenstiftung-dh-ai-african-studies-workshop-2026"
						label="Hanover"
					/>
					and
					<ItemReference id="stias-dh-ai-african-studies-workshop-2026" label="Stellenbosch" />, and
					a
					<a
						href={resolve(
							`/activities/dh-ai-african-studies-edited-volume` as `/activities/${string}`
						)}
						data-sveltekit-preload-data>co-edited volume</a
					>
					forthcoming with Bielefeld University Press. It brings together scholars from Africa, Europe,
					and beyond to examine how computational tools can change research practice without displacing
					African knowledge systems.
				</p>

				<h2>The <em>Islam West Africa Collection</em> (IWAC)</h2>
				<p>
					Since 2023, I have been developing the <a
						href="https://islam.zmo.de/s/westafrica/"
						target="_blank"
						rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a
					>, an open-access collection of more than 14,700 items on Islam across Benin, Burkina
					Faso, Côte d’Ivoire, Niger, Nigeria, and Togo.
					<a
						href="https://github.com/fmadore/iwac-ai-pipelines"
						target="_blank"
						rel="noopener noreferrer">AI-assisted workflows</a
					>
					carry the heavy processing: OCR and handwriting recognition, audio transcription, named-entity
					recognition, summarisation. Results are written back into the collection itself, so the machine-generated
					metadata travels with the record. A separate experiment compares
					<a
						href="https://iwac.frederickmadore.com/sentiment-analysis/"
						target="_blank"
						rel="noopener noreferrer">how three AI models read the tone</a
					> of press coverage of Islam.
				</p>

				<h2>Omeka S Development & AMIRA</h2>
				<p>
					IWAC runs on <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer"
						>Omeka S</a
					>, an open-source platform for digital collections, and so does most of my other digital
					work. I design custom modules and themes for it: search layers, visualisations, structured
					metadata, bilingual interfaces. All of it is open source, on
					<a href="https://github.com/fmadore" target="_blank" rel="noopener noreferrer">GitHub</a>.
				</p>
				<p>
					At Bayreuth I built <a
						href="https://data.africamultiple.uni-bayreuth.de/s/amira"
						target="_blank"
						rel="noopener noreferrer">AMIRA</a
					>, the Africa Multiple Interactive Research Atlas, on
					<a
						href={resolve('/digital-humanities/amira' as `/digital-humanities/${string}`)}
						data-sveltekit-preload-data
						>a custom theme, a federated search layer, and a visualisation module</a
					>. Built with our Digital Research Environment, it makes the collections of the Africa
					Multiple Research Centres in Burkina Faso, Kenya, Nigeria, and South Africa searchable
					from one place: close to 4,000 research items, more than 90 projects, some 1,600 people,
					and nearly 600 institutions. IWAC has a visualisation module of its own, which generates
					its
					<a
						href="https://islam.zmo.de/s/westafrica/page/explore"
						target="_blank"
						rel="noopener noreferrer">interactive views</a
					>: maps, networks of people and organisations, machine-derived themes, and charts of how
					words rise and fall across the decades.
				</p>

				<h2>Books & Publications</h2>
				<p>
					My latest book, <em>Religious Activism on Campuses in Togo and Benin</em>
					<ItemReference id="religious-activism-campuses" />, examines the emergence of Christian
					and Muslim student associations in the 1970s and how they reshaped university life in Lomé
					and Abomey-Calavi, against prevailing secular ideologies. I am also the author of
					<em>La construction d’une sphère publique musulmane en Afrique de l’Ouest</em>
					<ItemReference id="sphere-publique-musulmane" /> and the co-editor of
					<em>Religiosity on University Campuses in Africa</em>
					<ItemReference id="religiosity-university-campuses" />. In addition, I have co-edited two
					special journal issues: “Muslim Minorities in Africa, Part 1”
					<ItemReference id="muslim-minorities-africa-1" /> & “Part 2”
					<ItemReference id="muslim-minorities-africa-2" /> and “Les acteurs religieux africains à l’ère
					du numérique”
					<ItemReference id="acteurs-religieux-numerique" />. My research has been
					<a href={resolve('/publications')} data-sveltekit-preload-data>published</a> in eleven peer-reviewed
					journals and seven edited volumes.
				</p>

				<h2>Consulting</h2>
				<p>
					Beyond academia, I work with <a
						href="https://communitology.co/"
						target="_blank"
						rel="noopener noreferrer">Communitology</a
					>
					to produce specialised Country of Origin Information (COI) reports for asylum and immigration
					cases involving Benin, Côte d’Ivoire, and Togo.
				</p>
			</ContentBody>
		</div>
		<div class="home-rail">
			<LatestActivities limit={3} />
		</div>
	</div>
</div>

<style>
	/* Asymmetric editorial grid: prose + sections in the wide column, the
	 * portrait plate and the latest-activities ledger in the rail. On mobile the
	 * source order (portrait → prose → activities) puts the photo up top, right
	 * above the intro; on desktop it moves into the right rail via grid placement. */
	.home-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		margin-top: var(--space-2xl);
	}

	@media (--md) {
		.home-grid {
			grid-template-columns: minmax(0, 1fr) 22rem;
			grid-template-rows: auto 1fr;
			column-gap: var(--space-3xl);
			row-gap: var(--space-xl);
			align-items: start;
		}

		.home-main {
			grid-column: 1;
			grid-row: 1 / 3;
		}

		.home-portrait {
			grid-column: 2;
			grid-row: 1;
		}

		.home-rail {
			grid-column: 2;
			grid-row: 2;
		}
	}

	/* Lead paragraph — the standfirst of the page body, one step larger. */
	.home-main :global(.content-body > p:first-of-type),
	.home-main :global(.prose > p:first-of-type) {
		font-size: var(--font-size-xl);
		line-height: var(--line-height-normal);
		color: var(--color-text-emphasis);
	}

	/* Body copy sits one step up from the site base — the homepage intro is meant
	 * to be read, not scanned. The lead paragraph above stays a step larger. */
	.home-main :global(.content-body > p) {
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
	}

	/* Each content section opens with a 3px ink rule above the Archivo title —
	 * hierarchy drawn in rules, so the page scans as a set of sections. */
	.home-main :global(.content-body > h2) {
		margin-top: var(--space-2xl);
		padding-top: var(--space-md);
		border-top: var(--rule-section) solid var(--color-primary);
	}

	.home-portrait {
		margin: 0;
	}

	.home-portrait .plate {
		width: 100%;
		aspect-ratio: 380 / 330;
		object-fit: cover;
	}

	/* Cap the portrait on mobile so the hero photo reads as a plate, not a
	 * full-bleed banner, while still sitting right above the intro. */
	@media (--sm-down) {
		.home-portrait {
			max-width: 22rem;
		}
	}
</style>
