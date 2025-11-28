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
	// MODIFIED: Removed onMount, onDestroy. $derived and $effect are assumed to be globally available in Svelte 5.
	import { browser } from '$app/environment'; // Import browser check
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

	// Pre-construct breadcrumb items with evaluated paths
	const breadcrumbItems = [
		{ label: 'Research', href: `${base}/research` },
		{
			label: "Youth and Women's Islamic Activism",
			href: `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`
		}
	];

	// MODIFIED: Generate Breadcrumb JSON-LD reactively using $derived
	let breadcrumbJsonLdString = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				item: `${$page.url.origin}${item.href}` // $page store subscription
			}))
		})
	);

	// Manage JSON-LD script injection
	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

	// MODIFIED: Replaced onMount and onDestroy with $effect
	$effect(() => {
		if (browser) {
			const scriptId = breadcrumbJsonLdScriptId;
			let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

			// breadcrumbJsonLdString is reactive via $derived
			// JSON.stringify should always produce a string, so we check its truthiness (non-empty)
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
				// If breadcrumbJsonLdString becomes falsy (e.g. empty string, though unlikely from JSON.stringify)
				// and the script exists, remove it.
				if (scriptElement) {
					document.head.removeChild(scriptElement);
					// scriptElement = null; // Not strictly necessary as it's a local var
				}
			}

			return () => {
				// Cleanup: remove the script if it exists and was added by this effect
				if (browser) {
					// Re-check browser context for safety during cleanup
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
	title="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso | Frédérick Madore"
/>

<div class="container py-8">
	<div
		class="content-wrapper"
		use:scrollAnimate={{ delay: DELAY_STEP, animationClass: 'fade-in-up' }}
	>
		<div class="main-content max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader title="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" />

			<ProjectImageBanner
				src="{base}/images/research/youth-women-activism.webp"
				alt="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso"
				glassEffect="glass-medium"
				overlayIntensity="medium"
			/>

			<ContentBody variant="default" glassEffect="glass-card">
				{#snippet children()}
					<p>
						This research project is situated in the context of the increasing visibility of Islam in
						the Ivorian and Burkinabe public sphere, particularly since the 1990s, and the growing
						engagement of youth and women within this religious dynamic. The project explores the
						emerging new forms of Islamic activism, with a particular focus on the role of young
						people and women, their communication strategies and their contribution to reshaping the
						religious and social landscape.
					</p>

					<p>
						An important focus of this research is the impact of the increasing mediatisation of
						Islam, both through traditional media (radio, periodicals) and new information and
						communication technologies (internet, social media). It analyses how these tools are used
						by religious actors, especially youth and women, to disseminate their discourse, assert
						their presence in the public sphere and negotiate social and religious norms. The project
						highlights the emergence of new mediatised religious figures, including women, who are
						gaining significant authority and visibility.
					</p>

					<p>
						The project also includes an in-depth study of the presence of Ivorian and Burkinabe Islam
						in the digital age. This analysis reveals how the internet and social media are being used
						by Islamic associations, Muslim intellectuals and individual religious figures to
						disseminate the religious message, construct transnational community identities and
						belonging, and promote new forms of online religiosity. The research highlights the
						challenges and limitations of this digital transition for some organisations, as well as
						the crucial role of individual initiatives, often led by young people, in harnessing the
						potential of the web.
					</p>

					<p>
						Another important strand of the project is concerned with intergenerational dynamics
						within Muslim communities. It analyses how the rise of a young Arabophone and Francophone
						elite, more familiar with new technologies, is challenging traditional forms of religious
						authority and seeking to position itself as the spokesperson for a 'civil Islam'. This
						research highlights the tensions and convergences between generations in the construction
						of contemporary Islam in Côte d'Ivoire and Burkina Faso.
					</p>

					<p>
						Specific themes explored in this project include the role of "francophone Muslim
						intellectuals" in the Burkinabe public sphere after the departure of President Blaise
						Compaoré (2014), the vitality and dynamism of Salafism in Côte d'Ivoire, and the
						organisation of the Hajj pilgrimage to Mecca in Côte d'Ivoire and the stakes involved.
						Special attention is also given to the emergence of influential female figures, such as
						Aminata Kane Koné <ItemReference id="muslim-feminist-media-cote-divoire-2020" />, and
						their role as religious entrepreneurs and media personalities.
					</p>

					<p>
						By combining qualitative research methods - notably interviews with Muslim actors, media
						content analysis (print media, websites, social media) and a socio-historical approach -
						this project contributes to a better understanding of the profound transformations taking
						place within Islam in West Africa, with a particular focus on the engagement and
						strategies of youth and women. It highlights the complexity of religious dynamics, the
						diversity of actors and discourses, and the socio-political stakes involved in the
						assertion of Islam in the Ivorian and Burkinabe contexts.
					</p>
				{/snippet}
			</ContentBody>
		</div>

		<div class="related-content mt-16 max-w-6xl mx-auto">
			<RelevantPublications
				projectName="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso"
				limit={6}
				animationDelay={DELAY_STEP * 12}
			/>
			<div class="mt-12">
				<RelevantCommunications
					projectName="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso"
					limit={6}
					animationDelay={DELAY_STEP * 15}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	/* Page-specific styles - consistent with other research pages */
	/* Main content container styling handled by utility classes */

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		:global(.main-content),
		:global(.related-content) {
			transition: none;
		}
	}
</style>
