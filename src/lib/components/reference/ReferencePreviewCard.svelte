<script lang="ts">
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { base, resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { ReferenceIndexEntry } from '$lib/types/referenceIndex';
	import { calculateCardPosition, getItemYear } from '$lib/utils/cardPositioning';

	let {
		item,
		itemType,
		referenceElement = null,
		positionClass = '',
		onpointerenter,
		onpointerleave,
		onclose
	}: {
		item: ReferenceIndexEntry;
		itemType: 'publication' | 'communication';
		referenceElement?: HTMLElement | null;
		positionClass?: string;
		onpointerenter?: () => void;
		onpointerleave?: () => void;
		onclose?: () => void;
	} = $props();

	let cardElement = $state<HTMLElement>();
	let isPositioned = $state(false);
	let isClicked = $state(false);

	// Reactive positioning state using Svelte 5 $state
	let shouldPositionBelow = $state(false);
	let cardLeft = $state<string | null>(null);
	let cardTop = $state<string | null>(null);
	let cardBottom = $state<string | null>(null);
	let arrowLeft = $state('50%');
	let cardMaxHeight = $state<string | null>(null);
	let hasOverflow = $state(false);

	const itemUrl = $derived(
		item && itemType
			? resolve(`/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`)
			: '#'
	);

	// Consolidate image source logic
	const imageSrc = $derived(
		item && (('heroImage' in item && item.heroImage?.src) || ('image' in item && item.image))
			? `${base}/${('heroImage' in item && item.heroImage?.src) || ('image' in item && item.image)}`
			: null
	);

	// Use $effect to reactively position the card when dependencies change
	$effect(() => {
		if (!browser || !referenceElement || !cardElement) return;

		tick().then(() => {
			setTimeout(() => {
				if (!cardElement || !referenceElement) return;

				requestAnimationFrame(() => {
					if (!cardElement || !referenceElement) return;

					const pos = calculateCardPosition(referenceElement, cardElement);
					cardLeft = pos.cardLeft;
					cardTop = pos.cardTop;
					cardBottom = pos.cardBottom;
					arrowLeft = pos.arrowLeft;
					shouldPositionBelow = pos.shouldPositionBelow;
					cardMaxHeight = pos.cardMaxHeight;
					hasOverflow = pos.hasOverflow;
					isPositioned = true;
				});
			}, 50);
		});
	});

	function handlePointerEnter() {
		onpointerenter?.();
	}

	function handlePointerLeave() {
		onpointerleave?.();
	}

	// Handle card click with animation
	async function handleCardClick(event: MouseEvent) {
		event.preventDefault();

		if (isClicked) return;
		isClicked = true;

		// Drop the .positioned class so the card plays its reverse opening
		// animation (opacity 1→0). Without this, the wrapper's display:contents
		// means its out:send fade has no visual effect and the card stays fully
		// visible until the transition tears the node out of the DOM.
		isPositioned = false;

		// Wait for the close animation, then dismiss the parent state and navigate.
		setTimeout(() => {
			onclose?.();
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- itemUrl pre-resolved via resolve()
			goto(itemUrl);
		}, 220);
	}
</script>

<div
	bind:this={cardElement}
	class="preview-card {positionClass}"
	class:positioned={isPositioned}
	class:position-below={shouldPositionBelow}
	class:card-clicked={isClicked}
	class:has-overflow={hasOverflow}
	style:left={cardLeft}
	style:top={cardTop}
	style:bottom={cardBottom}
	style:max-height={cardMaxHeight}
	style:overflow-y="auto"
	role="dialog"
	tabindex="-1"
	aria-label="Item Preview"
	aria-modal="false"
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
>
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
	<a href={itemUrl} class="card-link" tabindex="-1" onclick={handleCardClick}>
		<div class="card-content-wrapper">
			{#if imageSrc}
				<div class="card-image-container">
					<img
						src={imageSrc}
						alt={item.title}
						class="card-image"
						loading="lazy"
						decoding="async"
						width="120"
						height="160"
					/>
					<div class="image-overlay"></div>
				</div>
			{/if}
			<div class="card-content">
				<h4 class="card-title">{item.title}</h4>
				{#if item.authors && item.authors.length > 0}
					<p class="card-authors">{item.authors.join(', ')}</p>
				{/if}

				<!-- Dateline — a mono data stamp, not a filled badge. -->
				<div class="card-date-container">
					<span class="card-date-badge">{item.date || getItemYear(item)}</span>
				</div>

				{#if itemType === 'publication'}
					{#if item.type === 'article' && 'journal' in item && item.journal}
						<p class="card-meta"><em>{item.journal}</em></p>
					{:else if item.type === 'chapter' && 'book' in item && item.book}
						<p class="card-meta">In: <em>{item.book}</em></p>
					{:else if item.type === 'book' && 'publisher' in item && item.publisher}
						<p class="card-meta">{item.publisher}</p>
					{:else if item.type === 'special-issue' && 'journal' in item && item.journal}
						<p class="card-meta">Special Issue: <em>{item.journal}</em></p>
					{/if}
				{:else if itemType === 'communication'}
					{#if item.type}
						<p class="card-meta">
							<span class="meta-label"
								>{item.type === 'event'
									? 'Event'
									: item.type === 'podcast'
										? 'Podcast'
										: 'Communication'}</span
							>
						</p>
					{/if}
					{#if item.type === 'event'}
						{#if 'conference' in item && item.conference}
							<p class="card-meta"><em>{item.conference}</em></p>
						{/if}
						{#if 'location' in item && 'country' in item && item.location && item.country}
							<p class="card-meta">{item.location}, {item.country}</p>
						{:else if 'location' in item && item.location}
							<p class="card-meta">{item.location}</p>
						{/if}
					{:else if item.type === 'podcast'}
						{#if 'conference' in item && item.conference}
							<p class="card-meta"><em>{item.conference}</em></p>
						{/if}
						{#if 'episode' in item && item.episode}
							<p class="card-meta">Episode {item.episode}</p>
						{/if}
					{:else}
						{#if 'conference' in item && item.conference}
							<p class="card-meta"><em>{item.conference}</em></p>
						{/if}
						{#if 'location' in item && 'country' in item && item.location && item.country}
							<p class="card-meta">{item.location}, {item.country}</p>
						{:else if 'location' in item && item.location}
							<p class="card-meta">{item.location}</p>
						{/if}
					{/if}
				{/if}

				<!-- View-more hint — a mono-caps apparatus line with a trailing arrow. -->
				<div class="view-more-container">
					<span class="view-more-hint">
						<span class="hint-text">View full details</span>
						<span class="hint-arrow">→</span>
					</span>
				</div>
			</div>
		</div>
	</a>
	<span class="card-arrow" style:left={arrowLeft}></span>
</div>

<style>
	.preview-card {
		/* Fixed positioning means the popover never affects the surrounding
		 * paragraph text flow and never gets clipped by the reference's inline
		 * box. JS computes top/left from the reference's getBoundingClientRect. */
		position: fixed;
		padding: 0;
		width: 380px;
		max-width: calc(100vw - 2rem);
		z-index: var(--z-popover);
		pointer-events: auto;
		text-align: left;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-normal);
		color: var(--color-text);
		overflow: hidden;

		/* A flat paper tile: elevated surface, single hairline frame, square
		 * corners, no shadow. It sits on the page like a mounted apparatus card. */
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border-dark);
		border-radius: 0;

		/* Entrance is a plain opacity fade — no scale, no lift. The `positioned`
		 * class still drives the fade so JS positioning stays in control. */
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--ease-out);
	}

	.preview-card.positioned {
		opacity: 1;
	}

	/* Dark mode — same flat tile on slate; only the border token changes. */
	:global(html.dark) .preview-card {
		background: var(--color-surface-alt);
		border: var(--border-width-thin) solid var(--color-border-dark);
	}

	.card-content-wrapper {
		position: relative;
		overflow: hidden;
	}

	/* Smooth scrolling for overflow cases */
	.preview-card {
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
	}

	/* Custom scrollbar styling for overflow */
	.preview-card::-webkit-scrollbar {
		width: var(--space-2);
	}

	.preview-card::-webkit-scrollbar-track {
		background: transparent;
	}

	.preview-card::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--color-text-muted) 30%, transparent);
		border: var(--space-0-5) solid transparent;
		background-clip: padding-box;
	}

	.preview-card::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--color-text-muted) 50%, transparent);
		background-clip: padding-box;
	}

	/* Firefox scrollbar */
	.preview-card {
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--color-text-muted) 30%, transparent) transparent;
	}

	/* Fade indicator for scrollable content */
	.preview-card::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: var(--space-10);
		background: linear-gradient(
			to bottom,
			transparent 0%,
			color-mix(in srgb, var(--color-surface-elevated) 80%, transparent) 70%,
			var(--color-surface-elevated) 100%
		);
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--ease-out);
		border-radius: 0;
	}

	/* Show fade when scrollable using reactive class */
	.preview-card.has-overflow::after {
		opacity: 1;
	}

	:global(html.dark) .preview-card::after {
		background: linear-gradient(
			to bottom,
			transparent 0%,
			color-mix(in srgb, var(--color-surface-alt) 80%, transparent) 70%,
			var(--color-surface-alt) 100%
		);
	}

	/* The scan sits as a plate: square, a hairline rule beneath it, no gradient
	 * wash, no zoom on hover. */
	.card-image-container {
		position: relative;
		overflow: hidden;
		height: 140px;
		margin: 0;
		padding: 0;
		background: var(--color-background-muted);
		border-bottom: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		display: block;
		margin: 0;
		padding: 0;
		border: none;
	}

	.image-overlay {
		display: none;
	}

	.card-content {
		padding: var(--space-md);
		position: relative;
		background: transparent;
	}

	/* Dark mode content area */
	:global(html.dark) .card-content {
		background: transparent;
	}

	/* Container for date badge */
	.card-date-container {
		margin-bottom: var(--space-sm);
		display: flex;
		justify-content: flex-start;
	}

	/* Dateline — a mono data stamp, no fill, no box. */
	.card-date-badge {
		display: inline-block;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-light);
	}

	/* View-more hint — a mono-caps apparatus line over a top hairline, in the
	 * accent, with a trailing arrow. No pill, no gradient. */
	.view-more-container {
		margin-top: var(--space-md);
		padding-top: var(--space-sm);
		border-top: var(--rule-hairline) solid var(--color-border-light);
	}

	.view-more-hint {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent);
	}

	.hint-arrow {
		display: inline-flex;
		align-items: center;
		/* Match the caps text size with a tight box so the glyph centres on the
		 * text instead of floating above the mono baseline. */
		font-size: var(--font-size-xs);
		line-height: 1;
		flex-shrink: 0;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.card-link {
		text-decoration: none;
		color: inherit;
		display: block;
		border-radius: 0;
	}

	.card-link:hover .view-more-hint,
	.card-link:focus-visible .view-more-hint {
		color: var(--color-accent-dark);
	}

	.card-link:hover .hint-arrow,
	.card-link:focus-visible .hint-arrow {
		transform: translateX(var(--space-1));
	}

	/* Arrow — a small square of the paper body rotated 45°, with two hairline
	 * edges showing, tying the tile to its reference. No shadow. */
	.card-arrow {
		position: absolute;
		bottom: calc(-1 * var(--space-2));
		left: 50%;
		width: var(--space-3);
		height: var(--space-3);

		background: var(--color-surface-elevated);
		border-right: var(--border-width-thin) solid var(--color-border-dark);
		border-bottom: var(--border-width-thin) solid var(--color-border-dark);
		border-radius: 0;
		transform: translateX(-50%) rotate(45deg);
		z-index: var(--z-tooltip);
	}

	.position-below .card-arrow {
		bottom: auto;
		top: calc(-1 * var(--space-2));
		/* Point upward: show the top-left edges instead. */
		border-right: none;
		border-bottom: none;
		border-top: var(--border-width-thin) solid var(--color-border-dark);
		border-left: var(--border-width-thin) solid var(--color-border-dark);
	}

	:global(html.dark) .card-arrow {
		background: var(--color-surface-alt);
		border-color: var(--color-border-dark);
	}

	/* Title — the DOCUMENT voice: Newsreader serif. */
	.card-title {
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--space-xs);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
		font-size: var(--font-size-lg);
	}

	.card-authors {
		font-family: var(--font-family-serif);
		margin-bottom: var(--space-xs);
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		font-style: italic;
	}

	.card-meta {
		font-family: var(--font-family-serif);
		margin-bottom: var(--space-xs);
		color: var(--color-text-soft);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
	}

	.card-meta em {
		font-style: italic;
		color: var(--color-text-emphasis);
	}

	/* Kind marker — a mono "kind" stamp in the data voice, no pill. */
	.meta-label {
		display: inline-block;
		font-family: var(--font-family-mono);
		color: var(--color-accent);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	/* Enhanced focus states */
	.card-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
		border-radius: 0;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.preview-card,
		.hint-arrow {
			transition: none !important;
		}

		.preview-card.positioned {
			opacity: 1;
		}

		.card-link:hover .hint-arrow,
		.card-link:focus-visible .hint-arrow {
			transform: none;
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.preview-card {
			border-width: var(--border-width-medium);
		}
	}

	/* Responsive design */
	@media (--sm-down) {
		.preview-card {
			width: 320px;
			margin: 0 var(--space-xs);
		}

		.card-content {
			padding: var(--space-sm);
		}

		.card-image-container {
			height: 110px;
		}

		.card-title {
			font-size: var(--font-size-sm);
		}
	}
</style>
