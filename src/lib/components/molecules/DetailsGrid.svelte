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
		<h2 id="publication-details-heading" class="sr-only">Publication Details</h2>
		<dl class="details-grid glass-section-panel">
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

	.details-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0;
		padding: var(--space-lg);
	}

	/* Two columns on medium screens and up */
	@media (--md) {
		.details-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.detail-item {
		display: grid;
		grid-template-columns: var(--space-32) 1fr;
		align-items: baseline;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-xs);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-low) * 100%), transparent);
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
			border-right: var(--border-width-thin) solid
				color-mix(in srgb, var(--color-border) calc(var(--opacity-low) * 100%), transparent);
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
		padding-top: var(--space-0-5);
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

	:global(html.dark) .detail-item {
		border-bottom-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-very-low) * 100%),
			transparent
		);
	}

	@media (--md) {
		:global(html.dark) .detail-item:nth-child(odd) {
			border-right-color: color-mix(
				in srgb,
				var(--color-white) calc(var(--opacity-very-low) * 100%),
				transparent
			);
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
	}
</style>
