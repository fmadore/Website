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
	import { page } from '$app/stores'; // Import page store
	import { browser } from '$app/environment'; // Import browser check

	// Pre-construct breadcrumb items with evaluated paths
	const breadcrumbItems = [
		{ label: 'Research', href: `${base}/research` },
		{
			label: 'Religious Activism on Campuses',
			href: `${base}/research/religious-activism-campuses-togo-benin`
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

<SEO title="Religious Activism on Campuses in Togo and Benin | Frédérick Madore" />

<div class="container py-8 page-enter">
	<!-- Apply grid layout to this container on medium screens and up -->
	<div class="content-wrapper">
		<!-- Added grid wrapper -->
		<div class="main-content max-w-6xl mx-auto">
			<Breadcrumb items={breadcrumbItems} />

			<PageHeader title="Religious Activism on Campuses in Togo and Benin" />

			<div class="mb-6">
				<ProjectYears years="2021-2024" />
			</div>

			<div class="scroll-reveal">
				<ProjectImageBanner
					src="{base}/images/research/campus-activism.webp"
					alt="Religious Activism on Campuses in Togo and Benin"
					glassEffect="glass-medium"
					overlayIntensity="medium"
				/>
			</div>

			<div class="scroll-reveal">
				<ContentBody variant="default" glassEffect="glass-card">
				{#snippet children()}
					<p>
						This project uncovers the neglected history of Christian and Muslim student associations
						at the Université de Lomé (Togo) and the Université d'Abomey-Calavi (Benin), and examines
						their resilience and adaptability over five decades. While much of the literature has
						focused on the role of student protests in triggering national conferences in Benin and
						Togo in the early 1990s, this study broadens the lens to include the significant but often
						overlooked religious dimension of campus life.
					</p>

					<p>
						Drawing on interviews with several generations of activists and press coverage from both
						countries, the research analyses the emergence and evolution of these religious
						associations under challenging political circumstances: a one-party dictatorship in Togo
						and a Marxist-Leninist regime in Benin. It explores how these groups navigated
						authoritarian rule, political liberalisation and the principles of laïcité, while shaping
						campus dynamics in institutions originally known as strongholds of leftist,
						anti-imperialist and secular ideologies.
					</p>

					<p>
						The study reveals the university campus as a microcosm reflecting broader national
						socio-political trends, while also highlighting the importance of translocal factors in
						shaping the internal dynamics of these groups. Amidst the massification of university
						enrolments and rising graduate unemployment in recent decades, faith-based associations
						have expanded their role beyond religious guidance. Increasingly, they offer a "social
						curriculum", providing a space for socialisation and a set of skills, norms and moral
						values that complement the secular academic curriculum.
					</p>

				<p>
					By analysing the interplay between religion, politics and education, this book provides
					new insights into the evolving role of faith in public universities and broader societal
					transformations in West Africa. It explores the implications of growing religiosity for
					these public universities as secular institutions, and contributes to our understanding of
					how religious organisations have coexisted with, and sometimes challenged, traditional
					student associations since the 1970s.
				</p>

				<RelevantGrants projectName="Religious Activism on Campuses in Togo and Benin" />
			{/snippet}
			</ContentBody>
			</div>
			<div class="scroll-reveal">
				<MediaPlayer
					src="{base}/notebooklm/religious_activism_campus.mp3"
					type="audio"
					title="Google NotebookLM Podcast Discussion"
					glassEffect="glass-card"
					showControls={true}
				/>
			</div>
		</div>

		<div class="related-content mt-16 max-w-6xl mx-auto scroll-reveal">
			<RelevantPublications
				projectName="Religious Activism on Campuses in Togo and Benin"
				limit={6}
			/>
			<div class="mt-12">
				<RelevantCommunications
					projectName="Religious Activism on Campuses in Togo and Benin"
					limit={6}
				/>
			</div>
		</div>
	</div>
	<!-- Closed grid wrapper -->
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
