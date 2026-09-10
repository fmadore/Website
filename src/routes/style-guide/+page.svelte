<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base, resolve } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import ContentsLedger from '$lib/components/common/ContentsLedger.svelte';
	import type { ContentsLedgerItem } from '$lib/components/common/ContentsLedger.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import RecordLedger from '$lib/components/molecules/RecordLedger.svelte';
	import type { MetaRow } from '$lib/components/molecules/RecordLedger.svelte';
	import FacetCombobox from '$lib/components/entity-index/FacetCombobox.svelte';
	import VizDataTable from '$lib/components/visualisations/VizDataTable.svelte';
	import { scaleKeyTerms } from '$lib/utils/keyTerms';
	import {
		allPublicationSummaries as allPublications,
		publicationSummariesByYear as publicationsByYear,
		publicationSummaryTags as allTags
	} from '$lib/data/publications/summaries';
	import { allCommunications } from '$lib/data/communications/index';
	import { activitiesByDate } from '$lib/data/activities';
	import { tallyBy } from '$lib/utils/vizAggregation';
	/* The index pages' search field is documented in § 5, so the guide loads the
	 * stylesheet that owns it rather than restating its declarations locally —
	 * a restatement is exactly the drift this page exists to prevent. */
	import '$styles/components/entity-index.css';

	const breadcrumbs = createSectionBreadcrumbs('Style Guide', '/style-guide');

	/* ===== Colour tokens — the guide reads the live values off :root, so a
	 * token edit in variables.css (or dark.css) re-documents itself here. ===== */
	const colourGroups = [
		{
			label: 'Grounds & surfaces',
			tokens: [
				'--color-background',
				'--color-surface',
				'--color-background-muted',
				'--color-surface-elevated'
			]
		},
		{
			label: 'Inks',
			tokens: ['--color-primary', '--color-text-soft', '--color-text-light']
		},
		{
			label: 'Accent — pine',
			tokens: ['--color-accent', '--color-accent-dark']
		},
		{
			label: 'Borders & hairlines',
			tokens: ['--color-border', '--color-hairline', '--color-border-dark']
		},
		{
			label: 'Functional',
			tokens: ['--color-danger', '--color-success']
		},
		{
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
		}
	];

	const durationTokens = [
		'--duration-instant',
		'--duration-fast',
		'--duration-normal',
		'--duration-moderate',
		'--duration-slow'
	];

	const spaceTokens = [
		'--space-xs',
		'--space-sm',
		'--space-md',
		'--space-lg',
		'--space-xl',
		'--space-2xl',
		'--space-3xl'
	];

	/* ===== Tracking — a role scale keyed to size.
	 * Eight roles, three voices. Each row below is set in the token's own face,
	 * at its own size, with its own tracking, so the specimen *is* the token
	 * rather than a description of one. Values are read off `:root` by the same
	 * reader as the colour swatches. ===== */
	const trackingRoles = [
		{
			token: '--tracking-display-lg',
			role: 'Display lg',
			cast: 'tracking-specimen--display',
			size: '--font-size-4xl',
			specimen: 'Signal',
			use: 'the nameplate, --font-size-display, 5xl'
		},
		{
			token: '--tracking-display',
			role: 'Display',
			cast: 'tracking-specimen--display',
			size: '--font-size-3xl',
			specimen: 'Signal',
			use: 'h1–h2 at 4xl and 3xl — page and record titles'
		},
		{
			token: '--tracking-display-sm',
			role: 'Display sm',
			cast: 'tracking-specimen--display',
			size: '--font-size-xl',
			specimen: 'Publications',
			use: 'h3 and below, 2xl → base — section heads, wordmarks'
		},
		{
			token: '--tracking-title',
			role: 'Title',
			cast: 'tracking-specimen--title',
			size: '--font-size-lg',
			specimen: 'The archive, read closely',
			use: 'every Newsreader title — h4–h5, ledger and bibliography rows'
		},
		{
			token: '--tracking-eyebrow',
			role: 'Eyebrow',
			cast: 'eyebrow',
			size: '--font-size-2xs',
			specimen: '§ 2 — Typography',
			use: 'the kicker: one per module — eyebrows, § numbers, facet heads'
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
			use: 'mixed-case mono at any size — DOIs, counts, years, meta values'
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
		...durationTokens,
		...trackingRoles.map((r) => r.token),
		...weightSteps.map((w) => w.token)
	];

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
	const displayScale = [
		'--font-size-xl',
		'--font-size-2xl',
		'--font-size-3xl',
		'--font-size-4xl',
		'--font-size-5xl'
	];

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
			use: 'Captions, review sources and the footer — the fine print, shortest of the three.'
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
		{ token: '--color-surface-elevated', use: 'the raised sheet — a card, a tile' }
	];

	/* ===== The hairline pairing =====
	 * A rule and a box edge are different jobs on the same 1px width, and the
	 * failure mode is silent: draw a separator in --color-border and it simply
	 * reads as a plate edge, flattening the ramp with nothing to catch it. Both
	 * tokens are already in `resolved` above, so the hexes printed here are the
	 * ones actually painting, in whichever theme is on. */
	const pairings = [
		{
			mark: 'A rule — separates',
			decl: 'var(--rule-hairline) solid var(--color-hairline)',
			token: '--color-hairline',
			use: 'ledger rows, entry separators, facet labels'
		},
		{
			mark: 'A box edge — encloses',
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
		'The row action',
		'The tight ledger',
		'The meta-ledger',
		'The cite block'
	];

	/* ===== Controls — every button skin `buttons.css` defines, in the order it
	 * defines them. Rendered as real controls, so each one is focusable and its
	 * hover, focus and disabled states can be reached from this page. ===== */
	const buttonSkins = [
		{ variant: 'primary', note: 'The standard primary action — a solid ink fill with paper text.' },
		{
			variant: 'accent',
			note: 'The single hero call to action per screen, governed by the Scarcity Rule.'
		},
		{ variant: 'secondary', note: 'Transparent, on the strong-border edge; fills on hover.' },
		{
			variant: 'outline-primary',
			note: 'An ink outline that inverts to a solid ink fill on hover.'
		},
		{ variant: 'outline-secondary', note: 'The quiet outline — the second control in a stack.' },
		{
			variant: 'outline-accent',
			note: 'A pine outline that inverts to a solid pine fill on hover.'
		},
		{ variant: 'ghost', note: 'Faint ink, no border: the tertiary tier.' },
		{
			variant: 'danger',
			note:
				'Destructive actions. Nothing on this site destroys anything, so it has no consumer — and ' +
				'this specimen is why that matters: on the film ground the bright fill under inverted text ' +
				'measures 4.46:1, just under the 4.5:1 floor. Daylight is fine at 6.4:1. Recorded here ' +
				'rather than hidden; the skin needs a midnight step before anything adopts it.'
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

	const stats = [
		{ label: 'Publications', value: allPublications.length, accent: true },
		{ label: 'Communications', value: allCommunications.length },
		{ label: 'Activities', value: activitiesByDate.length },
		{ label: 'Tags in the corpus', value: allTags.length },
		{ label: 'Colour tokens on this page', value: colourGroups.flatMap((g) => g.tokens).length }
	];

	/* The three idioms § 6 sets on real data, named once for the contents count. */
	const dataIdioms = [
		'Year-bar strip',
		'Stat ledger',
		'Year meter',
		'Proportion ledger',
		'Key-terms cloud'
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

	/* The meta-ledger demo is rendered by <RecordLedger> — the component every
	 * record page uses — so the guide's catalogue entry cannot drift from the
	 * one that ships, and its DOI is a real `.meta-link` rather than accent text. */
	const demoMetaRows: MetaRow[] = [
		{ key: 'Type', value: 'Journal Article' },
		{ key: 'Journal', value: 'Islamic Africa' },
		{ key: 'Date', value: '2026' },
		{
			key: 'DOI',
			value: '10.1163/21540993-01201007',
			href: 'https://doi.org/10.1163/21540993-01201007',
			external: true,
			accent: true,
			icon: 'academicons:doi'
		}
	];

	/* ===== Colophon — the three families, and where the system lives. ===== */
	const typefaces = [
		{
			name: 'Archivo',
			role: 'Display',
			credit: 'Omnibus-Type · SIL Open Font License 1.1',
			note: 'A grotesque drawn for newspaper headlines and high-performance typography, with a width axis this system runs from 100 to 125. It sets the nameplate, h1–h3, section heads and the big data numbers.'
		},
		{
			name: 'Newsreader',
			role: 'Prose',
			credit: 'Production Type · SIL Open Font License 1.1',
			note: 'A news serif with an optical-size axis and full Latin Extended coverage, which is what a corpus of French and English scholarship on West Africa actually needs. It sets all prose, h4–h5, standfirsts, captions and every italic.'
		},
		{
			name: 'Spline Sans Mono',
			role: 'Data',
			credit: 'Eben Sorkin & Mirko Velimirović · SIL Open Font License 1.1',
			note: 'The data voice: eyebrows, datelines, counts, navigation, filters, chips, DOIs, pagination and ledger keys. Never body copy, and never a page-wide treatment — a code-editor aesthetic is an anti-reference here, not an adjacent style.'
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
				'The fourteen named rules, written out with the reasoning behind each — the prose this page is the evidence for.',
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

	/* ===== Contents =====
	 * Nine sections, each with a count read off the arrays above rather than
	 * typed, so the contents cannot drift from what the sections hold. The same
	 * entries supply every section head, so a § number is stated exactly once. */
	const sections: (ContentsLedgerItem & { title: string })[] = [
		{
			id: 'colour',
			no: '§ 1',
			title: 'Colour — two inks on two grounds, one accent',
			count: `${colourGroups.flatMap((g) => g.tokens).length} tokens`
		},
		{
			id: 'typography',
			no: '§ 2',
			title: 'Typography — two voices, strictly cast',
			count: `${trackingRoles.length} tracking roles · ${weightSteps.length} weights`
		},
		{
			id: 'rules',
			no: '§ 3',
			title: 'Rules — hierarchy is drawn, not floated',
			count: `${ruleSpecs.length} rule weights`
		},
		{
			id: 'ledger',
			no: '§ 4',
			title: 'The ledger — the universal record',
			count: `${ledgerVariants.length} variants`
		},
		{
			id: 'controls',
			no: '§ 5',
			title: 'Controls — chips, fields, pagination, buttons',
			count: `${buttonSkins.length} skins · ${buttonSizes.length} sizes`
		},
		{
			id: 'data',
			no: '§ 6',
			title: 'Data as ornament',
			count: `${dataIdioms.length} idioms`
		},
		{
			id: 'plates',
			no: '§ 7',
			title: 'Plates',
			count: `${plates.length} plates`
		},
		{
			id: 'spacing',
			no: '§ 8',
			title: 'Spacing & motion',
			count: `${spaceTokens.length} steps`
		},
		{
			id: 'colophon',
			no: '§ 9',
			title: 'Colophon — where the system lives',
			count: `${typefaces.length} typefaces`
		}
	];

	const sec = (id: string) => sections.find((s) => s.id === id)!;
</script>

<SEO
	title="Style Guide | Frédérick Madore"
	description="The living style guide for the Ink + Signal design system: colour tokens, the two typographic voices, the rule hierarchy, the ledger, chip, control and plate idioms, and a colophon — rendered from the site's live design tokens."
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
			<span class="sr-only">{`${s.no} — `}</span>{s.title}
		</h2>
	</div>
{/snippet}

<div class="container py-8">
	<div class="max-w-6xl mx-auto">
		<PageHeader title="Style Guide" typeBadgeText="Ink + Signal" />

		<PageIntro>
			The design system, demonstrated on itself. Every swatch, rule and specimen on this page is
			rendered from the site's live design tokens and data — the guide cannot drift from the
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
		     § 1 · COLOUR
		     ================================================================ -->
		<section id="colour" class="section section--flush" aria-labelledby="colour-title">
			{@render sectionHead(sec('colour'))}
			<p class="guide-note">
				Grounds and ink stay warm in both themes; pine is the one cooler note and marks
				<em>the current thing</em>. Applied by weight: ground ≫ ink ≫ accent. The value printed
				under each swatch is read from the page's computed styles.
			</p>

			{#each colourGroups as group (group.label)}
				<h3 class="rail-label guide-subhead">{group.label}</h3>
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
		     § 2 · TYPOGRAPHY
		     ================================================================ -->
		<section id="typography" class="section" aria-labelledby="typography-title">
			{@render sectionHead(sec('typography'))}
			<p class="guide-note">
				The document voice is what the scholar writes; the data voice is what the machine indexes.
				Every string on the site belongs to exactly one. Blurring them is the system's only
				unforgivable error: no mono headlines, no serif metadata.
			</p>

			<div class="voice-grid">
				<div class="voice-specimen">
					<h3 class="rail-label">Archivo — display</h3>
					<p class="nameplate voice-nameplate">Ink + Signal</p>
					<p class="guide-caption">
						Nameplate, h1–h3, section heads, big data numbers. Wide, heavy cuts via the
						<span class="data-voice">wdth</span> axis — a compressed-broadsheet feel.
					</p>
				</div>

				<div class="voice-specimen">
					<h3 class="rail-label">Newsreader — prose</h3>
					<p class="voice-serif">
						All prose, h4–h5, subtitles, captions and quotes are set in a news serif with optical
						sizing and full Latin Extended — the reading default for a working archive.
					</p>
					<p class="standfirst">And the standfirst beneath a title is its italic register.</p>
				</div>

				<div class="voice-specimen">
					<h3 class="rail-label">Spline Sans Mono — data</h3>
					<p class="eyebrow voice-eyebrow-demo">Dossiers · 5 projects · 2013—2027</p>
					<p class="eyebrow eyebrow--ink voice-eyebrow-demo">2013—2027 · Five dossiers</p>
					<p class="dateline">17 Jun · Conference · Berlin</p>
					<p class="guide-caption">
						Metadata only, never body copy: eyebrows, datelines, counts, nav, filters, chips, DOIs,
						pagination — anything that could be a database column. The eyebrow is pine when it marks
						the current thing and takes <span class="data-voice">.eyebrow--ink</span> when it is only
						a kicker.
					</p>
				</div>
			</div>

			<h3 class="rail-label guide-subhead">Heading tiers — where the voices divide</h3>
			<p class="guide-note">
				<span class="data-voice">h1</span>–<span class="data-voice">h3</span> are the display voice
				and are documented by the section heads on this page. <span class="data-voice">h4</span> and
				<span class="data-voice">h5</span> stay in Newsreader: quiet structural headings that read
				as typeset prose rather than as display. The mono heading tier is where the guide has to be
				exact, because <span class="data-voice">DESIGN.md</span> and the codebase disagree. The
				idiom actually in use is <span class="data-voice">.rail-label</span>, a mono label cast on
				an
				<span class="data-voice">h2</span>
				or <span class="data-voice">h3</span> in thirteen files — including every subhead on this
				page.
				<span class="data-voice">h6</span> is cast the same way in
				<span class="data-voice">typography.css</span> and is used nowhere in the codebase. The
				exception the Two Voices Rule really carries is <em>a module label at any tier</em>, not the
				smallest heading level.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — h4, h5 and the mono label tier</figcaption>
				<h4>A structural heading, set in Newsreader</h4>
				<p class="guide-caption">
					Semibold, one tracking role tighter than prose, and no rule of its own — it divides a
					reading column rather than opening a section.
				</p>
				<h5>One tier below it, in the same voice</h5>
				<p class="guide-caption">The smallest heading still written rather than indexed.</p>
				<p class="rail-label">Rail label — the mono heading in use</p>
				<h6>h6 — cast identically, and used nowhere</h6>
			</figure>

			<h3 class="rail-label guide-subhead">The upright heading</h3>
			<p class="guide-note">
				An inline <span class="data-voice">&lt;em&gt;</span> inside
				<span class="data-voice">h1</span>–<span class="data-voice">h3</span> stays upright in the display
				face. A Newsreader italic bolted into a heavy Archivo head is a voice collision at display sizes,
				so a work title quoted in a section head is set in the same face as the head around it. Genuine
				serif italics belong in prose, standfirsts and captions — where the standfirst above shows them.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — the upright heading rule</figcaption>
				<h3>Reading <em>Fraternité Matin</em> against the grain</h3>
				<p class="guide-caption">
					The emphasised title inherits the head's face, weight, width axis and tracking; only the
					markup distinguishes it.
				</p>
			</figure>

			<h3 class="rail-label guide-subhead">Prose links</h3>
			<p class="guide-note">
				A bare <span class="data-voice">&lt;a&gt;</span> inside a
				<span class="data-voice">&lt;p&gt;</span>, an <span class="data-voice">&lt;li&gt;</span> or
				<span class="data-voice">.prose</span> takes ink text and a static pine underline — the most
				frequent accent occurrence on the site, and the one place pine marks a live cross-reference
				rather than a current state. The selector carries three
				<span class="data-voice">:not()</span> clauses, so it outranks anything a component can
				write: the opt-out is the class the selector itself names,
				<span class="data-voice">.no-underline</span>, and apparatus runs, contents rows and chips
				all take it.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — the prose link and its opt-out</figcaption>
				<p class="guide-note guide-specimen-prose">
					The automatic treatment: <a href={resolve('/publications')}>a link in running prose</a>
					underlined in pine at rest, thickening to two pixels and warming to pine on hover.
				</p>
				<p class="guide-note guide-specimen-prose">
					The opt-out, and the one place it belongs — a link that is not running prose:
				</p>
				<p class="guide-specimen-prose">
					<a class="no-underline" href={resolve('/publications')}>Publications</a>
				</p>
			</figure>
			<p class="guide-caption">
				<span class="data-voice">.no-underline</span> is for apparatus runs, contents rows and chips,
				never for a link set inside a sentence: strip the underline there and colour alone distinguishes
				it, which is a WCAG 1.4.1 failure rather than a style choice. Every opt-out on the site sits outside
				running prose for that reason.
			</p>

			<h3 class="rail-label guide-subhead">Type scale — forked ratios</h3>
			<div class="scale-ladder">
				{#each bodyScale as token (token)}
					<div class="scale-row">
						<span class="scale-token">{token}</span>
						<span class="scale-sample scale-sample--serif" style="font-size: var({token})">
							The archive, read closely — minor third (1.2)
						</span>
					</div>
				{/each}
				{#each displayScale as token (token)}
					<div class="scale-row">
						<span class="scale-token">{token}</span>
						<span class="scale-sample scale-sample--display" style="font-size: var({token})">
							Signal — major third (1.25)
						</span>
					</div>
				{/each}
			</div>

			<h3 class="rail-label guide-subhead">Reading measure — counted, not assumed</h3>
			<p class="guide-note">
				A <span class="data-voice">ch</span> is the advance width of the digit zero, not the width
				of one character. Newsreader's average character measures about
				<span class="data-voice">0.7ch</span>, so a cap written as
				<span class="data-voice">65ch</span> sets nearer ninety characters a line — past the forty-five
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
							{role.token} · {measured[role.token]?.ch ?? '—'} ·
							<strong>{measured[role.token]?.chars ?? '—'} chars</strong>
						</span>
					</div>
				{/each}
			</div>

			<h3 class="rail-label guide-subhead">Tracking — keyed to size</h3>
			<p class="guide-note">
				Tracking is set per voice, and within a voice it follows the size the string is set at: the
				display face tightens as it grows, the data voice loosens as it shrinks. Serif prose never
				sets tracking — a paragraph runs at its natural fit — and the floor is
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
								style:font-size="var({role.size})">{role.specimen}</span
							>
							<span class="ledger-desc">{role.use}</span>
						</span>
						<span class="ledger-meta ledger-meta--figures"
							>{role.token} · {resolved[role.token] ?? '—'}</span
						>
					</div>
				{/each}
			</div>

			<h3 class="rail-label guide-subhead">Midnight weight — compensated, not inverted</h3>
			<p class="guide-note">
				Light type on the film ground optically bolds, and it does so most at the sizes the data
				voice is set in — <span class="data-voice">10–14px</span> mono, where a stem gains more
				apparent width than the counter can absorb. Midnight therefore sets the three shared weights
				forty lighter, which returns the small mono to the weight it holds in daylight and leaves
				the serif titles at parity rather than trading one mismatch for another. Body copy stays at
				<span class="data-voice">400</span> because the served
				<span class="data-voice">wght</span> axis floors there, and the display face's hand-set cuts need
				nothing: the values below are the ones painting in whichever theme is on — toggle the theme and
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
							>{step.token} · {resolved[step.token] ?? '—'}</span
						>
					</div>
				{/each}
			</div>

			<h3 class="rail-label guide-subhead">Record prose — a narrative cast in rules</h3>
			<p class="guide-note">
				<span class="data-voice">.record-prose</span> is the reading column of a record whose body
				is authored markup rather than fields — a research project's narrative, a digital-humanities
				project's description. Paragraphs and list items take
				<span class="data-voice">--measure-prose</span>, the lead paragraph steps up one size and
				one ink, <span class="data-voice">h2</span> is drawn as a ruled section head at the same
				weight and the same <span class="data-voice">--rule-gap</span> as
				<span class="data-voice">.section-title</span>, and
				<span class="data-voice">h3</span> is a quiet serif subhead inside it. It matches direct
				children only, because a narrative slot can hold whole components and a descendant selector
				reaches into them. Links are left to the site-wide prose idiom, and the opening flourish is
				not part of it — compose <span class="data-voice">.drop-cap</span> when the narrative should open
				with one.
			</p>

			<!-- Framed: the demo raises a real section head under a real 3px rule,
			     which read as a phantom § of the guide itself when set bare. The
			     flush variant drops the frame's padding so the rule still runs the
			     full width, which is the only way it reads as the rule it is. -->
			<figure class="specimen specimen--flush">
				<figcaption class="specimen-label">Specimen — record prose</figcaption>
				<div class="record-prose drop-cap guide-prose-demo">
					<p>
						The lead paragraph opens the record: one size up, one ink step darker, and an Archivo
						initial floated into it. Everything after it returns to the reading tier and holds the
						prose measure however wide the column gets.
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
		     § 3 · RULES
		     ================================================================ -->
		<section id="rules" class="section" aria-labelledby="rules-title">
			{@render sectionHead(sec('rules'))}
			<p class="guide-note">
				Reach for the rule system before size or colour: the page should be navigable if all type
				were one size. Rules are ink-coloured, never gray. Corners are square; shadows and glass do
				not exist — depth comes from ink density and rule weight.
			</p>

			<div class="rule-specs">
				{#each ruleSpecs as spec (spec.token)}
					<div class="rule-spec">
						<div class={spec.class}></div>
						<span class="rule-spec-label">{spec.token} — {spec.use}</span>
					</div>
				{/each}
			</div>

			<h3 class="rail-label guide-subhead">The rule → content interval</h3>
			<p class="guide-note">
				Every ruled module — masthead, section, hairline — puts the same
				<span class="data-voice">--rule-gap</span> between the rule and what it opens, so only the
				rule's <em>weight</em> carries hierarchy. Vary the weight, never the gap. The interval
				<em>above</em> a section is the one thing a consumer may set:
				<span class="data-voice">.section--flush</span> drops it to zero for the first ruled module under
				a masthead or a contents ledger, which is why § 1 above carries it and none of the others do.
			</p>

			<h3 class="rail-label guide-subhead">Drawn depth — three grounds, one rule</h3>
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
				raised sheet has no midnight identity of its own — it is the sunken one. Daylight keeps them at
				opposite ends of the ramp.
			</p>

			<h3 class="rail-label guide-subhead">The section note</h3>
			<p class="guide-note">
				<span class="data-voice">.section-note</span> is the one line of prose a two-word
				<span class="data-voice">.section-title</span> cannot carry — it names what the records
				below <em>are</em> when that is not self-evident, as on
				<span class="data-voice">/teaching</span>, whose “Guest lectures” ledger is keyed by host
				institution rather than by lecture. It is the document voice because it is written rather
				than indexed, and it takes <span class="data-voice">--measure-prose</span> like any other prose.
				A section whose head already says everything takes none.
			</p>

			<!-- A span, not a heading: the demo should not add a phantom entry to
			     the guide's own document outline. -->
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — section head and note</figcaption>
				<div class="section-head">
					<span class="section-title">Guest lectures</span>
					<span class="dateline">9 lectures · 2016–2022</span>
				</div>
				<p class="section-note">
					Invited talks in colleagues’ courses, indexed here by host institution.
				</p>
			</figure>

			<h3 class="rail-label guide-subhead">A rule is not a border</h3>
			<p class="guide-note">
				The two share a 1px width and nothing else. A rule separates and is the lightest mark on the
				page; a box edge encloses an object and sits one step darker. Crossing the pair fails
				silently — a separator drawn in the edge colour just looks like a plate — so the tokens are
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
							<span class="pairing-use">{p.use} · {resolved[p.token] ?? '—'}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- ================================================================
		     § 4 · THE LEDGER
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
							The key column carries the machine voice — a year, a term, an identifier — while the
							content column carries the document voice: a serif title and, beneath it, a
							description at reading measure.
						</span>
					</span>
				</div>
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">
						2013—2026
						<span class="ledger-status">Idiom</span>
					</span>
					<span class="ledger-content">
						<span class="ledger-title">A three-column row adds a meta column</span>
						<span class="ledger-desc">
							Publications, CV entries, activities and facets all render this way — the same idiom,
							tuned per instance with <span class="data-voice">--ledger-key-w</span>.
						</span>
					</span>
					<span class="ledger-meta">Meta →</span>
				</div>
			</div>

			<h3 class="rail-label guide-subhead">The apparatus line — a record's own keywords</h3>
			<p class="guide-note">
				Chips are the <em>facet</em> idiom: a control the reader operates to narrow a list. A
				record's own keyword list is something else — apparatus, metadata annotating the entry,
				which merely happens to be linked. Setting apparatus as controls turned a thirteen-term
				catalogue row into a 244px wall of boxes on a phone, taller than the title it annotated. So
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
						href="{base}/publications?tag={encodeURIComponent(term)}">{term}</a
					>
				{/each}
			</p>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
			<p class="guide-caption">
				The three most frequent keywords in the publications corpus, each linking to the index
				filtered to it.
			</p>

			<h3 class="rail-label guide-subhead">The row action — where the record goes</h3>
			<p class="guide-note">
				<span class="data-voice">.ledger-action</span> is the meta column’s link: a mono stamp
				naming the destination, quiet ink at rest and pine only under the pointer. The rule it
				follows is the one the bibliography row settled — a <em>fact</em> about the record belongs
				in the key or the eyebrow, a <em>destination</em> in the action column. It stays unaccented
				at rest on purpose: a syllabus from 2020 is not “the current thing”, and pine that marks
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

			<h3 class="rail-label guide-subhead">The tight ledger — a page that is all ledger</h3>
			<p class="guide-note">
				<span class="data-voice">.ledger--tight</span> is the same idiom one density step down, for a
				document whose whole body is records. The CV sets around 250 rows across seventeen sections on
				a single sheet, and at the default row padding that is roughly a screen and a half of added paper
				carrying no information — so the key column narrows to 6.5rem, the row padding drops a step, and
				the key sets one size smaller. Nothing else changes: the voices, the hairline, the accent on a
				current key and the narrow-measure collapse all still come from the idiom above. Reach for it
				when a page is a ledger; never to squeeze a list that is merely long.
			</p>

			<div class="ledger ledger--tight ledger--ruled">
				<div class="ledger-row">
					<span class="ledger-key">2024—</span>
					<span class="ledger-content">
						<span class="ledger-desc">
							Research Fellow, Leibniz-Zentrum Moderner Orient, Berlin.
						</span>
					</span>
				</div>
				<div class="ledger-row">
					<span class="ledger-key">2021—24</span>
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

			<h3 class="rail-label guide-subhead">The meta-ledger — a catalogue entry</h3>
			<p class="guide-note">
				A distinct idiom, not a variant. The ledger above sets a <em>record</em>: mono key against
				serif content, because the content is something the scholar wrote. The meta-ledger sets a
				record’s <em>catalogue entry</em> — journal, DOI, place, date — where both columns are
				strings a database could hold, so both are the data voice, over a key column narrowed to
				5.5rem for the 380px metadata rail. It is what the “Record” block prints on a publication or
				a talk — and the “Project” block on a research project, whose period, funder, programme,
				grant and regions are a catalogue entry by the same test — above the rail’s label and action
				stack. The block below is rendered by <span class="data-voice">RecordLedger</span> itself,
				so the DOI is a real
				<span class="data-voice">.meta-link</span> carrying the
				<span class="data-voice">.meta-icon</span> identifier glyph, exactly as a record page ships it.
			</p>

			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — the metadata rail, at 380px</figcaption>
				<div class="guide-rail">
					<RecordLedger rows={demoMetaRows} />
					<div class="rail-cta">
						<button type="button" class="btn btn-accent btn-block">Access Publication ↗</button>
					</div>
				</div>
			</figure>
			<p class="guide-caption">
				Pine marks only the row that leaves the record — a DOI, a live project page — and only one
				control in the stack carries the accent fill.
			</p>

			<h3 class="rail-label guide-subhead">The cite block — the citation itself</h3>
			<p class="guide-note">
				A record page holds every field of its own citation, so it prints the citation. The
				reference is set as real text in the document voice — the sentence a reader would type — and
				the controls beneath it are the data voice, because copying and exporting are machine
				errands. Setting the text rather than hiding it behind the button is also the fallback: a
				clipboard the browser denies still leaves something to select. Confirmation replaces the
				label and takes pine for as long as it is true, then returns.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — the cite block</figcaption>
				<div class="guide-rail">
					<div class="cite-block">
						<p class="rail-label">Cite</p>
						<p class="cite-reference">
							Madore, Frédérick. (2026). Muslim Minorities in Africa. Islamic Africa 12 (1): 1–24.
							https://doi.org/10.1163/21540993-01201007
						</p>
						<div class="cite-actions">
							<Button variant="outline-primary" label="Copy reference" block />
							<Button variant="outline-secondary" label="Export BibTeX" block />
						</div>
					</div>
				</div>
			</figure>
			<p class="guide-caption">
				The same reference string the MCP server returns for its <span class="data-voice"
					>reference</span
				> style — one formatter, so the page and an assistant can never disagree about the same work.
			</p>
		</section>

		<!-- ================================================================
		     § 5 · CONTROLS
		     ================================================================ -->
		<section id="controls" class="section" aria-labelledby="controls-title">
			{@render sectionHead(sec('controls'))}
			<p class="guide-note">
				Controls are typeset, not manufactured: flat, square, mono caps, colour-only transitions, no
				lift and no ripple. Every specimen below is a real control, so hover, focus and the selected
				state can be reached from this page rather than described on it. They filter and paginate
				nothing — the guide is the specimen, not the list.
			</p>

			<h3 class="rail-label guide-subhead">Chips</h3>
			<p class="guide-note">
				Flat, square, mono caps, count appended; selected means a solid ink fill. The counts below
				are real — the three most frequent tags in the publications corpus. Pick one to see the
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
				<button type="button" class="chip-more">All {allTags.length} tags ↓</button>
			</div>

			<h3 class="rail-label guide-subhead">Facet combobox</h3>
			<p class="guide-note">
				A chip row prints a closed list; an open one is reached by typing. The field is
				machine-facing, so it takes the data voice and the square edge of the search field, and the
				listbox is a plate rather than a floating card — paper ground, 1px border, ledger rows with
				the serif value left and the mono count right. It overlays what follows on purpose: laying
				all {allTags.length} publication tags out grew the index by a screen and a half. Matching ignores
				case and diacritics, so <span class="data-voice">cote</span> reaches Côte d’Ivoire.
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
				Counts are real. Picks here narrow nothing — they only show the selected state.
			</p>

			<h3 class="rail-label guide-subhead">Fields</h3>
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
				<figcaption class="specimen-label">Specimen — the index search field</figcaption>
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
				instead — an offline banner, a media error — and
				<span class="data-voice">.btn-danger</span> has no consumer.
			</p>

			<h3 class="rail-label guide-subhead">Pagination</h3>
			<p class="guide-note">
				The pager ships on <span class="data-voice">&lt;a&gt;</span> elements, so
				<span class="data-voice">.pager-item</span> paints no ground of its own. Rendered as real
				buttons here, the controls therefore also take
				<span class="data-voice">.btn-bare</span> — the zero-specificity primitive that clears the user
				agent's button chrome and leaves the idiom as the only thing styling them. Without it a native
				button keeps its default face, which in midnight is a light fill under cream type.
			</p>
			<div class="pager">
				{#each [1, 2, 3] as page (page)}
					<button
						type="button"
						class="btn-bare pager-item"
						class:pager-item--current={page === demoPage}
						aria-current={page === demoPage ? 'page' : undefined}
						onclick={() => (demoPage = page)}>{page}</button
					>
				{/each}
				<button
					type="button"
					class="btn-bare pager-item"
					onclick={() => (demoPage = Math.min(3, demoPage + 1))}>Next →</button
				>
			</div>

			<h3 class="rail-label guide-subhead">Buttons — the nine skins</h3>
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

			<h3 class="rail-label guide-subhead">Sizes and states</h3>
			<p class="guide-note">
				Three size steps, and the state modifiers that compose over any skin. Hover deepens the fill
				with no movement whatsoever; focus-visible draws a two-pixel pine outline at a two-pixel
				offset — tab into the row above to see it, or read it standing still in the specimen below.
				The <span class="data-voice">--focus-ring</span> token exists as a three-pixel translucent accent
				ring and is used by one visualisation card; controls take the flat outline instead.
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
				<button type="button" class="btn btn-secondary focus-ring-specimen">Focus ring</button>
				<Button variant="secondary" label="Disabled" disabled />
				<Button variant="primary" label="Loading" ariaLabel="Loading" loading />
				<Button variant="secondary" iconOnly ariaLabel="Search icon-only button">
					{#snippet icon()}<span aria-hidden="true">⌕</span>{/snippet}
				</Button>
				<Button bare label="Bare — no skin at all" />
			</div>
			<div class="guide-field">
				<Button variant="outline-primary" label="Block" block />
			</div>
			<p class="guide-caption">
				The first control carries the exact <span class="data-voice">:focus-visible</span>
				declaration as a static class, so the ring a keyboard user sees is legible without holding focus.
				Then: the disabled state at half opacity; the loading state; an icon-only control padded square;
				the bare primitive, which carries hit behaviour and a focus ring and nothing else; and the block
				modifier, which takes the full width of its column. Recorded rather than hidden: the loading control
				renders as an empty box, because
				<span class="data-voice">.btn-loading</span> blanks the whole control's colour and the
				spinner inside it is drawn in <span class="data-voice">currentColor</span>.
			</p>

			<h3 class="rail-label guide-subhead">The filter note</h3>
			<p class="guide-note">
				What is currently narrowing a list, stated in the data voice: a quiet mono label, then the
				reader's own facet values in emphasis ink. It prints the values verbatim rather than a count
				of them, because it is the one line a reader can check against what they clicked. All three
				indexes set it — <span class="data-voice">/activities</span> above its log, the two entity indexes
				inside the facet summary.
			</p>
			<p class="guide-field">
				<span class="filter-note-label">Filtered by</span>
				<span class="filter-note-value">Books · Benin · 2018–2020</span>
			</p>
		</section>

		<!-- ================================================================
		     § 6 · DATA AS ORNAMENT
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

			<h3 class="rail-label guide-subhead">The year meter</h3>
			<p class="guide-note">
				The same distribution read as a ledger rather than a strip: a mono year, an
				<span class="data-voice">.hbar</span> proportion bar, a tabular count. The bar is one of the
				system's three sanctioned gradients — a hard stop whose position <em>is</em> the value, set
				with <code>style="--pct: 62%"</code> — so it encodes rather than decorates. The newest row takes
				pine on both key and bar, which is the accent's own definition. Use it wherever a list of years
				would otherwise be a row of buttons that says only which years exist.
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

			<h3 class="rail-label guide-subhead">The proportion ledger</h3>
			<p class="guide-note">
				The same three columns and the same <span class="data-voice">.hbar</span> meter, keyed on a category
				rather than a year — here the languages the publications are written in, counted once per language
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

			<h3 class="rail-label guide-subhead">The key-terms cloud</h3>
			<p class="guide-note">
				A frequency-scaled serif term list where the type size <em>is</em> the corpus frequency. It
				replaced the bubble packs and the word-cloud canvas, both of which spent a great deal of ink
				encoding nothing — rotation, hue, spiral position and disc packing are all decorative, and a
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
						href="{base}/publications?tag={encodeURIComponent(term.word)}"
						rel="nofollow"
						style="font-size: {term.size}px;"
						title="{term.count} publications">{term.word}</a
					>
				{/each}
			</div>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->

			<h3 class="rail-label guide-subhead">The chart table</h3>
			<p class="guide-note">
				Every canvas plate on the visualisation pages carries its own figures underneath, closed. A
				chart hands a screen reader one computed sentence and a sighted reader one tooltip per mark,
				and neither of those is the data; the table is built from the same array the chart is drawn
				from, so the two can never disagree. Rows take the ledger's rhythm — category hanging left
				in the data voice, figure right-aligned on tabular numerals, a hairline between entries — on
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

			<h3 class="rail-label guide-subhead">The empty plate and the honest state</h3>
			<p class="guide-note">
				Two states, one register. <span class="data-voice">.viz-empty</span> is what a plate prints
				when the record holds nothing to draw; <span class="data-voice">.state-note</span> is what a
				component prints when it could not load at all — a failed map, a recording that 404s. Both
				set a mono label naming the state over one serif sentence naming what still works, both
				left-aligned at the top edge rather than floated in the middle of the plate, and neither is
				red: <span class="data-voice">--color-danger</span> is reserved for form validation, and a fetch
				that failed is not the reader's mistake. The renderer's own message goes to the console.
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
			</div>
		</section>

		<!-- ================================================================
		     § 7 · PLATES
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
					src="{base}/{pagePlate.src}"
					alt={pagePlate.alt}
					class="plate"
					width={pagePlate.width}
					height={pagePlate.height}
					loading="lazy"
				/>
				<figcaption class="plate-caption">
					Fig. 1 — Cahiers d’études africaines 229 (2018), the issue carrying “L’organisation du
					hadj en Côte d’Ivoire”. The caption is set in the serif italic.
				</figcaption>
			</figure>

			<h3 class="rail-label guide-subhead">The rail plate</h3>
			<p class="guide-note">
				<span class="data-voice">.rail-plate</span> is the same plate set at the head of a metadata
				rail — the cover, scan or venue photograph that opens the apparatus. It adds nothing to
				<span class="data-voice">.plate</span> but the freedom to scale: the image takes the rail's
				380px, or the full column once the rail dissolves under
				<span class="data-voice">--lg</span>. Every record rail on the site opens with one.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — the rail plate, at 380px</figcaption>
				<div class="guide-rail">
					<figure class="rail-plate">
						<img
							class="plate"
							src="{base}/{railPlate.src}"
							alt={railPlate.alt}
							width={railPlate.width}
							height={railPlate.height}
							loading="lazy"
						/>
						<figcaption class="plate-caption">Fig. 2 — cover.</figcaption>
					</figure>
				</div>
			</figure>

			<h3 class="rail-label guide-subhead">The missing plate</h3>
			<p class="guide-note">
				When the bytes never arrive, <span class="data-voice">use:plateFallback</span> gives the
				enclosing figure <span class="data-voice">.plate--missing</span>: the box stays, the image
				and its numbered caption go, and a centred
				<span class="data-voice">.plate--missing-note</span> states the fact in the data voice. A caption
				describes a plate, and a broken-image glyph sitting under “Fig. 1 — …” numbers a figure that is
				not there.
			</p>
			<figure class="specimen">
				<figcaption class="specimen-label">Specimen — a plate whose image failed</figcaption>
				<div class="guide-rail">
					<figure class="rail-plate plate--missing">
						<p class="dateline plate--missing-note">Image unavailable.</p>
					</figure>
				</div>
			</figure>
		</section>

		<!-- ================================================================
		     § 8 · SPACING & MOTION
		     ================================================================ -->
		<section id="spacing" class="section" aria-labelledby="spacing-title">
			{@render sectionHead(sec('spacing'))}
			<p class="guide-note">
				An 8-point rhythm carries the density scholars expect — structured information over
				whitespace. Motion is near-zero by design: instant state changes, at most a short fade on
				page enter. The register is print, not app.
			</p>

			<h3 class="rail-label guide-subhead">Semantic spacing</h3>
			<div class="space-specs">
				{#each spaceTokens as token (token)}
					<div class="space-spec">
						<span class="space-token">{token}</span>
						<div class="space-bar" style="width: var({token})"></div>
					</div>
				{/each}
			</div>

			<h3 class="rail-label guide-subhead">Durations</h3>
			<div class="stat-ledger duration-ledger">
				{#each durationTokens as token (token)}
					<div class="stat-row">
						<span>{token}</span>
						<span class="stat-value">{resolved[token] ?? ''}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- ================================================================
		     § 9 · COLOPHON
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
				<h3 class="rail-label guide-subhead">{face.name} — {face.role}</h3>
				<p class="guide-note">{face.note}</p>
				<p class="dateline">{face.credit}</p>
			{/each}

			<h3 class="rail-label guide-subhead">Where the system lives</h3>
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

			<h3 class="rail-label guide-subhead">Adding an idiom</h3>
			<p class="guide-note">
				Put the class in <span class="data-voice">ink-signal.css</span> with the note explaining why
				it exists, and document it on this page in the same change — not the next one. That is not a
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
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-lg);
		}
	}

	/* The column's label is `.rail-label`, which draws the hairline that used to
	 * be a border on this box — one boundary, one mark. */
	.voice-specimen {
		min-width: 0;
	}

	/* Tame the nameplate specimen so it sits inside a grid column. */
	.voice-nameplate {
		font-size: var(--font-size-2xl);
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

	.scale-sample--display {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-weight: 750;
		letter-spacing: var(--tracking-display-sm);
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

	.tracking-specimen--display {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
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

	/* The exact `.btn:focus-visible` declaration, drawn as a static class so the
	 * ring a keyboard user sees can be read without holding focus on it. */
	.focus-ring-specimen {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-medium);
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
		grid-template-columns: 7rem auto;
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

	.duration-ledger {
		max-width: 20rem;
	}
</style>
