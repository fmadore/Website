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

<h1 class="text-3xl font-bold cv-main-title">Curriculum Vitae</h1>
<h2 class="text-xl font-semibold mb-1 cv-subtitle text-primary">Frédérick Madore, PhD</h2>
<p class="text-sm text-muted mb-4 cv-date">{today}</p>

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
		{#each cvLinks as link}
			<div class="cv-link-item">
				<Icon icon={link.icon} class="text-light shrink-0" width="20" height="20" />
				<a href={link.url} target="_blank" rel="noopener noreferrer">{link.displayUrl}</a>
			</div>
		{/each}
	</div>
</section>

<style>
	.cv-main-title,
	.cv-subtitle,
	.cv-date {
		text-align: center;
	}

	.cv-main-title {
		margin-bottom: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: var(--border-width-medium) solid var(--color-primary);
	}

	/* Contact section layout */
	.cv-contact-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
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
