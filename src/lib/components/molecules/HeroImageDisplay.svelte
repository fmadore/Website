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
	/* Hero figure base styling - consistent with page layout */
	.hero-figure {
		margin-bottom: var(--spacing-6); /* Match PageHeader margin for consistency */
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
	}

	@media (max-width: 640px) {
		.hero-figure--glass {
			padding: var(--spacing-2);
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
