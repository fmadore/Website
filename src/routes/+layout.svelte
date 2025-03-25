<script lang="ts">
	import '../app.css';

	let { children } = $props();
	
	// Navigation items based on the WordPress site
	const navItems = [
		{ name: 'About', path: '/about' },
		{ 
			name: 'Research', 
			path: '/research',
			dropdown: [
				{ name: 'Mining the Islam West Africa Collection (2025)', path: '/research/mining-the-islam-west-africa-collection' },
				{ name: 'Religious Activism on Campuses in Togo and Benin (2021-24)', path: '/research/religious-activism-campuses-togo-benin' },
				{ name: 'Muslim Minorities in Southern Cities of Benin and Togo (2018-20)', path: '/research/muslim-minorities-southern-cities-benin-togo' },
				{ name: 'Youth and Women\'s Islamic Activism in Côte d\'Ivoire and Burkina Faso​ (2013-18)', path: '/research/youth-womens-islamic-activism-cote-divoire-burkina-faso' }
			] 
		},
		{ name: 'Publications', path: '/publications' },
		{ 
			name: 'Digital Humanities', 
			path: '/digital-humanities',
			dropdown: [
				{ name: 'Islam West Africa Collection', path: '/digital-humanities/islam-west-africa-collection' },
				{ name: 'Visualising the IWAC', path: '/digital-humanities/visualising-the-iwac' }
			] 
		},
		{ name: 'Conference Activity', path: '/conference-activity' },
		{ name: 'Teaching', path: '/teaching' },
		{ name: 'Contact', path: '/contact' }
	];
	
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

<div class="site-container">
	<header class="bg-white">
		<div class="container mx-auto p-6">
			<div class="site-header">
				<div class="text-center">
					<a href="/" class="site-title">
						Frédérick Madore
					</a>
				</div>
				
				<nav class="main-nav">
					<ul class="nav-list">
						{#each navItems as item}
							<li class="nav-item dropdown-container">
								<a href={item.path} class="nav-link dropdown-trigger">
									{item.name} {item.dropdown ? '▾' : ''}
								</a>
								
								{#if item.dropdown}
									<div class="dropdown-menu">
										<ul>
											{#each item.dropdown as subItem}
												<li>
													<a href={subItem.path} class="dropdown-item">
														{subItem.name}
													</a>
												</li>
											{/each}
										</ul>
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</div>
	</header>

	<main class="site-main">
		<div class="container mx-auto p-8">
			{@render children()}
		</div>
	</main>

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
</div>

<style>
	.site-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	.container {
		max-width: 1280px;
		margin-left: auto;
		margin-right: auto;
	}
	
	.site-header {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	@media (min-width: 768px) {
		.site-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}
	
	.site-title {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
	}
	
	.site-title:hover {
		color: var(--color-primary);
	}
	
	.site-main {
		flex-grow: 1;
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
