<script lang="ts">
	import Icon from '@iconify/svelte';
	// Social media links with Iconify icon names
	const socialLinks = [
		{ name: 'Email', icon: 'mdi:email', url: 'mailto:frederick.madore@zmo.de' },
		{ name: 'LinkedIn', icon: 'simple-icons:linkedin', url: 'https://www.linkedin.com/in/frederickmadore/' },
		{ name: 'GitHub', icon: 'simple-icons:github', url: 'https://github.com/fmadore' },
		{ name: 'ORCID', icon: 'simple-icons:orcid', url: 'https://orcid.org/0000-0003-0959-2092' },
		{ name: 'Bluesky', icon: 'simple-icons:bluesky', url: 'https://bsky.app/profile/fmadore' },
		{ name: 'Mastodon', icon: 'simple-icons:mastodon', url: 'https://hcommons.social/@fmadore' },
		{ name: 'Google Scholar', icon: 'academicons:google-scholar', url: 'https://scholar.google.com/citations?user=naUK0RQAAAAJ' },
		{ name: 'ResearchGate', icon: 'simple-icons:researchgate', url: 'https://www.researchgate.net/profile/Frederick-Madore' },
		{ name: 'Academia.edu', icon: 'simple-icons:academia', url: 'https://zmo.academia.edu/FrederickMadore' }
	];
</script>

<footer class="site-footer">
	<div class="footer-container">
		<div class="footer-links">
			{#each socialLinks as link}
				<a href={link.url} class="footer-link" target="_blank" rel="noopener noreferrer" aria-label={link.name}>
					<Icon icon={link.icon} width="26" height="26" />
				</a>
			{/each}
		</div>
		<div class="footer-copyright">
			<p>Copyright © {new Date().getFullYear()} Frédérick Madore, Ph.D.</p>
			<p>Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</p>
		</div>
	</div>
</footer>