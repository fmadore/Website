<script lang="ts">
	import { getCvDescription } from '$lib/utils/siteHelpers';
	import Icon from '@iconify/svelte';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import PdfGenerator from '$lib/components/cv/PdfGenerator.svelte';
	import CVHeader from '$lib/components/cv/CVHeader.svelte';
	import CVEducation from '$lib/components/cv/CVEducation.svelte';
	import CVAppointments from '$lib/components/cv/CVAppointments.svelte';
	import CVPublications from '$lib/components/cv/CVPublications.svelte';
	import CVTableOfContents from '$lib/components/cv/CVTableOfContents.svelte';
	// Every section is a static import, so the whole CV is in the prerendered
	// HTML. It used to ship three sections and fetch the other fourteen in four
	// timed batches after mount: `build/cv.html` held no Grants, Awards or
	// Invited Talks, the contents ledger pointed at anchors the document did not
	// contain, and the page spent 23 requests and 400 ms of self-imposed
	// latency on a staircase no reader could see the end of. The record's
	// completeness is the product; the request count is the bonus.
	import CVGrants from '$lib/components/cv/CVGrants.svelte';
	import CVAwards from '$lib/components/cv/CVAwards.svelte';
	import CVDigitalHumanities from '$lib/components/cv/CVDigitalHumanities.svelte';
	import CVInvitedTalks from '$lib/components/cv/CVInvitedTalks.svelte';
	import CVConferences from '$lib/components/cv/CVConferences.svelte';
	import CVEvents from '$lib/components/cv/CVEvents.svelte';
	import CVTeaching from '$lib/components/cv/CVTeaching.svelte';
	import CVResearchExperience from '$lib/components/cv/CVResearchExperience.svelte';
	import CVService from '$lib/components/cv/CVService.svelte';
	import CVConsulting from '$lib/components/cv/CVConsulting.svelte';
	import CVMedia from '$lib/components/cv/CVMedia.svelte';
	import CVLanguages from '$lib/components/cv/CVLanguages.svelte';
	import CVAffiliations from '$lib/components/cv/CVAffiliations.svelte';
	import CVComputerSkills from '$lib/components/cv/CVComputerSkills.svelte';

	import { resolve } from '$app/paths';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('CV', '/cv');
</script>

<SEO
	title="Curriculum Vitae | Frédérick Madore"
	description={getCvDescription()}
	keywords="CV, curriculum vitae, Frédérick Madore, research fellow, publications, academic career, Islam, West Africa"
	canonical="https://www.frederickmadore.com/cv"
	{breadcrumbs}
	pageType="ProfilePage"
/>

<div id="cv-content" class="cv-container p-8 max-w-6xl mx-auto">
	<!-- Action Buttons - positioned in top right corner of CV -->
	<div class="cv-actions">
		<a href={resolve('/cv/timeline')} class="btn btn-secondary">
			<Icon icon="lucide:trending-up" width="20" height="20" aria-hidden="true" />
			<span>Timeline</span>
		</a>
		<PdfGenerator />
	</div>

	<CVHeader />
	<div id="cv-appointments" class="cv-section-wrapper">
		<CVAppointments />
	</div>
	<div id="cv-education" class="cv-section-wrapper">
		<CVEducation />
	</div>
	<div id="cv-publications" class="cv-section-wrapper">
		<CVPublications />
	</div>

	<div id="cv-grants" class="cv-section-wrapper">
		<CVGrants />
	</div>
	<div id="cv-awards" class="cv-section-wrapper">
		<CVAwards />
	</div>
	<div id="cv-digital-humanities" class="cv-section-wrapper">
		<CVDigitalHumanities />
	</div>
	<div id="cv-invited-talks" class="cv-section-wrapper">
		<CVInvitedTalks />
	</div>
	<div id="cv-conferences" class="cv-section-wrapper">
		<CVConferences />
	</div>
	<div id="cv-events" class="cv-section-wrapper">
		<CVEvents />
	</div>
	<div id="cv-teaching" class="cv-section-wrapper">
		<CVTeaching />
	</div>
	<div id="cv-research-experience" class="cv-section-wrapper">
		<CVResearchExperience />
	</div>
	<div id="cv-service" class="cv-section-wrapper">
		<CVService />
	</div>
	<div id="cv-consulting" class="cv-section-wrapper">
		<CVConsulting />
	</div>
	<div id="cv-media" class="cv-section-wrapper">
		<CVMedia />
	</div>
	<div id="cv-languages" class="cv-section-wrapper">
		<CVLanguages />
	</div>
	<div id="cv-affiliations" class="cv-section-wrapper">
		<CVAffiliations />
	</div>
	<div id="cv-computer-skills" class="cv-section-wrapper">
		<CVComputerSkills />
	</div>
</div>

<CVTableOfContents />

<style>
	/*
	 * The CV is the purest ledger on the site: a single sheet of paper, no glass,
	 * no shadows, square corners. Every section is a ruled module; every
	 * entry is a ledger row (mono year key + serif content, hairline between).
	 */
	.cv-container {
		background: var(--color-background);
		border: var(--border-width-thin) solid var(--color-border);
		position: relative;
		margin-top: var(--space-lg);
		margin-bottom: var(--space-2xl);
	}

	/* Action buttons — document chrome, tucked to the top right of the sheet
	 * like a letterhead's utility row instead of a centered button bar. */
	.cv-actions {
		display: flex;
		gap: var(--space-md);
		align-items: center;
		justify-content: flex-start;
		margin-bottom: var(--space-md);
		position: relative;
		z-index: 10;
		flex-wrap: wrap;
		padding-bottom: var(--space-2);
	}

	@media (--md) {
		.cv-actions {
			justify-content: flex-end;
			margin-bottom: 0;
		}
	}

	/* Scroll offset for anchor navigation past sticky header */
	:global(.cv-section-wrapper[id]) {
		scroll-margin-top: calc(var(--space-16) + var(--space-4));
	}

	/* Each section module — a section-rule (3px ink) across the top,
	 * generous air above, like the .section idiom used site-wide. The <section>
	 * inside carries the rule so the header's contact <section> (which lives
	 * outside a .cv-section-wrapper) stays un-ruled. */
	:global(.cv-section-wrapper) {
		margin-bottom: 0;
	}

	:global(.cv-section-wrapper > section) {
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--rule-gap);
		margin-top: var(--space-2xl);
		margin-bottom: 0;
	}

	/*
	 * Section heading — DOCUMENT voice (Archivo display). These two rules are
	 * `.section` and `.section-title` from ink-signal.css, applied by descendant
	 * selector rather than by class: the seventeen `<h3>`s live in seventeen
	 * components, and `section > h3` is the contract the PDF generator reads the
	 * sheet by. Keep the values in step with the idiom — if they ever diverge,
	 * the divergence is the bug.
	 */
	:global(#cv-content h3) {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-2xl);
		font-weight: 750;
		letter-spacing: var(--tracking-display-sm);
		line-height: 1.05;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-md);
		padding-bottom: 0;
		border-bottom: none;
	}

	/* Subsection labels (BOOKS, ARTICLES, INSTRUCTOR…) — DATA voice: small mono
	 * uppercase, letterspaced, quiet ink, over a hairline. */
	:global(#cv-content h4) {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: var(--space-lg) 0 var(--space-1);
		padding-bottom: var(--space-1-5);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
	}

	/* Empty-state note. */
	:global(#cv-content .cv-empty) {
		font-family: var(--font-family-serif);
		font-style: italic;
		color: var(--color-text-light);
	}

	/* Ledger rows are contiguous — the hairline is drawn by each row's border-top,
	 * so cancel the .space-y-3 inter-row margin that would otherwise gap them. */
	:global(#cv-content .ledger.space-y-3 > * + *) {
		margin-top: 0;
	}

	/* Non-ledger stacked content keeps a small rhythm. */
	:global(#cv-content .space-y-3:not(.ledger) > * + *) {
		margin-top: var(--space-2);
	}

	/* The ledger closes itself: every CV ledger carries `.ledger--ruled`, so the
	 * final row's bottom hairline comes from the idiom rather than from a
	 * `:last-child .cv-entry` reach-in here. */

	/*
	 * Links — the site's own link language, not a local dialect.
	 *
	 * This page carried `#cv-content a { color: var(--color-accent) }`, which
	 * inverted it: site-wide a link is *ink* with a pine underline in prose, and
	 * here it was pine text with no underline. On the page with by far the most
	 * links on the site — 41 DOIs, plus [Link]s, review journals, award and
	 * grant titles, project addresses and five contact handles — that put pine
	 * on ten to fifteen strings per screen. The accent means "the current
	 * thing"; a CV's two hundred addresses are not current, and at that density
	 * it meant nothing at all.
	 *
	 * The id selector was also the reason two components' own quiet colours
	 * were dead: `.doi-link` (soft ink) and `.verification-badge` (muted ink)
	 * are 0-1-0 and lost to a 1-0-1 page rule, so both rendered accent instead
	 * of what their author wrote. `:where()` drops this to 0-0-1 so a component
	 * class wins by simply existing, which is what those rules assumed.
	 *
	 * What is left: the base `a` (ink, pine on hover) and, inside `<p>`/`<li>`,
	 * typography.css's pine prose underline. Pine on the sheet is now the
	 * dateline and the one standing appointment.
	 */
	:global(#cv-content :where(a)) {
		transition: color var(--duration-fast) var(--ease-out);
	}

	:global(#cv-content a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-thin);
	}

	:global(#cv-content a.review-link) {
		font-style: italic;
		text-decoration: none;
	}

	:global(#cv-content a.review-link:hover) {
		text-decoration: underline;
	}

	/*
	 * Print styles. The `!important`s are deliberate and are the one place this
	 * codebase sanctions them beyond third-party overrides: a print sheet has to
	 * beat component-scoped declarations it cannot otherwise reach.
	 */
	@media print {
		/* The page-enter fade is the only animation these carry. */
		.cv-container,
		:global(.cv-section-wrapper) {
			animation: none !important;
			opacity: 1 !important;
		}

		/* Optimize for print — flat sheet, no border, ledger rules preserved. */
		.cv-container {
			max-width: 100% !important;
			padding: var(--space-10) !important;
			margin: 0 !important;
			border: none !important;
			background: var(--color-white) !important;
		}

		/* Drop the surface tints; the stock is the ground. */
		:global(.surface),
		:global(.surface-card),
		:global(.surface-panel),
		:global(.cv-section-wrapper) {
			background: var(--color-white) !important;
		}

		/* Keep the ledger's ink rules in print: section rule + row hairlines. */
		:global(.cv-section-wrapper > section) {
			border-top: var(--rule-section) solid var(--color-primary) !important;
		}

		:global(#cv-content .cv-entry) {
			border-top: var(--rule-hairline) solid var(--color-hairline) !important;
		}

		:global(#cv-content h4) {
			border-bottom: var(--rule-hairline) solid var(--color-hairline) !important;
		}

		/* Ink on stock, not pure black on pure white: the browser-printed sheet
		 * and the exported PDF are the same document and must be set in the same
		 * ink. The ground stays `--color-white` because a printed ground is the
		 * paper itself — painting warm paper onto warm paper only spends toner. */
		:global(body) {
			background: var(--color-white) !important;
			color: var(--color-primary) !important;
		}

		/* Page breaks */
		:global(#cv-content section) {
			page-break-inside: avoid;
		}

		:global(#cv-content h3) {
			page-break-after: avoid;
		}

		/* Links — ink underline in print (accent reads muddy on paper). */
		:global(#cv-content a) {
			color: var(--color-primary) !important;
			text-decoration: underline !important;
		}

		/* Show URLs after external links for print (academic CV best practice).
		 * `.link-url` opts out: those links already print the URL as their text
		 * (DH project addresses), so appending the href would double it. */
		:global(#cv-content a[href^='http']:not(.doi-link):not(.link-url))::after {
			content: ' (' attr(href) ')';
			font-size: 0.75em;
			font-weight: normal;
			color: var(--color-text-light);
			word-break: break-all;
		}

		/* DOI links print their own identifier as link text, so no href suffix. */

		/* Hide action buttons in print */
		.cv-actions {
			display: none !important;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.cv-container,
		:global(.cv-section-wrapper) {
			animation: none !important;
			transition: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>
