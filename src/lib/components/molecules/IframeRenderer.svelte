<script lang="ts">
	import type { IframeEmbed } from '$lib/types/digitalHumanities';

	// Create a more flexible type for direct component usage
	type IframeRendererProps = Omit<IframeEmbed, 'type'> & {
		framed?: boolean;
		frameVariant?:
			| 'surface'
			| 'surface-light'
			| 'surface-medium'
			| 'surface-heavy'
			| 'surface-primary'
			| 'surface-accent'
			| 'surface-highlight'
			| 'surface-frosted';
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
		framed = false,
		frameVariant = 'surface'
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

		// Add flat surface classes if enabled
		if (framed) {
			classes.push(frameVariant, 'surface-animate');
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
		margin-bottom: var(--space-8);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		background: var(--color-surface);
		overflow: hidden; /* Ensure contents don't overflow */
	}

	:global(.iframe-container iframe) {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	/* Flat surface variant integration for iframe containers */
	:global(.iframe-container.surface),
	:global(.iframe-container.surface-light),
	:global(.iframe-container.surface-medium),
	:global(.iframe-container.surface-heavy),
	:global(.iframe-container.surface-primary),
	:global(.iframe-container.surface-accent),
	:global(.iframe-container.surface-highlight),
	:global(.iframe-container.surface-frosted) {
		/* Let the global flat-surface utilities handle the background */
		/* Only override the border to match our iframe styling */
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent);
	}

	/* Dark mode surface adjustments */
	:global(html.dark .iframe-container.surface),
	:global(html.dark .iframe-container.surface-light),
	:global(html.dark .iframe-container.surface-medium),
	:global(html.dark .iframe-container.surface-heavy),
	:global(html.dark .iframe-container.surface-primary),
	:global(html.dark .iframe-container.surface-accent),
	:global(html.dark .iframe-container.surface-highlight),
	:global(html.dark .iframe-container.surface-frosted) {
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
	}

	/* Aspect ratio iframe container - maintains 16:9 ratio */
	:global(.iframe-container-aspect) {
		position: relative;
		width: 100%;
		padding-top: 56.25%; /* 16:9 Aspect Ratio */
		margin-bottom: var(--space-8);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
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

	/* Flat surface variant integration for aspect ratio containers */
	:global(.iframe-container-aspect.surface),
	:global(.iframe-container-aspect.surface-light),
	:global(.iframe-container-aspect.surface-medium),
	:global(.iframe-container-aspect.surface-heavy),
	:global(.iframe-container-aspect.surface-primary),
	:global(.iframe-container-aspect.surface-accent),
	:global(.iframe-container-aspect.surface-highlight),
	:global(.iframe-container-aspect.surface-frosted) {
		/* Let the global flat-surface utilities handle the background */
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent);
	}

	:global(html.dark .iframe-container-aspect.surface),
	:global(html.dark .iframe-container-aspect.surface-light),
	:global(html.dark .iframe-container-aspect.surface-medium),
	:global(html.dark .iframe-container-aspect.surface-heavy),
	:global(html.dark .iframe-container-aspect.surface-primary),
	:global(html.dark .iframe-container-aspect.surface-accent),
	:global(html.dark .iframe-container-aspect.surface-highlight),
	:global(html.dark .iframe-container-aspect.surface-frosted) {
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
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
		height: calc(100vh - var(--space-32)); /* Full viewport height minus space for header/footer */
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
		transition: opacity var(--duration-normal); /* Using global transition duration */
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
		width: var(--space-10);
		height: var(--space-10);
		margin: calc(var(--space-10) * -0.5) 0 0 calc(var(--space-10) * -0.5);
		border: var(--space-1) solid var(--color-border);
		border-top: var(--space-1) solid var(--color-primary);
		border-radius: var(--border-radius-full);
		animation: iframe-loading-spin var(--duration-slow) linear infinite;
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
		transition: opacity var(--duration-normal); /* Using global transition duration */
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

	/* Interactive embeds warm their border on hover — no lift, no shadow. */
	:global(.iframe-interactive) {
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	:global(.iframe-interactive:hover) {
		border-color: var(--color-accent);
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

	/* Header — an ink bar with a DATA-voice mono-caps label. Square. */
	:global(.iframe-header) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: var(--iframe-header-height);
		background-color: var(--color-primary);
		color: var(--color-text-inverted);
		display: flex;
		align-items: center;
		padding: 0 var(--space-4);
		font-family: var(--font-family-mono);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		border-radius: 0;
		border-bottom: var(--border-width-thin) solid var(--color-border);
		font-size: var(--font-size-2xs);
	}

	:global(.iframe-with-header iframe) {
		height: calc(100% - var(--iframe-header-height));
		/* Remove margin-top since padding-top on container already creates space for header */
	}

	/* Surface variants for iframe headers */
	:global(.iframe-with-header.surface .iframe-header),
	:global(.iframe-with-header.surface-light .iframe-header),
	:global(.iframe-with-header.surface-medium .iframe-header),
	:global(.iframe-with-header.surface-heavy .iframe-header) {
		background: var(--color-primary);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent);
	}

	:global(html.dark .iframe-with-header.surface .iframe-header),
	:global(html.dark .iframe-with-header.surface-light .iframe-header),
	:global(html.dark .iframe-with-header.surface-medium .iframe-header),
	:global(html.dark .iframe-with-header.surface-heavy .iframe-header) {
		background: color-mix(in srgb, var(--color-primary) 85%, transparent);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
	}

	/* Responsive adjustments
	 * Mobile: swap the 16:9 aspect ratio for a taller composition. Interactive
	 * dashboards, maps, and timelines need vertical room — a 375px viewport
	 * at 16:9 collapses to ~211px tall, which is unusable. Use a 3:4 portrait
	 * ratio plus a generous min-height floor so embedded content actually
	 * breathes on phones. */
	@media (--sm-down) {
		:global(.iframe-container),
		:global(.iframe-container-md) {
			height: var(--iframe-height-default); /* Keep full default height on small screens */
		}

		:global(.iframe-container-lg),
		:global(.iframe-container-xl) {
			height: var(--iframe-height-default);
		}

		:global(.iframe-container-sm) {
			height: var(--iframe-height-sm);
		}

		:global(.iframe-container-fullheight) {
			height: calc(100vh - var(--space-24)); /* Adjust spacing for mobile */
		}

		:global(.iframe-container-aspect) {
			/* Portrait-leaning ratio gives interactive embeds usable height on
			 * narrow screens; min-height prevents collapse on the smallest phones. */
			padding-top: 133.33%;
			min-height: 32rem;
		}

		:global(.iframe-header) {
			font-size: var(--font-size-xs);
			padding: 0 var(--space-3);
		}
	}

	@media (--xs-down) {
		:global(.iframe-container),
		:global(.iframe-container-md) {
			height: calc(var(--iframe-height-default) * 0.83);
		}

		:global(.iframe-container-lg),
		:global(.iframe-container-xl) {
			height: var(--iframe-height-default);
		}

		:global(.iframe-container-sm) {
			height: calc(var(--iframe-height-sm) * 0.9);
		}

		:global(.iframe-container-xs) {
			height: var(--iframe-height-xs);
		}

		:global(.iframe-container-aspect) {
			padding-top: 150%;
			min-height: 28rem;
		}

		:global(.iframe-header) {
			font-size: var(--font-size-xs);
			height: var(--iframe-header-height-mobile);
			padding: 0 var(--space-2);
		}

		:global(.iframe-with-header) {
			padding-top: var(--iframe-header-height-mobile);
		}

		:global(.iframe-with-header iframe) {
			height: calc(100% - var(--iframe-header-height-mobile));
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

		/* Flatten surface variants in print */
		:global(.iframe-container.surface),
		:global(.iframe-container.surface-light),
		:global(.iframe-container.surface-medium),
		:global(.iframe-container.surface-heavy),
		:global(.iframe-container-aspect.surface),
		:global(.iframe-container-aspect.surface-light),
		:global(.iframe-container-aspect.surface-medium),
		:global(.iframe-container-aspect.surface-heavy) {
			background: var(--color-white) !important;
			-webkit-backdrop-filter: none !important;
			backdrop-filter: none !important;
		}
	}
</style>
