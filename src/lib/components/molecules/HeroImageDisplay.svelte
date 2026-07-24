<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { portalModal } from '$lib/actions/portalModal';
	import { buildSrcset } from '$lib/utils/imageVariants';

	let {
		heroImage = undefined,
		fallbackImage = undefined,
		defaultAlt = 'Hero image',
		imageClass = 'hero-image', // Default class using our styling
		figcaptionClass = 'hero-caption',
		framed = true,
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
		framed?: boolean;
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

	// Use the global flat-surface utility (surface-card) to ensure visual consistency.
	// `.hero-entrance` plays an immediate mount animation (for above-the-fold
	// hero images on detail pages); `.scroll-reveal-scale` handles the
	// scroll-driven reveal if the figure ever lives below the fold.
	const combinedFigureClass = $derived(
		[
			'hero-figure',
			`hero-figure--${variant}`,
			framed ? 'surface-card hero-figure--framed' : '',
			'hero-entrance',
			'scroll-reveal-scale'
		]
			.filter(Boolean)
			.join(' ')
	);

	const combinedImageClass = $derived(
		['hero-image', `hero-image--${variant}`, imageClass].filter(Boolean).join(' ')
	);

	// Responsive variants (400/800/1600 webp) generated at build time; the
	// sizes attribute below finally has a srcset to act on. External URLs
	// yield undefined and render with the plain src.
	const heroSrcset = $derived(buildSrcset(absoluteSrc));
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
				srcset={heroSrcset}
				alt={altText}
				class={combinedImageClass}
				{loading}
				{fetchpriority}
				decoding="async"
				width="330"
				height="438"
				sizes={heroSrcset
					? '(max-width: 640px) 100vw, (max-width: 768px) 330px, (max-width: 1024px) 600px, 800px'
					: undefined}
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
		use:portalModal={{ onDismiss: closeZoom }}
		class="fullscreen-modal"
		role="dialog"
		aria-modal="true"
		aria-label="Fullscreen image view"
		tabindex="0"
	>
		<button
			class="btn btn-sm btn-with-icon btn-icon-only close-button"
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
	/* Hero figure — a plate on the page. Square, flat, no lift: the archive
	 * mounts a scan, it does not float a card. */
	.hero-figure {
		margin-bottom: var(--space-6); /* Match PageHeader margin for consistency */
		position: relative;
		overflow: hidden; /* Contain the overlay */

		/* Shrink to intrinsic content width and center horizontally */
		display: block;
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
		max-width: 100%;
	}

	.image-container {
		position: relative;
		cursor: pointer;
		overflow: hidden;
		border-radius: 0;
		border: none;
		background: none;
		padding: 0;
		display: block;
		width: 100%;
	}

	.image-container:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-0-5);
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: color-mix(in srgb, var(--color-black) calc(var(--opacity-15) * 100%), transparent);
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
				color-mix(in srgb, var(--color-black) calc(var(--opacity-15) * 100%), transparent)
		);
	}

	/* Hero image — the plate itself: square corners, a single hairline frame,
	 * no shadow. The scan sits flat on the page like a mounted print. */
	.hero-image {
		width: auto;
		max-width: 100%;
		height: auto;
		display: block;
		margin-left: auto;
		margin-right: auto;
		border-radius: 0;
		object-fit: contain; /* Ensure entire image visible without cropping */
		aspect-ratio: auto;
		border: var(--border-width-thin) solid var(--color-border);
	}

	/* Caption — serif italic, the plate's fine-book legend ("Fig. — …"). */
	.hero-caption {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		text-align: center;
		margin-top: var(--space-3);
		font-style: italic;
		line-height: var(--line-height-caption);
		font-family: var(--font-family-serif);
		padding: 0 var(--space-4); /* Add horizontal padding for better readability */
	}

	/* Framed figure (formerly the "glass" figure) — retired tile chrome. The
	 * prop is kept for API compatibility, but per the imagery clause the
	 * figure is a plate: the image carries its own hairline frame, the caption
	 * is plain serif italic, and there is no gradient tile, padding, or hover
	 * lift. */
	.hero-figure--framed {
		background: transparent;
		padding: 0;
		border: none;
		box-shadow: none;
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

	/* Image variant styles — all square; the plate never rounds. */
	.hero-image--compact,
	.hero-image--featured {
		border-radius: 0;
	}

	/* Dark mode — same plate treatment on slate; hairline picks up the
	 * dark border token. */
	:global(html.dark) .hero-image {
		border-color: var(--color-border-dark);
	}

	/* Fullscreen Modal Styling — flat microfilm scrim, no blur or glass */
	.fullscreen-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: var(--z-modal);
		/* A flat microfilm-negative scrim: solid near-black ink, no blur. */
		background: color-mix(in srgb, var(--color-primary) 92%, var(--color-black));
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: zoom-out;
		/* A plain fade-in; no scale (the redesign keeps motion minimal). */
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
		border-radius: 0;
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent);
		display: block;
	}

	.fullscreen-caption {
		color: color-mix(in srgb, var(--color-white) 82%, transparent);
		margin-top: var(--space-4);
		font-size: var(--font-size-lg);
		font-style: italic;
		text-align: center;
		max-width: 80vw;
		line-height: var(--line-height-caption);
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-family-serif);
	}

	/* Close button — a flat square control on the scrim: hairline frame in
	 * paper-white, no blur, no shadow, no lift. Pine border on hover. */
	:global(.close-button) {
		position: absolute !important;
		top: var(--space-4) !important;
		right: var(--space-4) !important;
		z-index: var(--z-dropdown) !important;
		width: calc(var(--space-8) + var(--space-2)) !important;
		height: calc(var(--space-8) + var(--space-2)) !important;
		border-radius: 0 !important;
		padding: 0 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		min-width: unset !important;

		background: transparent !important;
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-40) * 100%), transparent) !important;
		box-shadow: none !important;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out) !important;
	}

	:global(.close-button:hover) {
		background: transparent !important;
		border-color: var(--color-accent) !important;
		transform: none !important;
		box-shadow: none !important;
	}

	:global(.close-button svg) {
		color: color-mix(in srgb, var(--color-white) 88%, transparent) !important;
	}

	:global(.close-button:hover svg) {
		color: var(--color-accent) !important;
	}

	/* Dark theme — the ink scrim and paper-white frames already read on slate;
	 * only the negative needs a touch more contrast on its hairline. */
	:global(html.dark) .fullscreen-image {
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-15) * 100%),
			transparent
		);
	}

	/* Animation keyframes — a plain opacity fade, no scale. */
	@keyframes modalFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
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

		.hero-caption {
			font-size: var(--font-size-xs);
			margin-top: var(--space-2);
			padding: 0 var(--space-2);
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
