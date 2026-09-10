<script lang="ts">
	import { author, website } from '$lib/data/siteConfig';

	// Display the site domain as a quiet mono dateline. The `www.` is dropped:
	// a masthead dateline names the publication, and the subdomain is transport.
	const siteLabel = website.domain.replace(/^www\./, '').toUpperCase();
</script>

<header class="nameplate-hero">
	<div class="hero-topbar">
		<span class="hero-url">{siteLabel}</span>
		<span class="hero-kicker">{author.kicker}</span>
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
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-2) var(--space-4);
		padding-bottom: var(--space-3);
		margin-bottom: var(--space-5);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	/* The role line is ink, not pine. Pine marks what is *current*; a standing
	 * description of the person is the most permanent string on the page, and
	 * spending the accent on it left the masthead's one accent meaning nothing.
	 * The first pine a reader meets is now on the newest record in the rail. */
	.hero-kicker {
		color: var(--color-text-emphasis);
		text-align: right;
	}

	.nameplate {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-nameplate);
		font-weight: 850;
		font-size: var(--font-size-nameplate);
		line-height: 0.88;
		letter-spacing: var(--tracking-display-lg);
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
		max-width: var(--measure-standfirst);
		margin: 0 0 var(--space-5);
	}

	/* The heavy nameplate rule closing the hero. */
	.nameplate-hero::after {
		content: '';
		display: block;
		border-top: var(--rule-nameplate) solid var(--color-primary);
	}

	/* Narrow viewports wrap the dateline rather than dropping the kicker. It was
	 * `display: none` here, which took the one line that says what this person
	 * *is* off the very viewport where the standfirst below runs to five lines
	 * and the masthead has to do its work fastest. */
	@media (--sm-down) {
		.hero-kicker {
			text-align: left;
		}
	}
</style>
