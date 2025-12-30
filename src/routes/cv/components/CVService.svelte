<script lang="ts">
	import { peerReviewsByDate } from '$lib/data/peer-reviews';
	import { editorialMembershipsByDate } from '$lib/data/editorial-memberships';

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
		<div class="space-y-3">
			{#each realEditorialMemberships as member (member.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{member.dateRangeString}</div>
					<div class="flex-1">
						{member.role}, <em>{member.journal}</em>.
						{#if member.details}
							<div class="text-sm">{member.details}</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Peer Review Section -->
	{#if realPeerReviews.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Peer Review Activities</h4>
		<div class="space-y-3">
			{#each realPeerReviews as review (review.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{review.year}</div>
					<div class="flex-1">
						{review.type}{#if review.journal}&nbsp;–&nbsp;<em>{review.journal}</em
							>{:else if review.publisher}&nbsp;–&nbsp;{review.publisher}{/if}.
						{#if review.details}
							<div class="text-sm">{review.details}</div>
						{/if}
						{#if review.publons_record}
							<a
								href={review.publons_record}
								target="_blank"
								rel="noopener noreferrer"
								class="verification-badge"
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
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Optional: Message if no service activities -->
	{#if realPeerReviews.length === 0 && realEditorialMemberships.length === 0}
		<p class="text-light">No service activities listed.</p>
	{/if}
</section>

<style>
	.verification-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--font-size-xs);
		color: var(--color-primary);
		margin-top: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--border-radius-md);
		background: color-mix(in srgb, var(--color-primary) 5%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
		transition: all var(--transition-duration-150) ease;
		text-decoration: none;
	}

	.verification-badge:hover {
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
		border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
	}
</style>
