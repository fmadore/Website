<script lang="ts">
	import Icon from '@iconify/svelte';
	import { address, contact, website, socialLinks, author } from '$lib/data/siteConfig';

	// Get current date formatted as "Day Month Year"
	const today = new Date().toLocaleDateString('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// CV contact links configuration
	const cvLinks = [
		{ ...socialLinks.email, displayUrl: contact.email },
		{ name: 'Website', icon: 'mdi:web', url: website.url, displayUrl: website.domain },
		{ ...socialLinks.linkedIn, displayUrl: 'LinkedIn' },
		{ ...socialLinks.github, displayUrl: 'GitHub' },
		{ ...socialLinks.orcid, displayUrl: 'ORCID' }
	];
</script>

<header class="cv-header">
	<p class="cv-date">As of {today}</p>
	<h1 class="cv-main-title">Curriculum Vitae</h1>
	<!-- A colon, not an em dash: the Punctuation Rule bars em dashes from
	     interface copy, and the position string already carries commas of its
	     own, which an en dash would sit badly among. -->
	<h2 class="cv-subtitle">{author.fullName}: {author.position}</h2>
</header>

<!-- Contact Info Section -->
<section class="cv-contact-section mb-8">
	<!-- Address -->
	<div class="cv-contact-group">
		<Icon icon="mdi:map-marker" class="text-light shrink-0" width="16" height="16" />
		<div>
			{address.institution}<br />
			{#if address.department}
				{address.department}<br />
			{/if}
			{#if address.street}
				{address.street}, {address.postalCode} {address.city}<br />
			{:else}
				{address.postalCode} {address.city}<br />
			{/if}
			{#if address.room}
				{address.room}
			{/if}
		</div>
	</div>
	<!-- Links -->
	<div class="cv-links-group">
		{#each cvLinks as link (link.url)}
			<div class="cv-link-item">
				<Icon icon={link.icon} class="text-light shrink-0" width="16" height="16" />
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
				<a href={link.url} target="_blank" rel="noopener noreferrer"
					>{link.displayUrl}<span class="sr-only"> (opens in new tab)</span></a
				>
			</div>
		{/each}
	</div>
</section>

<style>
	/*
	 * Editorial title block — the CV masthead, matching every other index
	 * page: an accent mono dateline, the page name "Curriculum Vitae" in the
	 * Archivo display voice, and the subject as a serif-italic standfirst.
	 *
	 * The 4px rule is the masthead tier. Without it the sheet's own title was
	 * the least-ruled thing on a page whose seventeen sections each open with
	 * a 3px rule — hierarchy inverted. Now the sheet reads 4px masthead →
	 * 3px section → 1px entry, top to bottom.
	 */
	.cv-header {
		border-top: var(--rule-masthead) solid var(--color-primary);
		padding-top: var(--rule-gap);
		margin-bottom: var(--space-6);
	}

	/* Dateline — DATA voice: accent mono eyebrow above the title. */
	.cv-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--color-accent);
		margin: 0 0 var(--space-3);
	}

	/* Page title — DOCUMENT voice: Archivo display, the page's largest type. */
	.cv-main-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-size: var(--font-size-4xl);
		font-weight: 830;
		line-height: 1;
		letter-spacing: var(--tracking-display);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-3);
	}

	/* One step down on a phone. "Curriculum" is the longest single word any
	 * masthead on the site sets, and at the desktop step it is wider than the
	 * sheet's own measure at 375, so `overflow-wrap: break-word` — the reset
	 * that keeps a long URL from tearing the layout open — did the only thing
	 * it can and broke it as `Curriculu / m Vitae`. The largest step on the
	 * scale that fits the word at 375 within the page's own gutters is the one
	 * below, so the title breaks between its two words, where a title should. */
	@media (--sm-down) {
		.cv-main-title {
			font-size: var(--font-size-3xl);
		}
	}

	/* Subject — the serif-italic standfirst. */
	.cv-subtitle {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-normal);
		line-height: var(--line-height-snug);
		color: var(--color-text-soft);
		max-width: var(--measure-standfirst);
		margin: 0;
	}

	/* Contact section — the letterhead's apparatus, and therefore the DATA
	 * voice: an institutional address and a set of handles are the plainest
	 * database columns on the site, and `.dh-links` already sets project
	 * addresses this way further down the same page. It was serif, which is
	 * the one error the Two Voices Rule calls unforgivable.
	 *
	 * Closed by a rule, so it takes the hairline pair — it had the box-edge
	 * pair, one step too dark, which is the silent crossing the pairing rule
	 * exists to catch. */
	.cv-contact-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding-bottom: var(--space-6);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-light);
	}

	.cv-contact-group {
		display: flex;
		align-items: start;
		gap: var(--space-2);
	}

	.cv-links-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.cv-link-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	/* Each address in the stack is a 24px-tall target (WCAG 2.5.8): the xs
	 * mono line is 19px on its own, and four of them at a 4px gap sat closer
	 * than a fingertip. Height only — the row stays a single line. */
	.cv-link-item a {
		display: inline-flex;
		align-items: center;
		min-height: var(--space-6);
	}

	/* Desktop layout - side by side */
	@media (--md) {
		.cv-contact-section {
			flex-direction: row;
			justify-content: space-between;
			align-items: start;
			gap: var(--space-6);
		}

		.cv-links-group {
			align-items: end;
		}

		.cv-link-item {
			flex-direction: row-reverse;
		}
	}
</style>
