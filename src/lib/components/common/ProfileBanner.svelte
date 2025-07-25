<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';
</script>

<div class="profile-header glass-panel" use:scrollAnimate={{ delay: DELAY_STEP * 1, animationClass: 'fade-in-up' }}>
	<div class="profile-photo-container" use:scrollAnimate={{ delay: DELAY_STEP * 3, animationClass: 'scale-in' }}>
		<div class="profile-photo">
			<img
				src="{base}/images/Profile-picture.webp"
				alt="Frédérick Madore"
				class="rounded-full"
				width="180"
				height="180"
				loading="eager"
				decoding="async"
			/>
		</div>
	</div>
	<div class="profile-content">
		<div class="profile-title" use:scrollAnimate={{ delay: DELAY_STEP * 4, animationClass: 'fade-in-up' }}>
			<h1>About</h1>
			<div class="title-accent"></div>
		</div>
		<div class="subtitle" use:scrollAnimate={{ delay: DELAY_STEP * 5, animationClass: 'fade-in-up' }}>Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</div>
		<div class="profile-icons" use:scrollAnimate={{ delay: DELAY_STEP * 6, animationClass: 'fade-in-up' }}>
			<a href="mailto:frederick.madore@zmo.de" target="_blank" rel="noopener" aria-label="Email" class="icon-link glass-button">
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
			<a href="https://github.com/fmadore" target="_blank" rel="noopener" aria-label="GitHub" class="icon-link glass-button">
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
		align-items: center;
		gap: var(--spacing-8);
		margin-bottom: var(--spacing-8);
		padding: var(--spacing-10) var(--spacing-8);
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
		top: calc(-1 * var(--spacing-2));
		left: calc(-1 * var(--spacing-2));
		right: calc(-1 * var(--spacing-2));
		bottom: calc(-1 * var(--spacing-2));
		background: linear-gradient(135deg, 
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
		width: 180px;
		height: 180px;
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
		height: 100%;
		min-height: 180px;
	}

	.profile-title {
		position: relative;
		margin-bottom: var(--spacing-3);
	}

	.profile-title h1 {
		font-size: var(--font-size-4xl);
		font-weight: var(--font-weight-extrabold);
		margin: 0;
		color: var(--color-primary);
		line-height: var(--line-height-tight);
		letter-spacing: var(--letter-spacing-tight);
	}

	.title-accent {
		width: var(--spacing-16);
		height: var(--border-width-thick);
		background: linear-gradient(90deg, 
			var(--color-highlight) 0%, 
			var(--color-accent) 100%
		);
		border-radius: var(--border-radius-sm);
		margin-top: var(--spacing-2);
	}

	.subtitle {
		font-size: var(--font-size-xl);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-6);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-relaxed);
	}

	.profile-icons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-2);
		margin: 0;
	}

	.icon-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--spacing-10) + var(--spacing-1));
		height: calc(var(--spacing-10) + var(--spacing-1));
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
		background: linear-gradient(90deg, 
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
		outline: 3px solid var(--color-highlight);
		outline-offset: var(--spacing-1);
	}

	.icon-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--spacing-1);
		box-shadow: 0 0 0 var(--border-width-thick) rgba(var(--color-highlight-rgb), var(--opacity-medium-high));
	}

	/* Mobile responsive design */
	@media (max-width: 640px) {
		.profile-header {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: var(--spacing-4);
			padding: var(--spacing-6) var(--spacing-4);
			margin-bottom: var(--spacing-4);
		}

		.profile-content {
			align-items: center;
			min-height: auto;
		}

		.profile-photo {
			width: 120px;
			height: 120px;
		}

		.profile-photo-container::before {
			top: calc(-1 * var(--spacing-1) - var(--spacing-1));
			left: calc(-1 * var(--spacing-1) - var(--spacing-1));
			right: calc(-1 * var(--spacing-1) - var(--spacing-1));
			bottom: calc(-1 * var(--spacing-1) - var(--spacing-1));
		}

		.profile-title h1 {
			font-size: var(--font-size-2xl);
		}

		.subtitle {
			font-size: var(--font-size-base);
			margin-bottom: var(--spacing-4);
			line-height: var(--line-height-snug);
		}

		.profile-icons {
			justify-content: center;
		}

		.title-accent {
			margin-left: auto;
			margin-right: auto;
			width: var(--spacing-10);
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
			width: var(--spacing-20);
		}
	}
</style>
