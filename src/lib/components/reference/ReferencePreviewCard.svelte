<script lang="ts">
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Publication, Communication } from '$lib/types';
	import Button from '$lib/components/atoms/Button.svelte';

	let {
		item,
		itemType,
		referenceElement = null,
		positionClass = '',
		onpointerenter,
		onpointerleave
	}: {
		item: Publication | Communication;
		itemType: 'publication' | 'communication';
		referenceElement?: HTMLElement | null;
		positionClass?: string;
		onpointerenter?: () => void;
		onpointerleave?: () => void;
	} = $props();

	let cardElement = $state<HTMLElement>();
	let isPositioned = $state(false);
	let isClicked = $state(false);

	// Reactive positioning state using Svelte 5 $state
	let shouldPositionBelow = $state(false);
	let cardLeft = $state('50%');
	let arrowLeft = $state('50%');
	let cardMaxHeight = $state<string | null>(null);
	let hasOverflow = $state(false);

	// Helper function to get year consistently
	function getYear(item: Publication | Communication): string {
		if ('dateISO' in item && item.dateISO) return item.dateISO.substring(0, 4);
		if ('date' in item && item.date) return item.date.substring(0, 4);
		if ('year' in item && item.year) return item.year.toString();
		return 'N/D';
	}

	const itemUrl = $derived(
		item && itemType
			? `${base}/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`
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

		// Let the animation start first
		tick().then(() => {
			// Position the card after a short delay to allow initial animations
			setTimeout(() => {
				positionCard();
				isPositioned = true;
			}, 50);
		});
	});

	function positionCard() {
		if (!browser || !referenceElement || !cardElement) return;

		// Use requestAnimationFrame to measure after browser layout/paint
		requestAnimationFrame(() => {
			if (!cardElement || !referenceElement) return;

			const refRect = referenceElement.getBoundingClientRect();
			const cardWidth = cardElement.offsetWidth;
			const cardHeight = cardElement.offsetHeight;
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const margin = 16; // Minimum margin from viewport edges

			// ===== HORIZONTAL POSITIONING =====
			// Calculate how much the card would overflow on each side if centered on refCenter
			const refCenter = refRect.left + refRect.width / 2;
			const halfCardWidth = cardWidth / 2;
			const leftOverflow = halfCardWidth - refCenter;
			const rightOverflow = refCenter + halfCardWidth - viewportWidth;

			// Calculate the horizontal offset to keep card fully in viewport
			let horizontalOffset = 0;

			if (leftOverflow > 0) {
				// Would overflow left edge, shift right
				horizontalOffset = leftOverflow + margin;
			} else if (rightOverflow > 0) {
				// Would overflow right edge, shift left
				horizontalOffset = -rightOverflow - margin;
			}

			// Update reactive state instead of direct DOM manipulation
			cardLeft = `calc(50% + ${horizontalOffset}px)`;
			arrowLeft = `calc(50% - ${horizontalOffset}px)`;

			// ===== VERTICAL POSITIONING =====
			// Check if card would overflow viewport vertically
			const spaceAbove = refRect.top;
			const spaceBelow = viewportHeight - refRect.bottom;

			// Determine if we should position above or below
			shouldPositionBelow = spaceAbove < cardHeight + margin && spaceBelow > spaceAbove;

			if (shouldPositionBelow) {
				// Check if it fits below, otherwise constrain height
				if (spaceBelow < cardHeight + margin) {
					cardMaxHeight = `${spaceBelow - margin}px`;
					hasOverflow = true;
				} else {
					cardMaxHeight = null;
					hasOverflow = false;
				}
			} else {
				// Position above the reference (default)
				// Check if it fits above, otherwise constrain height
				if (spaceAbove < cardHeight + margin) {
					cardMaxHeight = `${spaceAbove - margin}px`;
					hasOverflow = true;
				} else {
					cardMaxHeight = null;
					hasOverflow = false;
				}
			}
		});
	}

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

		// Delay navigation to allow animation to complete
		setTimeout(() => {
			goto(itemUrl);
		}, 300);
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
	style:max-height={cardMaxHeight}
	style:overflow-y={hasOverflow ? 'auto' : null}
	role="dialog"
	tabindex="-1"
	aria-label="Item Preview"
	aria-modal="false"
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
>
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

				<!-- Using Button component for date badge -->
				<div class="card-date-container">
					<Button
						variant="outline-primary"
						size="sm"
						glass={true}
						additionalClasses="card-date-badge"
					>
						{item.date || getYear(item)}
					</Button>
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

				<!-- Using Button component for view-more-hint -->
				<div class="view-more-container">
					<Button
						variant="outline-primary"
						size="sm"
						glass={true}
						additionalClasses="view-more-hint"
					>
						<span class="hint-text">View full details</span>
						<span class="hint-arrow">→</span>
					</Button>
				</div>
			</div>
		</div>
	</a>
	<span class="card-arrow" style:left={arrowLeft}></span>
</div>

<style>
	.preview-card {
		position: absolute;
		bottom: calc(100% + var(--space-md));
		left: 50%;
		transform: translateX(-50%);
		padding: 0;
		width: 380px;
		max-width: 90vw;
		z-index: var(--z-popover);
		pointer-events: auto;
		text-align: left;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-normal);
		color: var(--color-text);
		overflow: hidden;

		/* Enhanced glassmorphism using global variables */
		backdrop-filter: blur(var(--glass-blur-2xl)) saturate(150%);
		-webkit-backdrop-filter: blur(var(--glass-blur-2xl)) saturate(150%);

		/* Premium glass background with subtle gradients */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-white) 98%, transparent) 0%,
			color-mix(in srgb, var(--color-white) 97%, transparent) 50%,
			color-mix(in srgb, var(--color-white) 98%, transparent) 100%
		);

		/* Refined border with subtle shimmer effect */
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
		border-radius: var(--border-radius-2xl);

		/* Enhanced shadow system with multiple layers for depth */
		box-shadow:
			0 20px 60px -15px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent),
			0 10px 30px -10px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-40) * 100%), transparent),
			inset 0 -1px 0
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent);

		/* Initial state for animation using design system tokens */
		opacity: 0;
		transform: translateX(-50%) translateY(var(--transform-distance-sm)) scale(var(--scale-90));
		/* Explicit transition properties for better performance */
		transition:
			opacity var(--duration-moderate) var(--ease-bounce),
			transform var(--duration-moderate) var(--ease-bounce),
			box-shadow var(--duration-moderate) var(--ease-bounce),
			border-color var(--duration-moderate) var(--ease-bounce);
		/* Performance optimization */
		will-change: opacity, transform;
	}

	.preview-card.positioned {
		opacity: 1;
		transform: translateX(-50%) translateY(0) scale(1);
	}

	.preview-card.card-clicked {
		transform: translateX(-50%) translateY(calc(-1 * var(--space-xs))) scale(1.02);
		box-shadow:
			0 25px 80px -20px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-25) * 100%), transparent),
			0 15px 40px -15px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-50) * 100%), transparent);
		border-color: color-mix(in srgb, var(--color-primary) 35%, transparent);
	}

	/* Enhanced dark mode styles with sophisticated depth */
	:global(html.dark) .preview-card {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface-alt) 98%, transparent) 0%,
			color-mix(in srgb, var(--color-dark-surface-alt) 97%, transparent) 50%,
			color-mix(in srgb, var(--color-dark-surface-alt) 98%, transparent) 100%
		);

		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-25) * 100%), transparent);

		box-shadow:
			0 20px 60px -15px color-mix(in srgb, black calc(var(--opacity-40) * 100%), transparent),
			0 10px 30px -10px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent),
			inset 0 -1px 0
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
	}

	:global(html.dark) .preview-card.card-clicked {
		box-shadow:
			0 25px 80px -20px color-mix(in srgb, black calc(var(--opacity-50) * 100%), transparent),
			0 15px 40px -15px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent),
			inset 0 1px 0
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-40) * 100%),
			transparent
		);
	}

	/* Position below variant */
	.preview-card.position-below {
		bottom: auto;
		top: calc(100% + var(--space-md));
		transform: translateX(-50%) translateY(calc(-1 * var(--transform-distance-sm)))
			scale(var(--scale-90));
	}

	.preview-card.position-below.positioned {
		transform: translateX(-50%) translateY(0) scale(1);
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
		background: color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent);
		border-radius: var(--border-radius-lg);
	}

	.preview-card::-webkit-scrollbar-thumb {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-20) * 100%), transparent) 100%
		);
		border-radius: var(--border-radius-lg);
		border: var(--space-0-5) solid transparent;
		background-clip: padding-box;
	}

	.preview-card::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-50) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-40) * 100%), transparent) 100%
		);
	}

	/* Firefox scrollbar */
	.preview-card {
		scrollbar-width: thin;
		scrollbar-color: color-mix(
				in srgb,
				var(--color-primary) calc(var(--opacity-30) * 100%),
				transparent
			)
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent);
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
			color-mix(in srgb, var(--color-white) calc(var(--opacity-80) * 100%), transparent) 70%,
			color-mix(in srgb, var(--color-white) calc(var(--opacity-95) * 100%), transparent) 100%
		);
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--ease-out);
		border-radius: 0 0 var(--border-radius-2xl) var(--border-radius-2xl);
	}

	/* Show fade when scrollable using reactive class */
	.preview-card.has-overflow::after {
		opacity: 1;
	}

	:global(html.dark) .preview-card::after {
		background: linear-gradient(
			to bottom,
			transparent 0%,
			color-mix(in srgb, var(--color-dark-surface-alt) calc(var(--opacity-80) * 100%), transparent)
				70%,
			color-mix(in srgb, var(--color-dark-surface-alt) calc(var(--opacity-95) * 100%), transparent)
				100%
		);
	}

	.card-image-container {
		position: relative;
		overflow: hidden;
		height: 140px;
		margin: 0;
		padding: 0;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent),
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-10) * 100%), transparent)
		);
		border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0;
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
		transition:
			transform var(--duration-slow) var(--ease-bounce),
			filter var(--duration-moderate) var(--ease-out);
		filter: brightness(1) contrast(1.02);
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent) 0%,
			transparent 40%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-15) * 100%), transparent) 100%
		);
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--ease-out);

		/* Add subtle shine effect */
		background-image:
			linear-gradient(
				135deg,
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent) 0%,
				transparent 40%,
				color-mix(in srgb, var(--color-accent) calc(var(--opacity-15) * 100%), transparent) 100%
			),
			linear-gradient(
				to right,
				transparent 0%,
				color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent) 50%,
				transparent 100%
			);
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

	/* Custom styling for date badge button */
	:global(.card-date-badge) {
		font-size: var(--font-size-2xs) !important;
		font-weight: var(--font-weight-semibold) !important;
		letter-spacing: var(--letter-spacing-wide) !important;
		padding: var(--space-3xs) var(--space-xs) !important;
		border-radius: var(--border-radius) !important;
		cursor: default !important;
		pointer-events: none !important;
		background: color-mix(in srgb, var(--color-primary) 8%, transparent) !important;
		color: var(--color-primary) !important;
		border: none !important;
		box-shadow: none !important;
	}

	:global(html.dark .card-date-badge) {
		background: color-mix(in srgb, var(--color-primary) 15%, transparent) !important;
		color: var(--color-primary-light) !important;
	}

	/* Container for view-more hint */
	.view-more-container {
		margin-top: var(--space-md);
		opacity: 0.7;
		transition: opacity var(--duration-moderate) var(--ease-out);
	}

	/* Custom styling for view-more hint button */
	:global(.view-more-hint) {
		width: 100% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		gap: var(--space-sm) !important;
		font-size: var(--font-size-xs) !important;
		font-weight: var(--font-weight-semibold) !important;
		letter-spacing: var(--letter-spacing-wide) !important;
		padding: var(--space-xs) var(--space-md) !important;
		border-radius: var(--border-radius-full) !important;
		cursor: default !important;
		pointer-events: none !important;

		/* Clean gradient background */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-primary) 4%, transparent) 100%
		) !important;
		color: var(--color-primary) !important;
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent) !important;
		box-shadow: none !important;
	}

	:global(html.dark .view-more-hint) {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 100%
		) !important;
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		) !important;
		box-shadow: none !important;
	}

	.hint-text {
		letter-spacing: var(--letter-spacing-wide);
	}

	.hint-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-lg);
		height: var(--space-lg);
		background: var(--color-primary);
		color: var(--color-white);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		flex-shrink: 0;
		transition:
			transform var(--duration-moderate) var(--ease-out),
			background-color var(--duration-moderate) var(--ease-out);
	}

	.card-link {
		text-decoration: none;
		color: inherit;
		display: block;
		border-radius: var(--border-radius-2xl);
		/* Explicit transition properties for better performance */
		transition:
			box-shadow var(--duration-moderate) var(--ease-out),
			border-color var(--duration-moderate) var(--ease-out);
	}

	.card-link:hover .view-more-container,
	.card-link:focus .view-more-container {
		opacity: 1;
	}

	.card-link:hover .hint-arrow,
	.card-link:focus .hint-arrow {
		transform: translateX(var(--space-2xs));
		background: var(--color-primary-dark);
	}

	.card-link:hover .card-image,
	.card-link:focus .card-image {
		transform: scale(1.03);
		filter: brightness(1.02) contrast(1.05);
	}

	.card-link:hover .image-overlay,
	.card-link:focus .image-overlay {
		opacity: 1;
	}

	/* ENHANCED ARROW STYLES */
	.card-arrow {
		position: absolute;
		bottom: calc(-1 * var(--space-md));
		left: 50%;
		width: var(--space-lg);
		height: var(--space-lg);

		/* Sophisticated glass effect for arrow */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-white) calc(var(--opacity-95) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));

		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
		border-radius: var(--border-radius-sm);
		transform: translateX(-50%) rotate(45deg);
		z-index: var(--z-tooltip);

		/* Enhanced shadow for depth */
		box-shadow:
			0 4px 12px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-40) * 100%), transparent);
	}

	.position-below .card-arrow {
		bottom: auto;
		top: calc(-1 * var(--space-md));
	}

	/* Dark mode arrow with sophisticated glass */
	:global(html.dark) .card-arrow {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface-alt) calc(var(--opacity-95) * 100%), transparent)
				0%,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-25) * 100%),
			transparent
		);
		box-shadow:
			0 4px 12px color-mix(in srgb, black calc(var(--opacity-30) * 100%), transparent),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
	}

	.card-title {
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--space-xs);
		color: var(--color-text);
		line-height: var(--line-height-snug);
		font-size: var(--font-size-base);
	}

	:global(html.dark) .card-title {
		color: var(--color-text);
	}

	.card-authors {
		margin-bottom: var(--space-xs);
		color: var(--color-text-light);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-wide);
	}

	.card-meta {
		margin-bottom: var(--space-xs);
		color: var(--color-text-light);
		font-size: var(--font-size-xs);
		line-height: var(--line-height-relaxed);
	}

	.card-meta em {
		font-style: italic;
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
	}

	.meta-label {
		display: inline-block;
		padding: var(--space-3xs) var(--space-xs);
		background: color-mix(in srgb, var(--color-accent) calc(var(--opacity-15) * 100%), transparent);
		color: var(--color-accent);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: capitalize;
		border-radius: var(--border-radius);
		letter-spacing: var(--letter-spacing-wide);
	}

	:global(html.dark) .meta-label {
		background: color-mix(in srgb, var(--color-accent) calc(var(--opacity-20) * 100%), transparent);
	}

	/* Enhanced focus states */
	.card-link:focus {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-2xs);
		border-radius: var(--border-radius-2xl);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.preview-card {
			transition: none !important;
			will-change: auto !important;
		}

		.preview-card.positioned {
			opacity: 1;
			transform: translateX(-50%) translateY(0) scale(1);
		}

		.card-link,
		.card-image,
		.image-overlay,
		.view-more-container,
		.hint-arrow {
			transition: none !important;
		}

		.card-link:hover .card-image {
			transform: none;
		}

		.view-more-container {
			opacity: 1;
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.preview-card {
			border-width: var(--border-width-medium);
		}
	}

	/* Backdrop filter fallback */
	@supports not (backdrop-filter: blur(var(--glass-blur-2xl))) {
		.preview-card {
			background: color-mix(in srgb, var(--color-white) 92%, transparent);
		}

		:global(html.dark) .preview-card {
			background: color-mix(in srgb, var(--color-dark-surface-alt) 92%, transparent);
		}

		.card-arrow {
			background: color-mix(
				in srgb,
				var(--color-white) calc(var(--opacity-95) * 100%),
				transparent
			);
		}

		:global(html.dark) .card-arrow {
			background: color-mix(
				in srgb,
				var(--color-dark-surface-alt) calc(var(--opacity-95) * 100%),
				transparent
			);
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
