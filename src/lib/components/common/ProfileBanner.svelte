<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
</script>

<div class="profile-header glass-panel scroll-reveal">
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
		<div class="subtitle">
			Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)
		</div>
		<div class="profile-icons">
			<a
				href="mailto:frederick.madore@zmo.de"
				target="_blank"
				rel="noopener"
				aria-label="Email"
				class="icon-link glass-button"
			>
				<Icon icon="mdi:email" width="24" height="24" />
			</a>
			<a
				href="https://scholar.google.com/citations?user=naUK0RQAAAAJ"
				target="_blank"
				rel="noopener"
				aria-label="Google Scholar"
				class="icon-link glass-button"
			>
				<Icon icon="academicons:google-scholar" width="24" height="24" />
			</a>
			<a
				href="https://github.com/fmadore"
				target="_blank"
				rel="noopener"
				aria-label="GitHub"
				class="icon-link glass-button"
			>
				<Icon icon="mdi:github" width="24" height="24" />
			</a>
			<a
				href="https://www.linkedin.com/in/frederickmadore"
				target="_blank"
				rel="noopener"
				aria-label="LinkedIn"
				class="icon-link glass-button"
			>
				<Icon icon="mdi:linkedin" width="24" height="24" />
			</a>
			<a
				href="https://orcid.org/0000-0003-0959-2092"
				target="_blank"
				rel="noopener"
				aria-label="ORCID"
				class="icon-link glass-button"
			>
				<Icon icon="simple-icons:orcid" width="24" height="24" />
			</a>
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
		/* Enhanced glassmorphism with subtle gradient overlay */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
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
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-medium-high)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-medium-high)) 100%
		);
		border-radius: var(--border-radius-full);
		z-index: -1;
		opacity: 0;
		transition: opacity var(--transition-duration-300) var(--transition-ease-out);
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
		/* Remove custom background - glass-button utility handles this */
		border: none;
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-duration-300) var(--transition-ease-in-out);
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
			rgba(var(--color-highlight-rgb), var(--opacity-medium)) 50%,
			transparent 100%
		);
		transition: left var(--transition-duration-300) var(--transition-ease-out);
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
		width: 24px !important;
		height: 24px !important;
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
			rgba(var(--color-highlight-rgb), var(--opacity-medium-high));
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
				transform var(--transition-duration-300) var(--transition-ease-out),
				box-shadow var(--transition-duration-300) var(--transition-ease-out);
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
			transition: transform var(--transition-duration-200) var(--transition-ease-out);
		}

		.icon-link:hover :global(svg),
		.icon-link:focus :global(svg),
		.icon-link:focus-visible :global(svg) {
			transform: scale(1.1);
		}

		.title-accent {
			transition: width var(--transition-duration-300) var(--transition-ease-out);
		}

		.profile-title:hover .title-accent {
			width: var(--space-4xl);
		}
	}
</style>
