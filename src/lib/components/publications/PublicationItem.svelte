<script lang="ts">
	import type { Publication } from '$lib/types/publication';
	import { base } from '$app/paths';
	import { truncateAbstract } from '$lib/utils/textUtils';
	// Import the necessary functions from the new formatter
	import { formatCitation, getAuthorsArray } from '$lib/utils/citationFormatter';
	import TagList from '$lib/components/molecules/TagList.svelte';

	interface Props {
		publication: Publication;
		onfilterrequest?: (event: { type: string; value: string }) => void;
		index?: number; // Index for loading optimization
	}

	let { publication, onfilterrequest, index }: Props = $props();

	// Optimize loading for above-the-fold images (first 3 items)
	const imageLoading = $derived((index ?? 0) < 3 ? 'eager' : 'lazy');

	// Reactive computation using the citation formatter
	const formattedCitation = $derived(formatCitation(publication)); // Define structure for display list items
	interface DisplayListItem {
		name: string;
		isClickable: boolean;
	}

	// Reactive computation for Author/Editor list (not HTML string)
	const displayData = $derived.by(() => {
		const type = publication.type;
		const authors = publication.authors;
		const editors = publication.editors;
		const selfName = 'Frédérick Madore'; // Define self name

		let items: DisplayListItem[] = [];
		let listPrefix = ''; // Reset prefix

		if (
			type === 'book' ||
			type === 'article' ||
			type === 'chapter' ||
			type === 'encyclopedia' ||
			type === 'report' ||
			type === 'blogpost' ||
			type === 'phd-dissertation' ||
			type === 'masters-thesis'
		) {
			if (authors) {
				const authorsArray = getAuthorsArray(authors);
				items = authorsArray.map((author) => ({
					name: author,
					isClickable: false // No longer needed, but keep structure for now
				}));
			}
		} else if (type === 'special-issue') {
			if (editors) {
				listPrefix = 'Edited by ';
				if (typeof editors === 'string') {
					const editorsArray = editors
						.split(' and ')
						.flatMap((part) => part.split(', '))
						.map((name) => name.trim())
						.filter(Boolean);
					items = editorsArray.map((editor) => ({
						name: editor,
						isClickable: false // No longer needed
					}));
				}
				// Add logic for array editors if needed
			}
		}
		// Handle advisors separately in the template as before
		// Handle prefacedBy separately in the template as before

		// Build the authorString
		let builtString = '';
		const listLength = items.length;
		items.forEach((item, i) => {
			builtString += item.name; // Add name
			if (i < listLength - 1) {
				// If not the last item
				// Use ', ' for all but the last join, which is ' and '.
				const separator = i === listLength - 2 ? ' and ' : ', ';
				builtString += separator;
			}
		});

		return {
			displayList: items,
			listPrefix,
			authorString: builtString
		};
	});
</script>

<li class="entity-list-item">
	<div class="entity-card glass-card">
		<div class="entity-grid">
			{#if publication.image}
				<div class="entity-image-container">
					<img 
						src={publication.image} 
						alt={publication.title} 
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
					<!-- Use typeLabel from formattedCitation -->
					<span class="entity-type">{formattedCitation.typeLabel}</span>
					{#if publication.language && publication.language.includes(',')}
						<span class="entity-language">({publication.language})</span>
					{:else if publication.language && publication.language !== 'English'}
						<span class="entity-language">({publication.language})</span>
					{/if}
				</div>

				<h3 class="entity-title">
					<a href="{base}/publications/{publication.id}" class="entity-title-link">
						{publication.title}
					</a>
				</h3>
				
				<div class="entity-details">
					<!-- Render prefix and the constructed author string -->
					{displayData.listPrefix}{displayData.authorString}
					<!-- Space, then (Year). Only if year is defined -->
					{#if formattedCitation.year}
						({formattedCitation.year}).
					{/if}

					<!-- Add type-specific prefixes before detailsHtml -->
					{#if publication.type === 'phd-dissertation' || publication.type === 'masters-thesis'}
						<span>"{publication.title}". </span>
						{@html formattedCitation.detailsHtml}
						<!-- Supervisor info remains separate -->
						{#if publication.advisors && publication.advisors.length > 0}
							<div class="advisor-info">
								<span>Supervised by </span>
								{#each publication.advisors as advisor, i}
									{#if advisor !== 'Frédérick Madore'}
										<button
											class="author-btn"
											onclick={() => onfilterrequest?.({ type: 'author', value: advisor })}
										>
											{advisor}
										</button>
									{:else}
										<span>{advisor}</span>
									{/if}
									{#if i < publication.advisors.length - 1}
										<span> and </span>
									{/if}
								{/each}
							</div>
						{/if}
					{:else if publication.type === 'encyclopedia'}
						<span>"{publication.title}". </span>
						{@html formattedCitation.detailsHtml}
					{:else}
						<!-- Render details generated by formatter (covers article, chapter, book, report, special-issue, blogpost) -->
						{@html formattedCitation.detailsHtml}
					{/if}

					<!-- Preface information -->
					{#if publication.prefacedBy}
						<div class="preface-info">
							<span>Preface by </span>
							{#if publication.prefacedBy !== 'Frédérick Madore'}
								<button
									class="author-btn"
									onclick={() =>
										onfilterrequest?.({ type: 'author', value: publication.prefacedBy || '' })}
								>
									{publication.prefacedBy}
								</button>
							{:else}
								<span>{publication.prefacedBy}</span>
							{/if}
						</div>
					{/if}
				</div>

				{#if publication.abstract}
					<div class="entity-abstract">
						{truncateAbstract(publication.abstract)}
					</div>
				{/if}

				{#if publication.tags && publication.tags.length > 0}
					<div class="entity-tags">
						<TagList
							tags={publication.tags}
							baseUrl="/publications?tag="
							showTitle={false}
							buttonVariant="outline-secondary"
							buttonSize="sm"
						/>
					</div>
				{/if}

				{#if publication.additionalUrls && publication.additionalUrls.length > 0}
					<div class="entity-links">
						{#each publication.additionalUrls as url, i}
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

<style>
	.advisor-info,
	.preface-info {
		margin-top: var(--spacing-1);
	}

	.author-btn {
		background: none;
		border: none;
		padding: var(--spacing-1);
		font-size: inherit;
		font-family: inherit;
		color: var(--color-primary);
		text-decoration: none;
		cursor: pointer;
		display: inline;
		border-radius: var(--border-radius-sm);
		font-weight: var(--font-weight-medium);
		transition: all var(--anim-duration-fast) var(--anim-ease-out);
	}

	.author-btn:hover {
		background-color: rgba(var(--color-primary-rgb), var(--opacity-low));
		text-decoration: underline;
	}

	.author-btn:focus-visible {
		outline: 2px solid var(--color-highlight);
		outline-offset: 2px;
		box-shadow: 0 0 0 4px rgba(var(--color-highlight-rgb), 0.2);
	}
</style>
