<script>
	let {
		imageUrl = undefined,
		imageAlt: _imageAltProp = '', // Renamed to avoid conflict with the derived value
		linkUrl = undefined,
		target = '_blank', // Default to opening external links in new tab
		title = '',
		// Snippet props
		subtitle = undefined,
		details = undefined,
		action = undefined,
		children = undefined // For the default slot content
	} = $props();

	// Set default imageAlt if not provided, using $derived for Svelte 5
	let imageAlt = $derived(_imageAltProp || title);
</script>

<div class="card scroll-reveal-scale">
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
		color: var(--color-primary);
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

	/* Dark mode overrides */
	:global(html.dark) .card {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, var(--color-background)) 0%,
			color-mix(in srgb, var(--color-accent) 4%, var(--color-background)) 100%
		);
		border-color: var(--color-border);
		box-shadow: var(--shadow);
	}

	:global(html.dark) .card:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, var(--color-background)) 0%,
			color-mix(in srgb, var(--color-accent) 6%, var(--color-background)) 100%
		);
		border-color: var(--color-border-dark);
		box-shadow: var(--shadow-md);
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
</style>
