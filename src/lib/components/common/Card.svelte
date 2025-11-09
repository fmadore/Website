<script>
	import { base } from '$app/paths';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	let {
		imageUrl = undefined,
		imageAlt: _imageAltProp = '', // Renamed to avoid conflict with the derived value
		linkUrl = undefined,
		target = '_blank', // Default to opening external links in new tab
		title = '',
		animationDelay = 0, // Animation delay in milliseconds
		// Snippet props
		subtitle = undefined,
		details = undefined,
		action = undefined,
		children = undefined // For the default slot content
	} = $props();

	// Set default imageAlt if not provided, using $derived for Svelte 5
	let imageAlt = $derived(_imageAltProp || title);
</script>

<div
	class="card"
	use:scrollAnimate={{
		delay: animationDelay,
		animationClass: 'fade-in-up',
		threshold: 0.2,
		rootMargin: '100px'
	}}
>
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
		transition: all var(--transition-duration-200) var(--anim-ease-base);
		position: relative;

		/* Glassmorphism styling consistent with the rest of the website */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-medium));
		box-shadow:
			0 var(--spacing-2) var(--spacing-8) 0 rgba(var(--color-primary-rgb), var(--opacity-medium)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium-high));
	}

	.card:hover {
		transform: var(--transform-lift-sm);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-medium-high));
		box-shadow:
			0 var(--spacing-3) var(--spacing-10) 0 rgba(var(--color-primary-rgb), var(--opacity-medium-high)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-high));
	}

	.card-image {
		overflow: hidden;
		aspect-ratio: 3/2; /* Consistent aspect ratio for card images */
		background-color: var(--color-gray-100, #f3f4f6); /* Use gray variable */
		flex-shrink: 0;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-duration-200) var(--anim-ease-base);
	}

	.card:hover .card-image img {
		transform: scale(1.05);
	}

	.card-body {
		padding: var(--spacing-6); /* Use variable */
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: var(--font-size-xl);
		margin-top: 0;
		margin-bottom: var(--spacing-1);
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
		margin-bottom: var(--spacing-3);
		line-height: var(--line-height-normal);
	}

	.card-description {
		margin-bottom: var(--spacing-4);
		flex-grow: 1;
		line-height: var(--line-height-relaxed);
	}

	.card-details {
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-3);
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
		transition: color var(--transition-duration-200) var(--anim-ease-base);
	}

	.card-action :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* Dark mode glassmorphism overrides */
	:global(html.dark) .card {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
		box-shadow:
			0 var(--spacing-2) var(--spacing-8) 0 rgba(var(--color-black-rgb), var(--opacity-medium-high)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-low));
	}

	:global(html.dark) .card:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-medium));
		box-shadow:
			0 var(--spacing-3) var(--spacing-10) 0 rgba(var(--color-black-rgb), var(--opacity-high)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium));
	}

	/* Fallback for browsers that don't support backdrop-filter */
	@supports not (backdrop-filter: blur(var(--glass-blur-amount))) {
		.card {
			background: rgba(var(--color-white-rgb), var(--opacity-90));
		}

		:global(html.dark) .card {
			background: rgba(var(--color-black-rgb), var(--opacity-80));
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
