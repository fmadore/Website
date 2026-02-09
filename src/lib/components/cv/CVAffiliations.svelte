<script lang="ts">
	import { affiliationsByStartDate } from '$lib/data/affiliations';
	import { formatAffiliationPeriod } from '$lib/utils/cvFormatters';
</script>

<section>
	<h3>Professional Affiliations</h3>
	{#if affiliationsByStartDate.length > 0}
		<div class="space-y-3">
			{#each affiliationsByStartDate as aff (aff.id)}
				<div>
					<span class="font-medium">{aff.name}</span>{#if aff.abbreviation}<span
							>&nbsp;({aff.abbreviation})</span
						>{/if}{#if aff.parentOrganization}<span>,&nbsp;{aff.parentOrganization}</span
						>{/if}.
					<span class="block ml-4 text-sm text-light">{formatAffiliationPeriod(aff.period)}</span>
					{#if aff.roles && aff.roles.length > 0}
						<ul class="list-disc pl-8 mt-1">
							{#each aff.roles as role (role.title + ('min' in role.period ? role.period.min : role.period.start))}
								<li class="text-sm">
									{role.title} ({formatAffiliationPeriod(role.period)})
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No professional affiliations listed.</p>
	{/if}
</section>
