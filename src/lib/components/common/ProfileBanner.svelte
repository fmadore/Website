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

<header class="profile-header scroll-reveal">
	<div class="profile-photo">
		<img
			src="{base}/images/Profile-picture.webp"
			alt="Frédérick Madore"
			width="180"
			height="180"
			loading="eager"
			decoding="async"
			fetchpriority="high"
		/>
	</div>
	<div class="profile-content">
		<h1 class="profile-name">{author.fullName}</h1>
		<p class="profile-position">{author.position}</p>
		<nav class="profile-icons" aria-label="Profile links">
			{#each profileIconLinks as link (link.name)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
				<a href={link.url} target="_blank" rel="noopener" aria-label={link.name} class="icon-link">
					<Icon icon={link.icon} width="22" height="22" />
				</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	/*
	 * Editorial banner: stacked on narrow viewports, asymmetric row on
	 * desktop. No gradient overlays, no photo-aura, no decorative accent
	 * bar. The name carries the page as h1 in Spectral; the position
	 * subtitle reads as quiet metadata; icons are flat round buttons with
	 * a quiet hover wash.
	 */
	.profile-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
		padding: var(--space-xl) 0 var(--space-lg);
	}

	.profile-photo {
		width: clamp(7.5rem, 28vw, 10rem);
		aspect-ratio: 1;
		flex-shrink: 0;
	}

	.profile-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--border-radius-full);
		box-shadow: var(--shadow-md);
		border: var(--border-width-thin) solid var(--color-border-dark);
	}

	.profile-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	.profile-name {
		margin: 0 0 var(--space-2xs);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-4xl);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-tight);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-emphasis);
	}

	.profile-position {
		margin: 0 0 var(--space-lg);
		max-width: 44ch;
		color: var(--color-text-soft);
		font-size: var(--font-size-base);
		line-height: var(--line-height-snug);
	}

	.profile-icons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-2xs);
	}

	.icon-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-10);
		height: var(--space-10);
		color: var(--color-text-soft);
		background: transparent;
		border-radius: var(--border-radius-full);
		transition:
			color var(--duration-moderate) var(--ease-out),
			background var(--duration-moderate) var(--ease-out),
			transform var(--duration-moderate) var(--ease-out);
	}

	.icon-link:hover,
	.icon-link:focus-visible {
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 8%, transparent);
		transform: var(--transform-lift-sm);
	}

	.icon-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-2xs);
	}

	/*
	 * Desktop: photo sits left, typography stack flows right. Kept
	 * asymmetric (left-aligned on desktop) to feel written, not laid out.
	 */
	@media (--sm) {
		.profile-header {
			flex-direction: row;
			align-items: center;
			text-align: left;
			gap: var(--space-2xl);
			padding: var(--space-2xl) 0 var(--space-xl);
			margin-bottom: var(--space-2xl);
		}

		.profile-photo {
			width: clamp(10rem, 18vw, 12rem);
		}

		.profile-content {
			align-items: flex-start;
		}

		.profile-name {
			font-size: var(--font-size-5xl);
		}

		.profile-position {
			font-size: var(--font-size-lg);
			margin-bottom: var(--space-lg);
		}

		.profile-icons {
			justify-content: flex-start;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.profile-photo img {
			transition:
				transform var(--duration-moderate) var(--ease-out),
				box-shadow var(--duration-moderate) var(--ease-out);
		}

		.profile-photo:hover img,
		.profile-photo:focus-within img {
			transform: scale(1.015);
			box-shadow: var(--shadow-lg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.icon-link,
		.icon-link:hover,
		.icon-link:focus-visible {
			transition: none;
			transform: none;
		}
	}
</style>
