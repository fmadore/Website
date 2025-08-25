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

<li class="entity-list-item">
	<div class="entity-card glass-card">
		<div class="entity-grid">
			{#if communication?.image}
				<div class="entity-image-container">
					<img
						src={communication.image}
						alt={communication.title}
						class="entity-cover-image"
						width="200"
						height="280"
						loading={imageLoading}
						decoding="async"
					/>
				</div>
			{/if}

			<div class="entity-content">
				<div class="entity-meta">
					<span class="entity-type"
						>{typeLabels[communication?.type || 'conference'] || communication?.type || 'Conference'}</span
					>
					{#if communication?.language && communication.language !== 'English'}
						<span class="entity-language">({communication.language})</span>
					{/if}
				</div>

				<h3 class="entity-title">
					<a href="{base}/communications/{communication.id}" class="entity-title-link">
						{communication?.title || 'Untitled Communication'}
					</a>
				</h3>

				<div class="entity-details">
					{#if communication?.authors && communication.authors.length > 0}
						<div>
							{communication.authors.join(' and ')}
						</div>
					{/if}

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
					<div class="entity-abstract">
						{truncateAbstract(communication.abstract)}
					</div>
				{/if}

				{#if communication?.tags && communication.tags.length > 0}
					<div class="entity-tags">
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
					<div class="entity-links">
						{#each communication.additionalUrls as url, i}
							<a
								href={url.url}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-outline-primary btn-sm"
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
		padding: 0 var(--spacing-1);
		font-size: inherit;
		font-family: inherit;
		color: var(--color-primary);
		text-decoration: none;
		cursor: pointer;
		display: inline;
		border-radius: var(--border-radius-sm);
	}

	.country-btn:hover {
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
		text-decoration: underline;
	}
</style>
