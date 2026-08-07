<script lang="ts">
	import { awardsByDate } from '$lib/data/awards';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVSection from './CVSection.svelte';
</script>

<CVSection
	title="Awards & Honors"
	items={awardsByDate}
	year={(award) => award.year}
	key={(award) => award.id}
	emptyMessage="No awards or honors listed."
>
	{#snippet entry(award)}
		<span class="font-medium">{typesetQuotes(award.title)}</span>, {typesetQuotes(
			award.institution
		)}.
		{#if award.details}
			<p class="text-sm mt-1">{typesetQuotes(award.details)}</p>
		{/if}
	{/snippet}
</CVSection>
