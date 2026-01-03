<script lang="ts">
	let {
		src,
		alt,
		width = 800,
		height = 600,
		glassEffect = 'glass-light',
		additionalClasses = '',
		showOverlay = true,
		overlayIntensity = 'subtle',
		scrollAnimation = true
	}: {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		glassEffect?: 'glass-card' | 'glass-panel' | 'glass-medium' | 'glass-light';
		additionalClasses?: string;
		showOverlay?: boolean;
		overlayIntensity?: 'subtle' | 'medium' | 'strong';
		scrollAnimation?: boolean;
	} = $props();

	const animationClass = $derived(scrollAnimation ? 'scroll-reveal-scale' : '');
	const combinedClasses = $derived(
		`project-image-banner ${glassEffect} ${animationClass} ${additionalClasses}`.trim()
	);
	const overlayClass = $derived(showOverlay ? `overlay-${overlayIntensity}` : '');
</script>

<div class={combinedClasses}>
	<div class="image-container">
		<img {src} {alt} {width} {height} loading="lazy" decoding="async" class="project-image" />
		{#if showOverlay}
			<div class="image-overlay {overlayClass}"></div>
		{/if}
	</div>
	<div class="banner-glow"></div>
</div>

<style>
	.project-image-banner {
		margin-bottom: var(--space-6);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		position: relative;
		transition:
			transform var(--anim-duration-slow) var(--anim-ease-base),
			box-shadow var(--anim-duration-slow) var(--anim-ease-base),
			background var(--anim-duration-slow) var(--anim-ease-base),
			border-color var(--anim-duration-slow) var(--anim-ease-base);
		/* Enhanced glassmorphism with sophisticated gradient overlay */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 3%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 2%, transparent) 25%,
			color-mix(in srgb, var(--color-accent) 1.5%, transparent) 50%,
			color-mix(in srgb, var(--color-primary) 1%, transparent) 75%,
			transparent 100%
		);
		padding: var(--space-4);
		/* Enhanced glassmorphism shadow with multiple layers */
		box-shadow:
			0 8px 32px 0 color-mix(in srgb, var(--color-primary) 12%, transparent),
			0 2px 16px 0 color-mix(in srgb, var(--color-primary) 8%, transparent),
			inset 0 1px 0 color-mix(in srgb, var(--color-white) 25%, transparent),
			inset 0 -1px 0 color-mix(in srgb, var(--color-white) 10%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-white) 25%, transparent);
		/* Add subtle backdrop blur */
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
	}

	.project-image-banner::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			45deg,
			color-mix(in srgb, var(--color-primary) 2%, transparent) 0%,
			transparent 30%,
			transparent 70%,
			color-mix(in srgb, var(--color-highlight) 2%, transparent) 100%
		);
		border-radius: inherit;
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--anim-duration-slow) var(--anim-ease-base);
	}

	.project-image-banner:hover {
		transform: var(--transform-lift-md);
		/* Enhanced hover effect with stronger gradient and glow */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 5%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 25%,
			color-mix(in srgb, var(--color-accent) 3%, transparent) 50%,
			color-mix(in srgb, var(--color-primary) 2%, transparent) 75%,
			color-mix(in srgb, var(--color-highlight) 1%, transparent) 100%
		);
		box-shadow:
			0 16px 48px 0 color-mix(in srgb, var(--color-primary) 18%, transparent),
			0 4px 24px 0 color-mix(in srgb, var(--color-primary) 12%, transparent),
			0 0 0 1px color-mix(in srgb, var(--color-primary) 10%, transparent),
			inset 0 1px 0 color-mix(in srgb, var(--color-white) 35%, transparent),
			inset 0 -1px 0 color-mix(in srgb, var(--color-white) 15%, transparent);
		border-color: color-mix(in srgb, var(--color-white) 35%, transparent);
	}

	.project-image-banner:hover::before {
		opacity: 1;
	}

	.image-container {
		position: relative;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-surface) 80%, transparent) 0%,
			color-mix(in srgb, var(--color-surface) 60%, transparent) 100%
		);
	}

	.project-image {
		width: 100%;
		height: auto;
		display: block;
		transition:
			transform var(--anim-duration-slow) var(--anim-ease-base),
			filter var(--anim-duration-slow) var(--anim-ease-base);
		filter: contrast(1.05) saturate(1.1);
	}

	.project-image-banner:hover .project-image {
		transform: scale(1.02);
		filter: contrast(1.08) saturate(1.15) brightness(1.02);
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		transition: opacity var(--anim-duration-slow) var(--anim-ease-base);
		border-radius: inherit;
	}

	.overlay-subtle {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 6%, transparent) 100%
		);
		opacity: var(--opacity-30);
	}

	.overlay-medium {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 8%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 10%, transparent) 100%
		);
		opacity: var(--opacity-40);
	}

	.overlay-strong {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 18%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 12%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 15%, transparent) 100%
		);
		opacity: var(--opacity-50);
	}

	.project-image-banner:hover .image-overlay {
		opacity: var(--opacity-60);
	}

	.banner-glow {
		position: absolute;
		top: calc(-1 * var(--space-3xs));
		left: calc(-1 * var(--space-3xs));
		right: calc(-1 * var(--space-3xs));
		bottom: calc(-1 * var(--space-3xs));
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 10%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 8%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 10%, transparent) 100%
		);
		border-radius: calc(var(--border-radius-xl) + var(--space-3xs));
		opacity: 0;
		transition: opacity var(--anim-duration-slow) var(--anim-ease-base);
		z-index: -1;
		filter: blur(calc(var(--glass-blur-amount) * 0.6));
	}

	.project-image-banner:hover .banner-glow {
		opacity: var(--opacity-60);
	}

	/* Dark mode adjustments */
	:global(html.dark) .project-image-banner {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 6%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 25%,
			color-mix(in srgb, var(--color-accent) 3%, transparent) 50%,
			color-mix(in srgb, var(--color-primary) 2%, transparent) 75%,
			transparent 100%
		);
		box-shadow:
			0 8px 32px 0 color-mix(in srgb, var(--color-black) 40%, transparent),
			0 2px 16px 0 color-mix(in srgb, var(--color-black) 30%, transparent),
			inset 0 1px 0 color-mix(in srgb, var(--color-white) 15%, transparent),
			inset 0 -1px 0 color-mix(in srgb, var(--color-white) 8%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-white) 15%, transparent);
	}

	:global(html.dark) .project-image-banner::before {
		background: linear-gradient(
			45deg,
			color-mix(in srgb, var(--color-primary) 4%, transparent) 0%,
			transparent 30%,
			transparent 70%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 100%
		);
	}

	:global(html.dark) .project-image-banner:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 6%, transparent) 25%,
			color-mix(in srgb, var(--color-accent) 5%, transparent) 50%,
			color-mix(in srgb, var(--color-primary) 4%, transparent) 75%,
			color-mix(in srgb, var(--color-highlight) 2%, transparent) 100%
		);
		box-shadow:
			0 16px 48px 0 color-mix(in srgb, var(--color-black) 50%, transparent),
			0 4px 24px 0 color-mix(in srgb, var(--color-black) 40%, transparent),
			0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent),
			inset 0 1px 0 color-mix(in srgb, var(--color-white) 20%, transparent),
			inset 0 -1px 0 color-mix(in srgb, var(--color-white) 12%, transparent);
		border-color: color-mix(in srgb, var(--color-white) 20%, transparent);
	}

	:global(html.dark) .image-container {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface) 90%, transparent) 0%,
			color-mix(in srgb, var(--color-dark-surface) 70%, transparent) 100%
		);
	}

	:global(html.dark) .overlay-subtle {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 8%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 10%, transparent) 100%
		);
	}

	:global(html.dark) .overlay-medium {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 16%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 12%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 14%, transparent) 100%
		);
	}

	:global(html.dark) .overlay-strong {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 22%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 16%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 18%, transparent) 100%
		);
	}

	:global(html.dark) .banner-glow {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 15%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 12%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 15%, transparent) 100%
		);
	}

	/* Desktop responsive design */
	@media (--sm) {
		.project-image-banner {
			margin-bottom: var(--space-8);
			border-radius: var(--border-radius-xl);
			padding: var(--space-5);
		}

		.image-container {
			border-radius: var(--border-radius-lg);
		}

		.banner-glow {
			filter: blur(var(--glass-blur-amount));
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.project-image-banner,
		.project-image,
		.image-overlay,
		.banner-glow,
		.project-image-banner::before {
			transition: none;
		}

		.project-image-banner:hover {
			transform: none;
		}

		.project-image-banner:hover .project-image {
			transform: none;
			filter: contrast(1.05) saturate(1.1);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.project-image-banner {
			border-width: var(--border-width-thick);
		}

		.image-overlay {
			opacity: var(--opacity-20);
		}

		.project-image-banner:hover .image-overlay {
			opacity: var(--opacity-30);
		}
	}
</style>
