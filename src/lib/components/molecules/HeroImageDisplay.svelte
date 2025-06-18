<script lang="ts">
	import { base } from '$app/paths';

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
		<img 
			src={absoluteSrc} 
			alt={altText} 
			class={combinedImageClass}
			loading="lazy"
			decoding="async"
			style={`max-height: ${maxHeight};`}
		/>
		{#if captionText}
			<figcaption class={figcaptionClass}>
				{captionText}
			</figcaption>
		{/if}
	</figure>
{/if}

<style>
	/* Hero figure base styling - clean and simple */
	.hero-figure {
		margin-bottom: var(--spacing-8);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;

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

	/* Caption styling */
	.hero-caption {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		text-align: center;
		margin-top: var(--spacing-4);
		font-style: italic;
		line-height: var(--line-height-relaxed);
		font-family: var(--font-family-serif);
	}

	/* Glass effect enhancements when enabled (relies on .glass-card for core styles) */
	.hero-figure--glass {
		/* Remove extra padding so the image sits flush in the card */
		padding: 0;

		/* Subtle animated lift */
		transition: transform 0.3s var(--anim-ease-base), box-shadow 0.3s var(--anim-ease-base);
	}

	.hero-figure--glass:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-xl);
	}

	/* Eliminate the inner border/shadow to prevent a visible double frame */
	.hero-figure--glass .hero-image {
		border: none;
		box-shadow: none;
		border-radius: inherit; /* Match the figure radius */
	}

	/* Variant styles */
	.hero-figure--default {
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.hero-figure--compact {
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: var(--spacing-6);
	}

	.hero-figure--featured {
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Image variant styles */
	.hero-image--compact {
		border-radius: var(--border-radius-md);
	}

	.hero-image--featured {
		border-radius: var(--border-radius-xl);
	}

	/* Dark mode adjustments */
	:global(html.dark) .hero-image {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .hero-figure:hover .hero-image {
		border-color: rgba(255, 255, 255, 0.15);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.hero-figure {
			margin-bottom: var(--spacing-6);
		}

		.hero-caption {
			font-size: var(--font-size-xs);
			margin-top: var(--spacing-3);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.hero-figure,
		.hero-image {
			transition: none;
		}

		.hero-figure:hover {
			transform: none;
		}
	}
</style>
