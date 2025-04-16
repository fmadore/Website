<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';
	
	// Grouped social media links with Iconify icon names
	const socialGroups = [
		{
			title: "Contact",
			links: [
				{ name: 'Email', icon: 'mdi:email', url: 'mailto:frederick.madore@zmo.de' }
			]
		},
		{
			title: "Academic",
			links: [
				{ name: 'Google Scholar', icon: 'academicons:google-scholar', url: 'https://scholar.google.com/citations?user=naUK0RQAAAAJ' },
				{ name: 'ORCID', icon: 'simple-icons:orcid', url: 'https://orcid.org/0000-0003-0959-2092' },
				{ name: 'ResearchGate', icon: 'simple-icons:researchgate', url: 'https://www.researchgate.net/profile/Frederick-Madore' },
				{ name: 'Academia.edu', icon: 'simple-icons:academia', url: 'https://zmo.academia.edu/FrederickMadore' }
			]
		},
		{
			title: "Social",
			links: [
				{ name: 'LinkedIn', icon: 'simple-icons:linkedin', url: 'https://www.linkedin.com/in/frederickmadore/' },
				{ name: 'GitHub', icon: 'simple-icons:github', url: 'https://github.com/fmadore' },
				{ name: 'Bluesky', icon: 'simple-icons:bluesky', url: 'https://bsky.app/profile/fmadore.bsky.social' },
				{ name: 'Mastodon', icon: 'simple-icons:mastodon', url: 'https://hcommons.social/@fmadore' }
			]
		}
	];
	
	// Flatten links for backward compatibility if needed elsewhere in code
	const socialLinks = socialGroups.flatMap(group => group.links);
	
	const currentYear = new Date().getFullYear();
</script>

<footer class="site-footer">
	<div class="footer-gradient-top"></div>
	<div class="footer-container">
		<div class="footer-branding">
			<div class="footer-copyright">
				<p>Copyright © {currentYear} Frédérick Madore, Ph.D.</p>
				<p>Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</p>
			</div>
		</div>
		
		<div class="footer-social-links">
			{#each socialGroups as group}
				<div class="footer-link-group">
					<h3 class="footer-group-title">{group.title}</h3>
					<div class="footer-links-grid">
						{#each group.links as link, i}
							<a 
								href={link.url} 
								class="footer-link" 
								target="_blank" 
								rel="noopener noreferrer" 
								aria-label={link.name}
							>
								<Icon icon={link.icon} width="22" height="22" />
								<span class="footer-link-name">{link.name}</span>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</footer>