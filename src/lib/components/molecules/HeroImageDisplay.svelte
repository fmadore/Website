<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';

	let {
		heroImage = undefined,
		fallbackImage = undefined,
		defaultAlt = 'Hero image',
		imageClass = 'hero-image', // Default class using our styling
		figcaptionClass = 'hero-caption',
		glassEffect = true,
		variant = 'default',
		maxHeight = '60vh',
		fetchpriority = 'auto',
		loading = 'lazy'
	}: {
		heroImage?: { src: string; alt?: string; caption?: string } | undefined | null;
		fallbackImage?: string | undefined | null;
		defaultAlt?: string;
		imageClass?: string;
		figcaptionClass?: string;
		glassEffect?: boolean;
		variant?: 'default' | 'compact' | 'featured';
		maxHeight?: string;
		fetchpriority?: 'high' | 'low' | 'auto';
		loading?: 'eager' | 'lazy';
	} = $props();

	let zoomed = $state(false);

	function openZoom() {
		if (!zoomed) {
			zoomed = true;
			if (browser) {
				document.body.style.overflow = 'hidden';
			}
		}
	}

	function closeZoom() {
		if (zoomed) {
			zoomed = false;
			if (browser) {
				document.body.style.overflow = '';
			}
		}
	}

	// Close lightbox on browser back button / SvelteKit navigation
	beforeNavigate(({ cancel }) => {
		if (zoomed) {
			cancel();
			closeZoom();
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openZoom();
		}
	}

	// Combined action: portals the modal to body AND attaches native event
	// listeners. Svelte 5 compiles all event directives (both onclick and on:click)
	// to use delegation at the component root. Portaling moves the element outside
	// the component tree, so no Svelte event syntax can work. This action attaches
	// click/keydown listeners directly via addEventListener after portaling.
	function portalWithEvents(node: HTMLElement) {
		// Portal to body
		document.body.appendChild(node);
		node.hidden = false;

		// Attach native event listeners
		function handleClick() {
			closeZoom();
		}
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeZoom();
			}
		}
		node.addEventListener('click', handleClick);
		node.addEventListener('keydown', handleKeydown);
		node.focus();

		return {
			destroy() {
				node.removeEventListener('click', handleClick);
				node.removeEventListener('keydown', handleKeydown);
				requestAnimationFrame(() => {
					if (node.parentNode) {
						node.parentNode.removeChild(node);
					}
				});
			}
		};
	}

	// Clean up body overflow when component is destroyed
	$effect(() => {
		return () => {
			if (browser) {
				document.body.style.overflow = '';
			}
		};
	});

	const displayImage = $derived(
		heroImage?.src ? heroImage : fallbackImage ? { src: fallbackImage, alt: defaultAlt } : null
	);
	const altText = $derived((displayImage === heroImage ? heroImage?.alt : '') || defaultAlt);
	const captionText = $derived(displayImage === heroImage ? heroImage?.caption : null);
	const absoluteSrc = $derived(
		displayImage && displayImage.src
			? displayImage.src.startsWith('http://') || displayImage.src.startsWith('https://')
				? displayImage.src
				: (() => {
						// Ensure it's treated as relative to the base path, removing any leading slash from src itself
						const path = displayImage.src.startsWith('/')
							? displayImage.src.substring(1)
							: displayImage.src;
						return `${base}/${path}`.replace(/\/\//g, '/'); // Replace double slashes just in case
					})()
			: null
	);

	// Use global glassmorphism utility (glass-card) to ensure visual consistency
	// Also add scroll-reveal-scale for modern scroll-driven animation
	const combinedFigureClass = $derived(
		[
			'hero-figure',
			`hero-figure--${variant}`,
			glassEffect ? 'glass-card hero-figure--glass' : '',
			'scroll-reveal-scale'
		]
			.filter(Boolean)
			.join(' ')
	);

	const combinedImageClass = $derived(
		['hero-image', `hero-image--${variant}`, imageClass].filter(Boolean).join(' ')
	);
</script>

{#if displayImage && absoluteSrc}
	<figure class={combinedFigureClass}>
		<button
			class="image-container"
			onclick={openZoom}
			onkeydown={handleKeydown}
			type="button"
			aria-label="Zoom image to fullscreen"
		>
			<img
				src={absoluteSrc}
				alt={altText}
				class={combinedImageClass}
				{loading}
				{fetchpriority}
				decoding="async"
				width="330"
				height="438"
				sizes="(max-width: 640px) 100vw, (max-width: 768px) 330px, (max-width: 1024px) 600px, 800px"
				style={`max-height: ${maxHeight}; contain: layout style paint;`}
			/>
			<div class="overlay">
				{#if captionText}
					<div class="overlay-caption">{captionText}</div>
				{/if}
				<div class="zoom-icon" aria-hidden="true">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"
						></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"
						></line></svg
					>
				</div>
			</div>
		</button>
		{#if captionText}
			<figcaption class={figcaptionClass}>
				{captionText}
			</figcaption>
		{/if}
	</figure>
{/if}

<!-- Modal is portaled to body to escape ancestor stacking contexts -->
{#if zoomed && absoluteSrc}
	<div
		use:portalWithEvents
		class="fullscreen-modal"
		role="dialog"
		aria-modal="true"
		aria-label="Fullscreen image view"
		tabindex="0"
	>
		<button
			class="btn btn-outline-secondary btn-sm btn-with-icon btn-icon-only btn-glass glass-button close-button"
			type="button"
			aria-label="Close fullscreen view"
		>
				<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
		<div class="modal-content">
			<img src={absoluteSrc} alt={altText} class="fullscreen-image" />
			{#if captionText}
				<div class="fullscreen-caption">{captionText}</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Hero figure base styling - consistent with page layout */
	.hero-figure {
		margin-bottom: var(--space-6); /* Match PageHeader margin for consistency */
		transition: all var(--duration-moderate) var(--ease-in-out);
		position: relative;
		overflow: hidden; /* Contain hover effects */

		/* Shrink to intrinsic content width and center horizontally */
		display: block;
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
		max-width: 100%;
	}

	.hero-figure:hover {
		transform: var(--transform-lift-sm);
	}

	.image-container {
		position: relative;
		cursor: pointer;
		overflow: hidden;
		border-radius: var(--border-radius-lg);
		border: none;
		background: none;
		padding: 0;
		display: block;
		width: 100%;
	}

	.image-container .hero-image {
		transition: transform var(--duration-moderate) var(--ease-in-out);
	}

	.image-container:hover .hero-image {
		transform: scale(var(--scale-105));
	}

	.image-container:focus {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-0-5);
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: color-mix(
			in srgb,
			var(--color-black) calc(var(--opacity-medium) * 100%),
			transparent
		);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: var(--color-white);
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--ease-in-out);
		pointer-events: none; /* Let clicks pass through to the container */
		border-radius: inherit;
	}

	.image-container:hover .overlay,
	.image-container:focus .overlay {
		opacity: 1;
		pointer-events: auto; /* Enable pointer events on hover/focus */
	}

	.overlay-caption {
		font-size: var(--font-size-md);
		padding: var(--space-4);
		text-align: center;
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-relaxed);
	}

	.zoom-icon {
		font-size: var(--font-size-3xl);
		margin-top: var(--space-2);
	}

	.zoom-icon svg {
		filter: drop-shadow(
			0 var(--space-0-5) var(--space-1)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-medium) * 100%), transparent)
		);
	}

	/* Hero image with integrated glassmorphism effects */
	.hero-image {
		width: auto;
		max-width: 100%;
		height: auto;
		display: block;
		margin-left: auto;
		margin-right: auto;
		border-radius: var(--border-radius-lg);
		transition: all var(--duration-moderate) var(--ease-out);
		box-shadow: var(--shadow-lg);
		object-fit: contain; /* Ensure entire image visible without cropping */
		aspect-ratio: auto;
		/* Subtle glassmorphism border */
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
	}

	.hero-figure:hover .hero-image {
		box-shadow: var(--shadow-xl);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium-low) * 100%),
			transparent
		);
	}

	/* Caption styling - improved typography consistency */
	.hero-caption {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		text-align: center;
		margin-top: var(--space-4);
		font-style: italic;
		line-height: var(--line-height-relaxed);
		font-family: var(--font-family-serif);
		padding: 0 var(--space-4); /* Add horizontal padding for better readability */
	}

	/* Glass effect enhancements when enabled - improved integration */
	.hero-figure--glass {
		/* Enhanced glassmorphism to match PageHeader and ContentBody */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		padding: var(--space-4); /* Add padding for glass effect */
		border-radius: var(--border-radius-xl); /* Match PageHeader border radius */
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent);

		/* Enhanced shadow to match other components */
		box-shadow: var(--shadow-md);

		/* Subtle animated lift */
		transition: all var(--duration-moderate) var(--ease-in-out);
	}

	.hero-figure--glass:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		/* Enhanced hover gradient */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	/* Adjust container inside glass figure */
	.hero-figure--glass .image-container {
		border-radius: var(--border-radius-lg); /* Match inner image radius */
	}

	/* Eliminate the inner border/shadow to prevent a visible double frame */
	.hero-figure--glass .hero-image {
		border: none;
		box-shadow: none;
		border-radius: var(--border-radius-lg); /* Slightly smaller radius for inner image */
	}

	/* Caption styling within glass effect */
	.hero-figure--glass .hero-caption {
		margin-top: var(--space-3);
		padding: var(--space-2) var(--space-4);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-radius: var(--border-radius-md);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-medium-low) * 100%), transparent);
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
	}

	/* Variant styles - improved spacing consistency */
	.hero-figure--default {
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.hero-figure--compact {
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: var(--space-4); /* Reduced spacing for compact variant */
	}

	.hero-figure--featured {
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: var(--space-8); /* Increased spacing for featured variant */
	}

	/* Image variant styles */
	.hero-image--compact {
		border-radius: var(--border-radius-md);
	}

	.hero-image--featured {
		border-radius: var(--border-radius-lg); /* Keep consistent with glass container */
	}

	/* Dark mode adjustments - improved consistency */
	:global(html.dark) .hero-image {
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-very-low) * 100%), transparent);
	}

	:global(html.dark) .hero-figure:hover .hero-image {
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	:global(html.dark) .hero-figure--glass {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 35%,
			var(--color-dark-surface-alt) 65%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .hero-figure--glass:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-low) * 100%), transparent) 35%,
			var(--color-dark-surface-alt) 65%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: color-mix(in srgb, var(--color-primary) 18%, transparent);
	}

	:global(html.dark) .hero-figure--glass .hero-caption {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-high) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-border) calc(var(--opacity-low) * 100%),
			transparent
		);
		color: var(--color-text-light);
	}

	/* Fullscreen Modal Styling - Enhanced glassmorphism design */
	.fullscreen-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: var(--z-modal);
		/* Enhanced glassmorphism background using our design system */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface-deep) 85%, transparent) 0%,
			color-mix(in srgb, var(--color-dark-surface-alt) 90%, transparent) 50%,
			color-mix(in srgb, var(--color-dark-surface) 85%, transparent) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-xl)) saturate(120%);
		backdrop-filter: blur(var(--glass-blur-xl)) saturate(120%);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-very-low) * 100%), transparent);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: zoom-out;
		/* Modern animation using design system tokens */
		animation: modalFadeIn var(--duration-moderate) var(--ease-out) forwards;
		padding: var(--space-4);
		box-sizing: border-box;
	}

	.fullscreen-modal:focus {
		outline: none;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 100%;
		max-height: 100%;
		cursor: default;
	}

	.fullscreen-image {
		max-width: 90vw;
		max-height: 85vh;
		width: auto;
		height: auto;
		object-fit: contain;
		box-shadow: var(--shadow-2xl);
		border-radius: var(--border-radius-lg);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-very-low) * 100%), transparent);
		display: block;
		transition: all var(--duration-moderate) var(--ease-in-out);
	}

	.fullscreen-caption {
		color: var(--color-text-emphasis);
		margin-top: var(--space-4);
		font-size: var(--font-size-lg);
		font-style: italic;
		text-align: center;
		max-width: 80vw;
		line-height: var(--line-height-relaxed);
		padding: var(--space-4) var(--space-6);
		/* Use glassmorphism for caption background */
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-low) * 100%),
			transparent
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-md));
		backdrop-filter: blur(var(--glass-blur-md));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-medium);
	}

	/* Close button positioning and styling - perfect round glassmorphism button */
	:global(.close-button) {
		position: absolute !important;
		top: var(--space-4) !important;
		right: var(--space-4) !important;
		z-index: 10 !important;
		width: calc(var(--space-8) + var(--space-2)) !important;
		height: calc(var(--space-8) + var(--space-2)) !important;
		border-radius: var(--border-radius-full) !important;
		padding: 0 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		min-width: unset !important;

		/* Enhanced glassmorphism specifically for close button */
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium-high) * 100%),
			transparent
		) !important;
		backdrop-filter: blur(var(--glass-blur-md)) !important;
		-webkit-backdrop-filter: blur(var(--glass-blur-md)) !important;
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-surface) calc(var(--opacity-medium-high) * 100%), transparent) !important;
		box-shadow: var(--shadow-lg) !important;
		transition: all var(--duration-normal) var(--ease-in-out) !important;
	}

	:global(.close-button:hover) {
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-high) * 100%),
			transparent
		) !important;
		border-color: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-high) * 100%),
			transparent
		) !important;
		transform: var(--transform-lift-sm) scale(var(--scale-105)) !important;
		box-shadow: var(--shadow-xl) !important;
	}

	:global(.close-button svg) {
		color: var(--color-text-emphasis) !important;
		filter: drop-shadow(
			0 var(--border-width-thin) var(--border-width-medium)
				color-mix(in srgb, var(--color-text) calc(var(--opacity-medium) * 100%), transparent)
		) !important;
	}

	/* Dark theme overrides for fullscreen modal */
	:global(html.dark) .fullscreen-modal {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface-deep) 90%, transparent) 0%,
			color-mix(in srgb, var(--color-dark-surface-alt) 95%, transparent) 50%,
			color-mix(in srgb, var(--color-dark-surface) 90%, transparent) 100%
		);
		border-color: color-mix(in srgb, var(--color-white) 2%, transparent);
	}

	:global(html.dark) .fullscreen-caption {
		color: var(--color-text-light);
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-low) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-very-low) * 100%),
			transparent
		);
	}

	:global(html.dark) .fullscreen-image {
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-very-low) * 100%),
			transparent
		);
	}

	/* Dark theme close button */
	:global(html.dark .close-button) {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium-high) * 100%),
			transparent
		) !important;
		border-color: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-high) * 100%),
			transparent
		) !important;
		box-shadow: var(--shadow-lg) !important;
	}

	:global(html.dark .close-button:hover) {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-high) * 100%),
			transparent
		) !important;
		border-color: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-high) * 100%),
			transparent
		) !important;
		box-shadow: var(--shadow-xl) !important;
	}

	:global(html.dark .close-button svg) {
		color: var(--color-text-light) !important;
	}

	/* Animation keyframes - using modern naming convention */
	@keyframes modalFadeIn {
		from {
			opacity: 0;
			transform: scale(0.98);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Responsive adjustments - improved mobile experience */
	@media (--md) {
		/* Desktop styles - use as progressive enhancement */
	}

	@media (--sm-down) {
		.hero-figure {
			margin-bottom: var(--space-4);
		}

		.hero-figure--glass {
			padding: var(--space-3);
			border-radius: var(--border-radius-lg);
		}

		.hero-caption {
			font-size: var(--font-size-xs);
			margin-top: var(--space-2);
			padding: 0 var(--space-2);
		}

		.hero-figure--glass .hero-caption {
			margin-top: var(--space-2);
			padding: var(--space-2) var(--space-3);
		}

		/* Adjust max-widths for mobile */
		.hero-figure--featured {
			max-width: 100%;
			margin-bottom: var(--space-6);
		}

		.hero-figure--default {
			max-width: 100%;
		}

		.fullscreen-modal {
			padding: var(--space-2);
		}

		.fullscreen-image {
			max-width: 95vw;
			max-height: 80vh;
		}

		.fullscreen-caption {
			font-size: var(--font-size-md);
			max-width: 90vw;
			padding: var(--space-3) var(--space-4);
		}

		:global(.close-button) {
			top: var(--space-3) !important;
			right: var(--space-3) !important;
			width: 44px !important;
			height: 44px !important;
		}

		.overlay-caption {
			font-size: var(--font-size-sm);
			padding: var(--space-2);
		}
	}

	@media (--sm-down) {
		.hero-figure--glass {
			padding: var(--space-2);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.hero-figure,
		.hero-image,
		.image-container .hero-image,
		.fullscreen-modal {
			transition: none;
			animation: none;
		}

		.hero-figure:hover,
		.image-container:hover .hero-image {
			transform: none;
		}

		/* Ensure content is visible when animations are disabled */
		.hero-figure {
			opacity: 1;
			transform: none;
		}

		.fullscreen-modal {
			opacity: 1;
			transform: none;
		}
	}
</style>
