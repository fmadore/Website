<script lang="ts">
	import { base } from '$app/paths';
	import {
		Mail,
		Linkedin,
		Github,
		Info,
		Cloud,
		MessageSquare, // Mastodon substitute
		GraduationCap, // Google Scholar / Academia substitute
		Network, // ResearchGate substitute
		Library, // Knowledge Commons substitute
		Download // Added for button
	} from 'lucide-svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import SEO from '$lib/SEO.svelte';

	// Correct social media links (matching Footer)
	const socialLinks = [
		// Email is handled separately
		{ name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/frederickmadore/', description: 'Connect professionally' },
		{ name: 'GitHub', icon: 'github', url: 'https://github.com/fmadore', description: 'View code projects' },
		{ name: 'ORCID', icon: 'orcid', url: 'https://orcid.org/0000-0003-0959-2092', description: 'Academic identifier' },
		{ name: 'Bluesky', icon: 'bluesky', url: 'https://bsky.app/profile/fmadore.bsky.social', description: 'Follow on Bluesky' },
		{ name: 'Mastodon', icon: 'mastodon', url: 'https://hcommons.social/@fmadore', description: 'Follow on Mastodon' },
		{ name: 'Google Scholar', icon: 'google-scholar', url: 'https://scholar.google.com/citations?user=naUK0RQAAAAJ&', description: 'View publications' },
		{ name: 'ResearchGate', icon: 'researchgate', url: 'https://www.researchgate.net/profile/Frederick-Madore', description: 'Follow research updates' },
		{ name: 'Knowledge Commons', icon: 'commons', url: 'https://hcommons.org/members/fmadore/', description: 'Humanities Commons profile' },
		{ name: 'Academia.edu', icon: 'academia', url: 'https://zmo.academia.edu/FrederickMadore', description: 'Follow on Academia.edu' }
	];

	// Map icon names to Lucide components (matching Footer)
	const iconMap = {
		// email: Mail, // Not used in this list
		linkedin: Linkedin,
		github: Github,
		orcid: Info, // Substitute
		bluesky: Cloud, // Substitute
		mastodon: MessageSquare, // Substitute
		'google-scholar': GraduationCap, // Substitute
		researchgate: Network, // Substitute
		commons: Library, // Substitute
		academia: GraduationCap // Substitute
	};

	type IconKey = keyof typeof iconMap;

</script>

<SEO title="Contact | Frédérick Madore" />

<div class="container py-12">
	<PageHeader title="Contact" />

	<div class="contact-layout-grid">
		<div class="contact-section">
			<h2 class="contact-section-title">Contact Information</h2>
			<div class="contact-info space-y-4">
				<p>
					<strong>Email:</strong>
					<a href="mailto:frederick.madore@zmo.de">
						frederick.madore@zmo.de
					</a>
				</p>

				<!-- Business Card Download Button -->
				<a
					href="{base}/files/visitenkarte.pdf"
					class="btn btn-primary btn-icon mt-4"
					target="_blank" rel="noopener noreferrer"
					>
					<Download size={18} aria-hidden="true" />
					View Business Card
				</a>

				<div>
					<p class="contact-address mb-4">
						<strong>Institutional Address:</strong><br />
						Leibniz-Zentrum Moderner Orient (ZMO)<br />
						Kirchweg 33<br />
						14129 Berlin<br />
						Germany
					</p>
					<img
						src="{base}/images/zmo.webp"
						alt="Leibniz-Zentrum Moderner Orient (ZMO) building exterior"
						class="rounded-lg shadow-md w-full max-w-sm"
					/>
				</div>
			</div>
		</div>

		<div class="contact-section">
			<h2 class="contact-section-title">Connect Online</h2>
			<div class="social-links-grid">
				{#each socialLinks as link}
					{@const iconComponent = iconMap[link.icon as IconKey]}
					<a
						href={link.url}
						class="social-link-card"
						target="_blank"
						rel="noopener noreferrer"
					>
						<div class="social-icon">
							{#if iconComponent}
								<svelte:component this={iconComponent} size={24} aria-hidden="true" class="text-secondary"/>
							{:else}
								<span class="social-icon-letter">{link.name.charAt(0)}</span>
							{/if}
						</div>
						<div class="social-link-content">
							<h3 class="text-lg font-medium">{link.name}</h3>
							<p class="social-link-description">{link.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>