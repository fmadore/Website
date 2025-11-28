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
	<section class="details-section mb-8" aria-labelledby="publication-details-heading">
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
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-md) var(--space-lg);
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		/* Subtle layered gradient echoing other glass components */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 55%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		position: relative;
	}

	/* Extra inner subtle separator using pseudo to reduce extra DOM */
	.details-grid:before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		background: linear-gradient(
			180deg,
			rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-low)) 0%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 40%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 60%,
			rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-low)) 100%
		);
		mix-blend-mode: overlay;
		opacity: var(--opacity-medium);
	}

	.detail-item {
		display: grid;
		grid-template-columns: 110px 1fr; /* label column */
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-xs) var(--space-xs);
		border-bottom: var(--border-width-thin) solid var(--color-border-light);
		position: relative;
	}
	.detail-item:last-child {
		border-bottom: none;
	}

	/* In narrow view collapse to vertical stack */
	@media (max-width: 520px) {
		.detail-item {
			grid-template-columns: 1fr;
		}
		.detail-label {
			margin-bottom: var(--space-2xs);
		}
	}

	.detail-label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
		color: var(--color-text-light);
		line-height: var(--line-height-tight);
	}

	.detail-value {
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text);
		word-break: break-word;
	}

	.detail-link {
		color: var(--color-primary);
		text-decoration: none;
		position: relative;
		transition: color var(--anim-duration-fast) var(--anim-ease-out);
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
			rgba(var(--color-dark-surface-rgb, 17, 24, 39), var(--opacity-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 55%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
	}
	:global(html.dark) .detail-item {
		border-bottom: var(--border-width-thin) solid rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-low));
	}
	:global(html.dark) .detail-label {
		color: var(--color-text-light);
	}
	:global(html.dark) .detail-value {
		color: var(--color-text);
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.details-grid {
			transition: none;
		}
	}
</style>
