<script lang="ts">
	import type { Communication } from '$lib/types/communication';
	import { createEventDispatcher } from 'svelte';
	import { base } from '$app/paths';
	import { truncateAbstract } from '$lib/utils/textUtils';
	import TagList from '$lib/components/molecules/TagList.svelte';

	let { communication, index }: { communication: Communication; index?: number } = $props();

	// Optimize loading for above-the-fold images (first 3 items)
	const imageLoading = $derived((index ?? 0) < 3 ? 'eager' : 'lazy');

	const dispatch = createEventDispatcher();

	// Human-readable labels for communication types
	const typeLabels: { [key: string]: string } = {
		conference: 'Conference',
		workshop: 'Workshop',
		seminar: 'Seminar',
		lecture: 'Lecture',
		panel: 'Panel',
		event: 'Academic Event'
	};

	// Helper function to truncate abstract
	// function truncateAbstract(abstract: string | undefined, maxLength: number = 200): string {
	//     if (!abstract) return '';
	//     if (abstract.length <= maxLength) return abstract;
	//     return abstract.substring(0, maxLength) + '...';
	// }
</script>

<li class="p-0 list-none">
	<div class="card p-4 hover-shadow">
		<div class="grid md:grid-cols-4 gap-4">
			{#if communication?.image}
				<div class="col-span-1">
					<img 
						src={communication.image} 
						alt={communication.title} 
						class="communication-image"
						width="200"
						height="280"
						loading={imageLoading}
						decoding="async"
					/>
				</div>
			{/if}

			<div class={communication.image ? 'col-span-3' : 'col-span-4'}>
				<div class="mb-2">
					<span class="text-primary text-sm"
						>{typeLabels[communication?.type || 'conference'] ||
							communication?.type ||
							'Conference'}</span
					>
					{#if communication?.language && communication.language !== 'English'}
						<span class="text-light text-sm ml-2">({communication.language})</span>
					{/if}
				</div>

				<h3 class="text-default font-medium mb-2">
					<a href="{base}/communications/{communication.id}" class="hover:text-primary">
						{communication?.title || 'Untitled Communication'}
					</a>
				</h3>

				<div class="communication-details text-light text-sm mb-2">
					<!-- Authors -->
					{#if communication?.authors && communication.authors.length > 0}
						<div>
							{communication.authors.join(' and ')}
						</div>
					{/if}

					<!-- Conference details -->
					<div>
						<span>{communication?.conference || 'Unknown Conference'}</span>
						{#if communication?.location}
							<span>, {communication.location}</span>
						{/if}
						{#if communication?.country}
							<button
								class="country-btn"
								onclick={() =>
									dispatch('filterrequest', { type: 'country', value: communication.country })}
							>
								<span>, {communication.country}</span>
							</button>
						{/if}
						{#if communication?.date}
							<span>, {communication.date}</span>
						{/if}
					</div>
				</div>

				{#if communication?.abstract}
					<div class="text-light text-sm mb-4">
						{truncateAbstract(communication.abstract)}
					</div>
				{/if}

				{#if communication?.tags && communication.tags.length > 0}
					<div class="communication-tags">
						<TagList
							tags={communication.tags}
							baseUrl="/conference-activity?tag="
							showTitle={false}
							buttonVariant="outline-secondary"
							buttonSize="sm"
						/>
					</div>
				{/if}

				{#if communication?.additionalUrls && communication.additionalUrls.length > 0}
					<div class="mt-3">
						{#each communication.additionalUrls as url, i}
							<a
								href={url.url}
								target="_blank"
								rel="noopener noreferrer"
								class="btn-sm btn-outline-primary mr-2"
							>
								{url.label || `Link ${i + 1}`}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</li>

<style>
	.country-btn {
		background: none;
		border: none;
		padding: 0 var(--spacing-1); /* Add small padding */
		font-size: inherit;
		font-family: inherit;
		color: var(--color-primary); /* Use theme primary color */
		text-decoration: none; /* Remove default underline */
		cursor: pointer;
		display: inline;
		border-radius: var(--border-radius-sm); /* Add slight rounding */
	}

	.country-btn:hover {
		/* Use primary color with low opacity for background */
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
		text-decoration: underline; /* Add underline on hover */
	}

	/* Replace with hover:shadow-md utility */
	/*
    .hover-shadow:hover {
        box-shadow: var(--shadow-md);
    }
    */

	/* Replace with font-medium utility */
	/*
    .font-weight-500 {
        font-weight: 500;
    }
    */

	/* Replace with text-sm utility */
	/*
    .text-sm {
        font-size: 0.875rem;
    }
    */

	/* Replace with ml-2 utility */
	/*
    .ml-2 {
        margin-left: 0.5rem;
    }
    */

	.communication-image {
		width: 100%;
		height: auto;
		aspect-ratio: 5/7; /* Consistent with publication covers */
		object-fit: cover;
		border-radius: 4px;
		box-shadow: var(--shadow-md);
	}

	.communication-tags {
		margin-top: var(--spacing-3);
	}
</style>
