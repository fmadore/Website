<script lang="ts">
	import Icon from '@iconify/svelte';
	import { socialGroups, author } from '$lib/data/siteConfig';

	const currentYear = new Date().getFullYear();

	// Enhanced intersection observer for subtle animations
	let footerElement: HTMLElement;
	let isVisible = $state(false);
	$effect(() => {
		// Only run when footerElement is available
		if (!footerElement) return;

		// Debounce intersection updates for better performance
		let timeoutId: ReturnType<typeof setTimeout>;

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
					<p class="copyright-subtitle">{author.position}</p>
				</div>
			</div>
		</section>

		<nav
			class="footer-social-links"
			class:animate={isVisible}
			aria-label="Social and academic links"
		>
			{#each socialGroups as group, groupIndex (group.title)}
				<section
					class="footer-link-group glass-light"
					style="animation-delay: {groupIndex * 100}ms"
					class:animate={isVisible}
					aria-labelledby="group-{groupIndex}-title"
				>
					<h3 class="footer-group-title" id="group-{groupIndex}-title">
						{group.title}
						<span class="title-accent" aria-hidden="true"></span>
					</h3>
					<!-- Use proper semantic list structure -->
					<ul class="footer-links-grid">
						{#each group.links as link, linkIndex (link.url)}
							{@const isExternal = link.url.startsWith('http') || link.url.startsWith('mailto:')}
							<li
								class="footer-link-item"
								style="animation-delay: {(groupIndex * group.links.length + linkIndex) * 50}ms"
								class:animate={isVisible}
							>
								<a
									href={link.url}
									class="footer-link glass-button"
									target={isExternal ? '_blank' : undefined}
									rel={isExternal ? 'external noopener noreferrer' : undefined}
									aria-label={isExternal ? `${link.name} - Opens in new tab` : link.name}
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
		padding: var(--space-12) 0 var(--space-8) 0;
		position: relative;
		overflow: hidden;
		/* Keep footer below sidebar dropdowns (sidebar-column has z-index: 10) */
		z-index: 1;
	}

	/* Enhanced gradient top border with animated shimmer */
	.footer-gradient-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: var(--space-1);
		background: linear-gradient(
			90deg,
			var(--color-primary),
			var(--color-highlight),
			var(--color-accent),
			var(--color-primary)
		);
		background-size: 200% 100%;
		animation: shimmer var(--anim-duration-ambient) ease-in-out infinite;
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
		width: calc(var(--space-32) * 2.375); /* ~300px equivalent */
		height: calc(var(--space-32) * 2.375);
		top: calc(var(--space-32) * -1.1875); /* ~-150px equivalent */
		right: calc(var(--space-32) * -0.625); /* ~-100px equivalent */
		animation: float var(--anim-duration-gentle) ease-in-out infinite;
	}

	.decoration-circle-2 {
		width: var(--space-32); /* 200px equivalent */
		height: var(--space-32);
		bottom: calc(var(--space-32) * -0.625); /* ~-100px equivalent */
		left: calc(var(--space-32) * -0.3125); /* ~-50px equivalent */
		animation: float var(--anim-duration-gentle) ease-in-out infinite reverse;
	}

	.decoration-line {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: var(--border-width-thin);
		background: linear-gradient(
			90deg,
			transparent,
			var(--color-primary),
			var(--color-highlight),
			transparent
		);
		transform: translateY(-50%);
		animation: pulse-line var(--anim-duration-decorative) ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0) rotate(var(--rotate-0));
		}
		50% {
			transform: translateY(calc(var(--transform-distance-sm) * -1)) rotate(var(--rotate-180));
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
		max-width: var(--container-lg);
		margin: 0 auto;
		padding: 0 var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
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
		transform: translateY(var(--transform-distance-lg));
		transition: all var(--anim-duration-bounce) var(--anim-ease-base);
		padding: var(--space-6);
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
		gap: var(--space-2);
	}

	.footer-copyright {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.copyright-main {
		font-family: var(--font-family-serif);
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
		grid-template-columns: 1fr;
		gap: var(--space-4);
		opacity: 0;
		transform: translateY(var(--transform-distance-lg));
		transition: all var(--anim-duration-bounce) var(--anim-ease-base) var(--anim-delay-4);
	}

	.footer-social-links.animate {
		opacity: 1;
		transform: translateY(0);
	}

	.footer-link-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		opacity: 0;
		transform: translateY(var(--transform-distance-md));
		transition: all var(--anim-duration-slow) var(--anim-ease-base);
		padding: var(--space-4);
		border-radius: var(--border-radius-lg);
		min-height: auto;
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
		margin: 0 0 var(--space-4) 0;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: var(--space-2);
	}

	.title-accent {
		flex: 1;
		height: var(--border-width-medium);
		background: linear-gradient(90deg, var(--color-highlight), var(--color-accent), transparent);
		border-radius: var(--border-radius-sm);
		opacity: var(--opacity-high);
		display: none;
	}

	/* Proper list styling */
	.footer-links-grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
	}

	.footer-link-item {
		opacity: 0;
		transform: translateX(calc(var(--transform-distance-md) * -1));
		transition: all var(--anim-duration-slow) var(--anim-ease-base);
	}

	.footer-link-item.animate {
		opacity: 1;
		transform: translateX(0);
	}

	/* Enhanced footer links with glassmorphism */
	.footer-link {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		color: var(--color-footer-text-muted);
		text-decoration: none;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		position: relative;
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		overflow: hidden;
		width: 100%;
		/* Remove custom background - glass-button utility handles this */
		border: none;
	}

	.footer-link-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--space-6) + var(--space-2));
		height: calc(var(--space-6) + var(--space-2));
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-radius: var(--border-radius-md);
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
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
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium) * 100%), transparent),
			transparent
		);
		transition: left var(--anim-duration-slow) var(--anim-ease-base);
	}

	.footer-link:hover {
		color: var(--color-footer-text);
		transform: var(--transform-lift-sm);
	}

	.footer-link:hover .footer-link-icon {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		transform: scale(var(--scale-110));
		box-shadow: 0 var(--space-1) var(--space-2)
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium-high) * 100%), transparent);
	}

	.footer-link:hover .link-hover-effect {
		left: 100%;
	}

	/* Enhanced scroll to top button with glassmorphism */
	.scroll-to-top {
		position: fixed;
		bottom: var(--space-6);
		right: var(--space-6);
		width: var(--space-12);
		height: var(--space-12);
		border: none;
		border-radius: var(--border-radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-white);
		cursor: pointer;
		box-shadow: var(--shadow-lg);
		transform: translateY(calc(var(--space-24) + var(--space-2)));
		opacity: 0;
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		z-index: var(--z-fixed);
	}

	.scroll-to-top.visible {
		transform: translateY(0);
		opacity: 1;
	}

	.scroll-to-top:hover {
		transform: var(--transform-lift-md) scale(var(--scale-105));
		box-shadow: var(--shadow-xl);
	}

	/* Responsive design improvements */
	@media (--sm) {
		.footer-container {
			padding: 0 var(--space-8);
			gap: var(--space-6);
		}

		.footer-social-links {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-6);
		}

		.footer-link-group {
			min-height: var(--space-32);
			padding: var(--space-5);
		}

		.footer-group-title {
			justify-content: flex-start;
			text-align: left;
		}

		.title-accent {
			display: block;
		}

		.footer-links-grid {
			align-items: stretch;
		}

		.footer-link {
			justify-content: flex-start;
		}
	}

	@media (--md) {
		.footer-container {
			gap: var(--space-6);
		}

		.footer-social-links {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (--lg) {
		.site-footer {
			padding: var(--space-16) 0 var(--space-12) 0;
		}

		.footer-container {
			gap: var(--space-20);
		}

		.footer-links-grid {
			gap: var(--space-3);
		}
	}

	/* Additional mobile-specific fixes for very small screens */
	@media (max-width: 480px) {
		.footer-social-links {
			grid-template-columns: 1fr;
			gap: var(--space-3);
		}

		.footer-link-group {
			padding: var(--space-3);
			margin-bottom: var(--space-2);
		}

		.footer-links-grid {
			gap: var(--space-2);
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
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--border-width-medium);
	}

	.scroll-to-top:focus-visible {
		outline: var(--border-width-medium) solid var(--color-white);
		outline-offset: var(--border-width-medium);
	}
</style>
