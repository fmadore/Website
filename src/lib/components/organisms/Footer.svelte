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
				{ name: 'Bluesky', icon: 'simple-icons:bluesky', url: 'https://bsky.app/profile/fmadore' },
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

<style>
	.site-footer {
		background-color: var(--color-footer-bg);
		color: var(--color-footer-text);
		padding: var(--spacing-8) 0 var(--spacing-6) 0;
		position: relative;
	}
	
	/* Add a subtle gradient top border */
	.footer-gradient-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(to right, var(--color-primary), var(--color-highlight));
	}
	
	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-4);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
	}
	
	.footer-branding {
		display: flex;
		align-items: center;
		gap: var(--spacing-6);
	}
	
	.footer-copyright {
		font-size: var(--font-size-sm);
		color: var(--color-footer-text-muted);
	}
	
	.footer-social-links {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-8);
	}
	
	.footer-link-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
	}
	
	.footer-group-title {
		color: var(--color-footer-text);
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: var(--spacing-1);
		position: relative;
	}
	
	/* Decorative line under group titles */
	.footer-group-title:after {
		content: "";
		position: absolute;
		bottom: -8px;
		left: 0;
		width: 30px;
		height: 2px;
		background-color: var(--color-primary);
	}
	
	.footer-links-grid {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
	}
	
	.footer-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		color: var(--color-footer-text-muted);
		text-decoration: none;
		transition: all 0.2s ease;
		line-height: 1;
		position: relative;
		padding: var(--spacing-1);
		border-radius: var(--border-radius-sm);
	}
	
	/* Make the icon visually consistent */
	.footer-link :global(svg) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		transition: transform 0.2s ease;
	}
	
	.footer-link-name {
		font-size: var(--font-size-sm);
	}
	
	.footer-link:hover {
		color: #ff6600; /* Strong orange color for better contrast in light theme */
		background-color: rgba(255, 255, 255, 0.05);
	}
	
	.footer-link:hover :global(svg) {
		transform: scale(1.1);
		color: #ff6600; /* Ensuring SVG icons also use the orange color */
	}

	/* Responsive styles */
	@media (min-width: 640px) {
		.footer-social-links {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--spacing-6);
		}
	}
	
	@media (min-width: 768px) {
		.footer-container {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}
		
		.footer-branding {
			flex-direction: column;
			align-items: flex-start;
		}
		
		.footer-social-links {
			flex: 1;
			justify-content: flex-end;
			margin-left: auto;
		}
	}
	
	@media (max-width: 639px) {
		.footer-branding {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: var(--spacing-4);
		}
		
		.footer-link-group {
			align-items: center;
		}
		
		.footer-group-title:after {
			left: 50%;
			transform: translateX(-50%);
		}
		
		.footer-links-grid {
			align-items: center;
		}
	}
	
	/* Dark mode adjustments */
	/* Removing unused selector */
</style>