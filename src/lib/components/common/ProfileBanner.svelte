<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';
</script>

<div class="profile-header enhanced-header">
	<div class="profile-photo">
		<img
			src="{base}/images/Profile-picture.webp"
			alt="Frédérick Madore"
			class="rounded-full"
			width="180"
			height="180"
		/>
	</div>
	<div class="profile-title">
		<h1>About</h1>
		<div class="subtitle">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</div>
		<div class="profile-icons">
			<a href="mailto:frederick.madore@zmo.de" target="_blank" rel="noopener" aria-label="Email">
				<Icon icon="mdi:email" width="26" height="26" />
			</a>
			<a
				href="https://scholar.google.com/citations?user=naUK0RQAAAAJ"
				target="_blank"
				rel="noopener"
				aria-label="Google Scholar"
			>
				<Icon icon="academicons:google-scholar" width="26" height="26" />
			</a>
			<a href="https://github.com/fmadore" target="_blank" rel="noopener" aria-label="GitHub">
				<Icon icon="mdi:github" width="26" height="26" />
			</a>
			<a
				href="https://www.linkedin.com/in/frederickmadore"
				target="_blank"
				rel="noopener"
				aria-label="LinkedIn"
			>
				<Icon icon="mdi:linkedin" width="26" height="26" />
			</a>
			<a
				href="https://orcid.org/0000-0003-0959-2092"
				target="_blank"
				rel="noopener"
				aria-label="ORCID"
			>
				<Icon icon="simple-icons:orcid" width="26" height="26" />
			</a>
		</div>
	</div>
</div>

<style>
	.profile-header {
		display: flex;
		align-items: center; /* Vertically center text block and photo */
		gap: var(--spacing-6);
		margin-bottom: var(--spacing-8);
		padding-bottom: var(--spacing-6);
		border-bottom: 1px solid var(--color-border);
	}

	.profile-photo {
		margin: 0;
		width: 180px;
		height: 180px;
		flex-shrink: 0;
	}

	.profile-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		box-shadow: var(--shadow-md);
		border: 4px solid var(--color-primary);
	}

	.profile-title {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
	}

	.profile-title h1 {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		margin: 0;
		color: var(--color-primary);
	}

	.subtitle {
		font-size: var(--font-size-lg);
		color: var(--color-secondary);
		margin-top: var(--spacing-2);
	}

	.profile-icons {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--spacing-3);
		margin: 0;
		margin-top: var(--spacing-4); /* Space above icons */
	}

	.profile-icons a {
		color: var(--color-secondary);
		transition: color 0.2s ease;
	}

	.profile-icons a:hover {
		color: var(--color-highlight); /* Use CSS variable for better cohesion */
	}

	.enhanced-header {
		background: radial-gradient(
			circle at 30% 30%,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			var(--color-surface) 60%,
			var(--color-background) 100%
		);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		padding: var(--spacing-8) var(--spacing-6);
	}

	.rounded-full {
		border-radius: 9999px;
	}

	/* Header icons – unified sizing & interactive hover */
	.profile-icons :global(svg) {
		width: 26px !important;
		height: 26px !important;
	}

	/* Focus-visible accessibility rings */
	.profile-photo:focus-visible img {
		outline: 3px solid var(--color-highlight);
		outline-offset: 2px;
	}

	.profile-icons a:focus-visible {
		outline: 2px solid var(--color-highlight);
		outline-offset: 3px;
	}

	/* Mobile responsive design */
	@media (max-width: 640px) {
		.profile-header {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: var(--spacing-4);
		}

		.profile-photo {
			margin-bottom: var(--spacing-4);
		}

		.profile-title {
			align-items: center;
		}

		.profile-icons {
			justify-content: center;
			margin-bottom: var(--spacing-3);
		}
	}

	/* Dark mode overrides - Fixed with proper :global() syntax */
	:global(html.dark) .enhanced-header {
		background: radial-gradient(
			circle at 30% 30%,
			rgba(var(--color-primary-rgb), 0.15) 0%,
			var(--color-dark-surface-alt) 60%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: var(--color-border);
		box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.7);
	}

	:global(html.dark) .profile-photo img {
		box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.7);
		border-color: var(--color-primary);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: no-preference) {
		.profile-photo img {
			transition:
				transform 0.3s ease,
				box-shadow 0.3s ease;
		}

		.profile-photo:hover img,
		.profile-photo:focus-within img,
		.profile-photo:focus-visible img {
			transform: scale(1.05);
			box-shadow: var(--shadow-lg);
		}

		.profile-icons :global(svg) {
			transition:
				transform 0.2s ease,
				color 0.2s ease;
		}

		.profile-icons a:hover :global(svg),
		.profile-icons a:focus :global(svg),
		.profile-icons a:focus-visible :global(svg) {
			transform: scale(1.15);
		}
	}
</style>
