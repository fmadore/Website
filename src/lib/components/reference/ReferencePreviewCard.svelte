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

	$effect(() => {
		// Let the animation start first using async IIFE
		(async () => {
			await tick();
			// Position the card after a short delay to allow initial animations
			setTimeout(() => {
				positionCard();
				isPositioned = true;
			}, 50);
		})();
	});

	function positionCard() {
		if (!browser || !referenceElement || !cardElement) return;

		// Use requestAnimationFrame to measure after browser layout/paint
		requestAnimationFrame(() => {
			if (!cardElement || !referenceElement) return; // Check again inside callback
			const refRect = referenceElement.getBoundingClientRect();
			const cardWidth = cardElement.offsetWidth;
			const viewportWidth = window.innerWidth;

			// Calculate how much the card would overflow on each side if centered on refCenter
			const refCenter = refRect.left + refRect.width / 2;
			const halfCardWidth = cardWidth / 2;
			const leftOverflow = halfCardWidth - refCenter;
			const rightOverflow = refCenter + halfCardWidth - viewportWidth;

			// Calculate the horizontal offset to keep card fully in viewport
			let horizontalOffset = 0;

			if (leftOverflow > 0) {
				// Would overflow left edge, shift right
				horizontalOffset = leftOverflow;
			} else if (rightOverflow > 0) {
				// Would overflow right edge, shift left
				horizontalOffset = -rightOverflow;
			}

			// Apply horizontal offset
			cardElement.style.left = `calc(50% + ${horizontalOffset}px)`;

			// Position arrow to point at reference element
			const arrowElement = cardElement.querySelector('.card-arrow') as HTMLElement;
			if (arrowElement) {
				arrowElement.style.left = `calc(50% - ${horizontalOffset}px)`;
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

		// Apply click effect
		if (cardElement) {
			// Check cardElement before use
			cardElement.classList.add('card-clicked');

			// Delay navigation to allow animation to complete
			setTimeout(() => {
				goto(itemUrl);
			}, 300);
		}
	}
</script>

<div
	bind:this={cardElement}
	class="preview-card {positionClass}"
	class:positioned={isPositioned}
	class:card-clicked={isClicked}
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
	<span class="card-arrow"></span>
</div>

<style>
	.preview-card {
		position: absolute;
		bottom: calc(100% + var(--spacing-3));
		left: 50%;
		transform: translateX(-50%);
		padding: 0;
		width: 350px;
		max-width: 90vw;
		z-index: 1000;
		pointer-events: auto;
		text-align: left;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-normal);
		color: var(--color-text);
		overflow: hidden;

		/* Improved glassmorphism for better readability */
		backdrop-filter: blur(var(--glass-blur-amount)) saturate(120%);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount)) saturate(120%);

		/* Higher opacity background using global values */
		background: linear-gradient(
			135deg,
			rgba(var(--color-white-rgb), var(--opacity-90)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-5)) 100%
		);

		/* Using global border system */
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-15));
		border-radius: var(--border-radius-xl);

		/* Using global shadow system */
		box-shadow: var(--shadow-xl);

		/* Initial state for animation using global variables */
		opacity: 0;
		transform: translateX(-50%) translateY(var(--spacing-2)) scale(var(--scale-95));
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.preview-card.positioned {
		opacity: 1;
		transform: translateX(-50%) translateY(0) scale(var(--scale-100));
	}

	.preview-card.card-clicked {
		transform: translateX(-50%) translateY(calc(-1 * var(--spacing-1))) scale(var(--scale-105));
		box-shadow: var(--shadow-2xl);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-30));
	}

	/* Dark mode styles with better readability */
	:global(html.dark) .preview-card {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-alt-rgb), var(--opacity-90)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-5)) 100%
		);

		border: var(--border-width-thin) solid
			rgba(var(--color-primary-rgb), var(--opacity-30));

		box-shadow:
			var(--shadow-xl),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-15));
	}

	:global(html.dark) .preview-card.card-clicked {
		box-shadow:
			var(--shadow-2xl),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-primary-rgb), var(--opacity-30));

		border-color: rgba(var(--color-primary-rgb), var(--opacity-30));
	}

	/* Position below variant */
	.preview-card.position-below {
		bottom: auto;
		top: calc(100% + var(--spacing-3));
		transform: translateX(-50%) translateY(calc(-1 * var(--spacing-2))) scale(var(--scale-95));
	}

	.preview-card.position-below.positioned {
		transform: translateX(-50%) translateY(0) scale(var(--scale-100));
	}

	.card-content-wrapper {
		position: relative;
		overflow: hidden;
		border-radius: var(--border-radius-xl);
	}

	.card-image-container {
		position: relative;
		overflow: hidden;
		height: 120px;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-15)),
			rgba(var(--color-accent-rgb), var(--opacity-15))
		);
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform var(--anim-duration-slow) var(--anim-ease-base);
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 0%,
			transparent 50%,
			rgba(var(--color-accent-rgb), var(--opacity-10)) 100%
		);
		opacity: 0;
		transition: opacity var(--anim-duration-base) var(--anim-ease-out);
	}

	.card-content {
		padding: var(--spacing-4);
		position: relative;

		/* Improved content area background for readability */
		background: linear-gradient(
			180deg,
			rgba(var(--color-white-rgb), 0.7) 0%,
			rgba(var(--color-white-rgb), 0.9) 100%
		);
	}

	/* Dark mode content area */
	:global(html.dark) .card-content {
		background: linear-gradient(
			180deg,
			rgba(var(--color-dark-surface-alt-rgb), 0.8) 0%,
			rgba(var(--color-dark-surface-alt-rgb), 0.95) 100%
		);
	}

	/* Container for date badge */
	.card-date-container {
		margin-bottom: var(--spacing-2);
		display: flex;
		justify-content: flex-start;
	}

	/* Custom styling for date badge button */
	:global(.card-date-badge) {
		font-size: var(--font-size-xs) !important;
		font-weight: var(--font-weight-semibold) !important;
		padding: var(--spacing-1) var(--spacing-2) !important;
		border-radius: var(--border-radius) !important;
		cursor: default !important;
		pointer-events: none !important;

		/* Enhanced glassmorphism for date badge */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-15)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 100%
		) !important;
		color: var(--color-primary) !important;
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-15)) !important;
	}

	/* Container for view-more hint */
	.view-more-container {
		margin-top: var(--spacing-3);
		opacity: 0;
		transform: translateY(var(--spacing-2));
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	/* Custom styling for view-more hint button */
	:global(.view-more-hint) {
		width: 100% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;
		font-size: var(--font-size-xs) !important;
		font-weight: var(--font-weight-medium) !important;
		padding: var(--spacing-2) var(--spacing-3) !important;
		border-radius: var(--border-radius-md) !important;
		cursor: default !important;
		pointer-events: none !important;

		/* Enhanced glassmorphism for hint */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-15)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-10)) 100%
		) !important;
		color: var(--color-primary) !important;
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-15)) !important;
	}

	.hint-text {
		letter-spacing: var(--letter-spacing-wide);
	}

	.hint-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--spacing-5);
		height: var(--spacing-5);
		background: var(--color-primary);
		color: var(--color-white);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		transform: translateX(calc(-1 * var(--spacing-1)));
		transition: transform var(--anim-duration-base) var(--anim-ease-base);
	}

	.card-link {
		text-decoration: none;
		color: inherit;
		display: block;
		border-radius: var(--border-radius-xl);
		transition: all var(--anim-duration-base) var(--anim-ease-out);
	}

	.card-link:hover .view-more-container,
	.card-link:focus .view-more-container {
		opacity: 1;
		transform: translateY(0);
	}

	.card-link:hover .hint-arrow,
	.card-link:focus .hint-arrow {
		transform: translateX(0);
	}

	.card-link:hover .card-image,
	.card-link:focus .card-image {
		transform: scale(var(--scale-110));
	}

	.card-link:hover .image-overlay,
	.card-link:focus .image-overlay {
		opacity: 1;
	}

	/* ARROW STYLES */
	.card-arrow {
		position: absolute;
		bottom: calc(-1 * var(--spacing-3));
		left: 50%;
		width: var(--spacing-5);
		height: var(--spacing-5);
		background: inherit;
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-15));
		border-radius: var(--border-radius-sm);
		transform: translateX(-50%) rotate(var(--rotate-45));
		z-index: 1;
	}

	.position-below .card-arrow {
		bottom: auto;
		top: calc(-1 * var(--spacing-3));
	}

	/* Dark mode arrow */
	:global(html.dark) .card-arrow {
		border-color: rgba(var(--color-white-rgb), var(--opacity-10));
	}

	.card-title {
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-2);
		color: var(--color-text);
		line-height: var(--line-height-snug);
		font-size: var(--font-size-base);
		background: linear-gradient(135deg, var(--color-text), var(--color-primary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.card-authors {
		margin-bottom: var(--spacing-1);
		color: var(--color-text-light);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}

	.card-meta {
		margin-bottom: var(--spacing-1);
		color: var(--color-text-light);
		font-size: var(--font-size-xs);
		line-height: var(--line-height-snug);
	}

	.card-meta em {
		font-style: italic;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	/* Focus states */
	.card-link:focus {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--border-width-medium);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.preview-card {
			transition: none;
		}

		.card-link:hover .card-image {
			transform: none;
		}

		.view-more-hint {
			transition: none;
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.preview-card {
			border-width: var(--border-width-medium);
		}
	}

	/* Backdrop filter fallback */
	@supports not (backdrop-filter: blur(var(--glass-blur-amount))) {
		.preview-card {
			background: rgba(var(--color-white-rgb), var(--glass-opacity-fallback-light, 0.85));
		}

		:global(html.dark) .preview-card {
			background: rgba(var(--color-dark-surface-alt-rgb), var(--glass-opacity-fallback-dark, 0.85));
		}

		.view-more-hint {
			background: rgba(var(--color-primary-rgb), var(--opacity-10));
		}

		.card-date {
			background: rgba(var(--color-primary-rgb), var(--opacity-10));
		}
	}

	/* Responsive design */
	@media (max-width: 480px) {
		.preview-card {
			width: 300px;
			margin: 0 var(--spacing-2);
		}

		.card-content {
			padding: var(--spacing-3);
		}

		.card-image-container {
			height: 100px;
		}
	}
</style>
