<script lang="ts">
	/**
	 * ProjectYears - Displays the active years/timeline of a research project
	 * Uses glassmorphism design and global CSS variables
	 */

	let {
		years,
		label = 'Project Period',
		variant = 'default',
		showIcon = true
	}: {
		/** The years string (e.g., '2026-2027', '2025-', '2021-2024') */
		years: string;
		/** Optional label prefix */
		label?: string;
		/** Visual variant: 'default' | 'compact' | 'badge' */
		variant?: 'default' | 'compact' | 'badge';
		/** Whether to show the calendar icon */
		showIcon?: boolean;
	} = $props();

	const containerClass = $derived(
		`project-years project-years--${variant}`.trim()
	);
</script>

<div class={containerClass}>
	{#if showIcon}
		<svg
			class="project-years__icon"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
			<line x1="16" y1="2" x2="16" y2="6"></line>
			<line x1="8" y1="2" x2="8" y2="6"></line>
			<line x1="3" y1="10" x2="21" y2="10"></line>
		</svg>
	{/if}
	{#if variant !== 'badge'}
		<span class="project-years__label">{label}:</span>
	{/if}
	<span class="project-years__value">{years}</span>
</div>

<style>
	.project-years {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-family-sans);
		transition: all var(--duration-normal) var(--ease-out);
	}

	/* Default variant - full display with glassmorphism */
	.project-years--default {
		padding: var(--space-3) var(--space-4);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-accent-rgb), 0.05) 100%
		);
		border-radius: var(--border-radius-lg);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		box-shadow: var(--shadow-sm);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.project-years--default:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-md);
	}

	/* Compact variant - minimal styling */
	.project-years--compact {
		padding: var(--space-2) var(--space-3);
		background: rgba(var(--color-surface-rgb), var(--opacity-high));
		border-radius: var(--border-radius-md);
		border: var(--border-width-thin) solid var(--color-border);
	}

	/* Badge variant - pill-shaped, bold styling */
	.project-years--badge {
		padding: var(--space-2) var(--space-4);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
		color: var(--color-text-inverted);
		border-radius: var(--border-radius-full);
		box-shadow: var(--shadow-sm);
		font-weight: var(--font-weight-semibold);
	}

	.project-years--badge .project-years__icon {
		color: var(--color-text-inverted);
	}

	.project-years--badge .project-years__value {
		color: var(--color-text-inverted);
		font-weight: var(--font-weight-bold);
	}

	/* Icon styling */
	.project-years__icon {
		width: var(--space-5);
		height: var(--space-5);
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.project-years--compact .project-years__icon {
		width: var(--space-4);
		height: var(--space-4);
	}

	.project-years--badge .project-years__icon {
		width: var(--space-4);
		height: var(--space-4);
	}

	/* Label styling */
	.project-years__label {
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
		font-weight: var(--font-weight-medium);
	}

	.project-years--compact .project-years__label {
		font-size: var(--font-size-xs);
	}

	/* Value styling */
	.project-years__value {
		font-size: var(--font-size-base);
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-tight);
	}

	.project-years--compact .project-years__value {
		font-size: var(--font-size-sm);
	}

	/* Dark mode adjustments */
	:global(html.dark) .project-years--default {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.15) 0%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	:global(html.dark) .project-years--default:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.2) 0%,
			rgba(var(--color-accent-rgb), 0.15) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	:global(html.dark) .project-years--compact {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-high));
		border-color: var(--color-border-dark);
	}

	:global(html.dark) .project-years__icon {
		color: var(--color-primary-light);
	}

	:global(html.dark) .project-years__value {
		color: var(--color-primary-light);
	}

	:global(html.dark) .project-years--badge .project-years__icon,
	:global(html.dark) .project-years--badge .project-years__value {
		color: var(--color-text-inverted);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.project-years {
			transition: none;
		}
	}
</style>
