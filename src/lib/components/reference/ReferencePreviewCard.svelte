<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Publication, Communication } from '$lib/types';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let {
		item,
		itemType,
		referenceElement = null,
		positionClass = ''
	}: {
		item: Publication | Communication;
		itemType: 'publication' | 'communication';
		referenceElement?: HTMLElement | null;
		positionClass?: string;
	} = $props();

	const dispatch = createEventDispatcher();

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
		dispatch('pointerenter');
	}

	function handlePointerLeave() {
		dispatch('pointerleave');
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
				<p class="card-date">{item.date || getYear(item)}</p>
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

				<div class="view-more-hint">
					<span class="hint-text">View full details</span>
					<span class="hint-arrow">→</span>
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
		backdrop-filter: blur(8px) saturate(120%);
		-webkit-backdrop-filter: blur(8px) saturate(120%);
		
		/* Higher opacity background using global values */
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, var(--opacity-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		
		/* Using global border system */
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: var(--border-radius-xl);
		
		/* Using global shadow system */
		box-shadow: var(--shadow-xl);
		
		/* Initial state for animation */
		opacity: 0;
		transform: translateX(-50%) translateY(var(--spacing-2)) scale(0.95);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.preview-card.positioned {
		opacity: 1;
		transform: translateX(-50%) translateY(0) scale(1);
	}

	.preview-card.card-clicked {
		transform: translateX(-50%) translateY(calc(-1 * var(--spacing-1))) scale(1.02);
		box-shadow: var(--shadow-2xl);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	/* Dark mode styles with better readability */
	:global(html.dark) .preview-card {
		background: linear-gradient(
			135deg,
			rgba(var(--color-background-dark-rgb, 17, 24, 39), 0.95) 0%,
			rgba(var(--color-primary-rgb), 0.08) 50%,
			rgba(var(--color-accent-rgb), 0.05) 100%
		);
		
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		
		box-shadow: 
			0 20px 40px -8px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .preview-card.card-clicked {
		box-shadow: 
			0 32px 64px -12px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	/* Position below variant */
	.preview-card.position-below {
		bottom: auto;
		top: calc(100% + var(--spacing-3));
		transform: translateX(-50%) translateY(calc(-1 * var(--spacing-2))) scale(0.95);
	}

	.preview-card.position-below.positioned {
		transform: translateX(-50%) translateY(0) scale(1);
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
			rgba(var(--color-primary-rgb), var(--opacity-medium)),
			rgba(var(--color-accent-rgb), var(--opacity-medium))
		);
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			transparent 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.card-content {
		padding: var(--spacing-4);
		position: relative;
		
		/* Improved content area background for readability */
		background: linear-gradient(
			180deg, 
			rgba(255, 255, 255, 0.7) 0%, 
			rgba(255, 255, 255, 0.9) 100%
		);
	}
	
	/* Dark mode content area */
	:global(html.dark) .card-content {
		background: linear-gradient(
			180deg, 
			rgba(17, 24, 39, 0.8) 0%, 
			rgba(17, 24, 39, 0.95) 100%
		);
	}

	.view-more-hint {
		margin-top: var(--spacing-3);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-md);
		color: var(--color-primary);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		opacity: 0;
		transform: translateY(var(--spacing-2));
		
		/* Glassmorphism for hint using global values */
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 100%
		);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.2);
		
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.hint-text {
		letter-spacing: 0.025em;
	}

	.hint-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		background: var(--color-primary);
		color: white;
		border-radius: 50%;
		font-size: 10px;
		transform: translateX(-3px);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.card-link {
		text-decoration: none;
		color: inherit;
		display: block;
		border-radius: var(--border-radius-xl);
		transition: all 0.3s ease;
	}

	.card-link:hover .view-more-hint,
	.card-link:focus .view-more-hint {
		opacity: 1;
		transform: translateY(0);
	}

	.card-link:hover .hint-arrow,
	.card-link:focus .hint-arrow {
		transform: translateX(0);
	}

	.card-link:hover .card-image,
	.card-link:focus .card-image {
		transform: scale(1.1);
	}

	.card-link:hover .image-overlay,
	.card-link:focus .image-overlay {
		opacity: 1;
	}

	/* ARROW STYLES */
	.card-arrow {
		position: absolute;
		bottom: -10px;
		left: 50%;
		width: 20px;
		height: 20px;
		background: inherit;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		transform: translateX(-50%) rotate(45deg);
		z-index: 1;
	}

	.position-below .card-arrow {
		bottom: auto;
		top: -10px;
	}

	/* Dark mode arrow */
	:global(html.dark) .card-arrow {
		border-color: rgba(255, 255, 255, 0.1);
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

	.card-date {
		margin-bottom: var(--spacing-2);
		color: var(--color-primary);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		display: inline-block;
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius);
		
		/* Glassmorphism for date badge using global values */
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 100%
		);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.2);
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
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
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
			border-width: 2px;
		}
	}

	/* Backdrop filter fallback */
	@supports not (backdrop-filter: blur(8px)) {
		.preview-card {
			background: rgba(255, 255, 255, 0.98);
		}
		
		:global(html.dark) .preview-card {
			background: rgba(17, 24, 39, 0.98);
		}
		
		.view-more-hint {
			background: rgba(var(--color-primary-rgb), 0.1);
		}
		
		.card-date {
			background: rgba(var(--color-primary-rgb), 0.1);
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