<script lang="ts">
	import type { IframeEmbed } from '$lib/types/digitalHumanities';

	// Create a more flexible type for direct component usage
	type IframeRendererProps = Omit<IframeEmbed, 'type'> & {
		glassEffect?: boolean;
		glassVariant?:
			| 'glass'
			| 'glass-light'
			| 'glass-medium'
			| 'glass-heavy'
			| 'glass-primary'
			| 'glass-accent'
			| 'glass-highlight'
			| 'glass-frosted';
	};

	let {
		id,
		src,
		title = undefined,
		height = undefined,
		aspectRatio = undefined,
		containerClass = undefined,
		scrolling = 'auto',
		allowfullscreen = true,
		glassEffect = false,
		glassVariant = 'glass'
	}: IframeRendererProps = $props();

	// Helper to determine if height is a CSS value (not a class name)
	let isCssValue = $derived(
		height &&
			(height.endsWith('px') ||
				height.endsWith('%') ||
				height.endsWith('vh') ||
				height.endsWith('em') ||
				height.endsWith('rem'))
	);

	// Determine the base container classes
	let baseClasses = $derived.by(() => {
		if (containerClass) {
			return [containerClass];
		} else if (aspectRatio) {
			return [`iframe-container-aspect`, `iframe-container-aspect-${aspectRatio}`];
		} else if (height && !isCssValue) {
			// Height is a class name like iframe-container-sm
			return [height];
		} else {
			// Default base class
			return ['iframe-container'];
		}
	});

	// Determine additional classes (height class if needed)
	let additionalClasses = $derived.by(() => {
		const classes = [];

		// Add height class if containerClass is provided and height is a class name
		if (containerClass && height && !isCssValue) {
			classes.push(height);
		}

		// Add glass effect classes if enabled
		if (glassEffect) {
			classes.push(glassVariant, 'glass-animate');
		}

		// Add scroll-reveal-scale for modern CSS scroll-driven animation
		classes.push('scroll-reveal-scale');

		return classes;
	});

	// Combine all classes
	let finalContainerClass = $derived([...baseClasses, ...additionalClasses].join(' '));

	// Determine the inline style for the iframe
	let style = $derived.by(() => {
		if (!isCssValue) {
			// No CSS value height, check for default fallback
			if (!height && !aspectRatio && !containerClass) {
				return 'height: var(--iframe-height-default);';
			}
			return '';
		}

		// Height is a CSS value
		if (containerClass && containerClass.includes('iframe-container-aspect')) {
			// Aspect ratio containers should have 100% height on iframe
			return 'height: 100%;';
		} else {
			return `height: ${height};`;
		}
	});
</script>

<div class={finalContainerClass}>
	{#if finalContainerClass.includes('iframe-with-header')}
		<div class="iframe-header">{title || 'Embedded content'}</div>
	{/if}
	<iframe
		{id}
		{src}
		title={title || 'Embedded content'}
		{style}
		frameborder="0"
		{scrolling}
		{allowfullscreen}
		loading="lazy"
	></iframe>
</div>

<style>
	/* Responsive iframe containers */

	/* Base iframe container - fixed height with scrolling */
	:global(.iframe-container) {
		position: relative;
		width: 100%;
		height: var(--iframe-height-default); /* Using iframe-specific variable for default height */
		margin-bottom: var(--spacing-8);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		background: var(--color-surface);
		overflow: hidden; /* Ensure contents don't overflow */
	}

	:global(.iframe-container iframe) {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	/* Glass effect integration for iframe containers */
	:global(.iframe-container.glass),
	:global(.iframe-container.glass-light),
	:global(.iframe-container.glass-medium),
	:global(.iframe-container.glass-heavy),
	:global(.iframe-container.glass-primary),
	:global(.iframe-container.glass-accent),
	:global(.iframe-container.glass-highlight),
	:global(.iframe-container.glass-frosted) {
		/* Let the global glassmorphism utilities handle the background and effects */
		/* Only override the border to match our iframe styling */
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-medium));
	}

	/* Glass effect hover enhancements for interactive iframes */
	:global(.iframe-container.glass.iframe-interactive:hover),
	:global(.iframe-container.glass-light.iframe-interactive:hover),
	:global(.iframe-container.glass-medium.iframe-interactive:hover),
	:global(.iframe-container.glass-heavy.iframe-interactive:hover) {
		transform: var(--transform-lift-md);
		box-shadow:
			0 12px 40px 0 rgba(var(--color-primary-rgb), var(--opacity-medium-high)),
			var(--shadow-lg);
	}

	/* Dark mode glass effect adjustments */
	:global(html.dark .iframe-container.glass),
	:global(html.dark .iframe-container.glass-light),
	:global(html.dark .iframe-container.glass-medium),
	:global(html.dark .iframe-container.glass-heavy),
	:global(html.dark .iframe-container.glass-primary),
	:global(html.dark .iframe-container.glass-accent),
	:global(html.dark .iframe-container.glass-highlight),
	:global(html.dark .iframe-container.glass-frosted) {
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
	}

	/* Aspect ratio iframe container - maintains 16:9 ratio */
	:global(.iframe-container-aspect) {
		position: relative;
		width: 100%;
		padding-top: 56.25%; /* 16:9 Aspect Ratio */
		margin-bottom: var(--spacing-8);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		background: var(--color-surface);
		overflow: hidden;
	}

	:global(.iframe-container-aspect iframe) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	/* Glass effect integration for aspect ratio containers */
	:global(.iframe-container-aspect.glass),
	:global(.iframe-container-aspect.glass-light),
	:global(.iframe-container-aspect.glass-medium),
	:global(.iframe-container-aspect.glass-heavy),
	:global(.iframe-container-aspect.glass-primary),
	:global(.iframe-container-aspect.glass-accent),
	:global(.iframe-container-aspect.glass-highlight),
	:global(.iframe-container-aspect.glass-frosted) {
		/* Let the global glassmorphism utilities handle the background and effects */
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-medium));
	}

	:global(html.dark .iframe-container-aspect.glass),
	:global(html.dark .iframe-container-aspect.glass-light),
	:global(html.dark .iframe-container-aspect.glass-medium),
	:global(html.dark .iframe-container-aspect.glass-heavy),
	:global(html.dark .iframe-container-aspect.glass-primary),
	:global(html.dark .iframe-container-aspect.glass-accent),
	:global(html.dark .iframe-container-aspect.glass-highlight),
	:global(html.dark .iframe-container-aspect.glass-frosted) {
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
	}

	/* Additional aspect ratio variations */
	:global(.iframe-container-aspect-4-3) {
		padding-top: 75%; /* 4:3 Aspect Ratio */
	}

	:global(.iframe-container-aspect-1-1) {
		padding-top: 100%; /* 1:1 Square Aspect Ratio */
	}

	:global(.iframe-container-aspect-21-9) {
		padding-top: 42.86%; /* 21:9 Ultra-wide Aspect Ratio */
	}

	/* Size variations */
	:global(.iframe-container-xs) {
		height: var(--iframe-height-xs);
	}

	:global(.iframe-container-sm) {
		height: var(--iframe-height-sm);
	}

	:global(.iframe-container-md) {
		height: var(--iframe-height-md); /* Same as default for clarity */
	}

	:global(.iframe-container-lg) {
		height: var(--iframe-height-lg);
	}

	:global(.iframe-container-xl) {
		height: var(--iframe-height-xl);
	}

	:global(.iframe-container-fullheight) {
		height: calc(
			100vh - var(--spacing-32)
		); /* Full viewport height minus space for header/footer */
	}

	/* Remove margin bottom when needed */
	:global(.iframe-container-no-margin),
	:global(.iframe-container-aspect-no-margin) {
		margin-bottom: 0;
	}

	/* Improved loading animation with better z-index and opacity handling */
	:global(.iframe-container::before),
	:global(.iframe-container-aspect::before) {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--color-background);
		z-index: 5; /* Higher z-index to ensure it covers the iframe */
		opacity: 0;
		transition: opacity var(--transition-duration-200); /* Using global transition duration */
		pointer-events: none;
		display: none;
	}

	:global(.iframe-container-loading::before),
	:global(.iframe-container-aspect.iframe-container-loading::before) {
		display: block;
		opacity: 1;
		background: var(--color-background);
		/* Loading spinner using CSS animation instead of SVG */
	}

	:global(.iframe-container-loading::after),
	:global(.iframe-container-aspect.iframe-container-loading::after) {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 40px;
		height: 40px;
		margin: -20px 0 0 -20px;
		border: 4px solid var(--color-border);
		border-top: 4px solid var(--color-primary);
		border-radius: var(--border-radius-full);
		animation: iframe-loading-spin var(--anim-duration-slow) linear infinite;
		z-index: 6;
	}

	@keyframes iframe-loading-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	:global(.iframe-loaded::before) {
		opacity: 0 !important;
		transition: opacity var(--transition-duration-200); /* Using global transition duration */
		visibility: hidden;
		display: none;
	}

	/* For lightweight content that loads quickly, add this class to skip loading animation completely */
	:global(.iframe-container-lightweight) {
		background: transparent;
	}

	:global(.iframe-container-lightweight::before) {
		display: none !important;
	}

	/* Interactive hover effect - subtle scale on hover */
	:global(.iframe-interactive) {
		transition:
			transform var(--transition-duration-200) var(--transition-ease-out),
			box-shadow var(--transition-duration-200) var(--transition-ease-out);
	}

	:global(.iframe-interactive:hover) {
		transform: var(--transform-lift-lg);
		box-shadow: var(--shadow-lg);
	}

	/* Theme variations */
	:global(.iframe-container-bordered) {
		border-width: var(--border-width-medium);
		border-color: var(--color-primary);
	}

	:global(.iframe-container-accent) {
		border-color: var(--color-accent);
	}

	:global(.iframe-container-highlight) {
		border-color: var(--color-highlight);
	}

	/* Iframe with title bar */
	:global(.iframe-with-header) {
		padding-top: var(--iframe-header-height); /* Space for header */
	}

	:global(.iframe-header) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: var(--iframe-header-height);
		background-color: var(--color-primary);
		color: var(--color-white);
		display: flex;
		align-items: center;
		padding: 0 var(--spacing-4);
		font-weight: var(--font-weight-medium);
		border-top-left-radius: var(--border-radius-md);
		border-top-right-radius: var(--border-radius-md);
		border-bottom: var(--border-width-thin) solid var(--color-border);
		font-size: var(--font-size-sm);
	}

	:global(.iframe-with-header iframe) {
		height: calc(100% - var(--iframe-header-height));
		/* Remove margin-top since padding-top on container already creates space for header */
	}

	/* Glass effect for iframe headers */
	:global(.iframe-with-header.glass .iframe-header),
	:global(.iframe-with-header.glass-light .iframe-header),
	:global(.iframe-with-header.glass-medium .iframe-header),
	:global(.iframe-with-header.glass-heavy .iframe-header) {
		background: rgba(var(--color-primary-rgb), var(--opacity-high));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		backdrop-filter: blur(var(--glass-blur-amount));
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-white-rgb), var(--opacity-medium));
	}

	:global(html.dark .iframe-with-header.glass .iframe-header),
	:global(html.dark .iframe-with-header.glass-light .iframe-header),
	:global(html.dark .iframe-with-header.glass-medium .iframe-header),
	:global(html.dark .iframe-with-header.glass-heavy .iframe-header) {
		background: rgba(var(--color-primary-rgb), var(--glass-opacity-fallback-dark));
		border-bottom: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		:global(.iframe-container),
		:global(.iframe-container-md) {
			height: calc(var(--iframe-height-default) * 0.83); /* Slightly shorter on small screens */
		}

		:global(.iframe-container-lg) {
			height: var(--iframe-height-default); /* Reduce large containers on small screens */
		}

		:global(.iframe-container-xl) {
			height: calc(
				var(--iframe-height-default) * 1.17
			); /* Reduce extra large containers on small screens */
		}

		:global(.iframe-container-sm) {
			height: calc(var(--iframe-height-sm) * 0.875); /* Slightly adjust small containers */
		}

		:global(.iframe-container-fullheight) {
			height: calc(100vh - var(--spacing-24)); /* Adjust spacing for mobile */
		}

		:global(.iframe-header) {
			font-size: var(--font-size-xs);
			padding: 0 var(--spacing-3);
		}
	}

	@media (max-width: 480px) {
		:global(.iframe-container),
		:global(.iframe-container-md) {
			height: calc(var(--iframe-height-default) * 0.67); /* Even shorter on very small screens */
		}

		:global(.iframe-container-lg) {
			height: calc(var(--iframe-height-default) * 0.83);
		}

		:global(.iframe-container-xl) {
			height: var(--iframe-height-default);
		}

		:global(.iframe-container-sm) {
			height: calc(var(--iframe-height-sm) * 0.75);
		}

		:global(.iframe-container-xs) {
			height: calc(var(--iframe-height-xs) * 0.83);
		}

		:global(.iframe-header) {
			font-size: var(--font-size-xs);
			height: var(--iframe-header-height-mobile);
			padding: 0 var(--spacing-2);
		}

		:global(.iframe-with-header) {
			padding-top: var(--iframe-header-height-mobile);
		}

		:global(.iframe-with-header iframe) {
			height: calc(100% - var(--iframe-header-height-mobile));
			/* Remove margin-top since padding-top on container already creates space for header */
		}
	}

	/* Print styles - ensure iframes look good when printed */
	@media print {
		:global(.iframe-container),
		:global(.iframe-container-aspect) {
			box-shadow: none;
			border: var(--border-width-thin) solid var(--color-black);
			background: var(--color-white) !important;
		}

		:global(.iframe-container-aspect) {
			break-inside: avoid;
			page-break-inside: avoid;
			height: var(--iframe-height-sm);
			padding-top: 0;
		}

		:global(.iframe-container-aspect iframe) {
			position: relative;
			height: 100%;
		}

		/* Remove glass effects in print */
		:global(.iframe-container.glass),
		:global(.iframe-container.glass-light),
		:global(.iframe-container.glass-medium),
		:global(.iframe-container.glass-heavy),
		:global(.iframe-container-aspect.glass),
		:global(.iframe-container-aspect.glass-light),
		:global(.iframe-container-aspect.glass-medium),
		:global(.iframe-container-aspect.glass-heavy) {
			background: var(--color-white) !important;
			-webkit-backdrop-filter: none !important;
			backdrop-filter: none !important;
		}
	}
</style>
