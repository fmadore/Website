<script lang="ts">
	import type { Communication } from '$lib/types/communication';
	import { base } from '$app/paths';
	import { truncateAbstract } from '$lib/utils/textUtils';
	import { formatAuthorList, formatCommunicationCitation } from '$lib/utils/citationFormatter';
	import TagList from '$lib/components/molecules/TagList.svelte';

	interface Props {
		communication: Communication;
		index?: number;
		onfilterrequest?: (event: { type: string; value: string }) => void;
	}

	let { communication, index, onfilterrequest }: Props = $props();

	// Optimize loading for above-the-fold images (first 3 items)
	const imageLoading = $derived((index ?? 0) < 3 ? 'eager' : 'lazy');

	// Human-readable labels for communication types
	const typeLabels: { [key: string]: string } = {
		conference: 'Conference',
		workshop: 'Workshop',
		seminar: 'Seminar',
		lecture: 'Lecture',
		panel: 'Panel',
		event: 'Academic Event'
	};

	// Helper to format language display
	const languageDisplay = $derived.by(() => {
		if (!communication?.language) return null;
		const langs = Array.isArray(communication.language) 
			? communication.language 
			: [communication.language];
		
		// If it's only English, don't show anything
		if (langs.length === 1 && langs[0] === 'English') return null;
		
		// If multiple languages (bilingual/multilingual), show all
		if (langs.length > 1) {
			return langs.join(', ');
		}
		
		// Single non-English language
		return langs[0];
	});

	// Format the citation details
	const citationDetails = $derived(formatCommunicationCitation(communication));
</script>

<li class="entity-list-item">
	<div class="entity-card">
		<div class="entity-grid">
			{#if communication?.image}
				<div class="entity-image-container">
					<a href={`${base}/communications/${communication.id}`} data-sveltekit-preload-code="tap">
						<img
							src={communication.image}
							alt={communication.title}
							class="entity-cover-image"
							width="200"
							height="280"
							loading={imageLoading}
							decoding="async"
						/>
					</a>
				</div>
			{/if}

			<div class="entity-content">
				<div class="entity-meta">
					<span class="entity-type"
						>{typeLabels[communication?.type || 'conference'] ||
							communication?.type ||
							'Conference'}</span
					>
					{#if languageDisplay}
						<span class="entity-language">({languageDisplay})</span>
					{/if}
				</div>

				<h3 class="entity-title">
					<a
						href={`${base}/communications/${communication.id}`}
						class="entity-title-link"
						data-sveltekit-preload-code="tap"
					>
						{communication?.title || 'Untitled Communication'}
					</a>
				</h3>
				<div class="entity-details">
					{#if communication?.authors && communication.authors.length > 0}
						<div>
							{formatAuthorList(communication.authors)}
						</div>
					{/if}

					{#if citationDetails}
						<div>{citationDetails}</div>
					{/if}
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
						{#each communication.additionalUrls as url, i (url.url)}
							<a
								href={url.url}
								target="_blank"
								rel="noopener noreferrer"
								class="entity-link-btn btn btn-outline-primary btn-sm"
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
