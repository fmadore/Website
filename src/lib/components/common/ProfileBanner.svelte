<script lang="ts">
	import { author, website } from '$lib/data/siteConfig';

	// Display the site domain as a quiet mono dateline.
	const siteLabel = website.domain.toUpperCase();
</script>

<header class="nameplate-hero page-enter">
	<div class="hero-topbar">
		<span class="hero-url">{siteLabel}</span>
		<span class="hero-kicker">Historian &amp; Digital Humanist</span>
	</div>
	<h1 class="nameplate">{author.fullName}</h1>
	<p class="hero-standfirst">{author.tagline}</p>
</header>

<style>
	/*
	 * Nameplate hero — the home masthead. A giant Archivo nameplate over a
	 * serif-italic standfirst, opened by a slim mono dateline and closed by a
	 * heavy ink rule. This is the site's loudest typographic moment; it sets
	 * the whole register (the press nameplate, the apparatus below it).
	 */
	.nameplate-hero {
		margin-bottom: var(--space-2xl);
	}

	/* Slim dateline strip — site URL left, role kicker right. */
	.hero-topbar {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-4);
		padding-bottom: var(--space-3);
		margin-bottom: var(--space-5);
		border-bottom: var(--rule-hairline) solid var(--color-border);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.hero-kicker {
		color: var(--color-accent);
		text-align: right;
	}

	.nameplate {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-nameplate);
		font-weight: 850;
		font-size: var(--font-size-nameplate);
		line-height: 0.88;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-4);
		text-wrap: balance;
	}

	.hero-standfirst {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-lead);
		line-height: var(--line-height-snug);
		color: var(--color-text-soft);
		max-width: 60ch;
		margin: 0 0 var(--space-5);
	}

	/* The heavy nameplate rule closing the hero. */
	.nameplate-hero::after {
		content: '';
		display: block;
		border-top: var(--rule-nameplate) solid var(--color-primary);
	}

	@media (--sm-down) {
		.hero-kicker {
			display: none;
		}
	}
</style>
