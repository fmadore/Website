<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { author, socialLinks } from '$lib/data/siteConfig';

	// Profile icon links - subset of social links for banner
	const profileIconLinks = [
		socialLinks.email,
		socialLinks.googleScholar,
		socialLinks.github,
		socialLinks.linkedIn,
		socialLinks.orcid
	];
</script>

<div class="profile-header glass-panel scroll-reveal" role="banner">
	<div class="profile-photo-container">
		<div class="profile-photo">
			<img
				src="{base}/images/Profile-picture.webp"
				alt="Frédérick Madore"
				class="rounded-full"
				width="180"
				height="180"
				loading="eager"
				decoding="async"
				fetchpriority="high"
			/>
		</div>
	</div>
	<div class="profile-content">
		<div class="profile-title">
			<h1>About</h1>
			<div class="title-accent"></div>
		</div>
		<div class="subtitle">{author.position}</div>
		<div class="profile-icons">
			{#each profileIconLinks as link}
				<a
					href={link.url}
					target="_blank"
					rel="noopener"
					aria-label={link.name}
					class="icon-link"
				>
					<Icon icon={link.icon} width="24" height="24" />
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.profile-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
		padding: var(--space-lg) var(--space-md);
		position: relative;
		/* Glass panel handles base styling - add subtle warm gradient overlay */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, var(--color-background)) 0%,
			color-mix(in srgb, var(--color-accent) 4%, var(--color-background)) 100%
		);
	}

	.profile-photo-container {
		position: relative;
	}

	.profile-photo-container::before {
		content: '';
		position: absolute;
		top: calc(-2 * var(--space-2xs));
		left: calc(-2 * var(--space-2xs));
		right: calc(-2 * var(--space-2xs));
		bottom: calc(-2 * var(--space-2xs));
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium-high) * 100%), transparent)
				0%,
			color-mix(
					in srgb,
					var(--color-highlight) calc(var(--opacity-medium-high) * 100%),
					transparent
				)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-medium-high) * 100%), transparent)
				100%
		);
		border-radius: var(--border-radius-full);
		z-index: -1;
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--transition-ease-out);
	}

	.profile-photo {
		margin: 0;
		width: var(--space-32); /* ~128px (close to 120px) */
		height: var(--space-32);
		flex-shrink: 0;
		position: relative;
		z-index: 1;
	}

	.profile-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--border-radius-full);
		box-shadow: var(--shadow-lg);
		border: var(--border-width-thick) solid var(--color-primary);
		position: relative;
		z-index: 2;
	}

	.profile-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		min-height: auto;
	}

	.profile-title {
		position: relative;
		margin-bottom: var(--space-sm);
	}

	.profile-title h1 {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-extrabold);
		margin: 0;
		color: var(--color-primary);
		line-height: var(--line-height-tight);
		letter-spacing: var(--tracking-heading);
	}

	.title-accent {
		width: var(--space-xl-tight);
		height: var(--border-width-thick);
		background: linear-gradient(90deg, var(--color-highlight) 0%, var(--color-accent) 100%);
		border-radius: var(--border-radius-sm);
		margin-top: var(--space-xs);
		margin-left: auto;
		margin-right: auto;
	}

	.subtitle {
		font-size: var(--font-size-base);
		color: var(--color-text-light);
		margin-bottom: var(--space-md);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-snug);
	}

	.profile-icons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		margin: 0;
	}

	.icon-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--space-xl-tight) + var(--space-2xs));
		height: calc(var(--space-xl-tight) + var(--space-2xs));
		color: var(--color-text-light);
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-primary) 20%, transparent);
		border-radius: var(--border-radius-lg);
		transition: all var(--duration-moderate) var(--transition-ease-in-out);
		position: relative;
		overflow: hidden;
	}

	.icon-link::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-medium) * 100%), transparent) 50%,
			transparent 100%
		);
		transition: left var(--duration-moderate) var(--transition-ease-out);
	}

	.icon-link:hover {
		color: var(--color-highlight);
		transform: var(--transform-lift-sm);
	}

	.icon-link:hover::before {
		left: 100%;
	}

	.rounded-full {
		border-radius: var(--border-radius-full);
	}

	/* Header icons – unified sizing */
	.profile-icons :global(svg) {
		width: var(--space-6) !important;
		height: var(--space-6) !important;
		z-index: 1;
		position: relative;
	}

	/* Focus-visible accessibility rings */
	.profile-photo:focus-visible img {
		outline: var(--border-width-thick) solid var(--color-highlight);
		outline-offset: var(--space-2xs);
	}

	.icon-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-2xs);
		box-shadow: 0 0 0 var(--border-width-thick)
			color-mix(
				in srgb,
				var(--color-highlight) calc(var(--opacity-medium-high) * 100%),
				transparent
			);
	}

	/* Desktop responsive design */
	@media (--sm) {
		.profile-header {
			flex-direction: row;
			align-items: center;
			text-align: left;
			gap: var(--space-xl);
			margin-bottom: var(--space-xl);
			padding: var(--space-xl-tight) var(--space-xl);
		}

		.profile-photo-container::before {
			top: calc(-1 * var(--space-xs));
			left: calc(-1 * var(--space-xs));
			right: calc(-1 * var(--space-xs));
			bottom: calc(-1 * var(--space-xs));
		}

		.profile-photo {
			width: var(--space-48); /* ~192px (close to 180px) */
			height: var(--space-48);
		}

		.profile-content {
			align-items: flex-start;
			min-height: 180px;
		}

		.profile-title h1 {
			font-size: var(--font-size-4xl);
		}

		.title-accent {
			width: var(--space-3xl);
			margin-left: 0;
			margin-right: 0;
		}

		.subtitle {
			font-size: var(--font-size-xl);
			margin-bottom: var(--space-lg);
			line-height: var(--line-height-relaxed);
		}

		.profile-icons {
			justify-content: flex-start;
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: no-preference) {
		.profile-photo img {
			transition:
				transform var(--duration-moderate) var(--transition-ease-out),
				box-shadow var(--duration-moderate) var(--transition-ease-out);
		}

		.profile-photo-container:hover::before {
			opacity: 1;
		}

		.profile-photo:hover img,
		.profile-photo:focus-within img,
		.profile-photo:focus-visible img {
			transform: scale(1.02);
			box-shadow: var(--shadow-xl);
		}

		.profile-icons :global(svg) {
			transition: transform var(--duration-normal) var(--transition-ease-out);
		}

		.icon-link:hover :global(svg),
		.icon-link:focus :global(svg),
		.icon-link:focus-visible :global(svg) {
			transform: scale(1.1);
		}

		.title-accent {
			transition: width var(--duration-moderate) var(--transition-ease-out);
		}

		.profile-title:hover .title-accent {
			width: var(--space-4xl);
		}
	}
</style>
