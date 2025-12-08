<script lang="ts">
	import { grantsByDate } from '$lib/data/grants';

	// Format year range for display (e.g., "2013-15" or "2023")
	function formatYearRange(startYear: number, endYear?: number | null): string {
		if (!endYear || endYear === startYear) {
			return startYear.toString();
		}
		// Compact format: use last 2 digits of end year if in same century
		const startCentury = Math.floor(startYear / 100);
		const endCentury = Math.floor(endYear / 100);
		if (startCentury === endCentury) {
			return `${startYear}-${endYear.toString().slice(-2)}`;
		}
		return `${startYear}-${endYear}`;
	}
</script>

<section>
	<h3>Grants & Fellowships</h3>
	{#if grantsByDate.length > 0}
		<div class="space-y-3">
			{#each grantsByDate as grant (grant.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap w-20">{formatYearRange(grant.startYear, grant.endYear)}</div>
					<div class="flex-1">
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
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No grants or fellowships listed.</p>
	{/if}
</section>
