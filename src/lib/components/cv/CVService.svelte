<script lang="ts">
	import { peerReviewsByDate } from '$lib/data/peer-reviews';
	import { editorialMembershipsByDate } from '$lib/data/editorial-memberships';
	import CVEntry from './CVEntry.svelte';

	// Filter out template/placeholder data
	const realPeerReviews = peerReviewsByDate.filter(
		(review) => !review.id.includes('template') && review.journal !== 'Journal Name'
	);
	const realEditorialMemberships = editorialMembershipsByDate.filter(
		(member) => !member.id.includes('template')
	);
</script>

<section>
	<h3>Service to Profession</h3>

	<!-- Editorial Board Memberships Section -->
	{#if realEditorialMemberships.length > 0}
		<h4>Editorial Board Memberships</h4>
		<div class="space-y-3 ledger">
			{#each realEditorialMemberships as member (member.id)}
				<CVEntry year={member.dateRangeString}>
					{member.role}, <em>{member.journal}</em>.
					{#if member.details}
						<div class="text-sm">{member.details}</div>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	<!-- Peer Review Section -->
	{#if realPeerReviews.length > 0}
		<h4>Peer Review Activities</h4>
		<div class="space-y-3 ledger">
			{#each realPeerReviews as review (review.id)}
				<CVEntry year={review.year}>
					{#if review.count && review.count > 1}{review.count}&nbsp;{review.type}s{:else}{review.type}{/if}{#if review.journal}&nbsp;–&nbsp;<em
							>{review.journal}</em
						>{:else if review.publisher}&nbsp;–&nbsp;{review.publisher}{/if}.
					{#if review.details}
						<div class="text-sm">{review.details}</div>
					{/if}
					{#if review.publons_record}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
						<a
							href={review.publons_record}
							target="_blank"
							rel="noopener noreferrer"
							class="verification-badge"
							data-pdf-hide
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="shrink-0"
							>
								<path
									d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
								/>
							</svg>
							<span>Verified on Web of Science</span>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	<!-- Optional: Message if no service activities -->
	{#if realPeerReviews.length === 0 && realEditorialMemberships.length === 0}
		<p class="cv-empty">No service activities listed.</p>
	{/if}
</section>

<style>
	/* Verification affordance — DATA voice: square, mono uppercase, hairline
	 * outline, no fill. Accent on hover. */
	.verification-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-top: var(--space-1-5);
		padding: var(--space-1) var(--space-2);
		border-radius: 0;
		background: transparent;
		border: var(--border-width-thin) solid var(--color-border);
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
		text-decoration: none;
	}

	.verification-badge:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}
</style>
