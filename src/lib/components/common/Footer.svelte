<script lang="ts">
	import Icon from '@iconify/svelte';
	import { resolve } from '$app/paths';
	import { socialGroups, author, address } from '$lib/data/siteConfig';

	const currentYear = new Date().getFullYear();
</script>

<footer class="site-footer">
	<div class="footer-container container">
		<section class="footer-branding" aria-labelledby="footer-brand-heading">
			<!-- The wordmark prints exactly what the masthead prints; the degree
			     belongs to the © line, which is a rights statement, not a nameplate. -->
			<p class="footer-wordmark" id="footer-brand-heading">{author.name}</p>
			<p class="footer-tagline">{author.position}</p>
		</section>

		<nav class="footer-link-groups" aria-label="Contact, profiles and the record">
			{#each socialGroups as group, groupIndex (group.title)}
				<section class="footer-link-group" aria-labelledby="group-{groupIndex}-title">
					<!-- h2, not h3: pages whose content has no h2 (e.g. /teaching) would
					     otherwise skip a heading level going into the footer. -->
					<h2 class="footer-group-title" id="group-{groupIndex}-title">
						{group.title}
					</h2>
					<!-- Use proper semantic list structure -->
					<ul class="footer-links-grid">
						{#each group.links as link (link.url)}
							<!-- A `mailto:` hands off to a mail client; it opens no tab, so it
							     takes neither the target nor the new-tab notice. -->
							{@const isExternal = link.url.startsWith('http')}
							<li class="footer-link-item">
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
								<a
									href={link.url}
									class="footer-link no-underline"
									target={isExternal ? '_blank' : undefined}
									rel={isExternal ? 'external noopener noreferrer' : undefined}
								>
									<span class="footer-link-icon" aria-hidden="true">
										<Icon icon={link.icon} width="15" height="15" />
									</span>
									<span class="footer-link-name">{link.name}</span>
									{#if isExternal}<span class="sr-only"> (opens in new tab)</span>{/if}
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</li>
						{/each}
					</ul>

					{#if group.withAddress}
						<!-- The imprint. A postal address is a record to be read, not a
						     six-line anchor: only the institution carries the map link. -->
						<address class="footer-address">
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external map link -->
							<a
								class="footer-address-link no-underline"
								href={address.mapsUrl}
								target="_blank"
								rel="external noopener noreferrer"
								aria-label="{address.institution} on the map (opens in new tab)"
							>
								{address.institution}
							</a>
							{#if address.department}<span>{address.department}</span>{/if}
							{#if address.street}<span>{address.street}</span>{/if}
							<span>{address.postalCode}&nbsp;{address.city}, {address.country}</span>
							{#if address.room}<span>{address.room}</span>{/if}
						</address>
					{/if}
				</section>
			{/each}
		</nav>
	</div>

	<!-- Colophon rule — the fine-book signature line -->
	<div class="footer-colophon container">
		<span class="footer-copyright">© {currentYear} {author.fullName}</span>
		<!-- The type credit doubles as the door to the living style guide. -->
		<a class="footer-typecredit" href="{resolve('/style-guide')}#colophon">
			Set in Archivo, Newsreader &amp; Spline Sans Mono.
		</a>
	</div>
</footer>

<style>
	/*
	 * Colophon footer — the printed endpaper. Heavy masthead rule on top, a
	 * wordmark column and four ledger-style link groups, closed by the
	 * signature line. Daylight inverts to the ink ground (cream type on ink);
	 * midnight takes the page ground itself and lets the 4px cream rule carry
	 * the boundary. No boxes, no glass, no shadow, and no controls: everything
	 * here is a link or a record.
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

	/* The endpaper hangs on the page's rail: the global `.container` on the
	 * element carries the cap and the gutter, so the footer cannot drift from the
	 * masthead and the reading column again. It used to cap at --container-lg
	 * under a full-bleed rule, which at 1440 started the content at x=240 against
	 * the page's 96 and starved the Contact column to 177.6px — 116px short of
	 * the imprint's longest line, so the postal record broke mid-phrase at every
	 * desktop width. */
	.footer-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-10);
		align-items: start;
	}

	.footer-branding {
		min-width: 0;
	}

	/* Brand wordmark — Archivo, wide and heavy, uppercase. */
	.footer-wordmark {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-wordmark);
		font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
		font-weight: 830;
		letter-spacing: var(--tracking-display-sm);
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
		max-width: var(--measure-note);
		line-height: var(--line-height-snug);
	}

	.footer-link-groups {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-8) var(--space-6);
	}

	.footer-link-group {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	/* Group titles — the data voice: mono small-caps over a hairline. */
	.footer-group-title {
		font-family: var(--font-family-mono);
		color: var(--color-footer-text-muted);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
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

	/* Links — the data voice. These are database columns ("ORCID", "RSS feed",
	 * "llms.txt"), so they are mono at the small tier, mixed case: uppercase
	 * would turn the imprint below into a wall. */
	.footer-link {
		display: inline-flex;
		align-items: flex-start;
		gap: var(--space-2);
		font-family: var(--font-family-mono);
		color: var(--color-footer-text-muted);
		text-decoration: none;
		padding: var(--space-1) 0;
		transition: color var(--duration-fast) var(--ease-out);
	}

	/* Coarse pointers get the 44px guideline. */
	@media (--touch) {
		.footer-link {
			min-height: var(--space-11);
			align-items: center;
		}
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
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-figures);
		line-height: var(--line-height-snug);
		/* Labels are short and are index keys: they break the column, not
		 * themselves. The imprint below is the only wrapping text here. */
		white-space: nowrap;
	}

	.footer-link:hover {
		color: var(--color-footer-accent);
	}

	.footer-link:hover .footer-link-icon {
		opacity: 1;
	}

	/* The imprint — the postal record, set as the same data voice one step
	 * quieter, hanging under the Contact group. */
	.footer-address {
		display: flex;
		flex-direction: column;
		font-family: var(--font-family-mono);
		font-style: normal;
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		line-height: var(--line-height-snug);
		color: var(--color-footer-text-muted);
		margin-top: var(--space-4);
		padding-top: var(--space-3);
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-footer-text) 20%, transparent);
		gap: var(--space-0-5);
	}

	.footer-address-link {
		color: var(--color-footer-text);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	@media (--touch) {
		.footer-address-link {
			display: inline-flex;
			align-items: center;
			min-height: var(--space-11);
		}
	}

	.footer-address-link:hover {
		color: var(--color-footer-accent);
	}

	/* Colophon rule — the signature line: © in mono, type credit in serif italic. */
	.footer-colophon {
		margin-top: var(--space-10);
		padding-top: var(--space-4);
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-4);
		flex-wrap: wrap;
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-footer-text) 20%, transparent);
	}

	.footer-copyright {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-footer-text-muted);
	}

	.footer-typecredit {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		color: var(--color-footer-text-muted);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.footer-typecredit:hover {
		color: var(--color-footer-accent);
	}

	/* Responsive design improvements */
	@media (--md) {
		.footer-container {
			grid-template-columns: minmax(15rem, 1.2fr) 2fr;
			gap: var(--space-12);
		}

		.footer-link-groups {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (--lg) {
		.site-footer {
			padding: var(--space-16) 0 var(--space-10) 0;
		}

		.footer-container {
			grid-template-columns: minmax(15rem, 1.2fr) 4fr;
			gap: var(--space-10);
		}

		/* Four groups on one row. Contact carries the imprint, whose longest line
		 * ("Forschungszentrum für Afrikastudien") measures 293.9px, so its column
		 * is given that much outright and the other three — single-line mono
		 * labels, none wider than 150px — share what is left. Proportional
		 * fractions could not express this: at 1.3fr the Contact column came out
		 * 116px short and the address broke mid-phrase. */
		.footer-link-groups {
			grid-template-columns: minmax(19rem, 1.35fr) 1fr 0.9fr 1fr;
		}
	}

	/* On paper the endpaper takes the print ground. The footer's colours are all
	 * tokens, so re-pointing the four of them carries the group rules, the
	 * imprint and the colophon with it. Left as it was, the daylight footer
	 * printed cream type on an ink slab — and with background graphics off, as
	 * browsers default, that is cream on white at ~1.6:1: a blank colophon. */
	@media print {
		.site-footer {
			--color-footer-bg: var(--color-print-ground);
			--color-footer-text: var(--color-print-ink);
			--color-footer-text-muted: var(--color-print-ink);
			--color-footer-accent: var(--color-print-ink);

			background: var(--color-print-ground);
			color: var(--color-print-ink);
			border-top: var(--rule-masthead) solid var(--color-print-ink);
		}
	}

	/* Focus states */
	.footer-link:focus-visible,
	.footer-address-link:focus-visible,
	.footer-typecredit:focus-visible {
		outline: var(--border-width-medium) solid var(--color-footer-accent);
		outline-offset: var(--border-width-medium);
	}
</style>
