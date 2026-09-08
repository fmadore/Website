<script lang="ts">
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import CareerTimeline from '$lib/components/visualisations/CareerTimeline.svelte';
	import SEO from '$lib/SEO.svelte';
	import { getAllTimelineItems } from '$lib/utils/timelineData';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';

	// Get all timeline items
	const items = getAllTimelineItems();

	// Breadcrumbs
	const breadcrumbs = createSectionBreadcrumbs('CV', '/cv', {
		name: 'Career Timeline',
		path: '/cv/timeline'
	});
</script>

<SEO
	title="Career Timeline - Frédérick Madore"
	description="Interactive timeline visualization of Frédérick Madore's academic career, including positions, education, grants, publications, and more."
	keywords="career timeline, academic career, visualization, digital humanities, Islam, West Africa"
	canonical="https://www.frederickmadore.com/cv/timeline"
	{breadcrumbs}
/>

<div class="container mx-auto px-4 py-8">
	<PageHeader
		title="Career Timeline"
		backLinkHref="cv"
		backLinkLabel="← Back to CV"
		additionalClasses="mb-8"
	/>

	<PageIntro>
		The same record as the CV, plotted against time: positions held, education completed, grants
		received, and key scholarly outputs, one lane per category. Select an item — by pointer or by
		keyboard — for its details.
	</PageIntro>

	<ContentBody variant="wide">
		<!-- The chart states its own height from the number of category lanes it
		     draws. It previously took `window.innerHeight * 0.7` as a min-height,
		     re-measured on every resize event: on a 900px window that padded a
		     ~380px chart out to 630px, so a third of the plate was empty paper
		     and a listener ran to keep it that way. -->
		<div class="timeline-container">
			<CareerTimeline {items} height={0} />
		</div>
	</ContentBody>
</div>

<style>
	.timeline-container {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}

	.timeline-container::-webkit-scrollbar {
		height: 8px;
	}

	.timeline-container::-webkit-scrollbar-track {
		background: transparent;
	}

	/* Square, like every other edge in the system. */
	.timeline-container::-webkit-scrollbar-thumb {
		background-color: var(--color-border);
	}
</style>
