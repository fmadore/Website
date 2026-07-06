<script lang="ts">
	import { allGrants } from '$lib/data/grants/index';
	import type { Grant } from '$lib/types';
	import PanelBase from './PanelBase.svelte';

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

{#snippet panelContent()}
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
{/snippet}

{#if grantList.length > 0}
	<PanelBase title="Funding" variant="items" content={panelContent} />
{/if}

<style>
	.grants-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	/* Each grant is a ledger row: a hairline separates entries, the funder and
	 * title read in the DOCUMENT serif voice, the figures/dates/status in the
	 * DATA mono voice. No pills, no tinted boxes. */
	.grant-item {
		padding: var(--space-sm) 0;
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
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

	/* Funder — a mono eyebrow above the serif title. */
	.grant-funder {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-light);
	}

	.grant-program {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
	}

	.grant-project-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
		font-style: italic;
		margin-top: var(--space-2xs);
	}

	.grant-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-top: var(--space-2);
		align-items: baseline;
		font-family: var(--font-family-mono);
		font-variant-numeric: tabular-nums;
	}

	.grant-date {
		font-size: var(--font-size-2xs);
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	/* Amount — mono figure, quiet emphasis (ink, no fill). */
	.grant-amount {
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/* Status — a flat mono marker; "Awarded" earns the lone pine accent. */
	.grant-status {
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: var(--font-weight-semibold);
	}

	.status-awarded {
		color: var(--color-accent);
	}

	.status-other {
		color: var(--color-text-muted);
	}

	.grant-coapplicants {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-xs);
	}

	.coapplicants-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.coapplicants-names {
		font-style: italic;
	}

	/* Responsive adjustments */
	@media (--sm) {
		.grant-meta {
			gap: var(--space-md);
		}
	}
</style>
