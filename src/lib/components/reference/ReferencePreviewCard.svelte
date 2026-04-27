<script lang="ts">
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { base, resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Publication, Communication } from '$lib/types';
	import Button from '$lib/components/atoms/Button.svelte';
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
		item: Publication | Communication;
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

				<!-- Using Button component for date badge -->
				<div class="card-date-container">
					<Button
						variant="outline-primary"
						size="sm"
						glass={true}
						additionalClasses="card-date-badge"
					>
						{item.date || getItemYear(item)}
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

		/* Paper popover — content surface, no backdrop-filter. */
		background: var(--color-surface-elevated);

		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
		border-radius: var(--border-radius-xl);

		box-shadow:
			0 20px 60px -15px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent),
			0 8px 20px -8px color-mix(in srgb, var(--color-black) 10%, transparent);

		/* Initial state for animation */
		opacity: 0;
		transform: translateY(var(--transform-distance-sm)) scale(var(--scale-90));
		transition:
			opacity var(--duration-moderate) var(--ease-out),
			transform var(--duration-moderate) var(--ease-out),
			box-shadow var(--duration-moderate) var(--ease-out),
			border-color var(--duration-moderate) var(--ease-out);
		will-change: opacity, transform;
	}

	.preview-card.positioned {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.preview-card.card-clicked {
		transform: translateY(calc(-1 * var(--space-xs))) scale(1.02);
		box-shadow:
			0 25px 80px -20px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-25) * 100%), transparent),
			0 15px 40px -15px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent);
		border-color: color-mix(in srgb, var(--color-primary) 35%, transparent);
	}

	/* Dark mode — warm surface tile, primary-tinted shadow for depth.
	 * No inset white highlights (those clash with warm dusk). */
	:global(html.dark) .preview-card {
		background: var(--color-surface-alt);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-25) * 100%), transparent);
		box-shadow:
			0 20px 60px -15px color-mix(in srgb, black calc(var(--opacity-40) * 100%), transparent),
			0 10px 30px -10px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
	}

	:global(html.dark) .preview-card.card-clicked {
		box-shadow:
			0 25px 80px -20px color-mix(in srgb, black calc(var(--opacity-50) * 100%), transparent),
			0 15px 40px -15px
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-40) * 100%),
			transparent
		);
	}

	/* Position below variant — JS sets top/bottom directly. The only stylistic
	 * difference is the entrance animation direction. */
	.preview-card.position-below {
		transform: translateY(calc(-1 * var(--transform-distance-sm))) scale(var(--scale-90));
	}

	.preview-card.position-below.positioned {
		transform: translateY(0) scale(1);
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

		/* Paper arrow — solid warm surface to match the popover body. */
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
		border-radius: var(--border-radius-sm);
		transform: translateX(-50%) rotate(45deg);
		z-index: var(--z-tooltip);
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
