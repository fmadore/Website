<script lang="ts">
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
	
	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${glassEffect} ${additionalClasses}`.trim();
</script>

<div class={combinedClasses}>
	{@render children()}
</div>

<style>
	.page-intro {
		font-size: var(--font-size-xl);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		margin-bottom: var(--spacing-10);
		position: relative;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		padding: var(--spacing-6) var(--spacing-8);
		border-radius: var(--border-radius-lg);
		
		/* Built-in glassmorphism for all variants */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.page-intro:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	/* Variant styles */
	/* Default variant uses the base glassmorphism styling applied above */

	.page-intro--compact {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-6);
		padding: var(--spacing-4) var(--spacing-6);
		/* Lighter glassmorphism for compact variant */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.02) 0%,
			rgba(var(--color-highlight-rgb), 0.015) 50%,
			rgba(var(--color-accent-rgb), 0.008) 100%
		);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: 
			0 4px 16px 0 rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.page-intro--compact:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		box-shadow: 
			0 8px 24px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.page-intro--emphasized {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-12);
		color: var(--color-text-emphasis);
		padding: var(--spacing-8) var(--spacing-10);
		
		/* Enhanced glassmorphism for emphasized variant */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.15);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.25);
		
		/* Add subtle accent border for emphasis */
		border-left: 4px solid transparent;
		border-image: linear-gradient(180deg, 
			var(--color-primary) 0%, 
			var(--color-highlight) 100%
		) 1;
		border-image-slice: 1;
	}

	.page-intro--emphasized:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.05) 50%,
			rgba(var(--color-accent-rgb), 0.03) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		box-shadow: 
			0 16px 48px 0 rgba(31, 38, 135, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.page-intro--featured {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-12);
		padding: var(--spacing-10);
		
		/* Premium glassmorphism for featured variant */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.05) 50%,
			rgba(var(--color-accent-rgb), 0.03) 100%
		);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		box-shadow: 
			0 16px 48px 0 rgba(31, 38, 135, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
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
		background: linear-gradient(90deg, 
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
			rgba(var(--color-highlight-rgb), 0.08) 50%,
			rgba(var(--color-accent-rgb), 0.05) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		box-shadow: 
			0 20px 60px 0 rgba(31, 38, 135, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	/* Typography enhancements */
	.page-intro :global(p) {
		margin: 0;
		line-height: inherit;
	}

	.page-intro :global(p + p) {
		margin-top: var(--spacing-4);
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
		outline: 2px solid var(--color-highlight);
		outline-offset: 2px;
		box-shadow: 0 0 0 4px rgba(var(--color-highlight-rgb), 0.2);
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

	/* Additional glassmorphism utilities can still be applied for further customization */

	/* Dark mode enhancements */
	:global(html.dark) .page-intro {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.05) 50%,
			rgba(var(--color-accent-rgb), 0.03) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .page-intro:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), 0.08) 50%,
			rgba(var(--color-accent-rgb), 0.05) 100%
		);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .page-intro--compact {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		box-shadow: 
			0 4px 16px 0 rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	:global(html.dark) .page-intro--compact:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.03) 100%
		);
		box-shadow: 
			0 8px 24px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
	}

	:global(html.dark) .page-intro--emphasized {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), 0.08) 50%,
			rgba(var(--color-accent-rgb), 0.05) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .page-intro--emphasized:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.16) 0%,
			rgba(var(--color-highlight-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		box-shadow: 
			0 16px 48px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	:global(html.dark) .page-intro--featured {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.15) 0%,
			rgba(var(--color-highlight-rgb), 0.1) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		box-shadow: 
			0 16px 48px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	:global(html.dark) .page-intro--featured:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.2) 0%,
			rgba(var(--color-highlight-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		box-shadow: 
			0 20px 60px 0 rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.25);
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
			font-size: var(--font-size-lg);
			margin-bottom: var(--spacing-6);
			padding: var(--spacing-4) var(--spacing-6);
		}

		.page-intro--compact {
			font-size: var(--font-size-base);
			margin-bottom: var(--spacing-4);
			padding: var(--spacing-3) var(--spacing-4);
		}

		.page-intro--emphasized {
			font-size: var(--font-size-xl);
			margin-bottom: var(--spacing-8);
			padding: var(--spacing-6) var(--spacing-8);
			border-left: 3px solid transparent;
		}

		.page-intro--featured {
			font-size: var(--font-size-xl);
			margin-bottom: var(--spacing-8);
			padding: var(--spacing-6) var(--spacing-8);
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