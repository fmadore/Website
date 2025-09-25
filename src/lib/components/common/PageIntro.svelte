<script lang="ts">
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

	let {
		children,
		variant = 'default',
		glassEffect = '',
		additionalClasses = ''
	}: {
		children: any;
		variant?: 'default' | 'compact' | 'emphasized' | 'featured';
		glassEffect?: '' | 'glass-light' | 'glass-medium' | 'glass-panel-light';
		additionalClasses?: string;
	} = $props();

	// Combine classes based on variant, glass effect, and additional classes
	const baseClasses = 'page-intro';
	const variantClasses = {
		default: 'page-intro--default',
		compact: 'page-intro--compact',
		emphasized: 'page-intro--emphasized',
		featured: 'page-intro--featured'
	};

	const combinedClasses =
		`${baseClasses} ${variantClasses[variant]} ${glassEffect} ${additionalClasses}`.trim();

	// Different animation settings based on variant
	const animationSettings = {
		default: { delay: DELAY_STEP * 2, animationClass: 'fade-in-up' },
		compact: { delay: DELAY_STEP * 1, animationClass: 'fade-in-up' },
		emphasized: { delay: DELAY_STEP * 3, animationClass: 'scale-in-center' },
		featured: { delay: DELAY_STEP * 4, animationClass: 'scale-in-center' }
	};
</script>

<div class={combinedClasses} use:scrollAnimate={animationSettings[variant]}>
	{@render children()}
</div>

<style>
	.page-intro {
		font-size: var(--font-size-heading-5);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		margin-bottom: var(--space-lg);
		position: relative;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--border-radius-lg);

		/* Built-in glassmorphism for all variants */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: var(--border-width-thin) solid rgba(255, 255, 255, var(--opacity-medium-high));
		box-shadow: var(--shadow-lg);
	}

	.page-intro:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: var(--shadow-xl);
	}

	/* Variant styles */
	/* Default variant uses the base glassmorphism styling applied above */

	.page-intro--compact {
		font-size: var(--font-size-heading-6);
		margin-bottom: var(--space-md);
		padding: var(--space-sm) var(--space-lg);
		/* Lighter glassmorphism for compact variant */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: var(--shadow-sm);
	}

	.page-intro--compact:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
	}

	.page-intro--emphasized {
		font-size: var(--font-size-heading-3);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--space-xl);
		color: var(--color-text-emphasis);
		padding: var(--space-xl) var(--space-2xl);

		/* Enhanced glassmorphism for emphasized variant */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.15);
		box-shadow: var(--shadow-xl);

		/* Add subtle accent border for emphasis */
		border-left: var(--border-width-thick) solid transparent;
		border-image: linear-gradient(180deg, var(--color-primary) 0%, var(--color-highlight) 100%) 1;
		border-image-slice: 1;
	}

	.page-intro--emphasized:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		box-shadow: var(--shadow-2xl);
	}

	.page-intro--featured {
		font-size: var(--font-size-heading-3);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--space-xl);
		padding: var(--space-2xl);

		/* Premium glassmorphism for featured variant */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: var(--border-width-thin) solid
			rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		box-shadow: var(--shadow-2xl);
		position: relative;
		overflow: hidden;
	}

	.page-intro--featured::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--color-primary) 0%,
			var(--color-highlight) 50%,
			var(--color-accent) 100%
		);
		opacity: var(--opacity-medium);
	}

	.page-intro--featured:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-medium)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		box-shadow: 0 20px 60px 0 rgba(0, 0, 0, 0.3);
	}

	/* Typography enhancements */
	.page-intro :global(p) {
		margin: 0;
		line-height: inherit;
	}

	.page-intro :global(p + p) {
		margin-top: var(--space-md);
	}

	.page-intro :global(a) {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: all 0.2s ease;
		position: relative;
	}

	.page-intro :global(a::after) {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 1px;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.page-intro :global(a:hover) {
		color: var(--color-primary-dark);
	}

	.page-intro :global(a:hover::after) {
		width: 100%;
	}

	.page-intro :global(a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-2xs);
		box-shadow: 0 0 0 var(--border-width-thick)
			rgba(var(--color-highlight-rgb), var(--opacity-medium-high));
		border-radius: var(--border-radius-sm);
	}

	.page-intro :global(em) {
		font-style: italic;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	.page-intro :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/* Dark mode enhancements */
	:global(html.dark) .page-intro {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border: var(--border-width-thin) solid rgba(255, 255, 255, var(--opacity-medium));
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .page-intro:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-medium)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow: var(--shadow-xl);
	}

	:global(html.dark) .page-intro--compact {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-sm);
	}

	:global(html.dark) .page-intro--compact:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .page-intro--emphasized {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-medium)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		box-shadow: var(--shadow-xl);
	}

	:global(html.dark) .page-intro--emphasized:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.16) 0%,
			rgba(var(--color-highlight-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-medium)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		box-shadow: var(--shadow-2xl);
	}

	:global(html.dark) .page-intro--featured {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.15) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-medium)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		box-shadow: var(--shadow-2xl);
	}

	:global(html.dark) .page-intro--featured:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-highlight-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-medium)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		box-shadow: 0 20px 60px 0 rgba(0, 0, 0, 0.6);
	}

	:global(html.dark) .page-intro--featured::before {
		opacity: var(--opacity-medium-high);
	}

	:global(html.dark) .page-intro :global(a) {
		color: var(--color-primary);
	}

	:global(html.dark) .page-intro :global(a:hover) {
		color: var(--color-highlight);
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.page-intro {
			font-size: var(--font-size-heading-6);
			margin-bottom: var(--space-md);
			padding: var(--space-sm) var(--space-lg);
		}

		.page-intro--compact {
			font-size: var(--font-size-body);
			margin-bottom: var(--space-sm);
			padding: var(--space-2xs) var(--space-md);
		}

		.page-intro--emphasized {
			font-size: var(--font-size-heading-4);
			margin-bottom: var(--space-lg);
			padding: var(--space-md) var(--space-xl);
			border-left: 3px solid transparent;
		}

		.page-intro--featured {
			font-size: var(--font-size-heading-4);
			margin-bottom: var(--space-lg);
			padding: var(--space-md) var(--space-xl);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.page-intro,
		.page-intro :global(a),
		.page-intro :global(a::after) {
			transition: none;
		}

		.page-intro:hover,
		.page-intro--compact:hover,
		.page-intro--emphasized:hover,
		.page-intro--featured:hover {
			transform: none;
		}
	}
</style>

