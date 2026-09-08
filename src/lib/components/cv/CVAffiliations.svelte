<script lang="ts">
	import { affiliationsByStartDate } from '$lib/data/affiliations';
	import { formatAffiliationPeriod } from '$lib/utils/cvFormatters';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';
</script>

<!--
	The membership period is the key. It used to sit indented *inside* the row,
	in the data voice, under a record that hung nothing in the gutter — a
	hanging key set inline. Roles are dated sub-lines rather than a bulleted
	list: `list-disc` inside a ledger is the templated-CMS gesture, and the
	system's answer for a secondary dated line is the same quiet `.text-sm`
	line grants and appointments already use.
-->
<section>
	<h3>Professional Affiliations</h3>
	{#if affiliationsByStartDate.length > 0}
		<div class="space-y-3 ledger ledger--tight ledger--ruled">
			{#each affiliationsByStartDate as aff (aff.id)}
				<!-- Deliberately not `current`: three of six memberships are open-ended,
				     and an accent that marks half a section has stopped marking
				     anything. The one standing appointment keeps the signal. -->
				<CVEntry year={formatAffiliationPeriod(aff.period)}>
					<span class="font-medium">{typesetQuotes(aff.name)}</span>{#if aff.abbreviation}<span
							>&nbsp;({aff.abbreviation})</span
						>{/if}{#if aff.parentOrganization}<span
							>,&nbsp;{typesetQuotes(aff.parentOrganization)}</span
						>{/if}.
					{#if aff.roles && aff.roles.length > 0}
						{#each aff.roles as role (role.title + role.period.start)}
							<div class="text-sm text-light">
								{typesetQuotes(role.title)} ({formatAffiliationPeriod(role.period)})
							</div>
						{/each}
					{/if}
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No professional affiliations listed.</p>
	{/if}
</section>
