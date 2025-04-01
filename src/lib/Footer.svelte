<script lang="ts">
	import {
		Mail,
		Linkedin,
		Github,
		Info,
		Cloud,
		MessageSquare,
		GraduationCap,
		Network,
		Library
	} from 'lucide-svelte';
	// Social media links
	const socialLinks = [
		{ name: 'Email', icon: 'email', url: 'mailto:frederick.madore@zmo.de' },
		{ name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/frederickmadore/' },
		{ name: 'GitHub', icon: 'github', url: 'https://github.com/fmadore' },
		{ name: 'ORCID', icon: 'orcid', url: 'https://orcid.org/0000-0003-0959-2092' },
		{ name: 'Bluesky', icon: 'bluesky', url: 'https://bsky.app/profile/fmadore.bsky.social' },
		{ name: 'Mastodon', icon: 'mastodon', url: 'https://hcommons.social/@fmadore' },
		{ name: 'Google Scholar', icon: 'google-scholar', url: 'https://scholar.google.com/citations?user=naUK0RQAAAAJ&' },
		{ name: 'ResearchGate', icon: 'researchgate', url: 'https://www.researchgate.net/profile/Frederick-Madore' },
		{ name: 'Knowledge Commons', icon: 'commons', url: 'https://hcommons.org/members/fmadore/' },
		{ name: 'Academia.edu', icon: 'academia', url: 'https://zmo.academia.edu/FrederickMadore' }
	];

	// Map icon names to Lucide components
	const iconMap = {
		email: Mail,
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

<footer class="site-footer bg-gray-800">
	<div class="container mx-auto p-8">
		<div class="footer-links">
			{#each socialLinks as link}
				{@const iconComponent = iconMap[link.icon as IconKey]}
				<a href={link.url} class="footer-link" target="_blank" rel="noopener noreferrer">
					{#if iconComponent}
						<svelte:component this={iconComponent} size={18} aria-hidden="true" />
					{/if}
					{link.name}
				</a>
			{/each}
		</div>
		
		<div class="footer-copyright mt-6 text-center">
			<p>Copyright © {new Date().getFullYear()} Frédérick Madore, Ph.D.</p>
			<p class="mt-1">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</p>
		</div>
	</div>
</footer>

<style>
	/* Remove redundant container style - relies on global .container from src/styles/layout/container.css */
	/* 
	.container {
		max-width: 1280px;
		margin-left: auto;
		margin-right: auto;
	}
	*/
	
	.site-footer {
		background-color: var(--color-footer-bg);
		color: var(--color-footer-text);
		padding: var(--spacing-8) 0 var(--spacing-4) 0;
	}
	
	.footer-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--spacing-4);
	}
	
	.footer-link {
		display: inline-flex; /* Use inline-flex to align icon and text */
		align-items: center; /* Center items vertically */
		gap: var(--spacing-2); /* Add space between icon and text */
		color: var(--color-footer-text-muted);
		text-decoration: none;
		/* Ensure icons align nicely if they have different default sizes */
		line-height: 1;
	}
	
	.footer-link:hover {
		color: white;
	}
	
	.footer-copyright {
		margin-top: var(--spacing-6);
		text-align: center;
		font-size: var(--font-size-sm);
		color: var(--color-footer-text-muted);
	}

	/* Remove margin from the last paragraph in the copyright section */
	.footer-copyright p:last-child {
		margin-bottom: 0;
	}
</style> 