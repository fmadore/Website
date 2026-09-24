<script lang="ts">
	import LatestActivities from '$lib/components/panels/LatestActivities.svelte';
	import ProfileBanner from '$lib/components/common/ProfileBanner.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import SEO from '$lib/SEO.svelte';
	import { base, resolve } from '$app/paths';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { author, profile, website } from '$lib/data/siteConfig';
	import { buildSrcset } from '$lib/utils/imageVariants';
	import type { PageData } from './$types';

	// The portrait's slot is 22rem wide on a phone (capped), 18rem at --md and
	// 380px from --lg — the record rail's width — so a 2× screen wants ~760 px;
	// the 854 px source and its 400/800 derivatives come from the variant
	// manifest, like every plate.
	const portraitSrc = `${base}/images/Profile-picture.webp`;
	const portraitSrcset = buildSrcset(portraitSrc);
	const PORTRAIT_SIZES =
		'(max-width: 767px) min(100vw - 2rem, 22rem), (max-width: 1023px) 18rem, 380px';

	let { data } = $props<{ data: PageData }>();

	// Use the Person schema from page load data as additional schema
	const additionalSchemas = $derived(data.personSchema ? [data.personSchema] : []);

	// No JS preload for the portrait: the image below is in the prerendered
	// HTML with loading="eager" + fetchpriority="high", so the browser already
	// requests it from the preload scanner — a link injected after hydration
	// arrives long after the image has loaded.
</script>

<SEO
	title="{author.name} | {author.positionShort}"
	description="Frédérick Madore, historian of Islam in francophone West Africa and Data Curator at the Cluster of Excellence &quot;Africa Multiple&quot;, University of Bayreuth. He builds open digital collections with Omeka S and AI, including the Islam West Africa Collection (IWAC) and AMIRA."
	keywords="Frédérick Madore, Islam, West Africa, Digital Humanities, Artificial Intelligence, Omeka S, Islam West Africa Collection, IWAC, AMIRA, Africa Multiple Interactive Research Atlas, data curation, University of Bayreuth, Cluster of Excellence Africa Multiple, ZMO, Leibniz-Zentrum Moderner Orient, historian"
	canonical={website.url}
	pageType="ProfilePage"
	dateModified={profile.dateModified}
	{additionalSchemas}
/>

<div class="home-shell py-8">
	<ProfileBanner />
	<div class="home-grid">
		<figure class="home-portrait">
			<img
				class="plate"
				src={portraitSrc}
				srcset={portraitSrcset}
				sizes={portraitSrcset ? PORTRAIT_SIZES : undefined}
				alt="Frédérick Madore"
				width="854"
				height="742"
				loading="eager"
				decoding="async"
				fetchpriority="high"
			/>
		</figure>
		<!-- Keep this long prose column fully readable throughout scrolling. -->
		<div class="home-main">
			<ContentBody variant="default" additionalClasses="home-prose">
				<p>
					I am a Data Curator at the <a
						href="https://www.africamultiple.uni-bayreuth.de/en/index.html"
						target="_blank"
						rel="noopener noreferrer"
						>Cluster of Excellence “Africa Multiple”<span class="sr-only">
							(opens in new tab)</span
						></a
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
						>Leibniz-Zentrum Moderner Orient (ZMO)<span class="sr-only">
							(opens in new tab)</span
						></a
					>
					in Berlin, and before that a
					<a
						href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html"
						target="_blank"
						rel="noopener noreferrer"
						>Banting Postdoctoral Fellow<span class="sr-only"> (opens in new tab)</span></a
					>
					at the
					<a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer"
						>University of Florida<span class="sr-only"> (opens in new tab)</span></a
					>.
				</p>

				<h2>Digital humanities and AI in African studies</h2>
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
						rel="noopener noreferrer"
						><em>Islam West Africa Collection</em> (IWAC)<span class="sr-only">
							(opens in new tab)</span
						></a
					>, an open-access collection of more than 17,500 items on Islam across Benin, Burkina
					Faso, Côte d’Ivoire, Niger, Nigeria, and Togo.
					<a
						href="https://github.com/fmadore/iwac-ai-pipelines"
						target="_blank"
						rel="noopener noreferrer"
						>AI-assisted workflows<span class="sr-only"> (opens in new tab)</span></a
					>
					carry the heavy processing: OCR and handwriting recognition, audio transcription, named-entity
					recognition, summarisation. Results are written back into the collection itself, so the machine-generated
					metadata travels with the record. A separate experiment compares
					<a
						href="https://iwac.frederickmadore.com/sentiment-analysis/"
						target="_blank"
						rel="noopener noreferrer"
						>how three AI models read the tone<span class="sr-only"> (opens in new tab)</span></a
					> of press coverage of Islam.
				</p>

				<h2>Omeka S development & AMIRA</h2>
				<p>
					IWAC runs on <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer"
						>Omeka S<span class="sr-only"> (opens in new tab)</span></a
					>, an open-source platform for digital collections, and so does most of my other digital
					work. I design custom modules and themes for it: search layers, visualisations, structured
					metadata, bilingual interfaces. All of it is open source, on
					<a href="https://github.com/fmadore" target="_blank" rel="noopener noreferrer"
						>GitHub<span class="sr-only"> (opens in new tab)</span></a
					>.
				</p>
				<p>
					At Bayreuth I built <a
						href="https://data.africamultiple.uni-bayreuth.de/s/amira"
						target="_blank"
						rel="noopener noreferrer">AMIRA<span class="sr-only"> (opens in new tab)</span></a
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
						rel="noopener noreferrer"
						>interactive views<span class="sr-only"> (opens in new tab)</span></a
					>: maps, networks of people and organisations, machine-derived themes, and charts of how
					words rise and fall across the decades.
				</p>

				<h2>Books & publications</h2>
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
				<!-- The section's own way into the index. The word "published" in the
				     paragraph above was the only route to the bibliography from this
				     page, eight paragraphs down; the activities rail beside it has
				     carried a named control to its index all along. -->
				<p class="home-section-cta">
					<Button href={resolve('/publications')} variant="outline-secondary" size="base">
						View all publications <span aria-hidden="true">→</span>
					</Button>
				</p>

				<h2>Consulting</h2>
				<p>
					Beyond academia, I work with <a
						href="https://communitology.co/"
						target="_blank"
						rel="noopener noreferrer"
						>Communitology<span class="sr-only"> (opens in new tab)</span></a
					>
					to produce specialised Country of Origin Information (COI) reports for asylum and immigration
					cases involving Benin, Côte d’Ivoire, and Togo.
				</p>
			</ContentBody>
		</div>
		<div class="home-rail">
			<LatestActivities log={data.activityLog} />
		</div>
	</div>
</div>

<style>
	/* The record rail, shared. This page is the site's other prose-beside-a-rail
	 * surface, so it is set on exactly the shell `RecordLayout` gives every
	 * detail route — `--container-lg`, centred — rather than on a width of its
	 * own. It used to be a 58rem block flush to the container's left edge: at
	 * 1440 that put the front page at 89–1017 while every other page ran
	 * 137–1289, so arriving from a section index moved the whole page left and
	 * narrowed it, and left 320px of dead paper down the right margin.
	 *
	 * A cap, not a second container: the shell must never carry `.container`
	 * itself — nested inside the layout's own it takes a second 16px gutter.
	 * The trade the centring makes is deliberate: the hero nameplate no longer
	 * starts on the masthead wordmark's edge, because on this site no page's
	 * content does. Agreeing with the other twenty pages is worth more than
	 * agreeing with the wordmark alone. */
	.home-shell {
		max-width: var(--container-lg);
		margin-inline: auto;
	}

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

	/* Tablet keeps the two columns but on a narrower rail. The rail was a flat
	 * 22rem from --md up, which at a 768px container left the reading column
	 * 320px — narrower than the sidebar beside it, and about 44 characters of
	 * prose. The rail is never wider than the record it points at. */
	@media (--md) {
		.home-grid {
			grid-template-columns: minmax(0, 1fr) 18rem;
			grid-template-rows: auto 1fr;
			column-gap: var(--space-xl);
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

	/* From --lg the grid is the record grid, value for value: a flexible reading
	 * column, a --space-3xl gutter and the same 380px rail every record page
	 * carries its metadata in. At 1024 that resolves to 580 / 64 / 380, so the
	 * portrait plate and the activities ledger line up across the site. */
	@media (--lg) {
		.home-grid {
			grid-template-columns: minmax(0, 1fr) 380px;
			column-gap: var(--space-3xl);
		}
	}

	/* The section's trailing control. A paragraph, so it keeps the prose
	 * rhythm around it; the control inside is the same outline button the
	 * activities rail closes with. */
	.home-main :global(.home-section-cta) {
		margin-top: var(--space-lg);
	}

	/* The prose sits directly on the paper, so ContentBody's inset is pure
	 * indent — and it pushed each section rule 32px in from the nameplate rule
	 * above it, so the two tiers of the same rule system started at different
	 * places. Zeroed: the rules stack flush, which is the whole point of drawing
	 * hierarchy in them. */
	/* One edge for rule and text alike. The Measured Line Rule used to be set on
	 * the paragraphs alone — `.content-body` never carried a measure, only
	 * `.prose` did, so this column was the last uncapped long-form text on the
	 * site, and the one a peer lands on first. On the record rail the reading
	 * column is wider than the body measure, so the cap belongs on the block
	 * instead: the 3px rule above each section head then stops where the prose
	 * stops rather than running on into the gutter. Hierarchy drawn in rules
	 * only reads if the rule is the width of the thing it opens. */
	.home-main :global(.home-prose) {
		padding: 0;
		max-width: var(--measure-prose);
	}

	/* Lead paragraph — the standfirst tier (Newsreader, one step above body).
	 * It was set at --font-size-xl, which is the Title step: a Newsreader
	 * paragraph at record-title size. */
	.home-main :global(.home-prose > p:first-of-type) {
		font-size: var(--font-size-lg);
		line-height: var(--line-height-normal);
		color: var(--color-text-emphasis);
	}

	/* Body copy at the Body step. It ran at --font-size-lg — the Standfirst
	 * tier — for 1,100 words, which is what put the measure at ~98 characters:
	 * the type was a step too large for a column this wide, in both directions. */
	.home-main :global(.home-prose > p) {
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
	}

	/* Each content section opens with a 3px ink rule above the Archivo title —
	 * hierarchy drawn in rules, so the page scans as a set of sections. The
	 * interval below the rule is --rule-gap like every other ruled module; it
	 * was --space-md here, a drift the pairing guard could not see because the
	 * padding is declared above the border. */
	.home-main :global(.home-prose > h2) {
		margin-top: var(--space-2xl);
		padding-top: var(--rule-gap);
		border-top: var(--rule-section) solid var(--color-primary);
	}

	.home-portrait {
		margin: 0;
	}

	.home-portrait .plate {
		width: 100%;
		aspect-ratio: 854 / 742;
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
