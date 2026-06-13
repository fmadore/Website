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
<footer class="site-footer" bind:this={footerElement}>
	<div class="footer-container">
		<section
			class="footer-branding"
			class:animate={isVisible}
			aria-labelledby="footer-brand-heading"
		>
			<p class="copyright-main" id="footer-brand-heading">
				© {currentYear}
				{author.fullName}
			</p>
			<p class="copyright-subtitle">{author.position}</p>
			<p class="colophon">Set in Fraunces, Spectral &amp; Commissioner.</p>
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
					<h3 class="footer-group-title" id="group-{groupIndex}-title">
						{group.title}
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
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
								<a
									href={link.url}
									class="footer-link no-underline"
									target={isExternal ? '_blank' : undefined}
									rel={isExternal ? 'external noopener noreferrer' : undefined}
									aria-label={isExternal ? `${link.name} - Opens in new tab` : link.name}
								>
									<span class="footer-link-icon" aria-hidden="true">
										<Icon icon={link.icon} width="16" height="16" />
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
	/*
	 * Colophon footer — the back page of a well-made book, not a widget area.
	 * One dark surface, a hairline top rule, left-aligned text columns. The
	 * previous iteration nested three rounded boxes (branding tile + one per
	 * link group) with pill-shaped links inside; all of that chrome is gone.
	 * Hierarchy comes from small-caps group labels and ink contrast alone.
	 */
	.site-footer {
		background: var(--color-footer-bg);
		color: var(--color-footer-text);
		padding: var(--space-12) 0 var(--space-10) 0;
		position: relative;
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-footer-text) 15%, transparent);
		/* Keep footer below sidebar dropdowns (sidebar-column has z-index: 10) */
		z-index: 1;
	}

	/* Asymmetric editorial grid: brand/colophon column left, link columns
	 * right. Collapses to a single left-aligned stack on narrow screens. */
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

	.copyright-main {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-footer-text);
		margin: 0 0 var(--space-1);
	}

	.copyright-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-footer-text-muted);
		margin: 0;
		max-width: 36ch;
		line-height: var(--line-height-snug);
	}

	/* Type credit — the fine-book signature line. Serif italic, quietest ink
	 * in the footer; a deliberate letterpress gesture, not UI chrome. */
	.colophon {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		color: var(--color-footer-text-muted);
		margin: var(--space-6) 0 0;
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

	/*
	 * Group titles — small-caps editorial labels. No boxes, no accent bars;
	 * tracking and a short hairline underneath do the work.
	 */
	.footer-group-title {
		color: var(--color-footer-text-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		margin: 0 0 var(--space-4) 0;
		padding-bottom: var(--space-2);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-footer-text) 15%, transparent);
	}

	/* Proper list styling */
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

	/* Plain text links — quiet ink that brightens on hover, with the same
	 * grow-from-left underline used in prose and nav. */
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
		/* Optically align the icon with the first text line */
		margin-top: var(--space-0-5);
		opacity: var(--opacity-70);
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.footer-link-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		white-space: pre-line;
		line-height: var(--line-height-snug);
		padding-bottom: 2px;
		background-image: linear-gradient(90deg, var(--color-footer-text), var(--color-footer-text));
		background-size: 0% 1px;
		background-position: left bottom;
		background-repeat: no-repeat;
		transition: background-size var(--duration-normal) var(--ease-out);
	}

	.footer-link:hover {
		color: var(--color-footer-text);
	}

	.footer-link:hover .footer-link-icon {
		opacity: 1;
	}

	.footer-link:hover .footer-link-name {
		background-size: 100% 1px;
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
		color: var(--color-text-inverted);
		cursor: pointer;
		box-shadow: var(--shadow-lg);
		transform: translateY(calc(var(--space-24) + var(--space-2)));
		opacity: 0;
		transition: all var(--duration-moderate) var(--ease-in-out);
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
			padding: var(--space-16) 0 var(--space-12) 0;
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.footer-branding,
		.footer-social-links,
		.footer-link-item {
			transition: none;
			opacity: 1;
			transform: none;
		}

		.footer-link-name {
			background-size: 100% 1px;
			transition: none;
		}
	}

	/* Focus states */
	.footer-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-footer-text);
		outline-offset: var(--border-width-medium);
		border-radius: var(--border-radius-sm);
	}

	.scroll-to-top:focus-visible {
		outline: var(--border-width-medium) solid var(--color-text-inverted);
		outline-offset: var(--border-width-medium);
	}
</style>
