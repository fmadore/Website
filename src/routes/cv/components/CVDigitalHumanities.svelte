<script lang="ts">
	import { allDhProjects } from '$lib/data/digital-humanities';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Digital Humanities Projects</h3>
	{#if allDhProjects.length > 0}
		<div class="space-y-3">
			{#each allDhProjects as project (project.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{project.years}</div>
					<div class="flex-1">
						<span class="font-medium">{project.title}</span>. {project.shortDescription}
						{#if project.linkUrl}
							<a
								href={project.linkUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="ml-1 text-primary hover:underline text-sm">[Link]</a
							>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No digital humanities projects listed.</p>
	{/if}
</section>
