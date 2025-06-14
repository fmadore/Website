<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';

	// Grouped social media links with Iconify icon names
	const socialGroups = [
		{
			title: 'Contact',
			links: [
				{ name: 'Email', icon: 'mdi:email', url: 'mailto:frederick.madore@zmo.de' },
				{
					name: `Kirchweg 33\n14129 Berlin\nGermany`,
					icon: 'mdi:map-marker',
					url: 'https://maps.app.goo.gl/AV85XrMqokwShSLZ8'
				}
			]
		},
		{
			title: 'Academic',
			links: [
				{
					name: 'Google Scholar',
					icon: 'academicons:google-scholar',
					url: 'https://scholar.google.com/citations?user=naUK0RQAAAAJ'
				},
				{ name: 'ORCID', icon: 'simple-icons:orcid', url: 'https://orcid.org/0000-0003-0959-2092' },
				{
					name: 'ResearchGate',
					icon: 'simple-icons:researchgate',
					url: 'https://www.researchgate.net/profile/Frederick-Madore'
				},
				{
					name: 'Academia.edu',
					icon: 'simple-icons:academia',
					url: 'https://zmo.academia.edu/FrederickMadore'
				}
			]
		},
		{
			title: 'Social',
			links: [
				{
					name: 'LinkedIn',
					icon: 'simple-icons:linkedin',
					url: 'https://www.linkedin.com/in/frederickmadore/'
				},
				{ name: 'GitHub', icon: 'simple-icons:github', url: 'https://github.com/fmadore' },
				{
					name: 'Bluesky',
					icon: 'simple-icons:bluesky',
					url: 'https://bsky.app/profile/fmadore.bsky.social'
				},
				{ name: 'Mastodon', icon: 'simple-icons:mastodon', url: 'https://hcommons.social/@fmadore' }
			]
		}
	];

	// Flatten links for backward compatibility if needed elsewhere in code
	const socialLinks = socialGroups.flatMap((group) => group.links);

	const currentYear = new Date().getFullYear();

	// Enhanced intersection observer for subtle animations
	let footerElement: HTMLElement;
	let isVisible = $state(false);
	$effect(() => {
		// Only run when footerElement is available
		if (!footerElement) return;

		// Debounce intersection updates for better performance
		let timeoutId: number;

		const observer = new IntersectionObserver(
			(entries) => {
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					entries.forEach((entry) => {
						isVisible = entry.isIntersecting;
					});
				}, 50);
			},
			{ threshold: 0.1, rootMargin: '50px' }
		);

		observer.observe(footerElement);

		return () => {
			clearTimeout(timeoutId);
			observer.disconnect();
		};
	});

	// Smooth scroll to top function
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Handle keyboard events for scroll to top
	function handleScrollKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			scrollToTop();
		}
	}
</script>

<!-- Remove redundant role="contentinfo" - footer element already provides this semantic meaning -->
<footer class="site-footer glass-frosted" bind:this={footerElement}>
	<div class="footer-gradient-top" aria-hidden="true"></div>

	<!-- Background decorative elements -->
	<div class="footer-decoration" aria-hidden="true">
		<div class="decoration-circle decoration-circle-1"></div>
		<div class="decoration-circle decoration-circle-2"></div>
		<div class="decoration-line"></div>
	</div>

	<div class="footer-container">
		<section
			class="footer-branding glass-light"
			class:animate={isVisible}
			aria-labelledby="footer-brand-heading"
		>
			<div class="footer-logo-section">
				<div class="footer-copyright">
					<p class="copyright-main" id="footer-brand-heading">
						© {currentYear} Frédérick Madore, Ph.D.
					</p>
					<p class="copyright-subtitle">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</p>
				</div>
			</div>
		</section>

		<nav
			class="footer-social-links"
			class:animate={isVisible}
			aria-label="Social and academic links"
		>
			{#each socialGroups as group, groupIndex}
				<section
					class="footer-link-group glass-light"
					style="animation-delay: {groupIndex * 0.1}s"
					class:animate={isVisible}
					aria-labelledby="group-{groupIndex}-title"
				>
					<h3 class="footer-group-title" id="group-{groupIndex}-title">
						{group.title}
						<span class="title-accent" aria-hidden="true"></span>
					</h3>
					<!-- Use proper semantic list structure -->
					<ul class="footer-links-grid">
						{#each group.links as link, linkIndex}
							<li
								class="footer-link-item"
								style="animation-delay: {(groupIndex * group.links.length + linkIndex) * 0.05}s"
								class:animate={isVisible}
							>
								<a
									href={link.url}
									class="footer-link glass-button"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="{link.name} - Opens in new tab"
								>
									<div class="footer-link-icon" aria-hidden="true">
										<Icon icon={link.icon} width="20" height="20" />
									</div>
									<span class="footer-link-name">{link.name}</span>
									<div class="link-hover-effect" aria-hidden="true"></div>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</nav>
	</div>

	<!-- Enhanced scroll indicator -->
	<button
		class="scroll-to-top glass-primary"
		class:visible={isVisible}
		onclick={scrollToTop}
		onkeydown={handleScrollKeydown}
		aria-label="Scroll to top of page"
		type="button"
	>
		<Icon icon="mdi:chevron-up" width="24" height="24" aria-hidden="true" />
	</button>
</footer>

<style>
	/* Enhanced footer styles with glassmorphism */
	.site-footer {
		background: linear-gradient(
			135deg,
			var(--color-footer-bg) 0%,
			color-mix(in srgb, var(--color-footer-bg) 95%, var(--color-primary) 5%) 100%
		);
		color: var(--color-footer-text);
		padding: var(--spacing-12) 0 var(--spacing-8) 0;
		position: relative;
		overflow: hidden;
	}

	/* Enhanced gradient top border with animated shimmer */
	.footer-gradient-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(
			90deg,
			var(--color-primary),
			var(--color-highlight),
			var(--color-accent),
			var(--color-primary)
		);
		background-size: 200% 100%;
		animation: shimmer 4s ease-in-out infinite;
	}

	@keyframes shimmer {
		0%,
		100% {
			background-position: 200% 0;
		}
		50% {
			background-position: 0% 0;
		}
	}

	/* Decorative background elements */
	.footer-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		opacity: var(--opacity-low);
	}

	.decoration-circle {
		position: absolute;
		border-radius: 50%;
		background: linear-gradient(45deg, var(--color-primary), var(--color-highlight));
	}

	.decoration-circle-1 {
		width: 300px;
		height: 300px;
		top: -150px;
		right: -100px;
		animation: float 6s ease-in-out infinite;
	}

	.decoration-circle-2 {
		width: 200px;
		height: 200px;
		bottom: -100px;
		left: -50px;
		animation: float 8s ease-in-out infinite reverse;
	}

	.decoration-line {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			var(--color-primary),
			var(--color-highlight),
			transparent
		);
		transform: translateY(-50%);
		animation: pulse-line 3s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
		}
	}

	@keyframes pulse-line {
		0%,
		100% {
			opacity: var(--opacity-low);
		}
		50% {
			opacity: var(--opacity-medium);
		}
	}

	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-6);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
		position: relative;
		z-index: 2;
	}

	/* Enhanced branding section with glassmorphism */
	.footer-branding {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.6s ease;
		padding: var(--spacing-6);
		border-radius: var(--border-radius-xl);
		width: 100%;
	}

	.footer-branding.animate {
		opacity: 1;
		transform: translateY(0);
	}

	.footer-logo-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-2);
	}



	.footer-copyright {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.copyright-main {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-footer-text);
		margin: 0;
	}

	.copyright-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-footer-text-muted);
		margin: 0;
	}

	/* Enhanced social links section with glassmorphism */
	.footer-social-links {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-6);
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.6s ease 0.2s;
	}

	.footer-social-links.animate {
		opacity: 1;
		transform: translateY(0);
	}

	.footer-link-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.4s ease;
		padding: var(--spacing-5);
		border-radius: var(--border-radius-lg);
		min-height: 200px;
	}

	.footer-link-group.animate {
		opacity: 1;
		transform: translateY(0);
	}

	/* Enhanced group titles */
	.footer-group-title {
		color: var(--color-footer-text);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		margin: 0 0 var(--spacing-4) 0;
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	.title-accent {
		flex: 1;
		height: 2px;
		background: linear-gradient(90deg, var(--color-highlight), var(--color-accent), transparent);
		border-radius: 1px;
		opacity: 0.8;
	}

	/* Proper list styling */
	.footer-links-grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.footer-link-item {
		opacity: 0;
		transform: translateX(-20px);
		transition: all 0.4s ease;
	}

	.footer-link-item.animate {
		opacity: 1;
		transform: translateX(0);
	}

	/* Enhanced footer links with glassmorphism */
	.footer-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		color: var(--color-footer-text-muted);
		text-decoration: none;
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-md);
		position: relative;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		width: 100%;
		/* Remove custom background - glass-button utility handles this */
		border: none;
	}

	.footer-link-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: rgba(var(--color-primary-rgb), var(--opacity-medium));
		border-radius: var(--border-radius);
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	.footer-link-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		white-space: pre-line;
		line-height: var(--line-height-relaxed);
	}

	.link-hover-effect {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(var(--color-primary-rgb), var(--opacity-medium)),
			transparent
		);
		transition: left 0.5s ease;
	}

	.footer-link:hover {
		color: var(--color-footer-text);
		transform: var(--transform-lift-sm);
	}

	.footer-link:hover .footer-link-icon {
		background: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		transform: scale(1.1);
		box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
	}

	.footer-link:hover .link-hover-effect {
		left: 100%;
	}

	/* Enhanced scroll to top button with glassmorphism */
	.scroll-to-top {
		position: fixed;
		bottom: var(--spacing-6);
		right: var(--spacing-6);
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: pointer;
		box-shadow: var(--shadow-lg);
		transform: translateY(100px);
		opacity: 0;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1000;
	}

	.scroll-to-top.visible {
		transform: translateY(0);
		opacity: 1;
	}

	.scroll-to-top:hover {
		transform: var(--transform-lift-md) scale(1.05);
		box-shadow: var(--shadow-xl);
	}

	/* Responsive design improvements */
	@media (min-width: 640px) {
		.footer-container {
			padding: 0 var(--spacing-8);
			gap: var(--spacing-6);
		}

		.footer-social-links {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--spacing-6);
		}
	}

	@media (min-width: 768px) {
		.footer-container {
			gap: var(--spacing-6);
		}

		.footer-social-links {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.site-footer {
			padding: var(--spacing-16) 0 var(--spacing-12) 0;
		}

		.footer-container {
			gap: var(--spacing-20);
		}

		.footer-links-grid {
			gap: var(--spacing-3);
		}
	}

	@media (max-width: 639px) {
		.footer-container {
			gap: var(--spacing-6);
		}

		.footer-social-links {
			grid-template-columns: 1fr;
			gap: var(--spacing-4);
		}

		.footer-link-group {
			min-height: auto;
			padding: var(--spacing-4);
		}

		.footer-group-title {
			justify-content: center;
			text-align: center;
		}

		.title-accent {
			display: none;
		}

		.footer-links-grid {
			align-items: center;
		}

		.footer-link {
			justify-content: center;
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.footer-gradient-top,
		.decoration-circle,
		.decoration-line,
		.link-hover-effect {
			animation: none;
		}

		.footer-link:hover .link-hover-effect {
			display: none;
		}

		.footer-branding,
		.footer-social-links,
		.footer-link-group,
		.footer-link-item {
			transition: none;
			opacity: 1;
			transform: none;
		}
	}

	/* Focus states */
	.footer-link:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.scroll-to-top:focus-visible {
		outline: 2px solid white;
		outline-offset: 2px;
	}
</style>
