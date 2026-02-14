<script lang="ts">
	import { allDhProjects } from '$lib/data/digital-humanities';
	import CVEntry from './CVEntry.svelte';

	// Format year range for display (e.g., "2018-23" or "2023-")
	function formatYearRange(years: string): string {
		// Handle ranges like "2018-2023" or ongoing ranges like "2023-"
		if (years.includes('-')) {
			const [start, end] = years.split('-');
			if (!end || end === '') {
				// Ongoing project
				return `${start}-`;
			}
			// Parse years
			const startYear = parseInt(start);
			const endYear = parseInt(end);
			// Compact format: use last 2 digits of end year if in same century
			const startCentury = Math.floor(startYear / 100);
			const endCentury = Math.floor(endYear / 100);
			if (startCentury === endCentury) {
				return `${startYear}-${endYear.toString().slice(-2)}`;
			}
			return `${startYear}-${endYear}`;
		}
		return years;
	}
</script>

<section>
	<h3>Digital Humanities Projects</h3>
	{#if allDhProjects.length > 0}
		<div class="space-y-3">
			{#each allDhProjects as project (project.id)}
				<CVEntry year={formatYearRange(project.years)}>
					<span class="font-medium">{project.title}</span>.
					{#if project.linkUrl}
						<a
							href={project.linkUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="ml-1 text-primary hover:underline text-sm">[Link]</a
						>
					{/if}
					{#if project.shortDescription}
						<div class="text-sm text-light">{project.shortDescription}</div>
					{/if}
					{#if project.reviews && project.reviews.length > 0}
						<div class="mt-2 ml-4 text-sm">
							{project.reviews.length === 1 ? 'Review:' : 'Reviews:'}
							{#each project.reviews as review, i}
								<a
									href={review.url}
									target="_blank"
									rel="noopener noreferrer"
									class="text-primary hover:underline"
									>{@html review.text}</a
								>{#if i < project.reviews.length - 1}; {' '}{/if}
							{/each}
						</div>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="text-light">No digital humanities projects listed.</p>
	{/if}
</section>
