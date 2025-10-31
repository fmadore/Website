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

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">Service to Profession</h3>

	<!-- Peer Review Section -->
	{#if realPeerReviews.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Peer Review Activities</h4>
		<div class="space-y-3">
			{#each realPeerReviews as review (review.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{review.year}</div>
					<div class="flex-1">
						<span class="font-medium">{review.type}</span>{#if review.journal}, <em>{review.journal}</em>{:else if review.publisher}, {review.publisher}{/if}.
						{#if review.details}
							<div class="text-sm">{review.details}</div>
						{/if}
						{#if review.publons_record}
							<a
								href={review.publons_record}
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary hover:underline text-sm">[Publons Record]</a
							>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Editorial Board Memberships Section -->
	{#if realEditorialMemberships.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Editorial Board Memberships</h4>
		<div class="space-y-3">
			{#each realEditorialMemberships as member (member.id)}
				<div class="flex gap-4">
					<div class="font-semibold" style="min-width: 5rem;">{member.dateRangeString}</div>
					<div class="flex-1">
						<span class="font-medium">{member.role}</span>, <em>{member.journal}</em>.
						{#if member.details}
							<div class="text-sm">{member.details}</div>
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
