<script lang="ts">
	import { awardsByDate } from '$lib/data/awards';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">Awards & Honors</h3>
	{#if awardsByDate.length > 0}
		<ul>
			{#each awardsByDate as award (award.id)}
				<li class="mb-3">
					<span class="font-medium">{award.title}</span>, <em>{award.institution}</em>
					({award.year}).
					{#if award.details}
						<p class="ml-4 text-sm">{award.details}</p>{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-light">No awards or honors listed.</p>
	{/if}
</section>
