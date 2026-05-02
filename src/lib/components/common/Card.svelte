<script>
	let {
		imageUrl = undefined,
		imageAlt: _imageAltProp = '', // Renamed to avoid conflict with the derived value
		linkUrl = undefined,
		target = '_blank', // Default to opening external links in new tab
		title = '',
		/**
		 * Render this card as the editorial "lead" of a featured block:
		 * no chrome (transparent background, no border, no shadow,
		 * no lift-on-hover), Spectral display title, larger image. Mirrors
		 * the `.entity-card--editorial` pattern in entity-cards.css for
		 * the same single-large-figures break called for in the brief.
		 */
		editorial = false,
		// Snippet props
		subtitle = undefined,
		details = undefined,
		action = undefined,
		children = undefined // For the default slot content
	} = $props();

	// Set default imageAlt if not provided, using $derived for Svelte 5
	let imageAlt = $derived(_imageAltProp || title);
</script>

<div class="card scroll-reveal-scale" class:card--editorial={editorial}>
	{#if imageUrl}
		<div class="card-image">
			{#if linkUrl}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- linkUrl may be pre-resolved or external -->
				<a href={linkUrl} {target} rel="noopener noreferrer">
					<img
						src={imageUrl}
						alt={imageAlt}
						width="300"
						height="200"
						loading="lazy"
						decoding="async"
					/>
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{:else}
				<img
					src={imageUrl}
					alt={imageAlt}
					width="300"
					height="200"
					loading="lazy"
					decoding="async"
				/>
			{/if}
		</div>
	{/if}

	<div class="card-body">
		<h2 class="card-title">
			{#if linkUrl}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- caller passes pre-resolved URL -->
				<a href={linkUrl} {target} rel="noopener noreferrer" class="link-animated">
					{title}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{:else}
				{title}
			{/if}
		</h2>

		{#if subtitle}
			<div class="card-subtitle">
				{@render subtitle()}
			</div>
		{/if}

		<div class="card-description">
			{@render children?.()}
			<!-- Default slot for main description -->
		</div>

		{#if details}
			<div class="card-details">
				{@render details()}
			</div>
		{/if}

		{#if action}
			<div class="card-action">
				{@render action()}
			</div>
		{/if}
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		height: 100%;
		border-radius: var(--border-radius-lg);
		position: relative;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-moderate) var(--ease-spring),
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-moderate) var(--ease-out);
	}

	.card:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 20%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 6%, transparent);
	}

	/* Card hover pre-reveals the title's animated underline. */
	.card:hover :global(.card-title .link-animated) {
		background-size: 100% 2px;
	}

	.card-image {
		overflow: hidden;
		aspect-ratio: 3/2; /* Consistent aspect ratio for card images */
		background-color: var(--color-surface-alt);
		flex-shrink: 0;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-fast) var(--ease-in-out);
	}

	.card:hover .card-image img {
		transform: scale(var(--scale-105));
	}

	.card-body {
		padding: var(--space-lg);
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: var(--font-size-xl);
		margin-top: 0;
		margin-bottom: var(--space-2xs);
		line-height: var(--line-height-tight);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	.card-title a {
		color: inherit;
	}
	/* Hover underline provided by shared .link-animated utility. */

	.card-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--space-sm);
		line-height: var(--line-height-normal);
	}

	.card-description {
		margin-bottom: var(--space-md);
		flex-grow: 1;
		line-height: var(--line-height-relaxed);
	}

	.card-details {
		font-size: var(--font-size-sm);
		margin-bottom: var(--space-sm);
		line-height: var(--line-height-normal);
	}
	/* Styling for elements within card-details slot can be added here or passed via classes */

	.card-action {
		margin-top: auto; /* Pushes link to bottom */
		align-self: flex-start; /* Align link to the left */
	}

	/* Default styling for links inside the action slot */
	/* Consumers can override this by styling their slotted element */
	.card-action :global(a) {
		display: inline-block;
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color var(--duration-fast) var(--ease-in-out);
	}

	.card-action :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* Dark mode — solid warm-dusk surface (the same single-tile treatment
	 * as `.entity-card`). The retired two-stop primary→accent gradient was
	 * the same templated pattern banned in `panels.css` and `pdf-section`;
	 * here the primary-tinted hover shadow gives the lift instead. */
	:global(html.dark) .card {
		background: var(--color-surface);
		border-color: var(--color-border);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .card:hover {
		border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 35%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 40%, transparent);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.card,
		.card-image img {
			transition: none;
		}

		.card:hover {
			transform: none;
		}

		.card:hover .card-image img {
			transform: none;
		}
	}

	/* ============================================================================
	 * Editorial lead variant
	 * ============================================================================
	 * The first card in a curated/featured block (e.g., FeaturedDHProjects)
	 * opts into this variant via the `editorial` prop. It strips card
	 * chrome (background, border, shadow, lift-on-hover) so the project
	 * reads as content-on-paper, not card-on-paper — a deliberate break in
	 * the uniform list rhythm. The brief calls for "asymmetry over centre
	 * alignment" and "break the grid intentionally for emphasis (single
	 * large figures)"; this is the lead-story treatment for the most
	 * prominent project in a section.
	 *
	 * Mirrors `.entity-card--editorial` in entity-cards.css to keep the two
	 * card systems' editorial conventions visually consistent.
	 */
	.card--editorial,
	:global(html.dark) .card--editorial {
		background: transparent;
		border: none;
		box-shadow: none;
		padding-bottom: var(--space-xl);
		margin-bottom: var(--space-lg);
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	/* Editorial cards do not lift on hover — the chrome is gone, so there's
	 * nothing to elevate. We keep the bottom-border separator color
	 * untouched so the hairline rule survives the hover state. */
	.card--editorial:hover,
	:global(html.dark) .card--editorial:hover {
		transform: none;
		box-shadow: none;
	}

	.card--editorial .card-body {
		padding: var(--space-md) 0 0 0;
	}

	.card--editorial .card-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-tight);
		letter-spacing: var(--letter-spacing-tight);
		margin-bottom: var(--space-sm);
	}

	.card--editorial .card-subtitle {
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-bottom: var(--space-sm);
	}

	.card--editorial .card-description {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		max-width: 65ch;
	}

	@media (--md) {
		.card--editorial .card-title {
			font-size: var(--font-size-3xl);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card--editorial,
		.card--editorial:hover {
			transition: none;
			transform: none;
		}
	}
</style>
