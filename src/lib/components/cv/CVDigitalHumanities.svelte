<script lang="ts">
	import { allDhProjects } from '$lib/data/digital-humanities';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import CVSection from './CVSection.svelte';
</script>

<CVSection
	title="Digital Humanities Projects"
	items={allDhProjects}
	year={(project) => formatCVYearRange(project.years)}
	key={(project) => project.id}
	emptyMessage="No digital humanities projects listed."
>
	{#snippet entry(project)}
		<span class="font-medium">{project.title}</span>
		{#if project.linkUrl}
			<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
			<a
				href={project.linkUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="ml-1 text-primary hover:underline text-sm">[Link]</a
			>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		{/if}
		{#if project.shortDescription}
			<div class="text-sm text-light">{project.shortDescription}</div>
		{/if}
		{#if project.reviews && project.reviews.length > 0}
			<div class="mt-2 ml-4 text-sm">
				{project.reviews.length === 1 ? 'Review:' : 'Reviews:'}
				{#each project.reviews as review, i (review.url)}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
					<a
						href={review.url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline"
						><!-- eslint-disable svelte/no-at-html-tags -->{@html review.text}<!-- eslint-enable svelte/no-at-html-tags --></a
					><!-- eslint-enable svelte/no-navigation-without-resolve -->{#if i < project.reviews.length - 1};
					{/if}
				{/each}
			</div>
		{/if}
	{/snippet}
</CVSection>
