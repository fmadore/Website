<script lang="ts">
	import { grantsByDate } from '$lib/data/grants';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">Grants & Fellowships</h3>
	{#if grantsByDate.length > 0}
		<ul>
			{#each grantsByDate as grant (grant.id)}
				<li class="mb-3">
					<span class="font-medium">{grant.title}</span>, <em>{grant.funder}</em>.
					<span class="block ml-4 text-sm text-light">
						{grant.dateRangeString}
						{#if grant.amount}
							({grant.amount.toLocaleString('en-US')}
							{grant.currency})
						{/if}
						{#if grant.status && grant.status !== 'Awarded'}
							[{grant.status}]
						{/if}
					</span>
					{#if grant.details}
						<p class="ml-4 text-sm">{grant.details}</p>{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-light">No grants or fellowships listed.</p>
	{/if}
</section>
