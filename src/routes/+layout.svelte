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

<div class="min-h-screen flex flex-col">
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex flex-col md:flex-row md:justify-between md:items-center">
				<div class="text-center md:text-left">
					<a href="/" class="text-2xl font-bold text-gray-900 hover:text-gray-700">
						Frédérick Madore
					</a>
				</div>
				
				<nav class="mt-4 md:mt-0">
					<ul class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 justify-center">
						{#each navItems as item}
							<li class="relative group">
								<a href={item.path} class="text-gray-700 hover:text-gray-900 font-medium">
									{item.name} {item.dropdown ? '▾' : ''}
								</a>
								
								{#if item.dropdown}
									<div class="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-10">
										<ul class="py-2">
											{#each item.dropdown as subItem}
												<li>
													<a href={subItem.path} class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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

	<main class="flex-grow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{@render children()}
		</div>
	</main>

	<footer class="bg-gray-800 text-white py-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-wrap justify-center space-x-4">
				{#each socialLinks as link}
					<a href={link.url} class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">
						{link.name}
					</a>
				{/each}
			</div>
			
			<div class="mt-6 text-center text-sm text-gray-400">
				<p>Copyright © {new Date().getFullYear()} Frédérick Madore, Ph.D.</p>
				<p class="mt-1">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</p>
			</div>
		</div>
	</footer>
</div>
