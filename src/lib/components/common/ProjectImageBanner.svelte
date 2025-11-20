<script lang="ts">
	let {
		src,
		alt,
		width = 800,
		height = 600,
		glassEffect = 'glass-light',
		additionalClasses = '',
		showOverlay = true,
		overlayIntensity = 'subtle'
	}: {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		glassEffect?: 'glass-card' | 'glass-panel' | 'glass-medium' | 'glass-light';
		additionalClasses?: string;
		showOverlay?: boolean;
		overlayIntensity?: 'subtle' | 'medium' | 'strong';
	} = $props();

	const combinedClasses = `project-image-banner ${glassEffect} ${additionalClasses}`.trim();
	const overlayClass = showOverlay ? `overlay-${overlayIntensity}` : '';
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
		margin-bottom: var(--spacing-8);
		border-radius: var(--border-radius-xl);
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
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 25%,
			rgba(var(--color-accent-rgb), 0.015) 50%,
			rgba(var(--color-primary-rgb), 0.01) 75%,
			transparent 100%
		);
		padding: var(--spacing-5);
		/* Enhanced glassmorphism shadow with multiple layers */
		box-shadow:
			0 8px 32px 0 rgba(31, 38, 135, 0.12),
			0 2px 16px 0 rgba(31, 38, 135, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			inset 0 -1px 0 rgba(255, 255, 255, 0.1);
		border: var(--border-width-thin) solid rgba(255, 255, 255, 0.25);
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
			rgba(var(--color-primary-rgb), 0.02) 0%,
			transparent 30%,
			transparent 70%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
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
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 25%,
			rgba(var(--color-accent-rgb), 0.03) 50%,
			rgba(var(--color-primary-rgb), 0.02) 75%,
			rgba(var(--color-highlight-rgb), 0.01) 100%
		);
		box-shadow:
			0 16px 48px 0 rgba(31, 38, 135, 0.18),
			0 4px 24px 0 rgba(31, 38, 135, 0.12),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			inset 0 -1px 0 rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.35);
	}

	.project-image-banner:hover::before {
		opacity: 1;
	}

	.image-container {
		position: relative;
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		background: linear-gradient(
			135deg,
			rgba(var(--color-surface-rgb), 0.8) 0%,
			rgba(var(--color-surface-rgb), 0.6) 100%
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
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		opacity: 0.3;
	}

	.overlay-medium {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), 0.08) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
		opacity: 0.4;
	}

	.overlay-strong {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.18) 0%,
			rgba(var(--color-highlight-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.15) 100%
		);
		opacity: 0.5;
	}

	.project-image-banner:hover .image-overlay {
		opacity: 0.6;
	}

	.banner-glow {
		position: absolute;
		top: calc(-1 * var(--space-3xs));
		left: calc(-1 * var(--space-3xs));
		right: calc(-1 * var(--space-3xs));
		bottom: calc(-1 * var(--space-3xs));
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.1) 0%,
			rgba(var(--color-highlight-rgb), 0.08) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
		border-radius: calc(var(--border-radius-xl) + var(--space-3xs));
		opacity: 0;
		transition: opacity var(--anim-duration-slow) var(--anim-ease-base);
		z-index: -1;
		filter: blur(var(--glass-blur-amount));
	}

	.project-image-banner:hover .banner-glow {
		opacity: 0.6;
	}

	/* Dark mode adjustments */
	:global(html.dark) .project-image-banner {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 25%,
			rgba(var(--color-accent-rgb), 0.03) 50%,
			rgba(var(--color-primary-rgb), 0.02) 75%,
			transparent 100%
		);
		box-shadow:
			0 8px 32px 0 rgba(0, 0, 0, 0.4),
			0 2px 16px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			inset 0 -1px 0 rgba(255, 255, 255, 0.08);
		border: var(--border-width-thin) solid rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .project-image-banner::before {
		background: linear-gradient(
			45deg,
			rgba(var(--color-primary-rgb), 0.04) 0%,
			transparent 30%,
			transparent 70%,
			rgba(var(--color-highlight-rgb), 0.04) 100%
		);
	}

	:global(html.dark) .project-image-banner:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 25%,
			rgba(var(--color-accent-rgb), 0.05) 50%,
			rgba(var(--color-primary-rgb), 0.04) 75%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		box-shadow:
			0 16px 48px 0 rgba(0, 0, 0, 0.5),
			0 4px 24px 0 rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.2);
	}

	:global(html.dark) .image-container {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), 0.9) 0%,
			rgba(var(--color-dark-surface-rgb), 0.7) 100%
		);
	}

	:global(html.dark) .overlay-subtle {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), 0.08) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	:global(html.dark) .overlay-medium {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.16) 0%,
			rgba(var(--color-highlight-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.14) 100%
		);
	}

	:global(html.dark) .overlay-strong {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.22) 0%,
			rgba(var(--color-highlight-rgb), 0.16) 50%,
			rgba(var(--color-accent-rgb), 0.18) 100%
		);
	}

	:global(html.dark) .banner-glow {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.15) 0%,
			rgba(var(--color-highlight-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.15) 100%
		);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.project-image-banner {
			padding: var(--spacing-4);
			margin-bottom: var(--spacing-6);
			border-radius: var(--border-radius-lg);
		}

		.image-container {
			border-radius: var(--border-radius-md);
		}

		.banner-glow {
			filter: blur(calc(var(--glass-blur-amount) * 0.6));
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
			border-width: 2px;
		}

		.image-overlay {
			opacity: 0.2;
		}

		.project-image-banner:hover .image-overlay {
			opacity: 0.3;
		}
	}
</style>
