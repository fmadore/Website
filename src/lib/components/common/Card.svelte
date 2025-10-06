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
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;

		/* Glassmorphism styling consistent with the rest of the website */
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
			0 8px 32px 0 rgba(31, 38, 135, 0.37),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.card:hover {
		transform: var(--transform-lift-sm);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow:
			0 12px 40px 0 rgba(31, 38, 135, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
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
		transition: transform 0.3s ease;
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
		font-size: var(--font-size-xl); /* Use variable */
		margin-top: 0;
		margin-bottom: var(--spacing-1); /* Adjust spacing */
		line-height: 1.3;
		font-weight: 600;
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
		font-size: var(--font-size-sm); /* Use variable */
		color: var(--color-text-light, #666);
		margin-bottom: var(--spacing-3); /* Use variable */
		line-height: 1.5;
	}

	.card-description {
		margin-bottom: var(--spacing-4); /* Use variable */
		flex-grow: 1; /* Pushes action/details to bottom */
		line-height: 1.6;
	}

	.card-details {
		font-size: 0.9rem; /* Consider variable */
		margin-bottom: var(--spacing-3); /* Use variable */
		line-height: 1.5;
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
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.card-action :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* Dark mode glassmorphism overrides */
	:global(html.dark) .card {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow:
			0 8px 32px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .card:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow:
			0 12px 40px 0 rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	/* Fallback for browsers that don't support backdrop-filter */
	@supports not (backdrop-filter: blur(10px)) {
		.card {
			background: rgba(255, 255, 255, 0.9);
		}

		:global(html.dark) .card {
			background: rgba(0, 0, 0, 0.8);
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
