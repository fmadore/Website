<script lang="ts">
	import { awardsByDate } from '$lib/data/awards';
	import CVSection from './CVSection.svelte';
</script>

<CVSection
	title="Awards & Honors"
	items={awardsByDate}
	year={(award) => award.year}
	emptyMessage="No awards or honors listed."
>
	{#snippet entry(award)}
		<span class="font-medium">{award.title}</span>, {award.institution}.
		{#if award.details}
			<p class="text-sm mt-1">{award.details}</p>
		{/if}
	{/snippet}
</CVSection>
