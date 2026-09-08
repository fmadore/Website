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
-->
<script lang="ts">
	import { base } from '$app/paths';
	import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
	import { groupProjectLinks, projectLinkText } from '$lib/utils/projectLinks';
	import { buildSrcset, imageDimensions, resolveImagePath } from '$lib/utils/imageVariants';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

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
	const plateSrc = $derived(resolveImagePath(project.heroImageUrl ?? project.imageUrl, base));
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
		const sites = linkGroups.find((group) => group.type === 'site')?.links ?? [];
		return sites.length === 1 ? sites[0] : undefined;
	});

	// A bare URL is the project's own address, so the button names the errand;
	// an authored label already names the destination, so it is kept.
	const ctaLabel = $derived(ctaLink?.label ? typesetQuotes(ctaLink.label) : 'Visit the project');
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
		/>
	</figure>
{/if}

{#if linkGroups.length > 0}
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
								>{typesetQuotes(projectLinkText(link))} ↗</a
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
			{ctaLabel} ↗
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
		gap: var(--space-1);
	}
</style>
