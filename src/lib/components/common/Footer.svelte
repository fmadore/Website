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

<footer class="site-footer" bind:this={footerElement}>
	<div class="footer-container">
		<section
			class="footer-branding"
			class:animate={isVisible}
			aria-labelledby="footer-brand-heading"
		>
			<p class="footer-wordmark" id="footer-brand-heading">{author.fullName}</p>
			<p class="footer-tagline">{author.position}</p>
		</section>

		<nav
			class="footer-social-links"
			class:animate={isVisible}
			aria-label="Social and academic links"
		>
			{#each socialGroups as group, groupIndex (group.title)}
				<section
					class="footer-link-group"
					style="animation-delay: {groupIndex * 100}ms"
					class:animate={isVisible}
					aria-labelledby="group-{groupIndex}-title"
				>
					<!-- h2, not h3: pages whose content has no h2 (e.g. /teaching) would
					     otherwise skip a heading level going into the footer. -->
					<h2 class="footer-group-title" id="group-{groupIndex}-title">
						{group.title}
					</h2>
					<!-- Use proper semantic list structure -->
					<ul class="footer-links-grid">
						{#each group.links as link, linkIndex (link.url)}
							{@const isExternal = link.url.startsWith('http') || link.url.startsWith('mailto:')}
							<li
								class="footer-link-item"
								style="animation-delay: {(groupIndex * group.links.length + linkIndex) * 50}ms"
								class:animate={isVisible}
							>
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
								<a
									href={link.url}
									class="footer-link no-underline"
									target={isExternal ? '_blank' : undefined}
									rel={isExternal ? 'external noopener noreferrer' : undefined}
									aria-label={isExternal ? `${link.name} - Opens in new tab` : link.name}
								>
									<span class="footer-link-icon" aria-hidden="true">
										<Icon icon={link.icon} width="15" height="15" />
									</span>
									<span class="footer-link-name">{link.name}</span>
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</nav>
	</div>

	<!-- Colophon rule — the fine-book signature line -->
	<div class="footer-colophon" class:animate={isVisible}>
		<span class="footer-copyright">© {currentYear} {author.fullName}</span>
		<span class="footer-typecredit">Set in Archivo, Newsreader &amp; Spline Sans Mono.</span>
	</div>

	<!-- Scroll indicator -->
	<button
		class="scroll-to-top"
		class:visible={isVisible}
		onclick={scrollToTop}
		onkeydown={handleScrollKeydown}
		aria-label="Scroll to top of page"
		type="button"
	>
		<Icon icon="mdi:arrow-up" width="20" height="20" aria-hidden="true" />
	</button>
</footer>

<style>
	/*
	 * Colophon footer — the printed endpaper. One dark ink ground (cream type
	 * in both themes), heavy masthead rule on top, asymmetric editorial grid.
	 * No boxes, no glass, no shadow: mono small-caps labels and rules alone.
	 */
	.site-footer {
		background: var(--color-footer-bg);
		color: var(--color-footer-text);
		padding: var(--space-12) 0 var(--space-8) 0;
		position: relative;
		border-top: var(--rule-masthead) solid var(--color-footer-text);
		/* Keep footer below sidebar dropdowns (sidebar-column has z-index: 10) */
		z-index: 1;
	}

	.footer-container {
		max-width: var(--container-lg);
		margin: 0 auto;
		padding: 0 var(--space-6);
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-10);
		align-items: start;
	}

	.footer-branding {
		opacity: 0;
		transform: translateY(var(--transform-distance-md));
		transition:
			opacity var(--duration-slower) var(--ease-out-quart),
			transform var(--duration-slower) var(--ease-out-quart);
	}

	.footer-branding.animate {
		opacity: 1;
		transform: translateY(0);
	}

	/* Brand wordmark — Archivo, wide and heavy, uppercase. */
	.footer-wordmark {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-wordmark);
		font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
		font-weight: 830;
		letter-spacing: -0.01em;
		text-transform: uppercase;
		line-height: 0.95;
		color: var(--color-footer-text);
		margin: 0;
	}

	/* Tagline — serif italic, quiet cream. */
	.footer-tagline {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-base);
		color: var(--color-footer-text-muted);
		margin: var(--space-3) 0 0;
		max-width: 40ch;
		line-height: var(--line-height-snug);
	}

	.footer-social-links {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
		gap: var(--space-8) var(--space-6);
		opacity: 0;
		transform: translateY(var(--transform-distance-md));
		transition:
			opacity var(--duration-slower) var(--ease-out-quart) var(--stagger-2),
			transform var(--duration-slower) var(--ease-out-quart) var(--stagger-2);
	}

	.footer-social-links.animate {
		opacity: 1;
		transform: translateY(0);
	}

	.footer-link-group {
		display: flex;
		flex-direction: column;
	}

	/* Group titles — the data voice: mono small-caps over a hairline. */
	.footer-group-title {
		font-family: var(--font-family-mono);
		color: var(--color-footer-text-muted);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.16em;
		margin: 0 0 var(--space-4) 0;
		padding-bottom: var(--space-2);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-footer-text) 20%, transparent);
	}

	.footer-links-grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.footer-link-item {
		opacity: 0;
		transform: translateY(var(--transform-distance-xs));
		transition:
			opacity var(--duration-slow) var(--ease-out-quart),
			transform var(--duration-slow) var(--ease-out-quart);
	}

	.footer-link-item.animate {
		opacity: 1;
		transform: translateY(0);
	}

	/* Links — Archivo at text weight, a grotesque set of section names, warming
	 * to the bright pine on hover. */
	.footer-link {
		display: inline-flex;
		align-items: flex-start;
		gap: var(--space-2);
		color: var(--color-footer-text-muted);
		text-decoration: none;
		padding: var(--space-1) 0;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.footer-link-icon {
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
		margin-top: var(--space-0-5);
		opacity: var(--opacity-70);
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.footer-link-name {
		font-family: var(--font-family-display);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-normal);
		white-space: pre-line;
		line-height: var(--line-height-snug);
	}

	.footer-link:hover {
		color: var(--sys-color-pine-bright);
	}

	.footer-link:hover .footer-link-icon {
		opacity: 1;
	}

	/* Colophon rule — the signature line: © in mono, type credit in serif italic. */
	.footer-colophon {
		max-width: var(--container-lg);
		margin: var(--space-10) auto 0;
		padding: var(--space-4) var(--space-6) 0;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-4);
		flex-wrap: wrap;
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-footer-text) 20%, transparent);
		opacity: 0;
		transition: opacity var(--duration-slower) var(--ease-out-quart) var(--stagger-3);
	}

	.footer-colophon.animate {
		opacity: 1;
	}

	.footer-copyright {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-footer-text-muted);
	}

	.footer-typecredit {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		color: var(--color-footer-text-muted);
	}

	/* Scroll-to-top — a square ink control, no round, no shadow. */
	.scroll-to-top {
		position: fixed;
		bottom: var(--space-6);
		right: var(--space-6);
		width: var(--space-11);
		height: var(--space-11);
		border: var(--border-width-thin) solid var(--color-primary);
		border-radius: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-inverted);
		background: var(--color-primary);
		cursor: pointer;
		box-shadow: none;
		transform: translateY(calc(var(--space-24) + var(--space-2)));
		opacity: 0;
		transition:
			transform var(--duration-moderate) var(--ease-out-quart),
			opacity var(--duration-moderate) var(--ease-out),
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
		z-index: var(--z-fixed);
	}

	.scroll-to-top.visible {
		transform: translateY(0);
		opacity: 1;
	}

	.scroll-to-top:hover {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--sys-color-paper);
	}

	/* Responsive design improvements */
	@media (--sm) {
		.footer-container,
		.footer-colophon {
			padding-left: var(--space-8);
			padding-right: var(--space-8);
		}
	}

	@media (--md) {
		.footer-container {
			grid-template-columns: minmax(15rem, 1.2fr) 2fr;
			gap: var(--space-12);
		}
	}

	@media (--lg) {
		.site-footer {
			padding: var(--space-16) 0 var(--space-10) 0;
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.footer-branding,
		.footer-social-links,
		.footer-link-item,
		.footer-colophon {
			transition: none;
			opacity: 1;
			transform: none;
		}
	}

	/* Focus states */
	.footer-link:focus-visible {
		outline: var(--border-width-medium) solid var(--sys-color-pine-bright);
		outline-offset: var(--border-width-medium);
	}

	.scroll-to-top:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-medium);
	}
</style>
