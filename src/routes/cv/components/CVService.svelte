<script lang="ts">
	import { peerReviewsByDate } from '$lib/data/peer-reviews';
	import { editorialMembershipsByDate } from '$lib/data/editorial-memberships';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">Service to Profession</h3>

	<!-- Peer Review Section -->
	{#if peerReviewsByDate.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2 pl-4">Peer Review Activities</h4>
		<ul class="list-disc pl-8">
			{#each peerReviewsByDate as review (review.id)}
				<li class="mb-3">
					<span class="font-medium">{review.type}</span>{#if review.journal}
						for <em>{review.journal}</em>{/if}{#if review.publisher}
						for {review.publisher}{/if} ({review.year}).
					{#if review.details}
						<p class="ml-4 text-sm">{review.details}</p>{/if}
					{#if review.publons_record}
						<a
							href={review.publons_record}
							target="_blank"
							rel="noopener noreferrer"
							class="ml-2 text-primary hover:underline text-sm">[Publons Record]</a
						>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<!-- Editorial Board Memberships Section -->
	{#if editorialMembershipsByDate.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2 pl-4">Editorial Board Memberships</h4>
		<ul class="list-disc pl-8">
			{#each editorialMembershipsByDate as member (member.id)}
				<li class="mb-3">
					<span class="font-medium">{member.role}</span>, <em>{member.journal}</em>.
					<span class="block ml-4 text-sm text-light">{member.dateRangeString}</span>
					{#if member.details}
						<p class="ml-4 text-sm">{member.details}</p>{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<!-- Optional: Message if no service activities -->
	{#if peerReviewsByDate.length === 0 && editorialMembershipsByDate.length === 0}
		<p class="pl-4 text-light">No service activities listed.</p>
	{/if}
</section>
