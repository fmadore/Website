<script lang="ts">
	import { grantsByDate } from '$lib/data/grants';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import CVSection from './CVSection.svelte';
</script>

<CVSection
	title="Grants & Fellowships"
	items={grantsByDate}
	year={(grant) => formatCVYearRange(grant.startYear, grant.endYear)}
	key={(grant) => grant.id}
	yearWidth="fixed"
	emptyMessage="No grants or fellowships listed."
>
	{#snippet entry(grant)}
		<span class="font-medium">{grant.title}</span>, {grant.funder}.
		{#if grant.amount}
			<div class="text-sm text-light">
				{grant.amount.toLocaleString('en-US')} {grant.currency}{#if grant.status && grant.status !== 'Awarded'}&nbsp;[{grant.status}]{/if}
			</div>
		{:else if grant.status && grant.status !== 'Awarded'}
			<div class="text-sm text-light">
				[{grant.status}]
			</div>
		{/if}
		{#if grant.coApplicants && grant.coApplicants.length > 0}
			<div class="text-sm text-light">
				Co-applicant{grant.coApplicants.length > 1 ? 's' : ''}: {grant.coApplicants.join(', ')}
			</div>
		{/if}
		{#if grant.details}
			<p class="text-sm">{grant.details}</p>
		{/if}
	{/snippet}
</CVSection>
