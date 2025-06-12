<script lang="ts">
	import type { IframeEmbed } from '$lib/types/digitalHumanities';

	// Create a more flexible type for direct component usage
	type IframeRendererProps = Omit<IframeEmbed, 'type'> & {
		glassEffect?: boolean;
		glassVariant?: 'glass' | 'glass-light' | 'glass-medium' | 'glass-heavy' | 'glass-primary' | 'glass-accent' | 'glass-highlight' | 'glass-frosted';
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

	let finalContainerClass = $derived(
		(() => {
			let classes = [];
			
			if (containerClass) {
				// Use provided containerClass as base
				classes.push(containerClass);
				
				// If height is a class name (not a CSS value), add it
				if (height && 
					!height.endsWith('px') &&
					!height.endsWith('%') &&
					!height.endsWith('vh') &&
					!height.endsWith('em') &&
					!height.endsWith('rem')) {
					classes.push(height);
				}
			} else if (aspectRatio) {
				classes.push(`iframe-container-aspect iframe-container-aspect-${aspectRatio}`);
			} else if (
				height &&
				!height.endsWith('px') &&
				!height.endsWith('%') &&
				!height.endsWith('vh') &&
				!height.endsWith('em') &&
				!height.endsWith('rem')
			) {
				// If height is a class name like iframe-container-sm
				classes.push(height);
			} else {
				// Default base class
				classes.push('iframe-container');
			}
			
			// Add glass effect if enabled
			if (glassEffect) {
				classes.push(glassVariant);
				classes.push('glass-animate');
			}
			
			return classes.join(' ');
		})()
	);

	let style = $derived(
		(() => {
			let s = '';
			if (
				height &&
				(height.endsWith('px') ||
					height.endsWith('%') ||
					height.endsWith('vh') ||
					height.endsWith('em') ||
					height.endsWith('rem'))
			) {
				// If height is a direct CSS value and not a class reference for the container
				if (containerClass && containerClass.includes('iframe-container-aspect')) {
					// If it's an aspect ratio container, height on iframe itself is usually 100%
					s = 'height: 100%;';
				} else {
					s = `height: ${height};`;
				}
			} else if (!height && !aspectRatio && !containerClass) {
				// Default height if nothing else is specified, ensures iframe is visible
				s = 'height: 600px;'; // Default height for iframe container
			}
			return s;
		})()
	);
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
		height: 600px; /* Default height */
		margin-bottom: var(--spacing-8, 2rem);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: var(--border-radius-md, 0.375rem);
		box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		background: var(--color-surface, #ffffff);
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
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Glass effect hover enhancements for interactive iframes */
	:global(.iframe-container.glass.iframe-interactive:hover),
	:global(.iframe-container.glass-light.iframe-interactive:hover),
	:global(.iframe-container.glass-medium.iframe-interactive:hover),
	:global(.iframe-container.glass-heavy.iframe-interactive:hover) {
		transform: translateY(-2px);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.4),
			var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
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
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Aspect ratio iframe container - maintains 16:9 ratio */
	:global(.iframe-container-aspect) {
		position: relative;
		width: 100%;
		padding-top: 56.25%; /* 16:9 Aspect Ratio */
		margin-bottom: var(--spacing-8, 2rem);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: var(--border-radius-md, 0.375rem);
		box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		background: var(--color-surface, #ffffff);
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
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	:global(html.dark .iframe-container-aspect.glass),
	:global(html.dark .iframe-container-aspect.glass-light),
	:global(html.dark .iframe-container-aspect.glass-medium),
	:global(html.dark .iframe-container-aspect.glass-heavy),
	:global(html.dark .iframe-container-aspect.glass-primary),
	:global(html.dark .iframe-container-aspect.glass-accent),
	:global(html.dark .iframe-container-aspect.glass-highlight),
	:global(html.dark .iframe-container-aspect.glass-frosted) {
		border: 1px solid rgba(255, 255, 255, 0.1);
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
		height: 300px;
	}

	:global(.iframe-container-sm) {
		height: 400px;
	}

	:global(.iframe-container-md) {
		height: 600px; /* Same as default for clarity */
	}

	:global(.iframe-container-lg) {
		height: 800px;
	}

	:global(.iframe-container-xl) {
		height: 1000px;
	}

	:global(.iframe-container-fullheight) {
		height: calc(100vh - 200px); /* Full viewport height minus space for header/footer */
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
		background-color: var(--color-background, #f9fafb);
		z-index: 5; /* Higher z-index to ensure it covers the iframe */
		opacity: 0;
		transition: opacity 0.2s; /* Reduced transition time for faster appearance/disappearance */
		pointer-events: none;
		display: none;
	}

	:global(.iframe-container-loading::before),
	:global(.iframe-container-aspect.iframe-container-loading::before) {
		display: block;
		opacity: 1;
		background: var(--color-background, #f9fafb)
			url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80"><circle cx="50" cy="50" r="30" fill="none" stroke="%231a365d" stroke-width="8" stroke-dasharray="188" stroke-dashoffset="0"><animate attributeName="stroke-dashoffset" values="0;188" dur="1.5s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="1.5s" repeatCount="indefinite"/></circle></svg>')
			center center no-repeat;
	}

	:global(.iframe-loaded::before) {
		opacity: 0 !important;
		transition: opacity 0.2s; /* Reduced transition time */
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
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	:global(.iframe-interactive:hover) {
		transform: translateY(-5px);
		box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
	}

	/* Theme variations */
	:global(.iframe-container-bordered) {
		border-width: 2px;
		border-color: var(--color-primary, #3b82f6);
	}

	:global(.iframe-container-accent) {
		border-color: var(--color-accent, #10b981);
	}

	:global(.iframe-container-highlight) {
		border-color: var(--color-highlight, #f59e0b);
	}

	/* Iframe with title bar */
	:global(.iframe-with-header) {
		padding-top: 40px; /* Space for header */
	}

	:global(.iframe-header) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 40px;
		background-color: var(--color-primary, #3b82f6);
		color: white;
		display: flex;
		align-items: center;
		padding: 0 var(--spacing-4, 1rem);
		font-weight: var(--font-weight-medium, 500);
		border-top-left-radius: var(--border-radius-md, 0.375rem);
		border-top-right-radius: var(--border-radius-md, 0.375rem);
		border-bottom: 1px solid var(--color-border, #e5e7eb);
		font-size: var(--font-size-sm, 0.875rem);
	}

	:global(.iframe-with-header iframe) {
		height: calc(100% - 40px);
		/* Remove margin-top since padding-top on container already creates space for header */
	}

	/* Glass effect for iframe headers */
	:global(.iframe-with-header.glass .iframe-header),
	:global(.iframe-with-header.glass-light .iframe-header),
	:global(.iframe-with-header.glass-medium .iframe-header),
	:global(.iframe-with-header.glass-heavy .iframe-header) {
		background: rgba(var(--color-primary-rgb), 0.9);
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	:global(html.dark .iframe-with-header.glass .iframe-header),
	:global(html.dark .iframe-with-header.glass-light .iframe-header),
	:global(html.dark .iframe-with-header.glass-medium .iframe-header),
	:global(html.dark .iframe-with-header.glass-heavy .iframe-header) {
		background: rgba(var(--color-primary-rgb), 0.8);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		:global(.iframe-container),
		:global(.iframe-container-md) {
			height: 500px; /* Slightly shorter on small screens */
		}

		:global(.iframe-container-lg) {
			height: 600px; /* Reduce large containers on small screens */
		}

		:global(.iframe-container-xl) {
			height: 700px; /* Reduce extra large containers on small screens */
		}

		:global(.iframe-container-sm) {
			height: 350px; /* Slightly adjust small containers */
		}

		:global(.iframe-container-fullheight) {
			height: calc(100vh - 150px); /* Adjust spacing for mobile */
		}

		:global(.iframe-header) {
			font-size: var(--font-size-xs, 0.75rem);
			padding: 0 var(--spacing-3, 0.75rem);
		}
	}

	@media (max-width: 480px) {
		:global(.iframe-container),
		:global(.iframe-container-md) {
			height: 400px; /* Even shorter on very small screens */
		}

		:global(.iframe-container-lg) {
			height: 500px;
		}

		:global(.iframe-container-xl) {
			height: 600px;
		}

		:global(.iframe-container-sm) {
			height: 300px;
		}

		:global(.iframe-container-xs) {
			height: 250px;
		}

		:global(.iframe-header) {
			font-size: var(--font-size-xs, 0.75rem);
			height: 36px;
			padding: 0 var(--spacing-2, 0.5rem);
		}

		:global(.iframe-with-header) {
			padding-top: 36px;
		}

		:global(.iframe-with-header iframe) {
			height: calc(100% - 36px);
			/* Remove margin-top since padding-top on container already creates space for header */
		}
	}

	/* Print styles - ensure iframes look good when printed */
	@media print {
		:global(.iframe-container),
		:global(.iframe-container-aspect) {
			box-shadow: none;
			border: 1px solid #000;
			background: white !important;
		}

		:global(.iframe-container-aspect) {
			break-inside: avoid;
			page-break-inside: avoid;
			height: 400px;
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
			background: white !important;
			-webkit-backdrop-filter: none !important;
			backdrop-filter: none !important;
		}
	}
</style>
