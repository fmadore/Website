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
	<h2 class="cv-subtitle">{author.fullName} — {author.position}</h2>
</header>

<!-- Contact Info Section -->
<section class="text-sm text-light cv-contact-section mb-8">
	<!-- Address -->
	<div class="cv-contact-group">
		<Icon icon="mdi:map-marker" class="text-light shrink-0" width="20" height="20" />
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
				<Icon icon={link.icon} class="text-light shrink-0" width="20" height="20" />
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
				<a href={link.url} target="_blank" rel="noopener noreferrer">{link.displayUrl}</a>
			</div>
		{/each}
	</div>
</section>

<style>
	/*
	 * Editorial title block — the CV masthead, matching every other index
	 * page: an accent mono dateline, the page name "Curriculum Vitae" in the
	 * Archivo display voice, and the subject as a serif-italic standfirst.
	 */
	.cv-header {
		margin-bottom: var(--space-6);
	}

	/* Dateline — DATA voice: accent mono eyebrow above the title. */
	.cv-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.16em;
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
		letter-spacing: -0.015em;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-3);
	}

	/* Subject — the serif-italic standfirst. */
	.cv-subtitle {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-normal);
		line-height: var(--line-height-snug);
		color: var(--color-text-soft);
		max-width: 60ch;
		margin: 0;
	}

	/* Contact section layout — closes the title block with a hairline rule,
	 * mirroring the page-header convention used across the site. */
	.cv-contact-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding-bottom: var(--space-6);
		border-bottom: var(--border-width-thin) solid var(--color-border);
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
