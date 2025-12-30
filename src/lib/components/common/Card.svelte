<script>
	import { base } from '$app/paths';

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
				<a
					href={linkUrl.startsWith('/') ? `${base}${linkUrl}` : linkUrl}
					{target}
					rel="noopener noreferrer"
				>
					<img
						src={imageUrl}
						alt={imageAlt}
						width="300"
						height="200"
						loading="lazy"
						decoding="async"
					/>
				</a>
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
				<a
					href={linkUrl.startsWith('/') ? `${base}${linkUrl}` : linkUrl}
					{target}
					rel="noopener noreferrer"
				>
					{title}
				</a>
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
		height: 100%; /* Make cards in a grid have the same height */
		border-radius: var(--border-radius-lg);
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		position: relative;

		/* Glassmorphism styling consistent with the rest of the website */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
		box-shadow:
			0 var(--space-xs) var(--space-xl) 0
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium) * 100%), transparent),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium-high) * 100%), transparent);
	}

	.card:hover {
		transform: var(--transform-lift-sm);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		box-shadow:
			0 var(--space-sm) var(--space-xl-tight) 0
				color-mix(
					in srgb,
					var(--color-primary) calc(var(--opacity-medium-high) * 100%),
					transparent
				),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-high) * 100%), transparent);
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
		transition: transform var(--anim-duration-fast) var(--anim-ease-base);
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
		color: inherit; /* Inherit color from h2 */
		text-decoration: none;
	}

	.card-title a:hover {
		text-decoration: underline;
	}

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
		transition: color var(--anim-duration-fast) var(--anim-ease-base);
	}

	.card-action :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* Dark mode glassmorphism overrides */
	:global(html.dark) .card {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
		box-shadow:
			0 var(--space-xs) var(--space-xl) 0
				color-mix(in srgb, var(--color-black) calc(var(--opacity-medium-high) * 100%), transparent),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
	}

	:global(html.dark) .card:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-low) * 100%), transparent) 50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium) * 100%),
			transparent
		);
		box-shadow:
			0 var(--space-sm) var(--space-xl-tight) 0
				color-mix(in srgb, var(--color-black) calc(var(--opacity-high) * 100%), transparent),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
	}

	/* Fallback for browsers that don't support backdrop-filter */
	@supports not (backdrop-filter: blur(var(--glass-blur-amount))) {
		.card {
			background: color-mix(in srgb, var(--color-white) 90%, transparent);
		}

		:global(html.dark) .card {
			background: color-mix(in srgb, var(--color-black) 80%, transparent);
		}
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
