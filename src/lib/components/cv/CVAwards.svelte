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
		{#if award.url}<!-- eslint-disable svelte/no-navigation-without-resolve -- external link --><a
				href={award.url}
				target="_blank"
				rel="noopener noreferrer"
				class="font-medium">{typesetQuotes(award.title)}</a
			><!-- eslint-enable svelte/no-navigation-without-resolve -->{:else}<span class="font-medium"
				>{typesetQuotes(award.title)}</span
			>{/if}, {typesetQuotes(award.institution)}.
		{#if award.details}
			<p class="text-sm mt-1">{typesetQuotes(award.details)}</p>
		{/if}
	{/snippet}
</CVSection>
