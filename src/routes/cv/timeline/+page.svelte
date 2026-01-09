<script lang="ts">
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import ContentBody from '$lib/components/common/ContentBody.svelte';
	import CareerTimeline from '$lib/components/visualisations/CareerTimeline.svelte';
	import SEO from '$lib/SEO.svelte';
	import { getAllTimelineItems } from '$lib/utils/timelineData';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { onMount } from 'svelte';

	// Get all timeline items
	const items = getAllTimelineItems();

	// Breadcrumbs
	const breadcrumbs = createSectionBreadcrumbs('CV', '/cv', {
		name: 'Career Timeline',
		path: '/cv/timeline'
	});

	// Responsive height
	let chartHeight = $state(600);

	onMount(() => {
		const updateHeight = () => {
			chartHeight = window.innerHeight * 0.7;
		};
		updateHeight();
		window.addEventListener('resize', updateHeight);
		return () => window.removeEventListener('resize', updateHeight);
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

	<ContentBody variant="wide" glassEffect="glass-card">
		<p class="mb-6 text-lg text-secondary">
			An interactive visualization of my academic journey, highlighting positions held, education
			completed, grants received, and key scholarly outputs over time. Hover over items for details.
		</p>

		<div class="timeline-container">
			<CareerTimeline {items} height={chartHeight} />
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

	.timeline-container::-webkit-scrollbar-thumb {
		background-color: var(--color-border);
		border-radius: var(--border-radius-sm);
	}
</style>
