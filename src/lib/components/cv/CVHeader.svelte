<script lang="ts">
	import Icon from '@iconify/svelte';
	import { address, contact, website, socialLinks } from '$lib/data/siteConfig';

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
	<h1 class="cv-main-title">Curriculum Vitae</h1>
	<h2 class="cv-subtitle">Frédérick Madore, PhD</h2>
	<p class="cv-date">{today}</p>
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
	 * Editorial title block — left-aligned, like the title page of a printed
	 * CV rather than a centered banner. The h1 "Curriculum Vitae" is the
	 * document *label*, so it renders as a quiet letterspaced eyebrow; the
	 * subject (the name, h2) carries the display type. Heading levels stay
	 * h1 → h2 → h3 for assistive tech; only the visual weight is inverted.
	 */
	.cv-header {
		margin-bottom: var(--space-6);
	}

	.cv-main-title {
		font-family: var(--font-family-sans);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--color-primary);
		margin: 0 0 var(--space-3);
	}

	.cv-subtitle {
		font-family: var(--font-family-display);
		font-optical-sizing: auto;
		font-variation-settings: var(--font-variation-display-md);
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-heading);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-2);
	}

	.cv-date {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
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
