<script lang="ts">
	import { awardsByDate } from '$lib/data/awards';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Awards & Honors</h3>
	{#if awardsByDate.length > 0}
		<div class="space-y-3">
			{#each awardsByDate as award (award.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{award.year}</div>
					<div class="flex-1">
						<span class="font-medium">{award.title}</span>, {award.institution}.
						{#if award.details}
							<p class="text-sm mt-1">{award.details}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No awards or honors listed.</p>
	{/if}
</section>
