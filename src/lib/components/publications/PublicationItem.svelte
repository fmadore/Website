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

<li class="publication-item">
	<div class="publication-card glass-card">
		<div class="publication-grid">
			{#if publication.image}
				<div class="publication-image-container">
					<img 
						src={publication.image} 
						alt={publication.title} 
						class="publication-cover-image"
						width="200"
						height="280"
						loading={imageLoading}
						decoding="async"
					/>
				</div>
			{/if}

			<div class="publication-content">
				<div class="publication-meta">
					<!-- Use typeLabel from formattedCitation -->
					<span class="publication-type">{formattedCitation.typeLabel}</span>
					{#if publication.language && publication.language.includes(',')}
						<span class="publication-language">({publication.language})</span>
					{:else if publication.language && publication.language !== 'English'}
						<span class="publication-language">({publication.language})</span>
					{/if}
				</div>

				<h3 class="publication-title">
					<a href="{base}/publications/{publication.id}" class="publication-title-link">
						{publication.title}
					</a>
				</h3>
				
				<div class="publication-details">
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
					<div class="publication-abstract">
						{truncateAbstract(publication.abstract)}
					</div>
				{/if}

				{#if publication.tags && publication.tags.length > 0}
					<div class="publication-tags">
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
					<div class="publication-links">
						{#each publication.additionalUrls as url, i}
							<a
								href={url.url}
								target="_blank"
								rel="noopener noreferrer"
								class="publication-link-btn glass-button btn-outline-primary"
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
	.publication-item {
		padding: 0;
		list-style: none;
		margin-bottom: var(--spacing-6);
	}

	.publication-card {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-lg);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		position: relative;
		/* Enhanced glassmorphism with subtle gradient overlay to match ContentBody */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
	}

	.publication-card:hover {
		transform: var(--transform-lift-sm);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
	}

	.publication-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-4);
	}

	@media (min-width: 768px) {
		.publication-grid {
			grid-template-columns: auto 1fr;
		}
	}

	.publication-image-container {
		display: flex;
		justify-content: center;
	}

	@media (min-width: 768px) {
		.publication-image-container {
			justify-content: flex-start;
		}
	}

	.publication-cover-image {
		width: 100%;
		max-width: 200px;
		height: auto;
		aspect-ratio: 5/7; /* Typical book cover ratio */
		object-fit: cover;
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-md);
		transition: box-shadow var(--anim-duration-base) var(--anim-ease-out);
	}

	.publication-card:hover .publication-cover-image {
		box-shadow: var(--shadow-lg);
	}

	.publication-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.publication-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-1);
	}

	.publication-type {
		color: var(--color-primary);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.publication-language {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	.publication-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-2);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
	}

	.publication-title-link {
		color: inherit;
		text-decoration: none;
		transition: color var(--anim-duration-fast) var(--anim-ease-out);
	}

	.publication-title-link:hover {
		color: var(--color-primary);
	}

	.publication-details {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-2);
		line-height: var(--line-height-relaxed);
	}

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

	.publication-abstract {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-4);
		line-height: var(--line-height-relaxed);
	}

	.publication-tags {
		margin-top: var(--spacing-3);
	}

	.publication-tags :global(.tag-list) {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
	}

	.publication-links {
		margin-top: var(--spacing-3);
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
	}

	.publication-link-btn {
		font-size: var(--font-size-sm);
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	/* External link indicator for publication links */
	.publication-link-btn:after {
		content: '↗';
		font-size: var(--font-size-xs);
		margin-left: var(--spacing-1);
		opacity: var(--opacity-high);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.publication-card {
			padding: var(--spacing-3);
		}

		.publication-title {
			font-size: var(--font-size-lg);
		}

		.publication-cover-image {
			max-width: 150px;
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.publication-card,
		.publication-cover-image,
		.author-btn,
		.publication-link-btn {
			transition: none;
		}

		.publication-card:hover {
			transform: none;
		}
	}
</style>
