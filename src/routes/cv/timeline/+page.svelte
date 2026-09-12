<script lang="ts">
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import CareerTimeline, {
		TIMELINE_MIN_PLATE_WIDTH
	} from '$lib/components/visualisations/CareerTimeline.svelte';
	import SEO from '$lib/SEO.svelte';
	import { getAllTimelineItems } from '$lib/utils/timelineData';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';

	// Get all timeline items
	const items = getAllTimelineItems();

	// The plate has a floor it will not draw below, so on a narrow column it
	// overflows and the reader has to push it sideways to reach the earlier
	// years. Measured rather than guessed at a breakpoint: the caption must not
	// promise a scroll on a viewport where the plate already fits.
	let containerWidth = $state(0);
	const overflows = $derived(containerWidth > 0 && containerWidth < TIMELINE_MIN_PLATE_WIDTH);

	// Breadcrumbs
	const breadcrumbs = createSectionBreadcrumbs('CV', '/cv', {
		name: 'Career Timeline',
		path: '/cv/timeline'
	});
</script>

<SEO
	title="Career Timeline | Frédérick Madore"
	description="The CV plotted against time: positions, education, grants, awards, fieldwork, publications and presentations, one lane per category."
	keywords="career timeline, academic career, visualisation, digital humanities, Islam, West Africa"
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
		received, and key scholarly outputs, one lane per category. Select a record for its details. The
		arrow keys move between records.
	</PageIntro>

	<ContentBody variant="wide">
		<!-- The chart states its own height from the number of category lanes it
		     draws. It previously took `window.innerHeight * 0.7` as a min-height,
		     re-measured on every resize event: on a 900px window that padded a
		     ~380px chart out to 630px, so a third of the plate was empty paper
		     and a listener ran to keep it that way.

		     This container is also the timeline's ONE horizontal scroller: the
		     chart no longer hides a scroller of its own inside this one. -->
		<div class="timeline-container" bind:clientWidth={containerWidth}>
			<CareerTimeline {items} height={0} />
		</div>
		<!-- At 375 the plate is 776px in a 263px column, so nearly 60% of the axis
		     is off-screen and nothing said so: the standfirst named the arrow keys
		     and stopped there. A one-line caption in the data voice, printed only
		     where the plate actually overflows. -->
		{#if overflows}
			<p class="dateline timeline-scroll-note">The plate scrolls sideways.</p>
		{/if}
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

	.timeline-scroll-note {
		margin: var(--rule-gap) 0 0;
	}
</style>
