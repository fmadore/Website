<script lang="ts">
	import { affiliationsByStartDate } from '$lib/data/affiliations';
	import { formatAffiliationPeriod } from '../utils/cvFormatters';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">
		Professional Affiliations
	</h3>
	{#if affiliationsByStartDate.length > 0}
		<ul>
			{#each affiliationsByStartDate as aff (aff.id)}
				<li class="mb-3">
					<span class="font-medium">{aff.name}</span>{#if aff.abbreviation}<span
							>&nbsp;({aff.abbreviation})</span
						>{/if}{#if aff.parentOrganization}<span>,&nbsp;<em>{aff.parentOrganization}</em></span
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
					{#if aff.url}
						<a
							href={aff.url}
							target="_blank"
							rel="noopener noreferrer"
							class="ml-4 text-primary hover:underline text-sm">[Website]</a
						>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-light">No professional affiliations listed.</p>
	{/if}
</section>
