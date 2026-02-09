<script lang="ts">
	import { awardsByDate } from '$lib/data/awards';
	import CVEntry from './CVEntry.svelte';
</script>

<section>
	<h3>Awards & Honors</h3>
	{#if awardsByDate.length > 0}
		<div class="space-y-3">
			{#each awardsByDate as award (award.id)}
				<CVEntry year={award.year}>
					<span class="font-medium">{award.title}</span>, {award.institution}.
					{#if award.details}
						<p class="text-sm mt-1">{award.details}</p>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="text-light">No awards or honors listed.</p>
	{/if}
</section>
