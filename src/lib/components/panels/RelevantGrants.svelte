<script lang="ts">
	import { allGrants } from '$lib/data/grants/index';
	import type { Grant } from '$lib/types';

	// Props - project name
	let {
		projectName
	}: {
		projectName: string;
	} = $props();

	// Filter grants by project name
	let grantList = $derived<Grant[]>(
		allGrants
			.filter((grant) => grant.project === projectName)
			.sort((a, b) => new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime())
	);

	// Format currency amount
	function formatAmount(amount: number | undefined, currency: string | undefined): string {
		if (!amount) return '';
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'EUR',
			maximumFractionDigits: 0
		});
		return formatter.format(amount);
	}

	// Get status class
	function getStatusClass(status: string | undefined): string {
		if (!status) return '';
		return status === 'Awarded' ? 'status-awarded' : 'status-other';
	}
</script>

{#if grantList.length > 0}
	<aside class="relevant-grants glass-card scroll-reveal" aria-labelledby="grants-heading">
		<div class="grants-header">
			<h3 id="grants-heading" class="grants-title">Funding</h3>
		</div>

		<ul class="grants-list">
			{#each grantList as grant (grant.id)}
				<li class="grant-item">
					<div class="grant-main">
						<span class="grant-funder">{grant.funder}</span>
						<span class="grant-program">{grant.title}</span>
						{#if grant.projectTitle}
							<span class="grant-project-title">{grant.projectTitle}</span>
						{/if}
					</div>
					<div class="grant-meta">
						<span class="grant-date">{grant.dateRangeString}</span>
						{#if grant.amount}
							<span class="grant-amount">{formatAmount(grant.amount, grant.currency)}</span>
						{/if}
						{#if grant.status}
							<span class="grant-status {getStatusClass(grant.status)}">{grant.status}</span>
						{/if}
					</div>
					{#if grant.coApplicants && grant.coApplicants.length > 0}
						<div class="grant-coapplicants">
							<span class="coapplicants-label">With:</span>
							<span class="coapplicants-names">{grant.coApplicants.join(', ')}</span>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</aside>
{/if}

<style>
	.relevant-grants {
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		margin-top: var(--space-xl);
		border-left: 3px solid var(--color-accent);
	}

	.grants-header {
		display: flex;
		align-items: center;
		margin-bottom: var(--space-md);
	}

	.grants-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin: 0;
		font-family: var(--font-family-serif);
	}

	.grants-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.grant-item {
		padding: var(--space-sm) 0;
		border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 10%, transparent);
	}

	.grant-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.grant-main {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.grant-funder {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
	}

	.grant-program {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.grant-project-title {
		font-size: var(--font-size-sm);
		color: var(--color-text);
		font-style: italic;
		margin-top: var(--space-2xs);
	}

	.grant-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-top: var(--space-xs);
		align-items: center;
	}

	.grant-date {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.grant-amount {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
	}

	.grant-status {
		font-size: var(--font-size-xs);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
	}

	.status-awarded {
		background: color-mix(in srgb, var(--color-success) 10%, transparent);
		color: var(--color-success);
	}

	.status-other {
		background: color-mix(in srgb, var(--color-text) 10%, transparent);
		color: var(--color-text-muted);
	}

	.grant-coapplicants {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-xs);
	}

	.coapplicants-label {
		font-weight: var(--font-weight-medium);
	}

	.coapplicants-names {
		font-style: italic;
	}

	/* Dark mode adjustments */
	:global(html.dark) .relevant-grants {
		border-left-color: var(--color-accent);
	}

	:global(html.dark) .grant-funder {
		color: var(--color-primary-light);
	}

	:global(html.dark) .grant-item {
		border-bottom-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
	}

	/* Responsive adjustments */
	@media (--sm) {
		.grant-meta {
			gap: var(--space-md);
		}
	}
</style>
