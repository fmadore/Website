<script lang="ts">
	let {
		src,
		alt,
		width = 800,
		height = 600,
		glassEffect = 'glass-light',
		additionalClasses = ''
	}: {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		glassEffect?: 'glass-card' | 'glass-panel' | 'glass-medium' | 'glass-light';
		additionalClasses?: string;
	} = $props();

	const combinedClasses = `project-image-banner ${glassEffect} ${additionalClasses}`.trim();
</script>

<div class={combinedClasses}>
	<img
		{src}
		{alt}
		{width}
		{height}
		loading="lazy"
		decoding="async"
		class="project-image"
	/>
</div>

<style>
	.project-image-banner {
		margin-bottom: var(--spacing-8);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		position: relative;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		/* Enhanced glassmorphism with subtle gradient overlay */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.02) 0%,
			rgba(var(--color-highlight-rgb), 0.01) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		padding: var(--spacing-4);
		/* Standard glassmorphism shadow */
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.project-image-banner:hover {
		transform: var(--transform-lift-sm);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.project-image {
		width: 100%;
		height: auto;
		display: block;
		border-radius: var(--border-radius-md);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Dark mode adjustments */
	:global(html.dark) .project-image-banner {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.04) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .project-image-banner:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.15);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.project-image-banner {
			padding: var(--spacing-3);
			margin-bottom: var(--spacing-6);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.project-image-banner {
			transition: none;
		}

		.project-image-banner:hover {
			transform: none;
		}

		.project-image {
			transition: none;
		}
	}
</style> 