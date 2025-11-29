<script lang="ts">
	let {
		details = []
	}: {
		details: Array<{
			label: string;
			value: string | string[];
			link?: string;
			condition?: boolean;
		}>;
	} = $props();

	// Filter details based on the condition (if provided) and if the value exists
	let visibleDetails = $derived(
		details.filter(
			(detail) =>
				(detail.condition === undefined || detail.condition === true) &&
				detail.value !== null &&
				detail.value !== undefined &&
				detail.value !== '' &&
				(!Array.isArray(detail.value) || detail.value.length > 0)
		)
	);
</script>

{#if visibleDetails.length > 0}
	<section class="details-section scroll-reveal" aria-labelledby="publication-details-heading">
		<h2 id="publication-details-heading" class="visually-hidden">Publication Details</h2>
		<dl class="details-grid glass-card">
			{#each visibleDetails as detail (detail.label)}
				<div class="detail-item">
					<dt class="detail-label">{detail.label}</dt>
					<dd class="detail-value">
						{#if detail.link && detail.link !== 'undefined' && typeof detail.link === 'string'}
							<a href={detail.link} target="_blank" rel="noopener" class="detail-link">
								{Array.isArray(detail.value) ? detail.value.join(', ') : detail.value}
							</a>
						{:else}
							<span>
								{Array.isArray(detail.value) ? detail.value.join(', ') : detail.value}
							</span>
						{/if}
					</dd>
				</div>
			{/each}
		</dl>
	</section>
{/if}

<style>
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	.details-grid {
		display: grid;
		/* Two-column layout on larger screens for better use of space */
		grid-template-columns: 1fr;
		gap: 0;
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		margin-bottom: var(--space-lg);
		/* Subtle layered gradient echoing other glass components */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 55%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		position: relative;
	}

	/* Two columns on medium screens and up */
	@media (--md) {
		.details-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.detail-item {
		display: grid;
		grid-template-columns: 120px 1fr;
		align-items: baseline;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-xs);
		border-bottom: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-low));
		position: relative;
	}

	/* Remove bottom border on last items */
	.detail-item:last-child {
		border-bottom: none;
	}

	/* On two-column layout, handle borders differently */
	@media (--md) {
		.detail-item {
			padding: var(--space-sm) var(--space-md);
		}

		/* Add right border to left column items */
		.detail-item:nth-child(odd) {
			border-right: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-low));
		}

		/* Remove bottom border from last row items */
		.detail-item:nth-last-child(1),
		.detail-item:nth-last-child(2):nth-child(odd) {
			border-bottom: none;
		}
	}

	/* In narrow view collapse to vertical stack */
	@media (--sm-down) {
		.detail-item {
			grid-template-columns: 1fr;
			gap: var(--space-2xs);
		}
	}

	.detail-label {
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
		line-height: var(--line-height-normal);
		/* Ensure consistent vertical alignment */
		padding-top: 2px;
	}

	.detail-value {
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		word-break: break-word;
	}

	.detail-link {
		color: var(--color-primary);
		text-decoration: none;
		position: relative;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.detail-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	.detail-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-2xs);
		border-radius: var(--border-radius-sm);
	}

	/* Dark mode refinements */
	:global(html.dark) .details-grid {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 55%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
	}

	:global(html.dark) .detail-item {
		border-bottom-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
	}

	@media (--md) {
		:global(html.dark) .detail-item:nth-child(odd) {
			border-right-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
		}
	}

	:global(html.dark) .detail-label {
		color: var(--color-text-muted);
	}

	:global(html.dark) .detail-value {
		color: var(--color-text);
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.detail-link {
			transition: none;
		}

		/* Ensure content is visible when animations are disabled */
		.details-section {
			opacity: 1;
			transform: none;
			animation: none;
		}
	}
</style>
