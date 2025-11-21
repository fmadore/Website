<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import ProjectImageBanner from '$lib/components/common/ProjectImageBanner.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import { page } from '$app/stores'; // Import page store
	import { browser } from '$app/environment'; // Import browser check
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

	// Pre-construct breadcrumb items with evaluated paths
	const breadcrumbItems = [
		{ label: 'Research', href: `${base}/research` },
		{
			label: 'Muslim Minorities in Southern Cities',
			href: `${base}/research/muslim-minorities-southern-cities-benin-togo`
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

<SEO title="Muslim Minorities in Southern Cities of Benin and Togo | Frédérick Madore" />

<div
	class="container py-8"
	use:scrollAnimate={{ delay: DELAY_STEP * 0, animationClass: 'fade-in-up' }}
>
	<div class="content-wrapper" use:scrollAnimate={{ delay: DELAY_STEP * 2, animationClass: 'fade-in-up' }}>
		<div class="main-content max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader title="Muslim Minorities in Southern Cities of Benin and Togo" />

			<ProjectImageBanner
				src="{base}/images/research/muslim-minorities.webp"
				alt="Muslim Minorities in Southern Cities of Benin and Togo"
				glassEffect="glass-medium"
				overlayIntensity="medium"
			/>

			<ContentBody variant="default" glassEffect="glass-card">
				{#snippet children()}
					<p>
						Muslims in Benin and Togo rarely make international headlines, except when analysts warn
						that jihadist groups based in the Sahel are moving south towards the Gulf of Guinea. My
						project shifts the focus from these narrow security concerns to the everyday lives of
						Muslim minorities in Cotonou, Porto-Novo and Lomé. Combining archival work with
						long-term ethnography, it traces their trajectories from the 1960s to the present to see
						how living as an internally diverse minority in a Christian-majority environment shapes
						their religious practices, civic engagement and claims to citizenship.
					</p>
					<p>
						One consistent finding is how elites instrumentalise fear of extremism. In Togo,
						political leaders have branded opposition figures "Salafi" to legitimise arrests, while
						senior Muslim leaders sometimes recycle the same label to sideline rivals within their
						own organisations. These manoeuvres show that talk of radicalisation often reflects
						local power struggles rather than imported jihadist ideologies <ItemReference
							id="lutte-terrorisme-salafisme-benin-togo-2022"
						/>.
					</p>
					<p>
						During the 2017-18 protests in Lomé, the regime drew a sharp line between "good" and
						"bad" Muslims in order to fracture an opposition coalition led by Muslim politicians <ItemReference
							id="good-muslim-bad-muslim-togo-2021"
						/>. In Benin, controversy erupted when a Cotonou imam successfully entered parliament in
						2019; the episode exposed generational divides over who can legitimately speak for
						Muslims in a minority context <ItemReference id="beninese-imam-election-2022" />.
					</p>
					<p>
						The project also explored the plurality of ways in which Muslim youth and women make
						sense of their religious identity in their everyday lives, beyond established analytical
						categories (Sufi, reformist, Salafi). Their fluid practices echo the argument of
						"Repenser la catégorisation religieuse à partir du Bénin, terre du vodun" <ItemReference
							id="repenser-categorisation-religieuse-benin-2026"
						/> that official statistics overstate the advance of monotheism and overlook the hybrid,
						overlapping rituals that many believers quietly practice.
					</p>
					<p>
						Taken together, the research shows that minority status is both a constraint and a
						resource. It can marginalise Muslims in national politics, but also enable strategic
						alliances, entrepreneurial experimentation and new forms of piety. By looking beyond
						security tropes, the project offers a fuller picture of how southern Beninese and
						Togolese Muslims negotiate faith, power and belonging in one of West Africa's most
						religiously plural zones.
					</p>
				{/snippet}
			</ContentBody>
		</div>

		<div class="related-content mt-16 max-w-6xl mx-auto">
			<RelevantPublications
				projectName="Muslim Minorities in Southern Cities of Benin and Togo"
				limit={6}
				animationDelay={DELAY_STEP * 12}
			/>
			<div class="mt-12">
				<RelevantCommunications
					projectName="Muslim Minorities in Southern Cities of Benin and Togo"
					limit={6}
					animationDelay={DELAY_STEP * 15}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	/* Styles for mobile first */
	/* .main-content width is handled by block display default */
</style>
