<script lang="ts">
	// Navigation items based on the WordPress site
	const navItems = [
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
		{ name: 'Activities', path: '/activities' },
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
</script>

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

<style>
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
	
	.nav-list {
		display: flex;
		flex-wrap: wrap;
		list-style: none;
		padding: 0;
		margin: 0;
		gap: var(--spacing-4);
	}
	
	.nav-item {
		position: relative;
	}
	
	.nav-link {
		color: var(--color-text);
		text-decoration: none;
		font-weight: 500;
		padding: var(--spacing-2) 0;
	}
	
	.nav-link:hover {
		color: var(--color-primary);
	}
	
	.dropdown-container {
		position: relative;
	}
	
	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 10;
		min-width: 200px;
		background-color: white;
		box-shadow: var(--shadow-lg);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-2);
		margin-top: var(--spacing-2);
		display: none;
	}
	
	.dropdown-container:hover .dropdown-menu {
		display: block;
	}
	
	.dropdown-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.dropdown-item {
		display: block;
		padding: var(--spacing-2) var(--spacing-3);
		color: var(--color-text);
		text-decoration: none;
		font-size: var(--font-size-sm);
		border-radius: var(--border-radius-sm);
		white-space: nowrap;
	}
	
	.dropdown-item:hover {
		background-color: var(--color-gray-100);
		color: var(--color-primary);
	}
</style> 