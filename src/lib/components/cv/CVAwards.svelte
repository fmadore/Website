<script lang="ts">
	import ExternalLink from '#lib/components/atoms/ExternalLink.svelte';
	import { awardsByDate } from '#lib/data/awards/index.ts';
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import CVSection from './CVSection.svelte';
</script>

<CVSection
	title="Awards & Honours"
	items={awardsByDate}
	year={(award) => award.year}
	key={(award) => award.id}
	emptyMessage="No awards or honours listed."
>
	{#snippet entry(award)}
		{#if award.url}<ExternalLink href={award.url} class="cv-title">
				{typesetQuotes(award.title)}
			</ExternalLink>{:else}<span class="cv-title">
				{typesetQuotes(award.title)}
			</span>{/if}, {typesetQuotes(award.institution)}.
		{#if award.details}
			<p class="cv-detail">{typesetQuotes(award.details)}</p>
		{/if}
	{/snippet}
</CVSection>
