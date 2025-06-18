<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { portal } from '$lib/actions/portal';

	let {
		heroImage = undefined,
		fallbackImage = undefined,
		defaultAlt = 'Hero image',
		imageClass = 'hero-image', // Default class using our styling
		figureClass = '',
		figcaptionClass = 'hero-caption',
		glassEffect = true,
		variant = 'default',
		maxHeight = '60vh'
	}: {
		heroImage?: { src: string; alt?: string; caption?: string } | undefined | null;
		fallbackImage?: string | undefined | null;
		defaultAlt?: string;
		imageClass?: string;
		figureClass?: string;
		figcaptionClass?: string;
		glassEffect?: boolean;
		variant?: 'default' | 'compact' | 'featured';
		maxHeight?: string;
	} = $props();

	let zoomed = $state(false);

	function toggleZoom() {
		zoomed = !zoomed;
		// Prevent body scroll when modal is open
		if (browser) {
			document.body.style.overflow = zoomed ? 'hidden' : '';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleZoom();
		}
	}

	function handleModalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			toggleZoom();
		}
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
	const combinedFigureClass = $derived(
		[
			'hero-figure',
			`hero-figure--${variant}`,
			glassEffect ? 'glass-card hero-figure--glass' : ''
		].filter(Boolean).join(' ')
	);

	const combinedImageClass = $derived(
		[
			'hero-image',
			`hero-image--${variant}`,
			imageClass
		].filter(Boolean).join(' ')
	);
</script>

{#if displayImage && absoluteSrc}
	<figure class={combinedFigureClass}>
		<button 
			class="image-container" 
			onclick={toggleZoom} 
			onkeydown={handleKeydown}
			type="button"
			aria-label="Zoom image to fullscreen"
		>
			<img
				src={absoluteSrc}
				alt={altText}
				class={combinedImageClass}
				loading="lazy"
				decoding="async"
				style={`max-height: ${maxHeight};`}
			/>
			<div class="overlay">
				{#if captionText}
					<div class="overlay-caption">{captionText}</div>
				{/if}
				<div class="zoom-icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
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

<!-- Modal is now portaled to the body to escape stacking contexts -->
{#if zoomed && absoluteSrc}
	<div
		use:portal
		class="fullscreen-modal"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				toggleZoom();
			}
		}}
		onkeydown={handleModalKeydown}
		role="dialog"
		aria-modal="true"
		aria-label="Fullscreen image view"
		tabindex="0"
	>
		<button
			class="close-button"
			onclick={(e) => {
				e.stopPropagation();
				toggleZoom();
			}}
			type="button"
			aria-label="Close fullscreen view"
		>
			&times;
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
		margin-bottom: var(--spacing-6); /* Match PageHeader margin for consistency */
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
		transition: transform 0.3s var(--anim-ease-base);
	}

	.image-container:hover .hero-image {
		transform: scale(1.05);
	}

	.image-container:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		opacity: 0;
		transition: opacity 0.3s var(--anim-ease-base);
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
		padding: var(--spacing-4);
		text-align: center;
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-relaxed);
	}

	.zoom-icon {
		font-size: 2rem;
		margin-top: var(--spacing-2);
	}
	
	.zoom-icon svg {
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
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
		transition: all 0.3s ease;
		box-shadow: var(--shadow-lg);
		object-fit: contain; /* Ensure entire image visible without cropping */
		aspect-ratio: auto;
		/* Subtle glassmorphism border */
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.hero-figure:hover .hero-image {
		box-shadow: var(--shadow-xl);
		border-color: rgba(255, 255, 255, 0.3);
	}

	/* Caption styling - improved typography consistency */
	.hero-caption {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		text-align: center;
		margin-top: var(--spacing-4);
		font-style: italic;
		line-height: var(--line-height-relaxed);
		font-family: var(--font-family-serif);
		padding: 0 var(--spacing-4); /* Add horizontal padding for better readability */
	}

	/* Glass effect enhancements when enabled - improved integration */
	.hero-figure--glass {
		/* Enhanced glassmorphism to match PageHeader and ContentBody */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		padding: var(--spacing-4); /* Add padding for glass effect */
		border-radius: var(--border-radius-xl); /* Match PageHeader border radius */
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		
		/* Enhanced shadow to match other components */
		box-shadow: var(--shadow-md);
		
		/* Subtle animated lift */
		transition: all 0.3s var(--anim-ease-base);
	}

	.hero-figure--glass:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		/* Enhanced hover gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
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
		margin-top: var(--spacing-3);
		padding: var(--spacing-2) var(--spacing-4);
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		border-radius: var(--border-radius-md);
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), 0.3);
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
		margin-bottom: var(--spacing-4); /* Reduced spacing for compact variant */
	}

	.hero-figure--featured {
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: var(--spacing-8); /* Increased spacing for featured variant */
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
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .hero-figure:hover .hero-image {
		border-color: rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .hero-figure--glass {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 35%,
			var(--color-dark-surface-alt) 65%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.12);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .hero-figure--glass:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 35%,
			var(--color-dark-surface-alt) 65%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.18);
	}

	:global(html.dark) .hero-figure--glass .hero-caption {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-high));
		border-color: rgba(var(--color-border-rgb), 0.2);
		color: var(--color-text-light);
	}

	/* Fullscreen Modal Styling - Improved positioning and behavior */
	.fullscreen-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 9999; /* Very high z-index to ensure it's above everything */
		background: rgba(0, 0, 0, 0.9);
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: zoom-out;
		animation: fadeIn 0.3s var(--anim-ease-base);
		padding: var(--spacing-4);
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
		box-shadow: 0 1rem 3rem rgba(0,0,0,0.7);
		border-radius: var(--border-radius-md);
		display: block;
	}

	.fullscreen-caption {
		color: white;
		margin-top: var(--spacing-4);
		font-size: var(--font-size-lg);
		font-style: italic;
		text-align: center;
		max-width: 80vw;
		line-height: var(--line-height-relaxed);
		padding: var(--spacing-2) var(--spacing-4);
		background: rgba(0, 0, 0, 0.5);
		border-radius: var(--border-radius-md);
	}

	.close-button {
		position: absolute;
		top: var(--spacing-4);
		right: var(--spacing-6);
		background: rgba(0, 0, 0, 0.5);
		border: 2px solid rgba(255, 255, 255, 0.3);
		color: white;
		font-size: 2rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 50%;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}
	
	.close-button:hover,
	.close-button:focus {
		transform: scale(1.1);
		background: rgba(0, 0, 0, 0.7);
		border-color: rgba(255, 255, 255, 0.5);
		outline: none;
	}

	/* Animation keyframes */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Responsive adjustments - improved mobile experience */
	@media (max-width: 768px) {
		.hero-figure {
			margin-bottom: var(--spacing-4);
		}

		.hero-figure--glass {
			padding: var(--spacing-3);
			border-radius: var(--border-radius-lg);
		}

		.hero-caption {
			font-size: var(--font-size-xs);
			margin-top: var(--spacing-2);
			padding: 0 var(--spacing-2);
		}

		.hero-figure--glass .hero-caption {
			margin-top: var(--spacing-2);
			padding: var(--spacing-2) var(--spacing-3);
		}

		/* Adjust max-widths for mobile */
		.hero-figure--featured {
			max-width: 100%;
			margin-bottom: var(--spacing-6);
		}

		.hero-figure--default {
			max-width: 100%;
		}

		.fullscreen-modal {
			padding: var(--spacing-2);
		}

		.fullscreen-image {
			max-width: 95vw;
			max-height: 80vh;
		}

		.fullscreen-caption {
			font-size: var(--font-size-md);
			max-width: 90vw;
		}

		.close-button {
			top: var(--spacing-2);
			right: var(--spacing-2);
			width: 2.5rem;
			height: 2.5rem;
			font-size: 1.5rem;
		}

		.overlay-caption {
			font-size: var(--font-size-sm);
			padding: var(--spacing-2);
		}
	}

	@media (max-width: 640px) {
		.hero-figure--glass {
			padding: var(--spacing-2);
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
	}
</style>
