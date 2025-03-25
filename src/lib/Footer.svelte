<script lang="ts">
	// Social media links
	const socialLinks = [
		{ name: 'Email', icon: 'email', url: 'mailto:contact@frederickmadore.com' },
		{ name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/in/username' },
		{ name: 'GitHub', icon: 'github', url: 'https://github.com/username' },
		{ name: 'ORCID', icon: 'orcid', url: 'https://orcid.org/0000-0000-0000-0000' },
		{ name: 'Bluesky', icon: 'bluesky', url: 'https://bluesky.com/username' },
		{ name: 'Mastodon', icon: 'mastodon', url: 'https://mastodon.social/@username' },
		{ name: 'Google Scholar', icon: 'google-scholar', url: 'https://scholar.google.com/citations?user=userid' },
		{ name: 'ResearchGate', icon: 'researchgate', url: 'https://researchgate.net/profile/username' },
		{ name: 'Knowledge Commons', icon: 'commons', url: 'https://knowledgecommons.org/username' },
		{ name: 'Academia.edu', icon: 'academia', url: 'https://academia.edu/username' }
	];
</script>

<footer class="site-footer bg-gray-800">
	<div class="container mx-auto p-8">
		<div class="footer-links">
			{#each socialLinks as link}
				<a href={link.url} class="footer-link" target="_blank" rel="noopener noreferrer">
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
	.container {
		max-width: 1280px;
		margin-left: auto;
		margin-right: auto;
	}
	
	.site-footer {
		background-color: var(--color-footer-bg);
		color: var(--color-footer-text);
		padding: var(--spacing-8) 0;
	}
	
	.footer-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--spacing-4);
	}
	
	.footer-link {
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
	}
	
	.footer-link:hover {
		color: white;
	}
	
	.footer-copyright {
		margin-top: var(--spacing-6);
		text-align: center;
		font-size: var(--font-size-sm);
		color: rgba(255, 255, 255, 0.7);
	}
</style> 