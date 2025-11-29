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
						<p class="card-meta">Type: {item.type}</p>
					{/if}
					{#if 'event' in item && item.event}
						<p class="card-meta">Event: {item.event}</p>
					{/if}
					{#if 'conference' in item && item.conference}
						<p class="card-meta">Conference: {item.conference}</p>
					{/if}
					{#if 'location' in item && item.location}
						<p class="card-meta">Location: {item.location}</p>
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
			rgba(var(--color-white-rgb), var(--opacity-95)) 0%,
			rgba(var(--color-white-rgb), 0.92) 50%,
			rgba(var(--color-primary-rgb), var(--opacity-5)) 100%
		);

		/* Refined border with subtle shimmer effect */
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-20));
		border-radius: var(--border-radius-2xl);

		/* Enhanced shadow system with multiple layers for depth */
		box-shadow:
			0 20px 60px -15px rgba(var(--color-primary-rgb), var(--opacity-15)),
			0 10px 30px -10px rgba(var(--color-primary-rgb), var(--opacity-10)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-40)),
			inset 0 -1px 0 rgba(var(--color-primary-rgb), var(--opacity-5));

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
			0 25px 80px -20px rgba(var(--color-primary-rgb), var(--opacity-25)),
			0 15px 40px -15px rgba(var(--color-primary-rgb), var(--opacity-15)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-50));
		border-color: rgba(var(--color-primary-rgb), 0.35);
	}

	/* Enhanced dark mode styles with sophisticated depth */
	:global(html.dark) .preview-card {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-alt-rgb), 0.96) 0%,
			rgba(var(--color-dark-surface-alt-rgb), 0.94) 50%,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 100%
		);

		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-25));

		box-shadow:
			0 20px 60px -15px rgba(0, 0, 0, var(--opacity-40)),
			0 10px 30px -10px rgba(var(--color-primary-rgb), var(--opacity-20)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-10)),
			inset 0 -1px 0 rgba(var(--color-primary-rgb), var(--opacity-10));
	}

	:global(html.dark) .preview-card.card-clicked {
		box-shadow:
			0 25px 80px -20px rgba(0, 0, 0, var(--opacity-50)),
			0 15px 40px -15px rgba(var(--color-primary-rgb), var(--opacity-30)),
			inset 0 1px 0 rgba(var(--color-primary-rgb), var(--opacity-20));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-40));
	}

	/* Position below variant */
	.preview-card.position-below {
		bottom: auto;
		top: calc(100% + var(--space-md));
		transform: translateX(-50%) translateY(calc(-1 * var(--transform-distance-sm))) scale(var(--scale-90));
	}

	.preview-card.position-below.positioned {
		transform: translateX(-50%) translateY(0) scale(1);
	}

	.card-content-wrapper {
		position: relative;
		overflow: hidden;
		border-radius: var(--border-radius-2xl);
	}
	
	/* Smooth scrolling for overflow cases */
	.preview-card {
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
	}
	
	/* Custom scrollbar styling for overflow */
	.preview-card::-webkit-scrollbar {
		width: 8px;
	}
	
	.preview-card::-webkit-scrollbar-track {
		background: rgba(var(--color-primary-rgb), var(--opacity-5));
		border-radius: var(--border-radius-lg);
	}
	
	.preview-card::-webkit-scrollbar-thumb {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-30)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-20)) 100%
		);
		border-radius: var(--border-radius-lg);
		border: 2px solid transparent;
		background-clip: padding-box;
	}
	
	.preview-card::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-50)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-40)) 100%
		);
	}
	
	/* Firefox scrollbar */
	.preview-card {
		scrollbar-width: thin;
		scrollbar-color: rgba(var(--color-primary-rgb), var(--opacity-30)) rgba(var(--color-primary-rgb), var(--opacity-5));
	}
	
	/* Fade indicator for scrollable content */
	.preview-card::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 40px;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			rgba(var(--color-white-rgb), var(--opacity-80)) 70%,
			rgba(var(--color-white-rgb), var(--opacity-95)) 100%
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
			rgba(var(--color-dark-surface-alt-rgb), var(--opacity-80)) 70%,
			rgba(var(--color-dark-surface-alt-rgb), var(--opacity-95)) 100%
		);
	}

	.card-image-container {
		position: relative;
		overflow: hidden;
		height: 140px;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-10)),
			rgba(var(--color-accent-rgb), var(--opacity-10))
		);
		
		/* Add subtle border at bottom of image */
		border-bottom: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-10));
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: 
			transform var(--duration-slow) var(--ease-bounce),
			filter var(--duration-moderate) var(--ease-out);
		filter: brightness(1) contrast(1.05);
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-15)) 0%,
			transparent 40%,
			rgba(var(--color-accent-rgb), var(--opacity-15)) 100%
		);
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--ease-out);
		
		/* Add subtle shine effect */
		background-image: 
			linear-gradient(
				135deg,
				rgba(var(--color-primary-rgb), var(--opacity-15)) 0%,
				transparent 40%,
				rgba(var(--color-accent-rgb), var(--opacity-15)) 100%
			),
			linear-gradient(
				to right,
				transparent 0%,
				rgba(var(--color-white-rgb), var(--opacity-10)) 50%,
				transparent 100%
			);
	}

	.card-content {
		padding: var(--space-5);
		position: relative;

		/* Enhanced content area with sophisticated gradient */
		background: linear-gradient(
			180deg,
			rgba(var(--color-white-rgb), 0.85) 0%,
			rgba(var(--color-white-rgb), var(--opacity-95)) 100%
		);
		
		/* Subtle top border for separation */
		box-shadow: inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-50));
	}

	/* Enhanced dark mode content area */
	:global(html.dark) .card-content {
		background: linear-gradient(
			180deg,
			rgba(var(--color-dark-surface-alt-rgb), 0.85) 0%,
			rgba(var(--color-dark-surface-alt-rgb), var(--opacity-95)) 100%
		);
		box-shadow: inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-5));
	}

	/* Container for date badge */
	.card-date-container {
		margin-bottom: var(--space-xs);
		display: flex;
		justify-content: flex-start;
	}

	/* Custom styling for date badge button */
	:global(.card-date-badge) {
		font-size: var(--font-size-xs) !important;
		font-weight: var(--font-weight-bold) !important;
		letter-spacing: var(--letter-spacing-wide) !important;
		padding: var(--space-2xs) var(--space-sm) !important;
		border-radius: var(--border-radius-md) !important;
		cursor: default !important;
		pointer-events: none !important;

		/* Premium glassmorphism for date badge */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 100%
		) !important;
		color: var(--color-primary) !important;
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-25)) !important;
		box-shadow: 
			0 2px 8px rgba(var(--color-primary-rgb), var(--opacity-10)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-30)) !important;
	}
	
	:global(html.dark .card-date-badge) {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-20)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-15)) 100%
		) !important;
		border-color: rgba(var(--color-primary-rgb), var(--opacity-30)) !important;
		box-shadow: 
			0 2px 8px rgba(var(--color-primary-rgb), var(--opacity-15)),
			inset 0 1px 0 rgba(var(--color-primary-rgb), var(--opacity-20)) !important;
	}

	/* Container for view-more hint */
	.view-more-container {
		margin-top: var(--space-sm);
		opacity: 0;
		transform: translateY(var(--transform-distance-xs));
		/* Explicit transition properties for better performance */
		transition:
			opacity var(--duration-moderate) var(--ease-in-out),
			transform var(--duration-moderate) var(--ease-in-out);
	}

	/* Custom styling for view-more hint button */
	:global(.view-more-hint) {
		width: 100% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;
		font-size: var(--font-size-xs) !important;
		font-weight: var(--font-weight-semibold) !important;
		letter-spacing: var(--letter-spacing-wide) !important;
		padding: var(--space-xs) var(--space-md) !important;
		border-radius: var(--border-radius-lg) !important;
		cursor: default !important;
		pointer-events: none !important;

		/* Premium gradient background */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-10)) 100%
		) !important;
		color: var(--color-primary) !important;
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-20)) !important;
		box-shadow: 
			0 4px 12px rgba(var(--color-primary-rgb), var(--opacity-10)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-30)) !important;
	}
	
	:global(html.dark .view-more-hint) {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.18) 0%,
			rgba(var(--color-accent-rgb), 0.12) 100%
		) !important;
		border-color: rgba(var(--color-primary-rgb), var(--opacity-30)) !important;
		box-shadow: 
			0 4px 12px rgba(var(--color-primary-rgb), var(--opacity-15)),
			inset 0 1px 0 rgba(var(--color-primary-rgb), var(--opacity-20)) !important;
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
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-primary-dark) 100%
		);
		color: var(--color-white);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		transform: translateX(calc(-1 * var(--transform-distance-xs)));
		/* Explicit transition properties for better performance */
		transition:
			transform var(--duration-moderate) var(--ease-bounce),
			box-shadow var(--duration-moderate) var(--ease-out);
		box-shadow:
			0 2px 8px rgba(var(--color-primary-rgb), var(--opacity-30)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-20));
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
		transform: translateY(0);
	}

	.card-link:hover .hint-arrow,
	.card-link:focus .hint-arrow {
		transform: translateX(0);
		box-shadow: 
			0 4px 12px rgba(var(--color-primary-rgb), var(--opacity-40)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-30));
	}

	.card-link:hover .card-image,
	.card-link:focus .card-image {
		transform: scale(var(--scale-105));
		filter: brightness(1.05) contrast(1.1);
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
			rgba(var(--color-white-rgb), var(--opacity-95)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-5)) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-20));
		border-radius: var(--border-radius-sm);
		transform: translateX(-50%) rotate(45deg);
		z-index: var(--z-tooltip);
		
		/* Enhanced shadow for depth */
		box-shadow: 
			0 4px 12px rgba(var(--color-primary-rgb), var(--opacity-15)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-40));
	}

	.position-below .card-arrow {
		bottom: auto;
		top: calc(-1 * var(--space-md));
	}

	/* Dark mode arrow with sophisticated glass */
	:global(html.dark) .card-arrow {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-alt-rgb), var(--opacity-95)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-25));
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, var(--opacity-30)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-10));
	}

	.card-title {
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--space-sm);
		color: var(--color-text);
		line-height: var(--line-height-snug);
		font-size: var(--font-size-base);
		
		/* Enhanced gradient text effect */
		background: linear-gradient(
			135deg, 
			var(--color-text) 0%, 
			var(--color-primary) 60%,
			var(--color-accent) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		
		/* Subtle text shadow for depth */
		filter: drop-shadow(0 1px 2px rgba(var(--color-primary-rgb), var(--opacity-10)));
	}
	
	:global(html.dark) .card-title {
		background: linear-gradient(
			135deg, 
			var(--color-text) 0%, 
			var(--color-primary-light) 60%,
			var(--color-accent) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
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
			transform: none;
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
			background: rgba(var(--color-white-rgb), 0.92);
		}

		:global(html.dark) .preview-card {
			background: rgba(var(--color-dark-surface-alt-rgb), 0.92);
		}

		.card-arrow {
			background: rgba(var(--color-white-rgb), var(--opacity-95));
		}
		
		:global(html.dark) .card-arrow {
			background: rgba(var(--color-dark-surface-alt-rgb), var(--opacity-95));
		}
	}

	/* Responsive design */
	@media (--sm-down) {
		.preview-card {
			width: 320px;
			margin: 0 var(--space-xs);
		}

		.card-content {
			padding: var(--space-md);
		}

		.card-image-container {
			height: 120px;
		}
		
		.card-title {
			font-size: var(--font-size-sm);
		}
	}
</style>
