<script lang="ts">
	let {
		children,
		variant = 'default',
		additionalClasses = ''
	}: {
		children: any;
		variant?: 'default' | 'compact' | 'emphasized';
		additionalClasses?: string;
	} = $props();

	// Combine classes based on variant and additional classes
	const baseClasses = 'page-intro';
	const variantClasses = {
		default: 'page-intro--default',
		compact: 'page-intro--compact',
		emphasized: 'page-intro--emphasized'
	};
	
	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${additionalClasses}`.trim();
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
		/* Keep it simple - no background, borders, or glassmorphism */
	}

	/* Variant styles */

	.page-intro--compact {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-6);
	}

	.page-intro--emphasized {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-12);
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
		transition: color 0.2s ease;
	}

	.page-intro :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	.page-intro :global(em) {
		font-style: italic;
		color: var(--color-primary);
	}

	.page-intro :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.page-intro {
			font-size: var(--font-size-lg);
			margin-bottom: var(--spacing-6);
		}

		.page-intro--compact {
			font-size: var(--font-size-base);
			margin-bottom: var(--spacing-4);
		}

		.page-intro--emphasized {
			font-size: var(--font-size-xl);
			margin-bottom: var(--spacing-8);
		}
	}
</style> 