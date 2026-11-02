<!--
DhProjectRail — the apparatus rail of a digital-humanities project record.

Rendered into <RecordLayout>'s `railPrimary` slot, so below --lg it sits with
the masthead, ahead of the narrative: what identifies the project and what
opens it.

Built from the shared rail idioms — `.rail-plate` / `.plate`, `.rail-label` +
`.meta-ledger`, `.rail-cta` + `.btn` — so this rail cannot drift from the ones
on /publications/[id], /communications/[id] and /research/<id>.

Why the addresses *are* the catalogue entry. A bibliographic record has a
journal, a publisher, an ISBN, a DOI; a digital project has none of them. What
it has instead is a period (printed in the masthead eyebrow, as on a research
project) and a set of public addresses — a live site, source repositories,
published datasets. Those are the strings a database would hold for this kind
of record, which is the meta-ledger's own test, so they are set as one, with
the group key hanging in the mono column and its addresses stacked beside it.
<RecordLedger> renders a single value per row and these rows hold up to six,
so the markup is written against the idiom directly, exactly as the publication
rail writes its own `.rail-plate` and `.cite-block`.

The accent marks the live project once, and only once: as the button when the
record has a single front door, and as the ledger's Site row when it has
several and no one of them can be called "the project" without picking. A
record with no site at all — a module, a pipeline, a dataset — carries no
accent, which is correct: a repository is not "the current thing".

An application's front door is where it is installed, not its website: when
the record carries an `application` block, its first install address (the
store listing) is the button, and an Application ledger (platform, status,
licence, interface languages) sits above the addresses, which is what a
reader checks before installing anything.
-->
<script lang="ts">
	import { basePrefix } from '#lib/utils/paths.ts';
	import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';
	import { groupProjectLinks, projectLinkText } from '#lib/utils/projectLinks.ts';
	import { buildSrcset, imageDimensions, resolveImagePath } from '#lib/utils/imageVariants.ts';
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import { plateFallback } from '#lib/actions/plateFallback.ts';
	import RecordLedger, { type MetaRow } from '#lib/components/molecules/RecordLedger.svelte';
	import { applicationPlatform, applicationStatusLabel } from '#lib/utils/projectGroups.ts';

	// The rail is 380px wide from --lg up; below that the plate spans the single
	// column. Same contract as the record rails.
	const PLATE_SIZES = '(max-width: 1024px) 100vw, 380px';

	interface Props {
		project: DigitalHumanitiesProject;
	}

	let { project }: Props = $props();

	// Plate — the dedicated hero when the record carries one, else the image the
	// catalogue entry uses. Intrinsic dimensions come from the generated variant
	// manifest, so the box is reserved before the bytes arrive; the sources are
	// not one ratio and there is only one plate per page, so it is printed at
	// its own rather than cropped to a common one.
	const plateSrc = $derived(
		resolveImagePath(project.heroImageUrl ?? project.imageUrl, basePrefix())
	);
	const plateSrcset = $derived(buildSrcset(plateSrc));
	const plateSize = $derived(imageDimensions(plateSrc));

	// The project's public addresses, grouped site / code / data.
	const linkGroups = $derived(groupProjectLinks(project));

	/**
	 * The one address that can be called "the project". Printed as the rail's
	 * single accent button when the record has exactly one site link; with two
	 * or three — a bilingual pair, a set of named exhibits — no single one is
	 * the front door, so the button is withheld rather than picking arbitrarily
	 * and mis-naming what it opens.
	 */
	const ctaLink = $derived.by(() => {
		const linksOf = (type: string) => linkGroups.find((group) => group.type === type)?.links ?? [];
		// An application opens where it is installed; the first install address
		// is its store listing (the record's order), the rest are alternatives.
		if (project.application && linksOf('install').length > 0) return linksOf('install')[0];
		const sites = linksOf('site');
		return sites.length === 1 ? sites[0] : undefined;
	});

	// A bare URL is the project's own address, so the button names the errand;
	// an authored label already names the destination, so it is kept. An
	// install address names where the application is installed from.
	const ctaLabel = $derived.by(() => {
		if (ctaLink?.type === 'install')
			return ctaLink.label ? `Install from ${typesetQuotes(ctaLink.label)}` : 'Install';
		return ctaLink?.label ? typesetQuotes(ctaLink.label) : 'Open project';
	});

	// What a reader checks before installing: where it runs, whether it is
	// released, and under what licence.
	const applicationRows = $derived.by((): MetaRow[] => {
		const app = project.application;
		if (!app) return [];
		const rows: MetaRow[] = [
			{ key: 'Platform', value: applicationPlatform(app) },
			{ key: 'Status', value: applicationStatusLabel(app.status) }
		];
		// The key already says licence, so the value is the bare identifier.
		if (app.licence) rows.push({ key: 'Licence', value: app.licence });
		if (app.interfaceLanguages?.length)
			rows.push({ key: 'Interface', value: app.interfaceLanguages.join(', ') });
		return rows;
	});

	/**
	 * A record whose whole address list *is* the button below it prints no
	 * ledger. Six of the sixteen projects have exactly one public address, and
	 * the rail set it twice — a one-row `Addresses` ledger with a single link,
	 * then the same URL as the accent button under it. A ledger of one row that
	 * restates its own call to action is apparatus about nothing.
	 */
	const ledgerIsTheCta = $derived(
		Boolean(ctaLink) && linkGroups.length === 1 && (linkGroups[0]?.links.length ?? 0) === 1
	);
</script>

{#if plateSrc}
	<!-- No caption: the records carry no authored provenance for these plates,
	     and a caption that restates the headline is not a caption. -->
	<figure class="rail-plate">
		<img
			class="plate"
			src={plateSrc}
			srcset={plateSrcset}
			sizes={plateSrcset ? PLATE_SIZES : undefined}
			width={plateSize?.width}
			height={plateSize?.height}
			alt=""
			loading="lazy"
			decoding="async"
			use:plateFallback
		/>
	</figure>
{/if}

<RecordLedger rows={applicationRows} label="Application" />

{#if linkGroups.length > 0 && !ledgerIsTheCta}
	<div>
		<h2 class="rail-label">Addresses</h2>
		<dl class="meta-ledger">
			{#each linkGroups as group (group.type)}
				<div class="meta-row">
					<dt class="meta-key">{group.key}</dt>
					<dd
						class="meta-value address-stack"
						class:meta-value--accent={group.type === 'site' && !ctaLink}
					>
						{#each group.links as link (link.url)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external project address -->
							<a class="meta-link" href={link.url} target="_blank" rel="noopener noreferrer"
								>{typesetQuotes(projectLinkText(link))}<span aria-hidden="true">&nbsp;↗</span><span
									class="sr-only"
								>
									(opens in new tab)</span
								></a
							>
						{/each}
					</dd>
				</div>
			{/each}
		</dl>
	</div>
{/if}

{#if ctaLink}
	<div class="rail-cta">
		<!-- eslint-disable svelte/no-navigation-without-resolve -- external project address -->
		<a
			class="btn btn-accent btn-block"
			href={ctaLink.url}
			target="_blank"
			rel="noopener noreferrer"
		>
			{ctaLabel}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
				(opens in new tab)</span
			>
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
{/if}

<style>
	/* Several addresses of one kind stack down the value column rather than
	 * running together: each is a whole string a reader may copy, and the mono
	 * value already breaks long words across lines. */
	.address-stack {
		display: flex;
		flex-direction: column;
		/* Sized so that two addresses on successive lines sit one hit box apart:
		 * the 24px target below overhangs its line by half the difference on
		 * each side, and this gap is exactly that difference, so neighbouring
		 * targets touch but never overlap. */
		gap: calc(var(--space-6) - 1lh);
	}

	/* Every address is a 24px-tall target on every pointer (WCAG 2.5.8): the
	 * mono value line is ~15px on its own. The box grows through padding and
	 * gives the growth back through margin, so a single-address row keeps the
	 * ledger's rhythm and the row height is untouched; only a stack of several
	 * opens up, by the gap above. The 44px coarse-pointer floor that
	 * `.ledger-action` takes is deliberately not applied here: these are
	 * addresses that wrap, and 44px boxes on a 24px pitch would overlap each
	 * other and the key beside them. */
	.address-stack a {
		display: block;
		padding-block: calc((var(--space-6) - 1lh) / 2);
		margin-block: calc((1lh - var(--space-6)) / 2);
	}
</style>
