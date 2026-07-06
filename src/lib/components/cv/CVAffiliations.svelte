<script lang="ts">
	import { affiliationsByStartDate } from '$lib/data/affiliations';
	import { formatAffiliationPeriod } from '$lib/utils/cvFormatters';
</script>

<section>
	<h3>Professional Affiliations</h3>
	{#if affiliationsByStartDate.length > 0}
		<div class="space-y-3 ledger">
			{#each affiliationsByStartDate as aff (aff.id)}
				<div class="cv-affiliation-row">
					<span class="font-medium">{aff.name}</span>{#if aff.abbreviation}<span
							>&nbsp;({aff.abbreviation})</span
						>{/if}{#if aff.parentOrganization}<span>,&nbsp;{aff.parentOrganization}</span>{/if}.
					<span class="block cv-affiliation-period">{formatAffiliationPeriod(aff.period)}</span>
					{#if aff.roles && aff.roles.length > 0}
						<ul class="list-disc pl-8 mt-1 cv-affiliation-roles">
							{#each aff.roles as role (role.title + role.period.start)}
								<li>
									{role.title} ({formatAffiliationPeriod(role.period)})
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No professional affiliations listed.</p>
	{/if}
</section>

<style>
	/* Affiliation ledger row — serif name/body, hairline between rows. */
	.cv-affiliation-row {
		padding: var(--space-2-5) 0;
		border-top: var(--rule-hairline) solid var(--color-border-light);
		font-family: var(--font-family-serif);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
	}

	.cv-affiliation-row:last-child {
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
	}

	/* Period — DATA voice: mono, letterspaced, quiet ink. */
	.cv-affiliation-period {
		margin-left: var(--space-4);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.06em;
		color: var(--color-text-light);
	}

	.cv-affiliation-roles {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
	}
</style>
