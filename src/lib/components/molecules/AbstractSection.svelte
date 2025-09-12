<script lang="ts">
	let {
		abstract = undefined,
		sectionClass = 'abstract-section',
		titleClass = 'abstract-title',
		titleText = 'Abstract',
		contentClass = 'abstract-content'
	}: {
		abstract?: string | undefined | null;
		sectionClass?: string;
		titleClass?: string;
		titleText?: string;
		contentClass?: string;
	} = $props();
</script>

{#if abstract}
	<section class={sectionClass}>
		<h2 class={titleClass}>{titleText}</h2>
		<div class={contentClass}>{abstract}</div>
	</section>
{/if}

<style>
	.abstract-section {
		margin-bottom: var(--spacing-8);
		padding: var(--spacing-6) var(--spacing-6) var(--spacing-5);
		border-radius: var(--border-radius-xl);
		position: relative;

		/* Sophisticated glassmorphism effect matching design system */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.035) 0%,
			rgba(var(--color-accent-rgb), 0.025) 50%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 8px));
		backdrop-filter: blur(var(--glass-blur-fallback, 8px));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low, 0.08));
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-low, 0.1));
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.abstract-section:hover {
		transform: var(--transform-lift-sm, translateY(-1px));
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-accent-rgb), 0.035) 50%,
			rgba(var(--color-highlight-rgb), 0.03) 100%
		);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-medium, 0.15));
	}

	.abstract-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-4);
		line-height: var(--line-height-tight);
		position: relative;
	}

	/* Elegant accent line under title */
	.abstract-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--spacing-2));
		left: 0;
		width: var(--spacing-16);
		height: var(--border-width-medium, 2px);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			rgba(var(--color-highlight-rgb), 0.3) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.abstract-section:hover .abstract-title::after {
		width: var(--spacing-20);
	}

	.abstract-content {
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		text-align: justify;
		hyphens: auto;
	}

	/* Dark mode refinements */
	:global(html.dark) .abstract-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.6) 0%,
			rgba(var(--color-primary-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.08);
	}

	:global(html.dark) .abstract-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.7) 0%,
			rgba(var(--color-primary-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.abstract-section {
			padding: var(--spacing-4);
		}

		.abstract-title {
			font-size: var(--font-size-lg);
		}

		.abstract-content {
			font-size: var(--font-size-sm);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.abstract-section,
		.abstract-section:hover,
		.abstract-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
