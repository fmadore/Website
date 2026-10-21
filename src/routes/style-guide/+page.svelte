<script lang="ts">
	import SEO from '#lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '#lib/utils/seoUtils.ts';
	import { resolve } from '$app/paths';
	import { assetHref } from '#lib/utils/paths.ts';
	import PageHeader from '#lib/components/common/PageHeader.svelte';
	import PageIntro from '#lib/components/common/PageIntro.svelte';
	import ContentsLedger from '#lib/components/common/ContentsLedger.svelte';
	import type { ContentsLedgerItem } from '#lib/components/common/ContentsLedger.svelte';
	import Button from '#lib/components/atoms/Button.svelte';
	import RecordLedger from '#lib/components/molecules/RecordLedger.svelte';
	import Pagination from '#lib/components/molecules/Pagination.svelte';
	import type { MetaRow } from '#lib/components/molecules/RecordLedger.svelte';
	import FacetCombobox from '#lib/components/entity-index/FacetCombobox.svelte';
	import VizDataTable from '#lib/components/visualisations/VizDataTable.svelte';
	import { scaleKeyTerms } from '#lib/utils/keyTerms.ts';
	import { formatReferenceText } from '#lib/utils/citationFormatter.ts';
	import { PUBLICATION_TYPE_BADGE_LABELS } from '#lib/utils/publicationTypeLabels.ts';
	import {
		allPublicationSummaries as allPublications,
		publicationSummariesByYear as publicationsByYear,
		publicationSummaryTags as allTags
	} from '#lib/data/publications/summaries.ts';
	import { allCommunicationSummaries as allCommunications } from '#lib/data/communications/summaries.ts';
	import { activitySummariesByDate as activitiesByDate } from '#lib/data/activities/summaries.ts';
	import { tallyBy } from '#lib/utils/vizAggregation.ts';
	/* The index pages' search field is documented in § 5, so the guide loads the
	 * stylesheet that owns it rather than restating its declarations locally —
	 * a restatement is exactly the drift this page exists to prevent. */
	import '#styles/components/entity-index.css';

	const breadcrumbs = createSectionBreadcrumbs('Style Guide', '/style-guide');

	/* ===== Colour tokens — the guide reads the live values off :root, so a
	 * token edit in variables.css (or dark.css) re-documents itself here. ===== */
	const colourGroups = [
		{
			id: 'colour-grounds',
			label: 'Grounds and surfaces',
			tokens: [
				'--color-background',
				'--color-surface',
				'--color-background-muted',
				'--color-surface-elevated'
			]
		},
		{
			id: 'colour-ink',
			label: 'Ink: the structural colour',
			tokens: ['--color-primary', '--color-primary-dark', '--color-text-inverted']
		},
		{
			id: 'colour-text',
			label: 'Text ramp: four steps, both themes',
			tokens: ['--color-text', '--color-text-soft', '--color-text-light', '--color-text-muted']
		},
		{
			id: 'colour-accent',
			label: 'Accent: pine',
			tokens: ['--color-accent', '--color-accent-dark']
		},
		{
			id: 'colour-borders',
			label: 'Hairlines, borders and focus',
			tokens: ['--color-hairline', '--color-border', '--color-border-dark', '--color-border-focus']
		},
		{
			id: 'colour-functional',
			label: 'Functional',
			tokens: ['--color-danger', '--color-danger-dark', '--color-success']
		},
		{
			id: 'colour-footer',
			label: 'Footer: the endpaper',
			tokens: [
				'--color-footer-bg',
				'--color-footer-text',
				'--color-footer-text-muted',
				'--color-footer-accent'
			]
		},
		{
			id: 'colour-print',
			label: 'Print: the third ground',
			tokens: ['--color-print-ground', '--color-print-ink']
		},
		{
			id: 'colour-viz',
			label: 'Visualisation palette (OKLCH, derived from ink + pine)',
			tokens: [
				'--sys-viz-1',
				'--sys-viz-2',
				'--sys-viz-3',
				'--sys-viz-4',
				'--sys-viz-5',
				'--sys-viz-6',
				'--sys-viz-7'
			]
		},
		{
			id: 'colour-timeline',
			label: 'Timeline: the viz palette by category',
			tokens: [
				'--color-timeline-positions',
				'--color-timeline-education',
				'--color-timeline-grants',
				'--color-timeline-publications',
				'--color-timeline-presentations',
				'--color-timeline-awards',
				'--color-timeline-fieldwork'
			]
		}
	];

	/* ===== The anchor layer, both themes at once =====
	 * Every literal in the system is a `--sys-*` anchor, and every anchor is
	 * declared on `:root` whichever theme is on, so both palettes can be read
	 * side by side here. Each row is a role; the daylight cell names the anchor
	 * the semantic token points at in daylight, the midnight cell the one it
	 * points at under `html.dark`. The two emphatic midnight steps are not
	 * anchors but a mix of one toward the cream, so the cell paints that mix
	 * from the anchors and says so. */
	type AnchorCell = string | { mix: string };
	const anchorPairs: { role: string; day: AnchorCell; night: AnchorCell }[] = [
		{ role: 'Page ground', day: '--sys-color-paper', night: '--sys-color-film-ground' },
		{ role: 'Surface', day: '--sys-color-paper-surface', night: '--sys-color-film-100' },
		{ role: 'Muted surface', day: '--sys-color-paper-200', night: '--sys-color-film-200' },
		{ role: 'Raised sheet', day: '--sys-color-paper-raised', night: '--sys-color-film-200' },
		{ role: 'Hairline', day: '--sys-color-paper-hairline', night: '--sys-color-film-hairline' },
		{ role: 'Border', day: '--sys-color-paper-border', night: '--sys-color-film-border' },
		{
			role: 'Strong border',
			day: '--sys-color-paper-border-strong',
			night: '--sys-color-film-border-strong'
		},
		{ role: 'Text', day: '--sys-color-ink', night: '--sys-color-cream' },
		{ role: 'Text soft', day: '--sys-color-ink-soft', night: '--sys-color-cream-soft' },
		{ role: 'Text light', day: '--sys-color-ink-muted', night: '--sys-color-cream-muted' },
		{ role: 'Text muted', day: '--sys-color-ink-faint', night: '--sys-color-cream-faint' },
		{ role: 'Solid-fill hover', day: '--sys-color-ink-deep', night: '--sys-color-paper-raised' },
		{ role: 'Accent', day: '--sys-color-pine', night: '--sys-color-pine-bright' },
		{
			role: 'Accent hover',
			day: '--sys-color-pine-deep',
			night: { mix: '--sys-color-pine-bright' }
		},
		{ role: 'Danger', day: '--sys-color-danger', night: '--sys-color-danger-bright' },
		{
			role: 'Danger hover',
			day: '--sys-color-danger-deep',
			night: { mix: '--sys-color-danger-bright' }
		},
		{ role: 'Success', day: '--sys-color-success', night: '--sys-color-success-bright' }
	];
	const anchorTokens = [
		...new Set(
			anchorPairs.flatMap((row) =>
				[row.day, row.night].filter((cell): cell is string => typeof cell === 'string')
			)
		)
	];

	const durationTokens = [
		'--duration-instant',
		'--duration-fast',
		'--duration-normal',
		'--duration-moderate',
		'--duration-slow'
	];

	const easeTokens = ['--ease-out', '--ease-in-out'];

	const focusTokens = ['--focus-outline', '--focus-outline-offset', '--focus-outline-inset'];

	/* The whole semantic scale, in size order (`xl-tight` sits between lg and
	 * xl), then the two reading intervals and the rule gap. Each bar is drawn
	 * at the token's own width, and its value is read off `:root`. */
	const spaceTokens = [
		'--space-3xs',
		'--space-2xs',
		'--space-xs',
		'--space-sm',
		'--space-md',
		'--space-lg',
		'--space-xl-tight',
		'--space-xl',
		'--space-2xl',
		'--space-3xl',
		'--space-4xl',
		'--space-reading',
		'--space-reading-loose',
		'--rule-gap'
	];

	/* ===== Contextual sizes — the roles that sit outside the ladder. ===== */
	const contextSizes = [
		{
			token: '--font-size-prose',
			cast: 'serif',
			specimen: 'Running prose in a long-form column.',
			use: 'every long-form column; 1.1875rem below --sm'
		},
		{
			token: '--font-size-prose-lead',
			cast: 'serif',
			specimen: 'The lead paragraph that opens it.',
			use: 'the opening paragraph; 1.425rem below --sm'
		},
		{
			token: '--font-size-display',
			cast: 'display',
			specimen: 'Publications',
			use: 'the index masthead title; one ladder step down below --2xs-down'
		},
		{
			token: '--font-size-nameplate',
			cast: 'nameplate',
			specimen: 'Madore',
			use: 'the home nameplate; 2rem below --2xs-down'
		}
	];

	/* ===== Line height — the four steps and the three roles that alias them. */
	const lineHeights = [
		{ token: '--line-height-tight', use: 'display heads, big data numbers' },
		{ token: '--line-height-snug', use: 'serif titles, the print body' },
		{ token: '--line-height-normal', use: 'controls and dense UI text' },
		{ token: '--line-height-relaxed', use: 'notes and prose at reading size' },
		{ token: '--line-height-heading', use: 'the heading role' },
		{ token: '--line-height-body', use: 'the body role' },
		{ token: '--line-height-caption', use: 'captions and fine print' }
	];

	/* ===== Width presets — Archivo's wdth axis, one per display tier. ===== */
	const variationPresets = [
		{ token: '--font-variation-nameplate', use: 'the home nameplate' },
		{ token: '--font-variation-wordmark', use: 'the header wordmark' },
		{ token: '--font-variation-display', use: 'h1, index and record titles' },
		{ token: '--font-variation-headline', use: 'h2, h3 and every section head' }
	];

	/* ===== Breakpoints and media features — `base/media.css`, verbatim. ===== */
	const customMedia = [
		{ name: '--sm', query: '(min-width: 640px)', use: 'the column stops being the screen' },
		{ name: '--md', query: '(min-width: 768px)', use: 'grids open to two and three columns' },
		{ name: '--lg', query: '(min-width: 1024px)', use: 'the record rail and facet grid dock' },
		{ name: '--xl', query: '(min-width: 1280px)', use: 'the desktop navigation shows' },
		{ name: '--2xl', query: '(min-width: 1536px)', use: 'the widest container step' },
		{
			name: '--2xs-down',
			query: '(max-width: 374px)',
			use: 'the nameplate and index title step down'
		},
		{ name: '--xs-down', query: '(max-width: 479px)', use: 'the smallest phones' },
		{ name: '--sm-down', query: '(max-width: 639px)', use: 'the reading tier steps up to 19px' },
		{ name: '--md-down', query: '(max-width: 767px)', use: 'phone and small tablet overrides' },
		{ name: '--lg-down', query: '(max-width: 1023px)', use: 'the rail dissolves into the column' },
		{ name: '--xl-down', query: '(max-width: 1279px)', use: 'the masthead opens a panel instead' },
		{ name: '--2xl-down', query: '(max-width: 1535px)', use: 'below the widest step' },
		{
			name: '--can-hover',
			query: '(hover: hover) and (pointer: fine)',
			use: 'effects that need a precise pointer'
		},
		{ name: '--touch', query: '(hover: none), (pointer: coarse)', use: 'the 44px touch floor' },
		{ name: '--print', query: 'print', use: 'the Paper Rule' },
		{ name: '--retina', query: '(min-resolution: 2dppx)', use: 'high-density displays' },
		{ name: '--landscape', query: '(orientation: landscape)', use: 'orientation' },
		{ name: '--portrait', query: '(orientation: portrait)', use: 'orientation' },
		{
			name: '--reduced-motion',
			query: '(prefers-reduced-motion: reduce)',
			use: 'transitions off, scrolling instant'
		},
		{ name: '--high-contrast', query: '(prefers-contrast: more)', use: 'thicker edges and rings' },
		{
			name: '--dark-mode',
			query: '(prefers-color-scheme: dark)',
			use: 'the OS preference; the theme class decides'
		}
	];

	/* ===== Tracking — a role scale keyed to size.
	 * Eight roles, three voices. Each row below is set in the token's own face,
	 * at its own size, with its own tracking, so the specimen *is* the token
	 * rather than a description of one. Values are read off `:root` by the same
	 * reader as the colour swatches. ===== */
	const trackingRoles = [
		{
			token: '--tracking-display-lg',
			heading: 'h1' as HeadingTag,
			role: 'Display lg',
			cast: 'tracking-specimen--display',
			size: '--font-size-4xl',
			specimen: 'Signal',
			use: 'the nameplate, --font-size-display, 5xl'
		},
		{
			token: '--tracking-display',
			heading: 'h2' as HeadingTag,
			role: 'Display',
			cast: 'tracking-specimen--display',
			size: '--font-size-3xl',
			specimen: 'Signal',
			use: 'h1–h2 at 4xl and 3xl: page and record titles'
		},
		{
			token: '--tracking-display-sm',
			heading: 'h3' as HeadingTag,
			role: 'Display sm',
			cast: 'tracking-specimen--display',
			size: '--font-size-xl',
			specimen: 'Publications',
			use: 'h3 and below, 2xl to base: section heads, wordmarks'
		},
		{
			token: '--tracking-title',
			role: 'Title',
			cast: 'tracking-specimen--title',
			size: '--font-size-lg',
			specimen: 'The archive, read closely',
			use: 'every Newsreader title: h4–h5, ledger and bibliography rows'
		},
		{
			token: '--tracking-eyebrow',
			role: 'Eyebrow',
			cast: 'eyebrow',
			size: '--font-size-2xs',
			specimen: '§ 2 · Typography',
			use: 'the kicker, one per module: eyebrows, § numbers, facet heads'
		},
		{
			token: '--tracking-label',
			role: 'Label',
			cast: 'dateline',
			size: '--font-size-2xs',
			specimen: 'Dossiers · 5 projects',
			use: 'the 2xs default: stamps, kinds, nav, pager, datelines, actions'
		},
		{
			token: '--tracking-caps',
			role: 'Caps',
			cast: 'chip',
			size: '--font-size-2xs',
			specimen: 'ISLAM 33',
			use: 'the compact tier: buttons, h6, and dense caps set in runs'
		},
		{
			token: '--tracking-figures',
			role: 'Figures',
			cast: 'tracking-specimen--figures',
			size: '--font-size-2xs',
			specimen: '10.1017/S0001972023000123',
			use: 'mixed-case mono at any size: DOIs, counts, years, meta values'
		}
	];

	/* ===== Weight — the microfilm compensation.
	 * Midnight remaps the three shared weights forty lighter; the specimens
	 * below carry no literal weight of their own, so each row prints whichever
	 * value the live theme resolves the token to. ===== */
	const weightSteps = [
		{
			token: '--font-weight-normal',
			role: 'Normal',
			use: 'body prose, ledger descriptions'
		},
		{
			token: '--font-weight-medium',
			role: 'Medium',
			use: 'ledger keys, datelines, chips'
		},
		{
			token: '--font-weight-semibold',
			role: 'Semibold',
			use: 'nav, status stamps, serif titles'
		},
		{
			token: '--font-weight-bold',
			role: 'Bold',
			use: 'eyebrows, § numbers'
		}
	];

	const allResolvableTokens = [
		...colourGroups.flatMap((g) => g.tokens),
		...anchorTokens,
		...durationTokens,
		...easeTokens,
		...spaceTokens,
		...contextSizes.map((s) => s.token),
		...lineHeights.map((l) => l.token),
		...variationPresets.map((v) => v.token),
		'--measure-title',
		...focusTokens,
		...trackingRoles.map((r) => r.token),
		...weightSteps.map((w) => w.token)
	];

	/* Every colour this page swatches, counted once: the semantic tokens and the
	 * anchors under them. The contents ledger and the stat ledger both print it. */
	const colourTokenCount = new Set([...colourGroups.flatMap((g) => g.tokens), ...anchorTokens])
		.size;

	// Resolved values, read client-side and re-read when the theme class flips —
	// so the printed hex is always the value actually painting the swatch.
	let resolved = $state<Record<string, string>>({});

	$effect(() => {
		const read = () => {
			const styles = getComputedStyle(document.documentElement);
			const next: Record<string, string> = {};
			for (const token of allResolvableTokens) {
				next[token] = styles.getPropertyValue(token).trim();
			}
			resolved = next;
		};
		read();
		const observer = new MutationObserver(read);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	/* ===== Type scale — forked ratios: body tier (minor third) set in
	 * Newsreader, display tier (major third) set in Archivo. ===== */
	const bodyScale = [
		'--font-size-2xs',
		'--font-size-xs',
		'--font-size-sm',
		'--font-size-base',
		'--font-size-lg'
	];
	/* Each display step is set in the cut of the heading tier that uses it
	 * (`cast`), with that tier's tracking role. The two steps no heading uses
	 * borrow the nearest tier's cut. */
	const displayScale: { token: string; cast: HeadingTag; tracking: string; label: string }[] = [
		{ token: '--font-size-xl', cast: 'h3', tracking: '--tracking-display-sm', label: 'h3 cut' },
		{ token: '--font-size-2xl', cast: 'h3', tracking: '--tracking-display-sm', label: 'h3' },
		{ token: '--font-size-3xl', cast: 'h2', tracking: '--tracking-display', label: 'h2' },
		{ token: '--font-size-4xl', cast: 'h1', tracking: '--tracking-display', label: 'h1' },
		{ token: '--font-size-5xl', cast: 'h1', tracking: '--tracking-display-lg', label: 'h1 cut' }
	];

	/* ===== Heading casts — read off live headings.
	 * The display tier's weights and width presets are literals in
	 * `typography.css` (830 / 780 / 750), not tokens, so the specimens below
	 * read them off a real h1, h2 and h3 rather than restating them. Weights
	 * are theme-independent (the display heads are not compensated), so one
	 * read on mount is enough. */
	type HeadingTag = 'h1' | 'h2' | 'h3';
	let headingCasts = $state<Partial<Record<HeadingTag, { weight: string; variation: string }>>>({});

	$effect(() => {
		const host = document.createElement('div');
		host.setAttribute('aria-hidden', 'true');
		host.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;';
		const tags: HeadingTag[] = ['h1', 'h2', 'h3'];
		for (const tag of tags) host.appendChild(document.createElement(tag)).textContent = 'Signal';
		document.body.appendChild(host);
		const next: Partial<Record<HeadingTag, { weight: string; variation: string }>> = {};
		tags.forEach((tag, i) => {
			const styles = getComputedStyle(host.children[i]!);
			next[tag] = { weight: styles.fontWeight, variation: styles.fontVariationSettings };
		});
		host.remove();
		headingCasts = next;
	});

	/* ===== Reading measure — the three prose roles.
	 * `ch` is the advance width of "0", not the width of one character, so the
	 * ch number in a token says nothing directly about how long a line reads.
	 * This block therefore MEASURES each role in the live font rather than
	 * restating its token, and re-documents itself if a token changes. ===== */
	const measureRoles = [
		{
			token: '--measure-prose',
			role: 'Prose',
			size: '--font-size-base',
			use: 'The reading default: body copy, ledger descriptions, abstracts and CV entries.'
		},
		{
			token: '--measure-standfirst',
			role: 'Standfirst',
			size: '--font-size-lead',
			use: 'The italic deck under a page title, set one step short of the prose measure.'
		},
		{
			token: '--measure-note',
			role: 'Note',
			size: '--font-size-sm',
			use: 'Captions, review sources and the footer: the fine print, shortest of the three.'
		}
	];

	let measured = $state<Record<string, { ch: string; px: number; chars: number }>>({});

	$effect(() => {
		const probe = document.createElement('div');
		probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;';
		probe.style.fontFamily = 'var(--font-family-serif)';
		document.body.appendChild(probe);

		// A representative line of this site's prose: English and French, with
		// the diacritics that actually occur in the corpus.
		const sample =
			"Cet article examine l'activisme religieux des étudiants musulmans sur les campus " +
			'universitaires du Togo et du Bénin. Drawing on fieldwork in Lomé and Cotonou, it traces ' +
			'how these associations negotiated their place within a secular state.';

		const next: Record<string, { ch: string; px: number; chars: number }> = {};
		for (const role of measureRoles) {
			probe.style.fontSize = `var(${role.size})`;
			// 1 — resolve the cap to px against this role's own font size.
			probe.textContent = '';
			probe.style.width = `var(${role.token})`;
			const capPx = probe.getBoundingClientRect().width;
			// 2 — average character width of real prose in the same font.
			probe.style.width = 'auto';
			probe.textContent = sample;
			const avgChar = probe.getBoundingClientRect().width / sample.length;
			next[role.token] = {
				ch: getComputedStyle(document.documentElement).getPropertyValue(role.token).trim(),
				px: Math.round(capPx),
				chars: Math.round(capPx / avgChar)
			};
		}
		probe.remove();
		measured = next;
	});

	/* ===== Drawn depth — the surface ramp.
	 * Three grounds, deliberately close in value: separation is drawn by the
	 * rule above a region, never by the step under it. Printed live so the
	 * midnight collapse recorded beneath them can be read rather than asserted. */
	const depthSteps = [
		{ token: '--color-background', use: 'the page ground' },
		{ token: '--color-surface', use: 'a plate, a panel, a combobox listbox' },
		{ token: '--color-surface-elevated', use: 'the raised sheet: a card, a tile' }
	];

	/* ===== The hairline pairing =====
	 * A rule and a box edge are different jobs on the same 1px width, and the
	 * failure mode is silent: draw a separator in --color-border and it simply
	 * reads as a plate edge, flattening the ramp with nothing to catch it. Both
	 * tokens are already in `resolved` above, so the hexes printed here are the
	 * ones actually painting, in whichever theme is on. */
	const pairings = [
		{
			mark: 'A rule separates',
			decl: 'var(--rule-hairline) solid var(--color-hairline)',
			token: '--color-hairline',
			use: 'ledger rows, entry separators, facet labels'
		},
		{
			mark: 'A box edge encloses',
			decl: 'var(--border-width-thin) solid var(--color-border)',
			token: '--color-border',
			use: 'cards, image plates, inputs, chips'
		}
	];

	/* ===== Rules ===== */
	const ruleSpecs = [
		{ class: 'rule-nameplate', token: '--rule-nameplate · 5px', use: 'the nameplate' },
		{ class: 'rule-masthead', token: '--rule-masthead · 4px', use: 'mastheads, the footer' },
		{ class: 'rule-section', token: '--rule-section · 3px', use: 'section openings' },
		{ class: 'rule-hairline', token: '--rule-hairline · 1px', use: 'ledger rows, entry separators' }
	];

	/* ===== The ledger family — every variant § 4 sets, named once so the
	 * contents ledger's count cannot drift from what the section shows. ===== */
	const ledgerVariants = [
		'Two-column row',
		'Three-column row',
		'The apparatus line',
		'The row action',
		'The tight ledger',
		'The meta-ledger',
		'The cite block'
	];

	/* ===== Controls — every button skin `buttons.css` defines, in the order it
	 * defines them. Rendered as real controls, so each one is focusable and its
	 * hover, focus and disabled states can be reached from this page. ===== */
	const buttonSkins = [
		{ variant: 'primary', note: 'The standard primary action: a solid ink fill with paper text.' },
		{
			variant: 'accent',
			note: 'The single hero call to action per screen, governed by the Scarcity Rule.'
		},
		{ variant: 'secondary', note: 'Transparent, on the strong-border edge; fills on hover.' },
		{
			variant: 'outline-primary',
			note: 'An ink outline that inverts to a solid ink fill on hover.'
		},
		{ variant: 'outline-secondary', note: 'The quiet outline: the second control in a stack.' },
		{
			variant: 'outline-accent',
			note: 'A pine outline that inverts to a solid pine fill on hover.'
		},
		{ variant: 'ghost', note: 'Faint ink, no border: the tertiary tier.' },
		{
			variant: 'danger',
			note:
				'Destructive actions. Nothing on this site destroys anything, so it has no consumer. The ' +
				'label clears AA on both fills: 6.4:1 in daylight, and 4.79:1 on the bright midnight step ' +
				'under film-ground text. Hover takes --color-danger-dark, a real deeper red in daylight ' +
				'(9.3:1) and, in midnight, the bright red lifted a quarter toward the cream.'
		},
		{ variant: 'surface', note: 'The flat outlined control that replaced the retired glass skin.' }
	];

	const buttonSizes = [
		{ size: 'sm', label: 'Small' },
		{ size: 'base', label: 'Default' },
		{ size: 'lg', label: 'Large' }
	];

	/* ===== Real data — the only ornament this page is allowed. ===== */
	const tagCounts: Record<string, number> = {};
	for (const pub of allPublications) {
		for (const tag of pub.tags ?? []) {
			tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
		}
	}
	const topTags = Object.entries(tagCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3);

	/* The key-terms cloud, on the real publications keyword vocabulary. Sizes
	 * come from `scaleKeyTerms` — a square-root scale, because type size reads
	 * as area — so the cloud on this page is the one the visualisation pages
	 * draw, at the same limit those pages would use for a rail-width column. */
	const KEY_TERM_LIMIT_HERE = 40;
	const keywordTerms = scaleKeyTerms(
		Object.entries(tagCounts).map(([word, count]) => ({ word, count })),
		{ limit: KEY_TERM_LIMIT_HERE }
	);

	/* A record's own keyword run, as `BibliographyRow` and /digital-humanities
	 * set it: apparatus annotating an entry, not controls the reader operates. */
	const apparatusTerms = topTags.map(([tag]) => tag);

	// The facet combobox below runs on the real publications tag vocabulary; its
	// picks narrow nothing here, they only demonstrate the selected state.
	let demoFacetTags = $state<string[]>([]);
	function toggleDemoFacetTag(tag: string) {
		demoFacetTags = demoFacetTags.includes(tag)
			? demoFacetTags.filter((t) => t !== tag)
			: [...demoFacetTags, tag];
	}

	// The chip row and the pager are real controls, so selected-by-interaction
	// and the current page are reachable rather than merely drawn. They narrow
	// and paginate nothing: this page is the specimen, not the list.
	let demoChip = $state(0);
	let demoPage = $state(1);
	let demoSearch = $state('');
	let demoField = $state('');

	const pubYears = Object.keys(publicationsByYear)
		.map(Number)
		.sort((a, b) => a - b);
	const firstYear = pubYears[0] ?? 0;
	const lastYear = pubYears[pubYears.length - 1] ?? 0;
	const yearRange =
		pubYears.length > 0
			? Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i)
			: [];
	const yearCounts = yearRange.map((year) => publicationsByYear[year]?.length ?? 0);
	const maxYearCount = Math.max(...yearCounts);

	/* Newest-first tallies for the year-meter demo in § 6 — the same publication
	 * data the bar strip above it draws, read as a ledger instead of a strip. */
	const meterYears = [...pubYears]
		.reverse()
		.slice(0, 6)
		.map((year) => {
			const count = publicationsByYear[year]?.length ?? 0;
			return { year, count, pct: maxYearCount > 0 ? (count / maxYearCount) * 100 : 0 };
		});

	/* The same publications, read as a share of a whole instead of a run of
	 * years, for the proportion-ledger demo below the meter. A work declaring
	 * two languages is counted once in each, so the denominator is the language
	 * tally rather than the work count — which is exactly the case the ledger
	 * handles better than a pie, since the shares need not sum to the corpus. */
	const languageShares = (() => {
		const tally = tallyBy(allPublications, (pub) => pub.language?.split(','));
		const total = tally.reduce((sum, entry) => sum + entry.count, 0);
		return total === 0
			? []
			: tally.map(({ key, count }) => ({
					language: key,
					count,
					pct: (count / total) * 100
				}));
	})();

	/* Spans rather than points, for the period-strip demo in § 6: the run of
	 * years each publication type covers, drawn over the same axis the bar strip
	 * above it uses. Real data, and the shape the idiom is for — a strip of
	 * Gantt bars answers "over which years" where the bar strip answers "how
	 * many". A type whose newest work is the corpus's newest year is still
	 * running, so it takes pine, which is what the accent means everywhere. */
	const typePeriods = (() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- build-time tally, not reactive state
		const spans = new Map<string, { start: number; end: number }>();
		for (const pub of allPublications) {
			const label = PUBLICATION_TYPE_BADGE_LABELS[pub.type] ?? pub.type;
			const span = spans.get(label);
			if (!span) {
				spans.set(label, { start: pub.year, end: pub.year });
			} else {
				span.start = Math.min(span.start, pub.year);
				span.end = Math.max(span.end, pub.year);
			}
		}
		const axis = Math.max(1, lastYear - firstYear);
		return [...spans.entries()]
			.sort((a, b) => a[1].start - b[1].start || a[1].end - b[1].end)
			.map(([label, span]) => ({
				label,
				current: span.end === lastYear,
				left: ((span.start - firstYear) / axis) * 100,
				// A type with a single year is a point on the axis; the floor keeps
				// it visible without overstating the span.
				width: Math.max(((span.end - span.start) / axis) * 100, 3)
			}));
	})();

	const stats = [
		{ label: 'Publications', value: allPublications.length, accent: true },
		{ label: 'Communications', value: allCommunications.length },
		{ label: 'Activities', value: activitiesByDate.length },
		{ label: 'Tags in the corpus', value: allTags.length },
		{ label: 'Colour tokens on this page', value: colourTokenCount }
	];

	/* Every idiom the data section sets on real data, in the order it sets
	 * them, named once for the contents count. */
	const dataIdioms = [
		'Year-bar strip',
		'Stat ledger',
		'Period strip',
		'Year meter',
		'Proportion ledger',
		'Key-terms cloud',
		'Chart table',
		'Empty plate and state note'
	];

	/* ===== Plates — real covers from the publications record, not stock or a
	 * portrait: DESIGN.md makes scans and covers from the corpus first-class
	 * imagery and rules out stock photography of any kind. ===== */
	const pagePlate = {
		src: 'images/publications/Cahiers-détudes-africaines-229.webp',
		width: 600,
		height: 901,
		alt: "Cover of Cahiers d'études africaines, issue 229"
	};
	const railPlate = {
		src: 'images/publications/muslim-minorities-africa.webp',
		width: 600,
		height: 908,
		alt: 'Cover of Islamic Africa, the Muslim minorities in Africa special issue'
	};
	const plates = [pagePlate, railPlate];

	/* The meta-ledger and cite-block demos read a real record out of the dataset
	 * and render it through the components every record page uses, so the guide's
	 * catalogue entry cannot drift from the one that ships — and its DOI is a live
	 * `.meta-link` that resolves, and that the link checker can hold to account,
	 * rather than a plausible-looking literal. Four rows of the rail's fuller set,
	 * which is enough to show the idiom. */
	const demoRecord = allPublications.find((item) => item.id === 'beninese-imam-election-2022');
	const demoMetaRows: MetaRow[] = demoRecord
		? [
				{ key: 'Type', value: PUBLICATION_TYPE_BADGE_LABELS[demoRecord.type] ?? demoRecord.type },
				{ key: 'Journal', value: demoRecord.journal ?? '' },
				{ key: 'Date', value: demoRecord.date },
				...(demoRecord.doi
					? [
							{
								key: 'DOI',
								value: demoRecord.doi,
								href: `https://doi.org/${demoRecord.doi}`,
								external: true,
								accent: true,
								icon: 'academicons:doi'
							}
						]
					: [])
			]
		: [];

	/* The same formatter the record rail and the MCP server call, on the same
	 * record — the claim the cite-block caption makes, made literally true. */
	const demoReference = demoRecord ? formatReferenceText(demoRecord, { doi: true }) : '';

	/* ===== Colophon — the three families, and where the system lives. ===== */
	const typefaces = [
		{
			id: 'archivo',
			name: 'Archivo',
			role: 'Display',
			credit: 'Omnibus-Type · SIL Open Font License 1.1',
			note: 'A grotesque drawn for newspaper headlines and high-performance typography, with a width axis this system runs from 100 to 125. It sets the nameplate, h1–h3, section heads and the big data numbers.'
		},
		{
			id: 'newsreader',
			name: 'Newsreader',
			role: 'Prose',
			credit: 'Production Type · SIL Open Font License 1.1',
			note: 'A news serif with an optical-size axis and full Latin Extended coverage, which is what a corpus of French and English scholarship on West Africa actually needs. It sets all prose, h4–h5, standfirsts, captions and every italic.'
		},
		{
			id: 'spline-sans-mono',
			name: 'Spline Sans Mono',
			role: 'Data',
			credit: 'Eben Sorkin & Mirko Velimirović · SIL Open Font License 1.1',
			note: 'The data voice: eyebrows, datelines, counts, navigation, filters, chips, DOIs, pagination and ledger keys. Never body copy, and never a page-wide treatment: a code-editor aesthetic is an anti-reference here, not an adjacent style.'
		}
	];

	const systemFiles = [
		{
			key: 'Tokens',
			title:
				'Every colour, size, tracking, weight, rule and interval in the system, and the midnight remap of them.',
			path: 'src/styles/base/variables.css · dark.css'
		},
		{
			key: 'Idioms',
			title:
				'The structural vocabulary: sections, ledgers, chips, plates, meters, the specimen frame and this page’s contents ledger.',
			path: 'src/styles/components/ink-signal.css'
		},
		{
			key: 'Rules',
			title:
				'The named rules, written out with the reasoning behind each: the prose this page is the evidence for.',
			path: 'DESIGN.md'
		},
		{
			key: 'Reference',
			title:
				'The stylesheet map: import order, what each file owns, and which component imports it.',
			path: 'src/styles/CSS-README.md'
		},
		{
			key: 'This page',
			title:
				'The system demonstrated on itself, rendered from the live tokens and the site’s own data.',
			path: 'src/routes/style-guide/+page.svelte'
		}
	];

	/* ===== Voice and copy — DESIGN.md § Voice & Copy, one example each. The
	 * rules are summarised, not restated: DESIGN.md is where they are argued. */
	const voiceRules = [
		{
			rule: 'Sentence case',
			gist: 'Navigation and breadcrumbs keep Title Case; every other heading, label, button and caption is sentence case.',
			example: 'Cited by · Key terms · Talks & events'
		},
		{
			rule: 'Reader’s noun',
			gist: 'The code’s nouns never reach the reader.',
			example: 'talk, never communication · keywords, never node'
		},
		{
			rule: 'Count',
			gist: 'One counted noun, singular-guarded, and an empty result still states the corpus.',
			example: 'Showing 1–12 of 44 entries'
		},
		{
			rule: 'Verb pair',
			gist: 'Open leads somewhere external, in a new tab; View leads to a page on this site.',
			example: 'Open deck · View talk'
		},
		{
			rule: 'Clearing',
			gist: 'Each clear control names exactly what it clears, and the facet panel and its button share one name.',
			example: 'Clear all · Clear years · Clear search · More filters'
		},
		{
			rule: 'Glyph',
			gist: 'Arrows and crosses are decoration in aria-hidden spans; an accessible name never contains one.',
			example: 'Previous record'
		},
		{
			rule: 'Punctuation',
			gist: 'A real ellipsis, closed-up en dashes in ranges, no em dashes in interface copy, typographic quotes.',
			example: 'Loading map… · 2013–2026 · No tags match “zzz”.'
		},
		{
			rule: 'Honest state',
			gist: 'A state names what happened and what still works; the error text stays in the console.',
			example: 'Offline. Cached pages remain available.'
		}
	];

	/* ===== Sub-sections =====
	 * Every rail-label subhead on the page, with a stable id so it can be linked
	 * to. An id is prefixed with its section's, which is how each section counts
	 * its own sub-sections for the contents ledger. Keys are the ids; the
	 * `subhead` snippet takes a key, so a typo fails `svelte-check`. */
	const subheads = {
		'colour-anchors': 'Anchors: both themes at once',
		'typography-archivo': 'Archivo: display',
		'typography-newsreader': 'Newsreader: prose',
		'typography-spline': 'Spline Sans Mono: data',
		'typography-headings': 'Heading tiers: where the voices divide',
		'typography-upright': 'The upright heading',
		'typography-prose-links': 'Prose links',
		'typography-scale': 'Type scale: forked ratios',
		'typography-context': 'Contextual sizes and the title measure',
		'typography-width': 'Width presets: the wdth axis',
		'typography-line-height': 'Line height',
		'typography-measure': 'Reading measure: counted, not assumed',
		'typography-tracking': 'Tracking: keyed to size',
		'typography-weight': 'Midnight weight: compensated, not inverted',
		'typography-record-prose': 'Record prose: a narrative cast in rules',
		'spacing-scale': 'Semantic spacing',
		'spacing-motion': 'Durations and easings',
		'spacing-breakpoints': 'Breakpoints and media features',
		'rules-masthead': 'The index masthead',
		'rules-interval': 'The rule-to-content interval',
		'rules-depth': 'Drawn depth: three grounds, one rule',
		'rules-section-note': 'The section note',
		'rules-pairing': 'A rule is not a border',
		'ledger-apparatus': 'The apparatus line: a record’s own keywords',
		'ledger-action': 'The row action: where the record goes',
		'ledger-tight': 'The tight ledger: a page that is all ledger',
		'ledger-meta': 'The meta-ledger: a catalogue entry',
		'ledger-cite': 'The cite block: the citation itself',
		'controls-chips': 'Chips',
		'controls-text-actions': 'Text actions',
		'controls-facet-toggle': 'The facet disclosure',
		'controls-combobox': 'Facet combobox',
		'controls-fields': 'Fields',
		'controls-pagination': 'Pagination',
		'controls-buttons': `Buttons: the ${buttonSkins.length} skins`,
		'controls-sizes': 'Sizes and states',
		'controls-focus': 'Focus: the one ring',
		'controls-filter-note': 'The filter note',
		'controls-states': 'States and media',
		'data-period': 'The period strip',
		'data-meter': 'The year meter',
		'data-proportion': 'The proportion ledger',
		'data-key-terms': 'The key-terms cloud',
		'data-chart-table': 'The chart table',
		'data-states': 'The empty plate and the honest state',
		'plates-rail': 'The rail plate',
		'plates-missing': 'The missing plate',
		'colophon-files': 'Where the system lives',
		'colophon-adding': 'Adding an idiom'
	} as const;
	type SubheadId = keyof typeof subheads;
	const subsectionCount = (section: string) =>
		Object.keys(subheads).filter((id) => id.startsWith(`${section}-`)).length;

	/* ===== Contents =====
	 * Each section has a count read off the arrays above rather than typed, so
	 * the contents cannot drift from what the sections hold, and its § number is
	 * its position in this list. The same entries supply every section head, so
	 * a § number is stated exactly once. Foundations (colour, type, spacing,
	 * rules) come before the idioms built from them. */
	const sections: (ContentsLedgerItem & { title: string })[] = [
		{
			id: 'colour',
			title: 'Colour: two inks on two grounds, one accent',
			count: `${colourTokenCount} tokens`
		},
		{
			id: 'typography',
			title: 'Typography: two voices, strictly cast',
			count: `${trackingRoles.length} tracking roles · ${weightSteps.length} weights`
		},
		{
			id: 'spacing',
			title: 'Spacing, motion and breakpoints',
			count: `${spaceTokens.length} steps · ${customMedia.length} queries`
		},
		{
			id: 'rules',
			title: 'Rules: hierarchy is drawn, not floated',
			count: `${ruleSpecs.length} rule weights`
		},
		{
			id: 'ledger',
			title: 'The ledger: the universal record',
			count: `${ledgerVariants.length} variants`
		},
		{
			id: 'controls',
			title: 'Controls: chips, fields, buttons, states',
			count: `${subsectionCount('controls')} idioms · ${buttonSkins.length} skins`
		},
		{
			id: 'data',
			title: 'Data as ornament',
			count: `${dataIdioms.length} idioms`
		},
		{
			id: 'plates',
			title: 'Plates',
			count: `${plates.length} plates`
		},
		{
			id: 'voice',
			title: 'Voice and copy',
			count: `${voiceRules.length} rules`
		},
		{
			id: 'colophon',
			title: 'Colophon: where the system lives',
			count: `${typefaces.length} typefaces`
		}
	].map((s, i) => ({ ...s, no: `§ ${i + 1}` }));

	const sec = (id: string) => sections.find((s) => s.id === id)!;
</script>

<SEO
	title="Style guide | Frédérick Madore"
	description="The living style guide for the Ink + Signal design system: colour tokens in both themes, the two typographic voices, spacing, motion and breakpoints, the rule hierarchy, the ledger, control and plate idioms, the voice and copy rules, and a colophon, rendered from the site's live design tokens."
	keywords="style guide, design system, Ink + Signal, design tokens, typography, Frédérick Madore"
	canonical="https://www.frederickmadore.com/style-guide"
	{breadcrumbs}
	pageType="WebPage"
/>

<!-- Every section head is drawn from `sections`, so its § number, its id and
     its row in the contents ledger are one string. The visible marker is
     hidden from assistive technology and repeated inside the heading instead,
     which puts the ordinal into the accessible name and the heading outline
     without changing a pixel of the render. -->
{#snippet sectionHead(s: (typeof sections)[number])}
	<div class="section-head">
		<span class="section-no" aria-hidden="true">{s.no}</span>
		<h2 class="section-title" id="{s.id}-title">
			<span class="sr-only">{`${s.no}. `}</span>{s.title}
		</h2>
	</div>
{/snippet}

<!-- Every sub-section head carries the id it is registered under in
     `subheads`, so it can be linked to. `bare` drops the section interval for
     the labels that open a specimen column rather than a run of prose. -->
{#snippet subhead(id: SubheadId, bare = false)}
	<h3 class="rail-label" class:guide-subhead={!bare} {id}>{subheads[id]}</h3>
{/snippet}

<div class="container py-8">
	<div class="max-w-6xl mx-auto">
		<PageHeader title="Style guide" typeBadgeText="Ink + Signal" />

		<PageIntro>
			The design system, demonstrated on itself. Every swatch, rule and specimen on this page is
			rendered from the site's live design tokens and data. The guide cannot drift from the
			implementation, because it <em>is</em> the implementation. Daylight and midnight are both first-class:
			toggle the theme to read this page as a microfilm negative.
		</PageIntro>

		<!-- The meta column is widened from the idiom's 12rem default: these counts
		     are two-part where a visualisation page's are one word, and at 12rem
		     § 2's wrapped onto a second line. -->
		<div class="guide-contents">
			<ContentsLedger items={sections} />
		</div>

		<!-- ================================================================
		     COLOUR
		     ================================================================ -->
		<section id="colour" class="section section--flush" aria-labelledby="colour-title">
			{@render sectionHead(sec('colour'))}
			<p class="guide-note">
				Daylight is warm paper struck by warm ink. Midnight is the same page as a microfilm
				negative: a green-black verdigris film cut from the accent's own hue, under cream type.
				Warmth lives in the type in both themes; pine marks <em>the current thing</em>. Applied by
				weight: ground ≫ ink ≫ accent. Every value printed here is read from the page's computed
				styles.
			</p>

			{@render subhead('colour-anchors')}
			<p class="guide-note">
				Every literal in the system is a <span class="data-voice">--sys-*</span> anchor, and every
				semantic token points at one in both themes. The anchors are all declared on
				<span class="data-voice">:root</span>, so the two palettes print side by side here whichever
				theme is on. Two rows in midnight are not anchors: the emphatic step of the accent and of
				the red lifts a quarter of the way toward the cream, because a negative deepens by getting
				lighter.
			</p>
			<div class="anchor-table-wrap">
				<table class="anchor-table">
					<caption class="sr-only">The anchor palette, daylight beside midnight</caption>
					<thead>
						<tr>
							<th scope="col">Role</th>
							<th scope="col">Daylight</th>
							<th scope="col">Midnight</th>
						</tr>
					</thead>
					<tbody>
						{#each anchorPairs as row (row.role)}
							<tr>
								<th scope="row">{row.role}</th>
								{#each [row.day, row.night] as cell, i (i)}
									<td>
										{#if typeof cell === 'string'}
											<span class="anchor-cell">
												<span class="anchor-chip" style="background: var({cell})" aria-hidden="true"
												></span>
												<span class="swatch-token">{cell}</span>
												<span class="swatch-value">{resolved[cell] ?? ''}</span>
											</span>
										{:else}
											<span class="anchor-cell">
												<span
													class="anchor-chip"
													style="background: color-mix(in srgb, var({cell.mix}) 75%, var(--sys-color-cream))"
													aria-hidden="true"
												></span>
												<span class="swatch-token">{cell.mix}</span>
												<span class="swatch-value">75% · 25% cream</span>
											</span>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="guide-caption">
				The raised sheet shares the muted film step in midnight: three film surfaces for four paper
				roles, recorded in {sec('rules').no} under drawn depth.
			</p>

			{#each colourGroups as group (group.id)}
				<h3 class="rail-label guide-subhead" id={group.id}>{group.label}</h3>
				<ul class="swatch-grid">
					{#each group.tokens as token (token)}
						<li class="swatch">
							<div class="swatch-chip" style="background: var({token})" aria-hidden="true"></div>
							<span class="swatch-token">{token}</span>
							<span class="swatch-value">{resolved[token] ?? ''}</span>
						</li>
					{/each}
				</ul>
			{/each}
		</section>

		<!-- ================================================================
		     TYPOGRAPHY
		     ================================================================ -->
		<section id="typography" class="section" aria-labelledby="typography-title">
			{@render sectionHead(sec('typography'))}
			<p class="guide-note">
				The document voice is what the scholar writes; the data voice is what the machine indexes.
				Every string on the site belongs to exactly one. Blurring them is the system's only
				unforgivable error: no mono headlines, no serif metadata.
			</p>

			<!-- The Archivo column spans the grid: the nameplate is shown at its own
			     size, --font-size-nameplate, which a third of the column cannot hold
			     without breaking a word, and a nameplate breaks only at a space. -->
			<div class="voice-grid">
				<div class="voice-specimen voice-specimen--wide">
					{@render subhead('typography-archivo', true)}
					<p class="nameplate">Ink + Signal</p>
					<p class="guide-caption">
						Nameplate, h1–h3, section heads, big data numbers. Wide, heavy cuts on the
						<span class="data-voice">wdth</span> axis, for a compressed-broadsheet feel. The
						nameplate above is set at <span class="data-voice">--font-size-nameplate</span>, as the
						home masthead sets it.
					</p>
				</div>

				<div class="voice-specimen">
					{@render subhead('typography-newsreader', true)}
					<p class="voice-serif">
						All prose, h4–h5, subtitles, captions and quotes are set in a news serif with optical
						sizing and full Latin Extended: the reading default for a working archive.
					</p>
					<p class="standfirst">And the standfirst beneath a title is its italic register.</p>
				</div>

				<div class="voice-specimen">
					{@render subhead('typography-spline', true)}
					<p class="eyebrow voice-eyebrow-demo">Dossiers · 5 projects · 2013–2027</p>
					<p class="eyebrow eyebrow--ink voice-eyebrow-demo">2013–2027 · Five dossiers</p>
					<p class="dateline">17 Jun · Conference · Berlin</p>
					<p class="guide-caption">
						Metadata only, never body copy: eyebrows, datelines, counts, nav, filters, chips, DOIs,
						pagination: anything that could be a database column. The eyebrow is pine when it marks
						the current thing and takes <span class="data-voice">.eyebrow--ink</span> when it is only
						a kicker.
					</p>
				</div>
			</div>

			{@render subhead('typography-headings')}
			<p class="guide-note">
				<span class="data-voice">h1</span>–<span class="data-voice">h3</span> are the display voice
				and are documented by the section heads on this page. <span class="data-voice">h4</span> and
				<span class="data-voice">h5</span> stay in Newsreader: quiet structural headings that read
				as typeset prose rather than as display. The mono heading tier is where the guide has to be
				exact, because <span class="data-voice">DESIGN.md</span> and the codebase disagree. The
				idiom actually in use is <span class="data-voice">.rail-label</span>, a mono label cast on
				an
				<span class="data-voice">h2</span>
				or <span class="data-voice">h3</span> across the record rails, the contents ledger and every
				subhead on this page.
				<span class="data-voice">h6</span> is cast the same way in
				<span class="data-voice">typography.css</span> and is used nowhere in the codebase. The
				exception the Two Voices Rule really carries is <em>a module label at any tier</em>, not the
				smallest heading level.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: h4, h5 and the mono label tier</figcaption>
				<h4>A structural heading, set in Newsreader</h4>
				<p class="guide-caption">
					Semibold, one tracking role tighter than prose, and no rule of its own. It divides a
					reading column rather than opening a section.
				</p>
				<h5>One tier below it, in the same voice</h5>
				<p class="guide-caption">The smallest heading still written rather than indexed.</p>
				<p class="rail-label">Rail label: the mono heading in use</p>
				<h6>h6: cast identically, and used nowhere</h6>
			</figure>

			{@render subhead('typography-upright')}
			<p class="guide-note">
				An inline <span class="data-voice">&lt;em&gt;</span> inside
				<span class="data-voice">h1</span>–<span class="data-voice">h3</span> stays upright in the display
				face. A Newsreader italic bolted into a heavy Archivo head is a voice collision at display sizes,
				so a work title quoted in a section head is set in the same face as the head around it. Genuine
				serif italics belong in prose, standfirsts and captions, where the standfirst above shows them.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: the upright heading rule</figcaption>
				<h3>Reading <em>Fraternité Matin</em> against the grain</h3>
				<p class="guide-caption">
					The emphasised title inherits the head's face, weight, width axis and tracking; only the
					markup distinguishes it.
				</p>
			</figure>

			{@render subhead('typography-prose-links')}
			<p class="guide-note">
				An <span class="data-voice">&lt;a&gt;</span> inside a prose container takes ink text and a
				static pine underline: the most frequent accent occurrence on the site, and the one place
				pine marks a live cross-reference rather than a current state. The idiom is
				<em>opt-in by container</em>: the selector names
				<span class="data-voice">.prose</span>, <span class="data-voice">.content-body</span>,
				<span class="data-voice">.page-intro</span>, <span class="data-voice">.record-prose</span>,
				<span class="data-voice">.project-prose</span>, <span class="data-voice">.abstract</span>,
				<span class="data-voice">.apparatus-text</span>,
				<span class="data-voice">.audio-description</span> and
				<span class="data-voice">.embed-desc</span>, and nothing else. Anything outside them (chips,
				bibliography titles, plate links, breadcrumbs, ledger rows whose whole row is the anchor)
				owns its own links, and a component that writes
				<span class="data-voice">text-decoration: none</span> keeps it.
			</p>
			<p class="guide-note">
				It used to carry bare <span class="data-voice">p a</span> and
				<span class="data-voice">li a</span> arms as well, which at 0,3,2 outranked every component
				that had stated its own intent. 209 of the site&rsquo;s 246 pine underlines landed outside
				running prose that way, down to the mono date key of a log row. A paragraph is not prose
				because it is a <span class="data-voice">&lt;p&gt;</span>; it is prose because it sits in a
				reading column. <span class="data-voice">.no-underline</span> stays as the opt-out for an
				apparatus link that <em>does</em> sit inside a container: a chip in a prose column, or an inline
				citation that draws its own softer rule.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: the prose link and its opt-out</figcaption>
				<!-- These two carry `.prose` as well: a specimen has to sit inside an
				     opt-in container to demonstrate the idiom, and `.guide-note` is no
				     longer one of them. The scoped `.guide-note` rule outranks `.prose`
				     on every declaration the two share, so nothing moves optically. -->
				<p class="prose guide-note guide-specimen-prose">
					The automatic treatment: <a href={resolve('/publications')}>a link in running prose</a>
					underlined in pine at rest, thickening to two pixels and warming to pine on hover.
				</p>
				<p class="prose guide-note guide-specimen-prose">
					A chip carries <span class="data-voice">.no-underline</span>, so the same sentence leaves
					<a class="chip no-underline" href={resolve('/publications')}>Publications</a> unruled: the box
					is already the affordance, and a rule drawn through it reads as a strike.
				</p>
				<p class="guide-note guide-specimen-prose">
					The opt-out on a bare link, and the one place it belongs: a link that is not running
					prose:
				</p>
				<p class="guide-specimen-prose">
					<a class="no-underline" href={resolve('/publications')}>Publications</a>
				</p>
			</figure>
			<p class="guide-caption">
				<span class="data-voice">.no-underline</span> is for apparatus runs, contents rows and chips,
				never for a link set inside a sentence with nothing else to distinguish it: strip the underline
				there and colour alone carries the link, which is a WCAG 1.4.1 failure rather than a style choice.
				Every opt-out on the site either sits outside running prose or draws a rule of its own.
			</p>

			{@render subhead('typography-scale')}
			<div class="scale-ladder">
				{#each bodyScale as token (token)}
					<div class="scale-row">
						<span class="scale-token">{token}</span>
						<span class="scale-sample scale-sample--serif" style="font-size: var({token})">
							The archive, read closely: minor third (1.2)
						</span>
					</div>
				{/each}
				{#each displayScale as row (row.token)}
					<div class="scale-row">
						<span class="scale-token">{row.token}</span>
						<span
							class="scale-sample scale-sample--display"
							style="font-size: var({row.token})"
							style:letter-spacing="var({row.tracking})"
							style:font-weight={headingCasts[row.cast]?.weight}
							style:font-variation-settings={headingCasts[row.cast]?.variation}
						>
							Signal: {row.label}
						</span>
					</div>
				{/each}
			</div>
			<p class="guide-caption">
				The body steps run a minor third (1.2) in Newsreader; the display steps a major third (1.25)
				in Archivo, each set in the weight, width and tracking of the heading tier that uses it,
				read off a live <span class="data-voice">h1</span>, <span class="data-voice">h2</span> and
				<span class="data-voice">h3</span>.
			</p>

			{@render subhead('typography-context')}
			<p class="guide-note">
				Four sizes sit outside the ladder because they are roles, not steps. The reading tier sets
				every long-form column and steps up below <span class="data-voice">--sm</span>, where the
				column is the screen and the measure no longer holds it down; set prose with it, never with
				<span class="data-voice">--font-size-base</span>, which also sizes interface text. The
				display and nameplate sizes are fluid clamps for the two loudest strings on the site.
			</p>
			<div class="ledger ledger--ruled" style="--ledger-meta-w: 17rem">
				{#each contextSizes as size (size.token)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{size.token.replace('--font-size-', '')}</span>
						<span class="ledger-content">
							<!-- The two display roles are set by the idiom that owns them, so
							     the specimen takes their weight, width and narrow-phone step
							     too; the reading tier has no class of its own. -->
							{#if size.cast === 'nameplate'}
								<span class="context-specimen nameplate">{size.specimen}</span>
							{:else if size.cast === 'display'}
								<span class="context-specimen index-title">{size.specimen}</span>
							{:else}
								<span
									class="context-specimen context-specimen--serif"
									style="font-size: var({size.token})">{size.specimen}</span
								>
							{/if}
							<span class="ledger-desc">{size.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures"
							>{size.token} · {resolved[size.token] ?? '–'}</span
						>
					</div>
				{/each}
			</div>
			<p class="guide-note guide-note--after">
				A title is taken in at a glance rather than read line after line, so its cap is set for the
				shape of the headline: <span class="data-voice">--measure-title</span>, {resolved[
					'--measure-title'
				] ?? ''} of the display face, which <span class="data-voice">PageHeader</span> gives every page
				title. The specimen below is held to it.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: a page title at the title measure</figcaption>
				<p class="title-measure-specimen" style:font-weight={headingCasts.h1?.weight}>
					Religious activism on the campuses of Togo and Benin
				</p>
			</figure>

			{@render subhead('typography-width')}
			<p class="guide-note">
				Archivo's width axis carries the display hierarchy alongside weight: the louder the tier,
				the wider the cut. Four presets, one per tier, so no component writes a raw
				<span class="data-voice">wdth</span>.
			</p>
			<div class="ledger ledger--ruled" style="--ledger-meta-w: 17rem">
				{#each variationPresets as preset (preset.token)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{preset.token.replace('--font-variation-', '')}</span>
						<span class="ledger-content">
							<span class="width-specimen" style="font-variation-settings: var({preset.token})"
								>Ink + Signal</span
							>
							<span class="ledger-desc">{preset.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures"
							>{preset.token} · {resolved[preset.token] ?? '–'}</span
						>
					</div>
				{/each}
			</div>

			{@render subhead('typography-line-height')}
			<p class="guide-note">
				Four steps and three roles that alias them. Display heads close up to
				<span class="data-voice">1.1</span> and below; prose opens to
				<span class="data-voice">1.6</span>. Each specimen wraps to two lines at its own leading.
			</p>
			<div class="ledger ledger--ruled" style="--ledger-meta-w: 17rem">
				{#each lineHeights as step (step.token)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{step.token.replace('--line-height-', '')}</span>
						<span class="ledger-content">
							<span class="leading-specimen" style="line-height: var({step.token})"
								>Cet article examine l'activisme religieux des étudiants musulmans sur les campus du
								Togo et du Bénin.</span
							>
							<span class="ledger-desc">{step.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures"
							>{step.token} · {resolved[step.token] ?? '–'}</span
						>
					</div>
				{/each}
			</div>

			{@render subhead('typography-measure')}
			<p class="guide-note">
				A <span class="data-voice">ch</span> is the advance width of the digit zero, not the width
				of one character. Newsreader's average character measures about
				<span class="data-voice">0.7ch</span>, so a cap written as
				<span class="data-voice">65ch</span> sets nearer ninety characters a line, past the forty-five
				to seventy-five that keeps a line scannable. Reason in characters and let the token carry the
				arithmetic. The counts below are measured in your browser, in the live font, at each role's own
				size.
			</p>
			<div class="ledger ledger--ruled" style="--ledger-meta-w: 17rem">
				{#each measureRoles as role (role.token)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{role.role}</span>
						<span class="ledger-content">
							<span class="ledger-title">{role.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures">
							{role.token} · {measured[role.token]?.ch ?? '–'} ·
							<strong>{measured[role.token]?.chars ?? '–'} chars</strong>
						</span>
					</div>
				{/each}
			</div>

			{@render subhead('typography-tracking')}
			<p class="guide-note">
				Tracking is set per voice, and within a voice it follows the size the string is set at: the
				display face tightens as it grows, the data voice loosens as it shrinks. Serif prose never
				sets tracking (a paragraph runs at its natural fit) and the floor is
				<span class="data-voice">-0.02em</span>. Nothing in a component writes a raw
				<span class="data-voice">em</span> value: the eight roles below are the entire vocabulary,
				and <span class="data-voice">trackingScale.test.ts</span> fails the build on a ninth.
			</p>
			<div class="ledger ledger--ruled" style="--ledger-meta-w: 17rem">
				{#each trackingRoles as role (role.token)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{role.role}</span>
						<span class="ledger-content">
							<span
								class="tracking-specimen {role.cast}"
								style:letter-spacing="var({role.token})"
								style:font-size="var({role.size})"
								style:font-weight={role.heading && headingCasts[role.heading]?.weight}
								style:font-variation-settings={role.heading &&
									headingCasts[role.heading]?.variation}>{role.specimen}</span
							>
							<span class="ledger-desc">{role.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures"
							>{role.token} · {resolved[role.token] ?? '–'}</span
						>
					</div>
				{/each}
			</div>

			{@render subhead('typography-weight')}
			<p class="guide-note">
				Light type on the film ground optically bolds, and it does so most at the sizes the data
				voice is set in, <span class="data-voice">10–14px</span> mono, where a stem gains more
				apparent width than the counter can absorb. Midnight therefore sets the three shared weights
				forty lighter, which returns the small mono to the weight it holds in daylight and leaves
				the serif titles at parity rather than trading one mismatch for another. Body copy stays at
				<span class="data-voice">400</span> because the served
				<span class="data-voice">wght</span> axis floors there, and the display face's hand-set cuts need
				nothing: the values below are the ones painting in whichever theme is on. Toggle the theme and
				watch them move.
			</p>
			<div class="ledger ledger--ruled" style="--ledger-meta-w: 17rem">
				{#each weightSteps as step (step.token)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{step.role}</span>
						<span class="ledger-content">
							<span
								class="weight-specimen weight-specimen--data"
								style:font-weight="var({step.token})">De Gruyter · ZMO-Studien 48 · 2025</span
							>
							<span
								class="weight-specimen weight-specimen--title"
								style:font-weight="var({step.token})">The archive, read closely</span
							>
							<span class="ledger-desc">{step.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures"
							>{step.token} · {resolved[step.token] ?? '–'}</span
						>
					</div>
				{/each}
			</div>

			{@render subhead('typography-record-prose')}
			<p class="guide-note">
				<span class="data-voice">.record-prose</span> is the reading column of a record whose body
				is authored markup rather than fields: a research project's narrative, a digital-humanities
				project's description. Paragraphs and list items take
				<span class="data-voice">--measure-prose</span>, the lead paragraph steps up one size and
				one ink, <span class="data-voice">h2</span> is drawn as a ruled section head at the same
				weight and the same <span class="data-voice">--rule-gap</span> as
				<span class="data-voice">.section-title</span>, and
				<span class="data-voice">h3</span> is a quiet serif subhead inside it. It matches direct
				children only, because a narrative slot can hold whole components and a descendant selector
				reaches into them. Links are left to the site-wide prose idiom, and the opening flourish is
				not part of it. Compose <span class="data-voice">.drop-cap</span> when the narrative should open
				with one.
			</p>

			<!-- Framed: the demo raises a real section head under a real 3px rule,
			     which read as a phantom § of the guide itself when set bare. The
			     flush variant drops the frame's padding so the rule still runs the
			     full width, which is the only way it reads as the rule it is. -->
			<figure class="specimen specimen--flush">
				<figcaption class="specimen-label">Specimen: record prose</figcaption>
				<div class="record-prose drop-cap guide-prose-demo">
					<p>
						It is the lead paragraph that opens the record: one size up, one ink step darker, and a
						three-line Newsreader initial sunk into it, in ink. This specimen opens on an I on
						purpose: set in a heavy grotesque, an I is a solid bar; set in the serif, it stays a
						letter. Everything after it returns to the reading tier and holds the prose measure
						however wide the column gets.
					</p>
					<h2>A section head, opened by its rule</h2>
					<p>
						The head takes the same three-pixel rule and the same twelve-pixel interval as an
						apparatus section further down the page, so a narrative and the record's Award or
						Reviews blocks are drawn at one weight.
					</p>
					<h3>A subhead inside it</h3>
					<p>Quiet serif, no rule: it divides a section rather than opening one.</p>
				</div>
			</figure>
		</section>

		<!-- ================================================================
		     SPACING, MOTION AND BREAKPOINTS
		     ================================================================ -->
		<section id="spacing" class="section" aria-labelledby="spacing-title">
			{@render sectionHead(sec('spacing'))}
			<p class="guide-note">
				A spacing scale on a 4px base unit carries the density scholars expect: structured
				information over whitespace. Motion is near-zero by design: instant state changes, at most a
				short fade on page enter. The register is print, not app.
			</p>

			{@render subhead('spacing-scale')}
			<p class="guide-note">
				The semantic scale in size order, then the two reading intervals that open a detail page's
				sections and the one interval every ruled module puts between its rule and what it opens.
				Each bar is drawn at its token's width.
			</p>
			<div class="space-specs">
				{#each spaceTokens as token (token)}
					<div class="space-spec">
						<span class="space-token">{token}</span>
						<div
							class="space-bar"
							class:space-bar--rule={token === '--rule-gap'}
							style="width: var({token})"
						></div>
						<span class="space-value">{resolved[token] ?? ''}</span>
					</div>
				{/each}
			</div>

			{@render subhead('spacing-motion')}
			<p class="guide-note">
				Transitions animate colour and border only, at <span class="data-voice"
					>--duration-fast</span
				>, with the media controls at <span class="data-voice">--duration-normal</span>; the loading
				spinners turn at the two slowest steps. Two easings, neither of which overshoots, and no
				transform moves on hover.
			</p>
			<div class="stat-ledger duration-ledger">
				{#each [...durationTokens, ...easeTokens] as token (token)}
					<div class="stat-row">
						<span>{token}</span>
						<span class="stat-value motion-value">{resolved[token] ?? ''}</span>
					</div>
				{/each}
			</div>

			{@render subhead('spacing-breakpoints')}
			<p class="guide-note">
				Every query is a PostCSS custom media from <span class="data-voice">base/media.css</span>,
				written <span class="data-voice">@media (--md)</span>; a
				<span class="data-voice">var()</span> never appears in a media query, and neither does a
				pixel. Width queries come in both directions; the interaction pair keys behaviour to the
				input method rather than the viewport, which is why the 44px touch floor lives under
				<span class="data-voice">--touch</span>.
			</p>
			<div
				class="ledger ledger--tight ledger--ruled"
				style="--ledger-key-w: 8rem; --ledger-meta-w: 17rem"
			>
				{#each customMedia as media (media.name)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{media.name}</span>
						<span class="ledger-content">
							<span class="ledger-desc">{media.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures">{media.query}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- ================================================================
		     RULES
		     ================================================================ -->
		<section id="rules" class="section" aria-labelledby="rules-title">
			{@render sectionHead(sec('rules'))}
			<p class="guide-note">
				Reach for the rule system before size or colour: the page should be navigable if all type
				were one size. Rules are ink-coloured, never gray. Corners are square; shadows and glass do
				not exist: depth comes from ink density and rule weight.
			</p>

			<div class="rule-specs">
				{#each ruleSpecs as spec (spec.token)}
					<div class="rule-spec">
						<div class={spec.class}></div>
						<span class="rule-spec-label">{spec.token} · {spec.use}</span>
					</div>
				{/each}
			</div>

			{@render subhead('rules-masthead')}
			<p class="guide-note">
				One role, one idiom. Every section index (<span class="data-voice">/publications</span>,
				<span class="data-voice">/conference-activity</span>,
				<span class="data-voice">/activities</span>, <span class="data-voice">/research</span>,
				<span class="data-voice">/teaching</span>,
				<span class="data-voice">/digital-humanities</span> and the deck gallery) opens on
				<span class="data-voice">.index-masthead</span> (the 4px rule and its
				<span class="data-voice">--rule-gap</span>) over a mono eyebrow and
				<span class="data-voice">.index-title</span>: Archivo at
				<span class="data-voice">--font-size-display</span>, weight 830, on the narrow width axis.
				The declaration was written four separate times and had drifted a size, a weight and a width
				axis apart, so five sibling sections opened in four voices. A sub-page of a section stays on
				the record tier. That fork is the system working, and the rule above the title is what says
				which of the two a reader is on.
				<span class="data-voice">&lt;PageHeader tier="index"&gt;</span> is how a page that does not build
				its own hero opts in.
			</p>

			<!-- A paragraph, not a heading: a live masthead demo should not add a
			     phantom entry to the guide's own document outline. -->
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: index masthead</figcaption>
				<div class="index-masthead">
					<p class="eyebrow">Index · {allPublications.length} entries · {firstYear}–{lastYear}</p>
					<p class="index-title">Publications</p>
					<p class="standfirst">
						Books, chapters, articles and reviews, filed as a finding aid rather than a list.
					</p>
				</div>
			</figure>

			{@render subhead('rules-interval')}
			<p class="guide-note">
				Every ruled module (masthead, section, hairline) puts the same
				<span class="data-voice">--rule-gap</span> between the rule and what it opens, so only the
				rule's <em>weight</em> carries hierarchy. Vary the weight, never the gap. The interval
				<em>above</em> a section is the one thing a consumer may set:
				<span class="data-voice">.section--flush</span> drops it to zero for the first ruled module under
				a masthead or a contents ledger, which is why § 1 above carries it and none of the others do.
			</p>

			{@render subhead('rules-depth')}
			<p class="guide-note">
				There are no shadows and no glass. Depth comes from the weight of the rule between two
				regions and the density of ink within them, so the surface ramp stays deliberately close in
				value: a step alone never carries hierarchy, the rule above it does. The three grounds print
				live below.
			</p>
			<ul class="depth-ramp">
				{#each depthSteps as step (step.token)}
					<li class="swatch">
						<div class="swatch-chip" style="background: var({step.token})" aria-hidden="true"></div>
						<span class="swatch-token">{step.token}</span>
						<span class="swatch-value">{resolved[step.token] ?? ''}</span>
						<span class="guide-caption depth-use">{step.use}</span>
					</li>
				{/each}
			</ul>
			<p class="guide-caption">
				Recorded rather than hidden: in midnight <span class="data-voice"
					>--color-background-muted</span
				>
				and <span class="data-voice">--color-surface-elevated</span> resolve to the same film step, as
				the two adjacent hexes in § 1 show. The film ramp has three steps for four paper roles, so the
				raised sheet has no midnight identity of its own: it is the sunken one. Daylight keeps them at
				opposite ends of the ramp.
			</p>

			{@render subhead('rules-section-note')}
			<p class="guide-note">
				<span class="data-voice">.section-note</span> is the one line of prose a two-word
				<span class="data-voice">.section-title</span> cannot carry. It names what the records below
				<em>are</em>
				when that is not self-evident, as on
				<span class="data-voice">/teaching</span>, whose “Guest lectures” ledger is keyed by host
				institution rather than by lecture. It is the document voice because it is written rather
				than indexed, and it takes <span class="data-voice">--measure-prose</span> like any other prose.
				A section whose head already says everything takes none.
			</p>

			<!-- A span, not a heading: the demo should not add a phantom entry to
			     the guide's own document outline. -->
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: section head and note</figcaption>
				<div class="section-head">
					<span class="section-title">Guest lectures</span>
					<span class="dateline">9 lectures · 2016–2022</span>
				</div>
				<p class="section-note">
					Invited talks in colleagues’ courses, indexed here by host institution.
				</p>
			</figure>

			{@render subhead('rules-pairing')}
			<p class="guide-note">
				The two share a 1px width and nothing else. A rule separates and is the lightest mark on the
				page; a box edge encloses an object and sits one step darker. Crossing the pair fails
				silently (a separator drawn in the edge colour just looks like a plate), so the tokens are
				named to be paired, and the three heavy weights above take
				<span class="data-voice">--color-primary</span> instead.
			</p>

			<div class="pairing-specs">
				{#each pairings as p (p.token)}
					<div class="pairing-spec">
						<div class="pairing-demo" data-mark={p.token}></div>
						<div class="pairing-body">
							<span class="pairing-mark">{p.mark}</span>
							<code>{p.decl}</code>
							<span class="pairing-use">{p.use} · {resolved[p.token] ?? '–'}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- ================================================================
		     THE LEDGER
		     ================================================================ -->
		<section id="ledger" class="section" aria-labelledby="ledger-title">
			{@render sectionHead(sec('ledger'))}
			<p class="guide-note">
				Any dated or keyed record renders as a hanging-column ledger row, not a card: mono key left,
				serif content right, a hairline above each row.
			</p>

			<div class="ledger ledger--ruled" style="--ledger-key-w: 9rem">
				<div class="ledger-row">
					<span class="ledger-key">
						2026
						<span class="ledger-status">Specimen</span>
					</span>
					<span class="ledger-content">
						<span class="ledger-title">A two-column ledger row</span>
						<span class="ledger-desc">
							The key column carries the machine voice (a year, a term, an identifier) while the
							content column carries the document voice: a serif title and, beneath it, a
							description at reading measure.
						</span>
					</span>
				</div>
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">
						2013–2026
						<span class="ledger-status">Idiom</span>
					</span>
					<span class="ledger-content">
						<span class="ledger-title">A three-column row adds a meta column</span>
						<span class="ledger-desc">
							Publications, CV entries, activities and facets all render this way: the same idiom,
							tuned per instance with <span class="data-voice">--ledger-key-w</span>.
						</span>
					</span>
					<span class="ledger-meta">Meta →</span>
				</div>
			</div>

			{@render subhead('ledger-apparatus')}
			<p class="guide-note">
				Chips are the <em>facet</em> idiom: a control the reader operates to narrow a list. A
				record's own keyword list is something else: apparatus, metadata annotating the entry, which
				merely happens to be linked. Setting apparatus as controls turned a thirteen-term catalogue
				row into a 244px wall of boxes on a phone, taller than the title it annotated. So
				<span class="data-voice">.apparatus-line</span> sets the terms as running mono type,
				interpunct-separated, wrapping like the text they are; each term stays whole and the break
				opportunities are the spaces flanking the separators. The terms carry
				<span class="data-voice">.no-underline</span>, because without it the prose-link rule
				pine-underlines every one of them. It is what
				<span class="data-voice">BibliographyRow</span> prints under an entry's body, and what
				<span class="data-voice">/digital-humanities</span> prints under a project's.
			</p>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- tag filter URLs -->
			<p class="apparatus-line">
				{#each apparatusTerms as term, i (term)}
					{#if i > 0}
						<span class="apparatus-line-sep" aria-hidden="true">·</span>
					{/if}
					<a
						class="no-underline"
						rel="nofollow"
						href={resolve(`/publications?tag=${encodeURIComponent(term)}`)}>{term}</a
					>
				{/each}
			</p>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
			<p class="guide-caption">
				The three most frequent keywords in the publications corpus, each linking to the index
				filtered to it.
			</p>

			{@render subhead('ledger-action')}
			<p class="guide-note">
				<span class="data-voice">.ledger-action</span> is the meta column’s link: a mono stamp
				naming the destination, quiet ink at rest and pine only under the pointer. The rule it
				follows is the one the bibliography row settled: a <em>fact</em> about the record belongs in
				the key or the eyebrow, a <em>destination</em> in the action column. It stays unaccented at
				rest on purpose: a syllabus from 2020 is not “the current thing”, and pine that marks
				everything marks nothing. It clears 24px on every pointer and 44px on a coarse one, and
				<span class="data-voice">.ledger-action--standalone</span> is the same stamp closing a whole ledger
				rather than one of its rows.
			</p>

			<div class="ledger ledger--ruled" style="--ledger-key-w: 9rem; --ledger-meta-w: 9rem">
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">
						Fall 2020
						<span class="ledger-status">Undergraduate</span>
					</span>
					<span class="ledger-content">
						<span class="ledger-title">A record with somewhere to go</span>
					</span>
					<span class="ledger-meta">
						<span class="ledger-action">Syllabus PDF ↗</span>
					</span>
				</div>
			</div>
			<span class="ledger-action ledger-action--standalone">All 9 guest lectures →</span>

			{@render subhead('ledger-tight')}
			<p class="guide-note">
				<span class="data-voice">.ledger--tight</span> is the same idiom one density step down, for a
				document whose whole body is records. The CV sets around 250 rows across seventeen sections on
				a single sheet, and at the default row padding that is roughly a screen and a half of added paper
				carrying no information, so the key column narrows to 6.5rem, the row padding drops a step, and
				the key sets one size smaller. Nothing else changes: the voices, the hairline, the accent on a
				current key and the narrow-measure collapse all still come from the idiom above. Reach for it
				when a page is a ledger; never to squeeze a list that is merely long.
			</p>

			<div class="ledger ledger--tight ledger--ruled">
				<div class="ledger-row">
					<span class="ledger-key">2024–</span>
					<span class="ledger-content">
						<span class="ledger-desc">
							Research Fellow, Leibniz-Zentrum Moderner Orient, Berlin.
						</span>
					</span>
				</div>
				<div class="ledger-row">
					<span class="ledger-key">2021–24</span>
					<span class="ledger-content">
						<span class="ledger-desc">
							A CV row sets its record as one continuous line of type, so the content column holds
							running text rather than a title and a description.
						</span>
					</span>
				</div>
			</div>
			<p class="guide-caption">
				The tight variant below the default above: same key, same hairline, one step closer.
			</p>

			{@render subhead('ledger-meta')}
			<p class="guide-note">
				A distinct idiom, not a variant. The ledger above sets a <em>record</em>: mono key against
				serif content, because the content is something the scholar wrote. The meta-ledger sets a
				record’s <em>catalogue entry</em> (journal, DOI, place, date), where both columns are
				strings a database could hold, so both are the data voice, over a key column narrowed to
				5.5rem for the 380px metadata rail. It is what the “Record” block prints on a publication or
				a talk (and the “Project” block on a research project, whose period, funder, programme,
				grant and regions are a catalogue entry by the same test), above the rail’s label and action
				stack. The block below is a real record from the dataset, rendered by
				<span class="data-voice">RecordLedger</span> itself, so the DOI is a live
				<span class="data-voice">.meta-link</span> carrying the
				<span class="data-voice">.meta-icon</span> identifier glyph, exactly as a record page ships it.
			</p>

			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: the metadata rail, at 380px</figcaption>
				<div class="guide-rail">
					<RecordLedger rows={demoMetaRows} />
					<div class="rail-cta">
						<button type="button" class="btn btn-accent btn-block">Access Publication ↗</button>
					</div>
				</div>
			</figure>
			<p class="guide-caption">
				Pine marks only the row that leaves the record (a DOI, a live project page), and only one
				control in the stack carries the accent fill.
			</p>

			{@render subhead('ledger-cite')}
			<p class="guide-note">
				A record page holds every field of its own citation, so it prints the citation. The
				reference is set as real text in the document voice (the sentence a reader would type), and
				the controls beneath it are the data voice, because copying and exporting are machine
				errands. Setting the text rather than hiding it behind the button is also the fallback: a
				clipboard the browser denies still leaves something to select. Confirmation replaces the
				label and takes pine for as long as it is true, then returns.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: the cite block</figcaption>
				<div class="guide-rail">
					<div class="cite-block">
						<p class="rail-label">Cite</p>
						<p class="cite-reference">{demoReference}</p>
						<div class="cite-actions">
							<Button variant="outline-primary" label="Copy reference" block />
							<Button variant="outline-secondary" label="Export BibTeX" block />
						</div>
					</div>
				</div>
			</figure>
			<p class="guide-caption">
				Printed by <span class="data-voice">formatReferenceText</span>: the same call the record
				rail makes and the same string the MCP server returns for its
				<span class="data-voice">reference</span> style. One formatter, so the page and an assistant can
				never disagree about the same work.
			</p>
		</section>

		<!-- ================================================================
		     CONTROLS
		     ================================================================ -->
		<section id="controls" class="section" aria-labelledby="controls-title">
			{@render sectionHead(sec('controls'))}
			<p class="guide-note">
				Controls are typeset, not manufactured: flat, square, mono caps, colour-only transitions, no
				lift and no ripple. Every specimen below is a real control, so hover, focus and the selected
				state can be reached from this page rather than described on it. They filter and paginate
				nothing: the guide is the specimen, not the list.
			</p>

			{@render subhead('controls-chips')}
			<p class="guide-note">
				Flat, square, mono caps, count appended; selected means a solid ink fill. The counts below
				are real: the three most frequent tags in the publications corpus. Pick one to see the
				selected state.
			</p>
			<div class="chip-row">
				{#each topTags as [tag, count], i (tag)}
					<button
						type="button"
						class="chip"
						class:chip--selected={i === demoChip}
						aria-pressed={i === demoChip}
						onclick={() => (demoChip = i)}
					>
						{tag}
						<span class="chip-count">{count}</span>
					</button>
				{/each}
				<button type="button" class="mono-action">All {allTags.length} tags ↓</button>
			</div>

			{@render subhead('controls-text-actions')}
			<p class="guide-note">
				The site ships one control that is a line of type rather than a box:
				<span class="data-voice">.mono-action</span>. A reset native button in mono caps, 24px tall
				on any pointer and 44px on a coarse one, with the same focus ring every other control draws.
				It is pine at rest because its job is always the same one: naming the current narrowing and
				offering the way out of it. Four copies of this control used to ship (one of them 16px tall
				with no focus rule, another a muted link); the chip row above closes with the first
				specimen, and these are the other two.
			</p>
			<div class="chip-row guide-field">
				<button type="button" class="mono-action"
					>Clear all <span aria-hidden="true">✕</span></button
				>
				<button type="button" class="mono-action">
					Clear years <span aria-hidden="true">✕</span>
				</button>
			</div>

			{@render subhead('controls-facet-toggle')}
			<p class="guide-note">
				<span class="data-voice">.facet-toggle</span> is the sibling of the text action and
				deliberately not a variant of it: opening an apparatus is not a state, so it is ink at rest
				and turns pine only under the pointer or on focus. It exists only below
				<span class="data-voice">--lg</span>, where the block it controls is actually collapsed;
				above that breakpoint it is
				<span class="data-voice">display: none</span>, which is why its
				<span class="data-voice">aria-expanded</span> is rendered only while the control is. All
				three index pages open their filters with it: the two entity indexes over the facet grid,
				<span class="data-voice">/activities</span> over its browse aside. On a wide screen the specimen
				below is correctly invisible.
			</p>
			<div class="guide-field">
				<button type="button" class="facet-toggle">
					More filters <span aria-hidden="true">▾</span>
				</button>
			</div>

			{@render subhead('controls-combobox')}
			<p class="guide-note">
				A facet prints in full while it is at most one value over its limit; past that it prints the
				frequency-ranked head and reaches the tail by typing. One rule, in
				<span class="data-voice">facetSearch.ts</span>, because hiding a single row behind a control
				costs the reader more than the row costs the page, and it was that one case which grew a
				second long-facet idiom beside this one. The field is machine-facing, so it takes the data
				voice and the square edge of the search field, and the listbox is a plate rather than a
				floating card: paper ground, 1px border, ledger rows with the serif value left and the mono
				count right. It overlays what follows on purpose: laying all {allTags.length} publication tags
				out grew the index by a screen and a half. Matching ignores case and diacritics, so
				<span class="data-voice">cote</span> reaches Côte d’Ivoire.
			</p>
			<div class="guide-combobox">
				<FacetCombobox
					options={allTags}
					counts={tagCounts}
					selected={demoFacetTags}
					label="tags"
					ontoggle={toggleDemoFacetTag}
				/>
			</div>
			<p class="guide-caption">
				Counts are real. Picks here narrow nothing; they only show the selected state.
			</p>

			{@render subhead('controls-fields')}
			<p class="guide-note">
				The site ships exactly one field idiom: the index search box, square, on a 1px warm edge and
				a surface ground, with the accent taken by the field's own edge on
				<span class="data-voice">:focus-within</span> so the input inside it never draws a second
				ring around the same box. It is machine-facing, so it is mono and uppercase. The first
				specimen is the field as <span class="data-voice">EntityFilterBar</span> ships it, labelled
				by its <span class="data-voice">aria-label</span>; the second pairs the same field with a
				visible mono label, which is the pairing to use wherever the field is not self-evident from
				its placeholder.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: the index search field</figcaption>
				<div class="guide-field">
					<div class="pub-search">
						<span class="pub-search-icon" aria-hidden="true">⌕</span>
						<input
							type="search"
							class="pub-search-input"
							placeholder="Search publications…"
							aria-label="Search publications"
							bind:value={demoSearch}
						/>
					</div>
				</div>
				<div class="guide-field">
					<label class="dateline guide-field-label" for="guide-labelled-field">Keyword</label>
					<div class="pub-search">
						<span class="pub-search-icon" aria-hidden="true">⌕</span>
						<input
							id="guide-labelled-field"
							type="text"
							class="pub-search-input"
							placeholder="e.g. Ouagadougou"
							bind:value={demoField}
						/>
					</div>
				</div>
			</figure>
			<p class="guide-caption">
				No validation state is drawn here, and that is the honest reading:
				<span class="data-voice">--color-danger</span> and
				<span class="data-voice">--color-success</span> are swatched in § 1 and reserved for form
				validation, but the site carries no form at all. Both tokens are spent today on status
				instead (an offline banner, a media error), and
				<span class="data-voice">.btn-danger</span> has no consumer.
			</p>

			{@render subhead('controls-pagination')}
			<p class="guide-note">
				The pager every paginated index ships, rendered here by
				<span class="data-voice">Pagination</span> itself on the real publications count, five to a
				page so that the run is long enough to window. It is a controlled component: the page owns
				the current page and slices its own list, and the pager only draws the control. A count
				readout in the data voice states the window by the Count Rule, then
				<span class="data-voice">.page-btn</span>
				controls: square, hairline-boxed, the current page a solid ink fill as a selected chip reads,
				Previous and Next disabled at either end, and past seven pages a
				<span class="data-voice">.page-gap</span> ellipsis where the run is windowed. It turns nothing
				here but itself.
			</p>
			<div class="guide-pagination">
				<Pagination
					page={demoPage}
					perPage={5}
					total={allPublications.length}
					onchange={(next) => (demoPage = next)}
				/>
			</div>

			{@render subhead('controls-buttons')}
			<p class="guide-note">
				Two solid fills carry the hierarchy: ink for the standard primary action, pine for the
				single hero call to action per screen. Everything else is outlined, ghosted or flat. Each
				row below sets the live control beside the class that draws it.
			</p>
			<div class="ledger ledger--tight ledger--ruled" style="--ledger-meta-w: 11rem">
				{#each buttonSkins as skin (skin.variant)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{skin.variant}</span>
						<span class="ledger-content">
							<span class="button-row">
								<button type="button" class="btn btn-{skin.variant}">{skin.variant}</button>
							</span>
							<span class="ledger-desc">{skin.note}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures">.btn-{skin.variant}</span>
					</div>
				{/each}
			</div>

			{@render subhead('controls-sizes')}
			<p class="guide-note">
				Three size steps, and the state modifiers that compose over any skin. Hover deepens the fill
				with no movement whatsoever; focus-visible draws the one ring, set out below. Tab into the
				row above to see it live.
			</p>
			<div class="button-row">
				{#each buttonSizes as step (step.size)}
					<Button
						variant="secondary"
						size={step.size as 'sm' | 'base' | 'lg'}
						label="{step.label} · {step.size}"
					/>
				{/each}
			</div>
			<div class="button-row button-row--states">
				<Button variant="secondary" label="Disabled" disabled />
				<Button variant="primary" label="Loading" ariaLabel="Loading" loading />
				<Button variant="secondary" iconOnly ariaLabel="Search icon-only button">
					{#snippet icon()}<span aria-hidden="true">⌕</span>{/snippet}
				</Button>
				<Button bare label="Bare: no skin at all" />
			</div>
			<div class="guide-field">
				<Button variant="outline-primary" label="Block" block />
			</div>
			<p class="guide-caption">
				The disabled state at half opacity. The loading state, which hides only the label (<span
					class="data-voice">.btn-loading .btn-text</span
				>
				takes
				<span class="data-voice">visibility: hidden</span>) and keeps the control's own text colour,
				because the spinner strokes in <span class="data-voice">currentColor</span>: the box holds
				its width and the spinner turns in the label's ink. An icon-only control padded square. The
				bare primitive, which carries hit behaviour and a focus ring and nothing else. And the block
				modifier, which takes the full width of its column.
			</p>

			{@render subhead('controls-focus')}
			<p class="guide-note">
				Focus is the one place a ring appears, and it is drawn, not glowed: a flat outline in
				<span class="data-voice">--color-border-focus</span> (the accent) at a fixed offset, the
				same on every control, the visualisation cards included. Write
				<span class="data-voice">outline: var(--focus-outline)</span> and
				<span class="data-voice">outline-offset: var(--focus-outline-offset)</span>. A control whose
				ring an <span class="data-voice">overflow</span> ancestor would clip draws it inside its own
				box with <span class="data-voice">--focus-outline-inset</span> instead. A ground that is not
				the page, the daylight footer, keeps the shorthand and overrides
				<span class="data-voice">outline-color</span> alone.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: the ring, held still</figcaption>
				<div class="button-row">
					<button type="button" class="btn btn-secondary focus-ring-specimen">Offset ring</button>
					<button
						type="button"
						class="btn btn-secondary focus-ring-specimen focus-ring-specimen--inset"
						>Inset ring</button
					>
				</div>
			</figure>
			<div class="ledger ledger--tight ledger--ruled" style="--ledger-meta-w: 17rem">
				{#each focusTokens as token (token)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{token.replace('--focus-outline', 'outline')}</span>
						<span class="ledger-content">
							<span class="ledger-desc focus-value">{resolved[token] ?? ''}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures">{token}</span>
					</div>
				{/each}
			</div>

			{@render subhead('controls-filter-note')}
			<p class="guide-note">
				What is currently narrowing a list, stated in the data voice: a quiet mono label, then the
				reader's own facet values in emphasis ink. It prints the values verbatim rather than a count
				of them, because it is the one line a reader can check against what they clicked. All four
				indexes set it in the same sentence shape (what is narrowing, how much of the corpus
				survives it, and the way out as a single
				<span class="data-voice">.mono-action</span>):
				<span class="data-voice">/activities</span> above its log,
				<span class="data-voice">/digital-humanities</span> above its catalogue, the two entity indexes
				inside the facet summary.
			</p>
			<p class="guide-field">
				<span class="filter-note-label">Filtered by</span>
				<span class="filter-note-value">Books · Benin · 2018–2020</span>
			</p>

			{@render subhead('controls-states')}
			<p class="guide-note">
				Every interactive state is a change of ink or border, instant or over
				<span class="data-voice">--duration-fast</span>; none moves, lifts or glows. The chips below
				hold each state still, so they can be compared side by side.
			</p>
			<div class="ledger ledger--tight ledger--ruled" style="--ledger-key-w: 9rem">
				<div class="ledger-row">
					<span class="ledger-key">Rest</span>
					<span class="ledger-content">
						<span class="button-row"><button type="button" class="chip">Islam</button></span>
						<span class="ledger-desc">A 1px box edge, soft ink.</span>
					</span>
				</div>
				<div class="ledger-row">
					<span class="ledger-key">Hover</span>
					<span class="ledger-content">
						<span class="button-row"><button type="button" class="chip">Islam</button></span>
						<span class="ledger-desc"
							>Point at it: the edge steps to the strong border and the label to emphasis ink. A
							hover must still read at 4.5:1, which <span class="data-voice"
								>hover-contrast.spec.ts</span
							>
							measures in both themes.</span
						>
					</span>
				</div>
				<div class="ledger-row">
					<span class="ledger-key">Focus-visible</span>
					<span class="ledger-content">
						<span class="button-row"
							><button type="button" class="chip focus-ring-specimen">Islam</button></span
						>
						<span class="ledger-desc">The one ring, at its offset.</span>
					</span>
				</div>
				<div class="ledger-row">
					<span class="ledger-key">Selected</span>
					<span class="ledger-content">
						<span class="button-row"
							><button type="button" class="chip chip--selected" aria-pressed="true">Islam</button
							></span
						>
						<span class="ledger-desc">A solid ink fill under inverted type.</span>
					</span>
				</div>
				<div class="ledger-row">
					<span class="ledger-key">Disabled</span>
					<span class="ledger-content">
						<span class="button-row"><Button variant="secondary" label="Disabled" disabled /></span>
						<span class="ledger-desc"
							>Half opacity and a not-allowed cursor. Chips carry no disabled style of their own.
							The pager's Previous and Next dim their ink and edge instead, so the label stays
							readable.</span
						>
					</span>
				</div>
			</div>
			<p class="guide-note guide-note--after">
				Three media change the page as much as the pointer does. Each component carries its own rule
				for them, in its own stylesheet, rather than a global override that would win or lose on
				bundle order.
			</p>
			<div
				class="ledger ledger--tight ledger--ruled"
				style="--ledger-key-w: 9rem; --ledger-meta-w: 17rem"
			>
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">Print</span>
					<span class="ledger-content">
						<span class="ledger-desc"
							>The Paper Rule. What prints is what a reader can act on there: the wordmark over its
							4px rule, the document, the imprint. Controls do not print. Ink is
							<span class="data-voice">--color-print-ink</span> on
							<span class="data-voice">--color-print-ground</span>, theme-stable, so a page printed
							from midnight never comes out cream.</span
						>
					</span>
					<span class="ledger-meta ledger-meta--figures"
						>base/typography.css, which indexes the component sheets</span
					>
				</div>
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">Reduced motion</span>
					<span class="ledger-content">
						<span class="ledger-desc"
							>Every transition drops to none and scrolling stops smoothing. Each component that
							transitions carries its own guard; there is no global switch.</span
						>
					</span>
					<span class="ledger-meta ledger-meta--figures"
						>base/reset.css, buttons.css, ink-signal.css, typography.css</span
					>
				</div>
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">Contrast</span>
					<span class="ledger-content">
						<span class="ledger-desc"
							>A reader who asks for more contrast gets heavier edges: a
							<span class="data-voice">.btn</span> border thickens to 2px and its focus outline to
							4px, and the navigation, media and reference controls thicken theirs. Every block is
							written <span class="data-voice">@media (--high-contrast)</span>, which compiles to
							<span class="data-voice">prefers-contrast: more</span>. Until 2026-10-21 they were
							written <span class="data-voice">prefers-contrast: high</span>, a value the spec does
							not define, and matched nothing.</span
						>
					</span>
					<span class="ledger-meta ledger-meta--figures"
						>base/media.css, buttons.css, navigation-utilities.css</span
					>
				</div>
			</div>
		</section>

		<!-- ================================================================
		     DATA AS ORNAMENT
		     ================================================================ -->
		<section id="data" class="section" aria-labelledby="data-title">
			{@render sectionHead(sec('data'))}
			<p class="guide-note">
				The only decoration permitted is real data made visible. These bars are the actual
				publications-per-year distribution, {firstYear}–{lastYear}; the newest year carries the
				accent. If a flourish doesn't encode something true, it goes.
			</p>

			<div class="ornament-grid">
				<div>
					<div class="year-bars">
						{#each yearRange as year, i (year)}
							<div
								class="year-bar"
								class:year-bar--current={year === lastYear}
								style="height: {maxYearCount > 0
									? Math.max(
											((yearCounts[i] ?? 0) / maxYearCount) * 100,
											(yearCounts[i] ?? 0) > 0 ? 6 : 0
										)
									: 0}%"
								title="{year}: {yearCounts[i] ?? 0}"
							></div>
						{/each}
					</div>
					<div class="year-bars-legend">
						<span>{firstYear}</span>
						<span>{lastYear}</span>
					</div>
					<p class="guide-caption">
						A bar at the floor height is a single work; an empty slot is a year with none.
					</p>
				</div>

				<div class="stat-ledger">
					{#each stats as stat (stat.label)}
						<div class="stat-row">
							<span>{stat.label}</span>
							<span class="stat-value" class:stat-value--accent={stat.accent}>{stat.value}</span>
						</div>
					{/each}
				</div>
			</div>

			{@render subhead('data-period')}
			<p class="guide-note">
				The bar strip's sibling, for a record set whose unit is a <em>span</em> rather than a year:
				one <span class="data-voice">.period-track</span> per record, each
				<span class="data-voice">.period-bar</span> positioned and sized to its own period across
				one axis read off the records, never a constant, which is how a bar ends up overshooting the
				axis it is drawn on. Running work takes
				<span class="data-voice">.period-bar--current</span>, because "current" is the accent's own
				definition. <span class="data-voice">/research</span> draws its seven projects with it and
				<span class="data-voice">/digital-humanities</span> its sixteen records, both in the hero
				column beside the standfirst; the strip carries no margin of its own, and
				<span class="data-voice">--period-track-h</span> /
				<span class="data-voice">--period-gap</span>
				take the rhythm down a step when there are many tracks. Below, the years each publication type
				covers. Every span a strip draws is also printed as a date in the ledger under it, which is why
				the whole strip is hidden from assistive technology rather than given labels that would read the
				list back a second time.
			</p>
			<div class="periods period-demo" aria-hidden="true">
				<p class="eyebrow eyebrow--ink periods-label">
					Publication periods · {firstYear}–{lastYear}
				</p>
				<div class="period-bars">
					{#each typePeriods as row (row.label)}
						<div class="period-track">
							<span
								class="period-bar"
								class:period-bar--current={row.current}
								style="left: {row.left}%; width: {row.width}%"
							></span>
						</div>
					{/each}
				</div>
				<div class="period-legend">
					<span>{firstYear}</span>
					<span>{lastYear}</span>
				</div>
			</div>

			{@render subhead('data-meter')}
			<p class="guide-note">
				The same distribution read as a ledger rather than a strip: a mono year, an
				<span class="data-voice">.hbar</span> proportion bar, a tabular count. The bar is one of the
				system's three sanctioned gradients: a hard stop whose position <em>is</em> the value, set
				with <code>style="--pct: 62%"</code>, so it encodes rather than decorates. The newest row
				takes pine on both key and bar, which is the accent's own definition. Use it wherever a list
				of years would otherwise be a row of buttons that says only which years exist.
			</p>
			<ul class="year-meter meter-demo">
				{#each meterYears as row (row.year)}
					<li>
						<div class="year-meter-row">
							<span class="year-meter-key" class:year-meter-key--current={row.year === lastYear}>
								{row.year}
							</span>
							<span
								class="hbar"
								class:hbar--current={row.year === lastYear}
								style="--pct: {row.pct}%"
								aria-hidden="true"
							></span>
							<span class="year-meter-count">{row.count}</span>
						</div>
					</li>
				{/each}
			</ul>

			{@render subhead('data-proportion')}
			<p class="guide-note">
				The same three columns and the same <span class="data-voice">.hbar</span> meter, keyed on a category
				rather than a year: here the languages the publications are written in, counted once per language
				a work declares. It is why a two-slice pie never needs to exist: the row prints the count and
				the share the arc would have left the reader to estimate.
			</p>
			<ul class="proportion-ledger proportion-demo">
				{#each languageShares as row (row.language)}
					<li>
						<div class="proportion-row">
							<span class="proportion-key">{row.language}</span>
							<span class="hbar" style="--pct: {row.pct.toFixed(1)}%" aria-hidden="true"></span>
							<span class="proportion-meta">{row.count} · {Math.round(row.pct)}%</span>
						</div>
					</li>
				{/each}
			</ul>

			{@render subhead('data-key-terms')}
			<p class="guide-note">
				A frequency-scaled serif term list where the type size <em>is</em> the corpus frequency. It
				replaced the bubble packs and the word-cloud canvas, both of which spent a great deal of ink
				encoding nothing: rotation, hue, spiral position and disc packing are all decorative, and a
				reader cannot compare two discs by area anyway. The scale is on the square root of the
				count, not the count itself, because type size reads as area rather than as length; the
				mapping lives in <span class="data-voice">scaleKeyTerms</span> so the two visualisation
				pages and the publication rail agree about it. The {KEY_TERM_LIMIT_HERE} terms below are the real
				publications keyword vocabulary, each linking to the index filtered to it.
			</p>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- tag filter URLs -->
			<div class="key-terms">
				{#each keywordTerms as term (term.word)}
					<a
						href={resolve(`/publications?tag=${encodeURIComponent(term.word)}`)}
						rel="nofollow"
						style="font-size: {term.size}px;"
						title="{term.count} publications">{term.word}</a
					>
				{/each}
			</div>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->

			{@render subhead('data-chart-table')}
			<p class="guide-note">
				Every canvas plate on the visualisation pages carries its own figures underneath, closed. A
				chart hands a screen reader one computed sentence and a sighted reader one tooltip per mark,
				and neither of those is the data; the table is built from the same array the chart is drawn
				from, so the two can never disagree. Rows take the ledger's rhythm (category hanging left in
				the data voice, figure right-aligned on tabular numerals, a hairline between entries) on
				real table rows rather than the <span class="data-voice">.ledger</span> classes, because a
				table that gives up <code>display: table</code> gives up its semantics with it. The three
				SVG network plates do not use it: a closed
				<code>&lt;details&gt;</code> is outside the accessibility tree, so they keep their
				<span class="data-voice">sr-only</span> tables instead.
			</p>
			<details class="chart-table guide-chart-table">
				<summary class="dateline">Data table</summary>
				<VizDataTable
					rows={meterYears.map((row) => ({ label: String(row.year), value: row.count }))}
					keyLabel="Year"
					valueLabel="Publications"
					caption="Publications per year, the same distribution the strip above draws."
				/>
			</details>

			{@render subhead('data-states')}
			<p class="guide-note">
				Three states, one register. <span class="data-voice">.viz-empty</span> is what a plate
				prints when the record holds nothing to draw; <span class="data-voice">.state-note</span> is
				what a component prints when it could not load at all (a failed map, a recording that 404s),
				and the same panel, carrying only its dateline, is what a heavy plate holds while its
				library is on the way. Every one of them sets a mono label naming the state, left-aligned at
				the top edge rather than floated in the middle of the plate, and none of them is red:
				<span class="data-voice">--color-danger</span> is reserved for form validation, and a fetch
				that failed is not the reader's mistake. The renderer's own message goes to the console.
				There is no spinner and no shimmer anywhere in the system: the charts and maps load 400px
				before they scroll into view (<span class="data-voice">use:inView</span>), so on an ordinary
				scroll the pending note is never read at all.
			</p>
			<div class="state-demo">
				<div class="viz-empty">
					<span class="dateline">No data</span>
					<p>No publisher locations recorded.</p>
				</div>
				<div class="state-note" role="status">
					<span class="dateline">Map unavailable</span>
					<p>The map could not be loaded. The publication counts below are the same records.</p>
				</div>
				<div class="state-note" role="status">
					<span class="dateline">Loading chart…</span>
				</div>
			</div>
		</section>

		<!-- ================================================================
		     PLATES
		     ================================================================ -->
		<section id="plates" class="section" aria-labelledby="plates-title">
			{@render sectionHead(sec('plates'))}
			<p class="guide-note">
				Photographs, covers and scans are plates: square corners, a one-pixel border, a muted ground
				behind them, and a serif-italic caption below. Covers and scans from the corpus are
				first-class imagery here and are preferred to stock photography of any kind, which is why
				both specimens below are real covers from the publications record.
			</p>

			<figure class="plate-demo">
				<img
					src={assetHref(pagePlate.src)}
					alt={pagePlate.alt}
					class="plate"
					width={pagePlate.width}
					height={pagePlate.height}
					loading="lazy"
					decoding="async"
				/>
				<figcaption class="plate-caption">
					Fig. 1. Cahiers d’études africaines 229 (2018), the issue carrying “L’organisation du hadj
					en Côte d’Ivoire”. The caption is set in the serif italic.
				</figcaption>
			</figure>

			{@render subhead('plates-rail')}
			<p class="guide-note">
				<span class="data-voice">.rail-plate</span> is the same plate set at the head of a metadata
				rail: the cover, scan or venue photograph that opens the apparatus. It adds nothing to
				<span class="data-voice">.plate</span> but the freedom to scale: the image takes the rail's
				380px, or the full column once the rail dissolves under
				<span class="data-voice">--lg</span>. Every record rail on the site opens with one.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: the rail plate, at 380px</figcaption>
				<div class="guide-rail">
					<figure class="rail-plate">
						<img
							class="plate"
							src={assetHref(railPlate.src)}
							alt={railPlate.alt}
							width={railPlate.width}
							height={railPlate.height}
							loading="lazy"
							decoding="async"
						/>
						<figcaption class="plate-caption">Fig. 2. Cover.</figcaption>
					</figure>
				</div>
			</figure>

			{@render subhead('plates-missing')}
			<p class="guide-note">
				When the bytes never arrive, <span class="data-voice">use:plateFallback</span> gives the
				enclosing figure <span class="data-voice">.plate--missing</span>: the box stays, the image
				and its numbered caption go, and a centred
				<span class="data-voice">.plate--missing-note</span> states the fact in the data voice. A caption
				describes a plate, and a broken-image glyph sitting under “Fig. 1. …” numbers a figure that is
				not there.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen: a plate whose image failed</figcaption>
				<div class="guide-rail">
					<figure class="rail-plate plate--missing">
						<p class="dateline plate--missing-note">Image unavailable.</p>
					</figure>
				</div>
			</figure>
		</section>

		<!-- ================================================================
		     VOICE AND COPY
		     ================================================================ -->
		<section id="voice" class="section" aria-labelledby="voice-title">
			{@render sectionHead(sec('voice'))}
			<p class="guide-note">
				Interface copy is set in the archive's own register: British English, understated, and
				exact. Every string states a fact, names an action or names a state, and says it once. The
				rules below are summarised from <span class="data-voice">DESIGN.md</span>, where each is
				argued; the example beside each is one the site prints.
			</p>
			<div class="ledger ledger--ruled" style="--ledger-key-w: 9rem; --ledger-meta-w: 17rem">
				{#each voiceRules as rule (rule.rule)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{rule.rule}</span>
						<span class="ledger-content">
							<span class="ledger-desc">{rule.gist}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures">{rule.example}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- ================================================================
		     COLOPHON
		     ================================================================ -->
		<section id="colophon" class="section" aria-labelledby="colophon-title">
			{@render sectionHead(sec('colophon'))}
			<p class="guide-note">
				Three families, one for each voice, all three under the SIL Open Font License and served
				from this site rather than from a font network. They are subset per script and instanced to
				the weight and width ranges the system actually sets, which is why the whole typographic
				programme costs four files.
			</p>

			{#each typefaces as face (face.name)}
				<h3 class="rail-label guide-subhead" id="colophon-{face.id}">{face.name}: {face.role}</h3>
				<p class="guide-note">{face.note}</p>
				<p class="dateline">{face.credit}</p>
			{/each}

			{@render subhead('colophon-files')}
			<p class="guide-note">
				This page is the arbiter of what the system looks like; the files below are where it is
				written. A value printed here is read live from the first of them, so the two cannot
				disagree.
			</p>
			<div class="ledger ledger--tight ledger--ruled" style="--ledger-meta-w: 18rem">
				{#each systemFiles as file (file.key)}
					<div class="ledger-row ledger-row--meta">
						<span class="ledger-key">{file.key}</span>
						<span class="ledger-content">
							<span class="ledger-desc">{file.title}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures">{file.path}</span>
					</div>
				{/each}
			</div>

			{@render subhead('colophon-adding')}
			<p class="guide-note">
				Put the class in <span class="data-voice">ink-signal.css</span> with the note explaining why
				it exists, and document it on this page in the same change, not the next one. That is not a
				convention held by goodwill:
				<span class="data-voice">styleGuideCoverage.test.ts</span> reads every class the stylesheet declares
				and fails the build if one of them appears neither on this page nor in a component this page renders.
				The gap it was written for had stood for three weeks with nothing to catch it.
			</p>
		</section>
	</div>
</div>

<style>
	/* Section prose note — serif, reading measure, under each section head. */
	.guide-note {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		max-width: var(--measure-prose);
		margin: 0 0 var(--space-lg);
	}

	.guide-caption {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-caption);
		color: var(--color-text-light);
		max-width: var(--measure-note);
		margin: var(--space-sm) 0 0;
	}

	/* The subheads are `.rail-label`, which draws its own bottom hairline; a
	 * ruled label needs the section interval above it rather than the note's. */
	.guide-subhead {
		margin-top: var(--space-2xl);
	}

	/* The demo's own first section head carries the idiom's 48px interval, which
	 * on a page of demos would read as a gap in the guide rather than in the
	 * specimen; the demo block itself needs only the note's interval above it. */
	.guide-prose-demo > :global(h2:first-of-type) {
		margin-top: var(--space-lg);
	}

	/* Prose inside a specimen frame is the exhibit, not the section's own note. */
	.guide-specimen-prose:last-child {
		margin-bottom: 0;
	}

	.guide-contents {
		--ledger-meta-w: 15rem;
	}

	/* The combobox fills its facet column on the index pages; here it gets a
	 * column's worth of width so the demo reads at its real proportions. */
	.guide-combobox {
		max-width: 22rem;
	}

	/* Fields are laid out in their own column on the index pages; the specimens
	 * take a comparable width so the mono placeholder reads at its real size. */
	.guide-field {
		max-width: 22rem;
	}

	.guide-field + .guide-field {
		margin-top: var(--space-lg);
	}

	.guide-field-label {
		display: block;
		margin-bottom: var(--space-2);
	}

	/* The metadata rail is 380px on a record page; the demo is set at that width
	 * so the 5.5rem key column reads at the proportion it actually ships in. */
	.guide-rail {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		max-width: 380px;
	}

	/* ===== Colour swatches ===== */
	.swatch-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
		gap: var(--space-md);
	}

	.swatch {
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
		min-width: 0;
	}

	.swatch-chip {
		height: var(--space-12);
		border: var(--border-width-thin) solid var(--color-border);
	}

	.swatch-token {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-emphasis);
		overflow-wrap: anywhere;
	}

	.swatch-value {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		color: var(--color-text-light);
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
		/* Reserve the line so the grid doesn't reflow when values resolve client-side. */
		min-height: 1.2em;
	}

	/* ===== The surface ramp =====
	 * Three grounds shown at a size where a step of two or three per cent is
	 * actually legible, which the 9.5rem swatch grid is not. */
	.depth-ramp {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

	@media (--md) {
		.depth-ramp {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.depth-ramp .swatch-chip {
		height: var(--space-20);
	}

	.depth-use {
		margin-top: var(--space-1);
	}

	/* ===== Typography specimens ===== */
	.voice-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		margin-bottom: var(--space-lg);
	}

	@media (--md) {
		.voice-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-xl) var(--space-lg);
		}
	}

	/* The column's label is `.rail-label`, which draws the hairline that used to
	 * be a border on this box — one boundary, one mark. */
	.voice-specimen {
		min-width: 0;
	}

	/* The display column spans the grid so the nameplate can be shown at its
	 * own size rather than shrunk to fit a third of the page. */
	@media (--md) {
		.voice-specimen--wide {
			grid-column: 1 / -1;
		}
	}

	.voice-serif {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		margin: 0 0 var(--space-sm);
	}

	.voice-specimen .standfirst {
		font-size: var(--font-size-base);
	}

	.voice-eyebrow-demo {
		margin-bottom: var(--space-2);
	}

	/* ===== Type scale ladder ===== */
	.scale-ladder {
		display: flex;
		flex-direction: column;
	}

	.scale-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-1) var(--space-lg);
		align-items: baseline;
		padding: var(--space-sm) 0;
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	@media (--md) {
		.scale-row {
			grid-template-columns: 11rem 1fr;
		}
	}

	.scale-token {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
	}

	.scale-sample--serif {
		font-family: var(--font-family-serif);
		color: var(--color-text);
		line-height: var(--line-height-snug);
	}

	/* Weight, width and tracking come inline from the heading tier each step
	 * is cast in; the fallbacks hold the h3 cut until the live read lands. */
	.scale-sample--display {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-headline);
		font-weight: 750;
		color: var(--color-text-emphasis);
		line-height: var(--line-height-tight);
		overflow-wrap: anywhere;
	}

	/* ===== Tracking specimens =====
	 * Each row is set in the token's own face and size, with the token itself
	 * supplying the tracking inline, so the specimen cannot drift from the value
	 * printed beside it. `align-self` keeps the chip cast from stretching to the
	 * width of the flex column it sits in. */
	.tracking-specimen {
		align-self: flex-start;
		max-width: 100%;
		margin: 0;
		overflow-wrap: anywhere;
		/* The chip cast borrows a control's styling but is inert here. */
		cursor: default;
	}

	/* Weight and width come inline from the heading tier the role tracks; the
	 * declarations here are the h3 cut, held until the live read lands. */
	.tracking-specimen--display {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-headline);
		font-weight: 750;
		line-height: var(--line-height-tight);
		color: var(--color-text-emphasis);
	}

	.tracking-specimen--title {
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-snug);
		color: var(--color-text-emphasis);
	}

	.tracking-specimen--figures {
		font-family: var(--font-family-mono);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-soft);
	}

	/* ===== Weight specimens =====
	 * Two lines per row, one per voice: the data voice at the size where the
	 * midnight bolding is strongest, the serif title at the size where it is
	 * mild. Neither states a weight — the token supplies it inline, so the pair
	 * repaints when the theme flips and cannot drift from the value printed
	 * beside it. */
	.weight-specimen {
		align-self: flex-start;
		max-width: 100%;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.weight-specimen--data {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-soft);
	}

	.weight-specimen--title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-snug);
		letter-spacing: var(--tracking-title);
		color: var(--color-text-emphasis);
	}

	/* ===== Rule specimens ===== */
	.rule-specs {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.rule-spec-label {
		display: block;
		margin-top: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
	}

	/* ===== The rule / border pairing =====
	 * Each specimen is drawn with the declaration it documents, so the demo
	 * cannot drift from the rule it states. */
	.pairing-specs {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
		margin-top: var(--space-md);
	}

	@media (--md) {
		.pairing-specs {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-2xl);
		}
	}

	.pairing-demo {
		height: var(--space-lg);
	}

	.pairing-demo[data-mark='--color-hairline'] {
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.pairing-demo[data-mark='--color-border'] {
		border: var(--border-width-thin) solid var(--color-border);
	}

	.pairing-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-top: var(--space-2);
	}

	.pairing-mark {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-emphasis);
	}

	.pairing-use {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
	}

	/* ===== Control rows ===== */
	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
	}

	.button-row--states {
		margin-top: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	/* The focus tokens, drawn as a static class so the ring a keyboard user
	 * sees can be read without holding focus on it. */
	.focus-ring-specimen {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-offset);
	}

	.focus-ring-specimen--inset {
		outline-offset: var(--focus-outline-inset);
	}

	.focus-value {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
	}

	/* The pager draws its own hairline and interval above it; on this page the
	 * subhead's rule already opens the block, so the interval is dropped. */
	.guide-pagination :global(.pagination) {
		margin-top: 0;
	}

	/* ===== Data as ornament ===== */
	.ornament-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		align-items: end;
	}

	@media (--md) {
		.ornament-grid {
			grid-template-columns: 2fr 1fr;
			gap: var(--space-2xl);
		}
	}

	/* The meter is a rail idiom; showing it at page width would misstate it. */
	.meter-demo {
		max-width: 20rem;
	}

	/* The strip carries no margin of its own (a hero grid cell places it), so
	   the specimen supplies the interval before the next subhead. Held to the
	   320px ornament column both index heroes give it, so the demo is drawn at
	   the width it is actually used at. */
	.period-demo {
		max-width: 20rem;
		margin-bottom: var(--space-2xl);
	}

	/* Wider than the year meter's demo: the key column holds a language name
	   rather than four figures, and the bar must still have room to be read. */
	.proportion-demo {
		max-width: 26rem;
	}

	/* The chart table is a plate's footnote, so it is demonstrated at the width
	   a plate actually gives it rather than at page width. */
	.guide-chart-table {
		max-width: 26rem;
	}

	/* The two states side by side, so the shared register is visible at a
	   glance: same label voice, same sentence voice, different ground. */
	.state-demo {
		display: grid;
		gap: var(--space-lg);
		margin-top: var(--space-md);
	}

	@media (--md) {
		.state-demo {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
		}
	}

	/* The empty plate is drawn inside a plate on the real pages; the frame here
	   stands in for it so the specimen is not a sentence floating on paper. */
	.state-demo > .viz-empty {
		padding: var(--space-md);
		border: var(--border-width-thin) solid var(--color-border);
	}

	/* ===== Plate ===== */
	.plate-demo {
		margin: 0;
		max-width: 17.5rem;
	}

	/* ===== Spacing specimens ===== */
	.space-specs {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.space-spec {
		display: grid;
		grid-template-columns: 10rem auto 1fr;
		gap: var(--space-lg);
		align-items: center;
	}

	.space-token {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
	}

	.space-bar {
		height: var(--space-2-5);
		background: var(--color-primary);
	}

	/* The rule gap is the one interval that belongs to the rule system, so it
	 * is drawn as the gap it is: a 3px section rule over its own width. */
	.space-bar--rule {
		background: transparent;
		border-top: var(--rule-section) solid var(--color-primary);
	}

	.space-value {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
	}

	.motion-value {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
		overflow-wrap: anywhere;
	}

	.duration-ledger {
		max-width: 30rem;
	}
	/* A note that follows a specimen rather than a subhead. */
	.guide-note--after {
		margin-top: var(--space-lg);
	}

	/* ===== The anchor table =====
	 * A real table, not ledger classes: a table that gives up `display: table`
	 * gives up its semantics with it. Rows take the ledger's rhythm instead:
	 * mono role key, hairline between rows. */
	.anchor-table-wrap {
		overflow-x: auto;
	}

	.anchor-table {
		width: 100%;
		border-collapse: collapse;
	}

	.anchor-table th,
	.anchor-table td {
		padding: var(--space-xs) var(--space-sm) var(--space-xs) 0;
		border-top: var(--rule-hairline) solid var(--color-hairline);
		text-align: left;
		vertical-align: middle;
		background: none;
	}

	.anchor-table th {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.anchor-table thead th {
		border-top: 0;
	}

	.anchor-cell {
		display: grid;
		grid-template-columns: var(--space-2xl) 1fr;
		grid-template-rows: auto auto;
		column-gap: var(--space-sm);
		align-items: center;
		min-width: 12rem;
	}

	.anchor-chip {
		grid-row: 1 / span 2;
		height: var(--space-xl);
		border: var(--border-width-thin) solid var(--color-border);
	}

	/* ===== Contextual sizes, width presets, leading ===== */
	.context-specimen {
		align-self: flex-start;
		max-width: 100%;
		margin: 0;
	}

	.context-specimen--serif {
		font-family: var(--font-family-serif);
		line-height: var(--line-height-snug);
		color: var(--color-text);
	}

	.title-measure-specimen {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-size: var(--font-size-heading-1);
		font-weight: 750;
		line-height: var(--line-height-tight);
		letter-spacing: var(--tracking-display);
		color: var(--color-text-emphasis);
		max-width: var(--measure-title);
		margin: 0;
		text-wrap: balance;
	}

	.width-specimen {
		align-self: flex-start;
		font-family: var(--font-family-display);
		font-size: var(--font-size-2xl);
		font-weight: 750;
		line-height: var(--line-height-tight);
		letter-spacing: var(--tracking-display-sm);
		color: var(--color-text-emphasis);
	}

	.leading-specimen {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		color: var(--color-text);
		max-width: var(--measure-note);
	}
</style>
